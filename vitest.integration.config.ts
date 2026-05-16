import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { defineConfig } from "vitest/config";

loadDotenv({ path: [".env.local", ".env"] });

export default defineConfig({
  resolve: {
    alias: {
      "#": fileURLToPath(new URL("./src/", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.integration.test.ts"],
    setupFiles: ["src/test/setup.integration.ts"],
    pool: "forks",
    fileParallelism: false,
  },
});
