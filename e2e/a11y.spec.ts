import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const TOKEN = "1.342013402230114";
const PLG_TOKEN = "2.plg.342013402230114";

// WCAG 2.0/2.1 A & AA tags — the standard axe ruleset for production sites.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// Disable entrance animations/transitions so axe evaluates the settled, fully
// rendered state rather than a mid-fade frame (the elements animate from
// opacity 0). The app also honors prefers-reduced-motion for real users.
async function freezeAnimations(page: Page) {
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }`,
  });
}

test.describe("accessibility (axe)", () => {
  test("quiz / landing page has no axe violations", async ({ page }) => {
    await page.goto("/");
    await page.locator("main").waitFor();
    await freezeAnimations(page);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test("shared results page has no axe violations", async ({ page }) => {
    await page.goto(`/?r=${TOKEN}`);
    await page.getByText("How you compare").waitFor();
    await freezeAnimations(page);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test("shared PLG results page has no axe violations", async ({ page }) => {
    await page.goto(`/?r=${PLG_TOKEN}`);
    await page.getByText("How you compare").waitFor();
    await freezeAnimations(page);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test("embed surface has no axe violations", async ({ page }) => {
    await page.goto("/embed?d=plg");
    await page.getByRole("heading", { name: /PLG Readiness Score/i }).waitFor();
    await freezeAnimations(page);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
