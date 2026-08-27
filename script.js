/* ---- script.js ---- */

/* =====================================================
   POEM DATA — stanzas split by double blank lines
   ===================================================== */
const stanzas = [
  `Yes, she is my Didi—\nforever and ever and ever,\nno matter where life takes us,\nno matter how the seasons turn.`,

  `Wanna know who she is?\nShe is my everything.\nThe person I tried to leave a thousand times,\nyet somehow, my heart\nalways found its way back to her.`,

  `She is the best sister\na foolish brother like me could ever have,\nthe kind who may be busy most days,\nbut whose little moments of care and love\ncan make the whole world feel softer.`,

  `And once, on the night of Techfest Day 3,\nshe gave me the most beautiful Christmas gift\nI have ever received.`,

  `Sometimes she is caring,\nsometimes she is wonderfully lovely,\nand most of the time—\nshe is busy, busy, busy.\nBut perhaps that's what makes\nthe moments I get with her\nall the more precious.`,

  `If some magical jinn appeared before me\nand granted me just one wish,\nI wouldn't ask for money,\nI wouldn't ask for success,\nI wouldn't even ask for a gf. :)`,

  `I'd simply say—\n"Give me one complete day with my Didi."\nOne whole day.\nNo hurry. No work. No distance.\nJust her and me and talks,\nand enough time to make memories\nthat could last forever.`,

  `She has the most beautiful heart in this world—\na heart that deserves every happiness\nthis universe could possibly give.`,

  `And if someday fate asked me\nto choose between my life and hers,\nthere would be no hesitation,\nno second thought.\nI would choose her.\nObviously, her.`,

  `Because some bonds\naren't measured by blood alone.\nSome bonds are written\nsomewhere deeper—\nin the quietest corners of the heart,\nwhere time cannot reach\nand distance cannot break them.`,

  `It all began\non the 19th of November, 2025.`,

  `And if I had the power\nto write the ending,\nI wouldn't write one at all.\n\nLet it continue\nthrough every tomorrow,\nthrough every lifetime,\nthrough every star that burns in the sky—\nat least until the universe itself\nruns out of time.`,

  `That's my Didi.\n\nAnd I can bet that\nnowhere on this planet,\nin this lifetime or any other,\ncould there ever be\na better Didi for me.`,
];

const AUTO_PLAY_INTERVAL = 6500; // ms per stanza

/* =====================================================
   STATE
   ===================================================== */
let currentIndex  = 0;
let isPaused      = false;
let timer         = null;
let progressTimer = null;
let progressStart = null;

/* =====================================================
   DOM REFS
   ===================================================== */
const poemText     = document.getElementById('poem-text');
const poemCard     = document.getElementById('poem-card');
const dotsNav      = document.getElementById('dots-nav');
const btnPrev      = document.getElementById('btn-prev');
const btnNext      = document.getElementById('btn-next');
const btnPause     = document.getElementById('btn-pause');
const iconPause    = document.getElementById('icon-pause');
const iconPlay     = document.getElementById('icon-play');
const progressBar  = document.getElementById('progress-bar');
const counter      = document.getElementById('stanza-counter');
const scrollBtn    = document.getElementById('scroll-btn');

/* =====================================================
   FLOATING PETALS
   ===================================================== */
(function spawnPetals() {
  const container = document.getElementById('petals-container');
  const petals    = ['🌸', '🌼', '🌺', '🌷', '✿', '❀', '🍂'];
  const COUNT     = 22;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('span');
    el.className = 'petal';
    el.textContent = petals[Math.floor(Math.random() * petals.length)];
    const left = Math.random() * 100;
    const dur  = 8 + Math.random() * 14;
    const del  = Math.random() * -20;
    const size = 0.9 + Math.random() * 0.9;
    el.style.cssText = `left:${left}%;font-size:${size}rem;animation-duration:${dur}s;animation-delay:${del}s;`;
    container.appendChild(el);
  }
})();

/* =====================================================
   FIREFLIES
   ===================================================== */
