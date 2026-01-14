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
    function update(){
      const now = new Date();
      if(targetDate - now < 0){ targetDate.setFullYear(targetDate.getFullYear()+1); }
      const diff = targetDate - now;
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

  // ---------- Messages
  function initMessages(){
    const form = document.getElementById('message-form');
    const list = document.getElementById('messages');
    if(!form || !list) return;
    const KEY = 'liefje_messages_v1';
    function load(){ const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
    function save(items){ localStorage.setItem(KEY, JSON.stringify(items)); }
    function render(){
      const items = load();
      list.innerHTML = '';
      if(items.length===0){ list.innerHTML = '<div class="small">No messages yet — be the first!</div>'; return; }
      items.slice().reverse().forEach(it=>{
        const el = document.createElement('div'); el.className='message';
        el.innerHTML = `<strong>${escapeHtml(it.name)}</strong> <div class="small">${new Date(it.time).toLocaleString()}</div><div style="margin-top:6px">${escapeHtml(it.text)}</div>`;
        list.appendChild(el);
      });
    }
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const name = (form.querySelector('[name=name]')?.value || '').trim() || 'Anonymous';
      const text = (form.querySelector('[name=text]')?.value || '').trim();
      if(!text) return;
      const items = load(); items.push({name,text,time:Date.now()}); save(items); form.reset(); render();
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

  // ---------- init on DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    initCountdown();
    initMessages();
    initRadio();
    initSlideshow();
  });
})();