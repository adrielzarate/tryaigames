import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyticsConfig,
  isLocalHostname,
} from "../src/lib/analytics-config.ts";
test("analytics stays optional and accepts only public identifier formats", () => {
  assert.equal(analyticsConfig({}).ga4Id, "G-S01H2T36XB");
  assert.equal(analyticsConfig({ VITE_GA4_MEASUREMENT_ID: "" }).ga4Id, "");
  assert.equal(
    analyticsConfig({ VITE_GA4_MEASUREMENT_ID: "G-TEST12345" }).ga4Id,
    "G-TEST12345",
  );
  assert.throws(() =>
    analyticsConfig({ VITE_GA4_MEASUREMENT_ID: "not-a-measurement-id" }),
  );
});
test("loopback and localhost previews are excluded", () => {
  for (const host of [
    "localhost",
    "127.0.0.1",
    "127.1.2.3",
    "[::1]",
    "preview.localhost",
  ])
    assert.equal(isLocalHostname(host), true);
  assert.equal(isLocalHostname("tryaigames.example"), false);
});
