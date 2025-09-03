export const getCoursesPage = () => {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>جميع الدورات - Think Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navigation (Same as home) -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-3">
                <div class="flex items-center gap-4">
                    <a href="/" class="text-2xl font-bold text-purple-700">
                        <i class="fas fa-graduation-cap ml-2"></i>
                        Think Digital
                    </a>
                </div>
                <div class="flex-1 max-w-lg mx-4">
                    <div class="relative">
                        <input type="text" placeholder="ابحث عن الدورات..." 
                               class="w-full px-4 py-2 pr-10 border rounded-full focus:outline-none focus:border-purple-500">
                        <button class="absolute left-3 top-2.5 text-gray-500">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <button class="relative text-gray-700">
                        <i class="fas fa-shopping-cart text-xl"></i>
                        <span class="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                    </button>
                    <a href="/student-dashboard" class="bg-purple-600 text-white px-4 py-2 rounded">
                        لوحة التحكم
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Breadcrumb -->
    <div class="bg-gray-900 text-white py-8">
        <div class="container mx-auto px-4">
            <div class="text-sm mb-4">
                <a href="/" class="hover:underline">الرئيسية</a> / 
                <span>جميع الدورات</span>
            </div>
            <h1 class="text-3xl font-bold mb-2">جميع دورات البرمجة</h1>
            <p>دورات لتوسيع مهاراتك في البرمجة</p>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8">
        <div class="grid md:grid-cols-4 gap-8">
            <!-- Filters Sidebar -->
            <div class="md:col-span-1">
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-bold mb-4 text-lg">
                        <i class="fas fa-filter ml-2"></i>
                        فلترة النتائج
                    </h3>
                    
                    <!-- Ratings Filter -->
                    <div class="mb-6">
                        <h4 class="font-semibold mb-3">التقييم</h4>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="rating" class="text-purple-600">
                                <span class="text-amber-400">★★★★★</span>
                                <span class="text-sm">4.5 فما فوق</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="rating" class="text-purple-600">
                                <span class="text-amber-400">★★★★☆</span>
                                <span class="text-sm">4.0 فما فوق</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="rating" class="text-purple-600">
                                <span class="text-amber-400">★★★☆☆</span>
                                <span class="text-sm">3.0 فما فوق</span>
                            </label>
                        </div>
                    </div>

                    <!-- Duration Filter -->
                    <div class="mb-6">
                        <h4 class="font-semibold mb-3">مدة الفيديو</h4>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>0-1 ساعة</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>1-3 ساعات</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>3-6 ساعات</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>6+ ساعات</span>
                            </label>
                        </div>
                    </div>

                    <!-- Level Filter -->
                    <div class="mb-6">
                        <h4 class="font-semibold mb-3">المستوى</h4>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>مبتدئ</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>متوسط</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>متقدم</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>جميع المستويات</span>
                            </label>
                        </div>
                    </div>

                    <!-- Price Filter -->
                    <div class="mb-6">
                        <h4 class="font-semibold mb-3">السعر</h4>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>مجاني</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>مدفوع</span>
                            </label>
                        </div>
                    </div>

                    <!-- Language Filter -->
                    <div class="mb-6">
                        <h4 class="font-semibold mb-3">اللغة</h4>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>العربية</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="text-purple-600">
                                <span>الإنجليزية</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Courses Grid -->
            <div class="md:col-span-3">
                <!-- Sort Bar -->
                <div class="bg-white p-4 rounded-lg shadow mb-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="font-semibold">10,000</span>
                            <span class="text-gray-600"> نتيجة</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-600">ترتيب حسب:</span>
                            <select class="border rounded px-3 py-1">
                                <option>الأكثر صلة</option>
                                <option>الأكثر مشاهدة</option>
                                <option>الأعلى تقييماً</option>
                                <option>الأحدث</option>
                                <option>السعر: من الأقل للأعلى</option>
                                <option>السعر: من الأعلى للأقل</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Courses List -->
                <div class="space-y-4">
                    ${generateCourseListItem(
                        'دورة Python الشاملة - من الصفر إلى الاحتراف',
                        'تعلم Python من الأساسيات إلى المستوى المتقدم مع مشاريع عملية',
                        'Ahmed Hassan',
                        '42 ساعة',
                        4.7,
                        15234,
                        199.99,
                        19.99,
                        'محدث 12/2024',
                        'مبتدئ'
                    )}
                    ${generateCourseListItem(
                        'تطوير تطبيقات الويب باستخدام React و Node.js',
                        'بناء تطبيقات ويب كاملة من الصفر باستخدام MERN Stack',
                        'Sara Ali',
                        '38 ساعة',
                        4.8,
                        9876,
                        189.99,
                        18.99,
                        'الأكثر مبيعاً',
                        'متوسط'
                    )}
                    ${generateCourseListItem(
                        'الذكاء الاصطناعي وتعلم الآلة',
                        'دورة شاملة في AI و Machine Learning مع Python',
                        'Dr. Mohamed Khaled',
                        '56 ساعة',
                        4.9,
                        7654,
                        249.99,
                        24.99,
                        'جديد',
                        'متقدم'
                    )}
                    ${generateCourseListItem(
                        'تصميم واجهات المستخدم UI/UX',
                        'تعلم أساسيات ومبادئ تصميم تجربة المستخدم',
                        'Laila Ahmed',
                        '28 ساعة',
                        4.6,
                        12345,
                        159.99,
                        15.99,
                        'محدث 01/2025',
                        'جميع المستويات'
                    )}
                </div>

                <!-- Pagination -->
                <div class="mt-8 flex justify-center">
                    <div class="flex gap-2">
                        <button class="px-3 py-2 border rounded hover:bg-gray-100">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button class="px-4 py-2 bg-purple-600 text-white rounded">1</button>
                        <button class="px-4 py-2 border rounded hover:bg-gray-100">2</button>
                        <button class="px-4 py-2 border rounded hover:bg-gray-100">3</button>
                        <span class="px-4 py-2">...</span>
                        <button class="px-4 py-2 border rounded hover:bg-gray-100">20</button>
                        <button class="px-3 py-2 border rounded hover:bg-gray-100">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
};

function generateCourseListItem(
  title: string,
  description: string,
  instructor: string,
  duration: string,
  rating: number,
  students: number,
  originalPrice: number,
  salePrice: number,
  badge: string,
  level: string
) {
  return `
    <div class="bg-white rounded-lg shadow hover:shadow-lg transition p-4 cursor-pointer">
        <div class="flex gap-4">
            <img src="https://via.placeholder.com/240x135" class="w-60 h-32 object-cover rounded">
            <div class="flex-1">
                <div class="flex justify-between">
                    <div class="flex-1">
                        <h3 class="text-xl font-bold mb-2">${title}</h3>
                        <p class="text-gray-600 mb-2">${description}</p>
                        <p class="text-sm text-gray-500 mb-2">بواسطة ${instructor}</p>
                        <div class="flex items-center gap-4 text-sm mb-2">
                            <span>${duration}</span>
                            <span>•</span>
                            <span>${level}</span>
                            <span>•</span>
                            <span>ترجمة عربية</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-amber-600">${rating}</span>
                            <div class="text-amber-400">
                                ${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))}
                            </div>
                            <span class="text-sm text-gray-500">(${students.toLocaleString()})</span>
                            ${badge ? `<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">${badge}</span>` : ''}
                        </div>
                    </div>
                    <div class="text-left">
                        <div class="font-bold text-xl mb-1">$${salePrice}</div>
                        <div class="text-gray-500 line-through">$${originalPrice}</div>
                        <button class="mt-3 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
                            أضف للسلة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
}