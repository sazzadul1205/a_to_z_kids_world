import { defineConfig } from "@playwright/test";

// Both servers are started separately (API on 3000, Vite on 5173) so the same
// pair is exercised here and in development. No webServer block on purpose:
// restarting the API mid-run would reset its in-memory rate-limit counters.
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.js",
  // The suites share one seeded catalogue and one admin account, so they must
  // not run concurrently — parallel workers would interleave CRUD on the same rows.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    // The app picks a language from navigator.languages on a first visit. Pinning
    // the browser locale keeps the suite on English, which the assertions below
    // are written against.
    locale: "en-US",
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});