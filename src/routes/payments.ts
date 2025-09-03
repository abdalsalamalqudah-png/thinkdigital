import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { CloudflareBindings } from '../types';
import { authenticate } from '../middleware/auth';
import { AuthUtils } from '../utils/auth';

type Env = { Bindings: CloudflareBindings };

const payments = new Hono<Env>();

// Validation schemas
const createCheckoutSchema = z.object({
  course_id: z.string(),
  coupon_code: z.string().optional()
});

const applyCouponSchema = z.object({
  course_id: z.string(),
  coupon_code: z.string()
});

// Stripe service helper
class StripeService {
  private apiKey: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createPaymentIntent(amount: number, currency: string, metadata: any) {
    const response = await fetch(`${this.baseUrl}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(), // Convert to cents
        currency: currency.toLowerCase(),
        'metadata[course_id]': metadata.course_id,
        'metadata[user_id]': metadata.user_id,
        'metadata[enrollment_type]': 'course_purchase'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return response.json();
  }

  async createCustomer(email: string, name: string) {
    const response = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email,
        name
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    return response.json();
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    const response = await fetch(`${this.baseUrl}/payment_intents/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve payment intent');
    }

    return response.json();
  }
}

// Create checkout session
payments.post('/checkout',
  authenticate,
  zValidator('json', createCheckoutSchema),
  async (c) => {
    const userId = c.get('userId');
    const user = c.get('user');
    const { course_id, coupon_code } = c.req.valid('json');

    try {
      // Get course details
      const course = await c.env.DB.prepare(`
        SELECT id, title, price, discount_price, currency, instructor_id
        FROM courses 
        WHERE id = ? AND status = 'published'
      `).bind(course_id).first();

      if (!course) {
        return c.json({ error: 'Course not found' }, 404);
      }

      // Check if already enrolled
      const existing = await c.env.DB.prepare(`
        SELECT id FROM enrollments 
        WHERE student_id = ? AND course_id = ?
      `).bind(userId, course_id).first();

      if (existing) {
        return c.json({ error: 'Already enrolled in this course' }, 400);
      }

      // Calculate price
      let finalPrice = course.discount_price || course.price;
      let discountAmount = 0;
      let appliedCoupon = null;

      // Apply coupon if provided
      if (coupon_code) {
        const coupon = await c.env.DB.prepare(`
          SELECT * FROM coupons 
          WHERE code = ? 
            AND is_active = 1 
            AND (valid_from IS NULL OR valid_from <= datetime('now'))
            AND (valid_until IS NULL OR valid_until >= datetime('now'))
            AND (max_uses IS NULL OR used_count < max_uses)
        `).bind(coupon_code).first();

        if (coupon) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = finalPrice * (coupon.discount_value / 100);
          } else {
            discountAmount = coupon.discount_value;
          }
          
          finalPrice = Math.max(0, finalPrice - discountAmount);
          appliedCoupon = coupon;
        }
      }

      // Handle free enrollment
      if (finalPrice === 0) {
        const enrollmentId = AuthUtils.generateId();
        
        await c.env.DB.prepare(`
          INSERT INTO enrollments (
            id, student_id, course_id, status, enrollment_date, progress_percentage
          ) VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP, 0)
        `).bind(enrollmentId, userId, course_id).run();

        await c.env.DB.prepare(`
          UPDATE courses SET total_students = total_students + 1 WHERE id = ?
        `).bind(course_id).run();

        return c.json({
          success: true,
          data: {
            enrollment_id: enrollmentId,
            is_free: true
          },
          message: 'Successfully enrolled in free course'
        });
      }

      // Initialize Stripe (Note: In production, STRIPE_SECRET_KEY should be in env)
      const stripeKey = c.env.STRIPE_SECRET_KEY || 'sk_test_demo_key';
      const stripe = new StripeService(stripeKey);

      // Create or get Stripe customer
      let stripeCustomerId = user.stripe_customer_id;
      if (!stripeCustomerId) {
        const customer = await stripe.createCustomer(user.email, user.full_name);
        stripeCustomerId = customer.id;

        // Save customer ID
        await c.env.DB.prepare(`
          UPDATE users SET stripe_customer_id = ? WHERE id = ?
        `).bind(stripeCustomerId, userId).run();
      }

      // Create payment intent
      const paymentIntent = await stripe.createPaymentIntent(
        finalPrice,
        course.currency || 'USD',
        {
          course_id: course.id,
          user_id: userId,
          coupon_code: coupon_code || null,
          discount_amount: discountAmount
        }
      );

      // Create transaction record
      const transactionId = AuthUtils.generateId();
      await c.env.DB.prepare(`
        INSERT INTO transactions (
          id, user_id, course_id, amount, currency, 
          status, payment_method, stripe_payment_intent_id, description
        ) VALUES (?, ?, ?, ?, ?, 'pending', 'stripe', ?, ?)
      `).bind(
        transactionId,
        userId,
        course_id,
        finalPrice,
        course.currency || 'USD',
        paymentIntent.id,
        `Enrollment in ${course.title}`
      ).run();

      // Track coupon usage
      if (appliedCoupon) {
        await c.env.DB.prepare(`
          INSERT INTO coupon_uses (id, coupon_id, user_id, transaction_id)
          VALUES (?, ?, ?, ?)
        `).bind(
          AuthUtils.generateId(),
          appliedCoupon.id,
          userId,
          transactionId
        ).run();

        await c.env.DB.prepare(`
          UPDATE coupons SET used_count = used_count + 1 WHERE id = ?
        `).bind(appliedCoupon.id).run();
      }

      return c.json({
        success: true,
        data: {
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
          amount: finalPrice,
          currency: course.currency || 'USD',
          discount_applied: discountAmount > 0,
          discount_amount: discountAmount
        }
      });

    } catch (error) {
      console.error('Checkout error:', error);
      return c.json({ error: 'Checkout failed' }, 500);
    }
  }
);

