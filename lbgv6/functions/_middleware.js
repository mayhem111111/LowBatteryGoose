const COOKIE_NAME = "__Secure-lbg_flock";
const LOGIN_PATH = "/flock/login.html";

function readCookie(header, name) {
  if (!header) return null;
  for (const item of header.split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0) continue;
    if (item.slice(0, separator).trim() === name) return item.slice(separator + 1).trim();
  }
  return null;
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

function decodeBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function validSession(request, secret) {
  const raw = readCookie(request.headers.get("Cookie"), COOKIE_NAME);
  if (!raw || !secret || secret.length < 32) return null;
  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBytes(parts[1]),
      new TextEncoder().encode(parts[0])
    );
    if (!valid) return null;
    const payload = JSON.parse(decodeBase64Url(parts[0]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.v !== 1 || typeof payload.sub !== "string" || !payload.sub || !Number.isFinite(payload.exp) || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

function clearCookie() {
  return COOKIE_NAME + "=; Path=/flock; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
}

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const isFlockPath = url.pathname === "/flock" || url.pathname.startsWith("/flock/");
  if (!isFlockPath) return next();

  if (url.pathname === "/flock") {
    return Response.redirect(new URL("/flock/", url), 308);
  }

  // The login page and its local assets remain public. All portal pages,
  // scripts, styles and future classroom routes are protected by this gate.
  const publicLoginAsset = [
    LOGIN_PATH,
    "/flock/login.css",
    "/flock/login.js"
  ].includes(url.pathname);

  const session = await validSession(request, env.COMMUNITY_SESSION_SECRET || "");
  if (publicLoginAsset) {
    if (url.pathname === LOGIN_PATH && session) {
      return Response.redirect(new URL("/flock/", url), 303);
    }
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    if (!session && readCookie(request.headers.get("Cookie"), COOKIE_NAME)) {
      headers.append("Set-Cookie", clearCookie());
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  if (!env.COMMUNITY_SESSION_SECRET || env.COMMUNITY_SESSION_SECRET.length < 32) {
    return new Response("The Flock portal is not configured yet. Please check back soon.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
    });
  }

  if (!session) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: LOGIN_PATH,
        "Cache-Control": "no-store",
        "Set-Cookie": clearCookie()
      }
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("Vary", "Cookie");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}