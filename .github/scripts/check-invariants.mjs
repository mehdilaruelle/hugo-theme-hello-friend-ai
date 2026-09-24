// Asserts the invariants the bug fixes established, one named check per fix.
// Class tokens, CSS declarations and URLs are compared whole: as greps these
// were loose, `dir="rtl"` also matching `data-dir="rtl"`.
//
//   node .github/scripts/check-invariants.mjs <dir> <check> [args...]

import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { walk, attrRe, value as attrValue } from "./_lib.mjs";

const attr = (tag, name) => attrValue(tag.match(attrRe(name)));

// Whole tokens: "post-info" is not "post-infobar".
const hasClass = (tag, want) =>
  (attr(tag, "class") ?? "").split(/\s+/).includes(want);

const pages = (dir) => [...walk(dir, ".html")];
const text = (html) => html.replace(/<[^>]*>/g, "").trim();

// Up to the matching close. Nesting would widen the slice, never hide it.
function element(html, from, tag) {
  const end = html.indexOf(`</${tag}`, from);
  return end === -1 ? html.slice(from) : html.slice(from, end);
}

// Selectors compared whole, so `.logo` is not `.logopanel`.
function rules(css, selector) {
  const out = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sels = m[1].split(",").map((s) => s.trim());
    if (sels.includes(selector)) out.push(m[2]);
  }
  return out;
}

const declares = (body, prop, value) =>
  body.split(";").map((d) => d.trim()).some((d) => {
    const i = d.indexOf(":");
    return i > 0 && d.slice(0, i).trim() === prop && d.slice(i + 1).trim() === value;
  });

const [, , dir, check, ...args] = process.argv;
if (!dir || !check) {
  console.error("usage: check-invariants.mjs <dir> <check> [args...]");
  process.exit(2);
}

const fail = (msg, detail) => {
  console.error(`  BAD  ${msg}`);
  if (detail) console.error(detail);
  process.exit(1);
};
const ok = (msg) => console.log(`  ${msg}`);
const rel = (p) => relative(dir, p);
const read = (p) => {
  try { return readFileSync(join(dir, p), "utf8"); }
  catch { return fail(`${p} was not built`); }
};
const css = () => [...walk(dir, ".css")].map((f) => readFileSync(f, "utf8")).join("\n");

