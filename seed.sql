-- ==============================================
-- Seed Data for E-Learning Platform
-- ==============================================

-- Insert admin user (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role, bio, is_verified, is_active)
VALUES 
    ('admin-001', 'admin@eduplatform.com', '$2a$10$YKqP2.5niCmGwNwKeUcOiOjeQeJkZqM8LzBKDJSlFy5hOZBJGpGl2', 'Platform Admin', 'admin', 'Platform Administrator', 1, 1);

-- Insert instructors (password: instructor123)
INSERT INTO users (id, email, password_hash, full_name, role, bio, is_verified, is_active, country, language)
VALUES 
    ('inst-001', 'john.doe@eduplatform.com', '$2a$10$6T.LMq.8.XM6HKR5L6Qnp.kPhzI2hOoOUFoNKG7xzIaGFyKyLZmxS', 'Dr. John Doe', 'instructor', 'PhD in Computer Science with 10+ years of teaching experience', 1, 1, 'USA', 'en'),
    ('inst-002', 'sarah.smith@eduplatform.com', '$2a$10$6T.LMq.8.XM6HKR5L6Qnp.kPhzI2hOoOUFoNKG7xzIaGFyKyLZmxS', 'Sarah Smith', 'instructor', 'Full Stack Developer and Tech Educator', 1, 1, 'UK', 'en'),
    ('inst-003', 'ahmed.hassan@eduplatform.com', '$2a$10$6T.LMq.8.XM6HKR5L6Qnp.kPhzI2hOoOUFoNKG7xzIaGFyKyLZmxS', 'Ahmed Hassan', 'instructor', 'Data Science Expert and ML Engineer', 1, 1, 'Egypt', 'ar');

-- Insert students (password: student123)
INSERT INTO users (id, email, password_hash, full_name, role, is_verified, is_active, country, language)
VALUES 
    ('stud-001', 'alice@example.com', '$2a$10$PrPJmdX3Xn0Y.k3WzK.gKu2BKvCzCvr5.SLhFjX5lHIJZP6V0ygIG', 'Alice Johnson', 'student', 1, 1, 'Canada', 'en'),
    ('stud-002', 'bob@example.com', '$2a$10$PrPJmdX3Xn0Y.k3WzK.gKu2BKvCzCvr5.SLhFjX5lHIJZP6V0ygIG', 'Bob Williams', 'student', 1, 1, 'Australia', 'en'),
    ('stud-003', 'maria@example.com', '$2a$10$PrPJmdX3Xn0Y.k3WzK.gKu2BKvCzCvr5.SLhFjX5lHIJZP6V0ygIG', 'Maria Garcia', 'student', 1, 1, 'Spain', 'es');

-- Insert categories
INSERT INTO categories (id, name, slug, description, icon)
VALUES 
    ('cat-001', 'Programming', 'programming', 'Learn to code from scratch', 'fa-code'),
    ('cat-002', 'Web Development', 'web-development', 'Build modern web applications', 'fa-globe'),
    ('cat-003', 'Data Science', 'data-science', 'Analyze data and build ML models', 'fa-chart-bar'),
    ('cat-004', 'Mobile Development', 'mobile-development', 'Create iOS and Android apps', 'fa-mobile'),
    ('cat-005', 'Design', 'design', 'UI/UX and Graphic Design', 'fa-paint-brush'),
    ('cat-006', 'Business', 'business', 'Business and Entrepreneurship', 'fa-briefcase');

-- Insert subcategories
INSERT INTO categories (id, name, slug, description, parent_id)
VALUES 
    ('cat-007', 'JavaScript', 'javascript', 'JavaScript programming', 'cat-001'),
    ('cat-008', 'Python', 'python', 'Python programming', 'cat-001'),
    ('cat-009', 'React', 'react', 'React.js framework', 'cat-002'),
    ('cat-010', 'Machine Learning', 'machine-learning', 'ML algorithms and models', 'cat-003');

