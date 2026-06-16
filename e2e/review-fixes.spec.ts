import { test, expect } from "@playwright/test";

// Regression tests for findings from the pre-v2.0.0 adversarial review.
const TOKEN = "1.342013402230114";

test.describe("adversarial-review regressions", () => {
  test("Retake preserves ?lang= and ?industry=, drops only ?r=", async ({ page }) => {
    await page.goto(`/?r=${TOKEN}&lang=fr&industry=fintech`);
    await expect(page.getByText("How you compare")).toHaveCount(0); // fr locale
    await expect(page.locator("#industry-select")).toHaveValue("fintech");

    await page.getByRole("button", { name: /retake/i }).click();

    await expect(page).toHaveURL(/lang=fr/);
    await expect(page).toHaveURL(/industry=fintech/);
    await expect(page).not.toHaveURL(/[?&]r=/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("benchmark description + 'vs median' are localized (French)", async ({ page }) => {
    await page.goto(`/?r=${TOKEN}&lang=fr`);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    // French benchmark description (was hardcoded English before the fix).
    await expect(page.getByText(/médianes sont des estimations indicatives/i)).toBeVisible();
    // Overall "vs median" uses the localized template (median 48).
    await expect(page.getByText("vs médiane 48")).toBeVisible();
  });

  test("a crafted null-answers legacy token renders a generic card, not a 500", async ({ request }) => {
    // btoa('{"a":null,"s":42}') — previously decoded to answers:null and crashed.
    const token = Buffer.from('{"a":null,"s":42}').toString("base64");
    const res = await request.get(`/api/og?r=${encodeURIComponent(token)}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});
