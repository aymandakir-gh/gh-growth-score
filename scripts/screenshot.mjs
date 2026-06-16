// ─────────────────────────────────────────────────────────────────────────────
// Capture a real screenshot of the app for the README.
//
// Boots the production server (`next start`), waits for it to respond, opens it
// in headless Chromium, and writes docs/screenshot.png.
//
// Prereqs:  npm run build   (so .next exists)
//           npx playwright install chromium   (one-time browser download)
// Run:      npm run screenshot
// ─────────────────────────────────────────────────────────────────────────────

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const PORT = process.env.SCREENSHOT_PORT ?? "3210";
const BASE_URL = `http://localhost:${PORT}`;
const OUT = "docs/screenshot.png";

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await sleep(500);
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

const nextBin = "node_modules/.bin/next";
const server = spawn(nextBin, ["start", "-p", PORT], {
  stdio: ["ignore", "ignore", "inherit"],
});

let browser;
try {
  await waitForServer(BASE_URL);
  await mkdir("docs", { recursive: true });

  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 860 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30_000 });
  // The landing renders the quiz intro inside <main>.
  await page.waitForSelector("main", { timeout: 15_000 });
  // Let webfonts + any entrance transitions settle for a crisp frame.
  await sleep(1_000);

  await page.screenshot({ path: OUT });
  console.log(`✔ Saved ${OUT}`);
} catch (err) {
  console.error("✖ Screenshot capture failed:", err.message);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
