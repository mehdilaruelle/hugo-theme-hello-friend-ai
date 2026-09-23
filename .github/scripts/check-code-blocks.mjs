// Asserts that every highlighted code block sits inside a .code-block wrapper.
//
// Delete render-codeblock.html and nothing else fails: the page still builds,
// the CSS still applies, and the copy button and language label quietly start
// scrolling with the code again. See that hook for why the wrapper exists.
//
// Only highlighted blocks are required to be wrapped. An indented block never
// reaches a render hook, carries no data-lang and so draws no label, and
// copy-code.js wraps it in the browser. ```mermaid has its own hook.
//
//   node .github/scripts/check-code-blocks.mjs <public-dir>
import { readFileSync } from "node:fs";
import { walk } from "./_lib.mjs";

// --minify drops the quotes it can, so match quoted, single-quoted and bare.
const WRAPPER = /<div\s[^>]*class\s*=\s*(?:"[^"]*\bcode-block\b[^"]*"|'[^']*\bcode-block\b[^']*'|code-block)[^>]*>/gi;
const DIV_EDGE = /<div\b[^>]*>|<\/div\s*>/gi;
// A pre whose code carries a language: what Hugo highlights, and the only kind
// that draws a language label.
const LABELLED_PRE = /<pre\b[^>]*>\s*(?:<code\b[^>]*\bdata-lang\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))/gi;

// The character range each wrapper covers, found by balancing divs from its
// opening tag. Hugo puts a div.highlight inside it whenever it highlights, so
// the nesting has to be counted rather than assumed.
function wrapperSpans(html) {
  const spans = [];
  for (const open of html.matchAll(WRAPPER)) {
    const start = open.index;
    let depth = 0;
    // matchAll copies the regex's lastIndex, so it is left alone here: the
    // slice already starts where the search should.
    for (const edge of html.slice(start).matchAll(DIV_EDGE)) {
      depth += edge[0].startsWith("</") ? -1 : 1;
      if (depth === 0) { spans.push([start, start + edge.index + edge[0].length]); break; }
    }
  }
  return spans;
}

const root = process.argv[2] || "public";
const failures = [];
const seen = new Set();
let files = 0;
let wrapped = 0;
let total = 0;

for (const file of walk(root, ".html")) {
  files++;
  const html = readFileSync(file, "utf8");
  const spans = wrapperSpans(html);
  for (const m of html.matchAll(LABELLED_PRE)) {
    const lang = m[1] ?? m[2] ?? m[3] ?? "";
    total++;
    if (spans.some(([a, z]) => m.index > a && m.index < z)) { wrapped++; continue; }
    // One report per language rather than per page: the same block is
    // unwrapped on every page that carries it.
    if (seen.has(lang)) continue;
    seen.add(lang);
    failures.push([file, `a ${lang || "(no language)"} block`,
      "outside any .code-block, so its copy button and language label scroll with the code"]);
  }
}

// A build that produced nothing, or a wrong working-directory, otherwise reads
// as a pass: no files, no failures, exit 0.
if (files === 0) {
  console.error(`no HTML found under ${root}`);
  process.exit(1);
}
if (total === 0) {
  console.error(`no highlighted code blocks found under ${root}`);
  process.exit(1);
}

console.log(`checked ${total} highlighted code blocks across ${files} files, ${wrapped} wrapped`);
if (failures.length) {
  // Deduplicated by language, so this counts kinds of block, not pages.
  console.error(`\n${total - wrapped} unanchored, ${failures.length} distinct:\n`);
  for (const [file, what, why] of failures) console.error(`  ${file}\n    ${what}  (${why})`);
  process.exit(1);
}
console.log("every highlighted block is inside a non-scrolling .code-block");
