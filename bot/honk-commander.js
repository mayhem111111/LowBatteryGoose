// Honk Commander: Low Battery Goose Telegram bot (Cloudflare Worker "lbg-honk-commander").
// Drop-in replacement for the existing Worker code.
//
// Settings (Cloudflare → Workers & Pages → lbg-honk-commander → Settings → Variables and Secrets):
//   BOT_TOKEN       secret  BotFather token. Never paste it anywhere else.
//   WEBHOOK_SECRET  secret  random string; Telegram sends it back on every update.
//   SETUP_KEY       secret  random string; required to call /setup.
//   TOKEN_ADDRESS   text    EMPTY until launch. After the coin is created and verified on Solscan,
//                           paste the contract address here and click Deploy. That is the only change.
//   LAUNCH_TIME     text    optional, e.g. "Thu Nov 5, 6:00 PM PT". Shown by /launch before launch.
//   AUTO_POSTS      text    "true" to enable the scheduled community posts.
//   CHAT_ID         text    optional, defaults to @LowBatteryFlock.
//
// After deploying this code, re-run setup once so Telegram shows the new command menu:
//   curl -X POST -H "X-Setup-Key: <SETUP_KEY>" https://<your-worker>.workers.dev/setup

const SITE = "https://lowbatterygoose.pages.dev";
const LINKS = "🌐 lowbatterygoose.pages.dev\n🐦 x.com/LowBatteryGoose\n💬 t.me/LowBatteryFlock\n📢 t.me/LowBatteryGooseSOL";
const SAFETY = "🛡️ GOOSE SAFETY\n• Admins never DM you first.\n• Never share your seed phrase or connect your wallet to a link someone DMs you.\n• Copycat coins use the same name and ticker. Only trust the address from /contract, our website and @LowBatteryGooseSOL.\n• Meme coins are speculative and can lose all value. No returns are promised.";

const FAQ = {
  "/start": "🪿 Welcome to Low Battery Goose! Type /help for project information.",
  "/help": "🪿 HONK COMMANDER\n/launch — Launch status\n/contract — Official contract address\n/pumpfun — Official Pump.fun page\n/links — Official links\n/safety — Stay safe\n/games — Play Honk Bingo\n/volunteer — Help the flock",
  "/links": LINKS,
  "/safety": SAFETY,
  "/games": "🎮 Play Honk Bingo:\nhttps://lowbatterygoose.pages.dev/honk-arcade-v6.html\nRunning on 1%. Still honking!",
  "/volunteer": "🪿 Want to help? Share your skills in the group! We're looking for artists, meme creators, game testers and community helpers. Volunteer roles don't promise payment or token rewards."
};

const POSTS = [
  "🪿🔋 DAILY GOOSE CHECK! What drained your battery today? Funniest answer wins eternal goose respect.",
  "💀 My emotional support goose needs an emotional support goose. How's the flock doing?",
  "🪿 GOOSE COURT IS OPEN! What's worse: Monday meetings or coffee that doesn't work? Cast your vote below.",
  "🔋 Battery: 1%. Brain cells: unavailable. HONK ENERGY: UNLIMITED. Show us your funniest goose meme!",
  "🎮 HONK BINGO TIME! Play and share your ridiculous results: https://lowbatterygoose.pages.dev/honk-arcade-v6.html",
  "🪿 FLOCK ROLL CALL! Where are our geese honking from today? No private details needed!",
  "☕ The coffee has resigned. The goose has assumed command. What should our next meme theme be?",
  "🏆 GOLDEN HONK! Share an original funny goose story. Creative community contributions may be featured.",
  "🚨 GOOSE NEWS: Local bird operating with one remaining brain cell. Experts recommend additional honking.",
  "🪿 What's your official goose nickname today? I'll start: Captain Caffeine Failure.",
  "🛡️ Reminder: admins never DM first. The only official $LBG address is on our website and from /contract."
];

