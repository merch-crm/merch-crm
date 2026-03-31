import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/*.js",
      "**/next-env.d.ts",
      "scripts/**",
      "app/(staff)/staff/cameras/**",
      "tmp/**",
      ".agents/**"
    ]
  },
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "warn",
    }
  }
];

export default eslintConfig;
