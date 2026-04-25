// محرك الاختبارات القانونية الذكي - الإصدار 1.0
function startQuiz(questions) {
    // 1. إعداد واجهة الصفحة وتصميمها برمجياً
    const style = document.createElement('style');
    style.innerHTML = `
        :root { --accent: #c29d5f; --bg: #0b1120; --card: #161f32; --text: #f1f5f9; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: var(--bg); color: var(--text); direction: rtl; padding: 20px; text-align: center; }
        .quiz-container { max-width: 600px; margin: auto; background: var(--card); padding: 25px; border-radius: 20px; border: 1px solid rgba(194,157,95,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h2 { color: var(--accent); font-size: 20px; margin-bottom: 20px; }
        .option-btn { display: block; width: 100%; padding: 15px; margin: 10px 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; cursor: pointer; text-align: right; font-size: 16px; transition: 0.3s; }
        .option-btn:hover { background: rgba(194,157,95,0.1); border-color: var(--accent); }
        .nav-btns { display: flex; justify-content: space-between; margin-top: 20px; }
        .nav-btn { background: var(--accent); color: #0b1120; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; }
        .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        #progress { font-size: 12px; color: #94a3b8; margin-bottom: 10px; }
    `;
    document.head.appendChild(style);

    // 2. هيكل الاختبار
    document.body.innerHTML = `
        <div class="quiz-container">
            <div id="progress">سؤال 1 من ${questions.length}</div>
            <div id="question-box">
                <h2 id="q-text"></h2>
                <div id="options-box"></div>
            </div>
            <div class="nav-btns">
                <button id="prev-btn" class="nav-btn" onclick="changeQuestion(-1)">السابق</button>
                <button id="next-btn" class="nav-btn" onclick="changeQuestion(1)">التالي</button>
            </div>
        </div>
    `;

    // 3. منطق الاختبار والعشوائية
    window.currentQ = 0;
    window.userAnswers = new Array(questions.length).fill(null);
    window.allQuestions = questions.map(q => {
        // خلط الخيارات عشوائياً مع الحفاظ على معرفة الإجابة الصحيحة
        let optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
        optionsWithIndex.sort(() => Math.random() - 0.5);
        return { ...q, options: optionsWithIndex };
    });

    window.renderQuestion = function() {
        const q = window.allQuestions[window.currentQ];
        document.getElementById('q-text').innerText = q.q;
        document.getElementById('progress').innerText = `سؤال ${window.currentQ + 1} من ${window.allQuestions.length}`;
        
        const box = document.getElementById('options-box');
        box.innerHTML = '';
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt.text;
            // تلوين الخيار إذا كان مجاباً عليه سابقاً
            if (window.userAnswers[window.currentQ] === i) btn.style.borderColor = 'var(--accent)';
            
            btn.onclick = () => {
                window.userAnswers[window.currentQ] = i;
                renderQuestion();
                // هنا نكدر نضيف كود فوري لمعرفة الصح من الخطأ إذا ردت
            };
            box.appendChild(btn);
        });

        document.getElementById('prev-btn').disabled = window.currentQ === 0;
        document.getElementById('next-btn').innerText = window.currentQ === window.allQuestions.length - 1 ? "إنهاء" : "التالي";
    };

    window.changeQuestion = function(step) {
        if (window.currentQ + step >= 0 && window.currentQ + step < window.allQuestions.length) {
            window.currentQ += step;
            renderQuestion();
        } else if (window.currentQ + step === window.allQuestions.length) {
            alert("تم الانتهاء! درجتك ستحسب هنا في الخطوة القادمة.");
        }
    };

    renderQuestion();
}
