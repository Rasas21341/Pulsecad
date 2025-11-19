(function(){
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const msgEl = document.getElementById('msg');

  // base logical size (matches canvas attributes in HTML)
  const BASE_W = canvas.width; const BASE_H = canvas.height;
  const W = BASE_W; const H = BASE_H;
  // scale canvas for devicePixelRatio for crisp rendering on phones
  (function setupDPR(){
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = BASE_W + 'px';
    canvas.style.height = BASE_H + 'px';
    canvas.width = Math.floor(BASE_W * dpr);
    canvas.height = Math.floor(BASE_H * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  })();

  // Game objects
  const bird = {x:80, y: H/2, w:34, h:24, vel:0, frame:0};
  // Load game configuration (can be overridden by adding `game-config.js` that
  // defines `window.GAME_CONFIG`). Defaults are an "easy" setup.
  const DEFAULT_GAME_CONFIG = { grav: 0.30, jump: -13, spawnRate: 160, speed: 1.2, gap: 220 };
  const GAME_CONFIG = (window.GAME_CONFIG || {});
  const cfg = Object.assign({}, DEFAULT_GAME_CONFIG, GAME_CONFIG);

  // Apply config values
  let GRAV = Number(cfg.grav) || DEFAULT_GAME_CONFIG.grav;
  let JUMP = Number(cfg.jump) || DEFAULT_GAME_CONFIG.jump;

  const pipes = [];
  let frame = 0; let spawnRate = Number(cfg.spawnRate) || DEFAULT_GAME_CONFIG.spawnRate; let speed = Number(cfg.speed) || DEFAULT_GAME_CONFIG.speed;
  const GAP = Number(cfg.gap) || DEFAULT_GAME_CONFIG.gap;

  let score = 0; let state = 'menu';
  let best = parseInt(localStorage.getItem('flapthing_best') || '0', 10) || 0;

  // Sign-in state (simple/mock)
  let currentUser = null; // {email: '...'} when signed in
  // Firebase / live stats
  let firebaseApp = null, firebaseAuth = null, firebaseDb = null, dbScoresRef = null, dbPlayCountRef = null;
  let globalBest = best, playerCount = 0;


  // Audio (small synthesized effects)
  let audioCtx = null;
  function ensureAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ audioCtx = null; } } }
  function playBeep(freq, length, type='sine'){ ensureAudio(); if(!audioCtx) return; const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type = type; o.frequency.value = freq; o.connect(g); g.connect(audioCtx.destination); g.gain.value = 0.001; const now = audioCtx.currentTime; g.gain.exponentialRampToValueAtTime(0.08, now + 0.01); o.start(now); o.stop(now + length); g.gain.exponentialRampToValueAtTime(0.001, now + length); }
  function playFlap(){ playBeep(700, 0.08, 'triangle'); }
  function playHit(){ playBeep(120, 0.25, 'sawtooth'); }
  function playPoint(){ playBeep(1100, 0.06, 'sine'); }

  function reset(){
    bird.y = H/2; bird.vel = 0; bird.frame = 0; pipes.length = 0; frame = 0; score = 0; speed = Number(cfg.speed) || DEFAULT_GAME_CONFIG.speed; state='menu';
    updateHUD('Press Space / Click / Tap to start');
    scoreEl.innerText = score;
    updateBottomScore();
    draw();
  }

  function spawnPipe(){
    const gap = GAP; const minTop = 40; const maxTop = H - gap - 80;
    const top = Math.floor(minTop + Math.random()*(maxTop - minTop));
    pipes.push({x:W, top:top, bottom: top + gap, w:60, passed:false});
  }

  function update(){
    frame++;
    if(state==='playing'){
      bird.vel += GRAV; bird.y += bird.vel; bird.frame++;

      if(frame % spawnRate === 0) spawnPipe();

      for(let i = pipes.length-1;i>=0;i--){
        const p = pipes[i]; p.x -= speed;
        if(!p.passed && p.x + p.w < bird.x){ p.passed = true; score++; scoreEl.innerText = score; playPoint(); speed = Math.min(3.5, speed + 0.02); }
        if(p.x + p.w < -10) pipes.splice(i,1);
        if(collides(bird, {x:p.x, y:0, w:p.w, h:p.top}) || collides(bird, {x:p.x, y:p.bottom, w:p.w, h:H - p.bottom})){
          if(state!=='dead'){ state = 'dead'; playHit(); updateHUD('Game over — Click / Space to restart'); saveAndSubmit(); }
        }
      }

      // update bottom badge while playing
      updateBottomScore();

      if(bird.y + bird.h > H - 10 || bird.y < 0){ if(state!=='dead'){ state='dead'; playHit(); updateHUD('Game over — Click / Space to restart'); saveAndSubmit(); } }
    }
  }

  function saveBest(){ if(score > best){ best = score; try{ localStorage.setItem('flapthing_best', String(best)); }catch(e){} } }
  // Save best and submit to Firebase if available
  function saveAndSubmit(){
    saveBest();
    if(firebaseApp && currentUser && typeof submitScoreToFirebase === 'function'){
      submitScoreToFirebase(score);
    }
    updateBottomScore();
  }

  function collides(a,b){
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function draw(){
    // clear
    ctx.clearRect(0,0,W,H);

    // sky (soft gradient)
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#87e0ff'); g.addColorStop(1,'#bfefff');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

    // pipes
    pipes.forEach(p=>{
      ctx.fillStyle = '#2ecc71'; ctx.fillRect(p.x, 0, p.w, p.top);
      ctx.fillRect(p.x, p.bottom, p.w, H - p.bottom);
      // pipe inner shadow
      ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(p.x, p.top - 6, p.w, 6);
    });

    // ground
    ctx.fillStyle = '#ded895'; ctx.fillRect(0, H-14, W, 14);

    // bird (rotates with velocity)
    const cx = bird.x + bird.w/2; const cy = bird.y + bird.h/2;
    const angle = Math.max(Math.min(bird.vel / 10, 1), -1);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    // body
    ctx.fillStyle = '#ffd633'; ctx.beginPath(); ctx.ellipse(0,0,bird.w/2,bird.h/2,0,0,Math.PI*2); ctx.fill();
    // wing (simple)
    ctx.fillStyle = '#ffbf33'; ctx.beginPath(); ctx.ellipse(-4,0,8,4,0,0,Math.PI*2); ctx.fill();
    // eye
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(8, -4, 3, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // score (big)
    ctx.fillStyle = '#024'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(score, W/2, 60);

    // menu / death overlays
    if(state==='menu'){
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(20, 160, W-40, 90);
      ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif'; ctx.textAlign='center'; ctx.fillText('Click / Tap / Space to start', W/2, 210);
    }

    if(state==='dead'){
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(20, 170, W-40, 120);
      ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif'; ctx.textAlign='center';
      ctx.fillText('Game Over', W/2, 210);
      ctx.fillStyle = '#ffd633'; ctx.font = '16px sans-serif'; ctx.fillText('Score: ' + score, W/2, 240);
      ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.fillText('Best: ' + best, W/2, 265);
      ctx.fillStyle = '#ddd'; ctx.font = '13px sans-serif'; ctx.fillText('Click / Space to restart', W/2, 295);
    }
  }

  function loop(){ update(); draw(); requestAnimationFrame(loop); }

  function flap(){
    // resume audio context on first user gesture (mobile/autoplay policy)
    ensureAudio(); if(audioCtx && audioCtx.state === 'suspended'){ audioCtx.resume(); }
    if(!currentUser){ showSignInOverlay(); return; }
    if(state==='menu'){ state='playing'; updateHUD(''); bird.vel = JUMP; playFlap(); }
    else if(state==='playing'){ bird.vel = JUMP; playFlap(); }
    else if(state==='dead'){ reset(); }
  }

  function updateHUD(text){ msgEl.innerText = text || ''; scoreEl.innerText = score; }

  // update bottom score badge if present
  function updateBottomScore(){ const b = document.getElementById('bottomScore'); if(b) b.innerText = score; }

  // inputs
  window.addEventListener('keydown', e=>{ if(e.code==='Space'){ e.preventDefault(); flap(); } });
  canvas.addEventListener('click', e=>{ flap(); });
  canvas.addEventListener('touchstart', e=>{ e.preventDefault(); flap(); });

  // --- Sign-in & Admin UI handling ---
  function showSignInOverlay(){
    const el = document.getElementById('signinOverlay'); if(el) el.style.display = 'flex';
  }
  function hideSignInOverlay(){ const el = document.getElementById('signinOverlay'); if(el) el.style.display = 'none'; }
  function onSignIn(email){ currentUser = {email: email}; hideSignInOverlay(); updateHUD('Signed in: ' + email); console.log('Signed in as', email); }

  // Persist email locally for non-Firebase sign-ins so it stays on this device/browser
  function persistLocalEmail(email){ try{ localStorage.setItem('flapthing_email', String(email)); }catch(e){} }

  // Admin credentials (picked for you)
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'flapmaster2025';

  // wire UI if present
  const signinEl = document.getElementById('signinOverlay');
  if(signinEl){
    document.getElementById('googleBtn').addEventListener('click', ()=>{
      if(window.firebase && window.FIREBASE_CONFIG){
        if(!firebaseApp) initFirebase();
        const provider = new firebase.auth.GoogleAuthProvider();
        firebaseAuth.signInWithPopup(provider).catch(err=>{ alert('Sign-in failed: '+err.message); });
      } else {
        alert('No Firebase config found. Copy firebase-config.example.js to firebase-config.js and add your project config to enable Google sign-in.');
      }
    });
    document.getElementById('emailBtn').addEventListener('click', ()=>{ document.getElementById('emailForm').style.display = 'block'; });
    document.getElementById('emailSubmit').addEventListener('click', ()=>{ const v = document.getElementById('emailInput').value||''; if(v.trim()){ onSignIn(v.trim()); } else { alert('Enter an email.'); }});
    // show overlay initially to require sign-in
    showSignInOverlay();
  }

  // admin modal
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  if(adminBtn && adminModal){
    adminBtn.addEventListener('click', ()=>{ adminModal.style.display = 'flex'; document.getElementById('adminUser').focus(); });
    document.getElementById('adminCancel').addEventListener('click', ()=>{ adminModal.style.display = 'none'; });
    document.getElementById('adminSubmit').addEventListener('click', ()=>{
      const u = document.getElementById('adminUser').value||'';
      const p = document.getElementById('adminPass').value||'';
      if(u === ADMIN_USER && p === ADMIN_PASS){
        document.getElementById('adminPanel').style.display = 'block';
        // show local and global best if available
        document.getElementById('adminBest').innerText = best + (firebaseApp ? (' (global: ' + globalBest + ', players: ' + playerCount + ')') : '');
      } else { alert('Invalid credentials'); }
    });
    document.getElementById('closeAdmin').addEventListener('click', ()=>{ adminModal.style.display = 'none'; });
    document.getElementById('resetBest').addEventListener('click', ()=>{ if(confirm('Reset best score?')){ best = 0; try{ localStorage.setItem('flapthing_best','0'); }catch(e){} document.getElementById('adminBest').innerText = best; alert('Best score reset'); }});
  }

  // init
  scoreEl.innerText = score; msgEl.innerText = 'Press Space / Click / Tap to start';

  // Difficulty presets (used when no external game-config.js provided)
  const PRESETS = {
    // easier jump magnitudes (less negative = smaller upward impulse)
    easy: {grav:0.30, jump:-11, spawnRate:160, speed:1.2, gap:220},
    normal: {grav:0.45, jump:-9, spawnRate:120, speed:1.8, gap:170},
    hard: {grav:0.65, jump:-7, spawnRate:90, speed:2.6, gap:130}
  };

  function applyDifficulty(mode){
    const m = (mode && (window.GAME_CONFIG && window.GAME_CONFIG.mode === mode)) ? window.GAME_CONFIG : PRESETS[mode] || PRESETS['normal'];
    // if user provided GAME_CONFIG, use it (preserve explicit overrides)
    const used = Object.assign({}, PRESETS['normal'], window.GAME_CONFIG || {}, PRESETS[mode] || {});
    GRAV = Number(used.grav) || GRAV;
    JUMP = Number(used.jump) || JUMP;
    spawnRate = Number(used.spawnRate) || spawnRate;
    speed = Number(used.speed) || speed;
    // update gap global if present
    if(typeof used.gap !== 'undefined') window.GAP = Number(used.gap);
    // persist selection
    try{ localStorage.setItem('flapthing_difficulty', mode); }catch(e){}
    // update UI buttons
    const btns = document.querySelectorAll('.diff-btn'); btns.forEach(b=>{ b.classList.toggle('active', b.dataset.mode === mode); });
  }

  // Attach difficulty buttons if present
  const diffControls = document.getElementById('diffControls');
  if(diffControls){
    diffControls.querySelectorAll('.diff-btn').forEach(b=>{
      b.addEventListener('click', ()=>{ const m = b.dataset.mode || 'normal'; applyDifficulty(m); });
    });
  }

  // Apply saved or default difficulty before starting
  const savedMode = localStorage.getItem('flapthing_difficulty') || (window.GAME_CONFIG && window.GAME_CONFIG.mode) || 'normal';
  applyDifficulty(savedMode);

  // hook mobile flap button if present
  const touchBtn = document.getElementById('touchFlap');
  if(touchBtn){
    touchBtn.addEventListener('touchstart', e=>{ e.preventDefault(); flap(); });
    touchBtn.addEventListener('click', e=>{ e.preventDefault(); flap(); });
  }

  // ensure bottom badge shows initial value
  updateBottomScore();

  draw(); loop();

  // Initialize Firebase if config is present
  function initFirebase(){
    try{
      if(window.FIREBASE_CONFIG && window.firebase){
        firebaseApp = firebase.initializeApp(window.FIREBASE_CONFIG);
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.database();
        dbScoresRef = firebaseDb.ref('flapthing/scores');
        dbPlayCountRef = firebaseDb.ref('flapthing/playCount');

        // auth state listener
        firebaseAuth.onAuthStateChanged(user=>{
          if(user){
            currentUser = {email: user.email, uid: user.uid};
            hideSignInOverlay(); updateHUD('Signed in: ' + (user.email||user.uid));
            // Sync user's remote best score into local storage so it's available across browsers/devices
            try{
              if(dbScoresRef){
                const userRef = dbScoresRef.child(user.uid);
                userRef.once('value').then(snap=>{
                  const data = snap.val() || {};
                  const remoteBest = parseInt(data.best || 0, 10) || 0;
                  const localBest = parseInt(localStorage.getItem('flapthing_best') || '0', 10) || 0;
                  // prefer the higher best between local and remote; update both places
                  const merged = Math.max(localBest, remoteBest);
                  if(merged !== localBest){
                    try{ localStorage.setItem('flapthing_best', String(merged)); }catch(e){}
                    best = merged;
                  }
                  if(merged !== remoteBest){
                    // push merged best to remote
                    userRef.update({email: user.email || '', best: merged}).catch(()=>{});
                  }
                }).catch(()=>{});
              }
            }catch(e){console.warn('Failed to sync remote best', e);}
          }
          else { currentUser = null; showSignInOverlay(); }
        });

        // Listen for scores to compute global best and player count
        dbScoresRef.on('value', snap=>{
          const data = snap.val() || {};
          globalBest = 0; playerCount = 0;
          Object.keys(data).forEach(k=>{ const v = data[k]; if(v && v.best){ globalBest = Math.max(globalBest, v.best); playerCount++; } });
          // update admin display if open
          const adminBestEl = document.getElementById('adminBest'); if(adminBestEl){ adminBestEl.innerText = best + ' (global: ' + globalBest + ', players: ' + playerCount + ')'; }
        });
      }
    }catch(e){ console.warn('Firebase init failed', e); }
  }

  function submitScoreToFirebase(scoreVal){
    if(!firebaseApp || !firebaseAuth || !currentUser) return;
    const uid = currentUser.uid; const email = currentUser.email || '';
    const userRef = dbScoresRef.child(uid);
    // transactionally update user's best
    userRef.transaction(old => {
      if(!old) return {email: email, best: scoreVal};
      if(!old.best || scoreVal > old.best) old.best = scoreVal;
      return old;
    }).then(()=>{
      // increment play count
      if(dbPlayCountRef){ dbPlayCountRef.transaction(n => (n||0) + 1).catch(()=>{}); }
    }).catch(()=>{});
  }

  // Try to initialize firebase automatically if user provided config
  if(window.FIREBASE_CONFIG && window.firebase){ try{ initFirebase(); }catch(e){console.warn(e);} }

})();
