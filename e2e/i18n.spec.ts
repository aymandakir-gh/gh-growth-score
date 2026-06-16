import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function freezeAnimations(page: Page) {
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
  });
}

test.describe("localization via ?lang=", () => {
  test("?lang=ar applies Arabic + RTL", async ({ page }) => {
    await page.goto("/?lang=ar");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ar");
    // Arabic nav title is rendered (content is localized, not just dir).
    await expect(page.getByText("نقاط صحة النمو").first()).toBeVisible();
  });

  test("?lang=fr applies French (LTR)", async ({ page }) => {
    await page.goto("/?lang=fr");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "ltr");
    await expect(html).toHaveAttribute("lang", "fr");
  });

  test("invalid ?lang= falls back to English", async ({ page }) => {
    await page.goto("/?lang=zz");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("results surface is localized (shared ES link)", async ({ page }) => {
    await page.goto("/?r=1.342013402230114&lang=es");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    // Spanish results heading + share heading.
    await expect(page.getByText("Cómo te comparas")).toBeVisible();
    await expect(page.getByText("Comparte tu puntuación")).toBeVisible();
  });

  test("language selector writes ?lang= to the URL (never localStorage)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /change language/i }).click();
    await page.getByRole("option", { name: "Français" }).click();
    await expect(page).toHaveURL(/lang=fr/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    const ls = await page.evaluate(() => ({ ...window.localStorage }));
    expect(Object.keys(ls)).toHaveLength(0);
  });

  test("Arabic RTL results page has no axe violations", async ({ page }) => {
    await page.goto("/?r=1.342013402230114&lang=ar");
    await page.getByText("كيف تُقارَن").waitFor();
    await freezeAnimations(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
