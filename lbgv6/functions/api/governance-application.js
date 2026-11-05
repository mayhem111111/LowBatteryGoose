const AIRTABLE_BASE = "appJIGkNMEPzBUB4o";
const AIRTABLE_TABLE = "tblSiMtKV3TOrCr0e";
const ALLOWED_ORIGIN = "https://lowbatterygoose.pages.dev";
const ROLE_NAMES = new Set([
  "Governance Chair","Deputy Governance Chair","Governance Secretary",
  "Treasury and Accountability Representative","Community Representative",
  "Community and Marketing Lead","Social Media and Content Manager",
  "Videographer and Video Editor","Graphics and Creative Designer",
  "Community Managers and Moderators","Partnerships and Outreach Coordinator",
  "Games and Events Coordinator","Education and Research Coordinator",
  "Technical and Security Advisor"
]);
const AVAILABILITY = new Set(["1–3 hours","4–6 hours","7–10 hours","11–15 hours","16+ hours"]);
const json = (body, status=200) => new Response(JSON.stringify(body), {
  status, headers: {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}
});
export async function onRequestPost({request, env}) {
  const origin = request.headers.get("Origin");
  if (origin !== ALLOWED_ORIGIN) return json({error:"Request origin not allowed."}, 403);
  if (!env.AIRTABLE_TOKEN) return json({error:"Application intake is being configured. Please check back shortly."}, 503);
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 20000) return json({error:"Application is too large."}, 413);
  let body;
  try { body = await request.json(); } catch { return json({error:"Invalid submission."}, 400); }
  const str = (v, max) => typeof v === "string" && v.length <= max ? v.trim() : "";
  const applicantName = str(body.applicantName,100);
  const email = str(body.email,254);
  const handle = str(body.handle,100);
  const motivation = str(body.motivation,3000);
  const skills = str(body.skills,4000);
  const portfolio = str(body.portfolio,500);
  const plan = str(body.plan,4000);
  const availability = str(body.availability,30);
  const conflicts = str(body.conflicts,2500);
  const roles = Array.isArray(body.roles) ? body.roles : [];
  if (!applicantName || !motivation || !skills || !plan || !body.governanceAck || !body.privacyAck ||
      roles.length < 1 || roles.length > 3 || roles.some(r => !ROLE_NAMES.has(r)) || !AVAILABILITY.has(availability)) {
    return json({error:"Please complete all required fields and acknowledgements."}, 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error:"Please enter a valid email address."}, 400);
  if (portfolio && !/^https:\/\//i.test(portfolio)) return json({error:"Portfolio links must begin with https://."}, 400);
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
      method:"POST",
      headers:{"Authorization":`Bearer ${env.AIRTABLE_TOKEN}`,"Content-Type":"application/json"},
      body:JSON.stringify({records:[{fields}],typecast:false})
    });
    if (!response.ok) {
      const error = await response.text();
      console.error("Airtable submission failed", response.status, error.slice(0,500));
      return json({error:"We couldn't save your application right now. Please try again later."}, 502);
    }
    return json({ok:true}, 201);
  } catch (error) {
    console.error("Airtable connection failed", String(error));
    return json({error:"The application service is temporarily unavailable."}, 502);
  }
}
export async function onRequestOptions({request}) {
  if (request.headers.get("Origin") !== ALLOWED_ORIGIN) return new Response(null,{status:403});
  return new Response(null,{status:204,headers:{
    "Access-Control-Allow-Origin":ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Access-Control-Allow-Headers":"Content-Type",
    "Access-Control-Max-Age":"86400"
  }});
}