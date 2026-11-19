// Postinstall helper: make @types/mdx compatible with React 19's type system.
//
// @types/mdx (all versions through 2.0.14) types components against the global
// `JSX` namespace. React 19 removed that global namespace in favour of
// `React.JSX`, so under React 19 the MDX component types silently degrade to
// `(props) => Element | null`, which no normal React 19 component satisfies.
//
// This rewrites the namespace references in place. It runs from `postinstall` so a
// fresh `yarn install` (locally or on Vercel) gets the same fixed types without
// needing patch-package's per-line bookkeeping for a file we replace wholesale.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const targets = [
  path.join(root, "node_modules", "@types", "mdx", "types.d.ts"),
  path.join(root, "node_modules", "@types", "mdx", "index.d.ts"),
];

const IMPORT_LINE = "import * as React from 'react';";

for (const file of targets) {
  if (!fs.existsSync(file)) {
    continue;
  }

  const original = fs.readFileSync(file, "utf8");

  if (original.startsWith(IMPORT_LINE)) {
    continue; // already patched
  }

  let patched = original
    .replace(/keyof JSX\.IntrinsicElements/g, "keyof React.JSX.IntrinsicElements")
    .replace(/JSX\.IntrinsicElements/g, "React.JSX.IntrinsicElements")
    .replace(/JSX\.ElementType/g, "React.JSX.ElementType")
    .replace(/JSX\.ElementClass/g, "React.JSX.ElementClass")
    .replace(/JSX\.Element\b/g, "React.JSX.Element");

  patched = `${IMPORT_LINE}\n\n${patched}`;

  fs.writeFileSync(file, patched);
  console.log(`[patch-mdx-types] patched ${path.relative(root, file)} for React 19`);
}
