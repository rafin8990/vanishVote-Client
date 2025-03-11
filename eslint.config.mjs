import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-console": "off", // Allow console statements
      "prefer-const": "off", // Allow 'let' even if variables are not reassigned
      "prefer-const": "off", // Allow 'let' even if variables are not reassigned
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' type in TypeScript
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }], // Ignore unused variables with a leading underscore
      "@next/next/no-img-element": "off", // Allow <img> tag instead of Next.js <Image />
    },
  },
];

export default eslintConfig;
