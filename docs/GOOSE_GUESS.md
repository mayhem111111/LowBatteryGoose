# The Goose Guess (launch game)

Guess how many members **The Low Battery Flock** Telegram group (t.me/LowBatteryFlock) has at launch:
**6:00 PM PT, Nov 4, 2026**. Entries close **5:00 PM PT, Nov 4**. Winner revealed **6:00 PM PT, Nov 5**.

## Prizes
| Place | Prize | With holder bonus |
|---|---|---|
| 1st (closest guess) | 2,500,000 LBG | 5,000,000 LBG |
| 2nd | 1,000,000 LBG | 2,000,000 LBG |
| 3rd | 500,000 LBG | 1,000,000 LBG |

**Holder bonus:** a winner whose entered wallet holds **100,000+ LBG** at the snapshot (**Nov 5, 5:00 PM PT**) gets the prize doubled.
**Prize pool:** up to 8,000,000 LBG, bought in Jason's first buy at launch (adds ~0.27 SOL), held in a disclosed prize wallet.

## To win (eligibility)
1. Member of The Low Battery Flock Telegram group at the reveal.
2. Follows @LowBatteryGoose on X.
3. One entry per person, submitted before 5:00 PM PT Nov 4.

**No purchase necessary to enter or win.** Holding only doubles a prize. This structure matters: a game you can only
win by buying a token can be treated as an illegal lottery and an inducement to buy. Keep it this way.

## The sign-up sheet: Google Form (5 minutes)
1. Go to forms.google.com → **Blank form**. Title: **The Goose Guess 🪿**.
2. Settings → Responses: turn on **Collect email addresses** (optional) and **Limit to 1 response** (requires a Google sign-in, which cuts spam).
3. Questions (all **Required** except the wallet):
   | Question | Type |
   |---|---|
   | Telegram username (e.g. @goosefan) | Short answer |
   | X (Twitter) handle | Short answer |
   | Your guess: members in The Low Battery Flock at 6:00 PM PT tonight | Short answer → Response validation: **Number**, **Whole number** |
   | Solana wallet address (needed for the prize and the holder bonus) | Short answer (optional) |
   | I'm a member of The Low Battery Flock and follow @LowBatteryGoose | Checkbox (required) |
4. Responses tab → **Link to Sheets**. Every entry lands in a Google Sheet with a timestamp: that's your official sign-up sheet.
5. **Send** → link icon → **Shorten URL** → copy (starts `https://forms.gle/`).
6. Website: in `lbgv6/site-config.js` set `guessForm: 'https://forms.gle/YOUR_LINK',` → re-upload the site. The **Enter your guess** button then opens the form. It switches to **Entries closed** at 5:00 PM PT automatically.
7. At 5:00 PM PT in the form: Responses → turn off **Accepting responses**.

## Picking the winner (Nov 5)
1. **6:00 PM PT Nov 4:** screenshot the group's member count (group info screen) the moment you create the coin. Post it publicly.
2. In the Sheet, add a column `=ABS(C2 - <count>)` (C = guess column) and sort ascending. Ties: earliest timestamp wins.
3. Check each top-3 entrant: still in the group, follows @LowBatteryGoose, not a duplicate or bot.
4. **5:00 PM PT Nov 5:** check each winner's wallet balance on Solscan for the holder bonus (100,000+ LBG).
5. **6:00 PM PT Nov 5:** announce, send prizes from the prize wallet, post the transaction links.

## Posts

**X (now):**
> 🪿 THE GOOSE GUESS
>
> How many honkers will be in the flock when $LBG launches tonight at 6 PM PT?
>
> 🥇 2.5M LBG · 🥈 1M · 🥉 500K
> 🪿 Holders get double
>
> Free to enter, closes 5 PM PT: lowbatterygoose.pages.dev/#goose-guess

**Telegram (pin until 5 PM):**
```
🪿 THE GOOSE GUESS IS ON

Guess how many members this group will have at 6:00 PM PT tonight, when $LBG launches. Closest guess wins.

🥇 2,500,000 LBG
🥈 1,000,000 LBG
🥉 500,000 LBG
🪿 HOLDER BONUS: hold 100,000+ LBG at the snapshot (Nov 5, 5 PM PT) and your prize is doubled

To win: stay in this group, follow @LowBatteryGoose on X, one guess per person.
Enter: lowbatterygoose.pages.dev/#goose-guess
Closes 5:00 PM PT today. Winner revealed tomorrow at 6:00 PM PT.

Free. No purchase necessary to enter or win.
```

**X (reveal, Nov 5):**
> 🪿 Goose Guess results!
>
> Flock members at launch: [COUNT]
>
> 🥇 [@WINNER1], guessed [GUESS]
> 🥈 [@WINNER2]
> 🥉 [@WINNER3]
>
> Prizes sent: [TX_LINK]. Thank you for honking with us 🔋
