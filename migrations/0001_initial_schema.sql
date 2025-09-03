-- ==============================================
-- E-Learning Platform Database Schema
-- ==============================================

-- Users table (students, instructors, admins)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'instructor', 'admin')),
    bio TEXT,
    avatar_url TEXT,
    phone TEXT,
    country TEXT,
    language TEXT DEFAULT 'en',
    is_verified BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    stripe_customer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens
DROP TABLE IF EXISTS email_verifications;
CREATE TABLE email_verifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories for courses
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    parent_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Courses table
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    instructor_id TEXT NOT NULL,
    category_id TEXT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    thumbnail_url TEXT,
    preview_video_url TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    discount_price DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced', 'all')),
    language TEXT DEFAULT 'en',
    duration_hours INTEGER,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'pending', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT 0,
    requirements TEXT, -- JSON array of requirements
    learning_outcomes TEXT, -- JSON array of outcomes
    target_audience TEXT, -- JSON array
    tags TEXT, -- JSON array of tags
    rating DECIMAL(2, 1) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Course sections/modules
DROP TABLE IF EXISTS course_sections;
CREATE TABLE course_sections (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    course_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Lessons within sections
DROP TABLE IF EXISTS lessons;
CREATE TABLE lessons (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    section_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK(type IN ('video', 'article', 'quiz', 'assignment', 'download')),
    content_url TEXT, -- URL to video or file in R2 storage
    content_text TEXT, -- For articles
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE
);

-- Student enrollments
DROP TABLE IF EXISTS enrollments;
CREATE TABLE enrollments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'suspended')),
    enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    completion_date DATETIME,
    progress_percentage INTEGER DEFAULT 0,
    last_accessed_at DATETIME,
    certificate_issued BOOLEAN DEFAULT 0,
    certificate_url TEXT,
    UNIQUE(student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Lesson progress tracking
DROP TABLE IF EXISTS lesson_progress;
CREATE TABLE lesson_progress (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    enrollment_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    time_spent_minutes INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0, -- For video resume
    notes TEXT,
    UNIQUE(enrollment_id, lesson_id),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Quizzes
DROP TABLE IF EXISTS quizzes;
CREATE TABLE quizzes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    lesson_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 60,
    time_limit_minutes INTEGER,
    max_attempts INTEGER DEFAULT 3,
    shuffle_questions BOOLEAN DEFAULT 1,
    show_correct_answers BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Quiz questions
DROP TABLE IF EXISTS quiz_questions;
CREATE TABLE quiz_questions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    quiz_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK(question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    options TEXT, -- JSON array for multiple choice
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Quiz attempts
DROP TABLE IF EXISTS quiz_attempts;
CREATE TABLE quiz_attempts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    enrollment_id TEXT NOT NULL,
    quiz_id TEXT NOT NULL,
    score INTEGER,
    passed BOOLEAN DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    answers TEXT, -- JSON object of answers
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Assignments
DROP TABLE IF EXISTS assignments;
CREATE TABLE assignments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    lesson_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    max_score INTEGER DEFAULT 100,
    due_days INTEGER, -- Days after enrollment
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Assignment submissions
DROP TABLE IF EXISTS assignment_submissions;
CREATE TABLE assignment_submissions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    enrollment_id TEXT NOT NULL,
    assignment_id TEXT NOT NULL,
    submission_text TEXT,
    submission_url TEXT, -- File URL in R2
    score INTEGER,
    feedback TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewing', 'graded', 'returned')),
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    graded_at DATETIME,
    UNIQUE(enrollment_id, assignment_id),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

-- Course reviews and ratings
DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    course_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT 1,
    helpful_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Discussion forums
DROP TABLE IF EXISTS forum_threads;
CREATE TABLE forum_threads (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    course_id TEXT NOT NULL,
    lesson_id TEXT,
    author_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT 0,
    is_locked BOOLEAN DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    last_reply_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forum replies
DROP TABLE IF EXISTS forum_replies;
CREATE TABLE forum_replies (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    thread_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    parent_reply_id TEXT,
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE
);

-- Payments and transactions
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    course_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Coupons and discounts
DROP TABLE IF EXISTS coupons;
CREATE TABLE coupons (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from DATETIME,
    valid_until DATETIME,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Coupon usage tracking
DROP TABLE IF EXISTS coupon_uses;
CREATE TABLE coupon_uses (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    coupon_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    transaction_id TEXT,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

-- Notifications
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT, -- JSON data
    is_read BOOLEAN DEFAULT 0,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Certificates templates
DROP TABLE IF EXISTS certificate_templates;
CREATE TABLE certificate_templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    html_template TEXT NOT NULL,
    css_styles TEXT,
    is_default BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI recommendations tracking
DROP TABLE IF EXISTS recommendations;
CREATE TABLE recommendations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    score DECIMAL(3, 2) NOT NULL, -- Recommendation score 0-1
    reason TEXT, -- JSON array of reasons
    shown_at DATETIME,
    clicked_at DATETIME,
    dismissed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- User activity logs for analytics
DROP TABLE IF EXISTS activity_logs;
CREATE TABLE activity_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    metadata TEXT, -- JSON data
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX idx_reviews_course ON reviews(course_id);
CREATE INDEX idx_forum_threads_course ON forum_threads(course_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at);