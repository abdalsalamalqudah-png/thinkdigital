import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { CloudflareBindings, ForumThread } from '../types';
import { authenticate, optionalAuth } from '../middleware/auth';
import { AuthUtils } from '../utils/auth';

type Env = { Bindings: CloudflareBindings };

const forums = new Hono<Env>();

// Validation schemas
const createThreadSchema = z.object({
  course_id: z.string(),
  lesson_id: z.string().optional(),
  title: z.string().min(5).max(200),
  content: z.string().min(10)
});

const createReplySchema = z.object({
  thread_id: z.string(),
  content: z.string().min(1),
  parent_reply_id: z.string().optional()
});

const updateThreadSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(10).optional(),
  is_pinned: z.boolean().optional(),
  is_locked: z.boolean().optional()
});

// Get forum threads for a course
forums.get('/course/:courseId',
  optionalAuth,
  async (c) => {
    const courseId = c.req.param('courseId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const sort = c.req.query('sort') || 'recent'; // recent, popular, unanswered

    try {
      let query = `
        SELECT 
          ft.*,
          u.full_name as author_name,
          u.avatar_url as author_avatar,
          u.role as author_role,
          (
            SELECT COUNT(*) 
            FROM forum_replies 
            WHERE thread_id = ft.id
          ) as reply_count,
          (
            SELECT MAX(created_at) 
            FROM forum_replies 
            WHERE thread_id = ft.id
          ) as last_activity
        FROM forum_threads ft
        JOIN users u ON ft.author_id = u.id
        WHERE ft.course_id = ?
      `;

      const params = [courseId];

      // Apply sorting
      switch (sort) {
        case 'popular':
          query += ` ORDER BY ft.replies_count DESC, ft.views_count DESC`;
          break;
        case 'unanswered':
          query += ` AND ft.replies_count = 0 ORDER BY ft.created_at DESC`;
          break;
        default: // recent
          query += ` ORDER BY ft.is_pinned DESC, COALESCE(last_activity, ft.created_at) DESC`;
      }

      // Pagination
      const offset = (page - 1) * limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const threads = await c.env.DB.prepare(query).bind(...params).all();

      // Get total count
      const countResult = await c.env.DB.prepare(`
        SELECT COUNT(*) as total 
        FROM forum_threads 
        WHERE course_id = ?
      `).bind(courseId).first();

      return c.json({
        success: true,
        data: {
          threads: threads.results,
          pagination: {
            page,
            limit,
            total: countResult?.total || 0,
            total_pages: Math.ceil((countResult?.total || 0) / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get threads error:', error);
      return c.json({ error: 'Failed to fetch threads' }, 500);
    }
  }
);

// Get single thread with replies
forums.get('/thread/:threadId',
  optionalAuth,
  async (c) => {
    const threadId = c.req.param('threadId');
    const userId = c.get('userId');

    try {
      // Get thread details
      const thread = await c.env.DB.prepare(`
        SELECT 
          ft.*,
          u.full_name as author_name,
          u.avatar_url as author_avatar,
          u.role as author_role,
          c.title as course_title,
          l.title as lesson_title
        FROM forum_threads ft
        JOIN users u ON ft.author_id = u.id
        JOIN courses c ON ft.course_id = c.id
        LEFT JOIN lessons l ON ft.lesson_id = l.id
        WHERE ft.id = ?
      `).bind(threadId).first();

      if (!thread) {
        return c.json({ error: 'Thread not found' }, 404);
      }

      // Update view count
      await c.env.DB.prepare(`
        UPDATE forum_threads 
        SET views_count = views_count + 1 
        WHERE id = ?
      `).bind(threadId).run();

      // Get replies with nested structure
      const replies = await c.env.DB.prepare(`
        SELECT 
          fr.*,
          u.full_name as author_name,
          u.avatar_url as author_avatar,
          u.role as author_role,
          parent_u.full_name as parent_author_name
        FROM forum_replies fr
        JOIN users u ON fr.author_id = u.id
        LEFT JOIN forum_replies parent ON fr.parent_reply_id = parent.id
        LEFT JOIN users parent_u ON parent.author_id = parent_u.id
        WHERE fr.thread_id = ?
        ORDER BY fr.is_solution DESC, fr.created_at ASC
      `).bind(threadId).all();

      // Build reply tree structure
      const replyMap = new Map();
      const rootReplies = [];

      replies.results.forEach(reply => {
        reply.children = [];
        replyMap.set(reply.id, reply);
        
        if (reply.parent_reply_id) {
          const parent = replyMap.get(reply.parent_reply_id);
          if (parent) {
            parent.children.push(reply);
          }
        } else {
          rootReplies.push(reply);
        }
      });

      // Check if user can edit/delete
      const canModerate = userId && (
        thread.author_id === userId || 
        c.get('userRole') === 'admin' || 
        c.get('userRole') === 'instructor'
      );

      return c.json({
        success: true,
        data: {
          thread: {
            ...thread,
            can_moderate: canModerate
          },
          replies: rootReplies
        }
      });

    } catch (error) {
      console.error('Get thread error:', error);
      return c.json({ error: 'Failed to fetch thread' }, 500);
    }
  }
);

// Create new thread
forums.post('/thread',
  authenticate,
  zValidator('json', createThreadSchema),
  async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');

    try {
      // Verify user is enrolled in the course
      const enrollment = await c.env.DB.prepare(`
        SELECT id FROM enrollments 
        WHERE student_id = ? AND course_id = ?
      `).bind(userId, data.course_id).first();

      const userRole = c.get('userRole');
      if (!enrollment && userRole !== 'instructor' && userRole !== 'admin') {
        return c.json({ error: 'You must be enrolled to post' }, 403);
      }

      // Create thread
      const threadId = AuthUtils.generateId();
      
      await c.env.DB.prepare(`
        INSERT INTO forum_threads (
          id, course_id, lesson_id, author_id, 
          title, content, is_pinned, is_locked
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 0)
      `).bind(
        threadId,
        data.course_id,
        data.lesson_id || null,
        userId,
        data.title,
        data.content
      ).run();

      // Send notification to instructor
      const course = await c.env.DB.prepare(`
        SELECT instructor_id, title FROM courses WHERE id = ?
      `).bind(data.course_id).first();

      if (course && course.instructor_id !== userId) {
        await c.env.DB.prepare(`
          INSERT INTO notifications (
            id, user_id, type, title, message, data
          ) VALUES (?, ?, 'forum_post', 'New Forum Discussion', ?, ?)
        `).bind(
          AuthUtils.generateId(),
          course.instructor_id,
          `New discussion in ${course.title}: "${data.title}"`,
          JSON.stringify({ thread_id: threadId, course_id: data.course_id })
        ).run();
      }

      return c.json({
        success: true,
        data: { thread_id: threadId },
        message: 'Thread created successfully'
      });

    } catch (error) {
      console.error('Create thread error:', error);
      return c.json({ error: 'Failed to create thread' }, 500);
    }
  }
);

// Create reply
forums.post('/reply',
  authenticate,
  zValidator('json', createReplySchema),
  async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');

    try {
      // Get thread info
      const thread = await c.env.DB.prepare(`
        SELECT 
          ft.*, 
          c.instructor_id 
        FROM forum_threads ft
        JOIN courses c ON ft.course_id = c.id
        WHERE ft.id = ? AND ft.is_locked = 0
      `).bind(data.thread_id).first();

      if (!thread) {
        return c.json({ error: 'Thread not found or locked' }, 404);
      }

      // Verify user is enrolled
      const enrollment = await c.env.DB.prepare(`
        SELECT id FROM enrollments 
        WHERE student_id = ? AND course_id = ?
      `).bind(userId, thread.course_id).first();

      const userRole = c.get('userRole');
      if (!enrollment && userRole !== 'instructor' && userRole !== 'admin') {
        return c.json({ error: 'You must be enrolled to reply' }, 403);
      }

      // Create reply
      const replyId = AuthUtils.generateId();
      
      await c.env.DB.prepare(`
        INSERT INTO forum_replies (
          id, thread_id, author_id, parent_reply_id, 
          content, is_solution, likes_count
        ) VALUES (?, ?, ?, ?, ?, 0, 0)
      `).bind(
        replyId,
        data.thread_id,
        userId,
        data.parent_reply_id || null,
        data.content
      ).run();

      // Update thread reply count and last reply time
      await c.env.DB.prepare(`
        UPDATE forum_threads 
        SET replies_count = replies_count + 1,
            last_reply_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(data.thread_id).run();

      // Send notification to thread author
      if (thread.author_id !== userId) {
        await c.env.DB.prepare(`
          INSERT INTO notifications (
            id, user_id, type, title, message, data
          ) VALUES (?, ?, 'forum_reply', 'New Reply', ?, ?)
        `).bind(
          AuthUtils.generateId(),
          thread.author_id,
          `Someone replied to your discussion: "${thread.title}"`,
          JSON.stringify({ 
            thread_id: data.thread_id, 
            reply_id: replyId 
          })
        ).run();
      }

      // If replying to someone else's reply, notify them too
      if (data.parent_reply_id) {
        const parentReply = await c.env.DB.prepare(`
          SELECT author_id FROM forum_replies WHERE id = ?
        `).bind(data.parent_reply_id).first();

        if (parentReply && parentReply.author_id !== userId) {
          await c.env.DB.prepare(`
            INSERT INTO notifications (
              id, user_id, type, title, message, data
            ) VALUES (?, ?, 'forum_reply', 'Reply to Your Comment', ?, ?)
          `).bind(
            AuthUtils.generateId(),
            parentReply.author_id,
            `Someone replied to your comment in "${thread.title}"`,
            JSON.stringify({ 
              thread_id: data.thread_id, 
              reply_id: replyId 
            })
          ).run();
        }
      }

      return c.json({
        success: true,
        data: { reply_id: replyId },
        message: 'Reply posted successfully'
      });

    } catch (error) {
      console.error('Create reply error:', error);
      return c.json({ error: 'Failed to post reply' }, 500);
    }
  }
);

// Mark reply as solution
forums.post('/solution/:replyId',
  authenticate,
  async (c) => {
    const userId = c.get('userId');
    const replyId = c.req.param('replyId');

    try {
      // Get reply and thread info
      const reply = await c.env.DB.prepare(`
        SELECT 
          fr.thread_id,
          ft.author_id as thread_author,
          c.instructor_id
        FROM forum_replies fr
        JOIN forum_threads ft ON fr.thread_id = ft.id
        JOIN courses c ON ft.course_id = c.id
        WHERE fr.id = ?
      `).bind(replyId).first();

      if (!reply) {
        return c.json({ error: 'Reply not found' }, 404);
      }

      // Only thread author or instructor can mark solution
      const userRole = c.get('userRole');
      if (userId !== reply.thread_author && 
          userId !== reply.instructor_id && 
          userRole !== 'admin') {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      // Remove any existing solution for this thread
      await c.env.DB.prepare(`
        UPDATE forum_replies 
        SET is_solution = 0 
        WHERE thread_id = ?
      `).bind(reply.thread_id).run();

      // Mark this reply as solution
      await c.env.DB.prepare(`
        UPDATE forum_replies 
        SET is_solution = 1 
        WHERE id = ?
      `).bind(replyId).run();

      return c.json({
        success: true,
        message: 'Reply marked as solution'
      });

    } catch (error) {
      console.error('Mark solution error:', error);
      return c.json({ error: 'Failed to mark solution' }, 500);
    }
  }
);

// Like/unlike a reply
forums.post('/like/:replyId',
  authenticate,
  async (c) => {
    const userId = c.get('userId');
    const replyId = c.req.param('replyId');

    try {
      // Check if already liked (using KV for likes)
      const likeKey = `like:${userId}:${replyId}`;
      const isLiked = await c.env.CACHE.get(likeKey);

      if (isLiked) {
        // Unlike
        await c.env.CACHE.delete(likeKey);
        await c.env.DB.prepare(`
          UPDATE forum_replies 
          SET likes_count = MAX(0, likes_count - 1) 
          WHERE id = ?
        `).bind(replyId).run();

        return c.json({
          success: true,
          data: { liked: false },
          message: 'Reply unliked'
        });
      } else {
        // Like
        await c.env.CACHE.put(likeKey, 'true', {
          expirationTtl: 365 * 24 * 60 * 60 // 1 year
        });
        
        await c.env.DB.prepare(`
          UPDATE forum_replies 
          SET likes_count = likes_count + 1 
          WHERE id = ?
        `).bind(replyId).run();

        return c.json({
          success: true,
          data: { liked: true },
          message: 'Reply liked'
        });
      }

    } catch (error) {
      console.error('Like reply error:', error);
      return c.json({ error: 'Failed to like reply' }, 500);
    }
  }
);

// Search forum
forums.get('/search',
  optionalAuth,
  async (c) => {
    const query = c.req.query('q');
    const courseId = c.req.query('course_id');

    if (!query) {
      return c.json({ error: 'Search query required' }, 400);
    }

    try {
      let searchQuery = `
        SELECT 
          ft.id,
          ft.title,
          ft.content,
          ft.created_at,
          ft.replies_count,
          u.full_name as author_name,
          c.title as course_title
        FROM forum_threads ft
        JOIN users u ON ft.author_id = u.id
        JOIN courses c ON ft.course_id = c.id
        WHERE (ft.title LIKE ? OR ft.content LIKE ?)
      `;

      const searchParam = `%${query}%`;
      const params = [searchParam, searchParam];

      if (courseId) {
        searchQuery += ` AND ft.course_id = ?`;
        params.push(courseId);
      }

      searchQuery += ` ORDER BY ft.created_at DESC LIMIT 50`;

      const results = await c.env.DB.prepare(searchQuery).bind(...params).all();

      return c.json({
        success: true,
        data: results.results
      });

    } catch (error) {
      console.error('Search error:', error);
      return c.json({ error: 'Search failed' }, 500);
    }
  }
);

export default forums;