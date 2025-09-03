// Type definitions for EduPlatform

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin';
  bio?: string;
  avatar_url?: string;
  phone?: string;
  country?: string;
  language?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  instructor_id: string;
  instructor?: User;
  category_id?: string;
  category?: Category;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  thumbnail_url?: string;
  preview_video_url?: string;
  price: number;
  discount_price?: number;
  currency: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  language: string;
  duration_hours?: number;
  status: 'draft' | 'pending' | 'published' | 'archived';
  is_featured: boolean;
  requirements?: string[];
  learning_outcomes?: string[];
  target_audience?: string[];
  tags?: string[];
  rating: number;
  total_ratings: number;
  total_students: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  sections?: CourseSection[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  created_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  lessons?: Lesson[];
  created_at: string;
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  type: 'video' | 'article' | 'quiz' | 'assignment' | 'download';
  content_url?: string;
  content_text?: string;
  duration_minutes?: number;
  order_index: number;
  is_preview: boolean;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  student?: User;
  course_id: string;
  course?: Course;
  status: 'active' | 'completed' | 'suspended';
  enrollment_date: string;
  completion_date?: string;
  progress_percentage: number;
  last_accessed_at?: string;
  certificate_issued: boolean;
  certificate_url?: string;
}

export interface LessonProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  lesson?: Lesson;
  is_completed: boolean;
  completed_at?: string;
  time_spent_minutes: number;
  last_position?: number;
  notes?: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  passing_score: number;
  time_limit_minutes?: number;
  max_attempts: number;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
  questions?: QuizQuestion[];
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  order_index: number;
}

export interface Review {
  id: string;
  course_id: string;
  student_id: string;
  student?: User;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumThread {
  id: string;
  course_id: string;
  lesson_id?: string;
  author_id: string;
  author?: User;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  last_reply_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  course_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  description?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: 'student' | 'instructor';
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

// Cloudflare Bindings
export interface CloudflareBindings {
  DB: D1Database;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  OPENAI_API_KEY: string;
}