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

// Not \b: \brel would match the rel in data-rel.
export const NAME = "(?<![-\\w])";

// Quoted, single-quoted or bare (--minify drops quotes); value in group 1, 2 or 3.
export const attrSource = (name) =>
  `${NAME}${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`;

export const attrRe = (name, flags = "i") => new RegExp(attrSource(name), flags);

export const value = (m) => (m ? (m[1] ?? m[2] ?? m[3] ?? "") : null);

// A whole start tag: a quoted value may hold ">" (the minifier leaves "<x>" raw there).
export const tagRe = (name) => new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, "gi");