-- Insert courses
INSERT INTO courses (
    id, instructor_id, category_id, title, slug, description, short_description,
    price, currency, level, language, duration_hours, status, is_featured,
    requirements, learning_outcomes, target_audience, tags, rating, total_ratings, total_students
)
VALUES 
    (
        'course-001',
        'inst-001',
        'cat-002',
        'Complete Web Development Bootcamp 2024',
        'complete-web-development-bootcamp-2024',
        'Learn web development from zero to hero. This comprehensive course covers HTML, CSS, JavaScript, React, Node.js, and more.',
        'Become a full-stack web developer',
        99.99,
        'USD',
        'beginner',
        'en',
        40,
        'published',
        1,
        '["Basic computer skills","Internet connection","No programming experience required"]',
        '["Build 10+ real world web applications","Master HTML, CSS, and JavaScript","Learn React and Node.js","Deploy applications to the cloud"]',
        '["Complete beginners","Career changers","Students"]',
        '["web development","html","css","javascript","react","node.js"]',
        4.8,
        1250,
        5430
    ),
    (
        'course-002',
        'inst-002',
        'cat-009',
        'Advanced React Patterns and Best Practices',
        'advanced-react-patterns',
        'Master advanced React concepts including hooks, context, performance optimization, and architectural patterns.',
        'Take your React skills to the next level',
        79.99,
        'USD',
        'advanced',
        'en',
        20,
        'published',
        0,
        '["Intermediate React knowledge","JavaScript ES6+","Basic understanding of state management"]',
        '["Master React hooks and custom hooks","Implement advanced patterns","Optimize performance","Build scalable applications"]',
        '["React developers","Frontend engineers","Tech leads"]',
        '["react","javascript","frontend","hooks","performance"]',
        4.9,
        450,
        1820
    ),
    (
        'course-003',
        'inst-003',
        'cat-003',
        'Data Science and Machine Learning Masterclass',
        'data-science-ml-masterclass',
        'Comprehensive data science course covering Python, pandas, scikit-learn, deep learning with TensorFlow.',
        'Become a data scientist',
        129.99,
        'USD',
        'intermediate',
        'en',
        60,
        'published',
        1,
        '["Python basics","High school mathematics","Statistics fundamentals"]',
        '["Analyze real-world datasets","Build ML models","Deep learning with TensorFlow","Deploy ML applications"]',
        '["Aspiring data scientists","Analysts","Engineers"]',
        '["python","machine learning","data science","tensorflow","pandas"]',
        4.7,
        890,
        3200
    );

-- Insert course sections
INSERT INTO course_sections (id, course_id, title, description, order_index)
VALUES 
    ('sect-001', 'course-001', 'Introduction to Web Development', 'Getting started with web development', 1),
    ('sect-002', 'course-001', 'HTML Fundamentals', 'Learn HTML from scratch', 2),
    ('sect-003', 'course-001', 'CSS Mastery', 'Style your websites beautifully', 3),
    ('sect-004', 'course-001', 'JavaScript Essentials', 'Programming with JavaScript', 4),
    ('sect-005', 'course-002', 'React Hooks Deep Dive', 'Master all React hooks', 1),
    ('sect-006', 'course-002', 'Performance Optimization', 'Make your apps lightning fast', 2),
    ('sect-007', 'course-003', 'Python for Data Science', 'Python programming basics', 1),
    ('sect-008', 'course-003', 'Machine Learning Algorithms', 'Core ML algorithms', 2);

