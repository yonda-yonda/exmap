/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// GitHub Pages のプロジェクトページ(/exmap/)向け設定。
export default defineConfig({
  base: "/exmap/",
  plugins: [
    react({
      babel: { plugins: ["babel-plugin-styled-components"] },
    }),
    tsconfigPaths(), // tsconfig.path.json の "~/*" エイリアスを解決
  ],
  server: { port: 3000 },
  build: { outDir: "build" }, // gh-pages -d build を維持
  test: {
    globals: true, // it/expect をグローバルに(既存テストを無改変で動かす)
    environment: "node", // 現状のテストは純粋関数。DOM が要るテストを足すなら "jsdom"
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
