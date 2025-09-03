import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getStudentDashboard, getInstructorDashboard, getAdminDashboard } from './dashboards';
import { getHomePage } from './pages/home';
import { getCoursesPage } from './pages/courses';
import { getCourseDetailPage } from './pages/course-detail';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('*', cors());

// Home page (Udemy-like)
app.get('/', (c) => {
  return c.html(getHomePage());
});

// Courses browsing page
app.get('/courses', (c) => {
  return c.html(getCoursesPage());
});

// Course detail page
app.get('/course/:id', (c) => {
  return c.html(getCourseDetailPage());
});

// Old landing page (backup)
app.get('/old-home', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Think Digital - منصة التعلم الإلكتروني</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
            animation: fadeIn 0.8s ease-out;
        }
        .card:hover {
            transform: translateY(-5px);
            transition: all 0.3s ease;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 min-h-screen">
    <!-- Check if user is already logged in -->
    <script>
        // Check if user is already logged in and redirect
        const existingUser = localStorage.getItem('user');
        if (existingUser) {
            const user = JSON.parse(existingUser);
            if (user.role === 'student') {
                window.location.href = '/student-dashboard.html';
            } else if (user.role === 'instructor') {
                window.location.href = '/instructor-dashboard.html';
            } else if (user.role === 'admin') {
                window.location.href = '/admin-dashboard.html';
            }
        }
    </script>

    <!-- Navigation -->
    <nav class="bg-white/10 backdrop-blur-md sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="text-white font-bold text-2xl flex items-center">
                    <i class="fas fa-graduation-cap ml-2"></i>
                    Think Digital
                </div>
                <div class="flex gap-4">
                    <button onclick="showSection('login')" class="text-white hover:bg-white/20 px-4 py-2 rounded-lg transition">
                        <i class="fas fa-sign-in-alt ml-2"></i>
                        تسجيل الدخول
                    </button>
                    <button onclick="showSection('register')" class="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition">
                        <i class="fas fa-user-plus ml-2"></i>
                        حساب جديد
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="hero" class="container mx-auto px-4 py-20 text-center text-white fade-in">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
            منصة التعلم الرقمي المتقدمة
        </h1>
        <p class="text-xl md:text-2xl mb-8 text-blue-100">
            ابدأ رحلتك التعليمية مع أفضل المدربين والخبراء
        </p>
        
        <div class="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 card">
                <div class="text-5xl mb-4">📚</div>
                <h3 class="text-xl font-semibold mb-2">+1000 دورة</h3>
                <p class="text-blue-200">دورات متنوعة في جميع المجالات</p>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 card">
                <div class="text-5xl mb-4">👨‍🏫</div>
                <h3 class="text-xl font-semibold mb-2">خبراء معتمدون</h3>
                <p class="text-blue-200">تعلم من أفضل الخبراء في المجال</p>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 card">
                <div class="text-5xl mb-4">🏆</div>
                <h3 class="text-xl font-semibold mb-2">شهادات معتمدة</h3>
                <p class="text-blue-200">احصل على شهادة معتمدة بعد إتمام الدورة</p>
            </div>
        </div>
    </section>

    <!-- Login Modal -->
    <div id="login-section" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 fade-in">
            <button onclick="hideSection('login')" class="float-left text-gray-500 hover:text-gray-700">
                <i class="fas fa-times text-2xl"></i>
            </button>
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">تسجيل الدخول</h2>
            
            <form onsubmit="handleLogin(event)">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input type="email" id="login-email" required class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="your@email.com">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 mb-2">كلمة المرور</label>
                    <input type="password" id="login-password" required class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="••••••••">
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg transition">
                    <i class="fas fa-sign-in-alt ml-2"></i>
                    دخول
                </button>
            </form>
            
            <div class="mt-6 p-4 bg-gray-100 rounded-lg">
                <p class="text-sm text-gray-600 mb-2 font-semibold">حسابات تجريبية:</p>
                <ul class="text-xs space-y-1 text-gray-600">
                    <li>طالب: alice@example.com / student123</li>
                    <li>مدرب: john.doe@eduplatform.com / instructor123</li>
                    <li>مدير: admin@eduplatform.com / admin123</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Register Modal -->
    <div id="register-section" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 fade-in">
            <button onclick="hideSection('register')" class="float-left text-gray-500 hover:text-gray-700">
                <i class="fas fa-times text-2xl"></i>
            </button>
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">حساب جديد</h2>
            
            <form onsubmit="handleRegister(event)">
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">الاسم الكامل</label>
                    <input type="text" id="register-name" required class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="الاسم الكامل">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input type="email" id="register-email" required class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="your@email.com">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">كلمة المرور</label>
                    <input type="password" id="register-password" required class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="••••••••">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 mb-2">نوع الحساب</label>
                    <select id="register-role" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none">
                        <option value="student">طالب</option>
                        <option value="instructor">مدرب</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg transition">
                    <i class="fas fa-user-plus ml-2"></i>
                    إنشاء حساب
                </button>
            </form>
        </div>
    </div>

    <!-- Features Section -->
    <section class="container mx-auto px-4 py-20">
        <h2 class="text-4xl font-bold text-white text-center mb-12">مميزات المنصة</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white text-center card">
                <i class="fas fa-video text-4xl mb-4 text-pink-400"></i>
                <h3 class="text-xl font-semibold mb-2">محاضرات فيديو</h3>
                <p class="text-blue-200">محتوى عالي الجودة</p>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white text-center card">
                <i class="fas fa-comments text-4xl mb-4 text-purple-400"></i>
                <h3 class="text-xl font-semibold mb-2">منتديات نقاش</h3>
                <p class="text-blue-200">تواصل مع المجتمع</p>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white text-center card">
                <i class="fas fa-tasks text-4xl mb-4 text-blue-400"></i>
                <h3 class="text-xl font-semibold mb-2">واجبات وتمارين</h3>
                <p class="text-blue-200">تطبيق عملي</p>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white text-center card">
                <i class="fas fa-certificate text-4xl mb-4 text-green-400"></i>
                <h3 class="text-xl font-semibold mb-2">شهادات معتمدة</h3>
                <p class="text-blue-200">اعتراف رسمي</p>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-black/30 backdrop-blur-md text-white py-8 mt-20">
        <div class="container mx-auto px-4 text-center">
            <p class="mb-4">© 2024 Think Digital - جميع الحقوق محفوظة</p>
            <div class="flex justify-center gap-4">
                <a href="/api/health" class="hover:text-pink-400 transition">
                    <i class="fas fa-heartbeat ml-1"></i> حالة الخدمة
                </a>
                <a href="/api/info" class="hover:text-purple-400 transition">
                    <i class="fas fa-info-circle ml-1"></i> معلومات API
                </a>
                <a href="https://github.com/abdalsalamalqudah-png/thinkdigital" target="_blank" class="hover:text-blue-400 transition">
                    <i class="fab fa-github ml-1"></i> GitHub
                </a>
            </div>
        </div>
    </footer>

    <script>
        function showSection(section) {
            document.getElementById(section + '-section').classList.remove('hidden');
        }
        
        function hideSection(section) {
            document.getElementById(section + '-section').classList.add('hidden');
        }
        
        async function handleLogin(event) {
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                if (response.ok && data.success) {
                    // Store user info in localStorage
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('token', data.token);
                    
                    // Redirect based on role
                    if (data.user.role === 'student') {
                        window.location.href = '/student-dashboard.html';
                    } else if (data.user.role === 'instructor') {
                        window.location.href = '/instructor-dashboard.html';
                    } else if (data.user.role === 'admin') {
                        window.location.href = '/admin-dashboard.html';
                    }
                } else {
                    alert(data.message || 'فشل تسجيل الدخول. تحقق من البيانات المدخلة.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
            }
        }
        
        async function handleRegister(event) {
            event.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const role = document.getElementById('register-role').value;
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });
                
                const data = await response.json();
                if (response.ok && data.success) {
                    // Store user info and redirect
                    const user = { email, name, role };
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', 'demo-token-' + Date.now());
                    
                    // Redirect based on role
                    if (role === 'student') {
                        window.location.href = '/student-dashboard.html';
                    } else if (role === 'instructor') {
                        window.location.href = '/instructor-dashboard.html';
                    }
                } else {
                    alert(data.message || 'فشل إنشاء الحساب');
                }
            } catch (error) {
                console.error('Register error:', error);
                alert('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
            }
        }
    </script>
