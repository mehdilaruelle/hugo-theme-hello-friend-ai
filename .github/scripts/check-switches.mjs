// Every truth test on a boolean param goes through switch.html: a template reads
// a quoted "false" as true.
//
//   node check-switches.mjs <theme-root>

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.argv[2] || '.';
// Not "0": a quoted 0 is how a number is set too, imageMaxWidth = "0".
const BOOL = String.raw`(?:true|false|"(?:true|false)"|'(?:true|false)')`;

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

// Every file under layouts/ is a template, whatever its format: robots.txt read
// its AI policy raw, and a list of extensions is how it was missed.
const TEMPLATES = [''];

// `$ai := site.Params.ai` then `$ai.train` is a read of ai.train. Rewritten to
// the full path so both passes below see it; `via` keeps the name for the report.
const PARAMS = String.raw`(?:\$\.Site\.Params|\.Site\.Params|site\.Params)`;
const resolveAliases = (text) => {
  const alias = new Map();
  const via = [];
  const lines = text.split('\n').map((line, i) => {
    const use = (l) => l.replace(/\$([A-Za-z_]\w*)((?:\.[A-Za-z0-9_]+)+)/g, (all, name, rest) => {
      if (!alias.has(name)) return all;
      (via[i] ||= new Set()).add('$' + name);
      return 'site.Params' + (alias.get(name) ? '.' + alias.get(name) : '') + rest;
    });
    let out = use(line);
    for (const m of out.matchAll(new RegExp(String.raw`\$([A-Za-z_]\w*)\s*:?=\s*\(?\s*${PARAMS}((?:\.[A-Za-z0-9_]+)*)`, 'g'))) {
      alias.set(m[1], m[2].slice(1));
    }
    return use(out);
  });
  return { text: lines.join('\n'), via };
};

// A param compared with true or false is a switch even if no config or doc says
// so -- related.enable was only ever that.
const PATH = String.raw`\(?\s*${PARAMS}\.([A-Za-z0-9_.]+)\s*\)?`;
const COMPARED = new RegExp(String.raw`\b(?:eq|ne)\s+(?:${PATH}\s+(?:true|false)|(?:true|false)\s+${PATH})`, 'g');
// And one already read through switch.html, set by a demo or not: site.Params.math.
const PAGE = String.raw`(?<![A-Za-z])(?:\$?\.Page)?`;
const VIA = new RegExp(String.raw`partial\s+"switch\.html"\s*\(?\s*(?:(?:\$\.Site|\.Site|site)\.Params\.([A-Za-z0-9_.]+)|${PAGE}\.Params\.([A-Za-z0-9_]+)|${PAGE}\.Param\s+"([A-Za-z0-9_]+)")`, 'g');
for (const file of walk(join(root, 'layouts'), TEMPLATES)) {
  const { text } = resolveAliases(readFileSync(file, 'utf8'));
  for (const m of text.matchAll(COMPARED)) siteSwitches.add((m[1] || m[2]).toLowerCase());
  for (const m of text.matchAll(VIA)) {
    if (m[1]) siteSwitches.add(m[1].toLowerCase());
    else pageSwitches.add((m[2] || m[3]).toLowerCase());
  }
}

// Reading the value is not a truth test: footer.trademark is also its text.
const ok = (before, after) =>
  /partial\s+"switch\.html"\s*\(?\s*$/.test(before) ||
  /printf\s+"[^"]*"\s*$/.test(before) ||
  (/\{\{-?\s*$/.test(before) && /^\s*-?\}\}/.test(after));

const problems = [];
let reads = 0;
for (const file of walk(join(root, 'layouts'), TEMPLATES)) {
  const rel = relative(root, file).split(sep).join('/');
  const stripped = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\{\{-?\s*\/\*[\s\S]*?\*\/\s*-?\}\}/g, (c) => c.replace(/[^\n]/g, ' '));
  const { text, via } = resolveAliases(stripped);
  text.split('\n').forEach((line, i) => {
    const check = (m, label) => {
      reads++;
      const through = via[i] ? ` (through ${[...via[i]].join(', ')})` : '';
      if (!ok(line.slice(0, m.index), line.slice(m.index + m[0].length))) problems.push(`${rel}:${i + 1}  ${label}${through}  read without switch.html`);
    };
    for (const m of line.matchAll(/(?:\.Site\.Params|site\.Params|\$\.Site\.Params)\.([A-Za-z0-9_.]+)/g)) {
      if (siteSwitches.has(m[1].toLowerCase())) check(m, `site.Params.${m[1]}`);
    }
    for (const m of line.matchAll(new RegExp(String.raw`${PAGE}\.Params\.([A-Za-z0-9_]+)\b`, 'g'))) {
      if (/Site$|site$/.test(line.slice(Math.max(0, m.index - 5), m.index))) continue;
      if (pageSwitches.has(m[1].toLowerCase())) check(m, `.Params.${m[1]}`);
    }
    // .Param looks in the page, then the site.
    for (const m of line.matchAll(new RegExp(String.raw`${PAGE}\.Param\s+"([A-Za-z0-9_]+)"`, 'g'))) {
      const key = m[1].toLowerCase();
      if (pageSwitches.has(key) || siteSwitches.has(key)) check(m, `.Param "${m[1]}"`);
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
