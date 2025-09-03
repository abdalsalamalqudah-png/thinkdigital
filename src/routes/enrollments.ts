import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { CloudflareBindings, Enrollment, LessonProgress } from '../types';
import { authenticate } from '../middleware/auth';
import { AuthUtils } from '../utils/auth';

type Env = { Bindings: CloudflareBindings };

const enrollments = new Hono<Env>();

// Validation schemas
const enrollSchema = z.object({
  course_id: z.string(),
  payment_method: z.enum(['stripe', 'paypal', 'free']).optional()
});

const progressSchema = z.object({
  lesson_id: z.string(),
  is_completed: z.boolean(),
  time_spent_minutes: z.number().optional(),
  last_position: z.number().optional(),
  notes: z.string().optional()
});

// Enroll in a course
enrollments.post('/enroll',
  authenticate,
  zValidator('json', enrollSchema),
  async (c) => {
    const userId = c.get('userId');
    const { course_id, payment_method } = c.req.valid('json');

    try {
      // Check if course exists and is published
      const course = await c.env.DB.prepare(`
        SELECT id, price, title, instructor_id 
        FROM courses 
        WHERE id = ? AND status = 'published'
      `).bind(course_id).first();

      if (!course) {
        return c.json({ error: 'Course not found or not available' }, 404);
      }

      // Check if already enrolled
      const existing = await c.env.DB.prepare(`
        SELECT id FROM enrollments 
        WHERE student_id = ? AND course_id = ?
      `).bind(userId, course_id).first();

      if (existing) {
        return c.json({ error: 'Already enrolled in this course' }, 400);
      }

      // Handle payment (simplified for now)
      if (course.price > 0 && payment_method !== 'free') {
        // TODO: Integrate actual payment processing
        // For now, we'll simulate payment success
        const transactionId = AuthUtils.generateId();
        
        await c.env.DB.prepare(`
          INSERT INTO transactions (
            id, user_id, course_id, amount, currency, 
            status, payment_method, description
          ) VALUES (?, ?, ?, ?, 'USD', 'completed', ?, ?)
        `).bind(
          transactionId,
          userId,
          course_id,
          course.price,
          payment_method || 'stripe',
          `Enrollment in ${course.title}`
        ).run();
      }

      // Create enrollment
      const enrollmentId = AuthUtils.generateId();
      
      await c.env.DB.prepare(`
        INSERT INTO enrollments (
          id, student_id, course_id, status, 
          enrollment_date, progress_percentage
        ) VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP, 0)
      `).bind(enrollmentId, userId, course_id).run();

      // Update course student count
      await c.env.DB.prepare(`
        UPDATE courses 
        SET total_students = total_students + 1 
        WHERE id = ?
      `).bind(course_id).run();

      // Send notification to student
      await c.env.DB.prepare(`
        INSERT INTO notifications (
          id, user_id, type, title, message
        ) VALUES (?, ?, 'enrollment', 'Course Enrollment Successful', ?)
      `).bind(
        AuthUtils.generateId(),
        userId,
        `You have successfully enrolled in ${course.title}`
      ).run();

      // Send notification to instructor
      await c.env.DB.prepare(`
        INSERT INTO notifications (
          id, user_id, type, title, message
        ) VALUES (?, ?, 'new_student', 'New Student Enrolled', ?)
      `).bind(
        AuthUtils.generateId(),
        course.instructor_id,
        `A new student has enrolled in your course: ${course.title}`
      ).run();

      // Log activity
      await c.env.DB.prepare(`
        INSERT INTO activity_logs (
          user_id, action, entity_type, entity_id
        ) VALUES (?, 'enroll', 'course', ?)
      `).bind(userId, course_id).run();

      return c.json({
        success: true,
        data: { enrollment_id: enrollmentId },
        message: 'Successfully enrolled in course'
      });

    } catch (error) {
      console.error('Enrollment error:', error);
      return c.json({ error: 'Enrollment failed' }, 500);
    }
  }
);