</body>
</html>
  `);
});

// API Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Think Digital API',
    version: '1.0.0',
    database: 'D1 Connected'
  });
});

// API Info
app.get('/api/info', (c) => {
  return c.json({
    name: 'Think Digital E-Learning Platform',
    version: '1.0.0',
    description: 'منصة تعلم إلكتروني متقدمة',
    features: [
      'نظام إدارة المستخدمين',
      'نظام الدورات التعليمية',
      'منتديات النقاش',
      'نظام الواجبات والاختبارات',
      'نظام الشهادات',
      'نظام الدفع الإلكتروني',
      'لوحات تحكم منفصلة للطلاب والمدربين والمدراء'
    ],
    database: {
      type: 'Cloudflare D1 (SQLite)',
      tables: 24,
      status: 'Configured'
    },
    dashboards: {
      student: '/student-dashboard.html',
      instructor: '/instructor-dashboard.html',
      admin: '/admin-dashboard.html'
    },
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register'
      }
    },
    github: 'https://github.com/abdalsalamalqudah-png/thinkdigital',
    deployment: 'https://think-digital.pages.dev'
  });
});

// Auth Endpoints with role-based redirection
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  
  // Demo accounts with roles
  const demoAccounts: any = {
    'alice@example.com': { password: 'student123', role: 'student', name: 'Alice Johnson' },
    'john.doe@eduplatform.com': { password: 'instructor123', role: 'instructor', name: 'John Doe' },
    'admin@eduplatform.com': { password: 'admin123', role: 'admin', name: 'Admin User' }
  };
  
  const account = demoAccounts[email];
  if (account && account.password === password) {
    return c.json({
      success: true,
      message: 'Login successful',
      user: {
        email,
        name: account.name,
        role: account.role
      },
      token: 'demo-token-' + Date.now()
    });
  }
  
  return c.json({
    success: false,
    message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  }, 401);
});

app.post('/api/auth/register', async (c) => {
  const { name, email, password, role } = await c.req.json();
  
  // Mock registration - in production, save to database
  return c.json({
    success: true,
    message: 'Registration successful',
    user: {
      id: Date.now(),
      name,
      email,
      role: role || 'student'
    }
  });
});

// Database test endpoint
app.get('/api/db/test', async (c) => {
  try {
    const { env } = c;
    if (!env.DB) {
      return c.json({ error: 'Database not configured' }, 500);
    }
    
    // Try to query the database
    const result = await env.DB.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();
    
    return c.json({
      success: true,
      message: 'Database connection successful',
      tables: result.results.map(r => r.name)
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// Dashboard routes
app.get('/student-dashboard.html', (c) => {
  return c.html(getStudentDashboard());
});

app.get('/student-dashboard', (c) => {
  return c.html(getStudentDashboard());
});

app.get('/instructor-dashboard.html', (c) => {
  return c.html(getInstructorDashboard());
});

app.get('/instructor-dashboard', (c) => {
  return c.html(getInstructorDashboard());
});

app.get('/admin-dashboard.html', (c) => {
  return c.html(getAdminDashboard());
});

app.get('/admin-dashboard', (c) => {
  return c.html(getAdminDashboard());
});

// 404 Handler
app.notFound((c) => {
  return c.json({ 
    error: 'Not found',
    path: c.req.path,
    method: c.req.method 
  }, 404);
});

// Error Handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred'
  }, 500);
});

export default app;