function startQuiz(questions) {
    const style = document.createElement('style');
    style.innerHTML = `
        :root { --accent: #c29d5f; --bg: #0b1120; --card: #1e293b; --text: #f1f5f9; --correct: #22c55e; --wrong: #ef4444; }
        body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); direction: rtl; margin: 0; padding: 10px; display: flex; justify-content: center; min-height: 100vh; }
        .quiz-container { width: 100%; max-width: 500px; animation: fadeIn 0.5s ease; }
        .top-bar { background: var(--card); border-radius: 15px; border: 1px solid rgba(194,157,95,0.2); margin-bottom: 15px; overflow: hidden; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(194,157,95,0.1); }
        .stat-box { background: var(--card); padding: 10px; text-align: center; }
        .stat-label { color: #94a3b8; font-size: 11px; text-transform: uppercase; display: block; }
        .stat-value { font-weight: bold; font-family: monospace; font-size: 16px; }
        .progress-container { width: 100%; height: 6px; background: #334155; overflow: hidden; }
        #progress-bar { height: 100%; width: 0%; background: var(--accent); transition: 0.4s; }
        .question-card { background: var(--card); padding: 25px; border-radius: 15px; border-bottom: 4px solid var(--accent); margin: 15px 0; }
        .options-grid { display: grid; gap: 10px; }
        .option-btn { background: #0f172a; border: 1px solid #334155; padding: 15px; border-radius: 12px; color: white; cursor: pointer; text-align: right; display: flex; align-items: center; font-size: 16px; width: 100%; }
        .opt-char { background: #334155; color: var(--accent); width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-left: 12px; font-weight: bold; flex-shrink: 0; }
        .correct { background: rgba(34, 197, 94, 0.2) !important; border-color: var(--correct) !important; }
        .wrong { background: rgba(239, 68, 68, 0.2) !important; border-color: var(--wrong) !important; animation: shake 0.4s; }
        .next-btn, .action-btn { width: 100%; padding: 15px; margin-top: 10px; background: var(--accent); color: #000; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; display: none; font-size: 16px; }
        .review-box { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-top: 10px; text-align: right; border-right: 3px solid var(--wrong); }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    document.body.innerHTML = `<div class="quiz-container"><div class="top-bar"><div class="stats-grid">
        <div class="stat-box"><span class="stat-label">الوقت</span><span class="stat-value" style="color:var(--accent)" id="timer">00:00</span></div>
        <div class="stat-box"><span class="stat-label">التقدم</span><span class="stat-value" id="q-counter">1 / ${questions.length}</span></div>
        <div class="stat-box"><span class="stat-label">صح</span><span class="stat-value" style="color:var(--correct)" id="score-c">0</span></div>
        <div class="stat-box"><span class="stat-label">خطأ</span><span class="stat-value" style="color:var(--wrong)" id="score-w">0</span></div>
    </div><div class="progress-container"><div id="progress-bar"></div></div></div><div id="quiz-content">
        <div class="question-card"><h2 id="q-text"></h2></div><div id="options-box" class="options-grid"></div>
        <button id="next-btn" class="next-btn" onclick="nextQuestion()">السؤال التالي ◄</button>
    </div></div>`;

    let current = 0, scoreC = 0, scoreW = 0, seconds = 0;
    let wrongAnswers = []; 
    const chars = ['أ', 'ب', 'ج', 'د'];
    const timerInterval = setInterval(() => { seconds++; 
        document.getElementById('timer').innerText = `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`; 
    }, 1000);

    function showQuestion() {
        const q = questions[current];
        document.getElementById('q-text').innerText = q.q;
        document.getElementById('q-counter').innerText = `${current + 1} / ${questions.length}`;
        document.getElementById('progress-bar').style.width = `${(current / questions.length) * 100}%`;
        const box = document.getElementById('options-box'); box.innerHTML = '';
        document.getElementById('next-btn').style.display = 'none';

        let opts = q.options.map((t, i) => ({ t, isC: i === q.correct })).sort(() => Math.random() - 0.5);
        opts.forEach((opt, i) => {
            const btn = document.createElement('button'); btn.className = 'option-btn';
            btn.innerHTML = `<span class="opt-char">${chars[i]}</span><span>${opt.t}</span>`;
            btn.onclick = () => {
                if (box.querySelector('button').disabled) return;
                box.querySelectorAll('button').forEach(b => b.disabled = true);
                if (opt.isC) { btn.classList.add('correct'); scoreC++; } 
                else { 
                    btn.classList.add('wrong'); scoreW++;
                    wrongAnswers.push({q: q.q, correct: q.options[q.correct], user: opt.t});
                    box.querySelectorAll('button').forEach((b,idx) => { if(opts[idx].isC) b.classList.add('correct'); });
                }
                document.getElementById('score-c').innerText = scoreC;
                document.getElementById('score-w').innerText = scoreW;
                document.getElementById('next-btn').style.display = 'block';
            };
            box.appendChild(btn);
        });
    }

    window.nextQuestion = () => { current++; current < questions.length ? showQuestion() : finish(); };

    function finish() {
        clearInterval(timerInterval);
        const percent = Math.round((scoreC/questions.length)*100);
        let shareText = encodeURIComponent(`حصلت على نتيحة ${percent}% في اختبار ${document.title}!\nالوقت: ${document.getElementById('timer').innerText}\nالصح: ${scoreC} | الخطأ: ${scoreW}\nاختبر نفسك هنا: ${window.location.href}`);
        
        document.getElementById('quiz-content').innerHTML = `
            <div class="question-card" style="text-align:center">
                <h2 style="color:var(--accent)">اكتمل الاختبار!</h2>
                <div style="font-size:45px; margin:15px 0;">🎯 ${percent}%</div>
                <button class="action-btn" style="display:block; background:#25d366" onclick="window.open('https://wa.me/?text=${shareText}')">واتساب ✅</button>
                <button class="action-btn" style="display:block; background:#0088cc; color:white" onclick="window.open('https://t.me/share/url?url=${window.location.href}&text=${shareText}')">تليجرام ✈️</button>
                <button id="rev-btn" class="action-btn" style="display:block; background:transparent; border:1px solid var(--accent); color:var(--accent)" onclick="showReview()">مراجعة الأخطاء (${scoreW})</button>
                <button class="action-btn" style="display:block; background:var(--text)" onclick="location.reload()">إعادة الاختبار ↻</button>
                <div id="review-area" style="display:none; margin-top:20px"></div>
            </div>`;
    }

    window.showReview = () => {
        const area = document.getElementById('review-area');
        area.innerHTML = wrongAnswers.map(a => `<div class="review-box"><strong>السؤال:</strong> ${a.q}<br><span style="color:var(--correct)">✔ الجواب الصحيح: ${a.correct}</span></div>`).join('');
        area.style.display = 'block';
        document.getElementById('rev-btn').style.display = 'none';
    };

    showQuestion();
}
