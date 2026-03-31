import { defineConfig, mergeConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import viteConfig from "./vite.config";

export default defineConfig((env) => mergeConfig(viteConfig(env), defineConfig({
  plugins: [
    ...viteConfig(env).plugins!,
    tsconfigPaths({
        projects: ["./tsconfig.test.json"]
    })
  ],
  test: {
    globals: true,
    setupFiles: ["./setupTests.ts"],
    environment: "jsdom",
    coverage: {
      provider: "v8",
    }
  },
})));