// Get user's enrollments
enrollments.get('/my-courses',
  authenticate,
  async (c) => {
    const userId = c.get('userId');
    const status = c.req.query('status') || 'active';

    try {
      const enrolledCourses = await c.env.DB.prepare(`
        SELECT 
          e.*,
          c.title as course_title,
          c.slug as course_slug,
          c.thumbnail_url,
          c.duration_hours,
          c.level,
          c.rating,
          u.full_name as instructor_name,
          (
            SELECT COUNT(*) 
            FROM lesson_progress lp
            JOIN lessons l ON lp.lesson_id = l.id
            WHERE lp.enrollment_id = e.id AND lp.is_completed = 1
          ) as completed_lessons,
          (
            SELECT COUNT(*) 
            FROM lessons l
            JOIN course_sections cs ON l.section_id = cs.id
            WHERE cs.course_id = c.id
          ) as total_lessons
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON c.instructor_id = u.id
        WHERE e.student_id = ? AND e.status = ?
        ORDER BY e.enrollment_date DESC
      `).bind(userId, status).all();

      // Calculate actual progress
      const coursesWithProgress = enrolledCourses.results.map(course => {
        const progress = course.total_lessons > 0 
          ? Math.round((course.completed_lessons / course.total_lessons) * 100)
          : 0;
        
        return {
          ...course,
          progress_percentage: progress
        };
      });

      return c.json({
        success: true,
        data: coursesWithProgress
      });

    } catch (error) {
      console.error('Get enrollments error:', error);
      return c.json({ error: 'Failed to fetch enrollments' }, 500);
    }
  }
);

// Get course progress details
enrollments.get('/progress/:courseId',
  authenticate,
  async (c) => {
    const userId = c.get('userId');
    const courseId = c.req.param('courseId');

    try {
      // Get enrollment
      const enrollment = await c.env.DB.prepare(`
        SELECT * FROM enrollments 
        WHERE student_id = ? AND course_id = ?
      `).bind(userId, courseId).first();

      if (!enrollment) {
        return c.json({ error: 'Not enrolled in this course' }, 404);
      }

      // Get sections with lessons and progress
      const sections = await c.env.DB.prepare(`
        SELECT 
          cs.*,
          (
            SELECT COUNT(*) 
            FROM lessons l 
            WHERE l.section_id = cs.id
          ) as total_lessons,
          (
            SELECT COUNT(*) 
            FROM lessons l
            JOIN lesson_progress lp ON l.id = lp.lesson_id
            WHERE l.section_id = cs.id 
              AND lp.enrollment_id = ?
              AND lp.is_completed = 1
          ) as completed_lessons
        FROM course_sections cs
        WHERE cs.course_id = ?
        ORDER BY cs.order_index
      `).bind(enrollment.id, courseId).all();

      // Get lesson progress for each section
      for (let section of sections.results) {
        const lessons = await c.env.DB.prepare(`
          SELECT 
            l.*,
            lp.is_completed,
            lp.completed_at,
            lp.time_spent_minutes,
            lp.last_position,
            lp.notes
          FROM lessons l
          LEFT JOIN lesson_progress lp 
            ON l.id = lp.lesson_id 
            AND lp.enrollment_id = ?
          WHERE l.section_id = ?
          ORDER BY l.order_index
        `).bind(enrollment.id, section.id).all();

        section.lessons = lessons.results;
        section.progress_percentage = section.total_lessons > 0
          ? Math.round((section.completed_lessons / section.total_lessons) * 100)
          : 0;
      }

      // Calculate overall progress
      const totalLessons = sections.results.reduce((sum, s) => sum + s.total_lessons, 0);
      const completedLessons = sections.results.reduce((sum, s) => sum + s.completed_lessons, 0);
      const overallProgress = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      return c.json({
        success: true,
        data: {
          enrollment,
          sections: sections.results,
          overall_progress: overallProgress,
          total_lessons: totalLessons,
          completed_lessons: completedLessons
        }
      });

    } catch (error) {
      console.error('Get progress error:', error);
      return c.json({ error: 'Failed to fetch progress' }, 500);
    }
  }
);

