export const getStudentDashboard = () => {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تحكم الطالب - Think Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="text-2xl font-bold">
                    <i class="fas fa-graduation-cap ml-2"></i>
                    Think Digital - لوحة الطالب
                </div>
                <div class="flex items-center gap-4">
                    <span id="user-name" class="font-medium"></span>
                    <button onclick="logout()" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition">
                        <i class="fas fa-sign-out-alt ml-2"></i>
                        خروج
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
        <!-- Welcome Section -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
                مرحباً بك في لوحة تحكم الطالب! 🎓
            </h1>
            <p class="text-gray-600">استمر في التعلم وطور مهاراتك</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid md:grid-cols-4 gap-6 mb-8">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-blue-100">الدورات المسجلة</p>
                        <p class="text-3xl font-bold">5</p>
                    </div>
                    <i class="fas fa-book-open text-4xl opacity-30"></i>
                </div>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-green-100">الدورات المكتملة</p>
                        <p class="text-3xl font-bold">2</p>
                    </div>
                    <i class="fas fa-check-circle text-4xl opacity-30"></i>
                </div>
            </div>
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-purple-100">الشهادات</p>
                        <p class="text-3xl font-bold">2</p>
                    </div>
                    <i class="fas fa-certificate text-4xl opacity-30"></i>
                </div>
            </div>
            <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-orange-100">معدل التقدم</p>
                        <p class="text-3xl font-bold">68%</p>
                    </div>
                    <i class="fas fa-chart-line text-4xl opacity-30"></i>
                </div>
            </div>
        </div>

        <!-- Current Courses -->
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-play-circle text-purple-600 ml-2"></i>
                الدورات الحالية
            </h2>
            <div class="grid md:grid-cols-2 gap-6">
                <div class="border rounded-lg p-4 hover:shadow-lg transition">
                    <h3 class="font-bold text-lg mb-2">تطوير الويب بـ JavaScript</h3>
                    <p class="text-gray-600 text-sm mb-3">تعلم البرمجة من الصفر</p>
                    <div class="bg-gray-200 rounded-full h-3 mb-2">
                        <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style="width: 75%"></div>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">التقدم: 75%</span>
                        <button class="text-blue-600 hover:text-blue-800 font-medium">
                            <i class="fas fa-play ml-1"></i> متابعة
                        </button>
                    </div>
                </div>
                
                <div class="border rounded-lg p-4 hover:shadow-lg transition">
                    <h3 class="font-bold text-lg mb-2">تصميم واجهات المستخدم</h3>
                    <p class="text-gray-600 text-sm mb-3">أساسيات UI/UX</p>
                    <div class="bg-gray-200 rounded-full h-3 mb-2">
                        <div class="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full" style="width: 45%"></div>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">التقدم: 45%</span>
                        <button class="text-blue-600 hover:text-blue-800 font-medium">
                            <i class="fas fa-play ml-1"></i> متابعة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Check authentication
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('user-name').textContent = user.email || 'الطالب';
        
        // Logout function
        function logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    </script>
</body>
</html>`;
};

export const getInstructorDashboard = () => {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تحكم المدرب - Think Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="text-2xl font-bold">
                    <i class="fas fa-chalkboard-teacher ml-2"></i>
                    Think Digital - لوحة المدرب
                </div>
                <div class="flex items-center gap-4">
                    <span id="user-name" class="font-medium"></span>
                    <button onclick="logout()" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition">
                        <i class="fas fa-sign-out-alt ml-2"></i>
                        خروج
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
        <!-- Welcome Section -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
                أهلاً بك في لوحة تحكم المدرب! 👨‍🏫
            </h1>
            <p class="text-gray-600">إدارة الدورات والطلاب</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid md:grid-cols-4 gap-6 mb-8">
            <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-indigo-100">الدورات النشطة</p>
                        <p class="text-3xl font-bold">8</p>
                    </div>
                    <i class="fas fa-video text-4xl opacity-30"></i>
                </div>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-green-100">إجمالي الطلاب</p>
                        <p class="text-3xl font-bold">234</p>
                    </div>
                    <i class="fas fa-users text-4xl opacity-30"></i>
                </div>
            </div>
            <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-yellow-100">التقييم</p>
                        <p class="text-3xl font-bold">4.8⭐</p>
                    </div>
                    <i class="fas fa-star text-4xl opacity-30"></i>
                </div>
            </div>
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-purple-100">الإيرادات</p>
                        <p class="text-3xl font-bold">$3,450</p>
                    </div>
                    <i class="fas fa-dollar-sign text-4xl opacity-30"></i>
                </div>
            </div>
        </div>

        <!-- My Courses -->
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-book text-indigo-600 ml-2"></i>
                دوراتي
            </h2>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="text-right p-3">الدورة</th>
                            <th class="text-center p-3">الطلاب</th>
                            <th class="text-center p-3">التقييم</th>
                            <th class="text-center p-3">الإيرادات</th>
                            <th class="text-center p-3">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-3 font-semibold">JavaScript المتقدم</td>
                            <td class="text-center p-3">85</td>
                            <td class="text-center p-3">4.9 ⭐</td>
                            <td class="text-center p-3 font-semibold">$1,275</td>
                            <td class="text-center p-3">
                                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full">نشط</span>
                            </td>
                        </tr>
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-3 font-semibold">تصميم UI/UX</td>
                            <td class="text-center p-3">62</td>
                            <td class="text-center p-3">4.7 ⭐</td>
                            <td class="text-center p-3 font-semibold">$930</td>
                            <td class="text-center p-3">
                                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full">نشط</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('user-name').textContent = user.email || 'المدرب';
        
        function logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    </script>
</body>
</html>`;
};

