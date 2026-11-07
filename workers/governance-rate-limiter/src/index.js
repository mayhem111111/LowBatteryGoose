export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/check") {
      return new Response("Not found", {
        status: 404,
        headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
      });
    }

    // This Worker is called only through a Pages service binding. The source
    // address is forwarded by the Pages Function from Cloudflare's trusted
    // CF-Connecting-IP request header.
    const sourceIp = request.headers.get("CF-Connecting-IP");
    if (!sourceIp) {
      return new Response("Missing source address", {
        status: 400,
        headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
      });
    }

    const { success } = await env.GOVERNANCE_LIMITER.limit({
      key: "governance-application:" + sourceIp
    });

    return new Response(null, {
      status: success ? 204 : 429,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  }
};
