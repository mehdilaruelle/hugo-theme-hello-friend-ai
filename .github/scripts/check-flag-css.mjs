// Every flag box the built site draws must have a rule, and that rule's file
// must be published -- and a site that draws no flag must ship no rule.
//
// Both directions matter because the failure is silent. flag-css.html emits a
// rule per configured language instead of vendoring all ~530, so a mapping,
// rule or file that goes astray renders an empty square: the span is still
// there, just blank, and translation-link.html only falls back to the language
// code when data/langFlags.yaml has no entry at all.
//
//   node .github/scripts/check-flag-css.mjs <public-dir> [baseURL]
//
// baseURL is needed under a subpath, as check-links.mjs needs it: the url()
// carries the subpath, the file on disk does not.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { walk } from "./_lib.mjs";

const root = process.argv[2] || "public";
const baseURL = process.argv[3] || "/";

let prefix = "/";
try {
  prefix = new URL(baseURL, "https://example.invalid").pathname;
} catch {
  console.error(`cannot read ${baseURL} as a URL`);
  process.exit(1);
}
if (!prefix.endsWith("/")) prefix += "/";

// --minify drops the quotes it can, so match quoted, single-quoted and bare.
const CLASS_ATTR = /class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const RULE = /\.fi-([a-z0-9-]+)\s*\{[^}]*background-image\s*:\s*url\(\s*['"]?([^'")\s]+)/gi;

// The url() is resolved the way a browser would: against the site root for an
// absolute path, against the stylesheet's own directory for a relative one.
function toDisk(url, cssFile) {
  const clean = url.replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0];
  if (clean.startsWith("/")) {
    const rel = clean.startsWith(prefix) ? clean.slice(prefix.length) : clean.slice(1);
    return join(root, rel);
  }
  return join(dirname(cssFile), clean);
}

const rules = new Map();
let sheets = 0;
for (const cssFile of walk(root, ".css")) {
  sheets++;
  const css = readFileSync(cssFile, "utf8");
  for (const m of css.matchAll(RULE)) {
    if (!rules.has(m[1])) rules.set(m[1], { url: m[2], disk: toDisk(m[2], cssFile) });
  }
}

const failures = [];
const seen = new Set();
let files = 0;
let boxes = 0;

for (const file of walk(root, ".html")) {
  files++;
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(CLASS_ATTR)) {
    const classes = (m[1] ?? m[2] ?? m[3] ?? "").split(/\s+/);
    if (!classes.includes("fi")) continue;
    for (const c of classes) {
      if (!c.startsWith("fi-")) continue;
      boxes++;
      const flag = c.slice(3);
      // One report per flag rather than per page: the same language link is on
      // every translated page.
      if (seen.has(flag)) continue;
      const rule = rules.get(flag);
      if (!rule) {
        seen.add(flag);
        failures.push([file, `.${c}`, "no background-image rule in any stylesheet, so the box renders blank"]);
      } else if (!existsSync(rule.disk)) {
        seen.add(flag);
        failures.push([file, `.${c}`, `its rule names ${rule.url}, which was not published (looked for ${relative(".", rule.disk)})`]);
      }
    }
  }
}

// A build that produced nothing, or a wrong working directory, otherwise reads
// as a pass: no files, no failures, exit 0.
if (files === 0) {
  console.error(`no HTML found under ${root}`);
  process.exit(1);
}
if (sheets === 0) {
  console.error(`no stylesheet found under ${root}`);
  process.exit(1);
}

if (boxes === 0) {
  console.log(`no flag boxes under ${root}: monolingual build, ${rules.size} .fi-* rule(s) shipped`);
  if (rules.size) {
    console.error(`\n${rules.size} .fi-* rule(s) shipped to a site that draws no flag`);
    process.exit(1);
  }
  process.exit(0);
}

console.log(`checked ${boxes} flag boxes across ${files} files against ${rules.size} .fi-* rules`);
if (failures.length) {
  console.error(`\n${failures.length} flag(s) that would render blank:\n`);
  for (const [file, what, why] of failures) console.error(`  ${file}\n    ${what}  (${why})`);
  process.exit(1);
}
console.log("every flag box has a rule and the file it names was published");
