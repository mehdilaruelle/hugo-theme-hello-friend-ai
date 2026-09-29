// Every action must be pinned to a commit SHA: a tag can be moved to other
// code, which the next run executes with this repository's token.
//
//   node .github/scripts/check-pinned-actions.mjs <theme-root>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Local actions ("./", "$/") and containers are not fetched from elsewhere.
const pinned = (ref) =>
  ref.startsWith("./") ||
  (ref.startsWith("$/") && ref.length > 2) ||
  ref.startsWith("docker://") ||
  /^[^@\s]+@[0-9a-f]{40}$/.test(ref);

const CASES = [
  ["actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1", true],
  ["./.github/actions/local", true],
  ["$/.github/actions/local", true],
  ["$/", false],
  ["actions/checkout@v7", false],
  ["actions/checkout@v7.0.1", false],
  ["actions/checkout@main", false],
  ["actions/checkout@3d3c42e", false],
  ["actions/checkout", false],
];
for (const [ref, want] of CASES) {
  if (pinned(ref) !== want) {
    console.log(`  self-test BAD  ${ref} read as ${pinned(ref) ? "pinned" : "unpinned"}`);
    process.exit(2);
  }
}

const dir = join(process.argv[2] || ".", ".github/workflows");
let bad = 0;
let seen = 0;
for (const f of readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
  readFileSync(join(dir, f), "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      const m = line.match(/^\s*(?:-\s+)?uses:\s*["']?([^\s"'#]+)/);
      if (!m) return;
      seen++;
      if (!pinned(m[1])) {
        console.log(`  ${f}:${i + 1}: BAD  ${m[1]} is not pinned to a commit SHA`);
        bad++;
      }
    });
}

if (!seen) {
  console.log(`  BAD  no uses: found under ${dir}`);
  process.exit(1);
}
console.log(bad ? `\n  ${bad} of ${seen} action(s) unpinned` : `  ${seen} actions, all pinned to a commit SHA`);
process.exit(bad ? 1 : 0);
