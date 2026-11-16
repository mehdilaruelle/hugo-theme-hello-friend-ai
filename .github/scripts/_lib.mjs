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

// Quoted, bare (--minify) or valueless; a name follows whitespace, so data:x and title="x=0" are not x.
const ATTR = /\s+([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/y;

// A start tag's attributes, lowercase name to value; the first duplicate wins.
export function attrs(tag) {
  const out = new Map();
  ATTR.lastIndex = tag.search(/[\s\/>]|$/);
  for (let m; (m = ATTR.exec(tag)); ) {
    const name = m[1].toLowerCase();
    if (!out.has(name)) out.set(name, m[2] ?? m[3] ?? m[4] ?? "");
  }
  return out;
}

export const attr = (tag, name) => attrs(tag).get(name) ?? null;

// A whole token of a space-separated value: "post-info" is not "post-infobar".
export const hasToken = (value, token) => (value ?? "").split(/\s+/).includes(token);

// A whole start tag: a quoted value may hold ">" (the minifier leaves "<x>" raw there).
export const tagRe = (name) => new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, "gi");
