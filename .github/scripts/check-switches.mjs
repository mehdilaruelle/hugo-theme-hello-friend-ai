// Every truth test on a boolean param goes through switch.html: a template reads
// a quoted "false" as true.
//
//   node check-switches.mjs <theme-root>

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.argv[2] || '.';
const BOOL = String.raw`(?:true|false|"(?:true|false|0)"|'(?:true|false|0)')`;

function* walk(dir, exts) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', '.git', 'resources'].includes(e.name) && !e.name.startsWith('public')) yield* walk(full, exts); }
    else if (exts.some((x) => e.name.endsWith(x))) yield full;
  }
}

// exampleSite documents some switches commented out, so those count.
const siteSwitches = new Set();
for (const file of walk(root, ['.toml'])) {
  if (relative(root, file).split(sep).join('/').startsWith('.github/')) continue;
  let table = '';
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.replace(/^\s*#\s?/, '');
    const t = line.match(/^\s*\[\[?\s*([A-Za-z0-9_.]+)\s*\]\]?\s*$/);
    if (t) { table = t[1].toLowerCase(); continue; }
    const kv = line.match(new RegExp(String.raw`^\s*([A-Za-z][A-Za-z0-9_.]*)\s*=\s*${BOOL}\s*(#.*)?$`));
    if (!kv) continue;
    const path = (table ? table + '.' : '') + kv[1].toLowerCase();
    if (path.startsWith('params.')) siteSwitches.add(path.slice('params.'.length));
  }
}

const pageSwitches = new Set();
for (const dir of ['exampleSite/content', 'showcaseSite/content', 'archetypes']) {
  for (const file of walk(join(root, dir), ['.md'])) {
    const fm = readFileSync(file, 'utf8').match(/^(\+\+\+|---)\r?\n([\s\S]*?)\r?\n\1/);
    if (!fm) continue;
    for (const m of fm[2].matchAll(new RegExp(String.raw`^([A-Za-z][A-Za-z0-9_]*)\s*[:=]\s*${BOOL}\s*$`, 'gm'))) pageSwitches.add(m[1].toLowerCase());
  }
}

// A param compared with true or false is a switch even if no config or doc says
// so -- related.enable was only ever that.
const PATH = String.raw`\(?\s*(?:\$\.Site\.Params|\.Site\.Params|site\.Params)\.([A-Za-z0-9_.]+)\s*\)?`;
const COMPARED = new RegExp(String.raw`\b(?:eq|ne)\s+(?:${PATH}\s+(?:true|false)|(?:true|false)\s+${PATH})`, 'g');
for (const file of walk(join(root, 'layouts'), ['.html', '.xml', '.json'])) {
  for (const m of readFileSync(file, 'utf8').matchAll(COMPARED)) siteSwitches.add((m[1] || m[2]).toLowerCase());
}

// Reading the value is not a truth test: footer.trademark is also its text.
const ok = (before, after) =>
  /partial\s+"switch\.html"\s*\(?\s*$/.test(before) ||
  /printf\s+"[^"]*"\s*$/.test(before) ||
  (/\{\{-?\s*$/.test(before) && /^\s*-?\}\}/.test(after));

const problems = [];
let reads = 0;
for (const file of walk(join(root, 'layouts'), ['.html', '.xml', '.json'])) {
  const rel = relative(root, file).split(sep).join('/');
  const text = readFileSync(file, 'utf8').replace(/\{\{-?\s*\/\*[\s\S]*?\*\/\s*-?\}\}/g, (c) => c.replace(/[^\n]/g, ' '));
  text.split(/\r?\n/).forEach((line, i) => {
    const check = (m, label) => {
      reads++;
      if (!ok(line.slice(0, m.index), line.slice(m.index + m[0].length))) problems.push(`${rel}:${i + 1}  ${label}  read without switch.html`);
    };
    for (const m of line.matchAll(/(?:\.Site\.Params|site\.Params|\$\.Site\.Params)\.([A-Za-z0-9_.]+)/g)) {
      if (siteSwitches.has(m[1].toLowerCase())) check(m, `site.Params.${m[1]}`);
    }
    for (const m of line.matchAll(/(?<![A-Za-z])\.Params\.([A-Za-z0-9_]+)\b/g)) {
      if (/Site$|site$/.test(line.slice(Math.max(0, m.index - 5), m.index))) continue;
      if (pageSwitches.has(m[1].toLowerCase())) check(m, `.Params.${m[1]}`);
    }
  });
}

for (const p of problems) console.error('  ' + p);
if (siteSwitches.size === 0 && pageSwitches.size === 0) {
  console.error(`  no switches read from the configs or content under ${root}`);
  process.exit(1);
}
console.log(`checked ${reads} reads of ${siteSwitches.size} site and ${pageSwitches.size} page switches`);
console.log(problems.length ? `${problems.length} problem(s)` : 'every switch is read through switch.html');
process.exit(problems.length ? 1 : 0);