(function spawnFireflies() {
  const container = document.getElementById('fireflies');
  const COUNT = 28;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'firefly';
    const x   = Math.random() * 100;
    const y   = Math.random() * 100;
    const dur = 5 + Math.random() * 10;
    const del = Math.random() * -15;
    const dx  = (Math.random() - 0.5) * 180;
    const dy  = (Math.random() - 0.5) * 180;
    el.style.cssText = `left:${x}%;top:${y}%;animation-duration:${dur}s;animation-delay:${del}s;--dx:${dx}px;--dy:${dy}px;`;
    container.appendChild(el);
  }
})();

/* =====================================================
   DOTS
   ===================================================== */
function buildDots() {
  dotsNav.innerHTML = '';
  stanzas.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className  = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Stanza ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.dataset.index = i;
    dot.addEventListener('click', () => goTo(i, true));
    dotsNav.appendChild(dot);
  });
}

function updateDots() {
  const dots = dotsNav.querySelectorAll('.dot');
  dots.forEach((d, i) => {
    const active = i === currentIndex;
    d.classList.toggle('active', active);
    d.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

/* =====================================================
   PROGRESS BAR
   ===================================================== */
function startProgress() {
  progressStart = performance.now();
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';

  function tick(now) {
    if (isPaused) return;
    const elapsed = now - progressStart;
    const pct = Math.min((elapsed / AUTO_PLAY_INTERVAL) * 100, 100);
    progressBar.style.width = pct + '%';
    if (pct < 100) {
      progressTimer = requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

function stopProgress() {
  cancelAnimationFrame(progressTimer);
}

function resetProgress() {
  stopProgress();
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';
}

/* =====================================================
   STANZA DISPLAY
   ===================================================== */
function showStanza(index, direction = 'next') {
  poemCard.classList.remove('fade-in');
  poemCard.classList.add('fade-out');

  setTimeout(() => {
    poemText.textContent = stanzas[index];
    counter.textContent  = `${index + 1} / ${stanzas.length}`;
    poemCard.classList.remove('fade-out');
    poemCard.classList.add('fade-in');
    updateDots();
  }, 420);
}

function goTo(index, userTriggered = false) {
  currentIndex = ((index % stanzas.length) + stanzas.length) % stanzas.length;
  showStanza(currentIndex);
  resetProgress();
  if (!isPaused) {
    clearTimeout(timer);
    startProgress();
    timer = setTimeout(advance, AUTO_PLAY_INTERVAL);
  }
}

function advance() {
  if (!isPaused) {
    const next = (currentIndex + 1) % stanzas.length;
    goTo(next);
  }
}

/* =====================================================
   CONTROLS
   ===================================================== */
btnNext.addEventListener('click', () => goTo(currentIndex + 1, true));
btnPrev.addEventListener('click', () => goTo(currentIndex - 1, true));

btnPause.addEventListener('click', () => {
  isPaused = !isPaused;
  iconPause.style.display = isPaused ? 'none' : 'block';
  iconPlay.style.display  = isPaused ? 'block' : 'none';

  if (isPaused) {
    clearTimeout(timer);
    stopProgress();
  } else {
    startProgress();
    timer = setTimeout(advance, AUTO_PLAY_INTERVAL);
  }
});

scrollBtn.addEventListener('click', () => {
  document.getElementById('poem-section').scrollIntoView({ behavior: 'smooth' });
});

/* =====================================================
   KEYBOARD NAVIGATION
   ===================================================== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') goTo(currentIndex + 1, true);
  if (e.key === 'ArrowLeft')  goTo(currentIndex - 1, true);
  if (e.key === ' ') { e.preventDefault(); btnPause.click(); }
});

/* =====================================================
   INIT
   ===================================================== */
buildDots();
poemText.textContent = stanzas[0];
counter.textContent  = `1 / ${stanzas.length}`;
poemCard.classList.add('fade-in');
startProgress();
timer = setTimeout(advance, AUTO_PLAY_INTERVAL);

/* =====================================================
   INTERSECTION OBSERVER — start autoplay when visible
   ===================================================== */
const poemSection = document.getElementById('poem-section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && isPaused === false) {
      // already playing
    }
  });
}, { threshold: 0.3 });
observer.observe(poemSection);