// Update lesson progress
enrollments.post('/progress/update',
  authenticate,
  zValidator('json', progressSchema),
  async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');

    try {
      // Get enrollment ID
      const lesson = await c.env.DB.prepare(`
        SELECT cs.course_id
        FROM lessons l
        JOIN course_sections cs ON l.section_id = cs.id
        WHERE l.id = ?
      `).bind(data.lesson_id).first();

      if (!lesson) {
        return c.json({ error: 'Lesson not found' }, 404);
      }

      const enrollment = await c.env.DB.prepare(`
        SELECT id FROM enrollments 
        WHERE student_id = ? AND course_id = ?
      `).bind(userId, lesson.course_id).first();

      if (!enrollment) {
        return c.json({ error: 'Not enrolled in this course' }, 403);
      }

      // Check if progress exists
      const existing = await c.env.DB.prepare(`
        SELECT id FROM lesson_progress 
        WHERE enrollment_id = ? AND lesson_id = ?
      `).bind(enrollment.id, data.lesson_id).first();

      if (existing) {
        // Update existing progress
        const updates = [];
        const params = [];

        if (data.is_completed !== undefined) {
          updates.push('is_completed = ?');
          params.push(data.is_completed ? 1 : 0);
          
          if (data.is_completed) {
            updates.push('completed_at = CURRENT_TIMESTAMP');
          }
        }

        if (data.time_spent_minutes !== undefined) {
          updates.push('time_spent_minutes = time_spent_minutes + ?');
          params.push(data.time_spent_minutes);
        }

        if (data.last_position !== undefined) {
          updates.push('last_position = ?');
          params.push(data.last_position);
        }

        if (data.notes !== undefined) {
          updates.push('notes = ?');
          params.push(data.notes);
        }

        params.push(existing.id);

        await c.env.DB.prepare(`
          UPDATE lesson_progress 
          SET ${updates.join(', ')}
          WHERE id = ?
        `).bind(...params).run();

      } else {
        // Create new progress
        await c.env.DB.prepare(`
          INSERT INTO lesson_progress (
            id, enrollment_id, lesson_id, is_completed, 
            completed_at, time_spent_minutes, last_position, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          AuthUtils.generateId(),
          enrollment.id,
          data.lesson_id,
          data.is_completed ? 1 : 0,
          data.is_completed ? new Date().toISOString() : null,
          data.time_spent_minutes || 0,
          data.last_position || 0,
          data.notes || null
        ).run();
      }

      // Update enrollment progress percentage
      const progressStats = await c.env.DB.prepare(`
        SELECT 
          COUNT(DISTINCT l.id) as total_lessons,
          COUNT(DISTINCT CASE WHEN lp.is_completed = 1 THEN l.id END) as completed_lessons
        FROM lessons l
        JOIN course_sections cs ON l.section_id = cs.id
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.enrollment_id = ?
        WHERE cs.course_id = ?
      `).bind(enrollment.id, lesson.course_id).first();

      const progressPercentage = progressStats.total_lessons > 0
        ? Math.round((progressStats.completed_lessons / progressStats.total_lessons) * 100)
        : 0;

      await c.env.DB.prepare(`
        UPDATE enrollments 
        SET progress_percentage = ?, last_accessed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(progressPercentage, enrollment.id).run();

      // Check if course is completed
      if (progressPercentage === 100) {
        await c.env.DB.prepare(`
          UPDATE enrollments 
          SET status = 'completed', completion_date = CURRENT_TIMESTAMP
          WHERE id = ? AND status = 'active'
        `).bind(enrollment.id).run();

        // Generate certificate (simplified)
        const certificateId = AuthUtils.generateId();
        const certificateUrl = `/certificates/${certificateId}`;

        await c.env.DB.prepare(`
          UPDATE enrollments 
          SET certificate_issued = 1, certificate_url = ?
          WHERE id = ?
        `).bind(certificateUrl, enrollment.id).run();

        // Send completion notification
        await c.env.DB.prepare(`
          INSERT INTO notifications (
            id, user_id, type, title, message
          ) VALUES (?, ?, 'course_completed', 'Course Completed!', ?)
        `).bind(
          AuthUtils.generateId(),
          userId,
          'Congratulations! You have completed the course and earned your certificate.'
        ).run();
      }

      return c.json({
        success: true,
        data: {
          progress_percentage: progressPercentage,
          is_completed: progressPercentage === 100
        }
      });

    } catch (error) {
      console.error('Update progress error:', error);
      return c.json({ error: 'Failed to update progress' }, 500);
    }
  }
);

// Get certificate
enrollments.get('/certificate/:enrollmentId',
  authenticate,
  async (c) => {
    const userId = c.get('userId');
    const enrollmentId = c.req.param('enrollmentId');

    try {
      const enrollment = await c.env.DB.prepare(`
        SELECT 
          e.*,
          c.title as course_title,
          c.duration_hours,
          u.full_name as student_name,
          i.full_name as instructor_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON e.student_id = u.id
        JOIN users i ON c.instructor_id = i.id
        WHERE e.id = ? AND e.student_id = ? AND e.certificate_issued = 1
      `).bind(enrollmentId, userId).first();

      if (!enrollment) {
        return c.json({ error: 'Certificate not found' }, 404);
      }

      // Generate certificate HTML
      const certificateHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Certificate of Completion</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              margin: 0;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .certificate {
              background: white;
              padding: 60px;
              border: 2px solid gold;
              box-shadow: 0 0 50px rgba(0,0,0,0.1);
              max-width: 800px;
              text-align: center;
              position: relative;
            }
            .certificate::before, .certificate::after {
              content: '';
              position: absolute;
              width: 100px;
              height: 100px;
              border: 2px solid gold;
            }
            .certificate::before {
              top: 10px;
              left: 10px;
              border-right: none;
              border-bottom: none;
            }
            .certificate::after {
              bottom: 10px;
              right: 10px;
              border-left: none;
              border-top: none;
            }
            h1 {
              color: #764ba2;
              font-size: 36px;
              margin-bottom: 20px;
            }
            h2 {
              color: #333;
              font-size: 28px;
              font-weight: normal;
              margin: 20px 0;
            }
            .student-name {
              font-size: 32px;
              color: #667eea;
              margin: 30px 0;
              font-weight: bold;
            }
            .course-title {
              font-size: 24px;
              color: #555;
              margin: 20px 0;
              font-style: italic;
            }
            .date {
              margin-top: 40px;
              color: #666;
            }
            .signatures {
              display: flex;
              justify-content: space-around;
              margin-top: 60px;
            }
            .signature {
              text-align: center;
            }
            .signature-line {
              width: 200px;
              border-bottom: 1px solid #333;
              margin: 0 auto 10px;
            }
            .seal {
              position: absolute;
              bottom: 30px;
              left: 50%;
              transform: translateX(-50%);
              width: 80px;
              height: 80px;
              border: 3px solid gold;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: gold;
              font-size: 20px;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1>Certificate of Completion</h1>
            <p>This is to certify that</p>
            <div class="student-name">${enrollment.student_name}</div>
            <p>has successfully completed the course</p>
            <div class="course-title">${enrollment.course_title}</div>
            <p>Duration: ${enrollment.duration_hours} hours</p>
            <div class="date">
              Completed on ${new Date(enrollment.completion_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div class="signatures">
              <div class="signature">
                <div class="signature-line"></div>
                <div>${enrollment.instructor_name}</div>
                <div>Course Instructor</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div>EduPlatform</div>
                <div>Platform Director</div>
              </div>
            </div>
            <div class="seal">✓</div>
          </div>
        </body>
        </html>
      `;

      return c.html(certificateHtml);

    } catch (error) {
      console.error('Get certificate error:', error);
      return c.json({ error: 'Failed to generate certificate' }, 500);
    }
  }
);

export default enrollments;