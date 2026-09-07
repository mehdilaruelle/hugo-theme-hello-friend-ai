// A broken llms.txt is still a valid text file, so only an assertion on the
// built output catches one.
//
//   node .github/scripts/check-llms.mjs <public-dir> <base-url>
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const root = args[0] || "public";
const base = args[1] || "https://example.com/";
const langs = { en: "", fr: "fr/", ja: "ja/", ar: "ar/" };

// --absent=<url>,<url>: published, and mapped nowhere. Named from outside
// because the absence is the feature, so there is no marker to look for.
const absent = (process.argv.find((a) => a.startsWith("--absent=")) || "")
  .replace("--absent=", "").split(",").filter(Boolean);

const walk = (d) => readdirSync(d).flatMap((e) => {
  const p = join(d, e);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

// isDirectory, not existsSync: a regular file passes that and readdirSync then
// throws the ENOTDIR trace this replaces.
if (!existsSync(root) || !statSync(root).isDirectory()) {
  console.log(`  BAD  no ${root} directory to read`);
  process.exit(1);
}

let bad = 0;
const fail = (msg) => { console.log(`  BAD  ${msg}`); bad++; };

// Entities are wrong in prose, right inside a tag, and right inside <code>,
// where escaping a literal < is the only way to show one. A tag, not anything
// between angle brackets, or "A < B &amp; C > D" takes the entity with it.
const prose = (s) => s
  .replace(/<(code|pre)(?:\s[^>]*)?>[\s\S]*?<\/\1\s*>/gi, "")
  .replace(/<\/?[A-Za-z][^>]*>/g, "");
const entities = (s) => prose(s).match(/&(?:[a-zA-Z][a-zA-Z0-9]*|#(?:\d+|x[0-9a-fA-F]+));/g);

// The destination without the title: [About](/about/ "About") is /about/.
const destination = (raw) => {
  const d = raw.trim();
  if (d.startsWith("<")) {
    const end = d.indexOf(">");
    return end < 0 ? d.slice(1) : d.slice(1, end);
  }
  return d.split(/\s+/)[0];
};

// A title carrying a ] is escaped to \], which a class stopping at the first ]
// never reads past.
const LINK = /\[(?:\\.|[^\\\]])*\]\(([^)]+)\)/g;
const LIST_LINK = /^- \[(?:\\.|[^\\\]])*\]\(([^)]+)\)/gm;
const mdLinks = (s) => [...s.matchAll(LINK)].map((m) => destination(m[1]));
// A listing entry, not any mention: a page kept out of the generated lists is
// still one an author may link to in prose.
const bare = (u) => u.replace(/index\.md$/, "");
const listed = (s) => [...s.matchAll(LIST_LINK)].map((m) => bare(destination(m[1])));
// llms-full.txt entries close as page.md.md does — rule, blank line, page URL.
const carriedIn = (full) => {
  const lines = full.split("\n");
  const out = [];
  for (let i = 2; i < lines.length; i++) {
    if (lines[i - 2].trim() !== "---" || lines[i - 1].trim() !== "") continue;
    const last = lines[i].trim().split(/\s+/).pop();
    if (last && last.startsWith(base)) out.push(last);
  }
  return out;
};

