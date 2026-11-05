// What search.js's fold() ignores, and what it must not. Run on the source:
// fold() is private to the minified bundle.
//
//   node .github/scripts/check-search-fold.mjs <assets/js/search.js>

import { readFileSync } from "node:fs";

const file = process.argv[2] || "assets/js/search.js";
const src = readFileSync(file, "utf8");
const body = src.match(/function fold\(s\) \{[\s\S]*?\n  \}/);
if (!body) {
  console.log(`  BAD  no function fold(s) in ${file}`);
  process.exit(1);
}
const fold = new Function(`${body[0]}; return fold;`)();

// [query, text, should the query find the text]
const cases = [
  ["RESUME", "Résumé", true],
  ["تتكون", "تتكوّن", true],    // Arabic, typed without the shadda
  ["مرحبا", "مرحـــبا", true],   // tatweel
  ["シ", "ジ", false],          // a voicing mark makes another kana
  ["가", "각", true],           // a Hangul prefix still matches
];

let bad = 0;
for (const [q, text, want] of cases) {
  const got = fold(text).includes(fold(q));
  if (got !== want) {
    console.log(`  BAD  "${q}" ${want ? "should" : "should not"} find "${text}" (fold: "${fold(q)}" in "${fold(text)}")`);
    bad++;
  }
}
if (bad) process.exit(1);
console.log(`  fold() passes its ${cases.length} cases`);
