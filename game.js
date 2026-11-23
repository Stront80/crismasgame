/* «Рождество у бабули». Вся графика и звук создаются локально, без сетевых запросов. */
(function () {
  'use strict';
  const WIDTH = 600, HEIGHT = 700;
  let BASKET_Y = 613;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function initialState() {
    return { score: 0, lives: 3, remaining: 60, elapsed: 0, basketX: 300,
      items: [], spawnIn: 0.45, ended: false, events: [] };
  }

  /* Чистая функция позволяет проверять столкновения и завершение раунда без браузера.
     Координаты не зависят от размера экрана, а генератор случайных чисел заменяем в тестах. */
  function advanceState(previous, seconds, input = {}, random = Math.random) {
    if (previous.ended || seconds <= 0) return { ...previous, events: [] };
    const dt = Math.min(seconds, previous.remaining);
    const s = { ...previous, items: previous.items.map(item => ({ ...item })), events: [] };
    s.elapsed += dt;
    s.remaining = Math.max(0, s.remaining - dt);
    s.basketX = clamp(Number.isFinite(input.targetX) ? input.targetX : s.basketX + (input.direction || 0) * 430 * dt, 58, WIDTH - 58);
    s.spawnIn -= dt;
    if (s.spawnIn <= 0 && s.remaining > 0) {
      const snowball = random() < 0.25;
      s.items.push({ x: 35 + random() * (WIDTH - 70), y: -28, type: snowball ? 'snow' : 'gift',
        speed: 150 + Math.min(120, s.elapsed * 2) + random() * 45, color: Math.floor(random() * 3), rotation: random() * 0.4 - 0.2 });
      s.spawnIn = Math.max(0.4, 0.84 - s.elapsed * 0.005);
    }
    s.items = s.items.filter(item => {
      const oldY = item.y;
      item.y += item.speed * dt;
      // Проверяем весь пройденный отрезок: быстрый подарок не пролетит сквозь корзинку.
      if (oldY <= BASKET_Y + 8 && item.y >= BASKET_Y - 18 && Math.abs(item.x - s.basketX) < 62 && s.lives > 0) {
        if (item.type === 'gift') { s.score += 10; s.events.push({ type: 'gift', x: item.x }); }
        else { s.lives = Math.max(0, s.lives - 1); s.events.push({ type: 'hit', x: item.x }); }
        return false;
      }
      return item.y < HEIGHT + 40;
    });
    s.ended = s.remaining <= 0 || s.lives <= 0;
    return s;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { initialState, advanceState };
  if (typeof document === 'undefined') return;

  const translations = {
    ru: {
      title: 'Рождество у бабули', subtitle: 'Соберём подарки для всей семьи!', eyebrow: 'ТЁПЛАЯ ИГРА ДЛЯ ВСЕЙ СЕМЬИ',
      start: 'Играть', instructions: 'Двигайте корзинку пальцем и ловите подарки', giftRule: 'Подарок: +10 очков',
      snowRule: 'Снежок: −1 сердечко', timeRule: '60 секунд · 3 сердечка', best: 'Рекорд', score: 'Счёт', time: 'Время', lives: 'Жизни',
      pause: 'Пауза', paused: 'Немного отдохнём?', resume: 'Продолжить', again: 'Ещё раз', home: 'В начало',
      resultTitle: 'С Рождеством, родные!', resultLabel: 'Ваш результат', copyright: '© YaCo 2026', feedback: 'Обратная связь',
      keyboardHint: 'На компьютере: ← → или A / D', grandmaNote: 'Бабуле 99 лет, а её любви хватит на всех!', loading: 'Игра загружается…',
      canvasLabel: 'Игровое поле: ловите подарки корзинкой, избегайте снежков', left: 'Корзинка влево', right: 'Корзинка вправо',
      settingsLabel: 'Настройки', playgroundLabel: 'Игровое поле', hudLabel: 'Результаты игры', rulesLabel: 'Правила игры',
      grandmaAlt: 'Портрет любимой бабули', musicOn: 'Музыка: вкл.', musicOff: 'Музыка: выкл.', sfxOn: 'Звуки: вкл.', sfxOff: 'Звуки: выкл.',
      langLabel: 'Switch to English', pausedNote: 'Игра и музыка на паузе. Продолжим, когда будете готовы.',
      resultGood: 'Какая большая корзинка подарков! Пусть каждому в нашей семье достанется немного рождественского тепла. Обнимаю, ваша бабуля.',
      resultWarm: 'Спасибо за помощь, мои хорошие! Самый дорогой подарок — это вы. Пусть дома вас всегда ждут любовь и тепло. Ваша бабуля.',
      beginAnnouncement: 'Игра началась. Ловите подарки и избегайте снежков.', caughtAnnouncement: 'Подарок пойман!', hitAnnouncement: 'Осторожно, снежок!',
      newBest: 'Новый рекорд!', bestPrefix: 'Рекорд: ', resultAnnounce: 'Раунд завершён. Очки: '
    },
    en: {
      title: 'Christmas at Grandma’s', subtitle: 'Let’s collect gifts for the whole family!', eyebrow: 'A WARM LITTLE GAME FOR EVERYONE',
      start: 'Let’s play', instructions: 'Move the basket with your finger and catch the gifts', giftRule: 'Gift: +10 points',
      snowRule: 'Snowball: −1 heart', timeRule: '60 seconds · 3 hearts', best: 'Best', score: 'Score', time: 'Time', lives: 'Lives',
      pause: 'Pause', paused: 'A little breather?', resume: 'Continue', again: 'Play again', home: 'Home',
      resultTitle: 'Merry Christmas, my dears!', resultLabel: 'Your score', copyright: '© YaCo 2026', feedback: 'Feedback',
      keyboardHint: 'On a computer: ← → or A / D', grandmaNote: 'Grandma is 99, with enough love for everyone!', loading: 'Loading the game…',
      canvasLabel: 'Game field: catch gifts in the basket and avoid snowballs', left: 'Move basket left', right: 'Move basket right',
      settingsLabel: 'Settings', playgroundLabel: 'Game area', hudLabel: 'Game status', rulesLabel: 'Game rules',
      grandmaAlt: 'Portrait of our beloved grandma', musicOn: 'Music: on', musicOff: 'Music: off', sfxOn: 'Sounds: on', sfxOff: 'Sounds: off',
      langLabel: 'Переключить на русский', pausedNote: 'The game and music are paused. Continue whenever you are ready.',
      resultGood: 'What a lovely basket of gifts! May everyone in our family share a little Christmas warmth. Sending hugs, Grandma.',
      resultWarm: 'Thank you for helping, my dears! You are the most precious gift. May love and warmth always welcome you home. Love, Grandma.',
      beginAnnouncement: 'The game has begun. Catch the gifts and avoid snowballs.', caughtAnnouncement: 'Gift caught!', hitAnnouncement: 'Watch out, a snowball!',
      newBest: 'A new best!', bestPrefix: 'Best: ', resultAnnounce: 'Round complete. Score: '
    }
  };
  const $ = id => document.getElementById(id);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Игра работает и при запрете хранилища. */ } };
  let lang = read('yaco-grandma-lang', 'ru');
  if (!translations[lang]) lang = 'ru';
  let best = Math.max(0, Number(read('yaco-grandma-best', 0)) || 0);
  let musicEnabled = read('yaco-grandma-music', true) === true;
  let sfxEnabled = read('yaco-grandma-sfx', true) === true;
  let state = initialState(), mode = 'intro', lastFrame = 0, targetX = null;
  let resultIsBest = false;
  const pressed = new Set(), held = new Set();
  const canvas = $('game-canvas'), ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particles = [];
  let flash = 0;
  const t = key => translations[lang][key] || key;
  const setText = (id, value) => { const element = $(id); if (element) element.textContent = value; };
  const announce = text => setText('game-announcement', text);

  /* Web Audio запускается только в обработчике пользовательского жеста.
     Ноты хранятся в коде: игре не нужны скачивание аудио и сторонние библиотеки. */
  let audio = null, master = null, musicTimer = null, noteIndex = 0;
  const activeVoices = new Set();
  const melody = [72, 76, 79, 76, 74, 77, 81, 77, 71, 74, 79, 74, 72, 76, 79, 84,
    81, 79, 77, 76, 74, 76, 79, 74, 72, 71, 69, 71, 72, 76, 72, null];
  function initAudio() {
    try {
      if (!audio) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        audio = new Audio(); master = audio.createGain(); master.gain.value = 0.35; master.connect(audio.destination);
      }
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch { /* При отсутствии аудио игра сохраняет все остальные возможности. */ }
  }
  function tone(frequency, duration, volume, type = 'sine', offset = 0) {
    if (!audio || audio.state !== 'running' || mode !== 'playing') return;
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    const at = audio.currentTime + offset;
    oscillator.type = type; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(gain); gain.connect(master); activeVoices.add(oscillator);
    oscillator.onended = () => { activeVoices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(at); oscillator.stop(at + duration + 0.02);
  }
  function musicTick() {
    if (!musicEnabled || mode !== 'playing') return;
    const note = melody[noteIndex % melody.length];
    if (note) { const hz = 440 * 2 ** ((note - 69) / 12); tone(hz, 0.8, 0.17); tone(hz / 2, 0.8, 0.045); }
    if (noteIndex % 4 === 0) tone([130.81, 174.61, 196, 130.81][Math.floor(noteIndex / 4) % 4], 1.8, 0.08, 'triangle');
    noteIndex++;
  }
  function stopAudio() {
    clearInterval(musicTimer); musicTimer = null;
    activeVoices.forEach(voice => { try { voice.stop(); } catch {} });
    activeVoices.clear();
  }
  function startMusic() {
    clearInterval(musicTimer); musicTimer = null;
    if (!musicEnabled || mode !== 'playing') return;
    musicTick(); musicTimer = setInterval(musicTick, 390);
  }
  function effect(type) {
    if (!sfxEnabled) return;
    if (type === 'gift') { tone(783.99, 0.18, 0.3); tone(1046.5, 0.3, 0.25, 'sine', 0.07); }
    else { tone(164.81, 0.19, 0.18, 'triangle'); tone(123.47, 0.25, 0.15, 'triangle', 0.08); }
  }

  function updateSoundButtons() {
    for (const [id, enabled, onKey, offKey] of [['music-button', musicEnabled, 'musicOn', 'musicOff'], ['sfx-button', sfxEnabled, 'sfxOn', 'sfxOff']]) {
      const button = $(id); if (!button) continue;
      button.textContent = id === 'music-button' ? '♫' : '◖))';
      button.setAttribute('aria-label', t(enabled ? onKey : offKey));
      button.setAttribute('title', t(enabled ? onKey : offKey));
      button.dataset.enabled = String(enabled);
      button.style.opacity = enabled ? '1' : '0.5';
      button.setAttribute('aria-pressed', String(enabled));
    }
  }
  function updateHud() {
    const totalSeconds = Math.ceil(state.remaining);
    setText('score-value', state.score); setText('time-value', `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`);
    setText('lives-value', '♥'.repeat(state.lives) + '♡'.repeat(3 - state.lives));
    $('lives-value')?.setAttribute('aria-label', `${t('lives')}: ${state.lives}`);
    setText('best-value', best); setText('result-score', state.score);
    setText('result-message', t(state.score >= 100 ? 'resultGood' : 'resultWarm'));
    setText('result-best', resultIsBest ? `${best} · ${t('newBest')}` : best);
  }
  function translate() {
    document.documentElement.lang = lang;
    document.title = `${t('title')} · YaCo 2026`;
    document.querySelectorAll('[data-i18n]').forEach(el => { if (translations[lang][el.dataset.i18n]) el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    document.querySelectorAll('[data-i18n-alt]').forEach(el => el.setAttribute('alt', t(el.dataset.i18nAlt)));
    setText('lang-button', lang === 'ru' ? 'EN' : 'RU');
    $('lang-button')?.setAttribute('aria-label', t('langLabel'));
    updateSoundButtons(); updateHud();
    // После смены языка прежнее сообщение экранного диктора тоже переводим.
    announce(mode === 'playing' ? t('beginAnnouncement') : mode === 'paused' ? t('paused') : mode === 'result' ? t('resultAnnounce') + state.score : '');
  }
  function setMode(next) {
    mode = next; document.body.dataset.state = next;
    for (const [screen, screenMode] of [['intro-screen', 'intro'], ['pause-screen', 'paused'], ['result-screen', 'result']]) {
      if ($(screen)) $(screen).hidden = next !== screenMode;
    }
    if ($('pause-button')) $('pause-button').disabled = next !== 'playing';
    pressed.clear(); held.clear(); targetX = null;
  }
  function start() {
    stopAudio(); state = initialState(); resultIsBest = false; particles.length = 0; flash = 0;
    setMode('playing'); lastFrame = performance.now(); initAudio(); startMusic(); updateHud(); announce(t('beginAnnouncement'));
  }
  function pause() {
    if (mode !== 'playing') return;
    setMode('paused'); stopAudio(); announce(t('paused')); $('resume-button')?.focus({ preventScroll: true });
  }
  function resume() {
    if (mode !== 'paused') return;
    setMode('playing'); lastFrame = performance.now(); initAudio(); startMusic();
  }
  function finish() {
    stopAudio(); resultIsBest = state.score > best;
    if (resultIsBest) { best = state.score; save('yaco-grandma-best', best); }
    setMode('result'); updateHud(); announce(t('resultAnnounce') + state.score); $('again-button')?.focus({ preventScroll: true });
  }
  function home() { stopAudio(); state = initialState(); setMode('intro'); updateHud(); $('start-button')?.focus({ preventScroll: true }); }

  /* Векторные рисунки сохраняют чёткость на планшетах и Retina-экранах. */
  const snowflakes = Array.from({ length: 55 }, (_, i) => ({ x: (i * 137.51) % WIDTH, y: (i * 87.23) % HEIGHT, radius: 1 + i % 3, speed: 8 + i % 17 }));
  function roundRect(x, y, w, h, radius, fill) { ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fillStyle = fill; ctx.fill(); }
  function star(x, y, r, fill) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, shapeRatio()); ctx.beginPath();
    for (let n = 0; n < 8; n++) { const angle = n * Math.PI / 4 - Math.PI / 2, size = n % 2 ? r * 0.25 : r; ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size); }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  }
  function tree(x, y, size, fill) {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.43, y - size * 0.35); ctx.lineTo(x + size * 0.23, y - size * 0.35);
    ctx.lineTo(x + size * 0.6, y); ctx.lineTo(x - size * 0.6, y); ctx.lineTo(x - size * 0.23, y - size * 0.35);
    ctx.lineTo(x - size * 0.43, y - size * 0.35); ctx.closePath(); ctx.fill();
  }
  function drawGift(item) {
    const colors = [['#af4359', '#f4d69e'], ['#4f9384', '#f8dbb3'], ['#d9a150', '#fff0d2']];
    const [box, ribbon] = colors[item.color % 3];
    ctx.save(); ctx.translate(item.x, item.y); ctx.scale(1, shapeRatio()); ctx.rotate(item.rotation);
    ctx.shadowColor = '#05162255'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
    roundRect(-18, -15, 36, 32, 4, box); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = ribbon; ctx.fillRect(-3, -17, 6, 35); ctx.fillRect(-19, -8, 38, 5);
    ctx.lineWidth = 3; ctx.strokeStyle = ribbon;
    ctx.beginPath(); ctx.ellipse(-6, -20, 7, 4, 0.6, 0, Math.PI * 2); ctx.ellipse(6, -20, 7, 4, -0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  function drawSnowball(item) {
    ctx.save(); ctx.translate(item.x, item.y); ctx.scale(1, shapeRatio()); ctx.fillStyle = '#e1edf5'; ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-4, -5, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#a6bdcc'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-8, 1); ctx.lineTo(7, -4); ctx.moveTo(-3, -7); ctx.lineTo(2, 9); ctx.moveTo(-7, -6); ctx.lineTo(7, 7); ctx.stroke();ctx.restore();
  }
  function drawBasket() {
    const x = state.basketX, y = BASKET_Y;
    ctx.save(); ctx.translate(x, y); ctx.scale(1, shapeRatio());
    ctx.strokeStyle = '#c58d56'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(0, -6, 38, 33, 0, Math.PI, 0); ctx.stroke();
    const gradient = ctx.createLinearGradient(0, 0, 0, 46); gradient.addColorStop(0, '#d3a06a'); gradient.addColorStop(1, '#99613e');
    ctx.beginPath(); ctx.moveTo(-54, 0); ctx.lineTo(54, 0); ctx.lineTo(43, 43); ctx.quadraticCurveTo(0, 52, -43, 43); ctx.closePath();ctx.fillStyle = gradient;ctx.fill();
    ctx.save();ctx.clip();ctx.strokeStyle = '#75472b77';ctx.lineWidth = 2;
    for (let i = -50; i <= 50; i += 12) { ctx.beginPath();ctx.moveTo(i, 0);ctx.lineTo(i - 7, 52);ctx.stroke(); }
    for (let i = 12; i <= 45; i += 10) {ctx.beginPath();ctx.moveTo(-55, i);ctx.lineTo(55, i);ctx.stroke();}ctx.restore();
    roundRect(-57, -5, 114, 9, 4, '#e2b67e');
    roundRect(-6, 3, 12, 38, 1, '#a83b52');
    ctx.fillStyle = '#c8556b';ctx.beginPath();ctx.ellipse(-9, 14, 12, 7, 0.4, 0, Math.PI * 2);ctx.ellipse(9, 14, 12, 7, -0.4, 0, Math.PI * 2);ctx.fill();
    ctx.fillStyle = '#f7db9d';ctx.beginPath();ctx.arc(0, 14, 4, 0, Math.PI * 2);ctx.fill();ctx.restore();
  }
  // Поле заполняет доступный экран, а формы подарков и корзины не растягиваются
  // при повороте телефона: компенсируем разницу масштаба по двум осям.
  function shapeRatio() { return (canvas.width / WIDTH) / (canvas.height / HEIGHT); }
  function draw(now) {
    const scaleX = canvas.width / WIDTH, scaleY = canvas.height / HEIGHT;
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);ctx.clearRect(0, 0, WIDTH, HEIGHT);
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT); sky.addColorStop(0, '#102c39'); sky.addColorStop(0.65, '#254c54');sky.addColorStop(1, '#4d7774');
    ctx.fillStyle = sky;ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#edddba';ctx.beginPath();ctx.ellipse(490, 80, 31, 31 * shapeRatio(), 0, 0, Math.PI * 2);ctx.fill();
    ctx.fillStyle = '#15333f';ctx.beginPath();ctx.ellipse(501, 70, 28, 28 * shapeRatio(), 0, 0, Math.PI * 2);ctx.fill();
    [[70, 75, 5], [180, 43, 4], [360, 92, 5], [550, 186, 4], [259, 151, 3]].forEach(([x, y, r]) => star(x, y, r, '#e2cb9a'));
    for (let i = 0; i < 12; i++) tree(i * 61 - 27, 542 + i % 3 * 16, 120 + i % 4 * 35, '#183b43');
    for (let i = 0; i < 8; i++) tree(i * 97 - 26, 617 + i % 2 * 9, 130 + i % 3 * 35, '#244c50');
    // Снежные холмы оставляют игровой передний план спокойным и читаемым.
    ctx.fillStyle = '#bfd2cd';ctx.beginPath();ctx.moveTo(0, 646);ctx.quadraticCurveTo(170, 601, 350, 650);ctx.quadraticCurveTo(510, 608, 600, 641);ctx.lineTo(600, 700);ctx.lineTo(0, 700);ctx.fill();
    ctx.fillStyle = '#deebe2';ctx.beginPath();ctx.moveTo(0, 672);ctx.quadraticCurveTo(270, 633, 600, 675);ctx.lineTo(600, 700);ctx.lineTo(0, 700);ctx.fill();
    const animationTime = reducedMotion ? 0 : now / 1000;
    snowflakes.forEach(s => { ctx.globalAlpha = 0.25 + s.radius * 0.13;ctx.fillStyle = '#fff';ctx.beginPath();ctx.arc((s.x + Math.sin(animationTime * 0.3 + s.y) * 8 + WIDTH) % WIDTH, (s.y + animationTime * s.speed) % HEIGHT, s.radius, 0, Math.PI * 2);ctx.fill(); });ctx.globalAlpha = 1;
    state.items.forEach(item => item.type === 'gift' ? drawGift(item) : drawSnowball(item));drawBasket();
    particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life);star(p.x, p.y, 4, p.color); });ctx.globalAlpha = 1;
    if (flash > 0) {ctx.fillStyle = `rgba(170,50,65,${flash * 0.25})`;ctx.fillRect(0, 0, WIDTH, HEIGHT);}
  }
  function resize() {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));canvas.height = Math.max(1, Math.round(rect.height * dpr));
    // Оставляем место под корзиной даже в очень широком горизонтальном поле.
    BASKET_Y = HEIGHT - Math.max(87, 60 * shapeRatio());
    draw(performance.now());
  }
  function loop(now) {
    const dt = Math.min(Math.max(0, (now - lastFrame) / 1000), 0.05);lastFrame = now;
    if (mode === 'playing') {
      const direction = (pressed.has('ArrowRight') || pressed.has('KeyD') || held.has('right') ? 1 : 0) - (pressed.has('ArrowLeft') || pressed.has('KeyA') || held.has('left') ? 1 : 0);
      if (direction) targetX = null;
      state = advanceState(state, dt, { direction, targetX });
      state.events.forEach(event => {
        effect(event.type); if (event.type === 'hit') { flash = 1;announce(t('hitAnnouncement') + ` ${t('lives')}: ${state.lives}`); }
        if (!reducedMotion) for (let n = 0; n < 9; n++) particles.push({ x: event.x, y: BASKET_Y - 10, vx: (Math.random() - 0.5) * 140, vy: -40 - Math.random() * 90, life: 0.8, color: event.type === 'gift' ? '#f5d68c' : '#f3e8e9' });
      });
      for (let n = particles.length - 1; n >= 0; n--) {const p = particles[n];p.x += p.vx * dt;p.y += p.vy * dt;p.life -= dt;if (p.life <= 0) particles.splice(n, 1);}
      flash = Math.max(0, flash - dt * 3);updateHud();if (state.ended) finish();
    }
    draw(now);requestAnimationFrame(loop);
  }

  function bind(id, action) { $(id)?.addEventListener('click', action); }
  bind('start-button', start);bind('again-button', start);bind('resume-button', resume);bind('pause-button', pause);bind('home-button', home);
  bind('lang-button', () => {lang = lang === 'ru' ? 'en' : 'ru';save('yaco-grandma-lang', lang);translate();});
  bind('music-button', () => {musicEnabled = !musicEnabled;save('yaco-grandma-music', musicEnabled);initAudio();if (musicEnabled) startMusic();else stopAudio();updateSoundButtons();});
  bind('sfx-button', () => {sfxEnabled = !sfxEnabled;save('yaco-grandma-sfx', sfxEnabled);initAudio();updateSoundButtons();});
  function point(event) {if (mode !== 'playing') return;const rect = canvas.getBoundingClientRect();targetX = (event.clientX - rect.left) / rect.width * WIDTH;}
  canvas.addEventListener('pointerdown', event => {if (mode !== 'playing') return;event.preventDefault();canvas.setPointerCapture(event.pointerId);point(event);});
  canvas.addEventListener('pointermove', event => {if (canvas.hasPointerCapture(event.pointerId)) point(event);});
  canvas.addEventListener('pointerup', event => {if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);});
  canvas.addEventListener('pointercancel', () => {targetX = null;});
  for (const direction of ['left', 'right']) {
    const button = $(`${direction}-button`);if (!button) continue;
    button.addEventListener('pointerdown', event => {if (mode !== 'playing') return;event.preventDefault();button.setPointerCapture(event.pointerId);held.add(direction);targetX = null;});
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, () => held.delete(direction));
  }
  window.addEventListener('keydown', event => {
    if (event.code === 'Escape') {if (mode === 'playing') pause();else if (mode === 'paused') resume();return;}
    if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(event.code) && mode === 'playing') {event.preventDefault();pressed.add(event.code);}
  });
  window.addEventListener('keyup', event => pressed.delete(event.code));
  window.addEventListener('blur', pause);
  document.addEventListener('visibilitychange', () => {if (document.hidden) pause();});
  window.addEventListener('resize', resize);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(canvas);
  // API диагностики возвращает копию состояния и не позволяет незаметно менять очки.
  window.ChristmasGame = Object.freeze({ start, pause, resume, createInitialState: initialState, advanceState,
    getState: () => ({ ...state, items: state.items.map(item => ({ ...item })), mode, lang, best, musicEnabled, sfxEnabled, audioState: audio?.state || 'not-started' }) });
  setMode('intro');translate();resize();requestAnimationFrame(loop);
})();