// Confirm payment (webhook or client confirmation)
payments.post('/confirm',
  authenticate,
  async (c) => {
    const userId = c.get('userId');
    const { payment_intent_id } = await c.req.json();

    try {
      // Verify payment with Stripe
      const stripeKey = c.env.STRIPE_SECRET_KEY || 'sk_test_demo_key';
      const stripe = new StripeService(stripeKey);
      
      const paymentIntent = await stripe.retrievePaymentIntent(payment_intent_id);

      if (paymentIntent.status !== 'succeeded') {
        return c.json({ error: 'Payment not confirmed' }, 400);
      }

      // Get transaction
      const transaction = await c.env.DB.prepare(`
        SELECT * FROM transactions 
        WHERE stripe_payment_intent_id = ? AND user_id = ?
      `).bind(payment_intent_id, userId).first();

      if (!transaction) {
        return c.json({ error: 'Transaction not found' }, 404);
      }

      // Update transaction status
      await c.env.DB.prepare(`
        UPDATE transactions 
        SET status = 'completed', stripe_charge_id = ?
        WHERE id = ?
      `).bind(paymentIntent.latest_charge, transaction.id).run();

      // Create enrollment
      const enrollmentId = AuthUtils.generateId();
      
      await c.env.DB.prepare(`
        INSERT INTO enrollments (
          id, student_id, course_id, status, enrollment_date, progress_percentage
        ) VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP, 0)
      `).bind(enrollmentId, userId, transaction.course_id).run();

      // Update course student count
      await c.env.DB.prepare(`
        UPDATE courses SET total_students = total_students + 1 WHERE id = ?
      `).bind(transaction.course_id).run();

      // Get course details for notification
      const course = await c.env.DB.prepare(`
        SELECT title, instructor_id FROM courses WHERE id = ?
      `).bind(transaction.course_id).first();

      // Send notifications
      await c.env.DB.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message)
        VALUES (?, ?, 'payment_success', 'Payment Successful', ?)
      `).bind(
        AuthUtils.generateId(),
        userId,
        `Your payment for ${course.title} was successful. You can now access the course.`
      ).run();

      // Calculate instructor revenue (80% to instructor, 20% platform fee)
      const instructorRevenue = transaction.amount * 0.8;
      const platformFee = transaction.amount * 0.2;

      // Log revenue split (simplified - in production, this would be more complex)
      await c.env.DB.prepare(`
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
        VALUES (?, 'revenue_split', 'transaction', ?, ?)
      `).bind(
        course.instructor_id,
        transaction.id,
        JSON.stringify({
          total_amount: transaction.amount,
          instructor_revenue: instructorRevenue,
          platform_fee: platformFee
        })
      ).run();

      return c.json({
        success: true,
        data: {
          enrollment_id: enrollmentId,
          transaction_id: transaction.id
        },
        message: 'Payment confirmed and enrollment created'
      });

    } catch (error) {
      console.error('Payment confirmation error:', error);
      return c.json({ error: 'Payment confirmation failed' }, 500);
    }
  }
);

// Get user's transactions
payments.get('/transactions',
  authenticate,
  async (c) => {
    const userId = c.get('userId');

    try {
      const transactions = await c.env.DB.prepare(`
        SELECT 
          t.*,
          c.title as course_title,
          c.thumbnail_url
        FROM transactions t
        LEFT JOIN courses c ON t.course_id = c.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
      `).bind(userId).all();

      return c.json({
        success: true,
        data: transactions.results
      });

    } catch (error) {
      console.error('Get transactions error:', error);
      return c.json({ error: 'Failed to fetch transactions' }, 500);
    }
  }
);

// Validate coupon
payments.post('/validate-coupon',
  authenticate,
  zValidator('json', applyCouponSchema),
  async (c) => {
    const { course_id, coupon_code } = c.req.valid('json');

    try {
      // Get course price
      const course = await c.env.DB.prepare(`
        SELECT price, discount_price FROM courses WHERE id = ?
      `).bind(course_id).first();

      if (!course) {
        return c.json({ error: 'Course not found' }, 404);
      }

      // Check coupon validity
      const coupon = await c.env.DB.prepare(`
        SELECT * FROM coupons 
        WHERE code = ? 
          AND is_active = 1 
          AND (valid_from IS NULL OR valid_from <= datetime('now'))
          AND (valid_until IS NULL OR valid_until >= datetime('now'))
          AND (max_uses IS NULL OR used_count < max_uses)
      `).bind(coupon_code).first();

      if (!coupon) {
        return c.json({ error: 'Invalid or expired coupon' }, 400);
      }

      // Calculate discount
      const basePrice = course.discount_price || course.price;
      let discountAmount = 0;

      if (coupon.discount_type === 'percentage') {
        discountAmount = basePrice * (coupon.discount_value / 100);
      } else {
        discountAmount = Math.min(coupon.discount_value, basePrice);
      }

      const finalPrice = Math.max(0, basePrice - discountAmount);

      return c.json({
        success: true,
        data: {
          original_price: basePrice,
          discount_amount: discountAmount,
          final_price: finalPrice,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          coupon_description: coupon.description
        }
      });

    } catch (error) {
      console.error('Validate coupon error:', error);
      return c.json({ error: 'Coupon validation failed' }, 500);
    }
  }
);

// Get instructor earnings
payments.get('/earnings',
  authenticate,
  async (c) => {
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    if (userRole !== 'instructor' && userRole !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    try {
      // Get total earnings
      const earnings = await c.env.DB.prepare(`
        SELECT 
          SUM(t.amount * 0.8) as total_earnings,
          COUNT(DISTINCT t.id) as total_sales,
          COUNT(DISTINCT t.user_id) as unique_students,
          DATE(t.created_at) as date
        FROM transactions t
        JOIN courses c ON t.course_id = c.id
        WHERE c.instructor_id = ? AND t.status = 'completed'
        GROUP BY DATE(t.created_at)
        ORDER BY date DESC
        LIMIT 30
      `).bind(userId).all();

      // Get course-wise earnings
      const courseEarnings = await c.env.DB.prepare(`
        SELECT 
          c.title,
          COUNT(t.id) as sales,
          SUM(t.amount * 0.8) as earnings
        FROM transactions t
        JOIN courses c ON t.course_id = c.id
        WHERE c.instructor_id = ? AND t.status = 'completed'
        GROUP BY c.id
        ORDER BY earnings DESC
      `).bind(userId).all();

      // Get pending payouts
      const totalEarnings = await c.env.DB.prepare(`
        SELECT 
          SUM(t.amount * 0.8) as lifetime_earnings,
          SUM(CASE WHEN DATE(t.created_at) >= DATE('now', '-30 days') 
               THEN t.amount * 0.8 ELSE 0 END) as last_30_days,
          SUM(CASE WHEN DATE(t.created_at) >= DATE('now', '-7 days') 
               THEN t.amount * 0.8 ELSE 0 END) as last_7_days
        FROM transactions t
        JOIN courses c ON t.course_id = c.id
        WHERE c.instructor_id = ? AND t.status = 'completed'
      `).bind(userId).first();

      return c.json({
        success: true,
        data: {
          summary: totalEarnings,
          daily_earnings: earnings.results,
          course_earnings: courseEarnings.results
        }
      });

    } catch (error) {
      console.error('Get earnings error:', error);
      return c.json({ error: 'Failed to fetch earnings' }, 500);
    }
  }
);

export default payments;