export const getCourseDetailPage = () => {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>دورة Python الشاملة - Think Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-gray-900 text-white">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-3">
                <div class="flex items-center gap-4">
                    <a href="/" class="text-2xl font-bold">
                        <i class="fas fa-graduation-cap ml-2"></i>
                        Think Digital
                    </a>
                </div>
                <div class="flex items-center gap-4">
                    <button class="hover:text-purple-400">
                        <i class="fas fa-share"></i> مشاركة
                    </button>
                    <button class="hover:text-purple-400">
                        <i class="far fa-heart"></i> حفظ
                    </button>
                    <button class="hover:text-purple-400">
                        <i class="fas fa-gift"></i> هدية
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Course Header -->
    <div class="bg-gray-900 text-white py-8">
        <div class="container mx-auto px-4">
            <div class="grid md:grid-cols-3 gap-8">
                <div class="md:col-span-2">
                    <!-- Breadcrumb -->
                    <div class="text-sm mb-4 text-purple-300">
                        <a href="/" class="hover:underline">الرئيسية</a> / 
                        <a href="/courses" class="hover:underline">البرمجة</a> / 
                        <span>Python</span>
                    </div>
                    
                    <h1 class="text-3xl font-bold mb-4">
                        دورة Python الشاملة - من الصفر إلى الاحتراف
                    </h1>
                    
                    <p class="text-xl mb-4 text-gray-300">
                        تعلم Python من الأساسيات إلى المستوى المتقدم مع مشاريع عملية وتطبيقات حقيقية
                    </p>
                    
                    <div class="flex items-center gap-4 mb-4">
                        <span class="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">الأكثر مبيعاً</span>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-amber-400">4.7</span>
                            <div class="text-amber-400">★★★★★</div>
                            <span>(15,234 تقييم)</span>
                        </div>
                        <span>85,432 طالب</span>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <span>تم إنشاؤها بواسطة</span>
                        <a href="#" class="text-purple-400 hover:underline">Ahmed Hassan</a>
                    </div>
                    
                    <div class="flex items-center gap-4 mt-4 text-sm">
                        <span><i class="fas fa-exclamation-circle"></i> آخر تحديث 12/2024</span>
                        <span><i class="fas fa-globe"></i> العربية</span>
                        <span><i class="fas fa-closed-captioning"></i> ترجمة عربية</span>
                    </div>
                </div>
                
                <!-- Video Preview Card -->
                <div class="bg-white text-black rounded-lg overflow-hidden shadow-xl">
                    <div class="relative">
                        <img src="https://via.placeholder.com/400x225" class="w-full">
                        <button class="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition">
                            <i class="fas fa-play-circle text-white text-6xl"></i>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="flex items-center gap-4 mb-4">
                            <span class="text-3xl font-bold">$19.99</span>
                            <span class="text-gray-500 line-through text-xl">$199.99</span>
                            <span class="bg-red-500 text-white px-2 py-1 rounded text-sm">خصم 90%</span>
                        </div>
                        
                        <div class="text-red-600 font-semibold mb-4">
                            <i class="fas fa-clock"></i> ينتهي العرض خلال 5 ساعات!
                        </div>
                        
                        <button class="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 mb-3">
                            أضف إلى السلة
                        </button>
                        
                        <button class="w-full border-2 border-gray-900 py-3 rounded-lg font-bold hover:bg-gray-100">
                            اشترِ الآن
                        </button>
                        
                        <p class="text-center text-sm text-gray-600 mt-4">
                            ضمان استرداد الأموال لمدة 30 يومًا
                        </p>
                        
                        <div class="mt-6 space-y-3">
                            <h4 class="font-bold">تتضمن هذه الدورة:</h4>
                            <ul class="space-y-2 text-sm">
                                <li><i class="fas fa-video ml-2"></i> 42 ساعة فيديو عند الطلب</li>
                                <li><i class="fas fa-file ml-2"></i> 75 مقالة</li>
                                <li><i class="fas fa-download ml-2"></i> 88 موارد قابلة للتنزيل</li>
                                <li><i class="fas fa-infinity ml-2"></i> وصول كامل مدى الحياة</li>
                                <li><i class="fas fa-mobile-alt ml-2"></i> الوصول على الهاتف والتلفزيون</li>
                                <li><i class="fas fa-certificate ml-2"></i> شهادة إتمام</li>
                            </ul>
                        </div>
                        
                        <div class="mt-6 flex gap-2">
                            <input type="text" placeholder="أدخل كود الخصم" class="flex-1 border px-3 py-2 rounded">
                            <button class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
                                تطبيق
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Course Content -->
    <div class="container mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-8">
            <div class="md:col-span-2">
                <!-- What you'll learn -->
                <div class="bg-white rounded-lg p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-4">ماذا ستتعلم</h2>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="flex gap-3">
                            <i class="fas fa-check text-green-500 mt-1"></i>
                            <span>إتقان أساسيات Python والبرمجة الكائنية</span>
                        </div>
                        <div class="flex gap-3">
                            <i class="fas fa-check text-green-500 mt-1"></i>
                            <span>بناء 10 مشاريع Python حقيقية</span>
                        </div>
                        <div class="flex gap-3">
                            <i class="fas fa-check text-green-500 mt-1"></i>
                            <span>تطوير تطبيقات الويب باستخدام Django</span>
                        </div>
                        <div class="flex gap-3">
                            <i class="fas fa-check text-green-500 mt-1"></i>
                            <span>معالجة البيانات وتحليلها</span>
                        </div>
                        <div class="flex gap-3">
                            <i class="fas fa-check text-green-500 mt-1"></i>
                            <span>أتمتة المهام المتكررة</span>
                        </div>
                        <div class="flex gap-3">
                            <i class="fas fa-check text-green-500 mt-1"></i>
                            <span>التعامل مع قواعد البيانات</span>
                        </div>
                    </div>
                </div>

                <!-- Course Content Accordion -->
                <div class="bg-white rounded-lg p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-4">محتوى الدورة</h2>
                    <div class="mb-4 flex justify-between text-sm">
                        <span>23 قسم • 312 محاضرة • إجمالي 42 ساعة</span>
                        <button class="text-purple-600 hover:underline">توسيع جميع الأقسام</button>
                    </div>
                    
                    <div class="border rounded-lg overflow-hidden">
                        ${generateCourseSection('المقدمة وإعداد البيئة', 5, '28:43')}
                        ${generateCourseSection('أساسيات Python', 15, '2:15:30')}
                        ${generateCourseSection('البرمجة الكائنية OOP', 12, '1:45:20')}
                        ${generateCourseSection('معالجة الأخطاء والاستثناءات', 8, '1:10:15')}
                        ${generateCourseSection('العمل مع الملفات', 10, '1:30:00')}
                    </div>
                </div>

                <!-- Requirements -->
                <div class="bg-white rounded-lg p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-4">المتطلبات</h2>
                    <ul class="space-y-2">
                        <li class="flex gap-3">
                            <span>•</span>
                            <span>لا تحتاج إلى أي خبرة برمجية سابقة</span>
                        </li>
                        <li class="flex gap-3">
                            <span>•</span>
                            <span>جهاز كمبيوتر بنظام Windows أو Mac أو Linux</span>
                        </li>
                        <li class="flex gap-3">
                            <span>•</span>
                            <span>اتصال بالإنترنت لتنزيل البرامج المطلوبة</span>
                        </li>
                    </ul>
                </div>

                <!-- Description -->
                <div class="bg-white rounded-lg p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-4">الوصف</h2>
                    <div class="prose max-w-none">
                        <p class="mb-4">
                            هل تريد أن تصبح مبرمج Python محترف؟ هذه الدورة الشاملة ستأخذك من الصفر إلى مستوى الاحتراف في Python.
                        </p>
                        <p class="mb-4">
                            Python هي واحدة من أكثر لغات البرمجة شعبية في العالم، وتستخدم في مجالات متعددة مثل تطوير الويب، 
                            علم البيانات، الذكاء الاصطناعي، والأتمتة.
                        </p>
                        <h3 class="font-bold text-lg mb-2">لماذا هذه الدورة؟</h3>
                        <ul class="list-disc mr-6 mb-4">
                            <li>محتوى محدث ومتجدد باستمرار</li>
                            <li>مشاريع عملية حقيقية</li>
                            <li>دعم مباشر من المدرب</li>
                            <li>مجتمع نشط من الطلاب</li>
                        </ul>
                    </div>
                </div>

                <!-- Instructor -->
                <div class="bg-white rounded-lg p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-4">المدرب</h2>
                    <div class="flex gap-4">
                        <img src="https://via.placeholder.com/100x100" class="w-24 h-24 rounded-full">
                        <div>
                            <h3 class="text-xl font-bold mb-2">Ahmed Hassan</h3>
                            <p class="text-gray-600 mb-2">مطور برمجيات أول</p>
                            <div class="flex gap-4 text-sm">
                                <span><i class="fas fa-star text-amber-400"></i> 4.7 تقييم المدرب</span>
                                <span><i class="fas fa-certificate"></i> 45,234 طالب</span>
                                <span><i class="fas fa-play-circle"></i> 12 دورة</span>
                            </div>
                        </div>
                    </div>
                    <p class="mt-4 text-gray-700">
                        أحمد حسن هو مطور برمجيات محترف مع أكثر من 10 سنوات خبرة في Python وتطوير الويب.
                        عمل مع شركات عالمية كبرى وساعد آلاف الطلاب في تعلم البرمجة.
                    </p>
                </div>

                <!-- Reviews -->
                <div class="bg-white rounded-lg p-6">
                    <h2 class="text-2xl font-bold mb-4">تقييمات الطلاب</h2>
                    <div class="flex items-center gap-4 mb-6">
                        <div class="text-center">
                            <div class="text-5xl font-bold text-amber-500">4.7</div>
                            <div class="text-amber-400">★★★★★</div>
                            <div class="text-gray-600">تقييم الدورة</div>
                        </div>
                        <div class="flex-1">
                            ${generateRatingBar(5, 65)}
                            ${generateRatingBar(4, 25)}
                            ${generateRatingBar(3, 7)}
                            ${generateRatingBar(2, 2)}
                            ${generateRatingBar(1, 1)}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="md:col-span-1">
                <!-- Similar Courses -->
                <div class="bg-white rounded-lg p-4 sticky top-4">
                    <h3 class="font-bold mb-4">دورات مشابهة</h3>
                    <div class="space-y-4">
                        ${generateSimilarCourse('JavaScript من الصفر', '4.6', '$14.99')}
                        ${generateSimilarCourse('تطوير الويب الكامل', '4.8', '$18.99')}
                        ${generateSimilarCourse('React.js المتقدم', '4.7', '$16.99')}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
};

