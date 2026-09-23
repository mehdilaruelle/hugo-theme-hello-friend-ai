// Resolve every internal link and asset of a built Hugo site against the files
// on disk. Built under a subpath, because a URL that drops the baseURL path --
// how several bugs reached production here -- then resolves outside the tree.
// External URLs are never requested: fast, offline, nobody else's rate limit.

import { readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, posix } from "node:path";
import { walk } from "./_lib.mjs";

// poster carries a URL like src does, so it belongs in the same net. The
// lookbehind is the name test \b is not; check-sharing.mjs says why.
const ATTR = /(?<![-\w])(?:href|src|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const CSS_URL = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]+))\s*\)/gi;

// og:audio and og:video carry their URL in content, where the attribute net
// above does not reach.
const META_URL =
  /<meta\b[^>]*?(?<![-\w])property\s*=\s*(?:"(og:(?:audio|video))"|'(og:(?:audio|video))'|(og:(?:audio|video)))[^>]*>/gi;
const CONTENT = /(?<![-\w])content\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const SKIP = /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/|#)/i;

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d));

const exists = (p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
};

// A directory URL is served by its index.html.
const published = (root, path) => {
  const target = join(root, decodeURIComponent(path).replace(/^\/+/, ""));
  return exists(target) || exists(join(target, "index.html"));
};

const [publicDir, baseUrl] = process.argv.slice(2);
if (!publicDir || !baseUrl) {
  console.error("usage: check-links.mjs <public-dir> <base-url>");
  process.exit(2);
}

const root = resolve(publicDir);
if (!existsSync(root)) {
  console.error(`no ${root}: nothing was checked`);
  process.exit(1);
}

const siteOrigin = new URL(baseUrl).origin;
let prefix = new URL(baseUrl).pathname || "/";
if (!prefix.endsWith("/")) prefix += "/";

const failures = [];
let checked = 0;
let files = 0;

for (const file of walk(root)) {
  // Feeds are skipped: their descriptions carry escaped markup from article
  // bodies, which is content rather than anything the theme emits.
  if (!/\.(html|css)$/i.test(file)) continue;
  files++;

  const page = "/" + relative(root, file).split(/[\\/]/).join("/");
  const text = readFileSync(file, "utf8");
  const isCss = file.endsWith(".css");
  const raws = [];
  for (const m of text.matchAll(isCss ? CSS_URL : ATTR)) raws.push(m[1] ?? m[2] ?? m[3] ?? "");
  if (!isCss) {
    for (const m of text.matchAll(META_URL)) {
      const c = m[0].match(CONTENT);
      if (c) raws.push(c[1] ?? c[2] ?? c[3] ?? "");
    }
  }

  for (const rawMatch of raws) {
    const raw = decode(rawMatch.trim());
    // Escaped markup inside content (RSS descriptions, code samples) can look
    // like an attribute to a regex; a real URL carries none of these.
    if (!raw || /["<>]/.test(raw)) continue;

    // A URL on the site's own host is internal, however it is written. Hugo
    // emits plenty of those, and skipping them would leave most of the site
    // unchecked.
    let onSite = false;
    if (/^https?:/i.test(raw)) {
      let parsed;
      try {
        parsed = new URL(raw);
      } catch {
        continue;
      }
      if (parsed.origin !== siteOrigin) continue;
      onSite = true;
    } else if (SKIP.test(raw)) {
      continue;
    }

    let path;
    try {
      path = new URL(raw, "https://placeholder.invalid" + page).pathname;
    } catch {
      continue;
    }
    if (!path) continue;

    let resolved;
    if (onSite || raw.startsWith("/")) {
      // An internal absolute URL has to stay inside the published subpath.
      if (!path.startsWith(prefix)) {
        failures.push([page, raw, "escapes the site root"]);
        continue;
      }
      resolved = path.slice(prefix.length - 1);
    } else {
      resolved = posix.normalize(posix.join(posix.dirname(page), path));
    }

    checked++;
    if (!published(root, resolved)) failures.push([page, raw, "no such file"]);
  }
}

if (files === 0) {
  console.error(`no HTML or CSS under ${root}: nothing was checked`);
  process.exit(1);
}

console.log(`checked ${checked} internal references`);

if (failures.length) {
  const seen = new Set();
  console.error(`\n${failures.length} broken:\n`);
  for (const [page, raw, why] of failures) {
    const key = `${page}|${raw}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.error(`  ${page}\n    ${raw}  (${why})`);
  }
  process.exit(1);
}

console.log("all resolve");
