import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Integration tests bind real ports; keep them off each other's toes.
    fileParallelism: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        // Argv shell: parsing is unit-tested, process wiring is run by hand.
        "src/cli.ts",
        // Type declarations only — no runtime code to cover.
        "src/types.ts",
        // Bootstrap: mounts the overlay and nothing else. Exercised end to end
        // against the fixture app rather than in a fake DOM.
        "src/overlay/index.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
