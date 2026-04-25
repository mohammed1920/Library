function startQuiz(questions) {
    const style = document.createElement('style');
    style.innerHTML = `
        :root { --accent: #c29d5f; --bg: #0b1120; --card: #161f32; --text: #f1f5f9; --correct: #22c55e; --wrong: #ef4444; }
        body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); direction: rtl; padding: 15px; margin: 0; }
        .quiz-container { max-width: 500px; margin: auto; }
        
        /* رأس الصفحة - العداد */
        .stats-bar { display: flex; justify-content: center; gap: 15px; margin-bottom: 20px; font-size: 14px; }
        .stat-item { background: rgba(255,255,255,0.05); padding: 5px 15px; border-radius: 20px; border: 1px solid rgba(194,157,95,0.2); }
        .stat-correct { color: var(--correct); } .stat-wrong { color: var(--wrong); }

        /* صندوق السؤال */
        .question-card { background: var(--card); padding: 25px; border-radius: 15px; border-right: 4px solid var(--accent); margin-bottom: 20px; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        .q-label { position: absolute; top: -10px; left: 15px; background: var(--accent); color: #000; padding: 2px 10px; border-radius: 5px; font-weight: bold; font-size: 12px; }
        h2 { font-size: 18px; line-height: 1.6; margin: 0; }

        /* الخيارات */
        .option-btn { display: flex; align-items: center; width: 100%; padding: 12px; margin: 12px 0; background: #1e293b; border: 1px solid #334155; border-radius: 10px; color: white; cursor: pointer; transition: 0.3s; position: relative; font-size: 16px; }
        .opt-char { background: #334155; color: var(--accent); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 5px; margin-left: 15px; font-weight: bold; font-size: 14px; }
        
        /* ألوان النتائج */
        .correct-opt { border-color: var(--correct) !important; color: var(--correct) !important; background: rgba(34, 197, 94, 0.05) !important; }
        .correct-opt .opt-char { background: var(--correct); color: white; }
        .wrong-opt { border-color: var(--wrong) !important; color: var(--wrong) !important; background: rgba(239, 68, 68, 0.05) !important; }
        .wrong-opt .opt-char { background: var(--wrong); color: white; }

        /* رسالة النتيجة */
        .feedback { display: none; padding: 12px; border-radius: 10px; margin-top: 15px; font-weight: bold; text-align: center; }
        .next-btn { width: 100%; padding: 15px; margin-top: 20px; background: var(--accent); color: #000; border: none; border-radius: 12px; font-weight: bold; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .next-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `;
    document.head.appendChild(style);

    // الهيكل الأساسي
    document.body.innerHTML = `
        <div class="quiz-container">
            <div class="stats-bar">
                <div class="stat-item">سؤال <span id="q-idx">1</span> من ${questions.length}</div>
                <div class="stat-item stat-correct">● <span id="score-c">0</span> صحيح</div>
                <div class="stat-item stat-wrong">● <span id="score-w">0</span> خطأ</div>
            </div>
            <div class="question-card">
                <div class="q-label">س<span id="q-num">1</span></div>
                <h2 id="q-text"></h2>
            </div>
            <div id="options-box"></div>
            <div id="feedback-msg" class="feedback"></div>
            <button id="next-btn" class="next-btn" onclick="changeQuestion(1)" disabled>السؤال التالي ◄</button>
        </div>
    `;

    let currentQ = 0;
    let scoreC = 0;
    let scoreW = 0;
    const chars = ['أ', 'ب', 'ج', 'د'];
    
    // خلط الأسئلة عند البداية
    const allQuestions = questions.sort(() => Math.random() - 0.5).map(q => {
        let opts = q.options.map((text, i) => ({ text, isCorrect: i === q.correct }));
        return { ...q, options: opts.sort(() => Math.random() - 0.5) };
    });

    window.renderQuestion = function() {
        const q = allQuestions[currentQ];
        document.getElementById('q-text').innerText = q.q;
        document.getElementById('q-idx').innerText = currentQ + 1;
        document.getElementById('q-num').innerText = currentQ + 1;
        document.getElementById('next-btn').disabled = true;
        document.getElementById('feedback-msg').style.display = 'none';
        
        const box = document.getElementById('options-box');
        box.innerHTML = '';

        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="opt-char">${chars[i]}</span> <span class="opt-text">${opt.text}</span>`;
            
            btn.onclick = () => {
                if (document.getElementById('next-btn').disabled === false) return; // منع تغيير الإجابة
                
                const allBtns = box.querySelectorAll('.option-btn');
                allBtns.forEach(b => b.style.cursor = 'default');

                if (opt.isCorrect) {
                    btn.classList.add('correct-opt');
                    scoreC++;
                    showFeedback("إجابة صحيحة! ✅", "var(--correct)");
                } else {
                    btn.classList.add('wrong-opt');
                    scoreW++;
                    // إظهار الإجابة الصحيحة
                    q.options.forEach((o, idx) => {
                        if(o.isCorrect) allBtns[idx].classList.add('correct-opt');
                    });
                    showFeedback("إجابة خاطئة! ❌", "var(--wrong)");
                }
                
                updateStats();
                document.getElementById('next-btn').disabled = false;
            };
            box.appendChild(btn);
        });
    };

    function showFeedback(text, color) {
        const f = document.getElementById('feedback-msg');
        f.innerText = text;
        f.style.display = 'block';
        f.style.color = color;
        f.style.background = color.replace(')', ', 0.1)');
    }

    function updateStats() {
        document.getElementById('score-c').innerText = scoreC;
        document.getElementById('score-w').innerText = scoreW;
    }

    window.changeQuestion = (step) => {
        currentQ++;
        if (currentQ < allQuestions.length) renderQuestion();
        else {
            document.querySelector('.quiz-container').innerHTML = `
                <div class="question-card" style="text-align:center">
                    <h2>تم الانتهاء من الاختبار!</h2>
                    <p style="font-size:24px; color:var(--accent)">نتيجتك: ${scoreC} من ${allQuestions.length}</p>
                    <button class="next-btn" onclick="location.reload()">إعادة الاختبار</button>
                </div>`;
        }
    };

    renderQuestion();
}
