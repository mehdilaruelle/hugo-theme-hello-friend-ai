// Every key en.toml defines has to exist in the other twenty translations.
//
// i18n.html looks a key up with an English fallback, so a translation that
// never got the key renders English rather than failing: the build is green,
// no warning is printed, and the only place the omission shows is on the page
// of somebody who does not read English. That is how relatedPosts shipped in
// en.toml alone while headingAnchor, added one release earlier, got all 21.
//
//   node check-i18n.mjs <theme-root>

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] || '.';
const dir = join(root, 'i18n');

// CLDR plural categories. A language picks the ones it needs — Russian says
// one/few/many, Japanese says other — so these are the subkeys that legitimately
// differ between files. Every other subkey names a distinct string and must not.
const PLURAL = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);

const problems = [];

// Line-based on purpose: these files are flat [section] + key = "value" and
// nothing else, so a line this cannot read is a line worth reporting rather
// than a parser to grow.
const parse = (file) => {
  const sections = new Map();
  let current = null;

  readFileSync(join(dir, file), 'utf8').split(/\r?\n/).forEach((line, i) => {
    const where = `i18n/${file}:${i + 1}`;
    if (!line.trim() || line.trim().startsWith('#')) return;

    const section = line.match(/^\[([A-Za-z0-9_-]+)\]\s*(?:#.*)?$/);
    if (section) {
      current = section[1];
      if (sections.has(current)) problems.push(`${where}: [${current}] is declared twice`);
      else sections.set(current, new Map());
      return;
    }

    const entry = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*"(.*)"\s*(?:#.*)?$/);
    if (!entry) {
      problems.push(`${where}: cannot read this line: ${line.trim()}`);
      return;
    }
    if (!current) {
      problems.push(`${where}: ${entry[1]} sits outside any section`);
      return;
    }
    sections.get(current).set(entry[1], entry[2]);
  });

  return sections;
};

// {{ .Count }} and friends. A translation that drops one renders a sentence
// with the number missing from it.
const placeholders = (section) => {
  const found = new Set();
  for (const value of section.values()) {
    for (const m of value.matchAll(/{{-?\s*\.([A-Za-z0-9_.]+)/g)) found.add(m[1]);
  }
  return found;
};

const files = readdirSync(dir).filter((f) => f.endsWith('.toml')).sort();
if (!files.includes('en.toml')) {
  console.error(`  no ${join(dir, 'en.toml')}: is ${root} the theme root?`);
  process.exit(1);
}

const en = parse('en.toml');

for (const file of files.filter((f) => f !== 'en.toml')) {
  const lang = parse(file);

  for (const [key, reference] of en) {
    const translated = lang.get(key);
    if (!translated) {
      problems.push(`i18n/${file}: [${key}] is missing, so this language renders the English string`);
      continue;
    }

    for (const subkey of reference.keys()) {
      if (!PLURAL.has(subkey) && !translated.has(subkey)) {
        problems.push(`i18n/${file}: [${key}] has no ${subkey}`);
      }
    }
    if ([...reference.keys()].some((k) => PLURAL.has(k)) &&
        ![...translated.keys()].some((k) => PLURAL.has(k))) {
      problems.push(`i18n/${file}: [${key}] carries no plural form at all`);
    }

    const have = placeholders(translated);
    for (const p of placeholders(reference)) {
      if (!have.has(p)) problems.push(`i18n/${file}: [${key}] drops {{ .${p} }}`);
    }
  }

  for (const key of lang.keys()) {
    if (!en.has(key)) problems.push(`i18n/${file}: [${key}] is not in en.toml — nothing looks it up`);
  }
}

// The other direction: a template can name a key no file defines, and the
// fallback hides that too.
const templates = [];
const walk = (path) => {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) templates.push(full);
  }
};
walk(join(root, 'layouts'));

for (const path of templates) {
  // Without this the examples in i18n.html's own doc comment count as calls.
  const html = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

  // "key" on its own is just a dict field — font-fallback.html has three of
  // them — so the partial has to be named. Every caller puts the key on the
  // same line as the partial.
  const calls = [
    ...html.matchAll(/partial\s+"i18n\.html"\s+\(dict\s+"key"\s+"([A-Za-z0-9_-]+)"/g),
    ...html.matchAll(/\bi18n\s+"([A-Za-z0-9_-]+)"/g),
  ];
  for (const m of calls) {
    if (!en.has(m[1])) problems.push(`${path}: asks for [${m[1]}], which en.toml does not define`);
  }
}

for (const p of problems) console.error('  ' + p);

if (en.size === 0) {
  console.error(`  no keys read from ${join(dir, 'en.toml')}`);
  process.exit(1);
}

console.log(`checked ${en.size} keys across ${files.length} languages and ${templates.length} templates`);
console.log(problems.length ? `${problems.length} problem(s)` : 'every language carries every key');
process.exit(problems.length ? 1 : 0);
