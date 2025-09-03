import { Hono } from 'hono';
import { authenticate } from '../middleware/auth';
import { CloudflareBindings } from '../types';

type Env = { Bindings: CloudflareBindings };

const dashboard = new Hono<Env>();

// Dashboard HTML page
dashboard.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Dashboard - EduPlatform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex">
        <!-- Quick Access Dashboard -->
        <div class="flex-1 p-8">
            <div class="max-w-7xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                    <p class="text-gray-600 mt-2">Welcome to your learning hub</p>
                </div>
                
                <!-- Quick Links -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <a href="/" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition">
                        <i class="fas fa-home text-3xl text-purple-600 mb-4"></i>
                        <h3 class="text-lg font-semibold mb-2">Home</h3>
                        <p class="text-gray-600">Browse all courses</p>
                    </a>
                    
                    <a href="/api/enrollments/my-courses" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition">
                        <i class="fas fa-book text-3xl text-blue-600 mb-4"></i>
                        <h3 class="text-lg font-semibold mb-2">My Courses</h3>
                        <p class="text-gray-600">View enrolled courses (API)</p>
                    </a>
                    
                    <a href="/api" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition">
                        <i class="fas fa-code text-3xl text-green-600 mb-4"></i>
                        <h3 class="text-lg font-semibold mb-2">API Documentation</h3>
                        <p class="text-gray-600">Explore all endpoints</p>
                    </a>
                </div>
                
                <!-- Demo Info -->
                <div class="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <h2 class="text-xl font-semibold text-purple-900 mb-4">
                        <i class="fas fa-info-circle mr-2"></i>Demo Access
                    </h2>
                    
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="font-semibold text-purple-800 mb-2">Test Accounts:</h3>
                            <ul class="space-y-2 text-sm">
                                <li class="flex items-center">
                                    <i class="fas fa-user text-purple-600 mr-2 w-4"></i>
                                    <span><strong>Student:</strong> alice@example.com / student123</span>
                                </li>
                                <li class="flex items-center">
                                    <i class="fas fa-chalkboard-teacher text-purple-600 mr-2 w-4"></i>
                                    <span><strong>Instructor:</strong> john.doe@eduplatform.com / instructor123</span>
                                </li>
                                <li class="flex items-center">
                                    <i class="fas fa-user-shield text-purple-600 mr-2 w-4"></i>
                                    <span><strong>Admin:</strong> admin@eduplatform.com / admin123</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 class="font-semibold text-purple-800 mb-2">Quick Actions:</h3>
                            <div class="space-y-2">
                                <button onclick="testLogin()" class="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                                    <i class="fas fa-sign-in-alt mr-2"></i>Test Login
                                </button>
                                <button onclick="viewCourses()" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                                    <i class="fas fa-list mr-2"></i>View Courses API
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Features List -->
                <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
                    <h2 class="text-xl font-semibold mb-4">Platform Features</h2>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <div>
                                <h4 class="font-medium">User Authentication</h4>
                                <p class="text-sm text-gray-600">JWT-based secure login system</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <div>
                                <h4 class="font-medium">Course Management</h4>
                                <p class="text-sm text-gray-600">Create, edit, and publish courses</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <div>
                                <h4 class="font-medium">Student Enrollment</h4>
                                <p class="text-sm text-gray-600">Track progress and completion</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <div>
                                <h4 class="font-medium">Payment Processing</h4>
                                <p class="text-sm text-gray-600">Stripe integration for payments</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <div>
                                <h4 class="font-medium">Community Forums</h4>
                                <p class="text-sm text-gray-600">Discussion boards for each course</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <div>
                                <h4 class="font-medium">Certificates</h4>
                                <p class="text-sm text-gray-600">Auto-generated completion certificates</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        async function testLogin() {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'alice@example.com',
                        password: 'student123'
                    })
                });
                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('auth_token', data.data.token);
                    localStorage.setItem('user_data', JSON.stringify(data.data.user));
                    alert('Login successful! Token saved to localStorage.');
                } else {
                    alert('Login failed: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        
        async function viewCourses() {
            try {
                const response = await fetch('/api/courses');
                const data = await response.json();
                console.log('Courses:', data);
                alert('Check console for course data. Found ' + (data.data?.items?.length || 0) + ' courses.');
            } catch (error) {
                alert('Error fetching courses: ' + error.message);
            }
        }
    </script>
</body>
</html>
  `);
});

export default dashboard;