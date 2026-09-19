// Asserts that every social link is named, and that its icon is not.
//
// The icons carry no text, and most of the svgs carry no <title> either, so the
// anchor's own label is the whole accessible name a screen reader has. It used
// to be `humanize`, which only capitalises the first letter: "Github",
// "Linkedin", "Stackoverflow". Nothing in the build failed, because a wrong
// name is still a name.
//
// Two assertions, then:
//
// One, every rel="me" anchor carries a non-empty aria-label, and its title says
// the same thing -- a tooltip and a screen reader disagreeing is its own bug.
//
// Two, the icon inside it is hidden from assistive technology, so the link is
// announced once rather than twice. Two of the svgs (x, buymeacoffee) carry an
// internal <title> of their own, which is exactly the case that reads twice
// when the wrapper is missing.
//
//   node .github/scripts/check-social.mjs <public-dir>

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// An attribute name starts where no name character precedes it. \b is not that
// test: there is a word boundary between "-" and "l" too, so \blabel would
// match the label inside aria-label.
const NAME = "(?<![-\\w])";

// Quoted, single-quoted or bare: --minify drops the quotes it can, and a
// pattern requiring them passes most of the file in silence.
const attr = (name) =>
  new RegExp(`${NAME}${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");

const HREF = attr("href");
const REL = attr("rel");
const TITLE = attr("title");
const ARIA_LABEL = attr("aria-label");

// The anchor and everything up to its close. rel="me" is what social-icons.html
// always writes and nothing else in the theme does, so it identifies these
// links without depending on a class the stylesheet does not set.
const ANCHOR = /<a\b[^>]*>[\s\S]*?<\/a>/gi;

const value = (tag, re) => {
  const m = tag.match(re);
  return m ? (m[1] ?? m[2] ?? m[3] ?? "") : null;
};

// Decoded far enough to compare two attributes written by the same template.
const text = (s) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (full.endsWith(".html")) yield full;
  }
}

const root = process.argv[2] || "public";
const failures = [];
const seen = new Set();
let files = 0;
let anchors = 0;

for (const file of walk(root)) {
  files++;
  const html = readFileSync(file, "utf8");
  for (const [tag] of html.matchAll(ANCHOR)) {
    const open = tag.slice(0, tag.indexOf(">") + 1);
    const rel = value(open, REL) ?? "";
    if (!rel.split(/\s+/).includes("me")) continue;
    anchors++;

    const href = value(open, HREF) ?? "";
    const label = value(open, ARIA_LABEL);
    const title = value(open, TITLE);

    // One report per destination rather than per page: the same icon is wrong
    // on every page that draws the header, and 200 identical lines hide the
    // others.
    const report = (why) => {
      const key = `${href}|${why}`;
      if (seen.has(key)) return;
      seen.add(key);
      failures.push([file, href || "(no href)", why]);
    };

    if (label === null || text(label) === "") {
      report("a social link with no aria-label: the icon carries no text, so it has no accessible name");
    } else if (title !== null && text(title) !== text(label)) {
      report(`title ${JSON.stringify(text(title))} and aria-label ${JSON.stringify(text(label))} disagree`);
    }

    if (/<svg\b/i.test(tag) && !/aria-hidden\s*=\s*(?:"true"|'true'|true)/i.test(tag)) {
      report("a social icon that is not aria-hidden: the link is announced twice");
    }
  }
}

// A build that produced nothing, or a wrong working-directory, otherwise reads
// as a pass: no files, no failures, exit 0.
if (files === 0) {
  console.error(`no HTML found under ${root}`);
  process.exit(1);
}
if (anchors === 0) {
  console.error(`no rel="me" links found under ${root}`);
  process.exit(1);
}

console.log(`checked ${anchors} social links across ${files} files`);
if (failures.length) {
  console.error(`\n${failures.length} unnamed:\n`);
  for (const [file, what, why] of failures) console.error(`  ${file}\n    ${what}  (${why})`);
  process.exit(1);
}
console.log("every social link has an accessible name, and its title agrees");
console.log("every social icon is hidden from assistive technology");
