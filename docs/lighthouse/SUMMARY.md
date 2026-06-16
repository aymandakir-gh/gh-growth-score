# Lighthouse report

Real scores for the **v2 production build** (`next build` + `next start`),
re-captured 2026-06-16 with **Lighthouse 12**, `--preset=desktop`, headless
Chrome, on the landing page. Full report:
[`desktop-report.html`](./desktop-report.html).

| Category | Score |
|---|---:|
| Performance | **100** |
| Accessibility | **100** |
| Best Practices | **96** |
| SEO | **100** |

Key performance metrics (landing page):

| Metric | Value |
|---|---|
| First Contentful Paint | 0.2 s |
| Largest Contentful Paint | 0.6 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 0.6 s |

All four categories clear the ≥90 bar. Accessibility 100 is corroborated by the
axe e2e suite (`e2e/a11y.spec.ts`), which scans the landing and shared-results
pages against WCAG 2.0/2.1 A & AA and is clean.

## Reproduce

```bash
npm run build
npx next start -p 3230 &
CHROME_PATH="$(which google-chrome || echo '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')" \
npx lighthouse@12 http://localhost:3230/ \
  --preset=desktop \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output-path=docs/lighthouse/desktop-report.html \
  --chrome-flags="--headless=new"
```

> Note: Lighthouse needs a full Chrome (not the Playwright headless-shell). The
> `--preset=desktop` profile is used because this is a desktop-first B2B tool;
> rerun without the preset for the stricter mobile profile.
