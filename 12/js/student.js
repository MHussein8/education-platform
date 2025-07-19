// بيانات الطلاب الكاملة والصحيحة
const studentsDatabase = {
    "12345678": {
        name: "أحمد محمد",
        grade: "الصف الثالث الثانوي",
        courses: {
            "الرياضيات": [
                { type: "شرح", title: "الجبر الخطي", done: true },
                { type: "شرح", title: "حساب المثلثات", done: true },
                { type: "واجب", title: "الواجب الأول", grade: "18/20" },
                { type: "اختبار", title: "منتصف الفصل", grade: "85/100" }
            ],
            "اللغة العربية": [
                { type: "شرح", title: "النحو الأساسي", done: true },
                { type: "شرح", title: "تحليل النصوص", done: false },
                { type: "واجب", title: "التعبير الكتابي", grade: "15/20" }
            ]
        }
    },
    "87654321": {
        name: "مريم علي",
        grade: "الصف الثاني الثانوي",
        courses: {
            "العلوم": [
                { type: "شرح", title: "الكيمياء العضوية", done: true },
                { type: "تجربة", title: "تفاعلات كيميائية", done: false }
            ],
            "الإنجليزية": [
                { type: "شرح", title: "القواعد", done: true },
                { type: "واجب", title: "المحادثة", grade: "17/20" }
            ]
        }
    },
    "11223344": {
        name: "محمد أحمد",
        grade: "الصف الأول الثانوي",
        courses: {
            "الرياضيات": [
                { type: "شرح", title: "الأساسيات", done: true }
            ]
        }
    }
};

// فحص سلامة البيانات قبل التنفيذ
try {
    JSON.parse(JSON.stringify(studentsDatabase));
    console.log("تم تحميل بيانات الطلاب بنجاح");
} catch (e) {
    console.error("خطأ في بيانات الطلاب:", e);
    alert("خطأ في بيانات الطلاب! راجع ملف student.js");
    throw new Error("خطأ في بيانات الطلاب");
}

// عرض بيانات الطالب عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على كود الطالب من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const studentCode = urlParams.get('code');
    
    // البحث عن الطالب في قاعدة البيانات
    const student = studentsDatabase[studentCode];

    if (student) {
        // عرض معلومات الطالب الأساسية
        document.getElementById('studentName').textContent = student.name;
        document.getElementById('studentGrade').textContent = student.grade;
        document.getElementById('studentCode').textContent = `كود الطالب: ${studentCode}`;

        // عرض الكورسات والمحتويات
        const coursesContainer = document.getElementById('studentCourses');
        let coursesHTML = '';

        // عرض كل كورس ومحتوياته
        for (const [courseName, contents] of Object.entries(student.courses)) {
            let contentsHTML = '';
            
            // عرض كل عنصر في المحتوى
contents.forEach(item => {
    let badgeClass = '';
    if(item.type === 'شرح') badgeClass = 'lecture';
    else if(item.type === 'واجب') badgeClass = 'assignment';
    else if(item.type === 'اختبار') badgeClass = 'exam';
    
    contentsHTML += `
    <div class="content-item">
        <div>
            <span class="content-badge ${badgeClass}">${item.type}</span>
            <span>${item.title}</span>
        </div>
        ${item.grade ? `<span class="grade">${item.grade}</span>` : 
          `<i class="fas ${item.done ? 'fa-check-circle' : 'fa-clock'}" 
            style="color: ${item.done ? 'var(--success)' : 'var(--warning)'}"></i>`}
    </div>`;
            });
            
            // إضافة الكورس إلى القائمة
            coursesHTML += `
            <div class="course-card">
                <h2 class="course-title">
                    <i class="fas fa-book-open"></i>
                    ${courseName}
                </h2>
                ${contentsHTML}
            </div>`;
        }
        
        // إضافة كل الكورسات إلى الصفحة
        coursesContainer.innerHTML = coursesHTML;
    } else {
        // إذا كان الكود غير صحيح
        document.body.innerHTML = `
            <div class="error-container">
                <h2><i class="fas fa-exclamation-triangle"></i> كود الطالب غير صحيح</h2>
                <a href="index.html" class="btn">العودة للصفحة الرئيسية</a>
            </div>
        `;
    }
});