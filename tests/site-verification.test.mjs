import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const root = process.cwd();
const endpointSource = await readFile(join(root, "lbgv6/functions/api/governance-application.js"), "utf8");
const endpoint = await import("data:text/javascript;base64," + Buffer.from(endpointSource).toString("base64"));

const roles = ["Governance Chair"];
const validPayload = {
  applicantName: "Test Applicant",
  email: "test@example.com",
  handle: "@test",
  roles,
  motivation: "I want to help.",
  skills: "Moderation and documentation.",
  portfolio: "https://example.com/work",
  plan: "Publish a first-month plan.",
  availability: "1–3 hours",
  conflicts: "None known.",
  governanceAck: true,
  privacyAck: true
};

function makeRequest(body, options = {}) {
  const headers = new Headers({
    Origin: options.origin ?? "https://lowbatterygoose.pages.dev",
    "Content-Type": options.contentType ?? "application/json"
  });
  return new Request("https://lowbatterygoose.pages.dev/api/governance-application", {
    method: options.method ?? "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

test("governance intake API validation and Airtable mapping", async (t) => {
  const originalFetch = globalThis.fetch;
  let airtableCalls = 0;
  let airtableBody = null;
  globalThis.fetch = async (_url, options) => {
    airtableCalls += 1;
    airtableBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ records: [{ id: "recTest123" }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };
  const env = { AIRTABLE_TOKEN: "test-token", GOVERNANCE_INTAKE_ENABLED: "true" };

  try {
    await t.test("intake remains closed unless explicitly enabled", async () => {
      const response = await endpoint.onRequestGet({ env: { AIRTABLE_TOKEN: "test-token" } });
      assert.equal(response.status, 503);
      assert.equal((await response.json()).available, false);
    });

    await t.test("GET reports enabled only when token and enable flag are present", async () => {
      const response = await endpoint.onRequestGet({ env });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).available, true);
    });

    await t.test("rejects foreign origins", async () => {
      const response = await endpoint.onRequestPost({
        request: makeRequest(validPayload, { origin: "https://attacker.example" }),
        env
      });
      assert.equal(response.status, 403);
      assert.equal(airtableCalls, 0);
    });

    await t.test("rejects non-JSON content", async () => {
      const response = await endpoint.onRequestPost({
        request: makeRequest(JSON.stringify(validPayload), { contentType: "text/plain" }),
        env
      });
      assert.equal(response.status, 415);
      assert.equal(airtableCalls, 0);
    });

    await t.test("rejects malformed JSON", async () => {
      const response = await endpoint.onRequestPost({ request: makeRequest("{"), env });
      assert.equal(response.status, 400);
      assert.equal(airtableCalls, 0);
    });

    await t.test("rejects missing acknowledgements and invalid roles", async () => {
      const response = await endpoint.onRequestPost({
        request: makeRequest({ ...validPayload, roles: ["Treasury Admin"], privacyAck: false }),
        env
      });
      assert.equal(response.status, 400);
      assert.equal(airtableCalls, 0);
    });

    await t.test("silently drops honeypot submissions", async () => {
      const response = await endpoint.onRequestPost({
        request: makeRequest({ ...validPayload, website: "bot-filled" }),
        env
      });
      assert.equal(response.status, 202);
      assert.equal(airtableCalls, 0);
    });

    await t.test("writes valid application to the verified Airtable field IDs", async () => {
      const response = await endpoint.onRequestPost({ request: makeRequest(validPayload), env });
      assert.equal(response.status, 201);
      assert.equal((await response.json()).ok, true);
      assert.equal(airtableCalls, 1);
      const fields = airtableBody.records[0].fields;
      assert.equal(fields.fldVCxnmJuCLrYJ8f, "Test Applicant");
      assert.deepEqual(fields.fldhhEOTmnagLjam2, ["Governance Chair"]);
      assert.equal(fields.fld3niMsdRiRIZwxz, "1–3 hours");
      assert.equal(fields.fldEmciDfo0MjGhxB, "New");
      assert.equal(fields.fld63fXf1Hq3qO9Re, true);
      assert.equal(fields.fldWkZ7oV8muGuH9A, true);
      assert.equal(airtableBody.typecast, false);
    });

    await t.test("does not accept writes while the explicit enable flag is off", async () => {
      const response = await endpoint.onRequestPost({
        request: makeRequest(validPayload),
        env: { AIRTABLE_TOKEN: "test-token", GOVERNANCE_INTAKE_ENABLED: "false" }
      });
      assert.equal(response.status, 503);
      assert.equal(airtableCalls, 1);
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("public document index has one card per canonical document", async () => {
  const html = await readFile(join(root, "lbgv6/documents/index.html"), "utf8");
  assert.equal((html.match(/class="document-card"/g) || []).length, 6);
  assert.equal((html.match(/name="description"/g) || []).length, 1);
  for (const title of ["White Paper", "Tokenomics", "Roadmap", "Wallet Register", "Governance Board Charter", "Governance Roles &amp; Application Guide"]) {
    assert.ok(html.includes(title), "missing document card: " + title);
  }
});

test("governance page reports live intake status and does not claim legal-entity status", async () => {
  const html = await readFile(join(root, "lbgv6/governance.html"), "utf8");
  assert.ok(html.includes('id="intake-status"'));
  assert.ok(html.includes("governance-form.js?v=20261106a"));
  assert.ok(!html.includes("building a real community organization"));
});

test("document index local links resolve to published files", async () => {
  const html = await readFile(join(root, "lbgv6/documents/index.html"), "utf8");
  const hrefs = [...html.matchAll(/href="(\/[^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    let path = href.split(/[?#]/)[0];
    if (path === "/") path = "/index.html";
    else if (path.endsWith("/")) path += "index.html";
    const absolute = resolve(join(root, "lbgv6"), "." + path);
    try {
      await readFile(absolute);
    } catch {
      assert.fail("broken internal document link: " + href);
    }
  }
});
