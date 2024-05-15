// @ts-check
import path from "path";
import { fileURLToPath } from "url";
import tseslint from "typescript-eslint";
import prettierPluginConfig from "eslint-plugin-prettier/recommended";

export default tseslint.config({
  files: ["src/**/*.ts", "eslint.config.js"],
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url)),
    },
  },
  extends: [...tseslint.configs.strictTypeChecked, prettierPluginConfig],
  rules: {
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { allowExpressions: true },
    ],
    "@typescript-eslint/strict-boolean-expressions": ["error"],
  },
});
