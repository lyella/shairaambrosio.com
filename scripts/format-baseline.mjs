// Strictly classify Prettier differences: EOL-only, trailing-newline-only, or a
// substantive formatting change that alters the code layout.
import { execFileSync } from "child_process";
import fs from "fs";

let listed = "";
try {
  listed = execFileSync("npx", ["prettier", "--list-different", "**/*.{js,jsx,ts,tsx,css,scss,md,mdx,mjs}"], {
    encoding: "utf8",
    shell: true,
    stdio: ["ignore", "pipe", "ignore"],
  });
} catch (err) {
  listed = err.stdout ?? "";
}

const files = listed
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

const norm = (s) => s.replace(/\r\n/g, "\n");
const trimEof = (s) => s.replace(/\n+$/, "");

const buckets = { eol: [], eof: [], substantive: [] };

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  const formatted = execFileSync("npx", ["prettier", "--stdin-filepath", file], {
    input: original,
    encoding: "utf8",
    shell: true,
  });

  if (norm(original) === norm(formatted)) {
    buckets.eol.push(file);
  } else if (trimEof(norm(original)) === trimEof(norm(formatted))) {
    buckets.eof.push(file);
  } else {
    buckets.substantive.push(file);
  }
}

console.log(`total: ${files.length}`);
console.log(`  CRLF -> LF only:        ${buckets.eol.length}`);
console.log(`  trailing newline only:  ${buckets.eof.length}`);
console.log(`  substantive:            ${buckets.substantive.length}`);
console.log("\nsubstantive files:");
for (const f of buckets.substantive) console.log("  " + f);
