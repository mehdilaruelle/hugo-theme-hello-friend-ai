// Every key en.toml defines has to exist in the other twenty translations.
// i18n.html falls back to English, so a missing one builds green.
//
//   node check-i18n.mjs <theme-root>

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] || '.';
const dir = join(root, 'i18n');

// The only subkeys allowed to differ between files.
const PLURAL = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);

const problems = [];

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

const placeholders = (value) => {
  const found = new Set();
  for (const m of value.matchAll(/{{-?\s*\.([A-Za-z0-9_.]+)/g)) found.add(m[1]);
  return found;
};

// A form naming one cardinality may spell the number out, the number only.
const SPELLABLE = new Set(['zero', 'one', 'two']);
const COUNT = 'Count';

// Slavic `one` is 1, 21, 31 … and must carry it; Arabic's is exactly 1 and
// declares `two`, which the Slavic languages do not.
const spellsOutOne = (sections) => {
  let ranged = false;
  for (const forms of sections.values()) {
    if (forms.has('two')) return true;
    if (forms.has('few') || forms.has('many')) ranged = true;
  }
  return !ranged;
};

const files = readdirSync(dir).filter((f) => f.endsWith('.toml')).sort();
if (!files.includes('en.toml')) {
  console.error(`  no ${join(dir, 'en.toml')}: is ${root} the theme root?`);
  process.exit(1);
}

const en = parse('en.toml');

for (const file of files.filter((f) => f !== 'en.toml')) {
  const lang = parse(file);
  const spellable = spellsOutOne(lang) ? SPELLABLE : new Set(['zero', 'two']);

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
    for (const subkey of translated.keys()) {
      if (!PLURAL.has(subkey) && !reference.has(subkey)) {
        problems.push(`i18n/${file}: [${key}] has a ${subkey} en.toml does not — nothing looks it up`);
      }
    }
    if ([...reference.keys()].some((k) => PLURAL.has(k)) &&
        ![...translated.keys()].some((k) => PLURAL.has(k))) {
      problems.push(`i18n/${file}: [${key}] carries no plural form at all`);
    }

    // Per form, not per section: a form that kept the number would otherwise
    // cover for the one that lost it.
    const counted = new Set();
    for (const [subkey, value] of reference) {
      if (PLURAL.has(subkey)) {
        for (const p of placeholders(value)) counted.add(p);
        continue;
      }
      const mine = translated.get(subkey);
      if (mine === undefined) continue; // already reported above
      const have = placeholders(mine);
      for (const p of placeholders(value)) {
        if (!have.has(p)) problems.push(`i18n/${file}: [${key}] ${subkey} drops {{ .${p} }}`);
      }
    }
    for (const [subkey, value] of translated) {
      if (!PLURAL.has(subkey)) continue;
      const have = placeholders(value);
      for (const p of counted) {
        if (p === COUNT && spellable.has(subkey)) continue;
        if (!have.has(p)) problems.push(`i18n/${file}: [${key}] ${subkey} drops {{ .${p} }}`);
      }
    }
  }

  for (const key of lang.keys()) {
    if (!en.has(key)) problems.push(`i18n/${file}: [${key}] is not in en.toml — nothing looks it up`);
  }
}

// The other direction: a template naming a key no file defines. Every file
// under layouts/ is a template, .html or not.
const templates = [];
const walk = (path) => {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) walk(full);
    else templates.push(full);
  }
};
walk(join(root, 'layouts'));

// A plural category is not an id of its own: Hugo folds one/other into plural
// forms of the parent, so readingTime.one resolves to nothing.
const defined = (key) => {
  const [section, subkey] = key.split('.');
  if (!en.has(section)) return false;
  if (subkey === undefined) return true;
  return !PLURAL.has(subkey) && en.get(section).has(subkey);
};

for (const path of templates) {
  // Comments stripped, or i18n.html's own doc examples count as calls.
  const template = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

  // The partial has to be named: "key" alone is an ordinary dict field, as in
  // font-fallback.html.
  const calls = [
    ...template.matchAll(/partial\s+"i18n\.html"\s+\(dict\s+"key"\s+"([A-Za-z0-9_.-]+)"/g),
    ...template.matchAll(/\bi18n\s+"([A-Za-z0-9_.-]+)"/g),
  ];
  for (const m of calls) {
    if (!defined(m[1])) problems.push(`${path}: asks for [${m[1]}], which en.toml does not define`);
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
