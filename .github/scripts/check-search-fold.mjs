// Asserts what search.js's fold() ignores, and what it must not: run on the
// source, since the bundle is minified and fold() is private to its closure.
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
  ["resume", "résumé", true],                  // Latin accents
  ["RESUME", "Résumé", true],                  // and case
  ["تتكون", "تتكوّن", true],                     // Arabic, typed without the shadda
  ["كتاب", "كِتَابٌ", true],                      // harakat
  ["مرحبا", "مرحـــبا", true],                   // tatweel
  ["シ", "ジ", false],                          // a voicing mark is a different kana
  ["ジ", "ジ", true],                           // and still finds itself
  ["가", "각", true],                           // a Hangul prefix still matches
  ["각", "가", false],                          // the final consonant is not dropped
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
console.log(`  fold() ignores accents and Arabic marks, and keeps kana voicing marks, Hangul still matching letter by letter (${cases.length} cases)`);