const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function mint(env) {
  const m = (env.TOKEN_ADDRESS || "").trim();
  return MINT_RE.test(m) ? m : null;
}

function answerFor(command, env) {
  const ca = mint(env);
  if (command === "/contract") {
    return ca
      ? `🪙 Official $LBG contract address:\n${ca}\n\n✅ Same address on ${SITE}\n🔍 Verify: https://solscan.io/token/${ca}\n\nCopycats use the same name and ticker. Check the first and last characters.`
      : "🪙 $LBG is not live yet, so there is no official address. Anyone posting one now is an impersonator. Watch @LowBatteryGooseSOL.";
  }
  if (command === "/pumpfun") {
    return ca
      ? `🟢 Official $LBG on Pump.fun:\nhttps://pump.fun/coin/${ca}\n\nAlways confirm the address with /contract. Not financial advice.`
      : "⏳ $LBG is not live yet. The Pump.fun link will be posted in @LowBatteryGooseSOL at launch.";
  }
  if (command === "/launch") {
    if (ca) return `🚀 $LBG is LIVE on Pump.fun!\nContract: ${ca}\nhttps://pump.fun/coin/${ca}\n\nUse /contract to verify. Meme coins are speculative; no returns are promised.`;
    const when = (env.LAUNCH_TIME || "").trim();
    return when
      ? `🚀 $LBG launches on Pump.fun: ${when}.\nThe contract address will be posted at that moment in @LowBatteryGooseSOL, on ${SITE} and via /contract. Ignore any address posted before then.`
      : "🚀 $LBG is preparing for launch on Pump.fun. The official time will be announced at @LowBatteryGooseSOL. No guaranteed returns.";
  }
  return FAQ[command];
}

async function tg(env, method, data) {
  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!result.ok) throw new Error(`Telegram: ${result.description}`);
  return result;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(`Honk Commander is running. Token live: ${mint(env) ? "yes" : "no"}`);
    }
    if (url.pathname === "/setup" && request.method === "POST") {
      if (!env.SETUP_KEY || request.headers.get("X-Setup-Key") !== env.SETUP_KEY) {
        return new Response("Unauthorized", { status: 401 });
      }
      await tg(env, "setWebhook", {
        url: `${url.origin}/telegram`,
        secret_token: env.WEBHOOK_SECRET,
        allowed_updates: ["message"]
      });
      await tg(env, "setMyCommands", {
        commands: [
          { command: "help", description: "See all commands" },
          { command: "launch", description: "Launch status" },
          { command: "contract", description: "Official contract address" },
          { command: "pumpfun", description: "Official Pump.fun page" },
          { command: "links", description: "Official links" },
          { command: "safety", description: "Stay safe from scams" },
          { command: "games", description: "Play Honk Bingo" },
          { command: "volunteer", description: "Help the flock" }
        ]
      });
      return new Response("Webhook and commands configured");
    }
    if (url.pathname !== "/telegram" || request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }
    if (!env.WEBHOOK_SECRET || request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
    const update = await request.json();
    const msg = update.message;
    if (!msg?.text) return new Response("OK");
    const command = msg.text.trim().split(/\s+/)[0].split("@")[0].toLowerCase();
    const answer = answerFor(command, env);
    if (answer) {
      await tg(env, "sendMessage", { chat_id: msg.chat.id, text: answer, disable_web_page_preview: true });
    }
    return new Response("OK");
  },

  async scheduled(event, env) {
    if (env.AUTO_POSTS !== "true") return;
    const day = Math.floor(event.scheduledTime / 86400000);
    const hour = new Date(event.scheduledTime).getUTCHours();
    const index = (day * 2 + (hour === 17 ? 0 : 1)) % POSTS.length;
    await tg(env, "sendMessage", { chat_id: env.CHAT_ID || "@LowBatteryFlock", text: POSTS[index] });
  }
};

export { answerFor, mint };
