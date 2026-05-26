// vitest.config.ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    environmentMatchGlobs: [
      ["tests/components/**", "jsdom"],
    ],
    setupFiles: ["./vitest.setup.ts"],
    // Run integration tests sequentially — they share a test DB
    poolOptions: {
      forks: { singleFork: true },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**", "src/app/_actions/**"],
      exclude: ["**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@":           resolve(__dirname, "./src"),
      // Lets integration tests import from "test-utils" directly
      "test-utils":  resolve(__dirname, "./test-utils"),
    },
  },
})
