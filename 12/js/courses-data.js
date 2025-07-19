const courses = {
    1: {
        title: 'Hello',
        description: 'ابدأ رحلتك في عالم البرمجة مع لغة بايثون القوية، من الأساسيات إلى بناء تطبيقات بسيطة.',
        image: 'images/image1.jpg',
        color: '#4CAF50',
        progress: 75,
        totalLessons: 10,
        currentLesson: 'الوحدة ٨ - الدرس: التعامل مع الملفات',
        pendingAssignments: 1,
        pendingTests: 1,
        overallGrade: 88,
        lectures: [
            // ... (محتوى المحاضرات)
        ],
        assignments: [
            // ... (محتوى الواجبات)
        ],
        grades: [
            // ... (محتوى الدرجات)
        ], // <<<--- أضف الفاصلة هنا!
        quizzesAndExams: {
            assignment1: {
                title: "واجب التجربة الأول",
                type: "quiz",
                questions: [
                    {
                        id: "q1",
                        text: "ما هي عاصمة مصر؟",
                        type: "multiple_choice",
                        options: ["القاهرة", "الإسكندرية", "أسوان"],
                        correctAnswer: "القاهرة",
                        points: 5
                    },
                    {
                        id: "q2",
                        text: "ما هو أكبر كوكب في المجموعة الشمسية؟",
                        type: "short_answer",
                        correctAnswer: "المشتري",
                        points: 10
                    },
                    {
                        id: "q3",
                        text: "2 + 2 = ؟",
                        type: "multiple_choice",
                        options: ["3", "4", "5"],
                        correctAnswer: "4",
                        points: 5
                    }
                ],
                totalPoints: 20,
                dueDate: "2025-12-31",
                status: "pending"
            }
        }
    },
        2: {
        title: 'تصميم واجهات وتجربة المستخدم (UI/UX)',
        description: 'تعلم كيفية تصميم واجهات مستخدم جذابة وتوفير تجربة استخدام لا تُنسى للمستخدمين.',
        image: 'images/image2.jpg',
        color: '#2196F3',
        progress: 40,
        totalLessons: 8,
        currentLesson: 'الوحدة ٤ - الدرس: مبادئ التفاعل',
        pendingAssignments: 2,
        pendingTests: 0,
        overallGrade: 65,
        lectures: [
            { name: 'مقدمة في UI/UX', link: '#', icon: 'fa-play-circle' },
            { name: 'مبادئ التصميم الجرافيكي', link: '#', icon: 'fa-play-circle' },
            { name: 'تصميم تجربة المستخدم (UX)', link: '#', icon: 'fa-play-circle' },
            { name: 'الدرس: مبادئ التفاعل', link: '#', icon: 'fa-play-circle' }
        ],
        assignments: [
            { name: 'مشروع تصميم واجهة تطبيق', status: 'pending', link: '#', icon: 'fa-hourglass-half' },
            { name: 'واجب بحثي: تحليل تجربة مستخدم', status: 'pending', link: '#', icon: 'fa-hourglass-half' }
        ],
        grades: [
            { name: 'اختبار نهائي', grade: 'غير متاح بعد', icon: 'fa-hourglass' },
            { name: 'عدد الغيابات', grade: '2 غياب', icon: 'fa-user-slash' }
        ]
    },
    3: {
        title: 'أساسيات التسويق الرقمي',
        description: 'اكتشف أدوات واستراتيجيات التسويق الرقمي الحديثة لترويج المنتجات والخدمات عبر الإنترنت.',
        image: 'images/image3.jpg',
        color: '#FFC107',
        progress: 90,
        totalLessons: 12,
        currentLesson: 'الوحدة ١٠ - الدرس: تحليل البيانات التسويقية',
        pendingAssignments: 0,
        pendingTests: 0,
        overallGrade: 92,
        lectures: [
            { name: 'مقدمة في التسويق الرقمي', link: '#', icon: 'fa-play-circle' },
            { name: 'التسويق عبر محركات البحث (SEO)', link: '#', icon: 'fa-play-circle' },
            { name: 'التسويق عبر وسائل التواصل الاجتماعي', link: '#', icon: 'fa-play-circle' },
            { name: 'التسويق بالمحتوى', link: '#', icon: 'fa-play-circle' },
            { name: 'البريد الإلكتروني والتسويق', link: '#', icon: 'fa-play-circle' },
            { name: 'الدرس: تحليل البيانات التسويقية', link: '#', icon: 'fa-play-circle' }
        ],
        assignments: [
            { name: 'واجب تحليل حملة تسويقية', status: 'completed', link: '#', icon: 'fa-check-circle' }
        ],
        grades: [
            { name: 'المشاركة في المنتدى', grade: '95%', icon: 'fa-star' },
            { name: 'عدد الغيابات', grade: '1 غياب', icon: 'fa-user-slash' }
        ]
    },
    4: {
        title: 'تصميم قواعد البيانات SQL',
        description: 'تعلم كيفية تصميم وإنشاء وإدارة قواعد البيانات العلائقية باستخدام لغة SQL.',
        image: 'images/image4.jpg',
        color: '#9C27B0',
        progress: 25,
        totalLessons: 7,
        currentLesson: 'الوحدة ٢ - الدرس: القيود (Constraints)',
        pendingAssignments: 1,
        pendingTests: 1,
        overallGrade: 55,
        lectures: [
            { name: 'مقدمة في قواعد البيانات', link: '#', icon: 'fa-play-circle' },
            { name: 'أساسيات SQL: SELECT, FROM, WHERE', link: '#', icon: 'fa-play-circle' },
            { name: 'الدرس: القيود (Constraints)', link: '#', icon: 'fa-play-circle' }
        ],
        assignments: [
            { name: 'تمرين: استعلامات بسيطة', status: 'pending', link: '#', icon: 'fa-hourglass-half' }
        ],
        grades: [
            { name: 'اختبار الوحدة الأولى', grade: 'غير متاح بعد', icon: 'fa-hourglass' },
            { name: 'عدد الغيابات', grade: '0 غياب', icon: 'fa-user-slash' }
        ]
    },
    5: {
        title: 'مبادئ الأمن السيبراني',
        description: 'فهم التهديدات السيبرانية وكيفية حماية الأنظمة والبيانات من الاختراقات والهجمات الإلكترونية.',
        image: 'images/image5.jpg',
        color: '#E91E63',
        progress: 60,
        totalLessons: 9,
        currentLesson: 'الوحدة ٦ - الدرس: أمن الشبكات',
        pendingAssignments: 0,
        pendingTests: 1,
        overallGrade: 78,
        lectures: [
            { name: 'مقدمة للأمن السيبراني', link: '#', icon: 'fa-play-circle' },
            { name: 'أنواع الهجمات الشائعة', link: '#', icon: 'fa-play-circle' },
            { name: 'الدرس: أمن الشبكات', link: '#', icon: 'fa-play-circle' }
        ],
        assignments: [
            { name: 'واجب: تحليل حالة اختراق', status: 'completed', link: '#', icon: 'fa-check-circle' }
        ],
        grades: [
            { name: 'اختبار منتصف الدورة', grade: '70%', icon: 'fa-star' },
            { name: 'عدد الغيابات', grade: '3 غياب', icon: 'fa-user-slash' }
        ]
    }
};
module.exports = { courses };