// Checks every relative link in README, CONTRIBUTING and docs/ reaches a file
// and, for a #fragment, a heading. Nothing builds these files to notice.
//
//   node .github/scripts/check-doc-links.mjs <repo-root>

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { walk } from "./_lib.mjs";

const root = resolve(process.argv[2] || ".");
const files = ["README.md", "CONTRIBUTING.md", ...[...walk(join(root, "docs"), ".md")].map((f) => relative(root, f))];

// Code holds no links. Blanked, not removed, so line numbers stay right; fences
// and spans close as CommonMark says.
const blank = (text) => text.replace(/[^\n]/g, " ");
function prose(md) {
  const lines = md.split("\n");
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    if (fence) {
      const close = lines[i].match(/^ {0,3}(`+|~+)[ \t]*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      lines[i] = "";
    } else {
      const open = lines[i].match(/^ {0,3}(`{3,}|~{3,})/);
      if (open && !(open[1][0] === "`" && lines[i].slice(open.index + open[0].length).includes("`"))) {
        fence = open[1];
        lines[i] = "";
      }
    }
  }
  return lines.join("\n").replace(/(?<!`)(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g, blank);
}

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
    // Inline links and reference definitions.
    const targets = [...line.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map((m) => m[1]);
    const definition = line.match(/^ {0,3}\[[^\]]+\]:\s*<?([^\s>]+)>?/);
    if (definition) targets.push(definition[1]);
    for (const target of targets) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // http:, mailto:...
      checked++;
      const [pathPart, fragment] = target.split("#");
      // A leading slash is the repository root on GitHub, not the disk's.
      const decoded = decodeURIComponent(pathPart);
      const dest = !pathPart ? path : decoded.startsWith("/") ? join(root, decoded) : resolve(dirname(path), decoded);
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
