// Asserts the two halves of a social card name the same picture, and that the
// picture is one the build wrote. Agreeing is not enough on its own: `images`
// as a string indexed the string, so both halves named .../105 and 404 twice.
// A same-origin card URL is resolved against the files on disk when a base URL
// is passed.
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

// A remote card is somebody else's to serve, and is left alone.
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

// Path under the public root, or null when the URL is somebody else's. One
// that escapes the baseURL path returns "" and is reported: that is the shape
// absURL leaves on a subpath site.
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
      // Resolved, not joined: %2e%2e%2fx.png survives URL normalisation, passes
      // the prefix test, then decodes to ../x.png. A plain ../ the parser
      // already folds away; the encoded form has to be caught here.
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
