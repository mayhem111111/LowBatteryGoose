'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const percent = $('percent');
  const reason = $('reason');
  const percentOutput = $('percent-output');
  const memePercent = $('meme-percent');
  const memeCaption = $('meme-caption');
  const count = $('char-count');
  const status = $('action-status');
  // Official social links supplied by the owner; token addresses stay unset.
  const links = window.LBG_CONFIG || {};
  const officialDomains = {
    x: new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com']),
    announcements: new Set(['t.me', 'www.t.me']),
    community: new Set(['t.me', 'www.t.me'])
  };
  let linked = 0;
  for (const [kind, hosts] of Object.entries(officialDomains)) {
    const raw = links[kind];
    const placeholder = document.querySelector(`[data-channel-link="${kind}"]`);
    if (!raw || !placeholder) continue;
    try {
      const url = new URL(raw);
      if (url.protocol !== 'https:' || !hosts.has(url.hostname) || !/^\/[A-Za-z0-9_]{5,32}\/?$/.test(url.pathname)) continue;
      const a = document.createElement('a');
      a.className = 'channel-link';
      a.href = url.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = kind === 'x' ? 'VISIT OUR X ACCOUNT ↗' : kind === 'community' ? 'JOIN THE FLOCK ↗' : 'READ OUR ANNOUNCEMENTS ↗';
      placeholder.replaceWith(a);
      linked++;
    } catch { /* A malformed URL must never appear as an official link. */ }
  }
  if (linked) {
    const socialState = $('social-state');
    if (socialState) socialState.textContent = 'NO OFFICIAL TOKEN MINT VERIFIED · USE ONLY LINKS ON THIS PAGE';
  }
  // Launch mode: switches the page to "live" only when site-config.js holds a valid Solana address.
  (() => {
    const mint = typeof links.mint === 'string' ? links.mint.trim() : '';
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint)) return;
    let pump = `https://pump.fun/coin/${mint}`;
    if (typeof links.pumpFun === 'string') {
      try {
        const u = new URL(links.pumpFun);
        if (u.protocol === 'https:' && (u.hostname === 'pump.fun' || u.hostname === 'www.pump.fun') && u.pathname.includes(mint)) pump = u.href;
      } catch { /* keep the derived link */ }
    }
    document.documentElement.classList.add('lbg-live');
    document.querySelectorAll('[data-live-text]').forEach(el => { el.textContent = el.getAttribute('data-live-text'); });
    document.querySelectorAll('[data-live-only]').forEach(el => { el.hidden = false; });
    document.querySelectorAll('[data-ca], [data-live-ca]').forEach(el => { el.textContent = mint; el.classList.remove('status-pending'); el.classList.add('ca-inline'); });
    document.querySelectorAll('[data-pumpfun-link]').forEach(a => { a.href = pump; });
    document.querySelectorAll('[data-solscan-link]').forEach(a => { a.href = `https://solscan.io/token/${mint}`; });
    const caStatus = document.querySelector('[data-ca-status]');
    document.querySelectorAll('[data-ca-copy]').forEach(btn => btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(mint); if (caStatus) caStatus.textContent = 'Address copied. Compare the first and last characters before you trade.'; }
      catch { if (caStatus) caStatus.textContent = 'Copy failed here. Select the address above and copy it manually.'; }
    }));
    const socialState = $('social-state');
    if (socialState) socialState.textContent = 'OFFICIAL CONTRACT SHOWN ON THIS SITE · WE NEVER DM FIRST';
  })();

  const fallbackReason = 'opened my inbox.';
  const image = new Image();
  image.src = 'assets/goose.png';

  const caption = () => (reason.value.trim() || fallbackReason);
  const shareText = () => `🪿🔋 THE GREAT BATTERY DRAIN\nBattery: ${percent.value}%\nWhat drained me: ${caption()}\nRunning on 1%. Still honking.\nhttps://lowbatterygoose.pages.dev/#battery-check #LowBatteryGoose`;

  function refresh() {
    percentOutput.value = `${percent.value}%`;
    percentOutput.textContent = `${percent.value}%`;
    memePercent.textContent = `${percent.value}%`;
    memeCaption.textContent = `reason: ${caption()}`;
    count.textContent = `${reason.value.length}/120`;
    status.textContent = '';
  }
  percent.addEventListener('input', refresh);
  reason.addEventListener('input', refresh);
  refresh();
  $('year').textContent = String(new Date().getFullYear());

  $('share-check').addEventListener('click', async () => {
    const message = shareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Low Battery Goose · Battery Check', text: message });
        status.textContent = 'Share dialog opened.';
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') { status.textContent = 'Share cancelled.'; return; }
      }
    }
    try {
      await navigator.clipboard.writeText(message);
      status.textContent = 'Check-in copied to your clipboard.';
    } catch {
      // Clipboard can be unavailable on a file:// page. Select manual share text.
      reason.focus();
      status.textContent = 'Automatic sharing is unavailable here. Copy your check-in text from the preview.';
    }
  });

  function wrapText(ctx, text, maxWidth, maxLines) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) { line = candidate; continue; }
      if (line) { lines.push(line); line = ''; }
      if (ctx.measureText(word).width <= maxWidth) { line = word; continue; }
      // Break long unspaced strings without clipping.
      let fragment = '';
      for (const letter of word) {
        const attempt = fragment + letter;
        if (ctx.measureText(attempt).width > maxWidth && fragment) { lines.push(fragment); fragment = letter; }
        else fragment = attempt;
      }
      line = fragment;
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      const trimmed = lines.slice(0, maxLines);
      while (ctx.measureText(trimmed[maxLines - 1] + '…').width > maxWidth && trimmed[maxLines - 1].length) {
        trimmed[maxLines - 1] = trimmed[maxLines - 1].slice(0, -1);
      }
      trimmed[maxLines - 1] += '…';
      return trimmed;
    }
    return lines;
  }

  async function ensureImage() {
    if (image.complete && image.naturalWidth) return image;
    await image.decode();
    return image;
  }

  $('download-card').addEventListener('click', async () => {
    const button = $('download-card');
    button.disabled = true;
    try {
      await ensureImage();
      const size = 1080;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');
      const ink = '#19251e';
      ctx.fillStyle = '#fffceb';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = ink;
      ctx.font = '900 30px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('LOW BATTERY GOOSE', 66, 81);
      ctx.textAlign = 'right';
      ctx.font = '900 21px Arial, sans-serif';
      ctx.fillText('BATTERY CHECK ↗', 1014, 81);
      ctx.textAlign = 'center';
      ctx.font = '900 120px Arial, sans-serif';
      ctx.fillText(`${percent.value}%`, 540, 213);
      ctx.drawImage(image, 286, 250, 508, 508);
      ctx.fillStyle = ink;
      const text = `reason: ${caption()}`;
      // Scale font down for the longest captions to fit the card area.
      const fontSize = text.length > 94 ? 34 : text.length > 65 ? 40 : 50;
      ctx.font = `900 ${fontSize}px Arial, sans-serif`;
      const lines = wrapText(ctx, text, 930, 4);
      const lineHeight = fontSize * 1.12;
      let y = 809 + (4 - lines.length) * 12;
      for (const line of lines) { ctx.fillText(line, 540, y); y += lineHeight; }
      ctx.beginPath();
      ctx.moveTo(66, 981);
      ctx.lineTo(1014, 981);
      ctx.lineWidth = 3;
      ctx.strokeStyle = ink;
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.font = '900 24px Arial, sans-serif';
      ctx.fillText('RUNNING ON 1%. STILL HONKING.', 66, 1030);
      ctx.textAlign = 'right';
      ctx.fillText('✳', 1014, 1030);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG export failed');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `low-battery-goose-${percent.value}-percent.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'Your meme card has been saved as a PNG.';
    } catch {
      status.textContent = 'The image could not be exported. Try opening the site through a local web server.';
    } finally {
      button.disabled = false;
    }
  });
})();
