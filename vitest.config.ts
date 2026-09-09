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
      include: ["src/**"],
      exclude: ["src/**/*.d.ts", "src/**/types.ts", "src/test/**"],
      // No thresholds yet — component tests don't exist yet (see AGENTS.md
      // Testing section). Add lines/functions thresholds once they do.
    },
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
});
