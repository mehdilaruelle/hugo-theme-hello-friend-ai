// Checks every relative link in the repository's own Markdown -- README,
// CONTRIBUTING, docs/ -- points at a file that exists and, when it names a
// #fragment, at a heading or anchor that file has. GitHub renders these, so
// nothing else would notice a section that moved.
//
//   node .github/scripts/check-doc-links.mjs <repo-root>

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { walk } from "./_lib.mjs";

const root = resolve(process.argv[2] || ".");
const files = ["README.md", "CONTRIBUTING.md", ...[...walk(join(root, "docs"), ".md")].map((f) => relative(root, f))];

// Fenced and inline code are not rendered as links.
const prose = (md) => md.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, "").replace(/`[^`\n]*`/g, "");

// GitHub's heading ids: lower case, punctuation dropped, spaces to hyphens,
// a repeat gets -1, -2...
function anchors(md) {
  const seen = new Map();
  const ids = new Set();
  for (const [, text] of prose(md).matchAll(/^#{1,6}[ \t]+(.+?)[ \t#]*$/gm)) {
    const base = text
      .replace(/<[^>]+>/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\p{M} _-]/gu, "")
      .replace(/ /g, "-");
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    ids.add(n ? `${base}-${n}` : base);
  }
  for (const [, id] of md.matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) ids.add(id);
  return ids;
}

const cache = new Map();
const idsOf = (file) => {
  if (!cache.has(file)) cache.set(file, anchors(readFileSync(file, "utf8")));
  return cache.get(file);
};

let bad = 0;
let checked = 0;
for (const file of files) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  const md = prose(readFileSync(path, "utf8"));
  const lines = md.split("\n");
  lines.forEach((line, i) => {
    for (const [, target] of line.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // http:, mailto:...
      checked++;
      const [pathPart, fragment] = target.split("#");
      const dest = pathPart ? resolve(dirname(path), decodeURIComponent(pathPart)) : path;
      const where = `${file}:${i + 1}`;
      if (!existsSync(dest)) {
        console.log(`  BAD  ${where}  ${target}  -- no such file`);
        bad++;
        continue;
      }
      if (fragment === undefined || !dest.endsWith(".md") || statSync(dest).isDirectory()) continue;
      if (!idsOf(dest).has(decodeURIComponent(fragment).toLowerCase())) {
        console.log(`  BAD  ${where}  ${target}  -- no such heading in ${relative(root, dest)}`);
        bad++;
      }
    }
  });
}

console.log(`${checked} relative link(s) in ${files.length} file(s), ${bad} broken.`);
process.exit(bad ? 1 : 0);
