'use strict';
// THE HONKER: Low Battery Goose's mascot. Walks the page, drinks coffee, yawns, naps at 1%, steals letters,
// crashes into cards, and plays "Annoy the Goose": every click makes him madder until he RAGES and chases
// the cursor. Decorative: never blocks the page (only the goose and its two chips are clickable), stolen
// letters always come back, and visitors can switch it off.
(() => {
  if (window.LBG_IN_TELEGRAM) return; // keep the Telegram mini-app calm
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
  };
  const INK = '#19251e', CREAM = '#fffceb', ORANGE = '#ff9b48', RED = '#f46b54', LIME = '#cdf45c';

  const SVG = `<svg viewBox="0 0 130 120" width="100%" height="100%" overflow="visible" aria-hidden="true">
    <g class="g-rage-steam" fill="${CREAM}" stroke="${INK}" stroke-width="2.5">
      <circle cx="70" cy="-2" r="5"/><circle cx="82" cy="-8" r="6"/><circle cx="95" cy="-2" r="5"/>
    </g>
    <g class="g-zzz" fill="${INK}" font-family="Arial" font-weight="900"><text x="100" y="2" font-size="12">z</text><text x="110" y="-8" font-size="16">Z</text></g>
    <g class="g-legs" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path class="g-leg g-leg-a" d="M52 92 L48 110 L59 110" stroke="${ORANGE}"/>
      <path class="g-leg g-leg-a" d="M52 92 L48 110 L59 110" stroke-width="1.5"/>
      <path class="g-leg g-leg-b" d="M70 92 L68 110 L79 110" stroke="${ORANGE}"/>
      <path class="g-leg g-leg-b" d="M70 92 L68 110 L79 110" stroke-width="1.5"/>
    </g>
    <path class="g-body" d="M18 74 Q8 50 32 48 L60 50 L62 26 Q62 8 80 8 Q99 8 99 26 L97 64 Q97 96 60 96 Q28 96 18 74Z"
      fill="${CREAM}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path class="g-wing" d="M28 70 Q36 86 60 79" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <path class="g-tuft" d="M74 9 Q73 -1 80 4 M80 8 Q82 -3 88 5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <g class="g-beak">
      <path class="g-beak-top" d="M98 22 L120 28 L98 31Z" fill="${ORANGE}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path class="g-beak-low" d="M98 31 L116 31 L98 36Z" fill="${ORANGE}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    </g>
    <circle class="g-cheek" cx="91" cy="34" r="4.5" fill="${RED}"/>
    <g class="g-eye">
      <circle cx="86" cy="21" r="5.6" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
      <circle class="g-pupil" cx="87.5" cy="22" r="2.4" fill="${INK}"/>
      <path class="g-lid" d="M80 21 A6 6 0 0 1 92 21 Z" fill="${CREAM}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path class="g-lid-shut" d="M80 21 A6 6 0 0 1 92 21 A6 6 0 0 1 80 21Z" fill="${CREAM}" stroke="${INK}" stroke-width="2.5"/>
      <path class="g-bags" d="M81 29 Q86 31.5 91 29 M83 32 Q86 33.5 89 32" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
    </g>
    <path class="g-brow" d="M79 12 L93 14" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="66" y="60" width="20" height="11" rx="2.5" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
    <rect x="86" y="63" width="2.5" height="5" fill="${INK}"/>
    <rect class="g-charge" x="68.5" y="62.5" width="3.5" height="6" fill="${RED}"/>
    <g class="g-mug">
      <g class="g-mug-steam" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round">
        <path d="M106 34 q-3 -5 0 -9 q3 -4 0 -8"/><path d="M113 34 q-3 -5 0 -9 q3 -4 0 -8"/>
      </g>
      <path d="M101 37 h18 v14 q0 5 -5 5 h-8 q-5 0 -5 -5z" fill="${LIME}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M119 41 q6 0 6 5 q0 5 -6 5" fill="none" stroke="${INK}" stroke-width="3"/>
      <text x="104" y="51" font-family="Arial" font-weight="900" font-size="8" fill="${INK}">1%</text>
    </g>
  </svg>`;

  const css = `
  .lbg-goose{position:fixed;left:0;bottom:calc(4px + env(safe-area-inset-bottom,0px));width:116px;height:106px;z-index:60;cursor:pointer;
    border:0;background:transparent;padding:0;transform:translateX(var(--gx,0px));-webkit-tap-highlight-color:transparent;touch-action:manipulation}
  .lbg-goose .g-flip{display:block;width:100%;height:100%;transform:scaleX(var(--gdir,1));transform-origin:50% 50%}
  .lbg-goose svg{overflow:visible}
  .lbg-goose:focus-visible{outline:3px solid #b04732;outline-offset:2px;border-radius:12px}
  .lbg-goose .g-leg-a{transform-origin:52px 92px}.lbg-goose .g-leg-b{transform-origin:70px 92px}
  .lbg-goose.walking .g-leg-a{animation:g-step .34s ease-in-out infinite alternate}
  .lbg-goose.walking .g-leg-b{animation:g-step .34s ease-in-out infinite alternate-reverse}
  .lbg-goose.running .g-leg-a,.lbg-goose.running .g-leg-b{animation-duration:.12s}
  .lbg-goose.walking .g-flip{animation:g-bob .34s ease-in-out infinite alternate}
  .lbg-goose.running .g-flip{animation:g-lean .12s ease-in-out infinite alternate}
  .lbg-goose .g-beak-low{transform-origin:98px 31px;transition:transform .08s}
  .lbg-goose.honking .g-beak-low{animation:g-jaw .14s ease-in-out 4 alternate}
  .lbg-goose .g-lid{transform-origin:86px 21px;transition:transform .2s}
  .lbg-goose .g-lid-shut,.lbg-goose .g-mug,.lbg-goose .g-zzz,.lbg-goose .g-rage-steam{opacity:0;transition:opacity .2s}
  .lbg-goose .g-cheek{opacity:0;transition:opacity .2s}
  .lbg-goose .g-brow{transform-origin:86px 13px;transition:transform .2s}
  .lbg-goose .g-charge{transform-origin:68.5px 62.5px;animation:g-blink 1.6s steps(2) infinite}
  .lbg-goose.sleepy .g-lid-shut,.lbg-goose.sleepy .g-zzz{opacity:1}
  .lbg-goose.sleepy .g-zzz{animation:g-float 1.6s ease-in-out infinite}
  .lbg-goose.sleepy .g-flip{animation:g-breathe 1.6s ease-in-out infinite}
  .lbg-goose.sip .g-mug{opacity:1}
  .lbg-goose.sip .g-mug{transform-origin:110px 56px;animation:g-sip 1.1s ease-in-out 3}
  .lbg-goose .g-mug-steam{animation:g-steam 1.2s ease-in-out infinite}
  .lbg-goose.yawn .g-beak-low{transform:rotate(28deg)}
  .lbg-goose.yawn .g-lid{transform:scaleY(1.25)}
  .lbg-goose.mad1 .g-brow{transform:rotate(14deg) translateY(2px)}
  .lbg-goose.mad2 .g-brow,.lbg-goose.rage .g-brow{transform:rotate(24deg) translateY(3px)}
  .lbg-goose.mad2 .g-cheek,.lbg-goose.rage .g-cheek{opacity:.85}
  .lbg-goose.mad2 .g-lid,.lbg-goose.rage .g-lid{transform:scaleY(.35)}
  .lbg-goose.mad2 .g-flip{animation:g-shiver .09s linear infinite}
  .lbg-goose.rage .g-rage-steam{opacity:1;animation:g-float .5s ease-in-out infinite}
  .lbg-goose.rage .g-body{fill:#ffd9c9}
  .lbg-goose.rage .g-pupil{r:1.6}
  .lbg-goose.jump .g-flip{animation:g-jump .45s ease-out}
  @keyframes g-step{from{transform:rotate(-18deg)}to{transform:rotate(18deg)}}
  @keyframes g-bob{from{translate:0 0}to{translate:0 -3px}}
  @keyframes g-lean{from{rotate:-4deg}to{rotate:2deg}}
  @keyframes g-jaw{to{transform:rotate(22deg)}}
  @keyframes g-blink{50%{opacity:.15}}
  @keyframes g-float{50%{translate:0 -4px}}
  @keyframes g-breathe{50%{scale:1 .97;translate:0 2px}}
  @keyframes g-sip{0%,100%{rotate:0deg}45%,60%{rotate:-32deg;translate:-6px -2px}}
  @keyframes g-steam{50%{translate:0 -3px;opacity:.5}}
  @keyframes g-shiver{0%{translate:-1px 0}50%{translate:1px 0}100%{translate:-1px 0}}
  @keyframes g-jump{40%{translate:0 -42px;rotate:-10deg}100%{translate:0 0}}
  .lbg-bubble{position:fixed;z-index:61;pointer-events:none;background:${CREAM};border:3px solid ${INK};border-radius:14px;
    padding:7px 11px;font:900 15px/1 Arial,Helvetica,sans-serif;color:${INK};box-shadow:4px 4px 0 ${INK};white-space:nowrap;animation:g-pop .22s ease-out}
  .lbg-bubble.angry{background:${RED};color:#fff;font-size:17px;letter-spacing:.02em}
  @keyframes g-pop{from{transform:scale(.4);opacity:0}}
  .lbg-flying{position:fixed;z-index:59;pointer-events:none;margin:0;line-height:1;will-change:transform}
  .lbg-stolen{visibility:hidden}
  .lbg-shake{animation:g-shake .6s ease-in-out}
  @keyframes g-shake{20%{transform:rotate(-3deg) translateX(-6px)}40%{transform:rotate(3deg) translateX(6px)}60%{transform:rotate(-2deg)}80%{transform:rotate(1deg)}}
  .lbg-feather{position:fixed;z-index:59;pointer-events:none;font-size:20px}
  .lbg-chips{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:62;
    display:flex;flex-direction:column;align-items:flex-end;gap:8px}
  .lbg-chip{border:2px solid ${INK};border-radius:999px;background:${LIME};color:${INK};font:900 11px/1.15 Arial,Helvetica,sans-serif;
    letter-spacing:.05em;padding:9px 12px;cursor:pointer;box-shadow:3px 3px 0 ${INK};text-align:right}
  .lbg-chip.score{background:${CREAM}}
  .lbg-chip.score.hot{background:${RED};color:#fff}
  @media(max-width:540px){.lbg-goose{width:84px;height:77px}.lbg-bubble{font-size:13px}.lbg-chip{font-size:10px;padding:8px 10px}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);

  const chips = document.createElement('div');
  chips.className = 'lbg-chips';
  const scoreChip = document.createElement('button');
  scoreChip.type = 'button';
  scoreChip.className = 'lbg-chip score';
  scoreChip.hidden = true;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'lbg-chip';
  chips.append(scoreChip, toggle);
  document.body.append(chips);

  let goose = null, running = false, x = 40, dir = 1, target = null, speed = 70, last = 0, nextAct = 0, busy = false, sound = false;
  let anger = 0, lastClick = 0, rageUntil = 0, mouseX = null, clicks = 0;
  let best = parseInt(store.get('lbg-goose-best') || '0', 10) || 0;
  let points = parseInt(store.get('lbg-honk-points') || '0', 10) || 0;
  let streak = 0, hiding = false, hideEl = null, hideTimer = 0, nextHide = 0, quizOpen = false;
  const asked = new Set();
  const stolen = new Set();
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const W = () => window.innerWidth;
  const gw = () => (goose ? goose.offsetWidth : 110);
  const setMood = (...m) => { if (!goose) return; goose.classList.remove('mad1', 'mad2', 'rage'); m.forEach(c => goose.classList.add(c)); };

  function setLabel() {
    const on = store.get('lbg-goose') !== 'off';
    toggle.textContent = on ? '🪿 GOOSE: ON' : '🪿 GOOSE: OFF';
    toggle.setAttribute('aria-pressed', String(on));
  }
  function showScore() {
    scoreChip.hidden = false;
    scoreChip.textContent = `🪿 HONK POINTS ${points}${streak > 1 ? ' · 🔥' + streak : ''}\n😤 ANNOYED ×${clicks} · BEST ${best}\nTAP TO SHARE`;
    scoreChip.style.whiteSpace = 'pre';
    scoreChip.classList.toggle('hot', anger >= 6);
  }

  // --- sound (only after a visitor clicks the goose or the toggle) ---
  let ctx = null;
  function honkSound(angry) {
    if (!sound) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime, base = angry ? 520 : 420;
      [0, angry ? 0.12 : 0.18].forEach(off => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(base, t + off);
        o.frequency.exponentialRampToValueAtTime(base * 0.6, t + off + 0.14);
        g.gain.setValueAtTime(0.0001, t + off);
        g.gain.exponentialRampToValueAtTime(angry ? 0.16 : 0.11, t + off + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.16);
        o.connect(g).connect(ctx.destination);
        o.start(t + off); o.stop(t + off + 0.17);
      });
    } catch { /* audio not available */ }
  }

  function bubble(text, ms = 1500, angry = false) {
    if (!goose) return;
    document.querySelectorAll('.lbg-bubble').forEach(n => n.remove());
    const r = goose.getBoundingClientRect();
    const b = document.createElement('div');
    b.className = 'lbg-bubble' + (angry ? ' angry' : '');
    b.textContent = text;
    document.body.append(b);
    const bx = Math.min(Math.max(8, r.left + r.width / 2 - b.offsetWidth / 2), W() - b.offsetWidth - 8);
    b.style.left = bx + 'px';
    b.style.top = (r.top - b.offsetHeight - 6) + 'px';
    setTimeout(() => b.remove(), ms);
  }

  function honk(text, angry = false) {
    if (!goose) return;
    goose.classList.add('honking');
    setTimeout(() => goose && goose.classList.remove('honking'), 600);
    bubble(text || pick(['HONK!', 'HONK HONK!', 'honk?', '1%!!', 'HONK OUT!', 'battery check!', 'running on fumes']), 1500, angry);
    honkSound(angry);
  }

  // --- letter theft (never from the contract, safety notices or fine print) ---
  const SAFE = '[data-ca],[data-live-ca],.risk-note,.channels-caution,.guess-fine,.announcement,.ca-box,form,button,input,textarea,.lbg-bubble,.lbg-chips';
  function visibleTextNode() {
    const els = [...document.querySelectorAll('h1,h2,h3,.hero-sub,.section-kicker,.challenge-main>p,.intro-right p,.feature p,.drain-card strong,.fact-value,.guess-main>p')]
      .filter(el => { const r = el.getBoundingClientRect(); return r.bottom > 60 && r.top < window.innerHeight - 130 && r.width > 0 && !el.closest(SAFE); });
    for (let tries = 0; tries < 6 && els.length; tries++) {
      const el = pick(els);
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => (/[A-Za-z%]/.test(n.nodeValue) && !n.parentElement.closest(SAFE) && !n.parentElement.classList.contains('lbg-stolen')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      if (nodes.length) return pick(nodes);
    }
    return null;
  }

  function stealLetter(taunt) {
    if (stolen.size >= 4 || !goose) return false;
    const node = visibleTextNode();
    if (!node) return false;
    const idxs = [...node.nodeValue].map((c, i) => (/[A-Za-z%]/.test(c) ? i : -1)).filter(i => i >= 0);
    const after = node.splitText(pick(idxs));
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
    const beak = { x: g.left + (dir > 0 ? g.width * 0.9 : g.width * 0.1) - from.left, y: g.top + g.height * 0.22 - from.top };
    const land = { x: rand(20, W() - 60) - from.left, y: rand(window.innerHeight * 0.3, window.innerHeight - 150) - from.top };
    const spin = rand(-600, 600);
    const a1 = fly.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${beak.x}px,${beak.y}px) rotate(${spin / 3}deg) scale(.8)` }],
      { duration: 700, easing: 'cubic-bezier(.5,-0.3,.6,1)', fill: 'forwards' });
    a1.onfinish = () => {
      honk(taunt || pick(['nom.', 'MINE!', 'yoink', 'HONK!', 'needed that one']));
      // Throw it clean off the screen: an arc that keeps going past the edge, spinning and fading out.
      const offRight = Math.random() < 0.5;
      const outX = (offRight ? W() + 140 : -140) - from.left;
      const outY = rand(-180, window.innerHeight * 0.4) - from.top;
      const peakY = Math.min(beak.y, outY) - rand(140, 240);
      const throwIt = fly.animate([
        { transform: `translate(${beak.x}px,${beak.y}px) rotate(${spin / 3}deg) scale(.8)`, opacity: 1 },
        { transform: `translate(${(beak.x + outX) / 2}px,${peakY}px) rotate(${spin}deg) scale(1.35)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${outX}px,${outY}px) rotate(${spin * 1.6}deg) scale(1.1)`, opacity: 0 }],
        { duration: rand(1300, 1800), easing: 'cubic-bezier(.25,.6,.4,1)', fill: 'forwards' });
      throwIt.onfinish = () => {
        fly.remove();
        // A few seconds later, the letter gradually fades back into its spot.
        setTimeout(() => fadeBack(span), rand(2500, 5000));
      };
    };
    return true;
  }

  function fadeBack(span) {
    if (!span.isConnected) { stolen.delete(span); return; }
    span.style.display = 'inline-block';
    span.style.visibility = 'visible';
    const anim = span.animate([
      { opacity: 0, transform: 'translateY(-18px) scale(1.5) rotate(-20deg)', filter: 'blur(3px)' },
      { opacity: 0.6, transform: 'translateY(3px) scale(.95) rotate(4deg)', filter: 'blur(0)', offset: 0.7 },
      { opacity: 1, transform: 'none', filter: 'none' }],
      { duration: 1400, easing: 'ease-out' });
    anim.onfinish = () => restore(span, null);
  }

  function restore(span, fly) {
    if (fly) fly.remove();
    if (span.isConnected) { const p = span.parentNode; span.replaceWith(...span.childNodes); p.normalize(); }
    stolen.delete(span);
  }

  function feathers(cx, cy, n = 6) {
    for (let k = 0; k < n; k++) {
      const f = document.createElement('span');
      f.className = 'lbg-feather'; f.textContent = '🪶';
      f.style.left = cx + 'px'; f.style.top = cy + 'px';
      document.body.append(f);
      f.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${rand(-130, 130)}px,${rand(-150, 60)}px) rotate(${rand(-260, 260)}deg)`, opacity: 0 }],
        { duration: rand(900, 1500), easing: 'ease-out' }).onfinish = () => f.remove();
    }
  }

  let arrive = null;
  function crash() {
    const els = [...document.querySelectorAll('.hero-art img,.feature,.drain-card,.channel-card,.fact-item,.bingo-tile,.trophy-card,.guess-prize,.meme-preview,.button')]
      .filter(el => { const r = el.getBoundingClientRect(); return r.top < window.innerHeight - 40 && r.bottom > 80 && !el.closest('.lbg-chips'); });
    if (!els.length) return false;
    const el = pick(els);
    const r = el.getBoundingClientRect();
    target = Math.min(Math.max(0, r.left + r.width / 2 - gw() / 2), W() - gw());
    speed = 360;
    goose.classList.add('running');
    arrive = () => {
      goose.classList.remove('running');
      el.classList.remove('lbg-shake'); void el.offsetWidth; el.classList.add('lbg-shake');
      setTimeout(() => el.classList.remove('lbg-shake'), 650);
      feathers(r.left + r.width / 2, Math.max(r.top, 60) + 20);
      honk(pick(['BONK', 'oops.', 'honk trouble!', 'who put that there', 'HONK!!']));
    };
    return true;
  }

  function pause(cls, ms, after) {
    busy = true; target = null; goose.classList.remove('walking', 'running'); goose.classList.add(cls);
    setTimeout(() => { if (goose) goose.classList.remove(cls); busy = false; if (after) after(); }, ms);
  }
  const coffee = () => { bubble(pick(['need… coffee…', 'coffee break', 'charging ☕', '1% → 2%']), 2200); pause('sip', 3300, () => honk(pick(['ok. HONK.', 'slightly less dead', 'RECHARGED-ish']))); };
  const yawn = () => { bubble('*yaaawn*', 1400); pause('yawn', 1400); };
  const nap = () => { bubble('💤 1%…', 3000); pause('sleepy', 3400, () => honk('RECHARGED. HONK!')); };
  function zoomies() {
    target = dir > 0 ? 0 : W() - gw();
    speed = 440; goose.classList.add('running');
    arrive = () => { goose.classList.remove('running'); honk('ZOOMIES!'); };
  }

  function act() {
    if (busy || reduce || Date.now() < rageUntil) return;
    const r = Math.random();
    if (r < 0.24) { if (!stealLetter()) honk(); }
    else if (r < 0.44) { if (!crash()) honk(); }
    else if (r < 0.6) coffee();
    else if (r < 0.7) zoomies();
    else if (r < 0.8) yawn();
    else if (r < 0.88) nap();
    else honk();
  }

  // --- Annoy the Goose (click game) ---
  const MAD_LINES = ['excuse me?', 'stop poking.', 'I am TIRED.', "don't.", 'HONK. OFF.', 'I will bite.', 'last warning.'];
  function poke() {
    sound = true;
    const now = Date.now();
    anger = Math.max(0, anger - Math.floor((now - lastClick) / 2500)) + 1;
    lastClick = now;
    clicks += 1;
    if (clicks > best) { best = clicks; store.set('lbg-goose-best', String(best)); }
    goose.classList.remove('jump', 'sleepy', 'sip', 'yawn'); void goose.offsetWidth; goose.classList.add('jump');
    busy = false;
    if (anger >= 7 && now > rageUntil) {
      rageUntil = now + 6000;
      setMood('rage');
      honk('HONK HONK HONK!!!', true);
      stealLetter('TAKE THAT'); setTimeout(() => stealLetter('AND THAT'), 900);
      setTimeout(() => {
        if (!goose) return;
        anger = 0; setMood(); rageUntil = 0;
        coffee();
      }, 6000);
    } else if (now < rageUntil) {
      honk(pick(['GRRR', 'HONK!!', 'I SEE YOU']), true);
    } else if (anger >= 4) {
      setMood('mad2'); honk(pick(MAD_LINES), true);
    } else if (anger >= 2) {
      setMood('mad1'); honk(pick(MAD_LINES));
    } else {
      setMood(); honk(pick(['hm?', 'HONK!', 'what.', 'I was napping']));
    }
    showScore();
  }
  // calm down over time
  setInterval(() => {
    if (!goose || Date.now() < rageUntil || !anger) return;
    if (Date.now() - lastClick > 2500) { anger -= 1; setMood(...(anger >= 4 ? ['mad2'] : anger >= 2 ? ['mad1'] : [])); if (clicks) showScore(); }
  }, 1200);

  scoreChip.addEventListener('click', async () => {
    const text = `I found the Low Battery Goose and scored ${points} Honk Points 🪿🔋 (annoyed him ${best} times too). Can you find him? lowbatterygoose.pages.dev #HonkOut`;
    try { await navigator.clipboard.writeText(text); scoreChip.textContent = 'COPIED! POST IT ON X 🪿'; }
    catch { scoreChip.textContent = `BEST: ${best} · #HonkOut`; }
    setTimeout(showScore, 2500);
  });
  window.addEventListener('pointermove', e => { mouseX = e.clientX; }, { passive: true });


  // --- Hide & seek + quiz: find the hiding goose, answer a question, win or lose Honk Points (just for fun, no token value) ---
  const QUESTIONS = [
    ['What is the Low Battery Goose ticker?', ['$LBG', '$HONK', '$GOOSE'], 0],
    ['Where does $LBG launch?', ['Pump.fun', 'A private presale', 'Bitcoin'], 0],
    ['Which blockchain is $LBG on?', ['Solana', 'Ethereum', 'Dogecoin'], 0],
    ['What battery % is the goose running on?', ['1%', '50%', '100%'], 0],
    ["Finish the slogan: Running on 1%. Still…", ['honking.', 'charging.', 'sleeping.'], 0],
    ['What is the community Telegram group called?', ['The Low Battery Flock', 'Goose Gang', 'Honk Club'], 0],
    ['Admins of Low Battery Goose will never…', ['DM you first', 'post memes', 'play Honk Bingo'], 0],
    ['Who should you share your seed phrase with?', ['Nobody. Ever.', 'An admin who DMs you', 'The goose'], 0],
    ['Where is the only official contract address?', ['Our website and official channels', 'Any DM you get', 'The first reply under a post'], 0],
    ['What is the free mini-game on the site called?', ['1% Honk Bingo', 'Goose Poker', 'Battery Blackjack'], 0],
    ['Which hashtag is the weekly meme challenge?', ['#PassTheGoose', '#GooseMoon', '#HonkPump'], 0],
    ['What is the Goose Guess winner crowned?', ['The First Honker', 'Goose King', 'Battery Boss'], 0],
    ['What happens if you poke the goose too many times?', ['He rages and chases you', 'He gives you coffee', 'Nothing'], 0],
    ['What does "dead batt" mean in the flock?', ['Completely done', 'Fully charged', 'A bug in the site'], 0],
    ['What does the goose drink to recharge?', ['Coffee', 'Battery acid', 'Lemonade'], 0]
  ];

  const qcss = document.createElement('style');
  qcss.textContent = `
  .lbg-hidden-goose{position:absolute;z-index:58;width:70px;height:64px;border:0;background:transparent;padding:0;cursor:pointer;
    animation:g-peek 2.4s ease-in-out infinite;-webkit-tap-highlight-color:transparent}
  .lbg-hidden-goose svg{overflow:visible}
  @keyframes g-peek{0%,100%{translate:0 10px;rotate:-6deg}50%{translate:0 0;rotate:4deg}}
  .lbg-quiz-back{position:fixed;inset:0;z-index:70;background:rgba(25,37,30,.45);display:flex;align-items:center;justify-content:center;
    padding:16px max(16px,env(safe-area-inset-left,0px)) 16px max(16px,env(safe-area-inset-right,0px))}
  .lbg-quiz{width:min(440px,100%);background:${CREAM};border:3px solid ${INK};border-radius:20px;box-shadow:8px 8px 0 ${INK};padding:22px;
    font-family:Arial,Helvetica,sans-serif;color:${INK};animation:g-pop .22s ease-out}
  .lbg-quiz h3{margin:0 0 6px;font-size:13px;letter-spacing:.1em}
  .lbg-quiz p{margin:0 0 16px;font-size:20px;font-weight:900;line-height:1.25}
  .lbg-quiz .opts{display:grid;gap:10px}
  .lbg-quiz .opts button{border:2px solid ${INK};border-radius:12px;background:#fff;color:${INK};font:900 15px Arial,Helvetica,sans-serif;
    padding:13px 14px;text-align:left;cursor:pointer}
  .lbg-quiz .opts button:hover{background:${LIME}}
  .lbg-quiz .opts button.right{background:${LIME}}.lbg-quiz .opts button.wrong{background:${RED};color:#fff}
  .lbg-quiz .fine{margin:14px 0 0;font-size:11px;font-weight:700;line-height:1.4;opacity:.8}
  .lbg-quiz .close{float:right;border:0;background:transparent;font:900 20px Arial;cursor:pointer;color:${INK}}
  .lbg-quiz .result{margin:14px 0 0;font-size:16px;font-weight:900;min-height:20px}
  .lbg-chip.hint{background:${ORANGE}}
  `;
  document.head.append(qcss);
  const hintChip = document.createElement('button');
  hintChip.type = 'button';
  hintChip.className = 'lbg-chip hint';
  hintChip.hidden = true;
  hintChip.textContent = '👀 THE GOOSE IS HIDING! FIND HIM';
  chips.prepend(hintChip);
  hintChip.addEventListener('click', () => { if (hideEl) hideEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); hintChip.textContent = '👀 GETTING WARMER…'; });

  function startHide() {
    if (!goose || hiding || quizOpen) return false;
    const spots = [...document.querySelectorAll('.feature,.channel-card,.fact-item,.drain-card,.trophy-card,.bingo-game,.meme-preview,.guess-card,.award-benefits article,.quote-box,.hall-panel')]
      .filter(el => el.offsetWidth > 80 && !el.closest('[hidden]'));
    if (!spots.length) return false;
    const el = pick(spots);
    const r = el.getBoundingClientRect();
    const peek = document.createElement('button');
    peek.type = 'button';
    peek.className = 'lbg-hidden-goose';
    peek.setAttribute('aria-label', 'You found the goose! Answer his question');
    peek.innerHTML = SVG;
    const left = window.scrollX + r.left + rand(10, Math.max(12, r.width - 80));
    const top = window.scrollY + r.top - 52;
    Object.assign(peek.style, { left: left + 'px', top: top + 'px' });
    document.body.append(peek);
    peek.addEventListener('click', () => openQuiz());
    hideEl = peek; hiding = true;
    goose.style.visibility = 'hidden';
    honk(pick(['bye 👋', 'catch me', 'hide and honk!']));
    hintChip.hidden = false; hintChip.textContent = '👀 THE GOOSE IS HIDING! FIND HIM';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => endHide('nobody found me. rude.'), 75000);
    return true;
  }

  function endHide(line) {
    if (!hiding) return;
    hiding = false; clearTimeout(hideTimer);
    if (hideEl) { hideEl.remove(); hideEl = null; }
    hintChip.hidden = true;
    if (goose) { goose.style.visibility = ''; if (line) honk(line); }
    nextHide = performance.now() + rand(45000, 80000);
  }

  function openQuiz() {
    if (quizOpen) return;
    quizOpen = true; sound = true;
    let pool = QUESTIONS.map((q, i) => i).filter(i => !asked.has(i));
    if (!pool.length) { asked.clear(); pool = QUESTIONS.map((q, i) => i); }
    const qi = pick(pool); asked.add(qi);
    const [question, options, correct] = QUESTIONS[qi];
    const order = options.map((o, i) => i).sort(() => Math.random() - 0.5);
    const back = document.createElement('div');
    back.className = 'lbg-quiz-back';
    const box = document.createElement('div');
    box.className = 'lbg-quiz'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Goose question');
    const close = document.createElement('button'); close.type = 'button'; close.className = 'close'; close.textContent = '×'; close.setAttribute('aria-label', 'Close');
    const h = document.createElement('h3'); h.textContent = '🪿 YOU FOUND ME. ANSWER THIS:';
    const qp = document.createElement('p'); qp.textContent = question;
    const opts = document.createElement('div'); opts.className = 'opts';
    const result = document.createElement('div'); result.className = 'result'; result.setAttribute('role', 'status');
    const fine = document.createElement('p'); fine.className = 'fine';
    fine.textContent = 'Right: +10 Honk Points (more on a streak). Wrong: −3 points and your streak. Honk Points are just for fun and have no token value.';
    let done = false;
    order.forEach(i => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = options[i];
      b.addEventListener('click', () => {
        if (done) return; done = true;
        if (i === correct) {
          streak += 1; const gain = 10 + Math.min(streak - 1, 5) * 2; points += gain;
          b.classList.add('right'); result.textContent = `HONK! Correct. +${gain} Honk Points${streak > 1 ? ` (🔥 streak ${streak})` : ''}`;
          const r = b.getBoundingClientRect(); feathers(r.left + r.width / 2, r.top, 8);
          honkSound(false);
        } else {
          streak = 0; points = Math.max(0, points - 3);
          b.classList.add('wrong'); opts.children[order.indexOf(correct)].classList.add('right');
          result.textContent = 'WRONG. −3 Honk Points. The goose is laughing at you.';
          honkSound(true);
        }
        store.set('lbg-honk-points', String(points));
        showScore();
        setTimeout(() => finish(i === correct), 1600);
      });
      opts.append(b);
    });
    function finish(ok) {
      back.remove(); quizOpen = false; document.removeEventListener('keydown', onKey);
      endHide(ok ? pick(['smart honker.', 'HONK! you get it.', 'ok you can stay']) : null);
      if (!ok && goose) { honk('HA HONK HA', true); stealLetter('for being wrong'); }
    }
    const onKey = e => { if (e.key === 'Escape') { back.remove(); quizOpen = false; document.removeEventListener('keydown', onKey); } };
    close.addEventListener('click', () => { back.remove(); quizOpen = false; document.removeEventListener('keydown', onKey); });
    document.addEventListener('keydown', onKey);
    box.append(close, h, qp, opts, result, fine);
    back.append(box);
    back.addEventListener('click', e => { if (e.target === back) close.click(); });
    document.body.append(back);
    opts.querySelector('button').focus();
  }
  if (/[?&]goose=hide\b/.test(location.search)) setTimeout(() => startHide(), 1500);

  function frame(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    const raging = Date.now() < rageUntil;
    if (!hiding && !quizOpen && !raging && !reduce && goose && nextHide && t > nextHide && !document.hidden) { if (!startHide()) nextHide = t + 30000; }
    if (!document.hidden && goose && !hiding && (!busy || raging) && !reduce) {
      if (raging && mouseX != null) { target = Math.min(Math.max(0, mouseX - gw() / 2), W() - gw()); speed = 560; goose.classList.add('running'); }
      if (target == null) { target = rand(0, Math.max(0, W() - gw())); speed = rand(55, 90); }
      const d = target - x;
      if (Math.abs(d) < 4) {
        if (!raging) {
          target = null; goose.classList.remove('walking', 'running');
          if (arrive) { const fn = arrive; arrive = null; fn(); }
          busy = true; setTimeout(() => { busy = false; }, rand(600, 1800));
        }
      } else {
        dir = d > 0 ? 1 : -1;
        x += dir * Math.min(Math.abs(d), speed * dt);
        goose.classList.add('walking');
      }
      goose.style.setProperty('--gx', x + 'px');
      goose.style.setProperty('--gdir', dir);
      if (!raging && t > nextAct) { nextAct = t + rand(6000, 11000); act(); }
    }
    requestAnimationFrame(frame);
  }

  function start() {
    if (goose) return;
    goose = document.createElement('button');
    goose.type = 'button';
    goose.className = 'lbg-goose';
    goose.setAttribute('aria-label', 'Poke the goose');
    goose.innerHTML = `<span class="g-flip">${SVG}</span>`;
    document.body.append(goose);
    x = reduce ? 16 : rand(0, Math.max(0, W() - gw()));
    goose.style.setProperty('--gx', x + 'px');
    goose.addEventListener('click', poke);
    running = true; last = 0; nextAct = performance.now() + 4000; nextHide = performance.now() + rand(25000, 40000);
    requestAnimationFrame(frame);
    setTimeout(() => honk(pick(['HONK! I live here now.', 'running on 1%. hi.', 'poke me. I dare you.'])), 1200);
  }

  function stop() {
    running = false;
    stolen.forEach(span => restore(span, null));
    document.querySelectorAll('.lbg-flying,.lbg-bubble,.lbg-feather').forEach(n => n.remove());
    if (hiding) endHide(null);
    if (goose) { goose.remove(); goose = null; }
    scoreChip.hidden = true;
  }

  toggle.addEventListener('click', () => {
    const on = store.get('lbg-goose') === 'off';
    store.set('lbg-goose', on ? 'on' : 'off');
    setLabel();
    if (on) { sound = true; start(); } else stop();
  });
  window.addEventListener('resize', () => { if (goose) { x = Math.min(x, Math.max(0, W() - gw())); target = null; } });

  setLabel();
  if (store.get('lbg-goose') !== 'off') { start(); if (points) showScore(); }
})();
