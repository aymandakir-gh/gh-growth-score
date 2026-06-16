import { test, expect } from "@playwright/test";

const TOKEN = "1.342013402230114";

test.describe("per-industry benchmark depth", () => {
  test("switching industry re-runs 'you vs median' and updates the URL", async ({ page }) => {
    await page.goto(`/?r=${TOKEN}`);
    await expect(page.getByText("How you compare")).toBeVisible();

    // AARRR 'all' overall median = 48.
    await expect(page.getByText("vs 48 median")).toBeVisible();

    // Switch to Fintech (retention/revenue heavier) → overall median = 50.
    await page.selectOption("#industry-select", "fintech");
    await expect(page).toHaveURL(/industry=fintech/);
    await expect(page.getByText("vs 50 median")).toBeVisible();
    await expect(page.getByText("vs 48 median")).toHaveCount(0);

    // Back to All clears the param.
    await page.selectOption("#industry-select", "all");
    await expect(page).not.toHaveURL(/industry=/);
    await expect(page.getByText("vs 48 median")).toBeVisible();
  });

  test("?industry= deep-links the selected benchmark", async ({ page }) => {
    await page.goto(`/?r=${TOKEN}&industry=fintech`);
    await expect(page.getByText("How you compare")).toBeVisible();
    await expect(page.locator("#industry-select")).toHaveValue("fintech");
    await expect(page.getByText("vs 50 median")).toBeVisible();
  });

  test("OG report honors ?industry=", async ({ request }) => {
    const res = await request.get(`/api/og?r=${TOKEN}&v=report&industry=fintech`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});