export const getAdminDashboard = () => {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تحكم المدير - Think Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="text-2xl font-bold">
                    <i class="fas fa-shield-alt ml-2"></i>
                    Think Digital - لوحة الإدارة
                </div>
                <div class="flex items-center gap-4">
                    <span id="user-name" class="font-medium"></span>
                    <button onclick="logout()" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition">
                        <i class="fas fa-sign-out-alt ml-2"></i>
                        خروج
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
        <!-- Welcome Section -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
                مرحباً بك في لوحة الإدارة! 🛡️
            </h1>
            <p class="text-gray-600">إدارة شاملة للمنصة التعليمية</p>
        </div>

        <!-- System Overview Cards -->
        <div class="grid md:grid-cols-5 gap-4 mb-8">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-blue-100 text-sm">المستخدمون</p>
                        <p class="text-3xl font-bold">1,247</p>
                    </div>
                    <i class="fas fa-users text-3xl opacity-30"></i>
                </div>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-green-100 text-sm">الدورات</p>
                        <p class="text-3xl font-bold">84</p>
                    </div>
                    <i class="fas fa-book text-3xl opacity-30"></i>
                </div>
            </div>
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-purple-100 text-sm">المدربون</p>
                        <p class="text-3xl font-bold">45</p>
                    </div>
                    <i class="fas fa-chalkboard-teacher text-3xl opacity-30"></i>
                </div>
            </div>
            <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-yellow-100 text-sm">الإيرادات</p>
                        <p class="text-3xl font-bold">$24.5K</p>
                    </div>
                    <i class="fas fa-dollar-sign text-3xl opacity-30"></i>
                </div>
            </div>
            <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-red-100 text-sm">معدل الإكمال</p>
                        <p class="text-3xl font-bold">76%</p>
                    </div>
                    <i class="fas fa-chart-pie text-3xl opacity-30"></i>
                </div>
            </div>
        </div>

        <!-- Admin Actions -->
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-tools text-red-600 ml-2"></i>
                أدوات الإدارة
            </h2>
            <div class="grid md:grid-cols-6 gap-4">
                <button class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:shadow-lg transition text-center">
                    <i class="fas fa-user-cog text-2xl mb-2"></i>
                    <p class="text-sm">المستخدمون</p>
                </button>
                <button class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:shadow-lg transition text-center">
                    <i class="fas fa-graduation-cap text-2xl mb-2"></i>
                    <p class="text-sm">الدورات</p>
                </button>
                <button class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:shadow-lg transition text-center">
                    <i class="fas fa-credit-card text-2xl mb-2"></i>
                    <p class="text-sm">المدفوعات</p>
                </button>
                <button class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg hover:shadow-lg transition text-center">
                    <i class="fas fa-chart-bar text-2xl mb-2"></i>
                    <p class="text-sm">التقارير</p>
                </button>
                <button class="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg hover:shadow-lg transition text-center">
                    <i class="fas fa-cog text-2xl mb-2"></i>
                    <p class="text-sm">الإعدادات</p>
                </button>
                <button class="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4 rounded-lg hover:shadow-lg transition text-center">
                    <i class="fas fa-database text-2xl mb-2"></i>
                    <p class="text-sm">النسخ</p>
                </button>
            </div>
        </div>
    </div>

    <script>
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('user-name').textContent = user.email || 'المدير';
        
        function logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    </script>
</body>
</html>`;
};