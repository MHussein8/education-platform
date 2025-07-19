// admin-scripts/upload-data.js

// 1. دي مكتبة بنستخدمها عشان نقدر نتعامل مع Firebase من خلال كود Node.js
const admin = require('firebase-admin');

// 2. هنا بنقول للبرنامج فين يلاقي المفتاح بتاع مشروعك في Firebase.
// السطر اللي جاي ده مهم جداً: لازم اسم الملف اللي بين القوسين يكون هو هو بالظبط اسم ملف المفتاح اللي أنت حطيته جنب الملف ده.
// أنت قولتلي اسم الملف ده: students-platform-d3b22-firebase-adminsdk-fbsvc-ff1cdfe181.json
// يبقى هتكتبه بالظبط هنا:
const serviceAccount = require('./students-platform-d3b22-firebase-adminsdk-fbsvc-ff1cdfe181.json');

// 3. السطر ده بيشغل اتصالنا بـ Firebase باستخدام المفتاح بتاعك.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 4. السطر ده بيخلينا نقدر نتعامل مع قاعدة بيانات Firestore بتاعتنا.
const db = admin.firestore();

// 5. هنا بنجيب بيانات الكورسات اللي أنت كاتبها في ملف courses-data.js
// عشان السطر ده يشتغل صح، لازم نعمل تعديل بسيط جداً في ملف "js/courses-data.js" بتاعك.
// (هقولك إزاي تعدله في الخطوة اللي جاية دي بالظبط)
const { courses } = require('../js/courses-data.js'); 

// 6. ده كود الطالب اللي هنرفع له البيانات (لازم يكون هو هو اللي أنت دخلته في Firebase يدوياً).
const studentCode = '1001'; 

// 7. دي وظيفة (دالة) هنعملها عشان ترفع البيانات لـ Firebase.
async function uploadStudentData() {
  try {
    // بنحدد فين هنحط البيانات في Firebase (في مجموعة اسمها "students" وجواها مستند اسمه "1001")
    const studentRef = db.collection('students').doc(studentCode);

    // هنا بنقول لـ Firebase "خد البيانات دي كلها وحطها في المستند ده"
    // لو المستند موجود، هيحدثه بالبيانات دي. لو مش موجود، هيعمله.
    await studentRef.set({
      name: 'سارة محمد جمال', // هنا ممكن تغير اسم الطالب اللي هيظهر في التطبيق
      courses: courses // هنا السكريبت بياخد كل تفاصيل الكورسات من ملف courses-data.js
    });

    // ابدأ من هنا إضافة الكود الجديد
// -------------------------------------------------------------
// هذا الجزء يقوم برفع كل كورس (بما في ذلك الواجبات والاختبارات)
// إلى مجلد 'courses' المنفصل في Firebase.
for (const courseId in courses) {
  const courseData = courses[courseId];
  await db.collection('courses').doc(courseId).set(courseData);
  console.log(`✅ تم رفع الكورس "${courseData.title}" إلى collection 'courses'.`);
}
// -------------------------------------------------------------
// انتهى الكود الجديد

    // لو كل حاجة تمام، هتظهر الرسالة دي في الشاشة
    console.log(`🎉 بيانات الطالب ${studentCode} تم رفعها بنجاح مع جميع الكورسات!`);
  } catch (error) {
    // لو فيه أي مشكلة، هتظهر رسالة الخطأ دي
    console.error('❌ حدث خطأ أثناء رفع البيانات:', error);
  }
}

// 8. السطر ده بيشغل الوظيفة اللي عملناها فوق عشان تبدأ ترفع البيانات.
uploadStudentData();