// The path decides, nothing else: a fragment joined into a filename looks for
// a file nobody wrote.
const basePath = new URL(base).pathname;
const relative = (path) => {
  const p = path.startsWith(basePath) ? path.slice(basePath.length) : path.replace(/^\//, "");
  return decodeURIComponent(p);
};
const target = (url) => {
  let path;
  try { path = new URL(url).pathname; } catch { return null; }
  const rel = relative(path);
  return /\.(md|txt)$/.test(rel) ? join(root, rel) : join(root, rel, "index.html");
};
const resolves = (url) => { const t = target(url); return t !== null && existsSync(t); };

for (const [lang, prefix] of Object.entries(langs)) {
  const file = join(root, prefix, "llms.txt");
  const before = bad;
  if (!existsSync(file)) { fail(`${lang}: no llms.txt`); continue; }
  const s = readFileSync(file, "utf8");

  if (!/^# \S/m.test(s)) fail(`${lang}: no title heading`);
  if (!/^## \S/m.test(s)) fail(`${lang}: no section heading`);

  const found = entities(s);
  if (found) fail(`${lang}: ${found.length} HTML entities, e.g. ${found[0]}`);

  const links = [...s.matchAll(LIST_LINK)].map((m) => destination(m[1]));
  if (!links.length) fail(`${lang}: no links`);
  for (const url of links) {
    if (!url.startsWith(base)) { fail(`${lang}: ${url} is outside ${base}`); continue; }
    if (!resolves(url)) fail(`${lang}: ${url} resolves to nothing`);
    // A noai page loses its rel="alternate", so one mapped here whose HTML does
    // not name its .md is a page the two consumers disagree about.
    if (!url.endsWith(".md")) continue;
    const html = target(url.replace(/index\.md$/, ""));
    if (html && existsSync(html) && !readFileSync(html, "utf8").includes(url)) {
      fail(`${lang}: ${url} is mapped but its page does not advertise it`);
    }
  }
  if (bad === before) console.log(`  ${lang.padEnd(3)} llms.txt  ${links.length} links, all resolve`);

  // Optional, but publishing one makes llms.txt a promise: the same pages, in
  // the same order, carrying their text.
  const fullFile = join(root, prefix, "llms-full.txt");
  if (!existsSync(fullFile)) continue;
  const beforeFull = bad;
  const full = readFileSync(fullFile, "utf8").split("\r\n").join("\n");

  const fullUrl = `${base}${prefix}llms-full.txt`;
  if (!s.includes(fullUrl)) fail(`${lang}: llms.txt does not name ${fullUrl}`);
  if (!full.startsWith("# ")) fail(`${lang}: llms-full.txt does not open with a heading`);
  if (full.includes("{{<") || full.includes("{{%")) fail(`${lang}: llms-full.txt has an unrendered shortcode`);
  const fullEntities = entities(full);
  if (fullEntities) fail(`${lang}: llms-full.txt has ${fullEntities.length} HTML entities, e.g. ${fullEntities[0]}`);

  // Read out of the file, not looked up one URL at a time: looking up what the
  // map names can never notice a page it never named.
  const carried = carriedIn(full);
  const pages = links.filter((u) => u.startsWith(base)).map(bare);
  if (!carried.length) fail(`${lang}: llms-full.txt carries none of the ${pages.length} pages llms.txt maps`);
  // llmsFullLimit may cut the tail and nothing else.
  const expected = pages.slice(0, carried.length);
  for (let i = 0; i < Math.max(carried.length, expected.length); i++) {
    if (carried[i] !== expected[i]) {
      fail(`${lang}: llms-full.txt entry ${i + 1} is ${carried[i] || "missing"}, the map says ${expected[i] || "there should be none"}`);
      break;
    }
  }
  if (bad === beforeFull) {
    console.log(`  ${lang.padEnd(3)} llms-full  ${carried.length < pages.length
      ? `${carried.length} of ${pages.length} pages, the rest cut by llmsFullLimit`
      : `${carried.length} page${carried.length === 1 ? "" : "s"}, the whole map`}`);
  }
}

const beforeMd = bad;
const slash = (p) => p.split("\\").join("/");
const rootPrefix = slash(root).replace(/\/$/, "") + "/";
const mds = walk(root).filter((f) => f.endsWith("index.md"));
const rels = mds.map((f) => slash(f).slice(rootPrefix.length));
if (!mds.length) fail("no Markdown pages were written");
let edges = 0;
for (const f of mds) {
  const s = readFileSync(f, "utf8");
  if (!s.startsWith("# ")) fail(`${f}: does not open with a heading`);
  if (/^(\+\+\+|---)$/m.test(s.split("\n")[0])) fail(`${f}: front matter leaked`);
  if (s.includes("{{<") || s.includes("{{%")) fail(`${f}: an unrendered shortcode`);
  const found = entities(s);
  if (found) fail(`${f}: ${found.length} HTML entities, e.g. ${found[0]}`);
  // Anywhere in the file would pass on a page that merely links to the site.
  const last = s.trimEnd().split("\n").pop().trim();
  if (!last.split(/\s+/).pop().startsWith(base)) fail(`${f}: does not end with a canonical URL`);

  for (const url of mdLinks(s).filter((u) => u.startsWith(base))) {
    edges++;
    if (!resolves(url)) fail(`${f}: ${url} resolves to nothing`);
  }
}
if (bad === beforeMd) console.log(`  md       ${mds.length} pages, each a heading then prose, ${edges} links between them`);

// Links resolving does not prove reachability: /tags/ published itself and its
// terms, nothing linked it, and everything above passed. A page with pages
// under it must be reachable; a leaf nobody links is searchable: false.
const beforeGraph = bad;
const outgoing = (rel) => mdLinks(readFileSync(join(root, rel), "utf8"))
  .filter((u) => u.startsWith(base))
  .map((u) => { const t = target(u); return t === null ? null : slash(t).slice(rootPrefix.length); })
  .filter((r) => r && r.endsWith("index.md"));
const prefixes = Object.values(langs).filter(Boolean);
const langOf = (rel) => prefixes.find((p) => rel.startsWith(p)) || "";
let walked = 0;
for (const prefix of Object.values(langs)) {
  const home = `${prefix}index.md`;
  if (!rels.includes(home)) continue;
  const seen = new Set([home]);
  const queue = [home];
  while (queue.length) {
    for (const next of outgoing(queue.shift())) {
      if (rels.includes(next) && !seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  walked += seen.size;
  for (const rel of rels) {
    if (langOf(rel) !== prefix) continue;
    const dir = rel.slice(0, -"index.md".length);
    const hasChildren = rels.some((r) => r !== rel && r.startsWith(dir) && langOf(r) === prefix);
    if (hasChildren && !seen.has(rel)) fail(`${rel}: has pages under it and nothing links it from ${home}`);
  }
}
// md on pages but not on home leaves no front page to walk from, and zero
// would read as a result rather than the absence of one.
if (bad === beforeGraph) {
  console.log(walked
    ? `  graph    ${walked} pages reachable by following the Markdown from each front page`
    : "  graph    no front page published as Markdown, so nothing to walk");
}

const beforeAbsent = bad;
for (const url of absent) {
  // Published, or the check passes on a URL nobody wrote.
  const page = target(url);
  if (!existsSync(page)) { fail(`--absent ${url} is not a page of this build`); continue; }
  for (const [lang, prefix] of Object.entries(langs)) {
    const map = join(root, prefix, "llms.txt");
    if (existsSync(map) && listed(readFileSync(map, "utf8")).includes(url)) {
      fail(`${lang}: llms.txt maps ${url}, which asked to stay out`);
    }
    const full = join(root, prefix, "llms-full.txt");
    if (existsSync(full) && carriedIn(readFileSync(full, "utf8").split("\r\n").join("\n")).includes(url)) {
      fail(`${lang}: llms-full.txt carries ${url}, which asked to stay out`);
    }
  }
  for (const f of mds) {
    if (listed(readFileSync(f, "utf8")).includes(url)) fail(`${f}: lists ${url}, which asked to stay out`);
  }
  // The other half of the contract, which nothing else here would notice.
  if (readFileSync(page, "utf8").includes(`${url}index.md`)) {
    fail(`${url} still advertises its Markdown copy`);
  }
}
if (absent.length && bad === beforeAbsent) console.log(`  noai     ${absent.length} page(s) published and mapped nowhere`);

if (bad) { console.log(`\n${bad} problem(s)`); process.exit(1); }
console.log("\n  llms.txt and the Markdown copies are usable as text");
