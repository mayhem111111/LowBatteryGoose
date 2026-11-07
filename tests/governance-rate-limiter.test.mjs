import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const workerSource = await readFile(join(process.cwd(), "workers/governance-rate-limiter/src/index.js"), "utf8");
const worker = await import("data:text/javascript;base64," + Buffer.from(workerSource).toString("base64"));

test("governance rate limiter Worker checks method, route, IP, and limit result", async (t) => {
  const keys = [];
  const env = {
    GOVERNANCE_LIMITER: {
      limit: async ({ key }) => {
        keys.push(key);
        return { success: true };
      }
    }
  };

  await t.test("allows a request below the configured threshold", async () => {
    const response = await worker.default.fetch(
      new Request("https://governance-rate-limiter.internal/check", {
        method: "POST",
        headers: { "CF-Connecting-IP": "203.0.113.5" }
      }),
      env
    );
    assert.equal(response.status, 204);
    assert.equal(keys.length, 1);
    assert.ok(keys[0].startsWith("governance-application:"));
    assert.ok(!keys[0].includes("203.0.113.5"), "the raw IP must not be used as the rate-limit key");
  });

  await t.test("returns 429 when the binding reports a limit breach", async () => {
    const limitedWorker = {
      GOVERNANCE_LIMITER: { limit: async () => ({ success: false }) }
    };
    const response = await worker.default.fetch(
      new Request("https://governance-rate-limiter.internal/check", {
        method: "POST",
        headers: { "CF-Connecting-IP": "203.0.113.6" }
      }),
      limitedWorker
    );
    assert.equal(response.status, 429);
  });

  await t.test("rejects requests without a source IP", async () => {
    const response = await worker.default.fetch(
      new Request("https://governance-rate-limiter.internal/check", { method: "POST" }),
      env
    );
    assert.equal(response.status, 400);
  });

  await t.test("rejects other routes and methods", async () => {
    const wrongPath = await worker.default.fetch(
      new Request("https://governance-rate-limiter.internal/other", { method: "POST" }),
      env
    );
    const wrongMethod = await worker.default.fetch(
      new Request("https://governance-rate-limiter.internal/check", { method: "GET" }),
      env
    );
    assert.equal(wrongPath.status, 404);
    assert.equal(wrongMethod.status, 404);
  });
});
