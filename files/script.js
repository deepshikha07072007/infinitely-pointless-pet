(function(){
  const kitten = document.getElementById('kitten');
  const head = document.getElementById('head');
  const body = document.getElementById('body');
  const tail = document.getElementById('tail');
  const bow = document.getElementById('bow');
  const blobWrap = document.getElementById('blobWrap');
  const mouth = document.getElementById('mouth');
  const stage = document.getElementById('stage');
  const scoreNum = document.getElementById('scoreNum');
  const comboNum = document.getElementById('comboNum');
  const bestNum = document.getElementById('bestNum');
  const happyNum = document.getElementById('happyNum');
  const goldenBadge = document.getElementById('goldenBadge');
  const hint = document.getElementById('hint');
  const muteBtn = document.getElementById('muteBtn');
  const darkBtn = document.getElementById('darkBtn');
  const resetBtn = document.getElementById('resetBtn');
  const treatBtn = document.getElementById('treatBtn');
  const playBtn = document.getElementById('playBtn');
  const talkInput = document.getElementById('talkInput');
  const talkBtn = document.getElementById('talkBtn');
  const speechBubble = document.getElementById('speechBubble');
  const customizeBtn = document.getElementById('customizeBtn');
  const customizePanel = document.getElementById('customizePanel');
  const petEmoji = document.getElementById('petEmoji');

  // ---------- persisted state ----------
  let score = parseInt(localStorage.getItem('mochi_score') || '0', 10);
  let best = parseInt(localStorage.getItem('mochi_best') || '0', 10);
  let totalClicks = parseInt(localStorage.getItem('mochi_clicks') || '0', 10);
  let darkMode = localStorage.getItem('mochi_dark') === 'true';
  let muted = localStorage.getItem('mochi_muted') === 'true';
  let goldenUnlocked = localStorage.getItem('mochi_golden') === 'true';
  let happiness = parseFloat(localStorage.getItem('mochi_happy'));
  if (isNaN(happiness)) happiness = 80;

  if (darkMode) document.body.classList.add('dark');
  darkBtn.textContent = darkMode ? '☀️' : '🌙';
  muteBtn.textContent = muted ? '🔇' : '🔊';

  bestNum.textContent = best;
  scoreNum.textContent = score;
  happyNum.textContent = Math.round(happiness) + '%';

  let combo = 1;
  let comboTimer = null;
  const bowColors = ['#ff8fb3', '#8fd3ff', '#c9a6ff', '#ffd76a', '#8fffb0', '#ff6b6b'];
  let bowIndex = 0;

  // ---------- customize: animal + color ----------
  const animalEmojis = { cat: '🐱', dog: '🐶', bunny: '🐰', bear: '🐻' };
  const colorPalette = {
    white:  { fur: '#ffffff', shade: '#f0e9f2', ear: '#ffc2d6' },
    black:  { fur: '#3d3a42', shade: '#2a2730', ear: '#ff9dc0' },
    ginger: { fur: '#ffb46b', shade: '#f2934a', ear: '#fff0d9' },
    grey:   { fur: '#d7dbe0', shade: '#babfc7', ear: '#ffd6e6' },
    brown:  { fur: '#b98a63', shade: '#96693f', ear: '#ffdcc2' },
    pink:   { fur: '#ffd1e8', shade: '#ffb0d0', ear: '#ffffff' },
    gold:   { fur: '#fff3c2', shade: '#ffdf8a', ear: '#ffb84d' },
  };

  function applyAnimal(key, silent) {
    kitten.classList.remove('animal-cat', 'animal-dog', 'animal-bunny', 'animal-bear');
    kitten.classList.add('animal-' + key);
    petEmoji.textContent = animalEmojis[key] || '🐱';
    document.querySelectorAll('.animalBtn').forEach(b => b.classList.toggle('active', b.dataset.animal === key));
    localStorage.setItem('mochi_animal', key);
    if (!silent) floatText(animalEmojis[key] + ' switched!', window.innerWidth/2, 130, 'var(--accent)');
  }

  function applyColor(key, silent) {
    if (key === 'gold' && !goldenUnlocked) return;
    const c = colorPalette[key];
    if (!c) return;
    document.documentElement.style.setProperty('--fur', c.fur);
    document.documentElement.style.setProperty('--fur-shade', c.shade);
    document.documentElement.style.setProperty('--ear-inner', c.ear);
    document.querySelectorAll('.colorSwatch').forEach(b => b.classList.toggle('active', b.dataset.color === key));
    localStorage.setItem('mochi_color', key);
    if (!silent) floatText('new color!', window.innerWidth/2, 150, c.ear);
  }

  document.querySelectorAll('.animalBtn').forEach(b => b.addEventListener('click', () => {
    registerInteraction();
    applyAnimal(b.dataset.animal);
  }));
  document.querySelectorAll('.colorSwatch').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.color === 'gold' && !goldenUnlocked) {
      floatText('reach 150 score to unlock!', window.innerWidth/2, 150, '#ffb84d');
      return;
    }
    registerInteraction();
    applyColor(b.dataset.color);
  }));

  customizeBtn.addEventListener('click', () => customizePanel.classList.toggle('open'));

  // ---------- audio ----------
  let actx = null;
  function ensureAudio() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); }
  function beep(freq, dur, type, gainVal, glideTo) {
    if (muted) return;
    ensureAudio();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.value = gainVal || 0.08;
    osc.connect(gain);
    gain.connect(actx.destination);
    const now = actx.currentTime;
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, now + dur);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.start(now);
    osc.stop(now + dur);
  }
  function meowSound() { beep(520, 0.16, 'sine', 0.09, 340); }
  function purrPop() { beep(700, 0.08, 'triangle', 0.07); setTimeout(() => beep(900, 0.1, 'triangle', 0.06), 60); }
  function zoomiesSound() { [400,500,620,760,900].forEach((f,i)=>setTimeout(()=>beep(f,0.16,'sawtooth',0.05,f+80), i*40)); }
  function goldenSound() { [520,660,780,1040].forEach((f,i)=>setTimeout(()=>beep(f,0.3,'sine',0.08), i*90)); }
  function nomSound() { beep(300, 0.1, 'square', 0.06); setTimeout(()=>beep(220,0.12,'square',0.05), 100); }
  function yawnSound() { beep(220, 0.5, 'sine', 0.05, 160); }
  function sadMeow() { beep(400, 0.3, 'sine', 0.06, 260); }

  // ---------- helpers ----------
  function saveState() {
    localStorage.setItem('mochi_score', score);
    localStorage.setItem('mochi_best', best);
    localStorage.setItem('mochi_clicks', totalClicks);
    localStorage.setItem('mochi_dark', darkMode);
    localStorage.setItem('mochi_muted', muted);
    localStorage.setItem('mochi_golden', goldenUnlocked);
    localStorage.setItem('mochi_happy', happiness);
  }

  function addScore(n) {
    score += n * combo;
    scoreNum.textContent = score;
    if (score > best) { best = score; bestNum.textContent = best; }
    saveState();
    checkMilestones();
  }

  function bumpCombo() {
    combo = Math.min(combo + 1, 20);
    comboNum.textContent = 'x' + combo;
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => { combo = 1; comboNum.textContent = 'x1'; }, 1400);
  }

  function setHappiness(v) {
    happiness = Math.max(0, Math.min(100, v));
    happyNum.textContent = Math.round(happiness) + '%';
    saveState();
  }

  function floatText(text, x, y, color) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.fontWeight = '800';
    el.style.fontSize = (0.9 + Math.random()*0.4) + 'rem';
    el.style.color = color || 'var(--accent)';
    el.style.pointerEvents = 'none';
    el.style.zIndex = 6;
    el.style.transition = 'transform 0.9s ease, opacity 0.9s ease';
    el.style.transform = 'translate(-50%, 0)';
    el.style.opacity = '1';
    stage.appendChild(el);
    requestAnimationFrame(() => { el.style.transform = 'translate(-50%, -60px)'; el.style.opacity = '0'; });
    setTimeout(() => el.remove(), 950);
  }

  function bubbleAbove(text, fontSize) {
    const rect = head.getBoundingClientRect();
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.left = (rect.left + rect.width/2) + 'px';
    el.style.top = (rect.top - 10) + 'px';
    el.style.fontSize = (fontSize || 1.3) + 'rem';
    el.style.zIndex = 6;
    el.style.pointerEvents = 'none';
    el.className = 'bubbleFloat';
    stage.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }

  function spawnParticles(x, y, count, colorList) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 6 + Math.random() * 10;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = colorList[Math.floor(Math.random()*colorList.length)];
      stage.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 120;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const dur = 500 + Math.random() * 500;
      p.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
      ], { duration: dur, easing: 'cubic-bezier(.2,.8,.2,1)' });
      setTimeout(() => p.remove(), dur);
    }
  }

  function heartBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const h = document.createElement('div');
      h.textContent = '🐾';
      h.style.position = 'absolute';
      h.style.left = x + 'px';
      h.style.top = y + 'px';
      h.style.fontSize = (12 + Math.random()*10) + 'px';
      h.style.pointerEvents = 'none';
      h.style.zIndex = 6;
      stage.appendChild(h);
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 100;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 30;
      const dur = 700 + Math.random() * 400;
      h.animate([
        { transform: 'translate(0,0) scale(0.6) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(1) rotate(${Math.random()*60-30}deg)`, opacity: 0 }
      ], { duration: dur, easing: 'ease-out' });
      setTimeout(() => h.remove(), dur);
    }
  }

  const funnyClickMessages = ["mrow", "purrr~", "not amused.", "again??", "*headbutt*", "pspspsp", "ok fine i like it", "stop it (do it again)", "+points i guess", "blink blink", "nap soon?"];
  const boredBubbles = ['💭 ...', '💭 so booored', '💭 entertain me?', '💭 *taps paw*', '💭 anything to do?'];

  function checkMilestones() {
    if (!goldenUnlocked && score >= 150) {
      goldenUnlocked = true;
      saveState();
      const goldSwatch = document.querySelector('.colorSwatch[data-color="gold"]');
      if (goldSwatch) { goldSwatch.classList.remove('locked'); goldSwatch.textContent = ''; }
      goldenSound();
      goldenBadge.classList.add('show');
      setTimeout(() => goldenBadge.classList.remove('show'), 3200);
      applyColor('gold');
      hint.textContent = "you unlocked the golden color. open 🎨 to switch back anytime.";
    }
  }

  // ---------- emotion / idle state machine ----------
  const BORED_AFTER = 10000;
  const SLEEP_AFTER = 25000;
  let lastInteraction = Date.now();
  let currentState = 'content';

  function registerInteraction() {
    const wasSleepy = currentState === 'sleepy';
    lastInteraction = Date.now();
    if (wasSleepy) {
      bubbleAbove('!', 1.4);
      kitten.classList.add('shake');
      setTimeout(() => kitten.classList.remove('shake'), 250);
    }
  }

  function computeMood() {
    const idleFor = Date.now() - lastInteraction;
    if (idleFor > SLEEP_AFTER) return 'sleepy';
    if (idleFor > BORED_AFTER) return happiness < 30 ? 'hungry' : 'bored';
    if (happiness < 25) return 'hungry';
    if (happiness >= 75) return 'happy';
    return 'content';
  }

  function applyMoodVisuals(state) {
    head.classList.remove('sleepy-eyes', 'sparkle-eyes', 'extra-blush', 'bored');
    mouth.classList.remove('happy', 'zzz-mouth', 'bored-mouth');
    body.classList.remove('sleeping');
    head.classList.remove('sleeping');
    tail.classList.remove('slow', 'still', 'fast', 'flick');
    document.getElementById('pawR').classList.remove('tapping');

    if (state === 'sleepy') {
      head.classList.add('sleepy-eyes', 'sleeping');
      body.classList.add('sleeping');
      mouth.classList.add('zzz-mouth');
      tail.classList.add('still');
    } else if (state === 'bored') {
      head.classList.add('bored');
      mouth.classList.add('bored-mouth');
      tail.classList.add('flick');
      document.getElementById('pawR').classList.add('tapping');
    } else if (state === 'hungry') {
      tail.classList.add('slow');
    } else if (state === 'happy') {
      head.classList.add('sparkle-eyes', 'extra-blush');
      mouth.classList.add('happy');
      tail.classList.add('fast');
    }
  }

  let lastBubbleTime = 0;
  function moodTick() {
    setHappiness(happiness - 0.06);
    const newState = computeMood();
    if (newState !== currentState) {
      currentState = newState;
      applyMoodVisuals(currentState);
    }
    const now = Date.now();
    if (now - lastBubbleTime > 4000) {
      if (currentState === 'sleepy') { bubbleAbove('💤', 1.3); yawnSound(); lastBubbleTime = now; }
      else if (currentState === 'bored') { bubbleAbove(boredBubbles[Math.floor(Math.random()*boredBubbles.length)], 1.1); lastBubbleTime = now; }
      else if (currentState === 'hungry') { bubbleAbove('🍖?', 1.2); if(Math.random()<0.5) sadMeow(); lastBubbleTime = now; }
    }
    requestAnimationFrame(() => setTimeout(moodTick, 1000));
  }
  applyMoodVisuals(currentState);
  setTimeout(moodTick, 1000);

  // ---------- pet / click ----------
  let clickCount = 0;
  let blinkTimeout = null;
  function doSquish(clientX, clientY) {
    registerInteraction();
    clickCount++;
    totalClicks++;
    bumpCombo();
    addScore(1);
    setHappiness(happiness + 1.5);
    meowSound();

    head.classList.add('blink');
    mouth.classList.add('hurt');
    kitten.style.transform = 'scale(1.06, 0.93)';
    clearTimeout(blinkTimeout);
    blinkTimeout = setTimeout(() => {
      kitten.style.transform = 'scale(1,1)';
      head.classList.remove('blink');
      mouth.classList.remove('hurt');
    }, 160);

    const rect = head.getBoundingClientRect();
    const px = clientX !== undefined ? clientX : rect.left + rect.width/2;
    const py = clientY !== undefined ? clientY : rect.top + rect.height/2;
    spawnParticles(px, py, 5, ['#ffd6e6', '#ffe9d6', '#ffffff']);

    if (clickCount % 5 === 0) floatText(funnyClickMessages[Math.floor(Math.random()*funnyClickMessages.length)], px, py - 20);
    saveState();
  }

  kitten.addEventListener('click', (e) => { doSquish(e.clientX, e.clientY); });

  kitten.addEventListener('dblclick', (e) => {
    registerInteraction();
    purrPop();
    zoomiesSound();
    addScore(10);
    setHappiness(happiness + 5);
    kitten.classList.add('shake');
    mouth.classList.add('happy');
    setTimeout(() => { kitten.classList.remove('shake'); mouth.classList.remove('happy'); }, 300);
    const rect = kitten.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    spawnParticles(cx, cy, 16, ['#ffd6e6','#c9a6ff','#8fd3ff','#ffe9a6']);
    heartBurst(cx, cy, 8);
    floatText('ZOOMIES! +10×combo!', cx, cy - 60, '#ff8fb3');
  });

  let scrollLock = false;
  window.addEventListener('wheel', (e) => {
    if (scrollLock) return;
    scrollLock = true;
    setTimeout(() => scrollLock = false, 220);
    registerInteraction();
    bowIndex = (bowIndex + (e.deltaY > 0 ? 1 : -1) + bowColors.length) % bowColors.length;
    const c = bowColors[bowIndex];
    document.documentElement.style.setProperty('--accent', c);
    const rect = head.getBoundingClientRect();
    floatText('new bow!', rect.left + rect.width/2, rect.top - 30, c);
  }, { passive: true });

  // ---------- drag to stretch ----------
  let dragging = false;
  let startX = 0, startY = 0;
  function pointerDown(e) { dragging = true; registerInteraction(); blobWrap.classList.add('dragging'); const p = getPoint(e); startX = p.x; startY = p.y; }
  function pointerMove(e) {
    if (!dragging) return;
    const p = getPoint(e);
    const dx = (p.x - startX) * 0.35;
    const dy = (p.y - startY) * 0.35;
    const maxStretch = 50;
    const cdx = Math.max(-maxStretch, Math.min(maxStretch, dx));
    const cdy = Math.max(-maxStretch, Math.min(maxStretch, dy));
    kitten.style.transform = `translate(${cdx}px, ${cdy}px) scale(${1 + Math.abs(cdx)/350}, ${1 + Math.abs(cdy)/350})`;
  }
  function pointerUp() {
    if (!dragging) return;
    dragging = false;
    blobWrap.classList.remove('dragging');
    kitten.style.transition = 'transform 0.5s cubic-bezier(.34,1.56,.64,1)';
    kitten.style.transform = 'translate(0,0) scale(1,1)';
    setTimeout(() => { kitten.style.transition = ''; }, 500);
  }
  function getPoint(e) { if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }

  kitten.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  kitten.addEventListener('touchstart', pointerDown, { passive: true });
  window.addEventListener('touchmove', pointerMove, { passive: true });
  window.addEventListener('touchend', pointerUp);

  // ---------- treat / feed ----------
  treatBtn.addEventListener('click', () => {
    registerInteraction();
    const rect = kitten.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const topY = rect.top - 40;
    const treat = document.createElement('div');
    treat.textContent = '🍖';
    treat.style.position = 'absolute';
    treat.style.left = cx + 'px';
    treat.style.top = topY + 'px';
    treat.style.fontSize = '28px';
    treat.style.zIndex = 8;
    treat.style.transform = 'translate(-50%, 0)';
    stage.appendChild(treat);
    treat.animate([
      { transform: 'translate(-50%, 0) rotate(0deg)' },
      { transform: `translate(-50%, ${rect.top + rect.height*0.4 - topY}px) rotate(180deg)` }
    ], { duration: 450, easing: 'ease-in' }).onfinish = () => {
      treat.remove();
      nomSound();
      mouth.classList.add('talk-open');
      setTimeout(() => mouth.classList.remove('talk-open'), 180);
      spawnParticles(cx, rect.top + rect.height*0.4, 10, ['#ffd6a5','#ffb0cd','#ffffff']);
      setHappiness(happiness + 12);
      addScore(3);
      floatText('nom nom!', cx, rect.top, '#ffb84d');
    };
  });

  // ---------- play ----------
  playBtn.addEventListener('click', () => {
    registerInteraction();
    const rect = kitten.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height*0.55;
    const yarn = document.createElement('div');
    yarn.textContent = '🧶';
    yarn.style.position = 'absolute';
    yarn.style.left = (cx - 60) + 'px';
    yarn.style.top = cy + 'px';
    yarn.style.fontSize = '26px';
    yarn.style.zIndex = 8;
    stage.appendChild(yarn);
    yarn.animate([
      { transform: 'translate(0,0) rotate(0deg)' },
      { transform: 'translate(120px, -10px) rotate(360deg)' }
    ], { duration: 500, easing: 'ease-out' }).onfinish = () => yarn.remove();

    kitten.classList.add('shake');
    setTimeout(() => kitten.classList.remove('shake'), 300);
    purrPop();
    spawnParticles(cx, cy, 8, ['#c9a6ff','#8fd3ff','#ffffff']);
    setHappiness(happiness + 8);
    addScore(4);
    floatText('wheee!', cx, cy - 30, '#8fd3ff');
  });

  // ---------- talking tom feature ----------
  let talkAnimTimer = null;
  function animateTalking(durationMs) {
    let open = false;
    clearInterval(talkAnimTimer);
    talkAnimTimer = setInterval(() => {
      open = !open;
      mouth.classList.toggle('talk-open', open);
    }, 130);
    setTimeout(() => {
      clearInterval(talkAnimTimer);
      mouth.classList.remove('talk-open');
    }, durationMs);
  }

  function showSpeechBubble(text) {
    const rect = head.getBoundingClientRect();
    speechBubble.textContent = text;
    speechBubble.style.left = (rect.width/2) + 'px';
    speechBubble.style.top = '-80px';
    speechBubble.style.transform = 'translate(-50%, 0)';
    speechBubble.classList.add('show');
    clearTimeout(showSpeechBubble._t);
    showSpeechBubble._t = setTimeout(() => speechBubble.classList.remove('show'), 3200);
  }

  function mochiTalk(text) {
    if (!text.trim()) return;
    registerInteraction();
    showSpeechBubble(text.length > 60 ? text.slice(0,57) + '...' : text);
    setHappiness(happiness + 3);
    addScore(2);

    let approxDuration = Math.min(4500, 500 + text.length * 60);

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.pitch = 1.9;
        utter.rate = 1.15;
        utter.volume = muted ? 0 : 1;
        utter.onstart = () => animateTalking(approxDuration + 500);
        utter.onend = () => mouth.classList.remove('talk-open');
        utter.onerror = () => animateTalking(approxDuration);
        window.speechSynthesis.speak(utter);
      } catch (err) {
        animateTalking(approxDuration);
      }
    } else {
      animateTalking(approxDuration);
    }
  }

  talkBtn.addEventListener('click', () => { mochiTalk(talkInput.value); talkInput.value = ''; });
  talkInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { mochiTalk(talkInput.value); talkInput.value = ''; } });

  // ---------- controls ----------
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
    saveState();
    if (!muted) { ensureAudio(); beep(600, 0.1, 'sine', 0.08); }
  });

  darkBtn.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark', darkMode);
    darkBtn.textContent = darkMode ? '☀️' : '🌙';
    saveState();
  });

  resetBtn.addEventListener('click', () => {
    score = 0;
    combo = 1;
    scoreNum.textContent = 0;
    comboNum.textContent = 'x1';
    saveState();
    floatText('score reset', window.innerWidth/2, 140, '#ff8fb3');
  });

  // ---------- init customize state ----------
  let savedAnimal = localStorage.getItem('mochi_animal') || 'cat';
  let savedColor = localStorage.getItem('mochi_color') || 'white';
  if (savedColor === 'gold' && !goldenUnlocked) savedColor = 'white';
  applyAnimal(savedAnimal, true);
  if (goldenUnlocked) {
    const goldSwatch = document.querySelector('.colorSwatch[data-color="gold"]');
    if (goldSwatch) { goldSwatch.classList.remove('locked'); goldSwatch.textContent = ''; }
  }
  applyColor(savedColor, true);

  // idle breathing
  let breathe = 0;
  function breatheLoop() {
    if (!dragging) {
      breathe += currentState === 'sleepy' ? 0.008 : 0.02;
      const s = 1 + Math.sin(breathe) * (currentState === 'sleepy' ? 0.02 : 0.012);
      kitten.style.transform = `scale(${s}, ${2-s})`;
    }
    requestAnimationFrame(breatheLoop);
  }
  requestAnimationFrame(breatheLoop);

  function idleBlink() {
    if (!dragging && currentState !== 'sleepy') {
      head.classList.add('blink');
      setTimeout(() => head.classList.remove('blink'), 140);
    }
    setTimeout(idleBlink, 2500 + Math.random() * 3500);
  }
  setTimeout(idleBlink, 3000);

})();
