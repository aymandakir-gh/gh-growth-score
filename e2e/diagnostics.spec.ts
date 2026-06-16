import { test, expect } from "@playwright/test";

// A valid v2 PLG share token: "2.plg." + 15 answer digits (0–4) in descriptor
// order. Carries no PII. Reproduces an exact PLG score/breakdown.
const PLG_TOKEN = "2.plg.342013402230114";

test.describe("second diagnostic (PLG) is selectable", () => {
  test("picking PLG on the landing switches the audit", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "PLG", exact: true }).click();
    await expect(page.getByRole("heading", { name: /PLG Readiness Score/i })).toBeVisible();

    // Starting the audit shows a PLG question.
    await page.getByRole("button", { name: /start free audit/i }).click();
    await expect(page.getByText(/first real ['']win['']/i)).toBeVisible();
  });

  test("?d=plg deep-links straight to the PLG intro", async ({ page }) => {
    await page.goto("/?d=plg");
    await expect(page.getByRole("heading", { name: /PLG Readiness Score/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "PLG", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});

test.describe("PLG share loop", () => {
  test("opening a shared PLG link reproduces the score, ungated", async ({ page }) => {
    await page.goto(`/?r=${PLG_TOKEN}`);
    await expect(page.getByText("How you compare")).toBeVisible();
    await expect(page.getByText(/viewing a shared result/i)).toBeVisible();
    // PLG-specific dimension label appears in the breakdown.
    await expect(page.getByText("Time-to-Value").first()).toBeVisible();
  });

  test("shared PLG link injects a PLG-aware og:image + title", async ({ page }) => {
    await page.goto(`/?r=${PLG_TOKEN}`);
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute("content", /\/api\/og\?r=/);
    await expect(page).toHaveTitle(/PLG Readiness Score/i);
  });

  test("OG route renders a valid PNG for a v2 PLG token", async ({ request }) => {
    const res = await request.get(`/api/og?r=${PLG_TOKEN}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    const body = await res.body();
    expect(body.byteLength).toBeGreaterThan(1000);
    expect(body[0]).toBe(0x89); // PNG magic
    expect(body[1]).toBe(0x50);
  });
});
