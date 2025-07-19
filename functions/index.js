const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

exports.submitAssignment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'يجب أن تكون مسجلاً للدخول لتسليم الواجب.');
    }
    const studentUid = context.auth.uid;

    const { courseId, assignmentId, studentAnswers } = data;

    if (!courseId || !assignmentId || !studentAnswers) {
        throw new functions.https.HttpsError('invalid-argument', 'البيانات المدخلة غير مكتملة.');
    }

    try {
        const assignmentRef = db.collection('courses').doc(courseId).collection('quizzesAndExams').doc(assignmentId);
        const assignmentDoc = await assignmentRef.get();

        if (!assignmentDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'الواجب غير موجود.');
        }

        const assignmentData = assignmentDoc.data();
        const correctQuestions = assignmentData.questions;
        let totalScore = 0;
        let maxScore = 0;
        let feedback = {};

        correctQuestions.forEach(q => {
            maxScore += q.points;

            const studentAnswer = studentAnswers[q.id];
            let isCorrect = false;

            if (q.type === 'multiple_choice') {
                if (studentAnswer === q.answer) {
                    isCorrect = true;
                }
            } else if (q.type === 'short_answer') {
                const cleanedStudentAnswer = String(studentAnswer || '').trim().toLowerCase();
                const cleanedCorrectAnswer = String(q.answer || '').trim().toLowerCase();
                if (cleanedStudentAnswer === cleanedCorrectAnswer) {
                    isCorrect = true;
                }
            }

            if (isCorrect) {
                totalScore += q.points;
                feedback[q.id] = { correct: true, message: 'إجابة صحيحة' };
            } else {
                feedback[q.id] = { correct: false, message: `إجابة خاطئة. الإجابة الصحيحة هي: ${q.answer}` };
            }
        });

        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        const gradeStatus = percentage >= 50 ? 'pass' : 'fail';

        const studentRef = db.collection('students').doc(studentUid);

        await studentRef.set({
            assignmentResults: {
                [assignmentId]: {
                    courseId: courseId,
                    score: totalScore,
                    maxScore: maxScore,
                    percentage: percentage.toFixed(2),
                    status: gradeStatus,
                    submissionDate: admin.firestore.FieldValue.serverTimestamp(),
                    feedback: feedback
                }
            }
        }, { merge: true });

        return {
            success: true,
            score: totalScore,
            maxScore: maxScore,
            percentage: percentage.toFixed(2),
            status: gradeStatus,
            message: 'تم تصحيح الواجب بنجاح!',
            feedback: feedback
        };

    } catch (error) {
        console.error("خطأ في Cloud Function لتصحيح الواجب:", error);
        throw new functions.https.HttpsError('internal', error.message || 'حدث خطأ غير متوقع أثناء التصحيح.');
    }
});