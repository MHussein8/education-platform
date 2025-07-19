let courses = {};

document.addEventListener('DOMContentLoaded', function() {
    const coursesOverviewSection = document.getElementById('coursesOverview');
    const coursesGrid = document.getElementById('coursesGrid');
    const courseDetailsSection = document.getElementById('courseDetailsSection');
    const courseTitleElement = document.getElementById('courseTitle');
    const courseDescriptionElement = document.getElementById('courseDescription');
    const lecturesList = document.getElementById('lecturesList');
    // const assignmentsList = document.getElementById('assignmentsList'); // هذا العنصر غير مستخدم مباشرة الآن
    const gradesList = document.getElementById('gradesList');

    const assignmentsSection = document.querySelector('.assignments-section');
    const assignmentList = document.querySelector('.assignment-list'); // هذا هو العنصر الذي سيحتوي قائمة الواجبات
    const assignmentDetails = document.querySelector('.assignment-details');
    const assignmentTitle = document.getElementById('assignment-title');
    const questionsContainer = document.querySelector('.questions-container');
    const submitAssignmentBtn = document.getElementById('submit-assignment');
    const cancelAssignmentBtn = document.getElementById('cancel-assignment');
    const assignmentFeedbackDiv = document.getElementById('assignment-feedback');

    let currentCourseId = null; // لتتبع الكورس الذي يعرض واجباته حاليا
    let currentAssignmentId = null; // لتتبع الواجب الذي يتم حله حاليا
    let currentAssignmentData = null; // لتخزين بيانات الواجب الكاملة للوصول إليها لاحقاً

    const urlParams = new URLSearchParams(window.location.search);
    const studentCode = urlParams.get('code'); // نستخدم studentCode كـ studentUid
    
    // عناصر معلومات الطالب في الهيدر (أضف ID لها في HTML إذا لم تكن موجودة)
    const studentNameHeader = document.getElementById('studentName'); // تأكد من إضافة id="studentName" في <p>أهلاً بك يا ...
    const studentGradeHeader = document.getElementById('studentGrade'); // تأكد من إضافة id="studentGrade"
    const studentCodeHeader = document.getElementById('studentCode'); // تأكد من إضافة id="studentCode"


    if (!studentCode) {
        console.error("No student code found in URL");
        displayErrorMessage("كود الطالب غير موجود في الرابط!");
        return;
    }

    db.collection("students").doc(studentCode).get()
        .then(doc => {
            if (!doc.exists) {
                console.error("No student found with code:", studentCode);
                displayErrorMessage("كود الطالب غير صحيح أو غير موجود.");
                return;
            }

            const studentData = doc.data();
            // تحديث معلومات الطالب في رأس الصفحة
            if (studentNameHeader) studentNameHeader.textContent = studentData.name || "طالب";
            if (studentGradeHeader) studentGradeHeader.textContent = studentData.grade || "غير محدد";
            if (studentCodeHeader) studentCodeHeader.textContent = `كود الطالب: ${studentCode}`;
            
            // تحديث الفقرة العامة في الهيدر
            document.querySelector("header p").textContent = `أهلاً بك يا ${studentData.name || 'طالب'}! استعرض دوراتك التدريبية وتقدمك.`;

            if (!studentData.courses) {
                console.error("No courses found for student");
                coursesGrid.innerHTML = '<p>لا توجد دورات تدريبية متاحة لهذا الطالب حاليًا.</p>';
                return;
            }

            // هنا يجب أن تتأكد أن 'courses' في وثيقة الطالب هو ماب أو كائن يحتوي على معرفات الكورسات وليس فقط مصفوفة
            // إذا كانت 'courses' مجرد مصفوفة من IDs، فستحتاج لجلب تفاصيل كل كورس على حدة.
            // بناءً على الكود الحالي، يبدو أن `courses` في وثيقة الطالب هو كائن حيث المفتاح هو الـ ID والقيمة هي بيانات الكورس
            courses = studentData.courses; //
            renderCourseCards();
        })
        .catch(error => {
            console.error("Error loading student data:", error);
            displayErrorMessage("حدث خطأ أثناء تحميل بيانات الطالب. يرجى المحاولة لاحقاً.");
        });

    function renderCourseCards() {
        if (!courses || Object.keys(courses).length === 0) {
            console.error("No courses data available");
            coursesGrid.innerHTML = '<p>لا توجد دورات تدريبية متاحة حاليًا.</p>';
            return;
        }

        coursesGrid.innerHTML = '';
        
        for (const id in courses) {
            const course = courses[id];
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('course-card');
            cardDiv.dataset.courseId = id;
            cardDiv.dataset.color = course.color;
            cardDiv.style.setProperty('--card-accent-color', course.color);

            let progressTextColor = 'var(--primary-text-color)';
            if (course.progress < 30) progressTextColor = 'var(--danger-color)';
            else if (course.progress < 70) progressTextColor = 'var(--warning-color)';

            let gradeClass = '';
            if (course.overallGrade >= 85) gradeClass = 'excellent';
            else if (course.overallGrade >= 70) gradeClass = 'good';
            else if (course.overallGrade >= 50) gradeClass = 'average';
            else gradeClass = 'poor';

            cardDiv.innerHTML = `
                <img src="${course.image}" alt="${course.title}" style="height:120px">
                <div class="card-content">
                    <h3 style="font-size:1.4em;margin-bottom:8px">${course.title}</h3>
                    <div class="course-notifications">
                        <div class="notification-item combined-tasks">
                            <span>
                                <i class="fas fa-tasks"></i> ${course.pendingAssignments} واجبات
                                <span class="separator">|</span>
                                <i class="fas fa-file-alt"></i> ${course.pendingTests} اختبارات
                            </span>
                        </div>
                        <div class="notification-item combined-lessons">
                            <span>
                                <i class="fas fa-book"></i> ${course.totalLessons} حصص
                                <span class="separator">|</span>
                                <i class="fas fa-bullseye"></i> ${course.currentLesson.split('-')[1].trim()}
                            </span>
                        </div>
                    </div>
                    <div class="progress-container" title="النسبة المكتملة: ${course.progress}%">
                        <div class="progress-bar" style="width: ${course.progress}%;"></div>
                    </div>
                    <div class="progress-text" style="color: ${progressTextColor};">
                        تقدم الكورس: ${course.progress}%
                    </div>
                    <div class="grade-container">
                        <div class="grade-circle ${gradeClass}">
                            ${course.overallGrade !== undefined ? course.overallGrade + '%' : 'N/A'}
                        </div>
                        <div class="grade-label">التقييم الكلي</div>
                    </div>
                    <button class="view-details-btn" data-course-id="${id}">
                        <i class="fas fa-info-circle"></i> عرض التفاصيل
                    </button>
                </div>
            `;
            
            coursesGrid.appendChild(cardDiv);
        }

        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const courseId = this.dataset.courseId;
                showCourseDetails(courseId);
            });
        });
    }

    async function showCourseDetails(courseId) { // أضف async هنا
        if (!courses[courseId]) {
            console.error("Course not found:", courseId);
            return;
        }

        const course = courses[courseId];
        courseTitleElement.textContent = course.title;
        courseDescriptionElement.textContent = course.description;

        lecturesList.innerHTML = '';
        // assignmentList.innerHTML = ''; // سيتم مسحها بواسطة displayQuizzesAndExams
        gradesList.innerHTML = '';

        course.lectures.forEach(lec => {
            const li = document.createElement('li');
            li.innerHTML = `<span><i class="fas ${lec.icon}"></i> ${lec.name}</span> <a href="${lec.link}" target="_blank">عرض <i class="fas fa-external-link-alt"></i></a>`;
            lecturesList.appendChild(li);
        });

        // تم نقل هذا الجزء ليتم التعامل معه بواسطة displayQuizzesAndExams
        // course.assignments.forEach(assign => {
        //     const li = document.createElement('li');
        //     const statusClass = assign.status === 'completed' ? 'completed' : 'pending';
        //     li.innerHTML = `<span><i class="fas ${assign.icon}"></i> ${assign.name}</span> <span><span class="status-tag ${statusClass}">${assign.status === 'completed' ? 'تم الانتهاء' : 'مطلوب'}</span> <a href="${assign.link}" target="_blank">ابـدأ <i class="fas fa-external-link-alt"></i></a></span>`;
        //     assignmentsList.appendChild(li);
        // });

        course.grades.forEach(grade => {
            const li = document.createElement('li');
            li.innerHTML = `<span><i class="fas ${grade.icon}"></i> ${grade.name}</span> <span>الدرجة: ${grade.grade}</span>`;
            gradesList.appendChild(li);
        });

        // استدعاء الدالة لجلب وعرض الواجبات والاختبارات من Firestore
        await displayQuizzesAndExams(courseId); // تأكد من استخدام await هنا

        coursesOverviewSection.style.display = 'none';
        document.getElementById('mainDashboardHeader').style.display = 'none';
        courseDetailsSection.style.display = 'block';
    }

