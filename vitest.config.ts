import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      // Only code. "src/**" also swept up generate.py and tokens.csv, which
      // the parser then choked on noisily for no benefit.
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/types.ts",
        "src/test/**",
        "src/**/__tests__/**",
      ],
      // Set a little under what the suite actually reaches, so a real
      // regression fails the build but ordinary refactoring doesn't. Measure
      // and raise these when they start looking slack — never lower them to
      // make a red build go green.
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 80,
        branches: 75,
      },
    },
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
});
