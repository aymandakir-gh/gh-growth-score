import { test, expect } from "@playwright/test";

test.describe("embeddable widget — /embed surface", () => {
  test("renders the audit standalone, no app nav", async ({ page }) => {
    await page.goto("/embed?d=plg");
    await expect(page.getByRole("heading", { name: /PLG Readiness Score/i })).toBeVisible();
    await expect(page.getByText(/powered by/i)).toBeVisible();
    // The full-app nav/footer is absent in the embed.
    await expect(page.getByText("Open source · MIT")).toHaveCount(0);
  });

  test("embeds a shared result ungated (no email gate, no shared banner)", async ({ page }) => {
    await page.goto("/embed?r=1.342013402230114");
    await expect(page.getByText("How you compare")).toBeVisible();
    await expect(page.getByText(/viewing a shared result/i)).toHaveCount(0);
    await expect(page.getByRole("button", { name: /unlock my full report/i })).toHaveCount(0);
  });
});

test.describe("embeddable widget — embed.js loader", () => {
  test("injects a resizing iframe pointing at /embed into a host page", async ({ page }) => {
    // Host the loader on our own origin so message origins line up.
    await page.goto("/");
    const origin = new URL(page.url()).origin;
    await page.setContent(
      `<div id="host"></div><script src="${origin}/embed.js" data-diagnostic="plg"></script>`
    );

    const iframe = page.locator("iframe");
    await expect(iframe).toHaveAttribute("src", /\/embed\?d=plg/);

    // The audit renders inside the iframe.
    const frame = page.frameLocator("iframe");
    await expect(frame.getByRole("heading", { name: /PLG Readiness Score/i })).toBeVisible();

    // The height beacon auto-resizes the iframe beyond the initial min-height.
    await expect
      .poll(async () => (await iframe.boundingBox())?.height ?? 0, { timeout: 5000 })
      .toBeGreaterThan(320);
  });
});
