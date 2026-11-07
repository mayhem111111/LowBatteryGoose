import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import { join, resolve, relative, sep } from "node:path";

const root = process.cwd();
const siteRoot = join(root, "lbgv6");
const secret = "session-test-secret-".padEnd(64, "x");
const supabaseUrl = "https://ndiodsylmyaqkvhlmfdq.supabase.co";

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return nested.flat();
}

function jwtPart(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function makeToken(claimOverrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    sub: "user-123",
    iss: supabaseUrl + "/auth/v1",
    aud: "authenticated",
    aal: "aal2",
    amr: [{ method: "password" }, { method: "totp" }],
    exp: now + 900,
    ...claimOverrides
  };
  return jwtPart({ alg: "HS256", typ: "JWT" }) + "." + jwtPart(claims) + ".test-signature";
}

function sessionRequest(token, options = {}) {
  return new Request("https://lowbatterygoose.pages.dev/api/community/session", {
    method: options.method || "POST",
    headers: {
      Origin: options.origin || "https://lowbatterygoose.pages.dev",
      ...(token ? { Authorization: "Bearer " + token } : {})
    }
  });
}

test("public Markdown publication copies exactly match canonical docs", async () => {
  const names = [
    "WHITEPAPER.md",
    "TOKENOMICS.md",
    "ROADMAP.md",
    "WALLET_REGISTER.md",
    "BOARD_GOVERNANCE_CHARTER.md",
    "GOVERNANCE_ROLES.md"
  ];
  for (const name of names) {
    const canonical = await readFile(join(root, "docs", name), "utf8");
    const published = await readFile(join(siteRoot, "documents", name), "utf8");
    assert.equal(published, canonical, name + " public copy is out of sync");
  }
});

test("all local links and assets in every public HTML page resolve", async () => {
  const files = await walk(siteRoot);
  const htmlFiles = files.filter((path) => path.endsWith(".html"));
  const known = new Set(files.map((path) => "/" + relative(siteRoot, path).split(sep).join("/")));
  const broken = [];
  let checked = 0;

  for (const file of htmlFiles) {
    const source = await readFile(file, "utf8");
    const pagePath = "/" + relative(siteRoot, file).split(sep).join("/");
    for (const match of source.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
      const raw = match[1].trim();
      if (!raw || raw.startsWith("#") || /^(https?:|mailto:|tel:|data:|javascript:|blob:)/i.test(raw)) continue;
      const path = new URL(raw, "https://lowbatterygoose.pages.dev" + pagePath).pathname;
      const candidates = [path];
      if (path === "/") candidates.push("/index.html");
      if (path.endsWith("/")) candidates.push(path + "index.html");
      else if (!/\.[a-z0-9]{1,8}$/i.test(path)) candidates.push(path + ".html", path + "/index.html");
      checked += 1;
      if (!candidates.some((candidate) => known.has(candidate))) broken.push({ from: pagePath, href: raw, resolved: path });
    }
  }

  assert.ok(htmlFiles.length >= 18, "expected the complete public HTML page set");
  assert.ok(checked >= 300, "expected to inspect at least 300 local links and assets");
  assert.deepEqual(broken, []);
});

test("a branded noindex 404 page is published", async () => {
  const html = await readFile(join(siteRoot, "404.html"), "utf8");
  assert.ok(html.includes('name="robots" content="noindex,nofollow"'));
  assert.ok(html.includes("Wrong nest."));
  assert.ok(html.includes('href="/documents/"'));
});

test("Supabase session endpoint rejects unsafe requests", async (t) => {
  const source = await readFile(join(siteRoot, "functions/api/community/session.js"), "utf8");
  const endpoint = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
  const env = {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: "public-test-key",
    COMMUNITY_SESSION_SECRET: secret
  };

  await t.test("rejects non-POST requests", async () => {
    const response = await endpoint.onRequest({ request: sessionRequest(null, { method: "GET" }), env });
    assert.equal(response.status, 405);
  });

  await t.test("rejects foreign origins", async () => {
    const response = await endpoint.onRequest({
      request: sessionRequest(makeToken(), { origin: "https://attacker.example" }),
      env
    });
    assert.equal(response.status, 403);
  });

  await t.test("rejects missing bearer tokens", async () => {
    const response = await endpoint.onRequest({ request: sessionRequest(null), env });
    assert.equal(response.status, 401);
  });

  await t.test("rejects malformed JWTs", async () => {
    const response = await endpoint.onRequest({ request: sessionRequest("not-a-jwt"), env });
    assert.equal(response.status, 401);
  });

  await t.test("rejects missing runtime secrets", async () => {
    const response = await endpoint.onRequest({
      request: sessionRequest(makeToken()),
      env: { SUPABASE_URL: supabaseUrl, SUPABASE_ANON_KEY: "public-test-key" }
    });
    assert.equal(response.status, 503);
  });
});

