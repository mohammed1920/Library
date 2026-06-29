function startQuiz(questions) {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js";
    document.head.appendChild(script);

    const style = document.createElement('style');
    style.innerHTML = `
        :root { --accent: #c29d5f; --bg: #0b1120; --card: #1e293b; --text: #f1f5f9; --correct: #22c55e; --wrong: #ef4444; }
        body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); direction: rtl; margin: 0; padding: 10px; display: flex; justify-content: center; min-height: 100vh; }
        .quiz-container { width: 100%; max-width: 500px; animation: fadeIn 0.5s ease; position: relative; padding-bottom: 20px; }
        .top-bar { background: var(--card); border-radius: 15px; border: 1px solid rgba(194,157,95,0.2); margin-bottom: 15px; overflow: hidden; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(194,157,95,0.1); }
        .stat-box { background: var(--card); padding: 8px 2px; text-align: center; }
        .stat-label { color: #94a3b8; font-size: 10px; display: block; margin-bottom: 2px; }
        .stat-value { font-weight: bold; font-family: monospace; font-size: 14px; }
        .progress-container { width: 100%; height: 5px; background: #334155; overflow: hidden; }
        #progress-bar { height: 100%; width: 0%; background: var(--accent); transition: 0.4s; }
        .question-card { background: var(--card); padding: 25px; border-radius: 15px; border-bottom: 4px solid var(--accent); margin: 15px 0; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
        .options-grid { display: grid; gap: 10px; }
        .option-btn { background: #0f172a; border: 1px solid #334155; padding: 15px; border-radius: 12px; color: white; cursor: pointer; text-align: right; display: flex; align-items: center; font-size: 16px; width: 100%; transition: 0.2s; }
        .opt-char { background: #334155; color: var(--accent); width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-left: 12px; font-weight: bold; flex-shrink: 0; }
        .correct { background: rgba(34, 197, 94, 0.2) !important; border-color: var(--correct) !important; color: var(--correct); }
        .wrong { background: rgba(239, 68, 68, 0.2) !important; border-color: var(--wrong) !important; animation: shake 0.4s; color: var(--wrong); }
        .action-btn { width: 100%; padding: 15px; margin-top: 10px; background: var(--accent); color: #000; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 16px; transition: 0.3s; }
        .admin-panel { background: rgba(194,157,95,0.1); border: 1px dashed var(--accent); padding: 12px; border-radius: 12px; margin-top: 15px; text-align: center; }
        .nav-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
        .footer-link { background: var(--card); color: var(--text); text-decoration: none; padding: 12px; border-radius: 12px; text-align: center; font-size: 13px; border: 1px solid rgba(194,157,95,0.3); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .tg-icon { color: #0088cc; font-weight: bold; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    const CHAPTERS_PAGE = "index.html"; 
    const GLOBAL_LIBRARY = "https://mohammed1920.github.io/Library/";

    // التحقق من وضع الأدمن عبر الرابط بأمان
    const urlParams = new URLSearchParams(window.location.search);
    const adminToken = urlParams.get('admin'); 
    const isAdmin = adminToken !== null && adminToken !== "";

    document.body.innerHTML = `<div class="quiz-container">
        <div class="top-bar">
            <div class="stats-grid">
                <div class="stat-box"><span class="stat-label">الوقت</span><span id="timer" class="stat-value" style="color:var(--accent)">00:00</span></div>
                <div class="stat-box"><span class="stat-label">التقدم</span><span id="q-counter" class="stat-value">1/--</span></div>
                <div class="stat-box"><span class="stat-label">صح</span><span id="score-c" class="stat-value" style="color:var(--correct)">0</span></div>
                <div class="stat-box"><span class="stat-label">خطأ</span><span id="score-w" class="stat-value" style="color:var(--wrong)">0</span></div>
            </div>
            <div class="progress-container"><div id="progress-bar"></div></div>
        </div>
        <div id="quiz-content">
            <div class="question-card"><h2 id="q-text"></h2></div>
            <div id="options-box" class="options-grid"></div>
            <button id="next-btn" class="action-btn" style="display:none" onclick="nextQuestion()">السؤال التالي ◄</button>
            <div id="admin-box" class="admin-panel" style="display:none">
                <small style="color:var(--accent); display:block; margin-bottom:8px;">⚙️ لوحة الأدمن (اختر الإجابة الصحيحة أولاً ثم اضغط تصحيح)</small>
                <button class="action-btn" style="background:#ef4444; color:white; padding:10px; font-size:14px;" onclick="triggerCorrection()">🔧 اعتماد هذا الخيار كإجابة صحيحة نهائية</button>
            </div>
        </div>
        <div class="nav-footer">
            <a href="${GLOBAL_LIBRARY}" class="footer-link">🏠 المكتبة العامة</a>
            <a href="https://t.me/M5M5P" target="_blank" class="footer-link"><span class="tg-icon">✈</span> التليجرام</a>
        </div>
    </div>`;

    let current = 0, scoreC = 0, scoreW = 0, seconds = 0, wrongAnswers = [];
    let selectedTextForAdmin = null; // لحفظ نص الخيار الذي ضغطت عليه لتصحيحه

    const timerInterval = setInterval(() => { seconds++; 
        document.getElementById('timer').innerText = `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`; 
    }, 1000);

    function showQuestion() {
        const q = questions[current];
        document.getElementById('q-text').innerText = q.q;
        document.getElementById('q-counter').innerText = `${current+1}/${questions.length}`;
        document.getElementById('progress-bar').style.width = `${(current/questions.length)*100}%`;
        const box = document.getElementById('options-box'); box.innerHTML = '';
        document.getElementById('next-btn').style.display = 'none';
        
        if (isAdmin) {
            document.getElementById('admin-box').style.display = 'block';
            selectedTextForAdmin = null; 
        }

        const alphabet = ['أ','ب','ج','د','هـ','و','ز','ح'];
        let cleanOptions = q.options.filter(opt => opt !== undefined && opt !== "");
        
        let opts = cleanOptions.map((t, i) => ({ t, isC: i === q.correct })).sort(() => Math.random() - 0.5);
        
        opts.forEach((opt, i) => {
            const btn = document.createElement('button'); btn.className = 'option-btn';
            btn.innerHTML = `<span class="opt-char">${alphabet[i] || (i+1)}</span><span>${opt.t}</span>`;
            btn.onclick = () => {
                // إذا كنا في وضع الأدمن، نحفظ النص الذي تم اختياره للتصحيح المحتمل
                if (isAdmin) { selectedTextForAdmin = opt.t; }

                if (box.querySelector('button').disabled && !isAdmin) return;
                
                // في وضع الأدمن نمنح الحرية للتنقل بين الاختيارات لتحديد الصحيح قبل الإرسال
                box.querySelectorAll('button').forEach(b => b.classList.remove('correct', 'wrong'));
                
                if (opt.isC) { btn.classList.add('correct'); if(!box.dataset.answered){ scoreC++; } } 
                else { 
                    btn.classList.add('wrong'); if(!box.dataset.answered){ scoreW++; wrongAnswers.push({q: q.q, correct: cleanOptions[q.correct]}); }
                    box.querySelectorAll('button').forEach((b,idx) => { if(opts[idx].isC) b.classList.add('correct'); });
                }
                
                if(!box.dataset.answered && !isAdmin) {
                    box.querySelectorAll('button').forEach(b => b.disabled = true);
                    document.getElementById('score-c').innerText = scoreC;
                    document.getElementById('score-w').innerText = scoreW;
                }
                document.getElementById('next-btn').style.display = 'block';
            };
            box.appendChild(btn);
        });
    }

    // دالة إرسال إشارة التصحيح لـ GitHub Actions
    window.triggerCorrection = () => {
        if (!selectedTextForAdmin) {
            alert("الرجاء الضغط على الخيار الصحيح أولاً لتحديده!");
            return;
        }

        const q = questions[current];
        if (confirm(`هل أنت متأكد من تعديل الملف الأصلي؟\nالسؤال: ${q.q}\nالإجابة الصحيحة الجديدة ستكون: ${selectedTextForAdmin}`)) {
            
            // استخراج اسم المستودع الفرعي تلقائياً من رابط الصفحة الحالي
            const repoPath = window.location.pathname.split('/');
            const repoName = repoPath[1] || "Library"; 
            const fileName = repoPath[repoPath.length - 1]; 

            // إرسال الإشارة الآمنة إلى جيت هاب
            fetch(`https://api.github.com/repos/mohammed1920/${repoName}/dispatches`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${adminToken}` // الرمز الذي تضعه بالرابط سيعمل كمفتاح عبور
                },
                body: JSON.stringify({
                    event_type: 'correct_question',
                    client_payload: {
                        question_text: q.q,
                        correct_answer_text: selectedTextForAdmin,
                        file_name: fileName
                    }
                })
            })
            .then(res => {
                if(res.status === 204) {
                    alert("🚀 جاري التصحيح في السيرفر الأصلي الآن! انتظر 10 ثوانٍ وسيتم تعديل الملف نهائياً.");
                } else {
                    alert("❌ فشل الإرسال، تذكر أن تضع الرمز (GitHub Token) الصحيح في الرابط الخاص بك.");
                }
            })
            .catch(err => alert("حدث خطأ أثناء الاتصال بجيت هاب: " + err));
        }
    };

    window.nextQuestion = () => { 
        const box = document.getElementById('options-box');
        box.removeAttribute('data-answered');
        current++; 
        current < questions.length ? showQuestion() : finish(); 
    };

    function finish() {
        clearInterval(timerInterval);
        const percent = Math.round((scoreC/questions.length)*100);
        let msg = percent === 100 ? "درجة كاملة! أنت فخر للقضاء العراقي ⚖️" : (percent >= 75 ? "عاشت إيدك، مستواك قوي جداً! 🚀" : "مستوى جيد، استمر بالمراجعة! 📚");
        if(percent >= 70 && window.confetti) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#c29d5f', '#ffffff', '#22c55e'] });
        }
        window.history.replaceState(null, null, CHAPTERS_PAGE);
        document.getElementById('quiz-content').innerHTML = `
            <div class="question-card" style="text-align:center">
                <h2 style="color:var(--accent)">${msg}</h2>
                <div style="font-size:50px; margin:20px 0;">🎯 ${percent}%</div>
                <button class="action-btn" onclick="shareResult()">نشر النتيجة 🔗</button>
                <button class="action-btn" style="background:transparent; border:1px solid var(--accent); color:var(--accent)" onclick="showReview()">مراجعة الأخطاء (${scoreW})</button>
                <button class="action-btn" style="background:#f1f5f9; color:#000" onclick="window.location.href='${CHAPTERS_PAGE}'">الخروج لصفحة الفصول 📖</button>
                <button class="action-btn" style="background:transparent; border:none; color:#94a3b8; font-size:12px; margin-top:10px" onclick="location.reload()">إعادة الاختبار ↻</button>
                <div id="review-area" style="display:none; margin-top:20px"></div>
            </div>`;
    }

    window.shareResult = () => {
        const text = `حصلت على ${scoreC} من ${questions.length} في اختبار ${document.title}!\nالوقت: ${document.getElementById('timer').innerText}`;
        if(navigator.share) navigator.share({ title: 'نتيجتي', text: text, url: window.location.href });
        else alert("نسخ نتيجتك: " + text);
    };

    window.showReview = () => {
        const area = document.getElementById('review-area');
        area.innerHTML = wrongAnswers.map(a => `<div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:10px; margin-top:8px; text-align:right; border-right:3px solid var(--accent); font-size:14px;"><strong>س:</strong> ${a.q}<br><span style="color:var(--correct)">✔ الجواب: ${a.correct}</span></div>`).join('');
        area.style.display = 'block';
    };

    showQuestion();
}
