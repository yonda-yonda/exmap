import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importX from "eslint-plugin-import-x";
import vitest from "@vitest/eslint-plugin";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  { ignores: ["build/", "out/", "dist/", "node_modules/"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"], // React 17+ 新JSX変換: Reactのimport不要

  {
    plugins: { "react-hooks": reactHooks, "import-x": importX },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      "no-use-before-define": "off",
      "no-console": ["warn", { allow: ["warn", "error", "trace"] }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "import-x/no-unresolved": "off", // 解決はTS/Viteに任せる
      "import-x/no-default-export": "warn",
      "import-x/order": [
        "warn",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: [
            "builtin",
            "external",
            "internal",
            "type",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          pathGroups: [{ pattern: "~/**", group: "parent" }],
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": [
        "warn",
        { allowedNames: ["render"] },
      ],
    },
  },

  // default export を許可する箇所(ルーティングのページ等)
  {
    files: ["src/App.tsx", "src/pages/**/*"],
    rules: { "import-x/no-default-export": "off" },
  },

  // テストファイル(Vitest)
  {
    files: ["src/**/*.test.{ts,tsx}"],
    ...vitest.configs.recommended,
  },

  prettier // 競合するスタイル系ルールを最後に無効化
);
