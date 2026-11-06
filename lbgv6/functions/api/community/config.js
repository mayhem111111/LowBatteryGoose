function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export async function onRequest({ request, env }) {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  const origin = new URL(request.url).origin;
  if (request.headers.get("Origin") && request.headers.get("Origin") !== origin) {
    return json({ error: "Request origin not allowed." }, 403);
  }

  const supabaseUrl = (env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const supabaseAnonKey = (env.SUPABASE_ANON_KEY || "").trim();
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Community authentication is not configured." }, 503);
  }
  let parsed;
  try {
    parsed = new URL(supabaseUrl);
  } catch {
    return json({ error: "Community authentication configuration is invalid." }, 503);
  }
  if (parsed.protocol !== "https:") {
    return json({ error: "The authentication provider must use HTTPS." }, 503);
  }

  // The Supabase publishable/anon key is designed for browser use. Never add
  // the service-role key to this response or to a public Pages variable.
  return json({ supabaseUrl, supabaseAnonKey });
}