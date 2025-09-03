import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/cloudflare-workers';
import { CloudflareBindings } from './types';
import { corsConfig } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import enrollmentRoutes from './routes/enrollments';
import paymentRoutes from './routes/payments';
import forumRoutes from './routes/forums';
import dashboardRoutes from './routes/dashboard';

type Env = { Bindings: CloudflareBindings };

const app = new Hono<Env>();

// Middleware
app.use('*', logger());
app.use('/api/*', cors(corsConfig));

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));
app.use('/*', serveStatic({ root: './dist' }));

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EduPlatform API'
  });
});

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/courses', courseRoutes);
app.route('/api/enrollments', enrollmentRoutes);
app.route('/api/payments', paymentRoutes);
app.route('/api/forums', forumRoutes);
app.route('/dashboard', dashboardRoutes);

// API Info
app.get('/api', (c) => {
  return c.json({
    name: 'EduPlatform API',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        verify: 'GET /api/auth/verify-email/:token',
        forgot: 'POST /api/auth/forgot-password',
        reset: 'POST /api/auth/reset-password',
        logout: 'POST /api/auth/logout'
      },
      courses: {
        list: 'GET /api/courses',
        get: 'GET /api/courses/:id',
        create: 'POST /api/courses',
        update: 'PUT /api/courses/:id',
        publish: 'POST /api/courses/:id/publish',
        delete: 'DELETE /api/courses/:id'
      },
      enrollments: {
        enroll: 'POST /api/enrollments/enroll',
        myCourses: 'GET /api/enrollments/my-courses',
        progress: 'GET /api/enrollments/progress/:courseId',
        updateProgress: 'POST /api/enrollments/progress/update',
        certificate: 'GET /api/enrollments/certificate/:enrollmentId'
      },
      payments: {
        checkout: 'POST /api/payments/checkout',
        confirm: 'POST /api/payments/confirm',
        transactions: 'GET /api/payments/transactions',
        validateCoupon: 'POST /api/payments/validate-coupon',
        earnings: 'GET /api/payments/earnings'
      },
      forums: {
        courseThreads: 'GET /api/forums/course/:courseId',
        thread: 'GET /api/forums/thread/:threadId',
        createThread: 'POST /api/forums/thread',
        createReply: 'POST /api/forums/reply',
        markSolution: 'POST /api/forums/solution/:replyId',
        like: 'POST /api/forums/like/:replyId',
        search: 'GET /api/forums/search'
      }
    }
  });
});



// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EduPlatform - Learn Anywhere, Anytime</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; }
            .gradient-bg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .card-hover {
                transition: all 0.3s ease;
            }
            .card-hover:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <div x-data="{ 
            mobileMenu: false,
            courses: [],
            loading: true,
            user: null,
            loginModal: false,
            registerModal: false,
            formData: {
                email: '',
                password: '',
                full_name: '',
                role: 'student'
            },
            async init() {
                await this.loadCourses();
                this.checkAuth();
            },
            async loadCourses() {
                try {
                    const response = await fetch('/api/courses?limit=6');
                    const data = await response.json();
                    if (data.success) {
                        this.courses = data.data.items;
                    }
                } catch (error) {
                    console.error('Error loading courses:', error);
                } finally {
                    this.loading = false;
                }
            },
            checkAuth() {
                const token = localStorage.getItem('auth_token');
                const userData = localStorage.getItem('user_data');
                if (token && userData) {
                    this.user = JSON.parse(userData);
                }
            },
            async login() {
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: this.formData.email,
                            password: this.formData.password
                        })
                    });
                    const data = await response.json();
                    if (data.success) {
                        localStorage.setItem('auth_token', data.data.token);
                        localStorage.setItem('user_data', JSON.stringify(data.data.user));
                        this.user = data.data.user;
                        this.loginModal = false;
                        alert('Login successful!');
                    } else {
                        alert(data.error || 'Login failed');
                    }
                } catch (error) {
                    alert('Login error: ' + error.message);
                }
            },
            async register() {
                try {
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: this.formData.email,
                            password: this.formData.password,
                            full_name: this.formData.full_name,
                            role: this.formData.role
                        })
                    });
                    const data = await response.json();
                    if (data.success) {
                        this.registerModal = false;
                        alert('Registration successful! Please check your email to verify your account.');
                        if (data.verification_token) {
                            console.log('Verification token (dev mode):', data.verification_token);
                        }
                    } else {
                        alert(data.error || 'Registration failed');
                    }
                } catch (error) {
                    alert('Registration error: ' + error.message);
                }
            },
            logout() {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                this.user = null;
                alert('Logged out successfully');
            }
        }">
            <!-- Navigation -->
            <nav class="bg-white shadow-lg">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 flex items-center">
                                <i class="fas fa-graduation-cap text-3xl text-purple-600 mr-3"></i>
                                <span class="text-2xl font-bold text-gray-900">EduPlatform</span>
                            </div>
                            <div class="hidden md:ml-10 md:flex md:space-x-8">
                                <a href="#" class="text-gray-600 hover:text-purple-600 px-3 py-2 text-sm font-medium">Browse Courses</a>
                                <a href="#" class="text-gray-600 hover:text-purple-600 px-3 py-2 text-sm font-medium">Categories</a>
                                <a href="#" class="text-gray-600 hover:text-purple-600 px-3 py-2 text-sm font-medium">For Business</a>
                                <a href="#" class="text-gray-600 hover:text-purple-600 px-3 py-2 text-sm font-medium">Teach</a>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <template x-if="!user">
                                <div class="flex space-x-3">
                                    <button @click="loginModal = true" class="text-gray-600 hover:text-purple-600 px-4 py-2 text-sm font-medium">
                                        Login
                                    </button>
                                    <button @click="registerModal = true" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                                        Sign Up
                                    </button>
                                </div>
                            </template>
                            <template x-if="user">
                                <div class="flex items-center space-x-3">
                                    <span class="text-sm text-gray-600" x-text="user.full_name"></span>
                                    <button @click="logout" class="text-gray-600 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                                        Logout
                                    </button>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <div class="gradient-bg text-white py-20">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center">
                        <h1 class="text-5xl font-bold mb-4">Learn Without Limits</h1>
                        <p class="text-xl mb-8 opacity-90">Access thousands of courses from expert instructors</p>
                        <div class="max-w-2xl mx-auto flex gap-4">
                            <input type="text" placeholder="What do you want to learn?" 
                                class="flex-1 px-6 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-4 focus:ring-purple-300">
                            <button class="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                                <i class="fas fa-search mr-2"></i>Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Section -->
            <div class="bg-white py-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div class="text-3xl font-bold text-purple-600">10,000+</div>
                            <div class="text-gray-600 mt-2">Active Students</div>
                        </div>
                        <div>
                            <div class="text-3xl font-bold text-purple-600">500+</div>
                            <div class="text-gray-600 mt-2">Expert Instructors</div>
                        </div>
                        <div>
                            <div class="text-3xl font-bold text-purple-600">1,000+</div>
                            <div class="text-gray-600 mt-2">Premium Courses</div>
                        </div>
                        <div>
                            <div class="text-3xl font-bold text-purple-600">95%</div>
                            <div class="text-gray-600 mt-2">Success Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Featured Courses -->
            <div class="py-16 bg-gray-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-12">
                        <h2 class="text-3xl font-bold text-gray-900 mb-4">Featured Courses</h2>
                        <p class="text-gray-600">Explore our most popular courses</p>
                    </div>

                    <div x-show="loading" class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-3xl text-purple-600"></i>
                    </div>

                    <div x-show="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <template x-for="course in courses" :key="course.id">
                            <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
                                <div class="h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                    <i class="fas fa-play-circle text-white text-5xl opacity-75"></i>
                                </div>
                                <div class="p-6">
                                    <div class="flex items-center mb-2">
                                        <span class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded" x-text="course.level"></span>
                                        <span class="ml-auto text-yellow-500">
                                            <i class="fas fa-star"></i>
                                            <span x-text="course.rating || '0'"></span>
                                        </span>
                                    </div>
                                    <h3 class="text-lg font-semibold text-gray-900 mb-2" x-text="course.title"></h3>
                                    <p class="text-gray-600 text-sm mb-4 line-clamp-2" x-text="course.short_description || course.description"></p>
                                    <div class="flex items-center text-sm text-gray-500 mb-4">
                                        <i class="fas fa-clock mr-2"></i>
                                        <span x-text="(course.duration_hours || 0) + ' hours'"></span>
                                        <span class="ml-auto font-bold text-gray-900">
                                            $<span x-text="course.price"></span>
                                        </span>
                                    </div>
                                    <button class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

            <!-- Login Modal -->
            <div x-show="loginModal" x-cloak class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Login to EduPlatform</h3>
                    <form @submit.prevent="login">
                        <input type="email" x-model="formData.email" placeholder="Email" required
                            class="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <input type="password" x-model="formData.password" placeholder="Password" required
                            class="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <button type="submit" class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                            Login
                        </button>
                    </form>
                    <button @click="loginModal = false" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Register Modal -->
            <div x-show="registerModal" x-cloak class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Create Your Account</h3>
                    <form @submit.prevent="register">
                        <input type="text" x-model="formData.full_name" placeholder="Full Name" required
                            class="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <input type="email" x-model="formData.email" placeholder="Email" required
                            class="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <input type="password" x-model="formData.password" placeholder="Password (min 6 chars)" required
                            class="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <select x-model="formData.role" class="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600">
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                        <button type="submit" class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                            Sign Up
                        </button>
                    </form>
                    <button @click="registerModal = false" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Footer -->
            <footer class="bg-gray-900 text-white py-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 class="text-lg font-semibold mb-4">About</h3>
                            <ul class="space-y-2 text-gray-400">
                                <li><a href="#" class="hover:text-white">About Us</a></li>
                                <li><a href="#" class="hover:text-white">Careers</a></li>
                                <li><a href="#" class="hover:text-white">Press</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Community</h3>
                            <ul class="space-y-2 text-gray-400">
                                <li><a href="#" class="hover:text-white">Forums</a></li>
                                <li><a href="#" class="hover:text-white">Blog</a></li>
                                <li><a href="#" class="hover:text-white">Events</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Teaching</h3>
                            <ul class="space-y-2 text-gray-400">
                                <li><a href="#" class="hover:text-white">Become an Instructor</a></li>
                                <li><a href="#" class="hover:text-white">Teaching Resources</a></li>
                                <li><a href="#" class="hover:text-white">Help Center</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Connect</h3>
                            <div class="flex space-x-4">
                                <a href="#" class="text-gray-400 hover:text-white text-2xl"><i class="fab fa-facebook"></i></a>
                                <a href="#" class="text-gray-400 hover:text-white text-2xl"><i class="fab fa-twitter"></i></a>
                                <a href="#" class="text-gray-400 hover:text-white text-2xl"><i class="fab fa-linkedin"></i></a>
                                <a href="#" class="text-gray-400 hover:text-white text-2xl"><i class="fab fa-youtube"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                        <p>&copy; 2024 EduPlatform. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    </body>
    </html>
  `);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;