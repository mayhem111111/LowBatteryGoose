'use strict';
// This is a free, no-wallet Telegram Mini App. The Telegram API token is NOT needed here.
(() => {
  const tg = window.Telegram && window.Telegram.WebApp;
  const inTelegram = Boolean(tg && (tg.initData || /tgWebAppPlatform=/.test(location.hash + location.search)));
  window.LBG_IN_TELEGRAM = inTelegram;
  if (!inTelegram) return;
  try { tg.ready(); tg.expand(); } catch (_) { /* Non-Telegram web browsers remain supported. */ }
  document.documentElement.classList.add('in-telegram');
  // Ensure Telegram community links open in the Telegram client, not a nested webview.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="https://t.me/"]');
    if (!link || !tg.openTelegramLink) return;
    event.preventDefault();
    tg.openTelegramLink(link.href);
  });
})();

/* Mini-game: local state only. No account data or token interactions. */
(() => {
  const tiles = Array.from(document.querySelectorAll('#bingo-grid .bingo-tile'));
  if (tiles.length !== 9) return;
  const result = document.getElementById('bingo-result');
  const status = document.getElementById('bingo-status');
  const badge = document.getElementById('bingo-badge');
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  let hasBingo = false;
  const selected = () => tiles.map(t => t.getAttribute('aria-pressed') === 'true');
  const names = () => tiles.filter(t => t.getAttribute('aria-pressed') === 'true').map(t => t.querySelector('b').textContent);
  function update() {
    const on = selected();
    const count = on.filter(Boolean).length;
    const completed = lines.filter(line => line.every(i => on[i])).length;
    hasBingo = completed > 0;
    badge.disabled = !hasBingo;
    badge.textContent = hasBingo ? '🏆 SAVE MY CERTIFIED HONKER BADGE ↓' : '🔒 SAVE CERTIFIED HONKER BADGE';
    result.textContent = hasBingo ? `HONK BINGO! ${completed} completed line${completed === 1 ? '' : 's'} · ${count}/9 drains. Badge unlocked! 🪿` : `${count}/9 drains marked. Three in a row earns a honk!`;
  }
  tiles.forEach(tile => tile.addEventListener('click', () => {
    tile.setAttribute('aria-pressed', tile.getAttribute('aria-pressed') !== 'true' ? 'true' : 'false');
    status.textContent = '';
    update();
  }));
  document.getElementById('bingo-reset').addEventListener('click', () => {
    tiles.forEach(t => t.setAttribute('aria-pressed','false'));
    status.textContent = 'Board reset. Honk again!';
    update();
  });
  function shareText() {
    const items = names();
    return `🪿🔋 1% HONK BINGO!\n${hasBingo ? '🏆 CERTIFIED HONKER — BINGO!' : 'Still collecting my battery drains...'}\n${items.length}/9 squares: ${items.join(' · ') || 'none yet'}\nWhat drained YOUR battery? Join the flock 👇\nhttps://t.me/LowBatteryFlock\nPlay: https://lowbatterygoose.pages.dev/#honk-bingo\n#LowBatteryGoose`;
  }
  document.getElementById('bingo-copy').addEventListener('click', async () => {
    const message = shareText();
    try {
      await navigator.clipboard.writeText(message);
      status.textContent = 'Copied! Now click POST IN TELEGRAM and paste your honk.';
    } catch {
      const helper = document.createElement('textarea');
      helper.value = message;
      helper.style.position = 'fixed'; helper.style.top='-9999px';
      document.body.appendChild(helper); helper.select();
      const copied = document.execCommand('copy'); helper.remove();
      status.textContent = copied ? 'Copied! Open Telegram and paste your honk.' : 'Copy the result manually from the board, then post in Telegram.';
    }
  });
  document.getElementById('bingo-badge').addEventListener('click', async () => {
    if (!hasBingo) return;
    const button = badge;
    button.disabled = true;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080; canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle='#cdf45c'; ctx.fillRect(0,0,1080,1080);
      ctx.strokeStyle='#19251e'; ctx.lineWidth=22; ctx.strokeRect(22,22,1036,1036);
      ctx.textAlign='center'; ctx.fillStyle='#19251e';
      ctx.font='900 48px Arial, sans-serif'; ctx.fillText('LOW BATTERY GOOSE',540,100);
      ctx.font='900 91px Arial, sans-serif'; ctx.fillText('CERTIFIED',540,210); ctx.fillText('HONKER',540,305);
      ctx.fillStyle='#fffceb'; ctx.beginPath();ctx.arc(540,565,234,0,2*Math.PI);ctx.fill();
      const im = new Image(); im.src='assets/goose.png'; await im.decode();
      ctx.drawImage(im,320,347,440,440);
      ctx.fillStyle='#19251e'; ctx.font='900 61px Arial, sans-serif'; ctx.fillText('🏆 BINGO UNLOCKED',540,885);
      ctx.font='900 32px Arial, sans-serif'; ctx.fillText('RUNNING ON 1%. STILL HONKING.',540,960);
      ctx.font='900 23px Arial, sans-serif'; ctx.fillText('t.me/LowBatteryFlock',540,1011);
      const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
      if (!blob) throw new Error('PNG unavailable');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');a.href=url;a.download='low-battery-goose-certified-honker.png';
      document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
      status.textContent='Badge downloaded! Share it in The Low Battery Flock.';
    } catch {
      status.textContent='Unable to save the badge in this browser. Try the public HTTPS website.';
    } finally { update(); }
  });
  update();
})();
