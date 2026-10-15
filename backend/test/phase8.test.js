import test from "node:test";
import assert from "node:assert/strict";

const API_URL = (
  process.env.API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

test("Phase 8: backend integration checks", async (t) => {
  let healthResponse;
  let responseBody;

  await t.test("Backend is reachable", async () => {
    healthResponse = await fetch(`${API_URL}/api/health`, {
      signal: AbortSignal.timeout(10000),
    });

    assert.ok(
      healthResponse.status < 500,
      `Backend returned HTTP ${healthResponse.status}`
    );
  });

  await t.test("Health endpoint returns valid JSON", async () => {
    assert.ok(healthResponse, "Health request did not run");

    const contentType =
      healthResponse.headers.get("content-type") || "";

    assert.ok(
      contentType.includes("application/json"),
      "Health endpoint should return JSON"
    );

    responseBody = await healthResponse.json();

    assert.ok(
      responseBody !== null && typeof responseBody === "object",
      "Expected a JSON object"
    );
  });

  await t.test("Health endpoint indicates success", async () => {
    assert.equal(
      healthResponse.status,
      200,
      "Health endpoint should return HTTP 200"
    );

    assert.equal(
      responseBody.success,
      true,
      "Expected response success to be true"
    );

    assert.equal(
      responseBody.data?.status,
      "ok",
      "Expected service status to be ok"
    );

    assert.equal(
      responseBody.data?.database?.status,
      "connected",
      "Expected database connection status to be connected"
    );
  });
});
