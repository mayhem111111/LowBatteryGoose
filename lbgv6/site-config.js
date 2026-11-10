// Official public links supplied by the project owner, November 3, 2026.
// Official $LBG mint supplied by the project owner for the live launch page.
// The homepage uses this value to display the contract and derive Pump.fun and Solscan links.
window.LBG_CONFIG = Object.freeze({
  x: 'https://x.com/LowBatteryGoose',
  announcements: 'https://t.me/LowBatteryGooseSOL',
  community: 'https://t.me/LowBatteryFlock',
  website: 'https://lowbatterygoose.pages.dev',
  mint: '9g7waf9sid91WiTAp4HXaA8iiPWacWyJiqty9Z4Kpump',
  pumpFun: null,    // derived from the mint above
  // GOOSE GUESS: paste the Google Form link (https://forms.gle/... or https://docs.google.com/forms/...).
  // Until it is set, the Enter button sends people to the Telegram group.
  guessForm: null,
  guessCloses: '2026-11-05T01:00:00Z', // 5:00 PM PT, Nov 4, 2026. After this the button shows "Entries closed".
  // HONKER OF THE WEEK: shown at the top of the homepage. Set after each reveal, replace weekly, null to hide.
  // e.g. honker: { name: '@goosefan', title: 'THE FIRST HONKER', note: 'Goose Guess winner · Nov 5, 2026' },
  honker: null
});
