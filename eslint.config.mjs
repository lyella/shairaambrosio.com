// Flat ESLint config (ESLint 10).
//
// Why this file exists: `next lint` was removed in Next 16, and package.json sets
// "type": "module", so the old `.eslintrc.js` (CommonJS `module.exports`) could not
// be parsed — `yarn lint` failed on every run and nothing was ever linted.
// eslint-config-next 16 exports a ready-made flat array, so this composes it with
// the project's own rule decisions. `.eslintignore` is gone: ESLint 9+ reads
// `ignores` here instead.
import { dirname } from "path";
import { fileURLToPath } from "url";

import nextConfig from "eslint-config-next/core-web-vitals";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = [
  {
    ignores: [
      "public/**",
      "node_modules/**",
      ".next/**",
      "coverage/**",
      "next-env.d.ts",
      "**/*.config.js",
      "**/.eslintrc.cjs",
    ],
  },

  ...nextConfig,

  {
    linterOptions: {
      // Unused-disable directives are dead weight; surface them as errors.
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      // The codebase relies on `any` in a few content-loading seams.
      "@typescript-eslint/no-explicit-any": "off",
      // React 19 does not need the React import in scope.
      "react/react-in-jsx-scope": "off",
      // Memoised components set displayName explicitly.
      "react/display-name": "off",
      // next/link tolerates the few href-less anchors this design uses.
      "jsx-a11y/anchor-is-valid": "off",
      // Apostrophes in authored copy are intentional prose.
      "react/no-unescaped-entities": "off",
    },
  },

  {
    // Node-side scripts, generators and tests.
    files: ["*.ts", "scripts/**/*", "tests/**/*", "**/*.mjs"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly", Buffer: "readonly", __dirname: "readonly" },
    },
  },
];

export default config;
