// Helpers shared by the check scripts.

import { readdirSync } from "node:fs";
import { join } from "node:path";

// Every file under dir, or only those ending in ext.
export function* walk(dir, ext) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full, ext);
    else if (!ext || full.endsWith(ext)) yield full;
  }
}

// One attribute after the tag name: quoted, single-quoted, bare (--minify drops
// quotes) or valueless. A name starts after whitespace and a quoted value is
// consumed whole, so data:x="0" and title="x=0" never read as x.
const ATTR = /\s+([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/y;

// One start tag's attributes, lowercase name to value; the first of a repeated
// name wins, as in a browser. "" (no tag found) has none.
export function attrs(tag) {
  const out = new Map();
  ATTR.lastIndex = tag.match(/^<?[^\s\/>]*/)[0].length;
  for (let m; (m = ATTR.exec(tag)); ) {
    const name = m[1].toLowerCase();
    if (!out.has(name)) out.set(name, m[2] ?? m[3] ?? m[4] ?? "");
  }
  return out;
}

// One attribute of a start tag, or null when it has none.
export const attr = (tag, name) => attrs(tag).get(name) ?? null;

// A whole start tag: a quoted value may hold ">" (the minifier leaves "<x>" raw there).
export const tagRe = (name) => new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, "gi");
