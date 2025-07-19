// import_students.js
const admin = require('firebase-admin');

// تأكد من أن هذا المسار صحيح لملف مفتاح حساب الخدمة الخاص بك
// يجب أن يكون الملف بنفس المجلد الذي يوجد به هذا السكربت
const serviceAccount = require('./students-platform-d3b22-firebase-adminsdk-fbsvc-a34a3de4e0.json'); // <<<<<<< هام جداً: غيّر هذا الاسم

// تأكد من أن هذا المسار صحيح لملف students.json الخاص بك
// يجب أن يكون الملف بنفس المجلد الذي يوجد به هذا السكربت
const studentsData = require('./students.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importStudents() {
  console.log('بدء عملية استيراد البيانات...');
  let importedCount = 0;

  // حلقة تمر على كل طالب في ملف students.json
  for (const studentCode in studentsData) {
    // نتأكد أن الخاصية تخص الطالب وليست جزءًا من prototype
    if (Object.prototype.hasOwnProperty.call(studentsData, studentCode)) {
      const studentData = studentsData[studentCode];
      try {
        // إضافة بيانات الطالب إلى collection 'students' باستخدام كود الطالب كـ ID
        await db.collection('students').doc(studentCode).set(studentData);
        console.log(`تم استيراد الطالب بنجاح: ${studentCode}`);
        importedCount++;
      } catch (error) {
        console.error(`خطأ أثناء استيراد الطالب ${studentCode}:`, error);
      }
    }
  }
  console.log(`انتهت عملية استيراد البيانات. إجمالي عدد الطلاب الذين تم استيرادهم: ${importedCount}`);
}

// استدعاء الدالة لبدء عملية الاستيراد
importStudents();