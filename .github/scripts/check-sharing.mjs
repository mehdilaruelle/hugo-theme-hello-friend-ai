// Asserts two things about the sharing links.
//
// One, that each parses into the parameters it means. Encoding is not the risk
// -- Go escapes the values inside an href -- but a literal ";" between
// parameters is a separator that is not one, and swallows everything after it.
//
// Two, that each http(s) anchor carries rel="nofollow". mailto: and whatsapp:
// are exempt: no link equity to withhold on a scheme no crawler follows.
//
//   node .github/scripts/check-sharing.mjs <public-dir>

import { readFileSync } from "node:fs";
import { walk, NAME, attrRe } from "./_lib.mjs";

const PROVIDERS = /facebook|twitter|tumblr|pinterest|linkedin|reddit|xing|telegram|vk\.com|whatsapp|hacker/i;

// NAME and the quoting rules are _lib.mjs's, where the data-rel bug that
// \brel let through is recorded.
const HREF = attrRe("href", "gi");

// The opening tag whole, so rel can be read beside href. Matched on the class
// the stylesheet also hangs the button off, so the two cannot drift apart.
const ANCHOR = new RegExp(`<a\\b[^>]*${NAME}class\\s*=\\s*(?:"[^"]*resp-sharing-button__link[^"]*"|'[^']*resp-sharing-button__link[^']*'|[^\\s>]*resp-sharing-button__link[^\\s>]*)[^>]*>`, "gi");
const REL = attrRe("rel");

const root = process.argv[2] || "public";
const failures = [];
let checked = 0;
let anchors = 0;
let files = 0;
const seen = new Set();
const seenFollowed = new Set();

for (const file of walk(root, ".html")) {
  const html = readFileSync(file, "utf8").replace(/\n/g, " ");
  files++;
  for (const tag of html.matchAll(ANCHOR)) {
    anchors++;
    const rel = (tag[0].match(REL) ?? []).slice(1).find((v) => v !== undefined) ?? "";
    const target = (tag[0].match(new RegExp(HREF.source, "i")) ?? []).slice(1).find((v) => v !== undefined) ?? "";
    if (!/^https?:/i.test(target.replace(/&amp;/g, "&"))) continue;
    if (!rel.split(/\s+/).includes("nofollow")) {
      // One report per destination host rather than per page: the same button
      // is wrong on every article, and 200 identical lines hide the others.
      const key = target.replace(/&amp;/g, "&").split("?")[0];
      if (!seenFollowed.has(key)) {
        seenFollowed.add(key);
        failures.push([file, key, "a sharing link without rel=\"nofollow\""]);
      }
    }
  }
  for (const m of html.matchAll(HREF)) {
    const raw = (m[1] ?? m[2] ?? m[3] ?? "").replace(/&amp;/g, "&");
    if (!raw.startsWith("https://")) continue;
    if (!PROVIDERS.test(raw)) continue;
    let url;
    try { url = new URL(raw); } catch { failures.push([file, raw, "not a valid URL"]); continue; }
    checked++;
    for (const [key, value] of url.searchParams) {
      // A parameter value holding "=" after a ";" is a separator that was never
      // one: the next parameter has been absorbed.
      if (/;[^;=]*=/.test(value)) {
        const k = `${url.host}|${key}`;
        if (!seen.has(k)) { seen.add(k); failures.push([file, `${url.host} ?${key}=`, "a ';' separator swallowed the parameters after it"]); }
      }
    }
  }
}

// A build that produced nothing, or a wrong working-directory, otherwise reads
// as a pass: no files, no failures, exit 0.
if (files === 0) {
  console.error(`no HTML found under ${root}`);
  process.exit(1);
}

console.log(`checked ${checked} sharing links and ${anchors} sharing anchors`);
if (failures.length) {
  console.error(`\n${failures.length} broken:\n`);
  for (const [file, what, why] of failures) console.error(`  ${file}\n    ${what}  (${why})`);
  process.exit(1);
}
console.log("every parameter is separated by an ampersand");
console.log("every http(s) sharing link is nofollow");