const checks = {
  // #270
  "post-info"() {
    const empty = [], seen = [];
    for (const p of pages(dir)) {
      const html = readFileSync(p, "utf8");
      for (const m of html.matchAll(/<div\b[^>]*>/gi)) {
        if (!hasClass(m[0], "post-info")) continue;
        seen.push(p);
        if (!text(element(html, m.index + m[0].length, "div"))) empty.push(rel(p));
      }
    }
    if (empty.length) fail("a post-info with nothing in it was rendered", empty.slice(0, 3).join("\n"));
    if (!seen.length) fail("no post-info was rendered anywhere");
    ok("a post-info is rendered only where there is something to put in it");
  },

  // #268 and #274: the table lists levels 2..3, so headings are not the test.
  toc() {
    const empty = [], seen = [];
    for (const p of pages(dir)) {
      const html = readFileSync(p, "utf8");
      for (const m of html.matchAll(/<nav\b[^>]*>/gi)) {
        if (attr(m[0], "id") !== "TableOfContents") continue;
        seen.push(p);
        if (!text(element(html, m.index + m[0].length, "nav"))) empty.push(rel(p));
      }
    }
    if (empty.length) fail("a table of contents with nothing in it was rendered", empty.slice(0, 3).join("\n"));
    if (!seen.length) fail("no table of contents was rendered anywhere");
    ok("a table of contents is rendered only where there is something to list");
  },

  // #265: .content is the page frame, not a prose wrapper.
  "list-content"() {
    const nested = [];
    let intro = false;
    for (const p of pages(dir)) {
      const html = readFileSync(p, "utf8");
      for (const m of html.matchAll(/<main\b[^>]*>/gi)) {
        const body = element(html, m.index + m[0].length, "main");
        for (const d of body.matchAll(/<div\b[^>]*>/gi)) {
          if (hasClass(d[0], "content")) nested.push(rel(p));
        }
      }
      for (const d of html.matchAll(/<div\b[^>]*>/gi)) {
        if (hasClass(d[0], "list-content")) intro = true;
      }
    }
    if (nested.length) fail(".content nested inside <main>: it is the page frame, not a prose wrapper", nested.slice(0, 3).join("\n"));
    if (!intro) fail("no section introduction was rendered at all");
    ok("the section introduction has a prose class of its own");
  },

  // #267
  menu() {
    const emptyNav = [], burger = [];
    let header = false;
    for (const p of pages(dir)) {
      const html = readFileSync(p, "utf8");
      for (const m of html.matchAll(/<ul\b[^>]*>/gi)) {
        if (hasClass(m[0], "menu__inner") && !text(element(html, m.index + m[0].length, "ul"))) emptyNav.push(rel(p));
      }
      for (const m of html.matchAll(/<button\b[^>]*>/gi)) {
        if (hasClass(m[0], "menu-trigger")) burger.push(rel(p));
      }
      for (const m of html.matchAll(/<header\b[^>]*>/gi)) {
        if (hasClass(m[0], "header")) header = true;
      }
    }
    if (emptyNav.length) fail("an empty menu__inner was rendered", emptyNav.slice(0, 3).join("\n"));
    if (burger.length) fail("a hamburger was rendered for a site with no main menu", burger.slice(0, 3).join("\n"));
    if (!header) fail("no header was rendered at all");
    ok("a site whose only menu is a footer menu gets no navigation");
  },

  // #264: gitUrl is an optional prefix; without one the hash stays text.
  "git-line"() {
    const bare = [];
    let line = false;
    for (const p of pages(dir)) {
      const html = readFileSync(p, "utf8");
      for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
        if (/^[0-9a-f]{40}$/.test(attr(m[0], "href") ?? "")) bare.push(rel(p));
      }
      // The hash as the text right after the commit icon, not merely somewhere.
      if (/class="?[^">]*feather-git-commit/.test(html) &&
          /<\/svg>\s*[0-9a-f]{7,40}\s*@/.test(html)) line = true;
    }
    if (bare.length) fail("a commit hash shipped as a relative href", bare.slice(0, 3).join("\n"));
    if (!line) fail("no commit line with a plain-text hash was rendered");
    ok("the hash is plain text when there is no gitUrl to link it to");
  },

  // #266
  "logo-rtl"(page) {
    const html = read(page);
    const tag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
    if (attr(tag, "dir") !== "rtl") fail(`${page} is not marked dir=rtl`, tag.slice(0, 120));
    const bodies = rules(css(), ".logo");
    if (!bodies.some((b) => declares(b, "direction", "ltr") && declares(b, "unicode-bidi", "isolate")))
      fail(".logo does not pin its direction; an RTL page will mirror the mark",
           bodies.map((b) => `.logo{${b}}`).join("\n") || "(no .logo rule)");
    ok("the logo reads left-to-right on an RTL page");
  },

  // #272
  submenu(page) {
    const html = read(page);
    const tag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
    if (attr(tag, "dir") !== "rtl") fail(`${page} is not marked dir=rtl`, tag.slice(0, 120));
    const bodies = rules(css(), ".menu__inner").filter((b) => declares(b, "flex-direction", "column"));
    if (!bodies.some((b) => declares(b, "text-align", "start")))
      fail("the phone menu block does not set text-align:start",
           bodies.map((b) => `.menu__inner{${b}}`).join("\n") || "(no stacked .menu__inner rule)");
    ok("a submenu label follows the writing direction on a phone");
  },

  // #273: the params are optional, so the attribute is too.
  "cursor-default"() {
    const styled = [];
    for (const p of pages(dir)) {
      for (const m of readFileSync(p, "utf8").matchAll(/<span\b[^>]*>/gi)) {
        if (hasClass(m[0], "logo__cursor") && attr(m[0], "style") !== null) styled.push(rel(p));
      }
    }
    if (styled.length) fail("the default build ships a style attribute on the logo cursor", styled.slice(0, 3).join("\n"));
    ok("the logo cursor carries no style attribute when it has nothing to say");
  },

  // ...and still carries one when it does.
  "cursor-styled"(...want) {
    const spans = [...read("index.html").matchAll(/<span\b[^>]*>/gi)]
      .filter((m) => hasClass(m[0], "logo__cursor"));
    const decls = spans.map((m) => attr(m[0], "style") ?? "");
    for (const w of want) {
      const [prop, value] = w.split("=");
      if (!decls.some((d) => declares(d, prop, value)))
        fail(`a configured cursor lost ${prop}:${value}`, spans.map((m) => m[0]).join("\n") || "(no cursor)");
    }
    ok("the logo cursor carries a style only when it has one");
  },

  // Excerpts and JSON-LD descriptions must show characters, not entities.
  entities() {
    const entity = /&(?:[a-z][a-z0-9]*|#\d+|#x[0-9a-f]+);/i;
    const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39);/g,
      (_, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[e]);
    const bad = [];
    let curly = false, described = false;
    for (const p of pages(dir)) {
      const html = readFileSync(p, "utf8");
      for (const m of html.matchAll(/<span\b[^>]*>/gi)) {
        if (!hasClass(m[0], "post-excerpt")) continue;
        const shown = decode(text(element(html, m.index + m[0].length, "span")));
        if (entity.test(shown)) bad.push(`${rel(p)}: excerpt reads ${shown.match(entity)[0]}`);
        if (/[’“”]/.test(shown)) curly = true;
      }
      for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
        if (attr(m[0], "type") !== "application/ld+json") continue;
        let data;
        try { data = JSON.parse(m[1]); } catch { continue; }
        const d = data.description;
        if (typeof d !== "string") continue;
        described = true;
        if (entity.test(d)) bad.push(`${rel(p)}: JSON-LD description reads ${d.match(entity)[0]}`);
      }
    }
    if (bad.length) fail("an HTML entity reached the reader as text", bad.slice(0, 5).join("\n"));
    if (!curly) fail("no excerpt carries a curly quote, so nothing was tested");
    if (!described) fail("no JSON-LD description was rendered");
    ok("list excerpts and JSON-LD descriptions carry characters, not entities");
  },

  // #263 and #271: the card and the player name the same file, subpath kept.
  media(page, want) {
    const html = read(page);
    for (const prop of ["og:audio", "og:video"]) {
      const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].filter((m) => attr(m[0], "property") === prop);
      if (!metas.some((m) => attr(m[0], "content") === want))
        fail(`${prop} is not ${want}`, metas.map((m) => m[0]).join("\n") || `(no ${prop})`);
    }
    const sources = [...html.matchAll(/<source\b[^>]*>/gi)];
    if (!sources.some((m) => attr(m[0], "src") === want))
      fail(`the player source is not ${want}`, sources.map((m) => m[0]).join("\n") || "(no <source>)");
    ok("a bare string and a list of one name the same file");
  },

  // A link per favicon file the site ships, with its attributes.
  favicons() {
    const page = read("index.html");
    const start = page.search(/<head\b/i);
    if (start === -1) fail("index.html has no <head>");
    const html = element(page, start, "head");
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
    const want = [
      ["apple-touch-icon", "apple-touch-icon.png", { sizes: "180x180" }],
      ["icon", "favicon-32x32.png", { type: "image/png", sizes: "32x32" }],
      ["icon", "favicon-16x16.png", { type: "image/png", sizes: "16x16" }],
      ["manifest", "site.webmanifest", {}],
      ["mask-icon", "safari-pinned-tab.svg", { color: "#1b1c1d" }],
      ["shortcut icon", "favicon.ico", {}],
    ];
    for (const [rel, file, attrs] of want) {
      const hit = links.find((l) => attr(l, "rel") === rel && (attr(l, "href") ?? "").endsWith("/" + file));
      if (!hit) fail(`no <link rel="${rel}"> for ${file} in <head>`, links.join("\n"));
      if (!existsSync(join(dir, file))) fail(`${file} is linked but was not published`);
      for (const [k, v] of Object.entries(attrs))
        if (attr(hit, k) !== v) fail(`${file}: ${k} is not ${v}`, hit);
    }
    const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
    const tile = metas.find((m) => attr(m, "name") === "msapplication-TileColor");
    if (attr(tile ?? "", "content") !== "#1b1c1d") fail("msapplication-TileColor is not #1b1c1d", tile ?? "(none)");
    ok("every favicon the site ships is linked, with its attributes");
  },

  // params.social as a table: the build survives and the handle is read.
  "social-map"(handle) {
    const metas = [...read("index.html").matchAll(/<meta\b[^>]*>/gi)].filter((m) => attr(m[0], "name") === "twitter:site");
    if (metas.length !== 1 || attr(metas[0][0], "content") !== "@" + handle)
      fail(`want one twitter:site, @${handle}`, metas.map((m) => m[0]).join("\n") || "(no twitter:site)");
    ok("a table-shaped params.social still names the site's account");
  },

  // A site's own tags.html and _variables.scss win over the theme's.
  "site-overrides"(colour) {
    let used = false;
    const theme = [];
    for (const p of pages(dir)) {
      const html = readFileSync(p, "utf8");
      if (html.includes("site-tags-override")) used = true;
      if (/feather-tag\b/.test(html)) theme.push(rel(p));
    }
    if (!used) fail("the site's tags.html was not used");
    if (theme.length) fail("the theme's tags.html still rendered", theme.slice(0, 3).join("\n"));
    if (!css().replace(/\s+/g, "").includes(`--background:${colour}`))
      fail(`the site's _variables.scss did not reach --background (${colour})`);
    ok("a site's tags.html and _variables.scss win over the theme's");
  },
};

const run = checks[check];
if (!run) fail(`unknown check ${check}`, `known: ${Object.keys(checks).join(", ")}`);
run(...args);
