import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Studio photos can come from any host a user pastes, so plain img tags are used on purpose
  { rules: { "@next/next/no-img-element": "off" } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
