import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Supabase dynamic queries and JSON payloads use any where strictly typed schemas aren't generated
      "@typescript-eslint/no-explicit-any": "off",
      // Allow standard apostrophes and quotes in page body text
      "react/no-unescaped-entities": "off",
      // Google fonts loaded via link tags in root layout
      "@next/next/no-page-custom-font": "off",
      // Date.now() used inside useMemo for posted date cutoff calculation
      "react-hooks/purity": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
