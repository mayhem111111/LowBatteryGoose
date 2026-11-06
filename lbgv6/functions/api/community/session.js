const COOKIE_NAME = "__Secure-lbg_flock";

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers
    }
  });
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

function encodeBase64Url(bytes) {
  let binary = "";
  for (const value of bytes) binary += String.fromCharCode(value);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return encodeBase64Url(new Uint8Array(signature));
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const requestOrigin = new URL(request.url).origin;
  if (request.headers.get("Origin") !== requestOrigin) {
    return json({ error: "Request origin not allowed." }, 403);
  }

  const supabaseUrl = (env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const anonKey = (env.SUPABASE_ANON_KEY || "").trim();
  const sessionSecret = env.COMMUNITY_SESSION_SECRET || "";
  if (!supabaseUrl || !anonKey || sessionSecret.length < 32) {
    return json({ error: "Community authentication is not configured." }, 503);
  }

  const authorization = request.headers.get("Authorization") || "";
  const match = /^Bearer\s+([A-Za-z0-9._~-]+)$/i.exec(authorization);
  if (!match) return json({ error: "A verified sign-in session is required." }, 401);
  const accessToken = match[1];
  const pieces = accessToken.split(".");
  if (pieces.length !== 3) return json({ error: "Invalid authentication token." }, 401);

  let claims;
  try {
    claims = JSON.parse(decodeBase64Url(pieces[1]));
  } catch {
    return json({ error: "Invalid authentication token." }, 401);
  }

  // Supabase validates the JWT signature and account status at this endpoint.
  // Only after that check do we rely on the signed AAL and AMR claims below.
  let userResponse;
  try {
    userResponse = await fetch(supabaseUrl + "/auth/v1/user", {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: "Bearer " + accessToken
      },
      cf: { cacheTtl: 0, cacheEverything: false }
    });
  } catch {
    return json({ error: "The authentication provider could not be reached." }, 503);
  }
  if (!userResponse.ok) return json({ error: "Your sign-in session is invalid or expired." }, 401);

  let user;
  try {
    user = await userResponse.json();
  } catch {
    return json({ error: "The authentication provider returned an invalid response." }, 502);
  }

  const methods = Array.isArray(claims.amr) ? claims.amr : [];
  const hasTotp = methods.some((method) => method && method.method === "totp");
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const expectedIssuer = supabaseUrl + "/auth/v1";
  const now = Math.floor(Date.now() / 1000);
  const tokenExpiry = Number(claims.exp);
  if (
    !claims.sub ||
    claims.sub !== user.id ||
    claims.iss !== expectedIssuer ||
    !audiences.includes("authenticated") ||
    claims.aal !== "aal2" ||
    !hasTotp ||
    !Number.isFinite(tokenExpiry) ||
    tokenExpiry <= now
  ) {
    return json({ error: "The Flock requires a verified authenticator-app code. Complete two-factor verification and try again." }, 403);
  }

  // The portal session never lasts longer than the Supabase access token,
  // and is capped at one hour. The browser cannot read this cookie.
  const expiresAt = Math.min(tokenExpiry, now + 3600);
  const payload = {
    v: 1,
    sub: user.id,
    iat: now,
    exp: expiresAt
  };
  const encodedPayload = encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload, sessionSecret);
  const cookie = COOKIE_NAME + "=" + encodedPayload + "." + signature +
    "; Path=/flock; HttpOnly; Secure; SameSite=Strict; Max-Age=" + String(expiresAt - now);

  return json({ ok: true, expiresAt }, 200, { "Set-Cookie": cookie });
}