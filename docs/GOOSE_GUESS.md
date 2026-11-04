# The Goose Guess (launch game)

Guess how many members **The Low Battery Flock** Telegram group (t.me/LowBatteryFlock) has at launch:
**6:00 PM PT, Nov 4, 2026**. Entries close **5:00 PM PT, Nov 4**. Winner revealed **6:00 PM PT, Nov 5**.

## Grand prize (one winner)
| | |
|---|---|
| Prize | **5,000,000 LBG** (0.5% of supply), bought in Jason's first buy (~0.17 SOL), held in a disclosed prize wallet |
| Title | **The First Honker**, featured at the top of lowbatterygoose.pages.dev for one week, until the next Honker is crowned |
| Winner | The single closest guess; ties go to the earliest entry |

## To be eligible
1. Member of The Low Battery Flock Telegram group (at entry and at the reveal).
2. The wallet entered holds **any amount of LBG** at the snapshot (**Nov 5, 5:00 PM PT**).

**No-purchase route (keep it):** anyone can enter without holding by sending their guess, Telegram username and wallet
to the admins in writing before entries close. This is the standard legal safety valve for prize games; it is in the
website's fine print and rarely used. Remove it only on a lawyer's advice.

## The sign-up sheet: Google Form (5 minutes)
1. Go to forms.google.com → **Blank form**. Title: **The Goose Guess 🪿**.
2. Settings → Responses: turn on **Collect email addresses** (optional) and **Limit to 1 response** (requires a Google sign-in, which cuts spam).
3. Questions (all **Required**):
   | Question | Type |
   |---|---|
   | Telegram username (e.g. @goosefan) | Short answer |
   | X (Twitter) handle | Short answer |
   | Your guess: members in The Low Battery Flock at 6:00 PM PT tonight | Short answer → Response validation: **Number**, **Whole number** |
   | Solana wallet address (must hold LBG at the Nov 5, 5 PM PT snapshot) | Short answer (required) |
   | I'm a member of The Low Battery Flock Telegram group | Checkbox (required) |
4. Responses tab → **Link to Sheets**. Every entry lands in a Google Sheet with a timestamp: that's your official sign-up sheet.
5. **Send** → link icon → **Shorten URL** → copy (starts `https://forms.gle/`).
6. Website: in `lbgv6/site-config.js` set `guessForm: 'https://forms.gle/YOUR_LINK',` → re-upload the site. The **Enter your guess** button then opens the form. It switches to **Entries closed** at 5:00 PM PT automatically.
7. At 5:00 PM PT in the form: Responses → turn off **Accepting responses**.

## Picking the winner (Nov 5)
1. **6:00 PM PT Nov 4:** screenshot the group's member count the moment you create the coin. Post it publicly.
2. In the Sheet, add a column `=ABS(C2 - <count>)` (C = guess column) and sort ascending. Ties: earliest timestamp.
3. Check the closest entry: still in the group, not a duplicate or bot, and the wallet holds LBG on Solscan at the
   5:00 PM PT snapshot. If not eligible, move to the next closest.
4. **6:00 PM PT Nov 5:** announce, send 5,000,000 LBG from the prize wallet, post the transaction link.
5. Crown them on the site: in `lbgv6/site-config.js` set
   `honker: { name: '@theirhandle', title: 'THE FIRST HONKER', note: 'Goose Guess winner · Nov 5, 2026' },`
   then re-upload the site. Next week, replace it with the next winner.

## Posts

**X (now):**
> 🪿 THE GOOSE GUESS
>
> How many honkers will be in the flock when $LBG launches tonight at 6 PM PT?
>
> 🏆 One winner: 5,000,000 LBG
> 👑 Crowned The First Honker on our website for a week
>
> Closes 5 PM PT: lowbatterygoose.pages.dev/#goose-guess

**Telegram (pin until 5 PM):**
```
🪿 THE GOOSE GUESS IS ON

Guess how many members this group will have at 6:00 PM PT tonight, when $LBG launches. Closest guess wins.

🏆 GRAND PRIZE: 5,000,000 LBG
👑 Crowned THE FIRST HONKER, featured at the top of our website for a week

To be eligible:
✅ Be a member of this group
✅ Hold any amount of LBG in the wallet you enter with (snapshot Nov 5, 5:00 PM PT)

Enter: lowbatterygoose.pages.dev/#goose-guess
Closes 5:00 PM PT today. The First Honker is crowned tomorrow at 6:00 PM PT.
Full rules on the website.
```

**X (reveal, Nov 5):**
> 👑 Meet The First Honker: [@WINNER]
>
> Flock members at launch: [COUNT]. Their guess: [GUESS].
>
> 5,000,000 LBG sent: [TX_LINK]
>
> Now on the front of lowbatterygoose.pages.dev all week. Next Goose Guess soon 🪿