function generateCourseSection(title: string, lectures: number, duration: string) {
  return `
    <div class="border-b">
        <button class="w-full p-4 text-right hover:bg-gray-50 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <i class="fas fa-chevron-down text-gray-400"></i>
                <span class="font-semibold">${title}</span>
            </div>
            <div class="text-sm text-gray-600">
                ${lectures} محاضرات • ${duration}
            </div>
        </button>
    </div>
  `;
}

function generateRatingBar(stars: number, percentage: number) {
  return `
    <div class="flex items-center gap-2 mb-2">
        <div class="flex gap-1">
            ${Array(stars).fill('★').join('')}
        </div>
        <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div class="bg-amber-400 h-2 rounded-full" style="width: ${percentage}%"></div>
        </div>
        <span class="text-sm text-gray-600">${percentage}%</span>
    </div>
  `;
}

function generateSimilarCourse(title: string, rating: string, price: string) {
  return `
    <div class="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
        <img src="https://via.placeholder.com/80x60" class="rounded">
        <div>
            <h4 class="font-semibold text-sm">${title}</h4>
            <div class="text-amber-400 text-sm">${'★'.repeat(Math.floor(parseFloat(rating)))}</div>
            <div class="font-bold text-purple-600">${price}</div>
        </div>
    </div>
  `;
}