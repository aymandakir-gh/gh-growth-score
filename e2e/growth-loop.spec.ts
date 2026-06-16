import { test, expect } from "@playwright/test";

// A valid v1 share token: "1." + 15 answer digits (0–4) in QUESTIONS order.
// Carries no PII — just the answer values. Reproduces an exact score/breakdown.
const TOKEN = "1.342013402230114";

test.describe("shareable result link", () => {
  test("opening a shared link reproduces the score, ungated", async ({ page }) => {
    await page.goto(`/?r=${TOKEN}`);

    // Score gauge + benchmark + recommendations are visible immediately —
    // the email gate is skipped for shared views.
    await expect(page.getByText("How you compare")).toBeVisible();
    await expect(page.getByText(/viewing a shared result/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /unlock my full report/i })
    ).toHaveCount(0);

    // The shared-result CTA invites the visitor to take their own audit.
    await expect(
      page.getByRole("link", { name: /take the free audit/i })
    ).toBeVisible();
  });

  test("home page renders the quiz (no token)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByText("How you compare")).toHaveCount(0);
  });

  test("shared link injects a dynamic og:image", async ({ page }) => {
    await page.goto(`/?r=${TOKEN}`);
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute("content", /\/api\/og\?r=/);
  });
});

test.describe("OG / share image route", () => {
  test("social card returns a valid PNG", async ({ request }) => {
    const res = await request.get(`/api/og?r=${TOKEN}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    const body = await res.body();
    expect(body.byteLength).toBeGreaterThan(1000);
    // PNG magic number.
    expect(body[0]).toBe(0x89);
    expect(body[1]).toBe(0x50);
  });

  test("report variant returns a larger valid PNG", async ({ request }) => {
    const res = await request.get(`/api/og?r=${TOKEN}&v=report`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    const body = await res.body();
    expect(body.byteLength).toBeGreaterThan(1000);
  });

  test("invalid token still renders a generic card (200)", async ({ request }) => {
    const res = await request.get(`/api/og?r=not-a-real-token`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});

test.describe("downloadable report", () => {
  test("Download report button saves a PNG", async ({ page }) => {
    await page.goto(`/?r=${TOKEN}`);
    await expect(page.getByText("Share your score")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download png/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/growth-health-score.*\.png/);
  });
});