async function displayQuizzesAndExams(courseId) {
    console.log("جاري جلب الواجبات...");
    assignmentList.innerHTML = '<p>جاري التحميل...</p>';
    
    try {
        // جلب الواجبات من Firestore
        const assignmentsQuery = await db.collection('assignments_and_exams')
                                    .where('courseId', '==', courseId)
                                    .get();

        // جلب حالة التسليم من مجموعة submissions
        const submissionsQuery = await db.collection('students')
                                     .doc(studentCode)
                                     .collection('submissions')
                                     .get();

        if (assignmentsQuery.empty) {
            assignmentList.innerHTML = '<p>لا توجد واجبات متاحة</p>';
            return;
        }

        assignmentList.innerHTML = '';
        
        assignmentsQuery.forEach(assignmentDoc => {
            const assignment = assignmentDoc.data();
            const submission = submissionsQuery.docs.find(doc => doc.id === assignmentDoc.id);
            
            let status = 'not_started';
            let grade = null;
            
            if (submission) {
                status = submission.data().isGraded ? 'graded' : 'submitted';
                grade = submission.data().grade;
            }

            const assignmentElement = document.createElement('div');
            assignmentElement.className = 'assignment-card';
            
            let buttonHtml = '';
            if (status === 'not_started') {
                buttonHtml = `<button class="start-assignment" data-id="${assignmentDoc.id}">بدء الواجب</button>`;
            } else if (status === 'submitted') {
                buttonHtml = `<button class="submitted-btn" disabled>في انتظار التصحيح</button>`;
            } else if (status === 'graded') {
                buttonHtml = `<button class="graded-btn" disabled>تم التصحيح - الدرجة: ${grade}%</button>`;
            }

// تحويل نوع المحتوى لنص عربي
let contentTypeText = 'واجب';
if (assignment.contentType === 'exam') contentTypeText = 'اختبار';

assignmentElement.innerHTML = `
    <h3>${assignment.title} <span class="content-type">(${contentTypeText})</span></h3>
    <p>عدد الأسئلة: ${assignment.questions.length}</p>
    ${buttonHtml}
`;
            
            assignmentList.appendChild(assignmentElement);
        });

        // إضافة event listeners للأزرار الجديدة
        document.querySelectorAll('.start-assignment').forEach(btn => {
            btn.addEventListener('click', async () => {
                const assignmentId = btn.dataset.id;
                await startAssignment(courseId, assignmentId);
            });
        });

    } catch (error) {
        console.error("Error loading assignments:", error);
        assignmentList.innerHTML = '<p>حدث خطأ في تحميل الواجبات</p>';
    }
}

