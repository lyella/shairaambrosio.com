import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      // Force the in-memory rate-limit fallback; KV backend is tested separately.
      KV_REST_API_URL: "",
      KV_REST_API_TOKEN: "",
    },
  },
});
