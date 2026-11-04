// Official public links supplied by the project owner, November 3, 2026.
// LAUNCH DAY: after the coin is created and the address is verified on Solscan, paste the
// address into `mint` (keep the quotes), save, and redeploy the lbgv6 folder to Cloudflare Pages.
// The whole site switches to "live" automatically. `pumpFun` can stay null: it is built from the mint.
// Until then, leave both null so the site keeps saying no token is live.
window.LBG_CONFIG = Object.freeze({
  x: 'https://x.com/LowBatteryGoose',
  announcements: 'https://t.me/LowBatteryGooseSOL',
  community: 'https://t.me/LowBatteryFlock',
  website: 'https://lowbatterygoose.pages.dev',
  mint: null,       // e.g. mint: 'PASTE_CONTRACT_ADDRESS_HERE',
  pumpFun: null     // optional: full https://pump.fun/coin/... link; derived from mint when null
});
