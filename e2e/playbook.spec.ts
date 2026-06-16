import { test, expect } from "@playwright/test";

const AARRR_TOKEN = "1.342013402230114";
const PLG_TOKEN = "2.plg.342013402230114";

test.describe("actionable playbook", () => {
  test("renders per-bottleneck tactics with concrete steps", async ({ page }) => {
    await page.goto(`/?r=${AARRR_TOKEN}`);
    await expect(page.getByRole("heading", { name: /your action playbook/i })).toBeVisible();
    // A tactic exposes a measurable metric line.
    await expect(page.getByText(/Measure:/i).first()).toBeVisible();
  });

  test("exports the playbook as a .md download (AARRR)", async ({ page }) => {
    await page.goto(`/?r=${AARRR_TOKEN}`);
    await expect(page.getByRole("heading", { name: /your action playbook/i })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download \.md/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("aarrr-playbook.md");
  });

  test("renders + exports for the PLG diagnostic too", async ({ page }) => {
    await page.goto(`/?r=${PLG_TOKEN}`);
    await expect(page.getByRole("heading", { name: /your action playbook/i })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download \.md/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("plg-playbook.md");
  });
});
