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
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // permite usar any sin error
      "@typescript-eslint/no-unused-vars": "warn", // solo avisa, no rompe el build
      "react/no-unescaped-entities": "off", // opcional, evita errores con comillas
      "@next/next/no-img-element": "warn", // recomienda usar <Image>, pero no rompe
    },
  },
];

export default eslintConfig;
