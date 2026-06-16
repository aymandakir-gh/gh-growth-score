import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // Vitest 4 bundles Vite 8 (rolldown/oxc). The old @vitejs/plugin-react only
  // supports Vite ^4–^7, so it no longer transforms JSX here. Instead we let
  // oxc transform JSX with the automatic runtime, which also overrides the
  // app tsconfig's `jsx: "preserve"` (required by Next.js) for the test build.
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    // globals: true exposes a global `afterEach`, which @testing-library/react
    // detects to auto-register DOM cleanup between tests. Without it, rendered
    // components accumulate in document.body across tests in a file and
    // getByRole(...) throws "multiple elements found".
    globals: true,
    // Default to node (scoring logic, pure functions, route handlers).
    // Component test files (*.test.tsx) opt into jsdom via a per-file
    // `@vitest-environment jsdom` docblock — Vitest 4 removed the
    // config-level environmentMatchGlobs option.
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
