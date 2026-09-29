// Asserts the size the image partial gives each SVG fixture: a wrong read
// still builds, and only shows as a box of the wrong shape.
//
//   node .github/scripts/check-svg-sizing.mjs <public-dir>
import { readFileSync } from "node:fs";
import { join } from "node:path";

// null: nothing the page can trust, so no attribute at all.
const EXPECTED = {
  "commas.svg": "1400x700",
  "exponent.svg": "1400x700",
  "stroke-width.svg": "1400x700",
  "root-px.svg": "120x80",
  "root-percent.svg": "1400x350",
  "root-em.svg": null,
  "no-viewbox.svg": null,
  "empty-viewbox.svg": null,
  "dot-width.svg": null,
  "dotted-width.svg": null,
  "trailing-junk.svg": null,
};

const root = process.argv[2] || "public";
const html = readFileSync(join(root, "svg-sizes", "index.html"), "utf8");
const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);

let bad = 0;
for (const [file, want] of Object.entries(EXPECTED)) {
  const tag = imgs.find((t) => t.includes(`/${file}`));
  if (!tag) {
    console.log(`  ${file}: BAD  not on the page`);
    bad++;
    continue;
  }
  const w = tag.match(/\swidth="?(\d+)/)?.[1];
  const h = tag.match(/\sheight="?(\d+)/)?.[1];
  const got = w || h ? `${w}x${h}` : null;
  const ok = got === want;
  console.log(`  ${file}: ${got ?? "unsized"}  ${ok ? "ok" : `BAD, want ${want ?? "unsized"}`}`);
  if (!ok) bad++;
}

console.log(bad ? `\n  ${bad} SVG(s) sized wrong` : "\n  every SVG reserves the box it will fill");
process.exit(bad ? 1 : 0);
