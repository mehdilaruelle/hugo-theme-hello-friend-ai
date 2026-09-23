// What the checks share. Each used to carry its own copy; the comment in
// check-sharing.mjs records a \brel that matched data-rel, which is the kind
// of bug a single copy fixes once.

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

// An attribute name starts where no name character precedes it. \b is not
// that test: there is a word boundary between "-" and "r" too, so \brel
// matched the rel inside data-rel, and \blabel the label inside aria-label.
export const NAME = "(?<![-\\w])";

// One attribute, quoted, single-quoted or bare: --minify drops the quotes it
// can, and a pattern requiring them checked 128 of the showcase's 136 sharing
// links in silence. The value is in group 1, 2 or 3.
export const attrSource = (name) =>
  `${NAME}${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`;

export const attrRe = (name, flags = "i") => new RegExp(attrSource(name), flags);

// The value of a match of attrRe, whichever quoting it used.
export const value = (m) => (m ? (m[1] ?? m[2] ?? m[3] ?? "") : null);
