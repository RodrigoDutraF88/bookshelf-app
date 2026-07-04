import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/server/api/routers/**"],
    },
   
   
    env: {
      SKIP_ENV_VALIDATION: "1",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      DIRECT_URL: "postgresql://user:pass@localhost:5432/db",
      AUTH_SECRET: "ci-dummy-secret-32-characters-ok",
      AUTH_DISCORD_ID: "dummy",
      AUTH_DISCORD_SECRET: "dummy",
      NEXTAUTH_URL: "http://localhost:3000",
    },
    server: {
      deps: {
        inline: ["next-auth", "@auth/core"],
      },
    },
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
      "next/server": resolve(__dirname, "./tests/__mocks__/next-server.ts"),
      "next/headers": resolve(__dirname, "./tests/__mocks__/next-headers.ts"),
      "next/navigation": resolve(__dirname, "./tests/__mocks__/next-navigation.ts"),
    },
  },
});