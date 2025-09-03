export const getHomePage = () => {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Think Digital - تعلم أي شيء، في أي وقت، من أي مكان</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" rel="stylesheet"/>
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
    <style>
        .swiper { width: 100%; height: 100%; }
        .category-card:hover { transform: translateY(-5px); }
    </style>
</head>
<body class="bg-white">
    <!-- Top Header -->
    <div class="bg-purple-700 text-white py-2 px-4 text-center text-sm">
        <span>🎉 عروض خاصة | احصل على خصم 50% على جميع الدورات - لفترة محدودة!</span>
    </div>

    <!-- Main Navigation -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-3">
                <!-- Logo -->
                <div class="flex items-center gap-4">
                    <a href="/" class="text-2xl font-bold text-purple-700">
                        <i class="fas fa-graduation-cap ml-2"></i>
                        Think Digital
                    </a>
                    <button class="text-gray-700 hover:text-purple-700">
                        <i class="fas fa-bars ml-2"></i>
                        الفئات
                    </button>
                </div>

                <!-- Search Bar -->
                <div class="flex-1 max-w-lg mx-4">
                    <div class="relative">
                        <input type="text" placeholder="ابحث عن أي شيء..." 
                               class="w-full px-4 py-2 pr-10 border rounded-full focus:outline-none focus:border-purple-500">
                        <button class="absolute left-3 top-2.5 text-gray-500">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>

                <!-- Right Menu -->
                <div class="flex items-center gap-4">
                    <a href="/courses" class="text-gray-700 hover:text-purple-700">
                        <i class="fas fa-briefcase ml-1"></i>
                        الأعمال
                    </a>
                    <a href="/teach" class="text-gray-700 hover:text-purple-700">
                        <i class="fas fa-chalkboard-teacher ml-1"></i>
                        درّس معنا
                    </a>
                    <a href="/my-learning" class="text-gray-700 hover:text-purple-700">
                        <i class="fas fa-play-circle ml-1"></i>
                        تعلمي
                    </a>
                    <button class="relative text-gray-700 hover:text-purple-700">
                        <i class="fas fa-heart text-xl"></i>
                    </button>
                    <button onclick="toggleCart()" class="relative text-gray-700 hover:text-purple-700">
                        <i class="fas fa-shopping-cart text-xl"></i>
                        <span class="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
                    </button>
                    <button onclick="showLoginModal()" class="bg-gray-800 text-white px-4 py-2 rounded">
                        تسجيل الدخول
                    </button>
                    <button onclick="showSignupModal()" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                        اشترك
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section with Slider -->
    <section class="bg-gradient-to-r from-purple-50 to-blue-50 py-12">
        <div class="container mx-auto px-4">
            <div class="swiper heroSwiper rounded-xl overflow-hidden shadow-xl">
                <div class="swiper-wrapper">
                    <!-- Slide 1 -->
                    <div class="swiper-slide">
                        <div class="grid md:grid-cols-2 gap-8 items-center p-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                            <div>
                                <h1 class="text-4xl md:text-5xl font-bold mb-4">
                                    تعلم بلا حدود
                                </h1>
                                <p class="text-xl mb-6 opacity-90">
                                    ابدأ، غيّر، أو طوّر مسارك المهني مع أكثر من 210,000 دورة تدريبية
                                </p>
                                <button class="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                                    ابدأ التعلم الآن
                                </button>
                            </div>
                            <div>
                                <img src="https://s.udemycdn.com/browse_components/billboard/fallback_banner_image_udlite.jpg" 
                                     class="rounded-lg shadow-lg">
                            </div>
                        </div>
                    </div>
                    <!-- Slide 2 -->
                    <div class="swiper-slide">
                        <div class="grid md:grid-cols-2 gap-8 items-center p-8 bg-gradient-to-r from-green-600 to-teal-600 text-white">
                            <div>
                                <h1 class="text-4xl md:text-5xl font-bold mb-4">
                                    مهارات للمستقبل
                                </h1>
                                <p class="text-xl mb-6 opacity-90">
                                    تعلم الذكاء الاصطناعي، البرمجة، والتصميم من الخبراء
                                </p>
                                <button class="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                                    استكشف الدورات
                                </button>
                            </div>
                            <div>
                                <img src="https://s.udemycdn.com/browse_components/billboard/fallback_banner_image_2_udlite.jpg" 
                                     class="rounded-lg shadow-lg">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="swiper-pagination"></div>
            </div>
        </div>
    </section>

    <!-- Stats Bar -->
    <section class="bg-gray-100 py-6">
        <div class="container mx-auto px-4">
            <div class="grid md:grid-cols-4 gap-4 text-center">
                <div>
                    <div class="text-3xl font-bold text-purple-600">62M+</div>
                    <div class="text-gray-600">طالب</div>
                </div>
                <div>
                    <div class="text-3xl font-bold text-purple-600">210K+</div>
                    <div class="text-gray-600">دورة</div>
                </div>
                <div>
                    <div class="text-3xl font-bold text-purple-600">75K+</div>
                    <div class="text-gray-600">مدرب</div>
                </div>
                <div>
                    <div class="text-3xl font-bold text-purple-600">870M+</div>
                    <div class="text-gray-600">تسجيل</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Courses -->
    <section class="py-12">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold mb-2">مجموعة واسعة من الدورات</h2>
            <p class="text-gray-600 mb-8">اختر من بين 210,000 دورة فيديو عبر الإنترنت مع إضافات جديدة كل شهر</p>
            
            <!-- Category Tabs -->
            <div class="flex gap-4 mb-8 overflow-x-auto pb-2">
                <button class="px-4 py-2 font-semibold border-b-2 border-purple-600 text-purple-600">Python</button>
                <button class="px-4 py-2 font-semibold text-gray-600 hover:text-purple-600">Excel</button>
                <button class="px-4 py-2 font-semibold text-gray-600 hover:text-purple-600">تطوير الويب</button>
                <button class="px-4 py-2 font-semibold text-gray-600 hover:text-purple-600">JavaScript</button>
                <button class="px-4 py-2 font-semibold text-gray-600 hover:text-purple-600">علم البيانات</button>
                <button class="px-4 py-2 font-semibold text-gray-600 hover:text-purple-600">AWS</button>
                <button class="px-4 py-2 font-semibold text-gray-600 hover:text-purple-600">الرسم</button>
            </div>

            <!-- Courses Grid -->
            <div class="grid md:grid-cols-5 gap-4">
                ${generateCourseCard('Python للمبتدئين', 'Ahmed Hassan', 4.6, 125430, 199.99, 19.99)}
                ${generateCourseCard('تعلم React من الصفر', 'Sara Ali', 4.8, 98234, 149.99, 14.99)}
                ${generateCourseCard('التسويق الرقمي', 'Mohamed Khaled', 4.5, 76543, 129.99, 12.99)}
                ${generateCourseCard('تصميم UI/UX', 'Laila Ahmed', 4.7, 54321, 179.99, 17.99)}
                ${generateCourseCard('AWS Cloud', 'Omar Saeed', 4.9, 43210, 199.99, 19.99)}
            </div>
        </div>
    </section>

    <!-- Top Categories -->
    <section class="bg-gray-50 py-12">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold mb-8">أفضل الفئات</h2>
            <div class="grid md:grid-cols-4 gap-4">
                ${generateCategoryCard('fas fa-code', 'البرمجة', '36,354,994 طالب')}
                ${generateCategoryCard('fas fa-chart-line', 'الأعمال', '24,123,456 طالب')}
                ${generateCategoryCard('fas fa-calculator', 'المالية والمحاسبة', '8,234,567 طالب')}
                ${generateCategoryCard('fas fa-laptop', 'تكنولوجيا المعلومات', '12,345,678 طالب')}
                ${generateCategoryCard('fas fa-paint-brush', 'التصميم', '9,876,543 طالب')}
                ${generateCategoryCard('fas fa-bullhorn', 'التسويق', '6,543,210 طالب')}
                ${generateCategoryCard('fas fa-user-tie', 'التطوير الشخصي', '15,432,109 طالب')}
                ${generateCategoryCard('fas fa-camera', 'التصوير', '3,210,987 طالب')}
            </div>
        </div>
    </section>

    <!-- Become Instructor CTA -->
    <section class="py-12">
        <div class="container mx-auto px-4">
            <div class="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 text-white text-center">
                <h2 class="text-3xl font-bold mb-4">كن مدرباً</h2>
                <p class="text-xl mb-6 opacity-90">
                    شارك معرفتك مع ملايين الطلاب حول العالم واكسب المال
                </p>
                <button class="bg-white text-gray-800 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                    ابدأ التدريس اليوم
                </button>
            </div>
        </div>
    </section>

    <!-- Shopping Cart Sidebar -->
    <div id="cart-sidebar" class="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform translate-x-full transition-transform z-50">
        <div class="p-4 border-b">
            <div class="flex justify-between items-center">
                <h3 class="text-xl font-bold">سلة التسوق</h3>
                <button onclick="toggleCart()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
        </div>
        <div class="p-4">
            <div class="space-y-4">
                <div class="flex gap-4 border-b pb-4">
                    <img src="https://via.placeholder.com/80x60" class="rounded">
                    <div class="flex-1">
                        <h4 class="font-semibold">Python للمبتدئين</h4>
                        <p class="text-sm text-gray-600">Ahmed Hassan</p>
                        <p class="font-bold text-purple-600">$19.99</p>
                    </div>
                    <button class="text-gray-400 hover:text-red-500">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="flex gap-4 border-b pb-4">
                    <img src="https://via.placeholder.com/80x60" class="rounded">
                    <div class="flex-1">
                        <h4 class="font-semibold">React من الصفر</h4>
                        <p class="text-sm text-gray-600">Sara Ali</p>
                        <p class="font-bold text-purple-600">$14.99</p>
                    </div>
                    <button class="text-gray-400 hover:text-red-500">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="mt-6 pt-4 border-t">
                <div class="flex justify-between mb-4">
                    <span class="text-xl font-bold">المجموع:</span>
                    <span class="text-2xl font-bold text-purple-600">$34.98</span>
                </div>
                <button class="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                    الذهاب للدفع
                </button>
            </div>
        </div>
    </div>

    <!-- Login Modal -->
    <div id="login-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 class="text-2xl font-bold mb-6">تسجيل الدخول</h2>
            <form onsubmit="handleLogin(event)">
                <input type="email" placeholder="البريد الإلكتروني" class="w-full px-4 py-3 border rounded-lg mb-4">
                <input type="password" placeholder="كلمة المرور" class="w-full px-4 py-3 border rounded-lg mb-4">
                <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700">
                    تسجيل الدخول
                </button>
            </form>
            <div class="mt-4 text-center">
                <p class="text-gray-600">ليس لديك حساب؟ 
                    <button onclick="switchToSignup()" class="text-purple-600 font-semibold">اشترك</button>
                </p>
            </div>
            <button onclick="closeModal('login-modal')" class="absolute top-4 left-4 text-gray-500">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 py-12">
        <div class="container mx-auto px-4">
            <div class="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                    <h3 class="font-bold text-white mb-4">الشركة</h3>
                    <ul class="space-y-2">
                        <li><a href="#" class="hover:text-white">من نحن</a></li>
                        <li><a href="#" class="hover:text-white">وظائف</a></li>
                        <li><a href="#" class="hover:text-white">المدونة</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-white mb-4">المجتمع</h3>
                    <ul class="space-y-2">
                        <li><a href="#" class="hover:text-white">المدربون</a></li>
                        <li><a href="#" class="hover:text-white">الشركاء</a></li>
                        <li><a href="#" class="hover:text-white">المطورون</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-white mb-4">روابط مفيدة</h3>
                    <ul class="space-y-2">
                        <li><a href="#" class="hover:text-white">المساعدة والدعم</a></li>
                        <li><a href="#" class="hover:text-white">الشروط</a></li>
                        <li><a href="#" class="hover:text-white">سياسة الخصوصية</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-bold text-white mb-4">اللغة</h3>
                    <button class="border border-gray-600 px-4 py-2 rounded hover:border-white">
                        <i class="fas fa-globe ml-2"></i>
                        العربية
                    </button>
                </div>
            </div>
            <div class="border-t border-gray-700 pt-8">
                <div class="flex justify-between items-center">
                    <div class="text-2xl font-bold text-white">
                        <i class="fas fa-graduation-cap ml-2"></i>
                        Think Digital
                    </div>
                    <p>© 2024 Think Digital, Inc.</p>
                </div>
            </div>
        </div>
    </footer>

    <script>
        // Initialize Swiper
        new Swiper('.heroSwiper', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });

        function toggleCart() {
            const cart = document.getElementById('cart-sidebar');
            cart.classList.toggle('translate-x-full');
        }

        function showLoginModal() {
            document.getElementById('login-modal').style.display = 'flex';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function handleLogin(event) {
            event.preventDefault();
            // Handle login logic
            window.location.href = '/student-dashboard';
        }
    </script>
</body>
</html>`;
};

function generateCourseCard(title: string, instructor: string, rating: number, students: number, originalPrice: number, salePrice: number) {
  return `
    <div class="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
        <img src="https://via.placeholder.com/240x135" class="w-full">
        <div class="p-4">
            <h3 class="font-bold mb-1 line-clamp-2">${title}</h3>
            <p class="text-sm text-gray-600 mb-2">${instructor}</p>
            <div class="flex items-center gap-2 mb-2">
                <span class="font-bold text-amber-600">${rating}</span>
                <div class="text-amber-400">
                    ${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))}
                </div>
                <span class="text-xs text-gray-500">(${students.toLocaleString()})</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-bold">$${salePrice}</span>
                <span class="text-gray-500 line-through text-sm">$${originalPrice}</span>
            </div>
        </div>
    </div>
  `;
}

function generateCategoryCard(icon: string, title: string, students: string) {
  return `
    <div class="bg-white p-6 rounded-lg hover:shadow-lg transition category-card cursor-pointer">
        <i class="${icon} text-3xl text-purple-600 mb-4"></i>
        <h3 class="font-bold mb-2">${title}</h3>
        <p class="text-sm text-gray-600">${students}</p>
    </div>
  `;
}