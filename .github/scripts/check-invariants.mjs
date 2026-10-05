// Asserts the invariants the bug fixes established, one named check per fix.
// Class tokens, CSS declarations and URLs are compared whole: as greps these
// were loose, `dir="rtl"` also matching `data-dir="rtl"`.
//
//   node .github/scripts/check-invariants.mjs <dir> <check> [args...]

import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { walk, attrRe, tagRe, value as attrValue } from "./_lib.mjs";

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

// The logo's own div, quoted or not: --minify drops the quotes.
function logoOf(html) {
  const m = [...html.matchAll(/<div\b[^>]*>/gi)].find((d) => hasClass(d[0], "logo"));
  return m ? element(html, m.index, "div") : fail("no logo was rendered");
}

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

  // A strict style-src refuses the attribute; params-css.html writes the rule.
  "cursor-default"() {
    const styled = [];
    for (const p of pages(dir)) {
      for (const m of readFileSync(p, "utf8").matchAll(/<span\b[^>]*>/gi)) {
        if (hasClass(m[0], "logo__cursor") && attr(m[0], "style") !== null) styled.push(rel(p));
      }
    }
    if (styled.length) fail("a style attribute on the logo cursor", styled.slice(0, 3).join("\n"));
    ok("the logo cursor carries no style attribute");
  },

  // ...and the stylesheet carries the configured one.
  "cursor-styled"(...want) {
    const bodies = rules(css(), ".logo__cursor");
    for (const w of want) {
      const [prop, value] = w.split("=");
      if (!bodies.some((b) => declares(b, prop, value)))
        fail(`a configured cursor lost ${prop}:${value}`, bodies.map((b) => `.logo__cursor{${b}}`).join("\n") || "(no rule)");
    }
    ok("the configured logo cursor is styled from the stylesheet");
  },

  // logoCursorColorDark, for the system's dark mode and the toggle's.
  "cursor-dark"(color) {
    const all = css();
    for (const sel of [":root:not([data-theme=light]) .logo__cursor", ":root[data-theme=dark] .logo__cursor"]) {
      if (!rules(all, sel).some((b) => declares(b, "background-color", color)))
        fail(`${sel} does not take background-color:${color}`);
    }
    if (!/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme=light\]\) \.logo__cursor\{/.test(all))
      fail("the system's dark preference does not reach the cursor rule");
    ok(`the cursor turns ${color} in dark mode, by the system or the toggle`);
  },

  // params.logo.pathDark: two lazy pictures, the dark one hidden by default.
  "logo-images"(light, dark) {
    const logo = logoOf(read("index.html"));
    const imgs = [...logo.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
    const find = (cls) => imgs.find((t) => hasClass(t, cls));
    for (const [cls, file] of [["logo__img--light", light], ["logo__img--dark", dark]]) {
      const t = find(cls);
      if (!t) fail(`no ${cls} in the logo`, logo);
      if (!(attr(t, "src") ?? "").endsWith(`/${file}`)) fail(`${cls} is not ${file}`, t);
      if (attr(t, "loading") !== "lazy") fail(`${cls} is not lazy, so it is fetched while hidden`, t);
      if (!attr(t, "alt")) fail(`${cls} has no alt, so the home link has no name`, t);
    }
    if (imgs.length !== 2) fail(`the logo carries ${imgs.length} pictures, not 2`, logo);
    const all = css();
    if (!rules(all, ".logo__img--dark").some((b) => declares(b, "display", "none")))
      fail("the dark picture is not hidden by default");
    if (!rules(all, ":root[data-theme=dark] .logo__img--light").some((b) => declares(b, "display", "none")))
      fail("the toggle's dark mode does not hide the light picture");
    ok("the logo has a picture per scheme, and only the one shown is fetched");
  },

  // params.logo.inline: a named inline SVG, cleaned of prolog and comments.
  "logo-inline"(name, ...keep) {
    const logo = logoOf(read("index.html"));
    const svg = logo.match(/<svg\b[^>]*>/i)?.[0];
    if (!svg) fail("no inline svg in the logo", logo);
    if (/<img\b/i.test(logo)) fail("the logo was inlined and also linked", logo);
    if (!hasClass(svg, "logo__svg")) fail("the inline logo lost its class", svg);
    if ((svg.match(/\sclass\s*=/gi) ?? []).length !== 1) fail("the inline logo has more than one class attribute", svg);
    for (const own of keep) {
      if (!hasClass(svg, own)) fail(`the inline logo dropped its own class "${own}"`, svg);
    }
    if (attr(svg, "role") !== "img" || (attr(svg, "aria-label") ?? "").replace(/&amp;/g, "&") !== name)
      fail(`the inline logo is not named "${name}"`, svg);
    if (/<\?xml|<!DOCTYPE|<!--/i.test(logo)) fail("a prolog, doctype or comment reached the page", logo);
    ok(`the logo is inlined and named "${name}"${keep.length ? `, keeping its own ${keep.join(", ")}` : ""}`);
  },

  // params.contentWidth: the stylesheet sets the property, and the images are
  // told the same width. With no argument, the default: neither is written.
  "content-width"(want) {
    const set = rules(css(), ":root").filter((b) =>
      b.split(";").some((d) => d.trim().startsWith("--content-width:")));
    if (!want) {
      if (set.length) fail("--content-width is set with no contentWidth configured", set.map((b) => `:root{${b}}`).join("\n"));
      ok("no contentWidth, no --content-width: the 800px fallback stands");
      return;
    }
    if (!set.some((b) => declares(b, "--content-width", want)))
      fail(`--content-width:${want} is not in the stylesheet`, set.map((b) => `:root{${b}}`).join("\n") || "(no rule)");
    const sizes = `(max-width: ${want}) 100vw, ${want}`;
    const off = [];
    let seen = 0;
    for (const p of pages(dir)) {
      for (const m of readFileSync(p, "utf8").matchAll(/<img\b[^>]*>/gi)) {
        const s = attr(m[0], "sizes");
        if (s === null || hasClass(m[0], "portrait")) continue;
        seen++;
        if (s !== sizes) off.push(`${rel(p)}: sizes="${s}"`);
      }
    }
    if (!seen) fail("no image with a sizes attribute was built");
    if (off.length) fail(`an image is not sized to the ${want} column`, off.slice(0, 3).join("\n"));
    // A cover wider than the column must still fit the viewport.
    if (!rules(css(), ".post-cover").some((b) => /--cover-width:\s*min\(.*100vw/.test(b)))
      fail("the post cover is not bounded by the viewport");
    if (!rules(css(), ".footer__content").some((b) => declares(b, "flex-wrap", "wrap")))
      fail("footer items are squeezed onto one line instead of wrapping");
    ok(`the column is ${want}, and ${seen} images are sized to it`);
  },

  // Every gallery thumbnail is a named link around a measured square.
  gallery() {
    const bad = [];
    let seen = 0;
    for (const p of pages(dir)) {
      const html = readFileSync(p, "utf8");
      for (const g of html.matchAll(/<div\b[^>]*>/gi)) {
        if (!hasClass(g[0], "gallery")) continue;
        const body = element(html, g.index + g[0].length, "div");
        const items = [...body.matchAll(/<a\b[^>]*>\s*(<img\b[^>]*>)/gi)];
        if (!items.length) bad.push(`${rel(p)}: a gallery with no linked picture`);
        for (const [a, img] of items) {
          seen++;
          const href = attr(a.match(/<a\b[^>]*>/i)[0], "href") ?? "";
          const alt = (attr(img, "alt") ?? "").trim();
          const w = attr(img, "width"), h = attr(img, "height");
          if (!alt) bad.push(`${rel(p)}: ${href} has no alt, so its link has no name`);
          if (!w || w !== h) bad.push(`${rel(p)}: ${href} is not a measured square (${w}x${h})`);
          if (!hasClass(img, "gallery__image")) bad.push(`${rel(p)}: ${href} lost the gallery__image class`);
        }
      }
    }
    if (bad.length) fail("a gallery thumbnail is wrong", bad.slice(0, 5).join("\n"));
    if (!seen) fail("no gallery was rendered anywhere");
    ok(`${seen} gallery thumbnails, each a named link around a measured square`);
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
  // A tag in a title is text, and the title's Markdown still renders.
  "title-html"(page, want) {
    const html = read(page);
    const h1 = [...html.matchAll(/<h1\b[^>]*>/gi)].find((m) => hasClass(m[0], "post-title"));
    if (!h1) fail(`${page} has no post title`);
    const inner = element(html, h1.index + h1[0].length, "h1");
    const shown = text(inner).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    if (!shown.includes(want)) fail(`the title does not show ${want}`, inner);
    if (!/<em>/.test(inner)) fail("the title's Markdown was not rendered", inner);
    const og = [...html.matchAll(tagRe("meta"))].find((m) => attr(m[0], "property") === "og:title");
    if (!(attr(og?.[0] ?? "", "content") ?? "").includes(want)) fail(`og:title does not show ${want}`, og?.[0] ?? "(none)");
    const lds = [...html.matchAll(/<script type="?application\/ld\+json"?>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    if (!lds.some((d) => (d.headline ?? "").includes(want))) fail(`the JSON-LD headline does not show ${want}`);
    const omitted = pages(dir).filter((p) => readFileSync(p, "utf8").includes("raw HTML omitted"));
    if (omitted.length) fail("raw HTML was dropped from a page", omitted.slice(0, 3).map(rel).join("\n"));
    ok("a tag in a title reaches the reader as text");
  },
  // A code span in a title shows its text as written, and a tag outside it stays
  // text, in the page and its Markdown copy.
  "title-code"(page, code, tag) {
    const html = read(page);
    const h1 = [...html.matchAll(/<h1\b[^>]*>/gi)].find((m) => hasClass(m[0], "post-title"));
    if (!h1) fail(`${page} has no post title`);
    const inner = element(html, h1.index + h1[0].length, "h1");
    const spans = [...inner.matchAll(/<code>([\s\S]*?)<\/code>/g)].map((m) => m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
    if (!spans.includes(code)) fail(`the title's code span does not show ${code}`, inner);
    const shown = text(inner).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    if (!shown.includes(tag)) fail(`the title does not show ${tag}`, inner);
    const md = read(page.replace(/index\.html$/, "index.md")).split("\n")[0];
    if (!md.includes("`" + code + "`")) fail(`the Markdown copy's heading does not show \`${code}\``, md);
    if (!md.includes("\\" + tag)) fail(`the Markdown copy's heading does not escape ${tag}`, md);
    ok("a code span in a title shows its text as written");
  },
  // Outside its own h1 a title is plain text, and the h1 renders inline Markdown only.
  "title-plain"(page, want) {
    const html = read(page);
    const quotes = { ldquo: "\u201c", rdquo: "\u201d", lsquo: "\u2018", rsquo: "\u2019" };
    const decode = (s) => s.replace(/&(ldquo|rdquo|lsquo|rsquo);/g, (_, q) => quotes[q])
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#34;|&quot;/g, '"').replace(/&amp;/g, "&");
    const h1 = [...html.matchAll(/<h1\b[^>]*>/gi)].find((m) => hasClass(m[0], "post-title"));
    if (!h1) fail(`${page} has no post title`);
    const inner = element(html, h1.index + h1[0].length, "h1");
    if (/<(ol|ul|li|blockquote|h[1-6]|p)\b/i.test(inner)) fail("the h1 holds block markup", inner);
    // The h1 still reads the whole title: an escaped "1." is kept, not dropped.
    if (decode(text(inner)) !== want) fail(`the h1 does not read ${want}`, inner);
    const metas = [...html.matchAll(tagRe("meta"))];
    const site = decode(attr(metas.find((m) => attr(m[0], "property") === "og:site_name")?.[0] ?? "", "content") ?? "");
    const named = {
      title: decode((html.match(/<title>([\s\S]*?)<\/title>/) ?? ["", ""])[1]),
      "og:title": attr(metas.find((m) => attr(m[0], "property") === "og:title")?.[0] ?? "", "content") ?? "",
      "twitter:title": attr(metas.find((m) => attr(m[0], "name") === "twitter:title")?.[0] ?? "", "content") ?? "",
      headline: [...html.matchAll(/<script type="?application\/ld\+json"?>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]).headline).find(Boolean) ?? "",
    };
    // Each field exactly: the fixtures are single pages, so no pager suffix.
    const expected = {
      title: `${want} :: ${site}`,
      "og:title": want,
      "twitter:title": want,
      headline: Array.from(want).slice(0, 110).join(""),
    };
    for (const [where, v] of Object.entries(named)) {
      if (decode(v) !== expected[where]) fail(`${where} is not ${expected[where]}`, v);
    }
    const cardAlt = attr(metas.find((m) => attr(m[0], "property") === "og:image:alt")?.[0] ?? "", "content");
    if (cardAlt && decode(cardAlt) !== want) fail(`og:image:alt is not ${want}`, cardAlt);
    const figure = [...html.matchAll(/<figure\b[^>]*>/gi)].find((m) => hasClass(m[0], "post-cover"));
    const coverImg = figure && [...html.slice(figure.index).matchAll(tagRe("img"))][0];
    const coverAlt = coverImg && attr(coverImg[0], "alt");
    if (coverAlt && decode(coverAlt) !== want) fail(`the cover's alt is not ${want}`, coverAlt);
    // Every list entry and previous/next button that names the page names it plainly.
    const head = want.slice(0, 12);
    for (const p of pages(dir)) {
      for (const m of readFileSync(p, "utf8").matchAll(/<span class="?(?:post-title|button__text)"?>([\s\S]*?)<\/span>/g)) {
        const shown = decode(m[1]).trim();
        if (shown.startsWith(head) && shown !== want) fail(`${rel(p)} names the page ${shown}`);
      }
    }
    ok("a title is plain text outside its own h1");
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
