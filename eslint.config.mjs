import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Global rule overrides - pragmatic settings for production readiness
    // React Compiler rules are too strict for current codebase patterns
    ignores: ["*.config.*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      // React Compiler experimental rules - disable for now
      // These enforce patterns we'll adopt gradually
      "react-compiler/react-compiler": "off",
    },
  },
  {
    // Eigenstaendige Node-CLI-Skripte (CommonJS, kein Teil des Next.js/TS-App-Bundles).
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