// واستبدل دالة startAssignment بهذا:
async function startAssignment(courseId, assignmentId) {
        currentCourseId = courseId; // أضف هذا السطر
    currentAssignmentId = assignmentId; // أضف هذا السطر
    try {
        console.log("جاري تحميل الواجب...");
        const assignmentDoc = await db.collection('assignments_and_exams').doc(assignmentId).get();
        
        if (!assignmentDoc.exists) {
            alert("الواجب غير موجود");
            return;
        }

        currentAssignmentData = assignmentDoc.data();
        assignmentTitle.textContent = currentAssignmentData.title;
        questionsContainer.innerHTML = '';

        currentAssignmentData.questions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'question-item';
            questionElement.innerHTML = `
                <p><strong>السؤال ${index + 1}:</strong> ${question.text} (${question.points} نقطة)</p>
                <div class="question-input" data-question-id="${question.id}">
                    ${renderQuestionInput(question)}
                </div>
            `;
            questionsContainer.appendChild(questionElement);
        });

        assignmentList.classList.add('hidden');
        assignmentDetails.classList.remove('hidden');

    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ في تحميل الواجب");
    }
}

function renderQuestionInput(question) {
    // تحويل أنواع الأسئلة لتكون متوافقة
    const questionType = question.type === 'multiple-choice' ? 'multiple_choice' : 
                        question.type === 'text-answer' ? 'short_answer' : 
                        question.type;

    if (questionType === 'multiple_choice') {
        let optionsHtml = '';
        if (question.options && question.options.length > 0) {
            question.options.forEach(option => {
                optionsHtml += `
                    <label>
                        <input type="radio" name="q_${question.id}" value="${option.text}">
                        ${option.text}
                    </label><br>
                `;
            });
        } else {
            optionsHtml = '<p>لا توجد خيارات متاحة لهذا السؤال.</p>';
        }
        return optionsHtml;
    } else if (questionType === 'short_answer') {
        return `<textarea name="q_${question.id}" rows="3" placeholder="اكتب إجابتك هنا..."></textarea>`;
    }
    return '<p>نوع السؤال غير مدعوم.</p>';
}

    window.showCoursesOverview = function() {
        courseDetailsSection.style.display = 'none';
        document.getElementById('mainDashboardHeader').style.display = 'block';
        coursesOverviewSection.style.display = 'block';
    };

