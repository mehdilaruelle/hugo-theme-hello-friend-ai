# Configuration

There are some settings you can set in your `config.toml`. 

## Default area

The settings in the default area are usually provided by Hugo itself. Check [Configure Hugo](https://gohugo.io/getting-started/configuration/#all-configuration-settings) for more information. But I want to list some important things here which are relevant to this theme.

### paginate

```
paginate = 10
```

This setting will paginate your list views. Set to `0` to disable it. For more information check (https://gohugo.io/templates/pagination/).

## Params, and where to put them when you have several languages

A param can be set once under `[params]`, or once per language under
`[languages.<code>.params]`. Set in both places, the language value wins, so the
one under `[params]` is the fallback for any language that does not override it.

For a single language, `[params]` is all you need:

```toml
[params]
  subtitle     = "Hello Friend IA Theme"
  description  = "Nice theme for homepages and blogs"
  homeSubtitle = "A Hugo theme powered by <strong>IA</strong>"
```

For several, move anything a visitor *reads* under each language, and leave the
rest — dates, feature switches, colours — at the root where it is written once:

```toml
[languages.en]
  weight = 1
  locale = "en-US"
  label  = "English"
[languages.en.params]
  subtitle     = "Hello Friend IA Theme"
  description  = "Nice theme for homepages and blogs"
  homeSubtitle = "A Hugo theme powered by <strong>IA</strong>"

[languages.fr]
  weight = 2
  locale = "fr-FR"
  label  = "Français"
[languages.fr.params]
  subtitle     = "Thème Hello Friend IA"
  description  = "Un thème soigné pour pages d'accueil et blogs"
  homeSubtitle = "Un thème Hugo propulsé par l'<strong>IA</strong>"
```

The three above are the ones most easily forgotten, because none of them come
from your content:

| param | where it shows |
| --- | --- |
| `subtitle` | appended to every `<title>`, after the site title |
| `description` | search results and social cards, via `<meta>` and `og:description` |
| `homeSubtitle` | the line under the heading on the front page |

`params.portrait.alt` belongs with them — it is read aloud, so it is text like
any other. `path` and `maxWidth` stay at the root, and a language that sets only
`alt` inherits them.

Set `locale` on every language. The root `locale` is only the default, so
without it each feed and each `og:locale` announces the same language whatever
the page is in.

Give it a territory — `en-US`, not `en`. The value goes straight into the feed's
`<language>` and into `og:locale`, and Open Graph expects `language_TERRITORY`.
A language with no obvious country still needs one picked: Modern Standard
Arabic is `ar-001` in CLDR, but `001` is a UN region code rather than a
two-letter country, so `og:locale` comes out as the invalid `ar_001`. `ar-SA`
is valid everywhere, and no more of an approximation than calling English
`en-US`.

The two demo sites are the worked examples: `exampleSite/` is the single
language shape, `showcaseSite/` the multilingual one, in four languages.

### Menus

Menus follow the same rule with one difference: a menu defined at the root
applies to every language, and there is then no way to translate a single entry.
So once you have more than one language, define the menu under each of them
rather than at the root:

```toml
[languages.fr.menu]
  [[languages.fr.menu.main]]
    identifier = "posts"
    name       = "Articles"
    url        = "posts/"
    weight     = 20
```

`url` is language-relative — `posts/` resolves to `/fr/posts/` under `fr`. Give
the same `identifier` to entries that are the same link in different languages.

Translate the page it lands on too, or the menu says *Articles* and the page it
opens is headed *Posts*. For a section that is generated rather than written,
that means adding `content/<section>/_index.<code>.md` with a `title`.

### The language switcher

`params.enableGlobalLanguageMenu` puts a globe in the header, next to the theme
toggle, opening the list of languages by their own names. It renders nothing on
a single-language site, so it is safe to leave on.

Every configured language is listed, the current one included and marked. Each
entry points at this page's translation where there is one, and at that
language's home page where there is not.

The panel is a `details` element, so it opens with no JavaScript; the bundle
only adds closing it with <kbd>Escape</kbd> or a click outside.

Strings the theme itself renders, such as *Reading time* or *Table of contents*,
come from `i18n/<code>.toml` and are already translated for the languages
shipped with the theme. Nothing to configure.

### Right-to-left languages

Set `direction` on any language that reads right to left:

```toml
[languages.ar]
  weight = 3
  locale = "ar-SA"
  label  = "العربية"
  direction = "rtl"
```

That renders `dir="rtl"` on `<html>`, and the layout follows: margins, list
indentation, the blockquote rule, the menu and the skip link all mirror. They
are written as CSS logical properties — `margin-inline-start` rather than
`margin-left` — so there is no second stylesheet and no `[dir]` overrides to
keep in step.

Two things deliberately do not mirror:

- The `position` argument of the `image` shortcode. `position="left"` means the
  left of the page; an author who asks for left means left, whatever direction
  the language reads in.
- Code blocks, which stay left to right because code does.

Nothing changes for a site without an `rtl` language. The attribute is only
emitted when a language declares a direction, and every logical property
resolves to the physical one it replaced.

Arabic ships with the theme as `i18n/ar.toml`, carrying the five plural forms
the language distinguishes, so a reading time reads correctly at one, two, a few
and many minutes rather than only at one and many.

## Proving you own the site

Every search console offers two ways to verify ownership: upload a file to the
site root, or put a meta tag on the home page. The tag is the one that survives
a rebuild, so the theme emits it for you:

```toml
[params.verification]
  google    = "your-token"
  bing      = "your-token"
  yandex    = "your-token"
  baidu     = "your-token"
  pinterest = "your-token"
```

Set only the ones you use — an unset entry emits nothing, and with no
`[params.verification]` at all nothing changes. The tags go on the home page
only, which is where each console looks, rather than on all of them.

## The logo

`params.logo` is either a picture or a line of text, not both: set `path` and
the image replaces the text logo entirely.

```toml
[params.logo]
  logoMark     = ">"
  logoText     = "$ cd /home/"
  logoHomeLink = "/"
```

| key | what it does |
| --- | --- |
| `path` | an image to use instead of the text logo. `alt` describes it |
| `logoMark` | the character before the text, `>` when unset |
| `logoText` | the text itself, `hello` when unset |
| `logoHomeLink` | where the logo links. A URL starting with `http://` or `https://` is used as given; anything else is joined to the site's home, so a site under a subpath keeps its prefix. A protocol-relative `//host/` counts as "anything else" and is joined too. Defaults to the home page |

### The cursor

The block after the text is a blinking cursor. It is drawn unless you turn it
off, and each key is emitted only when set:

| key | what it does |
| --- | --- |
| `logoCursorDisabled` | hides the cursor |
| `logoCursorColor` | any CSS colour |
| `logoCursorAnimate` | any CSS time, as the blink duration. `"0s"` stops it |
| `logoCursorPathname` | appends the current section to `logoText`, so `/posts/` reads `$ cd /home/posts`. The home page appends nothing |

`logoCursorPathname` is filled in by the browser after the page loads, since
the section comes from the URL being visited. The cursor stops animating on its
own for a visitor who asks for reduced motion.

## Comments

Three providers, each independent, each off until configured. A page opts out of
Disqus with `comments` in its front matter — see [Front matter](#front-matter).

```toml
[services.disqus]
  shortname = "your-disqus-shortname"

[params.commento]
  url = "https://commento.example.com/js/commento.js"

[params.utterances]
  repository = "owner/repo"
  issueTerm  = "pathname"
  theme      = "preferred-color-scheme"
```

Only `label` is guarded in the template: leave `issueTerm` or `theme` unset and
utterances is handed `issue-term=""` or `theme=""`, and renders its own error box
where the comments should be. Set all three whenever you set `repository`.

| key | what it does |
| --- | --- |
| `services.disqus.shortname` | the Disqus site name |
| `params.commento.url` | the script URL of your Commento or [Comentario](https://comentario.app) instance |
| `params.utterances.repository` | the public `owner/repo` holding the issues |
| `params.utterances.issueTerm` | **required with `repository`** — how a page maps to its issue: `pathname`, `url`, `title`, `og:title`, an issue number, or a specific term |
| `params.utterances.label` | a label put on the issues utterances opens. Optional: the attribute is omitted when unset |
| `params.utterances.theme` | **required with `repository`** — `github-light`, `github-dark`, `preferred-color-scheme`, `github-dark-orange`, `icy-dark` and the rest utterances offers |

## Footer

`params.footer.trademark` accepts either:

- `true` — renders the current year, so it never goes stale
- any value — rendered as given, for a fixed year or a range such as
  `"2019–2026"`

The rest of the block:

| key | what it does |
| --- | --- |
| `author` | the site author's name, linking to the home page |
| `copyright` | the site's `copyright` string, rendered as HTML |
| `rss` | a feed icon pointing at the first of `mainSections` |
| `topText` | extra entries on the first row, after the four above |
| `bottomText` | entries on a second row of their own |

`topText` and `bottomText` are **lists**, even for one entry, and each entry is
rendered as HTML so it can carry a link:

```toml
[params.footer]
  bottomText = [
    "Powered by <a href=\"https://gohugo.io\">Hugo</a>",
  ]
```

The first row is omitted entirely when none of `trademark`, `author`,
`copyright`, `rss` or `topText` is set, and the second when `bottomText` is
empty — an empty bar is not a neutral default.

## Mermaid diagrams

Pages containing a ```mermaid code block load Mermaid from jsDelivr, pinned to
an exact version. Bump it in `layouts/_partials/javascript.html` when you want
to move on.

The library is fetched from a third party, so visitors to pages with diagrams
resolve jsDelivr. Pages without a diagram request nothing.

### Content-Security-Policy

The initialiser is a file rather than an inline script, so a strict policy does
not need `script-src 'unsafe-inline'`. What it does need, on pages with a
diagram:

```text
script-src  'self' https://cdn.jsdelivr.net
style-src   'self' 'unsafe-inline'
```

`style-src 'unsafe-inline'` is Mermaid's doing, not the theme's: it writes a
<style> element into the SVG it generates, and sets a style attribute on around
forty of the shapes. A nonce cannot reach either, since both are created at
runtime. Nothing else on the page needs it.

No font directive is required — Mermaid draws with the fonts already on the
page.

Mermaid is pinned to an exact version, which also fixes the chunk tree — the
chunks it pulls in at runtime sit under the same versioned path, so a release
cannot change what runs without a reviewed change to the theme.

There is no integrity hash, and the reason is worth stating rather than leaving
as an omission. The entry module is 29 KB and imports the bulk of its code as
further chunks — a hash on the entry would cover none of them. The single-file
build that could carry one weighs **3.4 MB**.

Measured on the showcase's flowchart, the chunked build fetches **230 KB across
27 requests**, and only the chunks that diagram type needs. Full integrity would
therefore cost roughly fifteen times the bytes, on every page with a diagram.

Nor is it a matter of swapping the URL. `import()` takes no integrity
parameter, so a hash on the initialiser covers the initialiser and nothing it
loads; and `dist/mermaid.min.js`, the single file that could carry one, is a
global bundle with no ES module exports — a dynamic import of it would find no
`default` to call. Doing this properly means loading that bundle as a classic
`<script src integrity>` and driving it through the global it defines, which is
a different mechanism rather than a setting.

## Mathematics

Set `math = true` in a page's front matter, or `params.math` for a whole site,
and KaTeX renders the formulas on that page:

```markdown
Inline \(a^2 + b^2 = c^2\), and set apart:

$$
\int_0^\infty e^{-x}\,dx = 1
$$
```

It is opt-in rather than detected from the content, because `$$` is ordinary
text in a shell snippet and a false positive would fetch 300 KB for nothing. A
page without it requests neither the stylesheet nor the script.

You have to enable Goldmark's **passthrough** extension yourself, in your own
configuration. Without it a formula is treated as ordinary Markdown before KaTeX
ever sees it: underscores open emphasis, and a backslash before punctuation is
swallowed as an escape.

A theme cannot do this for you — Hugo merges a theme's params but not its markup
settings — so it belongs in your site config:

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block  = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

`exampleSite/config.toml` carries it, and the showcase layers over that file, so
both demo sites exercise it.

KaTeX is pinned to an **exact** version, and each file carries an `integrity`
hash, so neither a new release nor a compromised CDN can change what runs for
your visitors. Upgrading is deliberate: bump the version in
`layouts/_partials/head.html` and `javascript.html` and recompute the hashes.

The call that renders the formulas lives in `assets/js/katex-render.js` rather
than an inline `onload` attribute, so turning this on does not oblige your site
to allow `script-src 'unsafe-inline'`.

## Default color scheme

`params.defaultTheme` accepts `"dark"` or `"light"`. Unset, the theme follows
the visitor's operating system preference, which is the previous behaviour.

The value is rendered server-side onto `<html>`, so the page arrives in the
right scheme rather than switching once JavaScript runs. A visitor who picks a
scheme with the toggle still overrides it, on every later visit.

That override is restored by `assets/js/theme-init.js`, a small blocking script
in the `<head>`, so it too is in place before the first paint. It is a file
rather than an inline script: a strict policy already allows `script-src
'self'` for the theme's bundle, so this needs no hash and no `'unsafe-inline'`.

## Post thumbnails

`params.enableThumbnails` shows each post's `cover` image beside its title in
list pages. It is off by default, and a post without a `cover` is unaffected —
a list with no thumbnails renders exactly as it did before.

```toml
[params]
  enableThumbnails = true
```

The image is taken from the page's `cover` front matter, the same value the
article page already uses, and goes through the same partial: it is cropped to
156×156 — the 52 px box at 3× — and re-encoded as WebP, so a list of twenty
posts with full-size covers costs a few kilobytes rather than a few megabytes.
The crop is centred, and is the one `object-fit: cover` was already making at
display time. The dimensions are emitted with it, so the row reserves its space
before the image arrives.

A cover mounted from `static/` is resolved the same way as one in `assets/`.
Two kinds are passed through at full size instead, because neither can be
cropped: a remote URL, and an SVG.

A GIF cover is cropped here and left alone everywhere else. Resizing one loses
its animation, which is worth keeping on an article cover shown at full width
and not worth a multi-megabyte download in a 52 px box — so the thumbnail takes
the first frame and the cover on the article page still moves.

## Post excerpts

`params.enableListExcerpts` prints each post's description under its title in
list pages. It is off by default, and a list without it renders exactly as it
did before — the row stays a single line holding the title and the date.

```toml
[params]
  enableListExcerpts = true
```

The text is the page's `description` front matter: the same sentence the
article page prints under its title and the meta description already carries,
so a post gains a summary on the list without anything new to write. A post
with no description falls back to Hugo's own summary, cut to 200 characters
rather than run to the several hundred `.Summary` can reach.

Excerpts and thumbnails compose. With both on, the excerpt is indented to line
up with the title rather than with the thumbnail beside it.

## Related posts

Every article ends with a list of the posts closest to it, so a reader has
somewhere to go and the articles link to each other without anyone writing the
links. Nothing to switch on: a post with no match renders no section at all,
not an empty heading.

```toml
[params]
  [params.related]
    enable = false   # removes the section everywhere
    limit  = 3       # how many entries at most. Defaults to 5
```

A page kept out of the index never appears in the list — see
[Keeping a page out of things](#keeping-a-page-out-of-things) — and a post with
no title in its front matter is listed under its humanized file name rather
than as an empty link.

### What it matches on

Hugo's related-content index does the matching. Its settings are the site's,
not the theme's: **Hugo does not merge a theme's `[related]` block into a
site's configuration**, so the block below has to live in your own config file.
Copy it from the exampleSite:

```toml
[related]
  threshold    = 80
  includeNewer = true
  toLower      = true

  [[related.indices]]
    name   = "tags"
    weight = 100

  [[related.indices]]
    name   = "categories"
    weight = 80

  [[related.indices]]
    name   = "date"
    weight = 10
```

Without it Hugo's own defaults apply, and the list still works — it indexes
`keywords`, `tags` and `date`. Two things are worth the block anyway:

- **`includeNewer = true`.** Hugo defaults it to `false`, which relates a post
  only to ones published before it. The newest article on the site then shows
  nothing, and every list points backwards in time.
- **`categories`.** Hugo does not index them at all, so two posts filed
  together with no tag in common never meet.

`threshold` is how close a match has to be, from 0 (everything) to 100
(near-identical). `toLower` makes `Hugo` and `hugo` the same tag. The full set
is in [Hugo's related-content documentation](https://gohugo.io/content-management/related/).

**Weigh an index at or above `threshold` if a match on it alone should count.**
Below it, the index cannot qualify a post by itself — and it does not act as a
tie-breaker either: `categories` at 60 against a threshold of 80 produced lists
identical to having no categories index at all, ordering included. That is why
the block above weighs it 80, so that two posts filed together but tagged
differently are related. Weigh it lower and only a shared tag will do.

Candidates come from the article's own section, so a tagged About page never
appears under a heading that says "Related posts".

## Everything else the theme reads

The options below all work and none of them were written down anywhere. Three of
them — `mainSections`, `themeColor` and the `noindex` front matter — did not
even appear in the exampleSite, so the only way to find them was to read the
templates.

### Site params

| param | what it does |
| --- | --- |
| `enableThemeToggle` | shows the light/dark button in the menu |
| `enableReadingTime` | shows an estimated reading time on articles |
| `enableSharingButtons` | shows the sharing row under an article. Every http(s) link in it is `rel="noopener nofollow"`; the `mailto:` and `whatsapp:` ones are written with `noopener` alone, since there is no link equity to withhold on a scheme no crawler follows — and `--minify` drops even that, as redundant on a scheme that opens no window and on a `_blank` every current browser already treats as `noopener`. The Pinterest link sends the page's social picture as its `media` |
| `disableReadOtherPosts` | hides the previous/next links |
| `backgroundImage` | an image behind the front page, `cover`-sized and fixed. Used in dark mode |
| `backgroundImageLight` | the same for light mode. Without it light mode shows no image, rather than putting dark text over a dark picture |
| `themeColor` | `<meta name="theme-color">`, the browser UI tint on mobile |
| `ogImage` | the picture a social card falls back to when a page has no `cover`. Use PNG or JPEG — no platform renders an SVG card |
| `mainSections` | which section the footer's RSS icon and the 404 page point at. Defaults to `posts`. It does **not** decide which template renders an article: those resolve by section name, so articles belong in `content/posts/` |
| `customCSS` / `customJS` | extra files to load, each a path under `static/` or a remote URL |
| `gitUrl` | prefix for the commit link under an article. Needs `enableGitInfo = true` at the root |
| `plausibleDataDomain` / `plausibleScriptSource` | [Plausible](https://plausible.io) analytics; both are required |
| `llmsNote` | a line addressed to whatever reads `llms.txt`, printed under the summary. A page can set its own, see [Front matter](#front-matter) |
| `license` / `creditText` | the terms of reuse, carried in every article's `BlogPosting`. A page can override either |
| `llmsFullLimit` | how many pages `llms-full.txt` carries. Unset or `0` publishes every one |
| `ai` | which AI crawlers `robots.txt` turns away. **A table**, see [AI crawlers](#ai-crawlers) |
| `imageSizes` | the `sizes` attribute on every processed image — how wide it will be shown. Defaults to `(max-width: 800px) 100vw, 800px` |
| `imageMaxWidth` | caps the widest copy generated for `srcset`. Defaults to `1400` |

```toml
[params]
  themeColor   = "#1b1c1d"
  mainSections = ["posts"]
  customCSS    = ["css/extra.css"]
  customJS     = ["js/extra.js"]
```

`themeColor` is only emitted when set. An empty `content` is not
a neutral default — it is a tag asserting the value is blank.

#### Responsive images

Every image the theme processes goes out with a `srcset` of 480, 800 and 1200
pixel copies, plus one at `imageMaxWidth`, and a `sizes` telling the browser how
wide it will be shown before any of them have loaded. Only widths smaller than
the source are generated, so a small picture is never upscaled.

The defaults describe an image at the measure of an article. Change them when
your layout is not that:

```toml
[params]
  # A content column wider than an article: say so, or a wide viewport is told
  # the picture is 800px and picks a copy that then has to be stretched.
  imageSizes    = "(max-width: 1000px) 100vw, 1000px"
  # The widest copy worth generating. Lower it to cut the build and the bytes.
  imageMaxWidth = 1000
```

`sizes` has to describe the box the image really fills, and it costs you both
ways: declare it wider than the truth and every visitor fetches a file larger
than they will ever see, declare it narrower and they get one upscaled to fit.
Below the breakpoint the default already says `100vw`, so it is the wide-viewport
half that a wider column has to correct.

`partials/image.html` also takes `sizes` and `maxWidth` per call, for a picture
shown at a size of its own. The `image` shortcode does not forward them — it
passes `src`, `alt`, `position` and `style` only.

A page's `cover` becomes its `og:image` and `twitter:image`, falling back to
`ogImage`; `params.images` wins over both. One partial resolves that chain for
the Open Graph tags and the Twitter ones alike, so a card cannot name one
picture and show another.

The same picture becomes the `image` of the page's `BlogPosting`, which is where
Google's Article guidance asks for one — but only when it came from the page's
own `cover` or `images`. A site-wide `ogImage` still shows on the card and is
left out of the structured data, because it would claim one file as the subject
of every article on the site.

Where the picture resolves to a local file Hugo can measure, `og:image:width`
and `og:image:height` go out with it. Facebook and LinkedIn hold the first
render back until they have fetched and measured the file otherwise, which is
why a freshly shared link so often appears without its picture.

Three cases carry no dimensions. A remote URL, because there is nothing to
measure at build time. An SVG, because asking one for its size is a build error
— the same fact that keeps it off a card at all. And a picture under `static/`,
because Hugo does not make those files resources and a file it cannot open is a
file it cannot measure.

The card still works in that last case; only the size hint is missing. Move the
picture to `assets/` — or into the page bundle beside the article — and the
dimensions come back:

| where the cover lives | `og:image:width` |
| --- | --- |
| `assets/img/cover.png` | yes |
| page bundle, next to `index.md` | yes |
| `static/img/cover.png` | no |

Setting `images` used to be one of these too: Hugo's own Open Graph partial wrote
the `og:image` tags then, and could write several where the theme resolved one,
so a single pair of dimensions risked describing the wrong picture. The theme
owns that partial now and writes exactly one `og:image`, from the same source
`twitter:image` uses, so the dimensions always belong to the picture beside
them whichever way the image was configured.

An SVG is passed over wherever it appears in that chain — `images` and `cover`,
at page or site level, alike — since no platform renders one on a card. The
chain simply continues to the next candidate. Give the site an `ogImage` in PNG
or JPEG and an article illustrated with a diagram still shares with a picture on
it.

A card with a picture is announced as `summary_large_image` rather than the
small square, and carries an `og:image:alt` / `twitter:image:alt` — but only
when the picture belongs to the page. The site-wide `ogImage` is the same image
on every page, and describing it with this page's title would caption it with
something true of the article and false of the picture.

`twitter:site` is the handle of the account behind the site. It is read from the
`params.social` entry named `twitter` or `x`, as the last segment of its profile
URL, so `url = "https://twitter.com/janedoe"` is enough and there is nothing
extra to configure. A URL with no handle in it — the bare
`https://twitter.com/` — emits no tag.

One trap remains in the Open Graph partial: it absolutises `audio` and `videos`
with `absURL`, and a leading slash there resolves against the host rather than
the base URL. On a site served from a subpath, write them without one —
`audio = ["video/demo.mp4"]`, not `["/video/demo.mp4"]`. The theme now carries
its own copy of that partial and could correct it, but the copy is deliberately
Hugo's line for line apart from the two URLs it had to fix, so the next Hugo
release stays a readable diff; the correction belongs in a change of its own.

### Social links

The icons in the header and footer come from `params.social`, a list with one
entry per network:

```toml
[[params.social]]
  name   = "github"
  url    = "https://github.com/janedoe"
  newTab = true
```

| key | what it does |
| --- | --- |
| `name` | which icon to draw, matched case-insensitively and trimmed. See [docs/svgs.md](svgs.md) for the names the theme has |
| `url` | where the link goes |
| `newTab` | open the link in a new tab. **Default `false`**: the link replaces the page, and the visitor's back button still works. Quoted values count — `"false"` is off, like the boolean |
| `rel` | extra `rel` tokens, added after the `me noopener` the theme always writes |

A `name` the theme has no icon for draws a generic link glyph and warns during
the build, naming the value. It used to render an anchor with nothing inside it:
a link with no size, which no visitor could see or click.

`nonewpage = 0` is the deprecated spelling of `newTab = true`. It still works and
warns, quoted (`"0"`) as well as bare. The name said the opposite of what it did, and because an unset value is
nil rather than `0`, the only way to get a new tab was to write the "no new
page" key explicitly.

Write `params.social` as a **list**, not a map. The map form — `[params.social]`
with `twitter = "janedoe"` — is read for the Twitter card handle but draws no
icons, and the build warns when it sees one.

### Front matter

| key | what it does |
| --- | --- |
| `cover` / `coverCaption` | image above the article, caption takes Markdown |
| `noai` | keeps the page out of `llms.txt`, `llms-full.txt` and the Markdown listings, and stops its `<head>` advertising its Markdown copy. Nothing else changes — see [Keeping a page out of things](#keeping-a-page-out-of-things) |
| `llmsNote` | a line of your own at the end of this page's Markdown copy, and of its entry in `llms-full.txt` |
| `license` / `creditText` | the terms of reuse for this page, overriding `params.license` and `params.creditText` |
| `toc` | table of contents above the article, over the heading levels `markup.tableOfContents` selects — `h2` and `h3` until a site changes them |
| `audio` | an audio player above the article. **A list**, see below |
| `noindex` | `<meta name="robots" content="noindex">`, and the page is left out of `sitemap.xml` — see [Keeping a page out of things](#keeping-a-page-out-of-things). A page with `layout: search` is already treated this way and does not need it |
| `comments` | set to `false` to hide Disqus on that page. The string `"false"` is accepted too, which is what older versions required |
| `description` | overrides the summary in `<meta name="description">` and Open Graph |
| `author` | overrides the site author for that page |
| `twitter` | that page's author's handle, as `twitter:creator` on the card. The site's own account is `params.social`, above |

`audio` has to be a list, even for one file:

```yaml
audio: ["audio/episode-01.mp3"]
```

The Open Graph partial ranges over this key, so a bare string stops the build —
and it absolutises what it finds with `absURL`, which is why there is no leading
slash above. See
[Everything else the theme reads](#everything-else-the-theme-reads).

### Keeping a page out of things

`noindex` is the one to know about: it is how you keep a page out of a search
engine's results without touching `robots.txt`. It puts the tag on the page and
takes the page out of `sitemap.xml`, because a site that submits a URL and then
tells the crawler not to index what it finds is contradicting itself — a
contradiction search consoles report, and crawl budget spent on nothing. Its
translations stop pointing at it with `hreflang` for the same reason.

The search page is kept out the same way, without being asked. A page with
`layout: search` is thin by construction — an empty results list and a form —
and Google's guidance is to keep internal search results out of the index, since
there is no end to the URLs a crawler can generate from one. So the tag, the
sitemap entry and the `hreflang` set all follow the layout, in every language,
and there is nothing to write in the front matter. `searchable: false` does not
do this: it only keeps a page out of *this* site's search index, and says
nothing to a crawler.

Every page that is not kept out carries `max-image-preview:large` in the same
tag instead. It is what lets Google show a full-width picture beside the page in
Search and in Discover rather than a thumbnail. There is only ever one
`robots` tag: the directive is meaningless on a page that is not indexed, so
`noindex` replaces it rather than joining it.

Three switches, three audiences, and none of them is the others:

```yaml
---
title: "A page nobody should find"
noindex: true          # <meta name="robots" content="noindex">, and no sitemap entry
searchable: false      # keep it out of this site's search
noai: true             # keep it out of llms.txt, llms-full.txt and the Markdown listings
---
```

`noai` is the one to reach for when a page should be readable by people and by
search engines, and absent from what the theme publishes for machines: a draft
kept at its URL, a page whose canonical version lives elsewhere, an archive you
would rather not have quoted back at you. It also stops the `<head>` advertising
the page's Markdown copy.

It does not stop that copy being written. Whether a site publishes `.md` at all
is decided once in `[outputs]`, not per page, so the file is still there for
anyone who guesses the URL. A page that should not have one says so itself:

```yaml
outputs: ["HTML"]
```

`searchable` used to do this job as well as its own, which meant taking a page
out of the site's search took it out of the map for models too, and wanting the
opposite was not expressible. It is back to meaning one thing.

A page with `layout: search` is kept out of all three without being asked, for
the reason above: there is nothing in an empty results list to hand anybody.

`sitemap.disable` is Hugo's own switch and still works on its own, for a page
that should stay out of the sitemap while remaining indexable — a thin page that
is fine to land on but not worth submitting.

`_build.list: never` is the blunt version: it removes the page from the sitemap,
the lists, the feeds and the search index in one line, while still rendering it.
Use it when the page should exist at its URL and nowhere else.

## Search

Search is off until the site publishes an index, which is the home page
rendered as JSON:

```toml
[outputs]
  home = ["HTML", "RSS", "JSON"]
```

Then add a page and give it the `search` layout. Where it lives and what it is
called is yours to choose:

```markdown
---
title: "Search"
layout: search
searchable: false
---

Type a word or two.
```

`searchable: false` keeps the search page out of its own results. Any page can
use it to stay out of the index.

Add it to the menu like any other entry.

### What it costs

One JSON file, fetched the first time someone types — not on page load, and
not at all on any other page. The script is only loaded on the page using the
`search` layout.

The index carries each page's title, URL, date, tags, summary and the first
4000 characters of its text. Raise or lower that with
`params.searchContentLimit`. The showcase's four languages come to 10–17 KB
each.

There is no library and no third-party service. Matching is done in the
browser over that array.

### How it matches

Every word typed has to appear somewhere in the page — two words narrow the
result rather than widening it. Case is ignored, and so are accents: *resume*
finds *résumé*, because a reader searching for a word is not making that
distinction. A hit in the title counts for more than one in the body, and a
hit in a tag for more than that; ties are broken by date, newest first.

Each language gets its own index and searches only itself.

### Without JavaScript

The form is hidden in the markup and revealed by the script, so a visitor with
JavaScript off is told search is unavailable instead of being handed a box
that does nothing.

## llms.txt

A model handed a page has to find the prose between a menu, a share row and a
footer. Three output formats hand it the text directly, and a site pays for
none of them unless it asks.

`llms.txt` is a map of the site as plain text — a heading, a one-line summary,
then every page with a note. The convention is described at
[llmstxt.org](https://llmstxt.org). Ask for it on the home page:

```toml
[outputs]
  home = ["HTML", "RSS", "llms"]
```

That list replaces the whole of `home`, so a site using [Search](#search) —
which is `JSON` on the same key — names both rather than one after the other:
`home = ["HTML", "RSS", "JSON", "llms"]`.

It appears at `/llms.txt`, one per language, because a model reading the
French site should be handed French.

The summary under the heading is the one the front page already gives a search
engine: its own `description`, then `params.homeSubtitle`, then
`params.description`. A front page with a body — see
[Front page content](../README.md#front-page-content) — has that printed under
the summary, so a site that has already said what it is about does not say it
twice. Each page's note is its `description`, falling back to its summary.

`params.llmsNote` adds a line of your own, after both: what you would rather a
model did with the text, or what the site is not.

`noai: true` keeps a page out — of this file, of `llms-full.txt` and of the
Markdown listings alike. It is not `searchable`, which is about this site's own
search and nothing else; see
[Keeping a page out of things](#keeping-a-page-out-of-things).

## llms-full.txt

`llms.txt` is the map, `llms-full.txt` is the territory: the same pages, in the
same order, each carrying its text instead of a link to it. A reader that wants
the site takes it in one request rather than in one per page. It is the second
file [llmstxt.org](https://llmstxt.org) describes, and it is asked for on the
home page beside the first:

```toml
[outputs]
  home = ["HTML", "RSS", "JSON", "llms", "llmsfull"]
```

It appears at `/llms-full.txt`, one per language, and `llms.txt` names it above
its list, so nobody has to guess the file is there.

Every entry is the page exactly as [the Markdown copy](#the-site-as-markdown)
publishes it, from the same template, separated by a rule.

A blog of three hundred posts written out this way is several megabytes that
nobody will read, so there is a cap:

```toml
[params]
  llmsFullLimit = 50   # pages. Unset or 0 publishes every one
```

It keeps the first entries in the order `llms.txt` lists them — posts newest
first, then the other pages — so an older post still outranks a newer page, and
the notice says exactly that rather than claiming recency it cannot deliver:
*50 of 312 pages, in the order llms.txt lists them.* A truncated copy
presenting itself as the whole site is the one outcome worth avoiding.

## The site as Markdown

The third format publishes a page a second time as Markdown, at `index.md`
beside its `index.html`. Ask for it on every kind of page, not only on the
articles:

```toml
[outputs]
  page     = ["HTML", "md"]
  home     = ["HTML", "RSS", "md"]
  section  = ["HTML", "RSS", "md"]
  taxonomy = ["HTML", "RSS", "md"]
  term     = ["HTML", "RSS", "md"]
```

`page` alone covers the articles, which is where this started, and it leaves
the mirror holed exactly where its own links point: the front page, `/posts/`,
`/tags/` and `/tags/hugo/` are the pages a reader navigates *through*, and one
that followed a link to `/posts/index.md` used to find nothing there and fall
back to the HTML. With the four other kinds on, every page of the site is
reachable from `/index.md` without reading a line of HTML.

Each list replaces the whole of Hugo's default for that kind, which is why
`RSS` is named again above: leaving it out drops the section and taxonomy
feeds.

A list page's Markdown is its title, its own description, its body, then its
children as links to their own `.md`. The children are listed whole rather than
one pager at a time — pagination is a reading aid for a screen, and a file
fetched in one request has no reason to make the rest of a section a second
request.

The page's own `<head>` advertises the copy, so a reader that prefers Markdown
can find it without guessing:

```html
<link rel="alternate" type="text/markdown" href=".../index.md" />
```

When both formats are on, `llms.txt` links the Markdown rather than the HTML.
With only `llms.txt` on, it links the HTML.

What is published is what you wrote — headings, lists, code fences, tables and
links all survive, because it is the source rather than the rendered page.
Shortcodes are the one thing rendered, since `{{< video >}}` means nothing
outside Hugo; they become the HTML they would have produced, which Markdown
passes through and which carries the real URLs rather than a guess at them.

A shortcode that renders its own body sends it through Goldmark, whose
typographer writes curly quotes and dashes as HTML entities. Those are decoded
on the way out, so the Markdown reads as text; `&lt;` and `&amp;` are left
alone, since a code sample inside a shortcode needs them.

Each file ends with the canonical URL, so a passage quoted out of it can be
traced back to the page it came from.

## Licence and credit

`llms.txt` says how to read the site and `robots.txt` says who may. This says on
what terms, and it travels with the text rather than sitting in a footer nobody
extracts:

```toml
[params]
  license    = "https://creativecommons.org/licenses/by-nc-sa/4.0/"
  creditText = "Jane Doe"
```

Both land in the `BlogPosting` of every article, beside the author and the dates
that were already there. A page overrides either in its front matter, for the one
post under different terms:

```yaml
license: "https://creativecommons.org/licenses/by/4.0/"
```

`license` is a URL, because that is what schema.org means by it — the licence
itself, not its name. `creditText` is the string to put on a credit line.
Neither is emitted when unset, here as everywhere else in the theme.

## AI crawlers

`llms.txt` says *how* to read the site. This says *who* may — and the question
worth asking is not "AI yes or no" but what the fetch is for. A training
crawler reads the site once and the text ends up inside a model, unattributed.
A retrieval crawler reads it to answer somebody's question now, and the answer
carries a link back. Most people who want a policy want to refuse the first and
keep the second, so this is two switches rather than one:

```toml
[params.ai]
  train = false   # read the site to train a model
  cite  = true    # read it to answer a question, with a link back
```

Both default to `true`, and a site that sets neither gets the `robots.txt` it
always got — one group and the sitemap. Nothing changes for anyone who has not
asked for it. `enableRobotsTXT = true` at the root is what makes Hugo write the
file at all.

With the two settings above, `robots.txt` comes out as:

```
User-agent: *
Disallow:
Content-Signal: search=yes, ai-input=yes, ai-train=no

# Declined: fetched to train a model, with no link back.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: CCBot
User-agent: Google-Extended
...
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

Only what is refused gets a group of its own. Silence is permission in
`robots.txt`, so an `Allow` for the rest would say nothing the wildcard group
above does not already say.

A third key, `search`, appears in `Content-Signal` and nowhere else, and
defaults to `yes`. The three signals split the uses cleanly, so it is worth
being exact about which is which: `search` is being indexed and shown as a
link, `ai-input` (your `cite`) is being read to build an answer, `ai-train`
(your `train`) is being learned from. Setting `search = false` therefore asks
to be left out of the results, not out of the answers — that is `cite = false`.

### Who is in each list

`data/aiCrawlers.yaml`, kept current the way `data/langFlags.yaml` is, so a
site names an intention instead of maintaining a list of robots. `train` holds
`GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended`, `Applebot-Extended`,
`meta-externalagent` and the rest; `cite` holds `OAI-SearchBot`, `Claude-User`,
`Claude-SearchBot`, `PerplexityBot` and the others that fetch a page to answer
with it. Two of those are tokens with no crawler behind them —
`Google-Extended` and `Applebot-Extended` exist only to be named here, while
`Googlebot` and `Applebot` stay search.

Disagree with a list and your own `data/aiCrawlers.yaml` merges over the
theme's. To write the groups yourself instead:

```toml
[params.ai]
  crawlers = """
User-agent: GPTBot
Disallow: /
"""
```

That text is emitted verbatim in place of the generated groups.
`Content-Signal` still follows `train`, `cite` and `search`, so the two halves
can now disagree — the theme is stating an intention next to a list it did not
write, and only you know whether they match. Nothing checks it for you: the
theme's own CI builds this configuration, but it runs
`check-robots.mjs --custom-groups`, which drops exactly the assertions that
compare the groups with the signal.

### What this is and is not

`robots.txt` is a request. What honours it, honours it; the rest is a matter
for the CDN, and no theme can change that.

`Content-Signal` is a [Cloudflare proposal][content-signals] from September
2025, added to several million domains at once, and not a standard. It costs
one line, and it is worth saying plainly that it is a declaration of intent
rather than a lock.

And the split is only as clean as the tokens allow. `Google-Extended` governs
both training Gemini and grounding its answers in your pages, and Google
publishes no second token for the two, so `train = false` costs you the Google
answer box whatever `cite` says. It stays in the training list because that is
what people mean when they refuse training — but the promise of this feature is
one token short of complete, and it is better said here than discovered later.

Both are worth having anyway. A policy that is ignored by some is still the
difference between having said no and never having been asked.

[content-signals]: https://searchengineland.com/cloudflare-content-signals-462538
