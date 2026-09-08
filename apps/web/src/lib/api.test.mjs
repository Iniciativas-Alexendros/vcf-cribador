import assert from "node:assert/strict";
import test from "node:test";

test("API_BASE default is loopback", async () => {
  // Contrato local V1: sin host público por defecto
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8080";
  assert.match(base, /^http:\/\/127\.0\.0\.1:\d+/);
});
