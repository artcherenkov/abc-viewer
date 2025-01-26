import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname, // Указываем директорию для разрешения путей
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    plugins: ["simple-import-sort"],
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_", // Игнорируем переменные, начинающиеся с "_"
          argsIgnorePattern: "^_", // Игнорируем аргументы, начинающиеся с "_"
          caughtErrorsIgnorePattern: "^_", // Игнорируем все ошибки в блоках catch
        },
      ],
    },
    parserOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
    },
  }),
];

export default eslintConfig;