test("valid AAL2/TOTP token issues a signed HttpOnly portal cookie accepted by middleware", async () => {
  const sessionSource = await readFile(join(siteRoot, "functions/api/community/session.js"), "utf8");
  const middlewareSource = await readFile(join(siteRoot, "functions/_middleware.js"), "utf8");
  const sessionEndpoint = await import("data:text/javascript;base64," + Buffer.from(sessionSource).toString("base64"));
  const middleware = await import("data:text/javascript;base64," + Buffer.from(middlewareSource).toString("base64"));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(url, supabaseUrl + "/auth/v1/user");
    return new Response(JSON.stringify({ id: "user-123" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  try {
    const response = await sessionEndpoint.onRequest({
      request: sessionRequest(makeToken()),
      env: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_ANON_KEY: "public-test-key",
        COMMUNITY_SESSION_SECRET: secret
      }
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
    const setCookie = response.headers.get("Set-Cookie");
    assert.ok(setCookie.includes("__Secure-lbg_flock="));
    assert.ok(setCookie.includes("HttpOnly"));
    assert.ok(setCookie.includes("Secure"));
    assert.ok(setCookie.includes("SameSite=Strict"));
    assert.ok(setCookie.includes("Path=/flock"));
    assert.ok(setCookie.includes("Max-Age="));

    const cookie = setCookie.split(";")[0];
    const protectedResponse = await middleware.onRequest({
      request: new Request("https://lowbatterygoose.pages.dev/flock/", {
        headers: { Cookie: cookie }
      }),
      env: { COMMUNITY_SESSION_SECRET: secret },
      next: async () => new Response("private portal", { status: 200 })
    });
    assert.equal(protectedResponse.status, 200);
    assert.equal(await protectedResponse.text(), "private portal");
    assert.equal(protectedResponse.headers.get("Cache-Control"), "no-store");
    assert.equal(protectedResponse.headers.get("X-Robots-Tag"), "noindex, nofollow");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("session endpoint rejects insufficient MFA claims after provider validation", async (t) => {
  const source = await readFile(join(siteRoot, "functions/api/community/session.js"), "utf8");
  const endpoint = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ id: "user-123" }), { status: 200 });
  const env = { SUPABASE_URL: supabaseUrl, SUPABASE_ANON_KEY: "public-test-key", COMMUNITY_SESSION_SECRET: secret };

  try {
    await t.test("rejects AAL1", async () => {
      const response = await endpoint.onRequest({ request: sessionRequest(makeToken({ aal: "aal1" })), env });
      assert.equal(response.status, 403);
    });
    await t.test("rejects sessions without TOTP", async () => {
      const response = await endpoint.onRequest({ request: sessionRequest(makeToken({ amr: [{ method: "password" }] })), env });
      assert.equal(response.status, 403);
    });
    await t.test("rejects an expired token", async () => {
      const response = await endpoint.onRequest({
        request: sessionRequest(makeToken({ exp: Math.floor(Date.now() / 1000) - 1 })),
        env
      });
      assert.equal(response.status, 403);
    });
    await t.test("rejects a Supabase user mismatch", async () => {
      globalThis.fetch = async () => new Response(JSON.stringify({ id: "different-user" }), { status: 200 });
      const response = await endpoint.onRequest({ request: sessionRequest(makeToken()), env });
      assert.equal(response.status, 403);
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("logout endpoint enforces POST and same-origin and expires the portal cookie", async (t) => {
  const source = await readFile(join(siteRoot, "functions/api/community/logout.js"), "utf8");
  const endpoint = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

  await t.test("rejects GET", async () => {
    const response = await endpoint.onRequest({
      request: new Request("https://lowbatterygoose.pages.dev/api/community/logout")
    });
    assert.equal(response.status, 405);
  });

  await t.test("rejects foreign origins", async () => {
    const response = await endpoint.onRequest({
      request: new Request("https://lowbatterygoose.pages.dev/api/community/logout", {
        method: "POST",
        headers: { Origin: "https://attacker.example" }
      })
    });
    assert.equal(response.status, 403);
  });

  await t.test("clears the HttpOnly portal cookie", async () => {
    const response = await endpoint.onRequest({
      request: new Request("https://lowbatterygoose.pages.dev/api/community/logout", {
        method: "POST",
        headers: { Origin: "https://lowbatterygoose.pages.dev" }
      })
    });
    assert.equal(response.status, 200);
    const cookie = response.headers.get("Set-Cookie");
    assert.ok(cookie.includes("__Secure-lbg_flock="));
    assert.ok(cookie.includes("Max-Age=0"));
    assert.ok(cookie.includes("HttpOnly"));
    assert.ok(cookie.includes("Secure"));
  });
});
