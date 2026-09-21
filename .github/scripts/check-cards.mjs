// Asserts that the two halves of a social card name the same picture, and that
// the picture is one the build actually wrote. They are written by two
// partials, and used to read two different sources: a site setting
// params.images showed one image and named another on every page with a cover,
// and nothing failed.
//
// Agreeing is not enough on its own: `images` written as a string indexed the
// string, so both halves named https://example.com/105 -- one picture, named
// twice, and 404 both times. A card URL under the site's own base URL is
// therefore resolved against the files on disk, the way check-links.mjs does
// for href and src. Pass the base URL to turn that half on.
//
//   node .github/scripts/check-cards.mjs <public-dir> [base-url]

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

// Quoted, single-quoted or bare, because --minify drops the quotes it can. The
// lookbehind is the name test \b is not; check-sharing.mjs says why.
const META = /<meta\b[^>]*>/gi;
const ATTR = (name) =>
  new RegExp(`(?<![-\\w])${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");

const PROPERTY = ATTR("property");
const NAME = ATTR("name");
const CONTENT = ATTR("content");

function attr(tag, re) {
  const m = tag.match(re);
  return m ? (m[1] ?? m[2] ?? m[3] ?? "") : null;
}

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (full.endsWith(".html")) yield full;
  }
}

const root = process.argv[2] || "public";
const rootPath = resolve(root);
const baseUrl = process.argv[3];

// Only a URL under the site's own base URL names a file this build wrote; a
// remote card is somebody else's to serve, and is left alone.
let siteOrigin = null;
let prefix = "/";
if (baseUrl) {
  siteOrigin = new URL(baseUrl).origin;
  prefix = new URL(baseUrl).pathname || "/";
  if (!prefix.endsWith("/")) prefix += "/";
}

const exists = (p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
};

// The path under the public root a same-origin card URL names, or null when
// the URL belongs to somebody else. A URL that escapes the baseURL path
// resolves to null-the-other-way -- "" -- and is reported, because that is
// exactly the shape absURL leaves behind on a site served from a subpath.
function local(url) {
  if (!siteOrigin) return null;
  let u;
  try {
    u = new URL(url, baseUrl);
  } catch {
    return null;
  }
  if (u.origin !== siteOrigin) return null;
  return u.pathname.startsWith(prefix) ? u.pathname.slice(prefix.length - 1) : "";
}

const failures = [];
let pages = 0;
let withImage = 0;
let resolved = 0;
let files = 0;

for (const file of walk(root)) {
  const html = readFileSync(file, "utf8");
  files++;
  const tags = { "og:image": [], "og:image:alt": [], "twitter:image": [], "twitter:image:alt": [] };

  for (const m of html.matchAll(META)) {
    const tag = m[0];
    const key = attr(tag, PROPERTY) ?? attr(tag, NAME);
    if (key === null) continue;
    const k = key.toLowerCase();
    if (k in tags) tags[k].push((attr(tag, CONTENT) ?? "").trim());
  }

  if (!Object.values(tags).some((v) => v.length)) continue;
  pages++;

  // A card shows one picture. Two og:image tags let the crawler pick, and the
  // one it picks is the one nobody chose.
  for (const k of Object.keys(tags)) {
    if (tags[k].length > 1) failures.push([file, `${tags[k].length} × ${k}`, "a card names one picture"]);
    // An empty content is a tag asserting there is no picture, not a picture.
    if (tags[k].some((v) => v === "")) failures.push([file, `${k} with an empty content`, "a tag that names nothing"]);
  }

  const og = tags["og:image"][0];
  const tw = tags["twitter:image"][0];

  if (og && tw) {
    withImage++;
    if (og !== tw) failures.push([file, `og:image ${og}\n    twitter:image ${tw}`, "the two halves name different pictures"]);

    const path = local(og);
    if (path !== null) {
      resolved++;
      // Resolved, not joined: a percent-encoded separator survives URL
      // normalisation -- %2e%2e%2fx.png stays whole in pathname and passes the
      // prefix test above -- and only becomes ../x.png once decoded. Joined
      // blindly that reads a file outside the build and calls the card
      // published. A plain ../ is normalised by the URL parser and caught by
      // the prefix test; the encoded form has to be caught here.
      const target = path === "" ? "" : resolve(rootPath, decodeURIComponent(path).replace(/^\/+/, ""));
      const outside = target === "" ? ".." : relative(rootPath, target);
      if (outside === ".." || outside.startsWith(`..${sep}`)) {
        failures.push([file, `og:image ${og}`, "escapes the site root"]);
      } else if (!exists(target)) {
        failures.push([file, `og:image ${og}`, "names a file this build did not write"]);
      }
    }
  } else if (og || tw) {
    failures.push([file, og ? "og:image with no twitter:image" : "twitter:image with no og:image",
      "both tag sets carry the picture, or neither does"]);
  }

  // An alt with no picture describes nothing — which is how the og:image:alt
  // used to outlive the image it belonged to.
  if (tags["og:image:alt"].length && !og) failures.push([file, "og:image:alt with no og:image", "an alt with no picture"]);
  if (tags["twitter:image:alt"].length && !tw) failures.push([file, "twitter:image:alt with no twitter:image", "an alt with no picture"]);
}

// A build that produced nothing, or a wrong working-directory, otherwise reads
// as a pass: no files, no failures, exit 0.
if (files === 0) {
  console.error(`no HTML found under ${root}`);
  process.exit(1);
}

console.log(
  `checked ${pages} pages carrying card tags, ${withImage} of them with a picture` +
    (baseUrl ? `, ${resolved} pointing at a file this build wrote` : ""),
);
if (failures.length) {
  console.error(`\n${failures.length} broken:\n`);
  for (const [file, what, why] of failures) console.error(`  ${file}\n    ${what}  (${why})`);
  process.exit(1);
}
console.log(
  baseUrl
    ? "every card names one picture, both halves agree on it, and it was published"
    : "every card names one picture, and both halves agree on it",
);
