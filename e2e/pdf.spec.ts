import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const AARRR_TOKEN = "1.342013402230114";
const PLG_TOKEN = "2.plg.342013402230114";

test.describe("client-side PDF export", () => {
  test("Download PDF saves a valid .pdf (AARRR)", async ({ page }) => {
    await page.goto(`/?r=${AARRR_TOKEN}`);
    await expect(page.getByText("Share your score")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/growth-health-score.*\.pdf/);

    // The bytes are a real PDF.
    const path = await download.path();
    const buf = readFileSync(path);
    expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(buf.byteLength).toBeGreaterThan(2000);
  });

  test("Download PDF saves a valid .pdf (PLG)", async ({ page }) => {
    await page.goto(`/?r=${PLG_TOKEN}`);
    await expect(page.getByText("Share your score")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/plg-readiness-score.*\.pdf/);

    const path = await download.path();
    const buf = readFileSync(path);
    expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
});
