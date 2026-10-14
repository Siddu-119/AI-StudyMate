import assert from "node:assert/strict";
import { after, before, test } from "node:test";

process.env.AI_DEMO_MODE = "false";
process.env.GEMINI_API_KEY = "";

const { app } = await import("../index.js");
let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test("AI is unconfigured without a key when Demo Mode is off", async () => {
  const statusResponse = await fetch(`${baseUrl}/api/ai/status`);
  const status = await statusResponse.json();
  assert.equal(status.mode, "unconfigured");
  assert.equal(status.configured, false);

  const response = await fetch(`${baseUrl}/api/ai/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "Ohm's Law" }),
  });
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.mode, "unconfigured");
  assert.equal(body.retryable, false);
  assert.match(body.error, /AI is not configured/i);
  assert.doesNotMatch(JSON.stringify(body), /V = I × R/);
});
