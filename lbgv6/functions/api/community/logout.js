function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

export async function onRequest({ request }) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const requestOrigin = new URL(request.url).origin;
  if (request.headers.get("Origin") !== requestOrigin) {
    return json({ error: "Request origin not allowed." }, 403);
  }
  return json({ ok: true }, 200, {
    "Set-Cookie": "__Secure-lbg_flock=; Path=/flock; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
  });
}