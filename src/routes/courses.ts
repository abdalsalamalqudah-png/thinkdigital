import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { CloudflareBindings, Course, PaginatedResponse } from '../types';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { AuthUtils } from '../utils/auth';

type Env = { Bindings: CloudflareBindings };

const courses = new Hono<Env>();

// Validation schemas
const createCourseSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  short_description: z.string().max(300).optional(),
  category_id: z.string().optional(),
  price: z.number().min(0).default(0),
  currency: z.string().default('USD'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).default('all'),
  language: z.string().default('en'),
  duration_hours: z.number().optional(),
  requirements: z.array(z.string()).optional(),
  learning_outcomes: z.array(z.string()).optional(),
  target_audience: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

const updateCourseSchema = createCourseSchema.partial();

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  category: z.string().optional(),
  level: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'popular', 'rating', 'price_low', 'price_high']).default('newest'),
  instructor_id: z.string().optional(),
  status: z.string().optional()
});

// Get all courses (public)
courses.get('/',
  optionalAuth,
  zValidator('query', querySchema),
  async (c) => {
    const { page, limit, category, level, search, sort, instructor_id, status } = c.req.valid('query');
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    
    try {
      let query = `
        SELECT 
          c.*,
          cat.name as category_name,
          u.full_name as instructor_name,
          COUNT(DISTINCT e.id) as enrolled_students
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      // Filter by status (only published for public)
      if (status && (userRole === 'admin' || userRole === 'instructor')) {
        query += ` AND c.status = ?`;
        params.push(status);
      } else {
        query += ` AND c.status = 'published'`;
      }
      
      // Filter by category
      if (category) {
        query += ` AND (cat.slug = ? OR cat.parent_id IN (SELECT id FROM categories WHERE slug = ?))`;
        params.push(category, category);
      }
      
      // Filter by level
      if (level) {
        query += ` AND c.level = ?`;
        params.push(level);
      }
      
      // Filter by instructor
      if (instructor_id) {
        query += ` AND c.instructor_id = ?`;
        params.push(instructor_id);
      }
      
      // Search
      if (search) {
        query += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.tags LIKE ?)`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }
      
      query += ` GROUP BY c.id`;
      
      // Sorting
      switch (sort) {
        case 'popular':
          query += ` ORDER BY c.total_students DESC`;
          break;
        case 'rating':
          query += ` ORDER BY c.rating DESC`;
          break;
        case 'price_low':
          query += ` ORDER BY c.price ASC`;
          break;
        case 'price_high':
          query += ` ORDER BY c.price DESC`;
          break;
        default:
          query += ` ORDER BY c.created_at DESC`;
      }
      
      // Pagination
      const offset = (page - 1) * limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      
      // Execute query
      const result = await c.env.DB.prepare(query).bind(...params).all<Course>();
      
      // Get total count
      let countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE 1=1
      `;
      
      const countParams: any[] = [];
      
      if (status && (userRole === 'admin' || userRole === 'instructor')) {
        countQuery += ` AND c.status = ?`;
        countParams.push(status);
      } else {
        countQuery += ` AND c.status = 'published'`;
      }
      
      if (category) {
        countQuery += ` AND (cat.slug = ? OR cat.parent_id IN (SELECT id FROM categories WHERE slug = ?))`;
        countParams.push(category, category);
      }
      
      if (level) {
        countQuery += ` AND c.level = ?`;
        countParams.push(level);
      }
      
      if (instructor_id) {
        countQuery += ` AND c.instructor_id = ?`;
        countParams.push(instructor_id);
      }
      
      if (search) {
        countQuery += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.tags LIKE ?)`;
        const searchParam = `%${search}%`;
        countParams.push(searchParam, searchParam, searchParam);
      }
      
      const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>();
      const total = countResult?.total || 0;
      
      // Parse JSON fields
      const coursesWithParsedData = result.results.map(course => ({
        ...course,
        requirements: course.requirements ? JSON.parse(course.requirements as string) : [],
        learning_outcomes: course.learning_outcomes ? JSON.parse(course.learning_outcomes as string) : [],
        target_audience: course.target_audience ? JSON.parse(course.target_audience as string) : [],
        tags: course.tags ? JSON.parse(course.tags as string) : []
      }));
      
      const response: PaginatedResponse<Course> = {
        items: coursesWithParsedData,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      };
      
      return c.json({ success: true, data: response });
      
    } catch (error) {
      console.error('Get courses error:', error);
      return c.json({ error: 'Failed to fetch courses' }, 500);
    }
  }
);

