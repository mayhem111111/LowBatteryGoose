const AIRTABLE_BASE = "appJIGkNMEPzBUB4o";
const AIRTABLE_TABLE = "tblSiMtKV3TOrCr0e";
const ALLOWED_ORIGIN = "https://lowbatterygoose.pages.dev";
const MAX_BODY_BYTES = 20_000;
const ROLE_NAMES = new Set([
  "Governance Chair", "Deputy Governance Chair", "Governance Secretary",
  "Treasury and Accountability Representative", "Community Representative",
  "Community and Marketing Lead", "Social Media and Content Manager",
  "Videographer and Video Editor", "Graphics and Creative Designer",
  "Community Managers and Moderators", "Partnerships and Outreach Coordinator",
  "Games and Events Coordinator", "Education and Research Coordinator",
  "Technical and Security Advisor"
]);
const AVAILABILITY = new Set(["1–3 hours", "4–6 hours", "7–10 hours", "11–15 hours", "16+ hours"]);

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}

function validOrigin(request) {
  return request.headers.get("Origin") === ALLOWED_ORIGIN &&
    new URL(request.url).origin === ALLOWED_ORIGIN;
}

function cleanString(value, maxLength) {
  if (typeof value !== "string" || value.length > maxLength) return null;
  const cleaned = value.trim();
  return cleaned || "";
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPortfolio(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export async function onRequestGet({ env }) {
  if (env.GOVERNANCE_INTAKE_ENABLED !== "true" || !env.AIRTABLE_TOKEN) {
    return json({ available: false, message: "Applications are temporarily closed while the secure intake connection is being verified." }, 503);
  }
  return json({ available: true });
}

export async function onRequestPost({ request, env }) {
  if (!validOrigin(request)) return json({ error: "Request origin not allowed." }, 403);
  if (env.GOVERNANCE_INTAKE_ENABLED !== "true" || !env.AIRTABLE_TOKEN) return json({ error: "Application intake is temporarily closed. Please check back shortly." }, 503);

  const contentType = request.headers.get("Content-Type") || "";
  if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType)) {
    return json({ error: "Content-Type must be application/json." }, 415);
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ error: "Application is too large." }, 413);
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return json({ error: "Unable to read submission." }, 400);
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json({ error: "Application is too large." }, 413);
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid submission." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Invalid submission." }, 400);
  }

  // Quietly accept bot traps without creating a record or revealing the trap.
  if (typeof body.website === "string" && body.website.trim()) {
    return json({ ok: true }, 202);
  }

  const applicantName = cleanString(body.applicantName, 100);
  const email = cleanString(body.email, 254);
  const handle = cleanString(body.handle, 100);
  const motivation = cleanString(body.motivation, 3000);
  const skills = cleanString(body.skills, 4000);
  const portfolio = cleanString(body.portfolio, 500);
  const plan = cleanString(body.plan, 4000);
  const availability = cleanString(body.availability, 30);
  const conflicts = cleanString(body.conflicts, 2500);
  const roles = Array.isArray(body.roles) ? body.roles : null;

  const invalidLength = [
    applicantName, email, handle, motivation, skills, portfolio, plan, availability, conflicts
  ].some((value) => value === null);

  if (
    invalidLength || !applicantName || !motivation || !skills || !plan ||
    body.governanceAck !== true || body.privacyAck !== true ||
    !roles || roles.length < 1 || roles.length > 3 ||
    roles.some((role) => typeof role !== "string" || !ROLE_NAMES.has(role)) ||
    !AVAILABILITY.has(availability)
  ) {
    return json({ error: "Please complete all required fields and acknowledgements." }, 400);
  }
  if (email && !validEmail(email)) return json({ error: "Please enter a valid email address." }, 400);
  if (!validPortfolio(portfolio)) return json({ error: "Portfolio links must use a valid https:// URL." }, 400);

  const fields = {
    "fldVCxnmJuCLrYJ8f": applicantName,
    "fldhhEOTmnagLjam2": roles,
    "fldCYwQrBT4YsN5ov": motivation,
    "fldbJ7VrhIuQuiDLX": skills,
    "fldosrhZiUWQJ4tjs": plan,
    "fld3niMsdRiRIZwxz": availability,
    "fld63fXf1Hq3qO9Re": true,
    "fldWkZ7oV8muGuH9A": true,
    "fldEmciDfo0MjGhxB": "New"
  };
  if (email) fields["fldcQTQTGGsYed7Ky"] = email;
  if (handle) fields["fldIolPdvosb3MygB"] = handle;
  if (portfolio) fields["fldQt2Fa6u1Vvb6Ld"] = portfolio;
  if (conflicts) fields["fld0wt0z6KI4WxNSx"] = conflicts;

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ records: [{ fields }], typecast: false }),
      signal: AbortSignal.timeout(10_000)
    });

    if (!response.ok) {
      // Do not log Airtable response bodies; they can contain applicant data.
      console.error("Airtable submission failed with status", response.status);
      return json({ error: "We couldn't save your application right now. Please try again later." }, 502);
    }

    const saved = await response.json().catch(() => null);
    if (!saved || !Array.isArray(saved.records) || saved.records.length !== 1 || !saved.records[0].id) {
      console.error("Airtable returned an unexpected success response.");
      return json({ error: "The application service could not confirm the save. Please try again later." }, 502);
    }
    return json({ ok: true }, 201);
  } catch (error) {
    console.error("Airtable request failed:", error && error.name === "TimeoutError" ? "timeout" : "network error");
    return json({ error: "The application service is temporarily unavailable." }, 502);
  }
}
