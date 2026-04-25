function startQuiz(questions) {
    const style = document.createElement('style');
    style.innerHTML = `
        :root { --accent: #c29d5f; --bg: #0b1120; --card: #1e293b; --text: #f1f5f9; --correct: #22c55e; --wrong: #ef4444; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: var(--bg); color: var(--text); direction: rtl; margin: 0; padding: 10px; display: flex; justify-content: center; min-height: 100vh; }
        .quiz-container { width: 100%; max-width: 500px; animation: fadeIn 0.5s ease; }
        
        /* شريط المعلومات العلوي المطور */
        .top-bar { background: var(--card); border-radius: 15px; border: 1px solid rgba(194,157,95,0.2); margin-bottom: 15px; overflow: hidden; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(194,157,95,0.1); }
        .stat-box { background: var(--card); padding: 10px; text-align: center; font-size: 14px; display: flex; flex-direction: column; gap: 5px; }
        .stat-label { color: #94a3b8; font-size: 11px; text-transform: uppercase; }
        .stat-value { font-weight: bold; font-family: monospace; font-size: 16px; }
        .val-correct { color: var(--correct); }
        .val-wrong { color: var(--wrong); }
        .val-time { color: var(--accent); }

        /* شريط التقدم */
        .progress-container { width: 100%; height: 6px; background: #334155; overflow: hidden; }
        #progress-bar { height: 100%; width: 0%; background: var(--accent); transition: 0.4s; }

        /* صندوق السؤال */
        .question-card { background: var(--card); padding: 25px; border-radius: 15px; border-bottom: 4px solid var(--accent); margin: 15px 0; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
        h2 { font-size: 18px; line-height: 1.6; margin: 0; }

        /* الخيارات */
        .options-grid { display: grid; gap: 12px; }
        .option-btn { background: #0f172a; border: 1px solid #334155; padding: 15px; border-radius: 12px; color: white; cursor: pointer; text-align: right; display: flex; align-items: center; transition: 0.2s; font-size: 16px; width: 100%; }
        .opt-char { background: #334155; color: var(--accent); width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-left: 12px; font-weight: bold; flex-shrink: 0; }
        
        .correct { background: rgba(34, 197, 94, 0.2) !important; border-color: var(--correct) !important; color: var(--correct) !important; }
        .correct .opt-char { background: var(--correct); color: white; }
        .wrong { background: rgba(239, 68, 68, 0.2) !important; border-color: var(--wrong) !important; color: var(--wrong) !important; animation: shake 0.4s; }
        .wrong .opt-char { background: var(--wrong); color: white; }

        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .next-btn { width: 100%; padding: 15px; margin-top: 15px; background: var(--accent); color: #000; border: none; border-radius: 12px; font-weight: bold; font-size: 17px; cursor: pointer; display: none; }
    `;
    document.head.appendChild(style);

    document.body.innerHTML = `
        <div class="quiz-container">
            <div class="top-bar">
                <div class="stats-grid">
                    <div class="stat-box">
                        <span class="stat-label">الوقت المستغرق</span>
                        <span class="stat-value val-time" id="timer">00:00</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">التقدم</span>
                        <span class="stat-value" id="q-counter">1 / ${questions.length}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">إجابة صحيحة</span>
                        <span class="stat-value val-correct" id="score-c">0</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">إجابة خاطئة</span>
                        <span class="stat-value val-wrong" id="score-w">0</span>
                    </div>
                </div>
                <div class="progress-container"><div id="progress-bar"></div></div>
            </div>
            <div id="quiz-content">
                <div class="question-card"><h2 id="q-text"></h2></div>
                <div id="options-box" class="options-grid"></div>
                <button id="next-btn" class="next-btn" onclick="nextQuestion()">السؤال التالي ◄</button>
            </div>
        </div>
    `;

    let current = 0;
    let scoreC = 0;
    let scoreW = 0;
    let seconds = 0;
    const chars = ['أ', 'ب', 'ج', 'د'];
    
    const timerInterval = setInterval(() => {
        seconds++;
        let m = Math.floor(seconds / 60).toString().padStart(2, '0');
        let s = (seconds % 60).toString().padStart(2, '0');
        document.getElementById('timer').innerText = `${m}:${s}`;
    }, 1000);

    function showQuestion() {
        const q = questions[current];
        document.getElementById('q-text').innerText = q.q;
        document.getElementById('q-counter').innerText = `${current + 1} / ${questions.length}`;
        document.getElementById('progress-bar').style.width = `${(current / questions.length) * 100}%`;
        
        const box = document.getElementById('options-box');
        box.innerHTML = '';
        document.getElementById('next-btn').style.display = 'none';

        let shuffeledOpts = q.options.map((t, i) => ({ t, isC: i === q.correct })).sort(() => Math.random() - 0.5);

        shuffeledOpts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="opt-char">${chars[i]}</span> <span>${opt.t}</span>`;
            btn.onclick = () => {
                const btns = box.querySelectorAll('.option-btn');
                if (btns[0].disabled) return;
                btns.forEach(b => b.disabled = true);
                
                if (opt.isC) {
                    btn.classList.add('correct');
                    scoreC++;
                    document.getElementById('score-c').innerText = scoreC;
                } else {
                    btn.classList.add('wrong');
                    scoreW++;
                    document.getElementById('score-w').innerText = scoreW;
                    btns.forEach((b, idx) => { if(shuffeledOpts[idx].isC) b.classList.add('correct'); });
                }
                document.getElementById('next-btn').style.display = 'block';
            };
            box.appendChild(btn);
        });
    }

    window.nextQuestion = () => {
        current++;
        if (current < questions.length) showQuestion();
        else finish();
    };

    function finish() {
        clearInterval(timerInterval);
        document.getElementById('progress-bar').style.width = '100%';
        document.getElementById('quiz-content').innerHTML = `
            <div class="question-card" style="text-align:center">
                <h2 style="color:var(--accent)">اكتمل الاختبار!</h2>
                <div style="font-size:40px; margin:20px 0;">🎯 ${Math.round((scoreC/questions.length)*100)}%</div>
                <p>الإجابات الصحيحة: ${scoreC}</p>
                <p>الإجابات الخاطئة: ${scoreW}</p>
                <p>الوقت المستغرق: ${document.getElementById('timer').innerText}</p>
                <button class="next-btn" style="display:block" onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
    }

    showQuestion();
}
