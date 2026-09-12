// Every boolean param has to be read through switch.html.
//
// A Go template reads any non-empty string as true, so a bare if on a switch
// turns it on for the quoted "false" a TOML or YAML value produces. The CI step
// in links.yml asserts that for the switches it lists; this catches a switch
// nobody has listed yet.
//
// A switch is any key the demo configs, config-quoted.toml or the demo content
// set to true or false. Paths are compared whole, so params.author the name is
// not mistaken for params.footer.author the switch.
//
//   node check-switches.mjs <theme-root>

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.argv[2] || '.';

function* walk(dir, exts) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', '.git', 'resources'].includes(e.name) && !e.name.startsWith('public')) yield* walk(full, exts); }
    else if (exts.some((x) => e.name.endsWith(x))) yield full;
  }
}

// Site params: full path under [params], commented-out examples included, since
// exampleSite documents several switches that way.
const siteSwitches = new Set();
for (const file of walk(root, ['.toml'])) {
  const rel = relative(root, file).split(sep).join('/');
  if (rel.startsWith('.github/')) continue;
  let table = '';
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.replace(/^\s*#\s?/, '');
    const t = line.match(/^\s*\[\[?\s*([A-Za-z0-9_.]+)\s*\]\]?\s*$/);
    if (t) { table = t[1].toLowerCase(); continue; }
    const kv = line.match(/^\s*([A-Za-z][A-Za-z0-9_.]*)\s*=\s*(true|false|"(?:true|false|0)")\s*(#.*)?$/);
    if (!kv) continue;
    const path = (table ? table + '.' : '') + kv[1].toLowerCase();
    if (path.startsWith('params.')) siteSwitches.add(path.slice('params.'.length));
  }
}

// Front matter: keys the demo content and archetypes set to a boolean.
const pageSwitches = new Set();
for (const dir of ['exampleSite/content', 'showcaseSite/content', 'archetypes']) {
  for (const file of walk(join(root, dir), ['.md'])) {
    const fm = readFileSync(file, 'utf8').match(/^(\+\+\+|---)\r?\n([\s\S]*?)\r?\n\1/);
    if (!fm) continue;
    for (const m of fm[2].matchAll(/^([A-Za-z][A-Za-z0-9_]*)\s*[:=]\s*(true|false)\s*$/gm)) pageSwitches.add(m[1].toLowerCase());
  }
}

// A param a template compares with true or false is a switch whatever the docs
// say. related.enable was set by no config and named by no doc, and only this
// found it.
const PATH = String.raw`(?:\$\.Site\.Params|\.Site\.Params|site\.Params)\.([A-Za-z0-9_.]+)`;
const COMPARED = new RegExp(String.raw`\b(?:eq|ne)\s+(?:${PATH}\s+(?:true|false)|(?:true|false)\s+${PATH})`, 'g');
for (const file of walk(join(root, 'layouts'), ['.html', '.xml', '.json'])) {
  for (const m of readFileSync(file, 'utf8').matchAll(COMPARED)) siteSwitches.add((m[1] || m[2]).toLowerCase());
}

// The bug is a truth test, so reading the value is fine: printed on its own,
// or stringified by printf. footer.trademark is a switch and also the text.
const ok = (before, after) =>
  /partial\s+"switch\.html"\s*\(?\s*$/.test(before) ||
  /printf\s+"[^"]*"\s*$/.test(before) ||
  (/\{\{-?\s*$/.test(before) && /^\s*-?\}\}/.test(after));
const problems = [];
let reads = 0;

for (const file of walk(join(root, 'layouts'), ['.html', '.xml', '.json'])) {
  const rel = relative(root, file).split(sep).join('/');
  // Comments often name a param in prose; blank them, keeping the newlines.
  const text = readFileSync(file, 'utf8').replace(/\{\{-?\s*\/\*[\s\S]*?\*\/\s*-?\}\}/g, (c) => c.replace(/[^\n]/g, ' '));
  text.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/(?:\.Site\.Params|site\.Params|\$\.Site\.Params)\.([A-Za-z0-9_.]+)/g)) {
      const path = m[1].toLowerCase();
      if (!siteSwitches.has(path)) continue;
      reads++;
      if (!ok(line.slice(0, m.index), line.slice(m.index + m[0].length))) problems.push(`${rel}:${i + 1}  site.Params.${m[1]}  read without switch.html`);
    }
    for (const m of line.matchAll(/(?<![A-Za-z])\.Params\.([A-Za-z0-9_]+)\b/g)) {
      if (/Site$|site$/.test(line.slice(Math.max(0, m.index - 5), m.index))) continue;
      const key = m[1].toLowerCase();
      if (!pageSwitches.has(key)) continue;
      reads++;
      if (!ok(line.slice(0, m.index), line.slice(m.index + m[0].length))) problems.push(`${rel}:${i + 1}  .Params.${m[1]}  read without switch.html`);
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
