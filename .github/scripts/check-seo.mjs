// Asserts the eight invariants the theme's head and structured data rest on.
//
// Each is something a build reports nothing about: a page can name two URLs as
// its own, announce a card picture no platform renders, or carry two
// contradictory robots directives, and Hugo calls that a successful build --
// which is how most of these got in. The rest have never failed, which is what
// a regression test is for.
//
//   node .github/scripts/check-seo.mjs <public-dir>

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Quoted, single-quoted or bare, because --minify drops the quotes it can. The
// lookbehind is the name test \b is not; check-sharing.mjs says why.
const attr = (name) => String.raw`(?<![-\w])${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`;
const pick = (m) => (m ? (m[1] ?? m[2] ?? m[3] ?? "") : null);

// Every occurrence, not the last one: Open Graph allows a property to repeat,
// and a map keyed by property hid an SVG followed by a usable picture. The
// theme writes one og:image now, so this is a regression test rather than a
// finding -- a shortcode or a custom head can still add a second.
const add = (map, key, value) => map.set(key, [...(map.get(key) ?? []), value]);
const all = (map, key) => map.get(key) ?? [];
const isSvg = (v) => new URL(v, "https://example.invalid/").pathname.toLowerCase().endsWith(".svg");

// A Hugo alias is a redirect stub, not a page these invariants describe.
const ALIAS = /http-equiv\s*=\s*["']?refresh/i;
// The whole element, so a summary is read from the faq that owns it: the
// language switcher puts one on every page of the site.
const FAQ_BLOCK = /<details\b[^>]*\bclass\s*=\s*["']?faq\b[^>]*>[\s\S]*?<\/details\s*>/gi;
const SUMMARY = /<summary\b[^>]*>([\s\S]*?)<\/summary>/i;

const LINK = /<link\b[^>]*>/gi;
// The tags whose content is prose a person reads, not a URL or a token.
const DESCRIBES = /^(?:description|og:description|twitter:description|og:image:alt|twitter:image:alt|og:title|twitter:title)$/;
// One decode, matching what a parser does to an attribute value: whatever is
// still an entity afterwards was escaped twice.
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const decode = (v) =>
  v.replace(/&(#[0-9]+|#x[0-9a-f]+|[a-z]+[0-9]*);/gi, (m, n) => {
    const k = n.toLowerCase();
    if (k in ENTITIES) return ENTITIES[k];
    if (k.startsWith("#x")) return String.fromCodePoint(parseInt(k.slice(2), 16));
    if (k.startsWith("#")) return String.fromCodePoint(parseInt(k.slice(1), 10));
    return m;
  });

const META = /<meta\b[^>]*>/gi;
const REL = new RegExp(attr("rel"), "i");
const HREF = new RegExp(attr("href"), "i");
const NAME = new RegExp(attr("name"), "i");
const PROPERTY = new RegExp(attr("property"), "i");
const CONTENT = new RegExp(attr("content"), "i");
const LD = /<script[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;

// The search layout is not knowable from the markup, so the form it is the only
// template to render stands in for it.
const SEARCH_FORM = /<form\b[^>]*\bclass\s*=\s*(?:"[^"]*search-form[^"]*"|'[^']*search-form[^']*'|[^\s>]*search-form[^\s>]*)/i;

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (full.endsWith(".html")) yield full;
  }
}

const root = process.argv[2] || "public";
const failures = [];
let checked = 0;

for (const file of walk(root)) {
  const html = readFileSync(file, "utf8");
  if (ALIAS.test(html)) continue;

  const canonicals = [];
  for (const tag of html.match(LINK) ?? []) {
    if ((pick(tag.match(REL)) ?? "").toLowerCase() === "canonical") canonicals.push(pick(tag.match(HREF)));
  }

  const robots = [];
  const og = new Map();
  const named = new Map();
  for (const tag of html.match(META) ?? []) {
    const property = (pick(tag.match(PROPERTY)) ?? "").toLowerCase();
    const name = (pick(tag.match(NAME)) ?? "").toLowerCase();
    const content = pick(tag.match(CONTENT)) ?? "";
    if (name === "robots") robots.push(content);
    if (property) add(og, property, content);
    if (name) add(named, name, content);
  }

  const blocks = [];
  for (const m of html.matchAll(LD)) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch {
      failures.push([file, "a JSON-LD block", "does not parse as JSON"]);
    }
  }
  checked++;

  // 1. One URL, named in both places. Presence as well as agreement: comparing
  //    only when both are there made deleting either a way to pass.
  const ogUrls = all(og, "og:url");
  if (canonicals.length !== 1 || ogUrls.length !== 1) {
    failures.push([file, `${canonicals.length} canonical, ${ogUrls.length} og:url`, "a page names its own URL once in each"]);
  } else if (canonicals[0] !== ogUrls[0]) {
    failures.push([file, `canonical ${canonicals[0]}`, `og:url says ${ogUrls[0]}`]);
  }

  // 2. One robots meta, never two. A second is a directive nobody can order
  //    against the first.
  if (robots.length > 1) {
    failures.push([file, `${robots.length} robots tags: ${robots.join(" | ")}`, "a page may carry one"]);
  }

  // 3. No SVG on a card. Facebook, X and LinkedIn render none, so the card is
  //    announced and then arrives empty.
  for (const key of ["og:image", "og:image:secure_url", "twitter:image"]) {
    for (const v of [...all(og, key), ...all(named, key)]) {
      if (v && isSvg(v)) failures.push([file, `${key} ${v}`, "no platform renders an SVG on a card"]);
    }
  }

  // 4. An article whose picture is its own says so in its structured data.
  //    og:image:alt is the marker: it is offered only for an owned picture,
  //    which is exactly the case json-ld.html takes.
  const article = blocks.find((b) => b && b["@type"] === "BlogPosting");
  if (article && all(og, "og:image").length && all(og, "og:image:alt").length && !article.image) {
    failures.push([file, "a BlogPosting with the page's own og:image", "carries no image of its own"]);
  }

  // 5. Structured data that parses, and says what it is.
  for (const b of blocks) {
    if (!b || !b["@context"] || !b["@type"]) {
      failures.push([file, "a JSON-LD block", "has no @context or no @type"]);
    }
  }

  // 6. A search page is not for an index: thin, and endlessly generable. Split
  //    into directives, not searched as a substring -- "noindexing" passed.
  const directives = robots.flatMap((r) => r.toLowerCase().split(/[\s,]+/)).filter(Boolean);
  if (SEARCH_FORM.test(html) && !directives.includes("noindex")) {
    failures.push([file, "a search page", "is not marked noindex"]);
  }

  // 6b. The FAQ pairs reach the head through a store filled while the content
  //     renders, which fails silently when it fails. Counted both ways.
  //     Decoded, or a question with an & or an apostrophe never matches itself.
  const details = html.match(FAQ_BLOCK) ?? [];
  const shown = details.map((d) => decode((d.match(SUMMARY)?.[1] ?? "").replace(/<[^>]*>/g, "")).trim());
  const faqs = blocks.filter((b) => b && b["@type"] === "FAQPage");
  const asked = faqs
    .flatMap((b) => (Array.isArray(b.mainEntity) ? b.mainEntity : []))
    .map((q) => (q && typeof q.name === "string" ? q.name.trim() : ""));
  if (details.length && !faqs.length) {
    failures.push([file, "a faq shortcode on the page", "and no FAQPage in the head"]);
  }
  // As multisets: one direction would let [A, B] on the page pass [A, A] in
  // the head, which is a substitution rather than an omission.
  const bag = (a) => [...a].sort().join(" | ");
  if (bag(shown) !== bag(asked)) {
    const only = (a, b) => {
      const rest = [...b];
      return a.filter((x) => {
        const i = rest.indexOf(x);
        if (i < 0) return true;
        rest.splice(i, 1);
        return false;
      });
    };
    const why = [
      only(asked, shown).map((q) => `only in the head: "${q}"`),
      only(shown, asked).map((q) => `only on the page: "${q}"`),
    ].flat().join("; ") || `${shown.length} details, ${asked.length} questions`;
    failures.push([file, "the page and the FAQPage ask different questions", why]);
  }

  // 7. An entity that survived into the text. plainify leaves the entities
  //    Goldmark makes, so an apostrophe was escaped a second time and the tag
  //    shipped "site&rsquo;s" as words. The value is decoded once above, so
  //    anything still shaped like an entity was escaped twice.
  for (const [key, values] of [...og, ...named]) {
    if (!DESCRIBES.test(key)) continue;
    for (const value of values) {
      const m = decode(value).match(/&(?:#[0-9]+|#x[0-9a-f]+|[a-z]+[0-9]*);/i);
      if (m) failures.push([file, key + " carries " + m[0], "an entity escaped twice, read as text"]);
    }
  }

  // 8. One sentence per page, not three. opengraph.html used Hugo's own chain,
  //    so 45 of the showcase's 87 described pages said one thing in the meta
  //    tag and another in the card. All three ask description-meta.html now.
  const said = [all(named, "description"), all(og, "og:description"), all(named, "twitter:description")];
  if (said.every((v) => v.length === 1)) {
    const [meta, ogDesc, twitter] = said.map((v) => v[0]);
    if (meta !== ogDesc || meta !== twitter) {
      failures.push([file, `description "${meta}"
    og:description "${ogDesc}"
    twitter:description "${twitter}"`,
        "one page, three different sentences"]);
    }
  } else if (said.some((v) => v.length > 1)) {
    failures.push([file, "a description tag is repeated", "a page describes itself once in each"]);
  }
}

// A directory that exists and holds no pages is the shape a wrong path takes,
// and every assertion above is vacuously true over nothing.
if (checked === 0) {
  console.error(`no pages under ${root}: nothing was checked`);
  process.exit(1);
}

console.log(`checked ${checked} pages`);
if (failures.length) {
  console.error(`\n${failures.length} broken:\n`);
  for (const [file, what, why] of failures) console.error(`  ${file}\n    ${what}  (${why})`);
  process.exit(1);
}
console.log("canonical and og:url agree, one robots tag each, no SVG on a card");
console.log("every JSON-LD block parses, an owned picture is in its BlogPosting, search is noindex");
console.log("no description or alt carries an entity that was escaped twice");
console.log("the meta, Open Graph and Twitter descriptions are the same sentence");
