const admin = require('firebase-admin');
const serviceAccount = require('./students-platform-d3b22-firebase-adminsdk-fbsvc-a34a3de4e0.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('جاري جلب الطلاب والواجبات... يرجى الانتظار');

async function gradePendingAssignments() {
  console.log('بدء التصحيح التلقائي...');

  try {
    const students = await db.collection('students').get();

    for (const studentDoc of students.docs) {
      const studentId = studentDoc.id;

      const submissions = await db.collection('students')
        .doc(studentId)
        .collection('submissions')
        .where('isGraded', '==', false)
        .get();

      for (const submissionDoc of submissions.docs) {
        const submissionData = submissionDoc.data();
        const assignmentId = submissionDoc.id;

        const assignment = await db.collection('assignments_and_exams')
          .doc(assignmentId)
          .get();

        if (!assignment.exists) continue;

        let score = 0;
        let maxScore = 0;
        const questions = assignment.data().questions || [];

        console.log("أسئلة الواجب:", questions);

        for (const question of questions) {
          // التحقق من وجود نقاط السؤال وتحديد قيمة افتراضية (5) إذا كانت غير معرّفة
          const points = Number(question.points) || 5;
          maxScore += points;

          const studentAnswer = submissionData.studentAnswers?.[question.id?.toString()] || "";
          
          console.log("------ فحص السؤال ------");
          console.log("معرف السؤال:", question.id, "نوعه:", typeof question.id);
          console.log("إجابة الطالب:", studentAnswer);
          console.log("النقاط المخصصة:", points);

          if (question.type === "multiple-choice") {
            const correctOption = question.options?.find(opt => opt.isCorrect);
            console.log("الإجابة الصحيحة (اختيار):", correctOption?.text);
            
            if (correctOption && studentAnswer.trim().toLowerCase() === correctOption.text.trim().toLowerCase()) {
              score += points;
              console.log(`تم منح ${points} نقاط`);
            }
          } else if (question.type === "text-answer") {
            const correctAnswer = question.correctAnswer || "";
            console.log("الإجابة الصحيحة (نص):", correctAnswer);
            
            if (studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
              score += points;
              console.log(`تم منح ${points} نقاط`);
            } else {
              const halfPoints = Math.round(points * 0.5);
              score += halfPoints;
              console.log(`تم منح نصف النقاط (${halfPoints} نقطة)`);
            }
          }
        }

        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

        await submissionDoc.ref.update({
          isGraded: true,
          score: score,
          maxScore: maxScore,
          grade: percentage,
          gradeStatus: percentage >= 50 ? 'pass' : 'fail',
          gradedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`تم تصحيح واجب ${assignmentId} للطالب ${studentId}: ${score}/${maxScore} (${percentage}%)`);
      }
    }
  } catch (error) {
    console.error('حدث خطأ:', error);
  }

  console.log('╔══════════════════════════╗');
  console.log('║    تم تصحيح جميع الواجبات    ║');
  console.log('╚══════════════════════════╝');
  console.log('النتائج ظاهرة في Firebase Firestore تحت:');
  console.log('students -> [student_id] -> submissions');
}

gradePendingAssignments();