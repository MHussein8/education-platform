const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    const courseSelect = document.getElementById('courseSelect');
    const form = document.getElementById('assignmentForm');
    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionBtn = document.getElementById('addQuestionBtn');

    // تحميل الكورسات
    db.collection('courses').get().then(snapshot => {
        snapshot.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.data().name || `كورس ${doc.id}`;
            courseSelect.appendChild(option);
        });
    });

    // إضافة سؤال جديد
    addQuestionBtn.addEventListener('click', () => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');

        questionDiv.innerHTML = `
            <hr>
            <label>نص السؤال:</label>
            <input type="text" class="questionText" required>
            <label>نوع السؤال:</label>
            <select class="questionType">
                <option value="multiple_choice">اختيار من متعدد</option>
                <option value="short_answer">إجابة قصيرة</option>
            </select>
            <label>الإجابة الصحيحة:</label>
            <input type="text" class="correctAnswer" required>
            <label>الدرجات:</label>
            <input type="number" class="points" required>
        `;

        questionsContainer.appendChild(questionDiv);
    });

    // عند إرسال النموذج
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const courseId = courseSelect.value;
        const assignmentName = document.getElementById('assignmentName').value.trim();
        const assignmentType = document.getElementById('assignmentType').value;

        if (!courseId || !assignmentName) {
            alert('برجاء اختيار الكورس وكتابة اسم الواجب.');
            return;
        }

        const questions = [];
        document.querySelectorAll('.question').forEach((qDiv, index) => {
            questions.push({
                id: index,
                text: qDiv.querySelector('.questionText').value,
                type: qDiv.querySelector('.questionType').value,
                correctAnswer: qDiv.querySelector('.correctAnswer').value,
                points: parseInt(qDiv.querySelector('.points').value)
            });
        });

        const assignmentData = {
            type: assignmentType,
            questions: questions
        };

        try {
            await db.collection('courses').doc(courseId).update({
                [`quizzesAndExams.${assignmentName}`]: assignmentData
            });
            alert('تم حفظ الواجب بنجاح!');
            form.reset();
            questionsContainer.querySelectorAll('.question').forEach(q => q.remove());
        } catch (err) {
            console.error(err);
            alert('حدث خطأ أثناء الحفظ.');
        }
    });
});
