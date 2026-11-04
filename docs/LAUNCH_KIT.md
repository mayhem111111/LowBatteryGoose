# $LBG Pump.fun launch kit

Replace before posting: `[LAUNCH_TIME]` (e.g. Thu Nov 5, 6:00 PM PT) · `[CONTRACT_ADDRESS]` (paste from the Pump.fun page
after verifying on Solscan) · `[FOUNDER_WALLET]` · `[BUY_SOL]` · `[TONY_WALLET]` · `[STREAMFLOW_LINK]`.
Never post a contract address before the coin exists. No price talk, no "100x", no "guaranteed" anywhere.

---

## 1. Pump.fun create screen (permanent, check twice)
| Field | Value |
|---|---|
| Coin name | Low Battery Goose |
| Ticker | LBG |
| Description | Running on 1%. Still honking. 🪿🔋 A community meme coin for everyone running on fumes: Honk Bingo, weekly challenges, and a flock that decides what comes next. lowbatterygoose.pages.dev |
| Image | `lbgv6/assets/goose.png` (1024×1024) |
| Website | https://lowbatterygoose.pages.dev |
| X | https://x.com/LowBatteryGoose |
| Telegram | https://t.me/LowBatteryGooseSOL |
| Pair | SOL |
| Creator rewards | Creator (you); after creation, share 25% with Tony's wallet from the coin page (Jason 75% / Tony 25%) |
| Mayhem Mode | Off |

## 2. The 10 minutes after you click Create
1. Copy the address from the coin page. Open `https://solscan.io/token/[CONTRACT_ADDRESS]` and confirm name, ticker and that it's yours.
2. **Bot:** Cloudflare → Workers & Pages → `lbg-honk-commander` → Settings → Variables → `TOKEN_ADDRESS` = the address → Deploy. Test `/contract` in the group.
3. **Website:** in `lbgv6/site-config.js` set `mint: '[CONTRACT_ADDRESS]',` → redeploy the `lbgv6` folder in Cloudflare Pages → open the site and check the banner says LIVE and the address matches.
4. Post **X: LIVE** and **Telegram: LIVE** (below) at the same moment. Pin both.
5. Post the **founder disclosure** within the first hour.

---

## 3. X (Twitter) posts

**Launch-time announcement (24–72h before)**
> 🪿🔋 It's official. Low Battery Goose ($LBG) launches on Pump.fun
>
> 🗓 [LAUNCH_TIME]
>
> The contract address will be posted ONLY here, in t.me/LowBatteryGooseSOL and on lowbatterygoose.pages.dev at that moment. Anything earlier is fake.
>
> Running on 1%. Still honking.

**T-1 hour**
> ⏰ 1 hour until $LBG goes live on Pump.fun.
>
> Turn on notifications 🔔 and join the flock: t.me/LowBatteryFlock
>
> Admins never DM first. The only real address will come from this account.

**LIVE (pin this)**
> 🚀 $LBG IS LIVE on Pump.fun 🪿🔋
>
> CA: [CONTRACT_ADDRESS]
>
> ✅ Same address on lowbatterygoose.pages.dev
> 💬 t.me/LowBatteryFlock
>
> Copycats use the same name. Check the address. Meme coin, high risk, NFA.

**Founder disclosure (first hour, 2-post thread)**
> 1/ 🪿 Team transparency:
>
> • Jason (founder): [FOUNDER_WALLET]
> • Tony (team): [TONY_WALLET]
> • Dev buy at launch: [BUY_SOL] SOL
> • No hidden wallets. No team sales during launch week.

> 2/ Team tokens: Jason 5%, Tony 2.5%.
> 25% unlocks at launch, then 25% on Feb 4, May 4 and Aug 4. Locked on Streamflow: [STREAMFLOW_LINK]
>
> Receipts posted weekly. 🔋

**Anti-scam (pin second / repost daily)**
> 🛡️ Goose safety:
> • We never DM first
> • Never share your seed phrase
> • Only trust the CA on lowbatterygoose.pages.dev and this account
>
> If someone DMs you "support" or a "presale", it's a scam. Report and block.

**Launch thread (reply chain under the LIVE post)**
> 1/ What is Low Battery Goose? A meme for everyone running on 1% who still shows up. No roadmap promises, just a flock that builds things together.
>
> 2/ Play free: 1% Honk Bingo and the Battery Check meme maker at lowbatterygoose.pages.dev. Post your result with #LowBatteryGoose.
>
> 3/ Coming next, voted on by the flock: weekly challenges, Honk Arcade games and the Flock Council. The team funds the prizes.

**Day-after recap**
> 🪿 Day 1 of $LBG: [HOLDERS] holders, [MEMES] memes, one exhausted goose.
>
> This week: meme contest (free to enter), Honk Bingo season 1, first X Space.
>
> Thank you, flock. Still honking. 🔋

---

## 4. Telegram posts

**Announcements channel (@LowBatteryGooseSOL): launch time**
```
🪿🔋 LAUNCH DATE IS SET

Low Battery Goose ($LBG) launches on Pump.fun:
🗓 [LAUNCH_TIME]

How you'll get the real contract address:
✅ Posted here at launch
✅ On lowbatterygoose.pages.dev
✅ /contract in the Flock group

Anything posted earlier, or sent by DM, is a scam. Admins never DM first.

Bring a friend to t.me/LowBatteryFlock. Running on 1%. Still honking.
```

**Announcements channel: LIVE (pin, then forward to the Flock group)**
```
🚀 $LBG IS LIVE ON PUMP.FUN 🪿🔋

Contract address:
[CONTRACT_ADDRESS]

🟢 Pump.fun: https://pump.fun/coin/[CONTRACT_ADDRESS]
🔍 Verify: https://solscan.io/token/[CONTRACT_ADDRESS]
🌐 Same address on lowbatterygoose.pages.dev

Copycat tokens use the same name and ticker. Check the address every time.
Meme coins are speculative and can lose all value. Not financial advice.
```

**Founder disclosure**
```
🪿 FOUNDER TRANSPARENCY

• Dev wallet: [FOUNDER_WALLET]
• Dev buy at launch: [BUY_SOL] SOL
• Team wallet (Tony): [TONY_WALLET]
• Team tokens: Jason 5% (50M LBG), Tony 2.5% (25M LBG)
• Vesting: 25% at launch, then 25% on Feb 4, May 4 and Aug 4, 2027. Locks: [STREAMFLOW_LINK]
• Creator fees: Jason 75%, Tony 25%
• No team sales during launch week
• No hidden or bundled wallets

Team wallet activity and contest payouts will be posted every week. Questions welcome in the group.
```

**Flock group pinned rules**
```
🪿 WELCOME TO THE LOW BATTERY FLOCK

✅ Official address: /contract (or lowbatterygoose.pages.dev)
✅ Commands: /help /launch /links /safety /games
🛡️ Admins NEVER DM first. Never share your seed phrase.
🚫 No other tokens, no "DM me", no price promises.
🎮 Play: lowbatterygoose.pages.dev/honk-arcade-v6.html

Be kind, post memes, honk responsibly.
```

**Launch-day contest (free to enter)**
```
🏆 LAUNCH DAY MEME CONTEST

Make a Low Battery Goose meme (use the Battery Check maker on our site or your own art) and post it here with #LowBatteryGoose.

🗓 Ends: [CONTEST_END]
🥇 Top 3 picked by the Flock Council vote. Prizes from the team: [PRIZES]
Free to enter. No purchase needed. Original work only.
```