// Get single course
courses.get('/:id',
  optionalAuth,
  async (c) => {
    const courseId = c.req.param('id');
    const userId = c.get('userId');
    
    try {
      // Get course with instructor info
      const course = await c.env.DB.prepare(`
        SELECT 
          c.*,
          u.full_name as instructor_name,
          u.bio as instructor_bio,
          u.avatar_url as instructor_avatar,
          cat.name as category_name,
          cat.slug as category_slug
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE c.id = ? OR c.slug = ?
      `).bind(courseId, courseId).first<Course>();
      
      if (!course) {
        return c.json({ error: 'Course not found' }, 404);
      }
      
      // Check if user is enrolled
      let isEnrolled = false;
      if (userId) {
        const enrollment = await c.env.DB.prepare(`
          SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?
        `).bind(userId, course.id).first();
        isEnrolled = !!enrollment;
      }
      
      // Get sections and lessons
      const sections = await c.env.DB.prepare(`
        SELECT * FROM course_sections WHERE course_id = ? ORDER BY order_index
      `).bind(course.id).all();
      
      // Get lessons for each section
      for (let section of sections.results) {
        const lessons = await c.env.DB.prepare(`
          SELECT id, title, description, type, duration_minutes, order_index, is_preview
          FROM lessons 
          WHERE section_id = ? 
          ORDER BY order_index
        `).bind(section.id).all();
        
        // Hide content URLs for non-enrolled users
        section.lessons = lessons.results.map(lesson => ({
          ...lesson,
          content_url: (isEnrolled || lesson.is_preview) ? lesson.content_url : null
        }));
      }
      
      // Get reviews summary
      const reviewStats = await c.env.DB.prepare(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
        FROM reviews WHERE course_id = ?
      `).bind(course.id).first();
      
      // Parse JSON fields
      const courseData = {
        ...course,
        requirements: course.requirements ? JSON.parse(course.requirements as string) : [],
        learning_outcomes: course.learning_outcomes ? JSON.parse(course.learning_outcomes as string) : [],
        target_audience: course.target_audience ? JSON.parse(course.target_audience as string) : [],
        tags: course.tags ? JSON.parse(course.tags as string) : [],
        sections: sections.results,
        review_stats: reviewStats,
        is_enrolled: isEnrolled
      };
      
      return c.json({ success: true, data: courseData });
      
    } catch (error) {
      console.error('Get course error:', error);
      return c.json({ error: 'Failed to fetch course' }, 500);
    }
  }
);

// Create course (instructors only)
courses.post('/',
  authenticate,
  authorize('instructor', 'admin'),
  zValidator('json', createCourseSchema),
  async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');
    
    try {
      const courseId = AuthUtils.generateId();
      const slug = data.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now();
      
      await c.env.DB.prepare(`
        INSERT INTO courses (
          id, instructor_id, title, slug, description, short_description,
          category_id, price, currency, level, language, duration_hours,
          requirements, learning_outcomes, target_audience, tags, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
      `).bind(
        courseId,
        userId,
        data.title,
        slug,
        data.description,
        data.short_description || null,
        data.category_id || null,
        data.price,
        data.currency,
        data.level,
        data.language,
        data.duration_hours || null,
        data.requirements ? JSON.stringify(data.requirements) : null,
        data.learning_outcomes ? JSON.stringify(data.learning_outcomes) : null,
        data.target_audience ? JSON.stringify(data.target_audience) : null,
        data.tags ? JSON.stringify(data.tags) : null
      ).run();
      
      return c.json({
        success: true,
        data: { id: courseId, slug },
        message: 'Course created successfully'
      });
      
    } catch (error) {
      console.error('Create course error:', error);
      return c.json({ error: 'Failed to create course' }, 500);
    }
  }
);

// Update course
courses.put('/:id',
  authenticate,
  authorize('instructor', 'admin'),
  zValidator('json', updateCourseSchema),
  async (c) => {
    const courseId = c.req.param('id');
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const data = c.req.valid('json');
    
    try {
      // Check ownership
      const course = await c.env.DB.prepare(
        'SELECT instructor_id FROM courses WHERE id = ?'
      ).bind(courseId).first<{ instructor_id: string }>();
      
      if (!course) {
        return c.json({ error: 'Course not found' }, 404);
      }
      
      if (userRole !== 'admin' && course.instructor_id !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
      }
      
      // Build update query
      const updates: string[] = [];
      const params: any[] = [];
      
      if (data.title !== undefined) {
        updates.push('title = ?');
        params.push(data.title);
      }
      
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }
      
      if (data.short_description !== undefined) {
        updates.push('short_description = ?');
        params.push(data.short_description);
      }
      
      if (data.category_id !== undefined) {
        updates.push('category_id = ?');
        params.push(data.category_id);
      }
      
      if (data.price !== undefined) {
        updates.push('price = ?');
        params.push(data.price);
      }
      
      if (data.level !== undefined) {
        updates.push('level = ?');
        params.push(data.level);
      }
      
      if (data.duration_hours !== undefined) {
        updates.push('duration_hours = ?');
        params.push(data.duration_hours);
      }
      
      if (data.requirements !== undefined) {
        updates.push('requirements = ?');
        params.push(JSON.stringify(data.requirements));
      }
      
      if (data.learning_outcomes !== undefined) {
        updates.push('learning_outcomes = ?');
        params.push(JSON.stringify(data.learning_outcomes));
      }
      
      if (data.target_audience !== undefined) {
        updates.push('target_audience = ?');
        params.push(JSON.stringify(data.target_audience));
      }
      
      if (data.tags !== undefined) {
        updates.push('tags = ?');
        params.push(JSON.stringify(data.tags));
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      
      params.push(courseId);
      
      await c.env.DB.prepare(`
        UPDATE courses SET ${updates.join(', ')} WHERE id = ?
      `).bind(...params).run();
      
      return c.json({
        success: true,
        message: 'Course updated successfully'
      });
      
    } catch (error) {
      console.error('Update course error:', error);
      return c.json({ error: 'Failed to update course' }, 500);
    }
  }
);

// Publish course
courses.post('/:id/publish',
  authenticate,
  authorize('instructor', 'admin'),
  async (c) => {
    const courseId = c.req.param('id');
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    
    try {
      // Check ownership
      const course = await c.env.DB.prepare(
        'SELECT instructor_id FROM courses WHERE id = ?'
      ).bind(courseId).first<{ instructor_id: string }>();
      
      if (!course) {
        return c.json({ error: 'Course not found' }, 404);
      }
      
      if (userRole !== 'admin' && course.instructor_id !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
      }
      
      // Check if course has sections and lessons
      const sectionCount = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM course_sections WHERE course_id = ?'
      ).bind(courseId).first<{ count: number }>();
      
      if (!sectionCount || sectionCount.count === 0) {
        return c.json({ error: 'Course must have at least one section' }, 400);
      }
      
      await c.env.DB.prepare(`
        UPDATE courses 
        SET status = 'published', published_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(courseId).run();
      
      return c.json({
        success: true,
        message: 'Course published successfully'
      });
      
    } catch (error) {
      console.error('Publish course error:', error);
      return c.json({ error: 'Failed to publish course' }, 500);
    }
  }
);

// Delete course
courses.delete('/:id',
  authenticate,
  authorize('instructor', 'admin'),
  async (c) => {
    const courseId = c.req.param('id');
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    
    try {
      // Check ownership
      const course = await c.env.DB.prepare(
        'SELECT instructor_id FROM courses WHERE id = ?'
      ).bind(courseId).first<{ instructor_id: string }>();
      
      if (!course) {
        return c.json({ error: 'Course not found' }, 404);
      }
      
      if (userRole !== 'admin' && course.instructor_id !== userId) {
        return c.json({ error: 'Unauthorized' }, 403);
      }
      
      // Soft delete by setting status to archived
      await c.env.DB.prepare(`
        UPDATE courses SET status = 'archived' WHERE id = ?
      `).bind(courseId).run();
      
      return c.json({
        success: true,
        message: 'Course deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete course error:', error);
      return c.json({ error: 'Failed to delete course' }, 500);
    }
  }
);

export default courses;