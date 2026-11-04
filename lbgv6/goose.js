'use strict';
// The Honker: a goose that walks the bottom of the page, honks, steals letters, throws them,
// crashes into cards and naps at 1%. Purely decorative: it never blocks clicks (only the goose
// itself is clickable), stolen letters always fly back, and it can be switched off.
(() => {
  if (window.LBG_IN_TELEGRAM) return; // keep the Telegram mini-app calm
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
  };

  const SVG = `<svg viewBox="0 0 120 110" width="100%" height="100%" aria-hidden="true">
    <g class="g-legs" stroke="#19251e" stroke-width="5" stroke-linecap="round" fill="none">
      <path class="g-leg g-leg-a" d="M52 86 L48 104 L58 104"/>
      <path class="g-leg g-leg-b" d="M68 86 L66 104 L76 104"/>
    </g>
    <path class="g-body" d="M20 70 Q12 48 34 46 L58 48 L60 24 Q60 6 78 6 Q96 6 96 24 L94 60 Q94 90 60 90 Q30 90 20 70Z"
      fill="#fffceb" stroke="#19251e" stroke-width="5" stroke-linejoin="round"/>
    <path d="M30 66 Q38 80 58 74" fill="none" stroke="#19251e" stroke-width="4" stroke-linecap="round"/>
    <g class="g-beak"><path d="M95 22 L114 28 L95 34Z" fill="#ff9b48" stroke="#19251e" stroke-width="4" stroke-linejoin="round"/></g>
    <circle class="g-eye" cx="84" cy="20" r="3.6" fill="#19251e"/>
    <rect x="66" y="56" width="18" height="10" rx="2" fill="#fffceb" stroke="#19251e" stroke-width="3"/>
    <rect x="68.5" y="58.5" width="3" height="5" fill="#f46b54"/>
  </svg>`;

  const css = `
  .lbg-goose{position:fixed;left:0;bottom:calc(6px + env(safe-area-inset-bottom,0px));width:92px;height:84px;z-index:60;cursor:pointer;
    border:0;background:transparent;padding:0;transform:translateX(var(--gx,0px));-webkit-tap-highlight-color:transparent}
  .lbg-goose .g-flip{display:block;width:100%;height:100%;transform:scaleX(var(--gdir,1));transform-origin:50% 50%}
  .lbg-goose:focus-visible{outline:3px solid #b04732;outline-offset:2px;border-radius:12px}
  .lbg-goose.walking .g-leg-a{animation:g-step .32s ease-in-out infinite alternate;transform-origin:52px 86px}
  .lbg-goose.walking .g-leg-b{animation:g-step .32s ease-in-out infinite alternate-reverse;transform-origin:68px 86px}
  .lbg-goose.running .g-leg-a,.lbg-goose.running .g-leg-b{animation-duration:.14s}
  .lbg-goose.walking .g-flip{animation:g-bob .32s ease-in-out infinite alternate}
  .lbg-goose.honking .g-beak{animation:g-honk .18s ease-in-out 3 alternate;transform-origin:95px 28px}
  .lbg-goose.jump .g-flip{animation:g-jump .5s ease-out}
  .lbg-goose.sleepy .g-eye{transform:scaleY(.15);transform-origin:84px 20px}
  @keyframes g-step{from{transform:rotate(-16deg)}to{transform:rotate(16deg)}}
  @keyframes g-bob{from{translate:0 0}to{translate:0 -3px}}
  @keyframes g-honk{to{transform:rotate(-14deg)}}
  @keyframes g-jump{40%{translate:0 -38px;rotate:-8deg}100%{translate:0 0}}
  .lbg-bubble{position:fixed;z-index:61;pointer-events:none;background:#fffceb;border:3px solid #19251e;border-radius:14px;
    padding:6px 10px;font:900 15px/1 Arial,Helvetica,sans-serif;color:#19251e;box-shadow:4px 4px 0 #19251e;white-space:nowrap;
    animation:g-pop .25s ease-out}
  @keyframes g-pop{from{transform:scale(.4);opacity:0}}
  .lbg-flying{position:fixed;z-index:59;pointer-events:none;margin:0;line-height:1;will-change:transform}
  .lbg-stolen{visibility:hidden}
  .lbg-shake{animation:g-shake .6s ease-in-out}
  @keyframes g-shake{20%{transform:rotate(-3deg) translateX(-6px)}40%{transform:rotate(3deg) translateX(6px)}60%{transform:rotate(-2deg)}80%{transform:rotate(1deg)}}
  .lbg-feather{position:fixed;z-index:59;pointer-events:none;font-size:20px}
  .lbg-goose-toggle{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:62;
    border:2px solid #19251e;border-radius:999px;background:#cdf45c;color:#19251e;font:900 11px/1 Arial,Helvetica,sans-serif;letter-spacing:.06em;
    padding:9px 12px;cursor:pointer;box-shadow:3px 3px 0 #19251e}
  @media(max-width:540px){.lbg-goose{width:68px;height:62px}.lbg-bubble{font-size:13px}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'lbg-goose-toggle';
  document.body.append(toggle);

  let goose = null, running = false, x = 40, dir = 1, target = null, speed = 70, last = 0, nextAct = 0, busy = false, sound = false;
  const stolen = new Set();
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const W = () => window.innerWidth;
  const gw = () => (goose ? goose.offsetWidth : 90);

  function setLabel() {
    const on = store.get('lbg-goose') !== 'off';
    toggle.textContent = on ? '🪿 GOOSE: ON' : '🪿 GOOSE: OFF';
    toggle.setAttribute('aria-pressed', String(on));
  }

  // --- sound (only after a click on the goose or the toggle) ---
  let ctx = null;
  function honkSound() {
    if (!sound) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime;
      [0, 0.18].forEach(off => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(420, t + off);
        o.frequency.exponentialRampToValueAtTime(260, t + off + 0.14);
        g.gain.setValueAtTime(0.0001, t + off);
        g.gain.exponentialRampToValueAtTime(0.12, t + off + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.16);
        o.connect(g).connect(ctx.destination);
        o.start(t + off); o.stop(t + off + 0.17);
      });
    } catch { /* audio not available */ }
  }

  function bubble(text, ms = 1400) {
    if (!goose) return;
    document.querySelectorAll('.lbg-bubble').forEach(n => n.remove());
    const r = goose.getBoundingClientRect();
    const b = document.createElement('div');
    b.className = 'lbg-bubble';
    b.textContent = text;
    document.body.append(b);
    const bx = Math.min(Math.max(8, r.left + r.width / 2 - b.offsetWidth / 2), W() - b.offsetWidth - 8);
    b.style.left = bx + 'px';
    b.style.top = (r.top - b.offsetHeight - 10) + 'px';
    setTimeout(() => b.remove(), ms);
  }

  function honk(text) {
    if (!goose) return;
    goose.classList.add('honking');
    setTimeout(() => goose && goose.classList.remove('honking'), 600);
    bubble(text || pick(['HONK!', 'HONK HONK!', 'honk?', '1%!!', 'HONK OUT!', 'battery check!']));
    honkSound();
  }

  // --- letter theft ---
  const SAFE = '[data-ca],[data-live-ca],.risk-note,.channels-caution,.guess-fine,.announcement,.ca-box,form,button,input,textarea,.lbg-bubble,.lbg-goose-toggle';
  function visibleTextNode() {
    const els = [...document.querySelectorAll('h1,h2,h3,.hero-sub,.section-kicker,.challenge-main>p,.intro-right p,.feature p,.drain-card strong,.fact-value')]
      .filter(el => { const r = el.getBoundingClientRect(); return r.bottom > 60 && r.top < window.innerHeight - 120 && r.width > 0 && !el.closest(SAFE); });
    for (let tries = 0; tries < 6 && els.length; tries++) {
      const el = pick(els);
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => (/[A-Za-z%]/.test(n.nodeValue) && !n.parentElement.closest(SAFE) && !n.parentElement.classList.contains('lbg-stolen')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      if (nodes.length) return pick(nodes);
    }
    return null;
  }

  function stealLetter() {
    if (stolen.size >= 3 || !goose) return false;
    const node = visibleTextNode();
    if (!node) return false;
    const idxs = [...node.nodeValue].map((c, i) => (/[A-Za-z%]/.test(c) ? i : -1)).filter(i => i >= 0);
    const i = pick(idxs);
    const after = node.splitText(i);
    after.splitText(1);
    const span = document.createElement('span');
    span.className = 'lbg-stolen';
    after.replaceWith(span);
    span.append(after);
    const cs = getComputedStyle(span.parentElement);
    const from = span.getBoundingClientRect();
    const fly = document.createElement('span');
    fly.className = 'lbg-flying';
    fly.textContent = span.textContent;
    Object.assign(fly.style, { left: from.left + 'px', top: from.top + 'px', font: cs.font, color: cs.color, letterSpacing: cs.letterSpacing });
    document.body.append(fly);
    stolen.add(span);
    const g = goose.getBoundingClientRect();
    const beak = { x: g.left + (dir > 0 ? g.width * 0.9 : g.width * 0.1) - from.left, y: g.top + g.height * 0.2 - from.top };
    const land = { x: rand(20, W() - 60) - from.left, y: rand(window.innerHeight * 0.35, window.innerHeight - 140) - from.top };
    const spin = rand(-540, 540);
    const a1 = fly.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${beak.x}px,${beak.y}px) rotate(${spin / 3}deg) scale(.8)` }],
      { duration: 700, easing: 'cubic-bezier(.5,-0.3,.6,1)', fill: 'forwards' });
    a1.onfinish = () => {
      honk(pick(['nom.', 'MINE!', 'yoink', 'HONK!']));
      const a2 = fly.animate([{ transform: `translate(${beak.x}px,${beak.y}px) rotate(${spin / 3}deg) scale(.8)` },
        { transform: `translate(${(beak.x + land.x) / 2}px,${Math.min(beak.y, land.y) - 160}px) rotate(${spin}deg) scale(1.3)` },
        { transform: `translate(${land.x}px,${land.y}px) rotate(${spin * 1.4}deg) scale(1.1)` }],
        { duration: 1100, easing: 'ease-in-out', fill: 'forwards' });
      a2.onfinish = () => setTimeout(() => {
        const home = span.isConnected ? span.getBoundingClientRect() : from;
        const back = fly.animate([{ transform: `translate(${land.x}px,${land.y}px) rotate(${spin * 1.4}deg) scale(1.1)` },
          { transform: `translate(${home.left - from.left}px,${home.top - from.top}px) rotate(0) scale(1)` }],
          { duration: 900, easing: 'cubic-bezier(.3,1.4,.6,1)', fill: 'forwards' });
        back.onfinish = () => restore(span, fly);
      }, rand(3500, 6500));
    };
    return true;
  }

  function restore(span, fly) {
    if (fly) fly.remove();
    if (span.isConnected) { const p = span.parentNode; span.replaceWith(...span.childNodes); p.normalize(); }
    stolen.delete(span);
  }

  // --- crash into a card or picture ---
  function crash() {
    const els = [...document.querySelectorAll('.hero-art img,.feature,.drain-card,.channel-card,.fact-item,.bingo-tile,.trophy-card,.guess-prize,.meme-preview')]
      .filter(el => { const r = el.getBoundingClientRect(); return r.top < window.innerHeight - 40 && r.bottom > 80; });
    if (!els.length) return false;
    const el = pick(els);
    const r = el.getBoundingClientRect();
    target = Math.min(Math.max(0, r.left + r.width / 2 - gw() / 2), W() - gw());
    speed = 340;
    goose.classList.add('running');
    const done = () => {
      goose.classList.remove('running');
      el.classList.remove('lbg-shake'); void el.offsetWidth; el.classList.add('lbg-shake');
      setTimeout(() => el.classList.remove('lbg-shake'), 650);
      for (let k = 0; k < 6; k++) {
        const f = document.createElement('span');
        f.className = 'lbg-feather'; f.textContent = '🪶';
        f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (Math.max(r.top, 60) + 20) + 'px';
        document.body.append(f);
        f.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${rand(-120, 120)}px,${rand(-140, 60)}px) rotate(${rand(-240, 240)}deg)`, opacity: 0 }],
          { duration: rand(900, 1500), easing: 'ease-out' }).onfinish = () => f.remove();
      }
      honk(pick(['HONK!!', 'oops.', 'honk trouble!', 'BONK']));
    };
    arrive = done;
    return true;
  }
  let arrive = null;

  function nap() {
    goose.classList.add('sleepy');
    target = null; goose.classList.remove('walking');
    bubble('💤 1%…', 3000);
    busy = true;
    setTimeout(() => { if (goose) { goose.classList.remove('sleepy'); honk('RECHARGED. HONK!'); } busy = false; }, 3200);
  }

  function zoomies() {
    target = dir > 0 ? 0 : W() - gw();
    speed = 420; goose.classList.add('running');
    arrive = () => { goose.classList.remove('running'); honk('ZOOMIES!'); };
  }

  function act() {
    if (busy || reduce) return;
    const r = Math.random();
    if (r < 0.32) { if (!stealLetter()) honk(); }
    else if (r < 0.55) { if (!crash()) honk(); }
    else if (r < 0.7) zoomies();
    else if (r < 0.82) nap();
    else honk();
  }

  function frame(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    if (!document.hidden && goose && !busy && !reduce) {
      if (target == null) { target = rand(0, Math.max(0, W() - gw())); speed = rand(55, 90); }
      const d = target - x;
      if (Math.abs(d) < 4) {
        target = null; goose.classList.remove('walking');
        if (arrive) { const fn = arrive; arrive = null; fn(); }
        busy = true; setTimeout(() => { busy = false; }, rand(600, 1800));
      } else {
        dir = d > 0 ? 1 : -1;
        x += dir * Math.min(Math.abs(d), speed * dt);
        goose.classList.add('walking');
      }
      goose.style.setProperty('--gx', x + 'px');
      goose.style.setProperty('--gdir', dir);
      if (t > nextAct) { nextAct = t + rand(7000, 13000); act(); }
    }
    requestAnimationFrame(frame);
  }

  function start() {
    if (goose) return;
    goose = document.createElement('button');
    goose.type = 'button';
    goose.className = 'lbg-goose';
    goose.setAttribute('aria-label', 'Honk the goose');
    goose.innerHTML = `<span class="g-flip">${SVG}</span>`;
    document.body.append(goose);
    x = reduce ? 16 : rand(0, Math.max(0, W() - gw()));
    goose.style.setProperty('--gx', x + 'px');
    goose.addEventListener('click', () => {
      sound = true;
      goose.classList.remove('jump'); void goose.offsetWidth; goose.classList.add('jump');
      honk(pick(['HONK!', 'HONK HONK HONK', 'you honked me!', 'HONK OUT!']));
      if (!reduce && Math.random() < 0.5) stealLetter();
    });
    running = true; last = 0; nextAct = performance.now() + 3500;
    requestAnimationFrame(frame);
    setTimeout(() => honk('HONK! I live here now.'), 1200);
  }

  function stop() {
    running = false;
    stolen.forEach(span => restore(span, null));
    document.querySelectorAll('.lbg-flying,.lbg-bubble,.lbg-feather').forEach(n => n.remove());
    if (goose) { goose.remove(); goose = null; }
  }

  toggle.addEventListener('click', () => {
    const on = store.get('lbg-goose') === 'off';
    store.set('lbg-goose', on ? 'on' : 'off');
    setLabel();
    if (on) { sound = true; start(); } else stop();
  });
  window.addEventListener('resize', () => { if (goose) { x = Math.min(x, Math.max(0, W() - gw())); target = null; } });

  setLabel();
  if (store.get('lbg-goose') !== 'off') start();
})();
