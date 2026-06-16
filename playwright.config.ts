import { defineConfig, devices } from "@playwright/test";

// E2E suite for the growth loop (shared link, OG image, downloadable report)
// and accessibility (axe). Runs against a production build via `next start`.
// Prereq: `npm run build`. Run: `npm run e2e`.
const PORT = Number(process.env.E2E_PORT ?? 3220);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    // Settle entrance animations instantly (the app honors prefers-reduced-motion)
    // so axe scans the final rendered state, not a mid-fade frame.
    reducedMotion: "reduce",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `node_modules/.bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
