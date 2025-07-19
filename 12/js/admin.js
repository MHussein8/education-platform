// admin.js

// *************************************************************************
// * تم إزالة السطر 'const db = firebase.firestore();' من هنا            *
// * لأنه تم تعريفه بالفعل في firebase-init.js ليكون متاحًا بشكل عام.    *
// * تأكد أن ملف firebase-init.js يتم تحميله قبل admin.js في admin.html  *
// *************************************************************************

// تحقق من أن Firebase مهيأ قبل البدء
// ملاحظة: هذا التحقق مهم ولكنه لم يعد يظهر خطأ "firebase is not defined"
// بمجرد تحميل Firebase SDKs بشكل صحيح.
if (typeof firebase === 'undefined' || !firebase.apps.length || typeof db === 'undefined') {
    console.error("Firebase أو Firestore لم يتم تهيئتهما بشكل صحيح. يرجى التأكد من تضمين firebase-init.js بشكل صحيح.");
    // يمكن هنا إعادة التوجيه أو إظهار رسالة خطأ للمستخدم
}

// db هو الآن متغير عام قادم من firebase-init.js
// لذلك لا نعيد تعريفه هنا.

document.addEventListener('DOMContentLoaded', () => {
    const assignmentForm = document.getElementById('assignmentForm');
    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    let questionCounter = 0; // لتعقب عدد الأسئلة وتوليد معرفات فريدة

    // 1. وظيفة لإضافة سؤال جديد (ديناميكيًا)
    function addQuestion(initialQuestionData = null) {
        const currentQuestionId = questionCounter++;

        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        questionItem.setAttribute('data-question-id', currentQuestionId);
        questionItem.innerHTML = `
            <button type="button" class="remove-question-btn">حذف السؤال</button>
            <div class="form-group">
                <label for="questionText_${currentQuestionId}">نص السؤال:</label>
                <textarea id="questionText_${currentQuestionId}" placeholder="اكتب نص السؤال هنا..." required>${initialQuestionData ? initialQuestionData.text : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="questionPoints_${currentQuestionId}">عدد النقاط:</label>
                <input type="number" id="questionPoints_${currentQuestionId}" min="1" value="${initialQuestionData ? initialQuestionData.points : 1}" required>
            </div>
            <div class="form-group">
                <label>نوع السؤال:</label>
                <select class="question-type-select" data-question-id="${currentQuestionId}">
                    <option value="multiple-choice" ${initialQuestionData && initialQuestionData.type === 'multiple-choice' ? 'selected' : ''}>اختيار من متعدد</option>
                    <option value="text-answer" ${initialQuestionData && initialQuestionData.type === 'text-answer' ? 'selected' : ''}>إجابة نصية (مقال)</option>
                </select>
            </div>
            <div class="multiple-choice-options" id="optionsContainer_${currentQuestionId}" style="${initialQuestionData && initialQuestionData.type === 'text-answer' ? 'display:none;' : ''}">
                <label>خيارات الإجابة:</label>
                </div>
            <div class="text-answer-field" id="answerTextContainer_${currentQuestionId}" style="${initialQuestionData && initialQuestionData.type === 'multiple-choice' ? 'display:none;' : ''}">
                <label>الإجابة الصحيحة (للسؤال المقالي):</label>
                <input type="text" placeholder="اكتب الإجابة الصحيحة هنا..." value="${initialQuestionData && initialQuestionData.type === 'text-answer' ? initialQuestionData.correctAnswer : ''}">
            </div>
        `;
        questionsContainer.appendChild(questionItem);

        const optionsContainer = questionItem.querySelector(`#optionsContainer_${currentQuestionId}`);
        const questionTypeSelect = questionItem.querySelector('.question-type-select');

        // إضافة مستمعي الأحداث للعناصر الجديدة فور إنشائها
        questionItem.querySelector('.remove-question-btn').addEventListener('click', (event) => {
            event.target.closest('.question-item').remove();
        });

        questionTypeSelect.addEventListener('change', (event) => {
            toggleQuestionTypeFields(event.target, currentQuestionId);
        });

        // إذا كان السؤال جديدًا (وليس من البيانات الأولية)، تأكد من أن الحقول الصحيحة مرئية
        if (initialQuestionData === null) {
            toggleQuestionTypeFields(questionTypeSelect, currentQuestionId);
        }

        // إضافة خيارات الإجابة الافتراضية / الموجودة
        if (initialQuestionData && initialQuestionData.type === 'multiple-choice' && initialQuestionData.options.length > 0) {
            initialQuestionData.options.forEach((option, index) => {
                addOptionToQuestion(currentQuestionId, optionsContainer, option.text, option.isCorrect, index);
            });
        } else if (initialQuestionData === null || initialQuestionData.type === 'multiple-choice') {
            // أضف خيارًا واحدًا افتراضيًا إذا لم يكن هناك بيانات أولية أو كان نوع السؤال MC
            addOptionToQuestion(currentQuestionId, optionsContainer);
        }

        // إضافة زر "إضافة خيار" لكل سؤال متعدد الاختيارات
        // تأكد من أن هذا الزر يتم إضافته مرة واحدة فقط لكل optionsContainer
        let addOptionButton = optionsContainer.querySelector('.add-option-btn-for-question');
        if (!addOptionButton && questionTypeSelect.value === 'multiple-choice') {
            addOptionButton = document.createElement('button');
            addOptionButton.type = 'button';
            addOptionButton.classList.add('add-option-btn', 'add-option-btn-for-question'); // فئة إضافية للتمييز
            addOptionButton.textContent = 'إضافة خيار لهذا السؤال';
            optionsContainer.appendChild(addOptionButton);

            addOptionButton.addEventListener('click', () => {
                const currentOptionCount = optionsContainer.querySelectorAll('.option-group').length;
                addOptionToQuestion(currentQuestionId, optionsContainer, '', false, currentOptionCount);
            });
        }
    }

    // 2. وظيفة لإضافة خيار إجابة لسؤال متعدد الاختيارات
    function addOptionToQuestion(questionId, optionsContainer, optionText = '', isCorrect = false, optionIndex = 0) {
        const optionGroup = document.createElement('div');
        optionGroup.classList.add('option-group');
        // تأكد من أن قيمة value للراديو فريدة تمامًا، ليس فقط name
        // استخدم questionId مع وقت حالي وعشوائية لضمان التفرد المطلق لكل خيار
        const uniqueOptionValue = `option_${questionId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        optionGroup.innerHTML = `
            <input type="radio" name="correctAnswer_${questionId}" value="${uniqueOptionValue}" ${isCorrect ? 'checked' : ''}>
            <input type="text" placeholder="الخيار" value="${optionText}">
            <button type="button" class="remove-option-btn">حذف</button>
        `;
        // أضف الخيار قبل زر "إضافة خيار" إذا كان موجوداً
        const addOptionButton = optionsContainer.querySelector('.add-option-btn-for-question');
        if (addOptionButton) {
            optionsContainer.insertBefore(optionGroup, addOptionButton);
        } else {
            optionsContainer.appendChild(optionGroup);
        }

        // إضافة مستمع حدث لزر حذف الخيار
        optionGroup.querySelector('.remove-option-btn').addEventListener('click', (event) => {
            event.target.closest('.option-group').remove();
        });
    }

    // 3. وظيفة للتبديل بين حقول نوع السؤال (اختيار من متعدد / إجابة نصية)
    function toggleQuestionTypeFields(selectElement, questionId) {
        const selectedType = selectElement.value;
        const optionsContainer = document.getElementById(`optionsContainer_${questionId}`);
        const answerTextContainer = document.getElementById(`answerTextContainer_${questionId}`);

        // زر إضافة خيار لهذا السؤال
        let addOptionButton = optionsContainer.querySelector('.add-option-btn-for-question');

        if (selectedType === 'multiple-choice') {
            optionsContainer.style.display = 'block';
            answerTextContainer.style.display = 'none';
            // تأكد من وجود زر إضافة خيار
            if (!addOptionButton) {
                addOptionButton = document.createElement('button');
                addOptionButton.type = 'button';
                addOptionButton.classList.add('add-option-btn', 'add-option-btn-for-question');
                addOptionButton.textContent = 'إضافة خيار لهذا السؤال';
                optionsContainer.appendChild(addOptionButton);
                addOptionButton.addEventListener('click', () => {
                    const currentOptionCount = optionsContainer.querySelectorAll('.option-group').length;
                    addOptionToQuestion(questionId, optionsContainer, '', false, currentOptionCount);
                });
            }
        } else if (selectedType === 'text-answer') {
            optionsContainer.style.display = 'none';
            answerTextContainer.style.display = 'block';
            // إزالة زر إضافة خيار إذا كان موجوداً
            if (addOptionButton) {
                addOptionButton.remove();
            }
        }
    }

    // إضافة السؤال الافتراضي الأول عند تحميل الصفحة
    // تأكد من أننا نبدأ دائمًا بسؤال واحد على الأقل
    if (questionsContainer.children.length === 0) {
        addQuestion();
    } else {
        // إذا كان هناك سؤال افتراضي في HTML، قم بتهيئة مستمعي الأحداث له
        const initialQuestionItem = questionsContainer.querySelector('.question-item');
        if (initialQuestionItem) {
            const initialQuestionId = initialQuestionItem.getAttribute('data-question-id');
            initialQuestionItem.querySelector('.remove-question-btn').addEventListener('click', (event) => {
                event.target.closest('.question-item').remove();
            });
            const questionTypeSelect = initialQuestionItem.querySelector('.question-type-select');
            questionTypeSelect.addEventListener('change', (event) => {
                toggleQuestionTypeFields(event.target, initialQuestionId);
            });
            // تهيئة زر إضافة خيار للسؤال الأول إذا كان نوعه MC
            if (questionTypeSelect.value === 'multiple-choice') {
                const optionsContainer = initialQuestionItem.querySelector(`#optionsContainer_${initialQuestionId}`);
                let addOptionButton = optionsContainer.querySelector('.add-option-btn-for-question');
                if (!addOptionButton) {
                    addOptionButton = document.createElement('button');
                    addOptionButton.type = 'button';
                    addOptionButton.classList.add('add-option-btn', 'add-option-btn-for-question');
                    addOptionButton.textContent = 'إضافة خيار لهذا السؤال';
                    optionsContainer.appendChild(addOptionButton);
                    addOptionButton.addEventListener('click', () => {
                        const currentOptionCount = optionsContainer.querySelectorAll('.option-group').length;
                        addOptionToQuestion(initialQuestionId, optionsContainer, '', false, currentOptionCount);
                    });
                }
                // إضافة خيار افتراضي إذا لم يكن موجودًا
                if (optionsContainer.querySelectorAll('.option-group').length === 0) {
                    addOptionToQuestion(initialQuestionId, optionsContainer);
                }
            }
        }
    }


    // مستمع حدث لزر "إضافة سؤال جديد" الرئيسي
    addQuestionBtn.addEventListener('click', () => addQuestion());

    // 4. معالجة إرسال النموذج
    assignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // منع الإرسال الافتراضي للنموذج

        const assignmentTitle = document.getElementById('assignmentTitle').value;
        const contentType = document.getElementById('contentType').value;
        const courseSelect = document.getElementById('courseSelect').value;
        const publishDate = document.getElementById('publishDate').value;
        const dueDate = document.getElementById('dueDate').value;
        const description = document.getElementById('description').value;

        // التحقق من الحقول المطلوبة
        if (!assignmentTitle || !contentType || !courseSelect || !publishDate) {
            alert('من فضلك املأ جميع الحقول المطلوبة (العنوان، النوع، الكورس، تاريخ النشر).');
            return;
        }

        const questions = [];
        const questionItems = questionsContainer.querySelectorAll('.question-item');

        try { // استخدام try-catch هنا لالتقاط الأخطاء التي يتم إلقاؤها داخل forEach
            questionItems.forEach((item, index) => {
                const qId = item.getAttribute('data-question-id');
                const questionText = item.querySelector(`textarea[id="questionText_${qId}"]`).value;
                const questionPoints = parseInt(item.querySelector(`input[id="questionPoints_${qId}"]`).value); // إضافة نقاط السؤال
                const questionType = item.querySelector(`.question-type-select[data-question-id="${qId}"]`).value;

                // التحقق من أن نص السؤال ليس فارغًا
                if (!questionText.trim()) {
                    alert(`السؤال رقم ${index + 1} فارغ. من فضلك أدخل نص السؤال.`);
                    throw new Error("Question text is empty."); // توقف عملية الإرسال
                }
                if (isNaN(questionPoints) || questionPoints <= 0) {
                    alert(`السؤال رقم ${index + 1} يجب أن يحتوي على عدد نقاط صحيح وموجب.`);
                    throw new Error("Invalid points for question.");
                }

                let questionData = {
                    id: index, // ترتيب السؤال
                    text: questionText,
                    type: questionType,
                    points: questionPoints // إضافة نقاط السؤال هنا
                };

                if (questionType === 'multiple-choice') {
                    const options = [];
                    const optionGroups = item.querySelectorAll(`#optionsContainer_${qId} .option-group`);
                    let correctAnswerRadio = item.querySelector(`input[name="correctAnswer_${qId}"]:checked`);
                    let correctAnswerValue = correctAnswerRadio ? correctAnswerRadio.value : null;

                    if (!correctAnswerValue) {
                        alert(`السؤال رقم ${index + 1} من نوع اختيار من متعدد ولم يتم تحديد إجابة صحيحة له. من فضلك حدد إجابة صحيحة.`);
                        throw new Error("No correct answer selected for multiple choice question.");
                    }

                    optionGroups.forEach((optionGroup) => {
                        const optionText = optionGroup.querySelector('input[type="text"]').value;
                        const radioInput = optionGroup.querySelector('input[type="radio"]');
                        const optionActualValue = radioInput ? radioInput.value : ''; // احصل على القيمة الفعلية من الـ DOM

                        const isCorrect = (optionActualValue === correctAnswerValue); // قارن بالقيمة الفعلية

                        if (!optionText.trim()) { // التحقق من أن الخيار ليس فارغًا
                            alert(`أحد الخيارات في السؤال رقم ${index + 1} فارغ. من فضلك املأ جميع الخيارات.`);
                            throw new Error("Empty option for multiple choice question.");
                        }
                        options.push({
                            text: optionText,
                            isCorrect: isCorrect
                        });
                    });

                    if (options.length === 0) {
                        alert(`السؤال رقم ${index + 1} من نوع اختيار من متعدد وليس لديه أي خيارات. من فضلك أضف خيارات.`);
                        throw new Error("No options for multiple choice question."); // توقف عملية الإرسال
                    }


                    questionData.options = options;
                    questionData.correctAnswer = options.find(opt => opt.isCorrect)?.text || ''; // حفظ نص الإجابة الصحيحة

                } else if (questionType === 'text-answer') {
                    const correctAnswer = item.querySelector(`#answerTextContainer_${qId} input[type="text"]`).value;
                    if (!correctAnswer.trim()) { // التحقق من أن الإجابة الصحيحة ليست فارغة
                         alert(`السؤال رقم ${index + 1} من نوع إجابة نصية ويجب أن يحتوي على إجابة صحيحة.`);
                         throw new Error("Short answer question has no correct answer.");
                    }
                    questionData.correctAnswer = correctAnswer;
                }
                questions.push(questionData);
            });
        } catch (error) {
            console.error("خطأ في بيانات الأسئلة:", error);
            return; // توقف العملية إذا كان هناك خطأ في الأسئلة
        }

        // التحقق من وجود أسئلة على الأقل
        if (questions.length === 0) {
            alert('من فضلك أضف سؤالًا واحدًا على الأقل للواجب/الاختبار.');
            return;
        }

        // توليد ID فريد للواجب الجديد
        const newAssignmentId = db.collection('courses').doc().id; // استخدام معرف وثيقة عشوائي كـ ID للواجب

        // بناء الكائن الذي سيتم حفظه في Firebase
        const assignmentData = {
            title: assignmentTitle, // استخدام 'title' ليتوافق مع app.js
            contentType: contentType, // 'assignment' أو 'exam' - استخدام 'contentType' ليتوافق مع app.js
            publishDate: firebase.firestore.Timestamp.fromDate(new Date(publishDate)), // تحويل التاريخ لسلسلة نصية إلى Timestamp
            dueDate: dueDate ? firebase.firestore.Timestamp.fromDate(new Date(dueDate)) : null, // يمكن أن يكون فارغًا
            description: description,
            questions: questions,
            createdAt: firebase.firestore.FieldValue.serverTimestamp() // وقت إنشاء الواجب
        };

        try {
await db.collection('assignments_and_exams').doc(newAssignmentId).set({
    ...assignmentData,
    courseId: courseSelect
});

            alert('✅ تم إنشاء الواجب/الاختبار بنجاح!');
            console.log("Document written with ID: ", newAssignmentId);
            assignmentForm.reset(); // إعادة تعيين النموذج بعد النجاح
            questionsContainer.innerHTML = ''; // مسح الأسئلة الموجودة
            questionCounter = 0; // إعادة تعيين العداد
            addQuestion(); // إضافة سؤال افتراضي جديد للبدء
        } catch (e) {
            console.error("❌ خطأ في إضافة المستند: ", e);
            alert('حدث خطأ أثناء إنشاء الواجب/الاختبار. يرجى المحاولة مرة أخرى.');
        }
    });

    // 5. وظيفة لملء قائمة الكورسات ديناميكيًا (اختياري ولكن موصى به)
    async function populateCoursesDropdown() {
        const courseSelect = document.getElementById('courseSelect');
        // مسح الخيارات الحالية (باستثناء الخيار الأول الافتراضي)
        while (courseSelect.options.length > 1) { // يبدأ من 1 للحفاظ على "-- اختر كورسًا --"
            courseSelect.remove(1);
        }

        try {
            // افترض أن لديك مجموعة تسمى 'courses' في Firestore
            const coursesSnapshot = await db.collection('courses').get();
            if (coursesSnapshot.empty) {
                console.warn("مجموعة الكورسات فارغة أو غير موجودة في Firestore.");
                // يمكن إضافة خيارات افتراضية إذا لم يتم العثور على كورسات
                // أو رسالة للمستخدم
            }
            coursesSnapshot.forEach(doc => {
                const courseData = doc.data();
                const option = document.createElement('option');
                option.value = doc.id; // استخدم معرف المستند كقيمة
                option.textContent = courseData.name || 'كورس غير مسمى'; // افترض أن الكورس لديه حقل 'name'
                courseSelect.appendChild(option);
            });
        } catch (error) {
            console.error("خطأ في جلب الكورسات:", error);
            alert('حدث خطأ أثناء جلب قائمة الكورسات.');
        }
    }

    // استدعاء دالة ملء الكورسات عند تحميل الصفحة
    populateCoursesDropdown();
});