// ─────────────────────────────────────────────────────────────────────────────
// Capture real, reproducible screenshots of the app for the README/docs.
//
// Boots the production server (`next start`), waits for it, and captures:
//   docs/screenshot.png  — landing (AARRR intro + diagnostic picker)
//   docs/results.png     — a shared result (gauge, breakdown, playbook)
//   docs/embed.png       — the embeddable widget surface (PLG)
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
// A no-PII v1 AARRR share token (15 answer digits) → reproduces a fixed result.
const TOKEN = "1.342013402230114";

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
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 860 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
    reducedMotion: "reduce",
  });

  // 1) Landing
  const landing = await ctx.newPage();
  await landing.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30_000 });
  await landing.waitForSelector("main", { timeout: 15_000 });
  await sleep(800);
  await landing.screenshot({ path: "docs/screenshot.png" });
  console.log("✔ Saved docs/screenshot.png");

  // 2) Shared result (full breakdown + playbook)
  const results = await ctx.newPage();
  await results.goto(`${BASE_URL}/?r=${TOKEN}`, { waitUntil: "networkidle", timeout: 30_000 });
  await results.getByText("How you compare").waitFor({ timeout: 15_000 });
  await sleep(800);
  await results.screenshot({ path: "docs/results.png", fullPage: true });
  console.log("✔ Saved docs/results.png");

  // 3) Embeddable widget (PLG)
  const embed = await ctx.newPage();
  await embed.setViewportSize({ width: 720, height: 900 });
  await embed.goto(`${BASE_URL}/embed?d=plg`, { waitUntil: "networkidle", timeout: 30_000 });
  await embed.waitForSelector("main, [class*='max-w-2xl']", { timeout: 15_000 }).catch(() => {});
  await sleep(800);
  await embed.screenshot({ path: "docs/embed.png" });
  console.log("✔ Saved docs/embed.png");
} catch (err) {
  console.error("✖ Screenshot capture failed:", err.message);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