-- Insert lessons
INSERT INTO lessons (id, section_id, title, description, type, duration_minutes, order_index, is_preview)
VALUES 
    ('less-001', 'sect-001', 'Welcome to the Course', 'Course overview and what you will learn', 'video', 10, 1, 1),
    ('less-002', 'sect-001', 'Setting Up Your Development Environment', 'Install necessary tools', 'video', 15, 2, 0),
    ('less-003', 'sect-002', 'Your First HTML Page', 'Create your first webpage', 'video', 20, 1, 1),
    ('less-004', 'sect-002', 'HTML Tags and Elements', 'Understanding HTML structure', 'video', 25, 2, 0),
    ('less-005', 'sect-002', 'HTML Quiz', 'Test your HTML knowledge', 'quiz', 15, 3, 0),
    ('less-006', 'sect-003', 'Introduction to CSS', 'Styling basics', 'video', 20, 1, 0),
    ('less-007', 'sect-003', 'CSS Selectors', 'Target elements precisely', 'video', 25, 2, 0),
    ('less-008', 'sect-004', 'JavaScript Variables and Data Types', 'JS fundamentals', 'video', 30, 1, 0),
    ('less-009', 'sect-005', 'useState Hook Explained', 'State management in React', 'video', 25, 1, 1),
    ('less-010', 'sect-005', 'useEffect Patterns', 'Side effects in React', 'video', 30, 2, 0);

-- Insert sample enrollments
INSERT INTO enrollments (id, student_id, course_id, status, progress_percentage)
VALUES 
    ('enroll-001', 'stud-001', 'course-001', 'active', 35),
    ('enroll-002', 'stud-001', 'course-002', 'active', 10),
    ('enroll-003', 'stud-002', 'course-001', 'completed', 100),
    ('enroll-004', 'stud-002', 'course-003', 'active', 50),
    ('enroll-005', 'stud-003', 'course-001', 'active', 75);

-- Insert lesson progress
INSERT INTO lesson_progress (enrollment_id, lesson_id, is_completed, time_spent_minutes)
VALUES 
    ('enroll-001', 'less-001', 1, 10),
    ('enroll-001', 'less-002', 1, 15),
    ('enroll-001', 'less-003', 1, 20),
    ('enroll-001', 'less-004', 0, 12),
    ('enroll-003', 'less-001', 1, 10),
    ('enroll-003', 'less-002', 1, 15),
    ('enroll-003', 'less-003', 1, 20),
    ('enroll-003', 'less-004', 1, 25);

-- Insert course reviews
INSERT INTO reviews (course_id, student_id, rating, title, comment)
VALUES 
    ('course-001', 'stud-002', 5, 'Excellent course!', 'This course helped me land my first web development job. Highly recommended!'),
    ('course-001', 'stud-003', 4, 'Great content', 'Very comprehensive course. The instructor explains everything clearly.'),
    ('course-002', 'stud-001', 5, 'Advanced concepts made easy', 'Finally understood React patterns that I struggled with before.'),
    ('course-003', 'stud-002', 4, 'Good ML introduction', 'Great course for getting started with machine learning.');

-- Insert sample forum threads
INSERT INTO forum_threads (id, course_id, author_id, title, content, replies_count)
VALUES 
    ('thread-001', 'course-001', 'stud-001', 'Help with CSS Grid', 'I am having trouble understanding CSS Grid. Can someone explain the difference between grid-template-columns and grid-template-rows?', 3),
    ('thread-002', 'course-001', 'stud-002', 'Best VS Code extensions for web dev?', 'What are your favorite VS Code extensions for web development?', 5);

-- Insert notifications
INSERT INTO notifications (user_id, type, title, message)
VALUES 
    ('stud-001', 'enrollment', 'Welcome to the course!', 'You have successfully enrolled in Complete Web Development Bootcamp 2024'),
    ('stud-001', 'course_update', 'New lesson available', 'A new lesson has been added to your enrolled course'),
    ('inst-001', 'new_review', 'New course review', 'Your course received a new 5-star review');

-- Insert a certificate template
INSERT INTO certificate_templates (name, html_template, css_styles, is_default)
VALUES 
    ('Default Certificate', 
     '<div class="certificate"><h1>Certificate of Completion</h1><p>This certifies that {{student_name}} has successfully completed {{course_title}}</p></div>',
     '.certificate { border: 2px solid gold; padding: 50px; text-align: center; }',
     1);