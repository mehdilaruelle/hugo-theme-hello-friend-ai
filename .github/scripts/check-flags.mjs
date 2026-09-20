// Every language in data/langFlags.yaml must name a flag the theme can draw.
//
// A language code is not a country code — Ukrainian is uk, Ukraine is ua — and
// naming the wrong one renders an empty square rather than falling back to the
// language code, because translation-link.html only falls back when the entry
// is missing.
//
// The .fi-* rules are no longer vendored, so this checks the files exist and
// that the ~530 vendored rules have not come back. What the BUILT site draws is
// check-flag-css.mjs's job.
//
//   node check-flags.mjs <theme-root>

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] || '.';

const read = (path) => {
  const full = join(root, path);
  if (!existsSync(full)) {
    console.error(`  no ${full}: is ${root} the theme root?`);
    process.exit(1);
  }
  return readFileSync(full, 'utf8');
};

const yaml = read('data/langFlags.yaml');
const scss = read('assets/scss/_flag-icons.scss');

const problems = [];
const entries = [];

// Every data line has to be understood. Reporting what could not be read is the
// point: a mapping this script skips is still one Hugo uses.
yaml.split(/\r?\n/).forEach((line, i) => {
  if (!line.trim() || line.trim().startsWith('#')) return;
  const m = line.match(/^\s*([a-z][a-z0-9-]*)\s*:\s*["']?([a-z][a-z0-9-]*)["']?\s*(?:#.*)?$/);
  if (!m) problems.push(`data/langFlags.yaml:${i + 1}: cannot read this line: ${line.trim()}`);
  else entries.push({ lang: m[1], flag: m[2] });
});

for (const { lang, flag } of entries) {
  for (const ratio of ['4x3', '1x1']) {
    if (!existsSync(join(root, 'assets/flags', ratio, `${flag}.svg`))) {
      problems.push(`${lang} -> ${flag}: assets/flags/${ratio}/${flag}.svg is missing`);
    }
  }
}

// Delete the partial and every flag box goes blank with nothing else failing.
if (!existsSync(join(root, 'layouts/_partials/flag-css.html'))) {
  problems.push('layouts/_partials/flag-css.html is missing: nothing would emit a .fi-* rule');
}

// Comments stripped first: the file's prose names the rules it no longer
// carries. Not \b either — it matches before a hyphen, so .fi-es-ct would
// answer for .fi-es.
const code = scss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
const vendored = [...code.matchAll(/\.fi-([a-z]{2}(?:-[a-z0-9]+)?)(?![a-z0-9-])/g)];
if (vendored.length) {
  problems.push(
    `assets/scss/_flag-icons.scss carries ${vendored.length} .fi-* rule(s) again ` +
    `(${[...new Set(vendored.map((m) => m[1]))].slice(0, 5).join(', ')}…): ` +
    'those ship to every site including monolingual ones. They belong in flag-css.html.');
}

for (const p of problems) console.error('  ' + p);

if (entries.length === 0) {
  console.error(`  no mappings read from ${join(root, 'data/langFlags.yaml')}`);
  process.exit(1);
}

console.log(`checked ${entries.length} language-to-flag mappings, and that the vendored .fi-* rules have not come back`);
console.log(problems.length ? `${problems.length} problem(s)` : 'every one names a flag the theme can draw');
process.exit(problems.length ? 1 : 0);
