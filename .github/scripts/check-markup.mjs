// A Go template that fails prints the failure and the build still exits 0, so
// %!q(bool=true) shipped in a heading past every other checker.
//
//   node check-markup.mjs <built-site>

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2];
if (!root) {
  console.error('usage: node check-markup.mjs <built-site>');
  process.exit(1);
}

const artifacts = [
  // A verb is not always lowercase: %X, %U, %T and %G are Go verbs too, and
  // %!(NOVERB) carries none at all.
  [/%![a-zA-Z]?\(/g, 'a printf format error'],
  [/ZgotmplZ/g, 'a URL html/template refused'],
  [/(?:<|&lt;)no value(?:>|&gt;)/g, 'a nil the template printed'],
  [/<video(?![\s>])/g, 'an attribute glued to the video tag'],
];

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(html|xml|json|txt|md)$/.test(entry)) files.push(full);
  }
};
walk(root);

const failures = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const [pattern, what] of artifacts) {
    for (const m of text.matchAll(pattern)) {
      // Minified output is one line, so the line number is what makes this
      // findable.
      const line = text.slice(0, m.index).split('\n').length;
      failures.push([`${relative(root, file)}:${line}`, m[0], what]);
    }
  }
}

// A wrong path is a directory that exists and holds nothing, over which the
// loop above is vacuously true.
if (files.length === 0) {
  console.error(`no pages under ${root}: nothing was checked`);
  process.exit(1);
}

console.log(`checked ${files.length} built files`);
if (failures.length) {
  console.error(`\n${failures.length} artifact(s):\n`);
  for (const [where, found, what] of failures) console.error(`  ${where}\n    ${found}  (${what})`);
  process.exit(1);
}
console.log('no page carries a Go template that failed silently');
