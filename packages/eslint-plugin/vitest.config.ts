import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@kitazzz/trace-shuttle-core": path.resolve(
        __dirname,
        "../core/src/index.ts",
      ),
    },
  },
});