submitAssignmentBtn.addEventListener('click', async () => {
    const studentAnswers = {};
    let hasAnswers = false;

    // جمع الإجابات
    document.querySelectorAll('.question-item').forEach((questionItem, index) => {
        const questionId = currentAssignmentData.questions[index].id;
        
        // معالجة إجابة الاختيار من متعدد
        const radioSelected = questionItem.querySelector(`input[name="q_${questionId}"]:checked`);
        if (radioSelected) {
            studentAnswers[questionId] = radioSelected.value;
            hasAnswers = true;
        }
        
        // معالجة إجابة النص القصير
        const textAnswer = questionItem.querySelector(`textarea[name="q_${questionId}"]`);
        if (textAnswer && textAnswer.value.trim() !== '') {
            studentAnswers[questionId] = textAnswer.value.trim();
            hasAnswers = true;
        }
    });

    if (!hasAnswers) {
        alert('يرجى الإجابة على الأسئلة قبل التسليم');
        return;
    }

    try {
        const submissionRef = db.collection('students').doc(studentCode)
                              .collection('submissions').doc(currentAssignmentId);

await submissionRef.set({
    studentAnswers: studentAnswers,
    courseId: currentCourseId,
    assignmentId: currentAssignmentId,
    submissionDate: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'submitted',
    isGraded: false
});


        alert('تم تسليم الواجب بنجاح');
        assignmentDetails.classList.add('hidden');
        assignmentList.classList.remove('hidden');
    } catch (error) {
        console.error("Error submitting assignment:", error);
        alert('حدث خطأ أثناء التسليم');
    }
});

    cancelAssignmentBtn.addEventListener('click', () => {
        assignmentDetails.classList.add('hidden');
        assignmentList.classList.remove('hidden');
        displayQuizzesAndExams(currentCourseId);
    });

    // دالة لعرض رسائل الخطأ
    function displayErrorMessage(message) {
        document.body.innerHTML = `
            <div class="error-container">
                <h2><i class="fas fa-exclamation-triangle"></i> ${message}</h2>
                <a href="index.html" class="btn">العودة للصفحة الرئيسية</a>
            </div>
        `;
    }
    document.querySelectorAll('.start-assignment').forEach(btn => {
    btn.addEventListener('click', function() {
        console.log("تم النقر على زر ID:", this.dataset.id);
    });
});
});