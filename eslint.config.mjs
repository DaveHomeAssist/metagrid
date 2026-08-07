import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Historical prototypes are retained for reference, not shipped or maintained.
    "archive/**",
    // Standalone electrical suite: browser JS/HTML shipped as static assets,
    // not part of the Next app; must not be linted with Next/TypeScript rules
    // (require()/var/empty-catch).
    "public/tools/**",
    "tests/**",
  ]),
]);

export default eslintConfig;
