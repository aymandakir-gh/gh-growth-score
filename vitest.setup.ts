// Use the Vitest-specific entrypoint so jest-dom matchers extend Vitest's
// `expect` (the bare "@testing-library/jest-dom" import expects a global
// `expect`, which Vitest 4 no longer provides unless `globals: true`).
import "@testing-library/jest-dom/vitest";

// jsdom does not implement Element.prototype.scrollIntoView. Components that
// call it (e.g. LanguageSelector scrolls the focused option into view) would
// throw an uncaught error under jsdom. Stub it. Guarded with `typeof Element`
// so the default node test environment (no DOM) is unaffected.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}
