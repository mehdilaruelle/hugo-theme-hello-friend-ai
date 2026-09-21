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
    // i18n.html falls back on `not $t`, so an empty string renders the English
    // literal and a whitespace one renders itself. Neither is a translation.
    if (!entry[2].trim()) {
      problems.push(`${where}: [${current}] ${entry[1]} has no text — empty renders the English fallback, whitespace renders as nothing`);
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

// CLDR 48: in these the form covers more than one count (21, 102, 10 …), so it
// carries the number. Not fr, pt or hi, whose `one` adds only 0.
const RANGED = {
  be: ['one'], br: ['one', 'two'], bs: ['one'], ceb: ['one'], dsb: ['one', 'two'],
  fil: ['one'], gd: ['one', 'two'], gv: ['one', 'two'], hr: ['one'], hsb: ['one', 'two'],
  is: ['one'], kw: ['two'], lt: ['one'], lv: ['zero', 'one'], mk: ['one'],
  prg: ['zero', 'one'], ru: ['one'], sgs: ['one'], sl: ['one', 'two'], sr: ['one'],
  tl: ['one'], tzm: ['one'], uk: ['one'],
};
const spellableIn = (file) => {
  const ranged = RANGED[file.replace(/\.toml$/, '').split('-')[0]] ?? [];
  return new Set([...SPELLABLE].filter((form) => !ranged.includes(form)));
};

// The plural categories a language actually needs, read from ICU rather than
// from a table kept by hand. Only the counts this theme renders matter -- a
// reading time in minutes and a word count -- so the sweep is over integers,
// which is also what keeps `many` out of es, fr, it and pt: theirs applies at
// 1000000 and nothing here counts that high. `other` is dropped because it is
// required of every language separately: ru and uk never select it for an
// integer, and Hugo still needs it as the form an uncovered count falls back to.
//
// ro shipped one and other only, so 2 to 19 fell through and rendered
// "6 de minute" where Romanian wants "6 minute".
const localeOf = (file) =>
  file.replace(/\.toml$/, '').replace(/^(pt|zh)-(\w+)$/, (m, a, b) => `${a}-${b.toUpperCase()}`);

const CATEGORY_SWEEP = 1000;

// Returns null for a language ICU does not know -- lmo, say -- rather than
// asserting some other language's rules against it.
const categoriesFor = (file) => {
  const tag = localeOf(file);
  if (Intl.PluralRules.supportedLocalesOf([tag]).length === 0) return null;
  const rules = new Intl.PluralRules(tag);
  const needed = new Map();
  for (let n = 0; n <= CATEGORY_SWEEP; n++) {
    const form = rules.select(n);
    if (form === 'other') continue;
    const seen = needed.get(form) ?? [];
    // A couple of examples, because one can mislead on its own: Romanian
    // selects few for 0 as well as for 2, which reads like a bug in this
    // check until the second number lands beside it.
    if (seen.length < 2) needed.set(form, [...seen, n]);
  }
  return needed;
};

const files = readdirSync(dir).filter((f) => f.endsWith('.toml')).sort();
if (!files.includes('en.toml')) {
  console.error(`  no ${join(dir, 'en.toml')}: is ${root} the theme root?`);
  process.exit(1);
}

const en = parse('en.toml');

// The reference file is a translation too, and nothing below checks it.
for (const [key, forms] of en) {
  if ([...forms.keys()].some((k) => PLURAL.has(k)) && !forms.has('other')) {
    problems.push(`i18n/en.toml: [${key}] has no other form, so a count the named forms do not cover resolves to nothing`);
  }
}

for (const file of files.filter((f) => f !== 'en.toml')) {
  const lang = parse(file);
  const spellable = spellableIn(file);
  const needed = categoriesFor(file);

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
    if ([...reference.keys()].some((k) => PLURAL.has(k)) && !translated.has('other')) {
      problems.push(`i18n/${file}: [${key}] has no other form, so this language renders the English string`);
    }

    // A section en.toml gives more than one form to is a counted one, and a
    // language that skips a category its own rules name renders the wrong
    // string for every count in that category -- silently, since `other`
    // catches them.
    const counted = [...reference.keys()].some((k) => PLURAL.has(k) && k !== 'other');
    if (counted && needed) {
      for (const [form, examples] of needed) {
        if (!translated.has(form)) {
          problems.push(
            `i18n/${file}: [${key}] has no ${form} form, which ${localeOf(file)} selects for ${examples.join(' and ')} — those counts fall through to other`,
          );
        }
      }
    }

    // Per form, not per section: a form that kept the number would otherwise
    // cover for the one that lost it.
    const countPlaceholders = new Set();
    for (const [subkey, value] of reference) {
      if (PLURAL.has(subkey)) {
        for (const p of placeholders(value)) countPlaceholders.add(p);
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
      for (const p of countPlaceholders) {
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
