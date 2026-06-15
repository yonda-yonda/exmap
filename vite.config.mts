import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/exmap/",
  plugins: [
    react({
      babel: { plugins: ["babel-plugin-styled-components"] },
    }),
    tsconfigPaths(),
  ],
  server: { port: 3000 },
  build: { outDir: "build" },
  esbuild: { keepNames: true },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
