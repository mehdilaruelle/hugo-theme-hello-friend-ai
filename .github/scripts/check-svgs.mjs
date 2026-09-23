// docs/svgs.md must list exactly the files in assets/svg/social/, each a single <svg>.
//   node check-svgs.mjs <theme-root>

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] || '.';
const dir = join(root, 'assets/svg/social');
const docPath = join(root, 'docs/svgs.md');

for (const path of [dir, docPath]) {
  if (!existsSync(path)) {
    console.error(`  no ${path}: is ${root} the theme root?`);
    process.exit(1);
  }
}

const problems = [];

const files = readdirSync(dir).filter((f) => !f.startsWith('.'));
const drawn = new Set();
for (const f of files) {
  const m = f.match(/^([a-z0-9][a-z0-9-]*)\.svg$/);
  if (!m) {
    problems.push(`assets/svg/social/${f}: svg.html can never ask for this name`);
    continue;
  }
  drawn.add(m[1]);
  const body = readFileSync(join(dir, f), 'utf8').trim();
  const single = /^<svg[\s>][\s\S]*<\/svg>$/.test(body)
    && body.indexOf('</svg>') === body.lastIndexOf('</svg>');
  if (!single || body.includes('{{')) {
    problems.push(`assets/svg/social/${f}: not a single <svg> element`);
  }
}

// A list item's first word, linked or bare, is the name.
const listed = new Set();
readFileSync(docPath, 'utf8').split(/\r?\n/).forEach((line) => {
  const m = line.match(/^- \[?([A-Za-z0-9][A-Za-z0-9-]*)\]?(?:\(|\s|$)/);
  if (m) listed.add(m[1].toLowerCase());
});

for (const name of drawn) {
  if (!listed.has(name)) problems.push(`${name}: drawn, but docs/svgs.md does not list it`);
}
for (const name of listed) {
  if (!drawn.has(name)) problems.push(`${name}: docs/svgs.md lists it, but assets/svg/social/${name}.svg does not exist`);
}
if (!drawn.has('link')) problems.push('assets/svg/social/link.svg is missing: the fallback glyph');

for (const p of problems) console.error('  ' + p);

if (drawn.size === 0) {
  console.error(`  no icons read from ${dir}`);
  process.exit(1);
}

console.log(`checked ${drawn.size} icon files against ${listed.size} names in docs/svgs.md`);
console.log(problems.length ? `${problems.length} problem(s)` : 'the document lists exactly the icons the theme draws');
process.exit(problems.length ? 1 : 0);
