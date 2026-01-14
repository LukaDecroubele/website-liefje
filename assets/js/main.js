// Minimal main.js — only features currently used: countdown, messages, radio (audio files), slideshow
(function(){
  // ---------- utilities
  function $(sel){ return document.querySelector(sel); }
  function $all(sel){ return Array.from(document.querySelectorAll(sel)); }
  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ---------- Countdown
  function initCountdown(){
    const el = document.getElementById('countdown');
    if(!el) return;
    const target = el.dataset.date || new Date().toISOString();
    let targetDate = new Date(target);
    let hasConfettied = false;
    
    function update(){
      const now = new Date();
      const diff = targetDate - now;
      
      if(diff < 0 && !hasConfettied){ 
        hasConfettied = true;
        fireConfetti();
      }
      
      if(diff < 0){ targetDate.setFullYear(targetDate.getFullYear()+1); }
      
      const days = Math.floor(diff / (1000*60*60*24));
      const hours = Math.floor(diff / (1000*60*60) % 24);
      const mins = Math.floor(diff / (1000*60) % 60);
      const secs = Math.floor(diff / 1000 % 60);
      el.querySelector('.days .num').textContent = days;
      el.querySelector('.hours .num').textContent = String(hours).padStart(2,'0');
      el.querySelector('.mins .num').textContent = String(mins).padStart(2,'0');
      el.querySelector('.secs .num').textContent = String(secs).padStart(2,'0');
    }
    update();
    setInterval(update, 1000);
  }
  
  function fireConfetti(){
    if(typeof confetti === 'undefined'){ console.log('Confetti library not loaded'); return; }
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setTimeout(()=>{ confetti({ particleCount: 50, spread: 100, origin: { y: 0.5 } }); }, 200);
      setTimeout(()=>{ confetti({ particleCount: 80, spread: 60, origin: { y: 0.4 } }); }, 400);
    } catch(e) { console.error('Confetti error:', e); }
  }

  // ---------- Messages
  function initMessages(){
    const form = document.getElementById('message-form');
    const list = document.getElementById('messages');
    if(!form || !list) return;
    
    // Use localStorage for now, but messages will sync if Firebase is added
    const KEY = 'liefje_messages_v1';
    
    function load(){ 
      const raw = localStorage.getItem(KEY); 
      return raw ? JSON.parse(raw) : []; 
    }
    
    function save(items){ 
      localStorage.setItem(KEY, JSON.stringify(items));
      // If you set up Firebase, uncomment this and update with your config:
      // syncToFirebase(items);
    }
    
    function render(){
      const items = load();
      list.innerHTML = '';
      if(items.length===0){ 
        list.innerHTML = '<div class="small">No messages yet — be the first!</div>'; 
        return; 
      }
      items.slice().reverse().forEach(it=>{
        const el = document.createElement('div'); 
        el.className='message';
        el.innerHTML = `<strong>${escapeHtml(it.name)}</strong> <div class="small">${new Date(it.time).toLocaleString()}</div><div style="margin-top:6px">${escapeHtml(it.text)}</div>`;
        list.appendChild(el);
      });
    }
    
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const name = (form.querySelector('[name=name]')?.value || '').trim() || 'Anonymous';
      const text = (form.querySelector('[name=text]')?.value || '').trim();
      if(!text) return;
      const items = load(); 
      items.push({name,text,time:Date.now()}); 
      save(items); 
      form.reset(); 
      render();
    });
    
    render();
  }

  // ---------- Radio (simple HTMLAudio playlist)
  function initRadio(){
    const playBtn = document.getElementById('radio-play');
    const prevBtn = document.getElementById('radio-prev');
    const nextBtn = document.getElementById('radio-next');
    const vol = document.getElementById('radio-volume');
    const label = document.getElementById('radio-station');
    if(!playBtn || !prevBtn || !nextBtn || !vol || !label) return;

    const tracks = (window.AUDIO_TRACKS && Array.isArray(window.AUDIO_TRACKS)) ? window.AUDIO_TRACKS.slice() : [];
    let idx = 0;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = false;
    audio.volume = Number(vol.value || 0.6);

    function updateUI(){
      label.textContent = 'Radio — ' + (tracks[idx] ? tracks[idx].split('/').pop() : 'No tracks');
      playBtn.textContent = audio.paused ? '▶' : '⏸';
    }

    function playCurrent(){ if(!tracks.length) return; audio.src = tracks[idx]; audio.play().catch(()=>{}); updateUI(); }
    function togglePlay(){ if(audio.paused){ playCurrent(); } else { audio.pause(); updateUI(); } }
    function next(){ if(!tracks.length) return; idx = (idx+1) % tracks.length; playCurrent(); }
    function prev(){ if(!tracks.length) return; idx = (idx-1 + tracks.length) % tracks.length; playCurrent(); }

    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    vol.addEventListener('input', e=>{ const v = Number(e.target.value); try{ audio.volume = v; }catch(e){} });
    audio.addEventListener('ended', ()=>{ next(); });

    updateUI();
  }

  // ---------- Slideshow
  function initSlideshow(){
    const slides = window.SLIDES || [];
    if(!slides.length) return;
    const img = document.getElementById('slide-img');
    const prevBtn = document.getElementById('sl-prev');
    const nextBtn = document.getElementById('sl-next');
    if(!img) return;
    let idx = 0; let timer = null; const INTERVAL = 4000; let paused = false;
    function show(i){ idx = (i + slides.length) % slides.length; const url = slides[idx]; img.style.opacity = '0'; const tmp = new Image(); tmp.onload = ()=>{ img.src = url; img.style.opacity = '1'; }; tmp.src = url; }
    function next(){ show(idx+1); }
    function prev(){ show(idx-1); }
    function start(){ stop(); timer = setInterval(()=>{ if(!paused) next(); }, INTERVAL); }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }
    if(nextBtn) nextBtn.addEventListener('click', ()=>{ next(); start(); });
    if(prevBtn) prevBtn.addEventListener('click', ()=>{ prev(); start(); });
    const container = document.getElementById('slideshow'); if(container){ container.addEventListener('mouseenter', ()=>{ paused = true; }); container.addEventListener('mouseleave', ()=>{ paused = false; }); }
    window.addEventListener('keydown', e=>{ if(e.key === 'ArrowRight'){ next(); start(); } if(e.key === 'ArrowLeft'){ prev(); start(); } });
    show(0); start();
  }

  // ---------- Quiz
  function initQuiz(){
    const quizzes = [
      { game: 'Unravel', question: 'Welke kleur zijn de ventjes bij de start van het spel', correct: 'Blauw & Rood', wrong: ['Groen & Roze', 'Grijs & Wit', 'Paars & Geel'] },
      { game: 'OITNB', question: 'In OITNB wat is Pipers bijnaam in de early seasons', correct: 'Gangsta Piper', wrong: ['waspy', 'Blondie'] },
      { game: 'Dispatch', question: 'Wat is de naam van het hondje', correct: 'Beef', wrong: ['Bolt', 'Buddy', 'Biscuit'] },
      { game: 'Russian doll', question: 'In Russian Doll welk karakter zit ook vast in de time loop', correct: 'Alan', wrong: ['maxine', 'Ruth'] },
      { game: 'Outer wilds', question: 'Hoeveel planeten zijn er in totaal', correct: '6', wrong: ['5', '7', '8'] },
      { game: 'good place', question: 'Wat is het systeem dat gebruikt wordt om mensen te judgen', correct: 'The Points System', wrong: ['The moral scale', 'The ethics index'] },
      { game: 'It takes two', question: 'Wat zijn de namen van de main characters', correct: 'Cody & May', wrong: ['Will & May', 'Cody & Rose', 'Will & Rose'] },
      { game: 'OMITB', question: 'Wat is de naam van het appartement', correct: 'The Arconia', wrong: ['The Belnord', 'The Dakota', 'The Concord'] },
      { game: 'Stardew', question: 'Hoeveel geld hebben we gemaakt in totaal op Gewoon Boef Farm', correct: '130.000', wrong: ['100.000', '60.000', '180.000'] },
      { game: 'Lost', question: 'Wat is de originele betekenis van de nummers 4 8 15 16 23 42', correct: 'De kandidaten om Jacob op te volgen om het eiland te beschermen', wrong: ['De coordinaten van het eiland', 'De code om in te geven in Swan Station'] }
    ];
    const container = document.getElementById('quiz-container');
    const toggle = document.getElementById('quiz-toggle');
    if(!container || !toggle) return;
    
    toggle.addEventListener('click', ()=>{ container.classList.toggle('hidden'); });
    
    quizzes.forEach((q,i)=>{
      const options = [q.correct].concat(q.wrong).sort(()=>Math.random()-0.5);
      const qEl = document.createElement('div');
      qEl.className='quiz-item';
      
      const header = document.createElement('div');
      header.className='quiz-header';
      
      const gameSpan = document.createElement('span');
      gameSpan.className='quiz-game';
      gameSpan.textContent = q.game;
      header.appendChild(gameSpan);
      
      const qSpan = document.createElement('span');
      qSpan.className='quiz-q';
      qSpan.textContent = q.question;
      header.appendChild(qSpan);
      
      qEl.appendChild(header);
      
      const optionsDiv = document.createElement('div');
      optionsDiv.className='quiz-options';
      
      options.forEach(opt=>{
        const btn = document.createElement('button');
        btn.className='quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click',e=>{
          const isCorrect = opt===q.correct;
          if(isCorrect){ btn.classList.add('correct'); score++; } 
          else { btn.classList.add('incorrect'); }
          Array.from(optionsDiv.querySelectorAll('button')).forEach(b=>{ b.disabled=true; });
          answered++;
          if(answered===quizzes.length){ showScore(); }
        });
        optionsDiv.appendChild(btn);
      });
      
      qEl.appendChild(optionsDiv);
      container.appendChild(qEl);
    });
    
    let score = 0;
    let answered = 0;
    
    function showScore(){
      const scoreEl = document.createElement('div');
      scoreEl.className='quiz-score';
      scoreEl.innerHTML=`<h3>Puntjes: ${score}/${quizzes.length}</h3><p>${getScoreMessage(score, quizzes.length)}</p>`;
      container.appendChild(scoreEl);
    }
    
    function getScoreMessage(s, total){
      const pct = Math.round(s/total*100);
      if(pct===100) return 'Perfect! Lekker liefje! 🎉';
      if(pct>=80) return 'Wow das super goed 😊';
      if(pct>=60) return 'Niet gebuisd ig?? 😄';
      if(pct>=40) return 'Hmm 😉';
      return 'Retard 😂';
    }
  }

  // ---------- init on DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    initCountdown();
    initMessages();
    initRadio();
    initSlideshow();
    initQuiz();
  });
})();