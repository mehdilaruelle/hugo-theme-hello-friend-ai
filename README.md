# Hello Friend IA

**[See the theme live →](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ia/)**
&nbsp;·&nbsp;
[every option turned on →](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ia/showcase/)

[![Hello Friend IA](images/screenshot.png)](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ia/)

**100 on accessibility, best practices and SEO** on PageSpeed Insights — on both
demo sites, on mobile and on desktop, with every option in the theme switched on
at once. Performance is 100 on desktop on both; on mobile the latest run gives
the demo 99 and the showcase 96.
[The four reports →](#speed)

> **This is a fork.** All the credit for the theme goes to
> [Djordje Atlialp (@rhazdon)](https://github.com/rhazdon), who wrote
> [hugo-theme-hello-friend-ng](https://github.com/rhazdon/hugo-theme-hello-friend-ng).
> This fork exists to keep the theme current with Hugo; upstream has not shipped
> a change since November 2025. See [Differences from upstream](#differences-from-upstream).
>
> Fork maintained by [@mehdilaruelle](https://github.com/mehdilaruelle)
> ([X](https://x.com/mehdilaruelle)). Report anything specific to this fork
> here; anything about the theme itself belongs upstream.

## General informations

This theme was highly inspired by the [hello-friend](https://github.com/panr/hugo-theme-hello-friend) and [hermit](https://github.com/Track3/hermit). A lot of kudos for their great work.

## Differences from upstream

- Builds warning-free on Hugo 0.164: `languageCode`, `.Site.Data`,
  `.Site.LanguageCode` and the LibSass transpiler have all been migrated off
  their deprecated forms.
- Uses the template layout introduced in Hugo 0.146 (`layouts/_partials/`,
  `_shortcodes/`, `_markup/`, `page.html`, `list.html`, `home.html`).
- SCSS uses the Sass module system (`@use`) and compiles with Dart Sass, which
  is now required: LibSass does not implement `@use` and silently emitted a
  stylesheet with no CSS in it.
- Fixes two selectors that made inline code lose its styling entirely.
- Emits JSON-LD structured data, and completes the `hreflang` set with
  `x-default`. See [SEO](#seo).
- Writes a `robots.txt` that names the sitemap Hugo leaves out, and — when a
  site asks for one — an AI policy split the way the fetches differ: training
  on one side, answering with a link on the other. See
  [AI crawlers](docs/config.md#ai-crawlers).
- Renders `content/_index.md` on the front page, which upstream ignores. See
  [Front page content](#front-page-content).
- CI builds the exampleSite on every change and fails on any new deprecation.
- The exampleSite is published as a
  [live demo](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ia/) on
  every push, so what you see is what the current code produces. A second build
  of the same site, with
  [every option turned on](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ia/showcase/),
  is published alongside it — and built in CI, so an optional feature cannot
  break unnoticed.

---

## Table of Contents

- [Differences from upstream](#differences-from-upstream)
- [Features](#features)
  - [Speed](#speed)
- [SEO](#seo)
- [Requirements](#requirements)
- [How to start](#how-to-start)
- [How to configure](#how-to-configure)
- [More](#more-things)
  - [The font, and the fallbacks](#the-font-and-the-fallbacks-that-match-it)
  - [Where to put the portrait](#where-to-put-the-portrait)
  - [Front page content](#front-page-content)
  - [Built in shortcodes](#built-in-shortcodes)
    - [image](#image)
    - [video](#video)
    - [faq](#faq)
  - [Code highlighting](#code-highlighting)
  - [Favicon](#favicon)
  - [Audio Support](#audio-support)
- [Social Icons](#social-icons)
- [Known issues](#known-issues)
- [How to edit the theme](#how-to-edit-the-theme)
- [Sponsoring](#sponsoring)
- [Licence](#licence)

---

## Features

- Theming: **dark/light mode**, depending on your system preferences or the users choice
- Great reading experience thanks to [**Inter font**](https://rsms.me/inter/), made by [Rasmus Andersson](https://rsms.me/about/)
- Nice code highlighting, server side, with Hugo's built-in [**Chroma**](https://github.com/alecthomas/chroma)
- An easy way to modify the theme with Hugo tooling
- Fully responsive
- Support for audio in posts (thanks to [@talbotp](https://github.com/talbotp))
- Builtin (enableable/disableable) multilanguage menu
- Support for social icons
- Support for sharing buttons
- Support for [Commento](https://gitlab.com/commento/commento) (commento.io is gone; see also [Comentario](https://comentario.app), its maintained successor)
- Support for [Plausible](https://plausible.io) (thanks to [@Joffcom](https://github.com/Joffcom))
- Support for [utterances](https://utteranc.es/) comment system
- Front page content from `content/_index.md`, see [Front page content](#front-page-content)
- JSON-LD structured data, breadcrumbs and a complete `hreflang` set, see [SEO](#seo)
- 100 on accessibility, best practices and SEO on both demo sites, see [Speed](#speed)
- Optional `llms.txt`, `llms-full.txt` and a Markdown copy of every page, list pages included, see [llms.txt](docs/config.md#llmstxt)
- A declarative AI crawler policy: refuse training without refusing citation, see [AI crawlers](docs/config.md#ai-crawlers)
- Per-page AI control: `noai` to keep one page out of the text outputs, and a licence that travels with the text, see [Keeping a page out of things](docs/config.md#keeping-a-page-out-of-things)

### Speed

Both demo sites are measured, not a private one, so you can re-run these
yourself. Accessibility, best practices and SEO are **100 everywhere**, and
performance is 100 on desktop:

| | performance | accessibility | best practices | SEO |
| --- | --- | --- | --- | --- |
| [demo, desktop](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ia/zaeq4mt669?form_factor=desktop) | 100 | 100 | 100 | 100 |
| [demo, mobile](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ia/zaeq4mt669?form_factor=mobile) | 99 | 100 | 100 | 100 |
| [showcase, desktop](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ia-showcase/9xv9eq5bpw?form_factor=desktop) | 100 | 100 | 100 | 100 |
| [showcase, mobile](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ia-showcase/9xv9eq5bpw?form_factor=mobile) | 96 | 100 | 100 | 100 |

Measured on 6 September 2026.

**Read a mobile performance score as a range.** Speed Index is the metric that
moves: two runs of the demo nine hours apart, with nothing changed that the home
page renders, read 3.8 s and 1.5 s — scoring 97 and 99 — while FCP, LCP, TBT and
CLS stayed exactly where they were. Re-run before believing a drop.

What does not move is small, and Lighthouse says where it goes. It hands out the
mobile score in five parts, and on the demo run above four of them are full: FCP
10/10, TBT 30/30, CLS 25/25, Speed Index 10/10. The missing point is LCP, 24/25,
at 2.0 s. The showcase loses four the same way — LCP 2.3 s and FCP 1.7 s — on a
page that turns every option in the theme on at once: four languages, a
background image, thumbnails, excerpts, covers, diagrams, maths and search.

The largest thing Lighthouse still offers, around 205 KiB under efficient cache
lifetimes, is not the theme's to give: GitHub Pages serves everything with
`Cache-Control: max-age=600`. Every asset the theme emits is fingerprinted, so
on a host where you set headers yourself, a year and `immutable` is safe and
that item disappears.

None of it is bought with layout: **Cumulative Layout Shift is 0 on all four**,
and Total Blocking Time is 0 ms.

Your content, your images and anything you add have as much say in the result
as the theme does. What the theme contributes is the part it controls:

- **No client-side highlighter.** Hugo colours code at build time with Chroma,
  so a page with code ships no JavaScript for it. See
  [Code highlighting](#code-highlighting).
- **A metric-matched fallback font, one face per weight**, so the swap to
  Inter moves nothing. See [The font](#the-font-and-the-fallbacks-that-match-it).
- **Images measured and resized**, with `width`, `height` and a `srcset`, so
  nothing reflows when a picture arrives. See
  [Where to put the portrait](#where-to-put-the-portrait).
- **KaTeX and Mermaid are opt-in per page**, so a page without a formula or a
  diagram fetches neither.
- **`imageSizes` and `imageMaxWidth`**, which decide how many bytes a phone
  downloads for a picture. Set them if your content column is not the measure of
  an article. See [Responsive images](docs/config.md#responsive-images).

## SEO

Nothing to configure. Every page already carries a canonical link, Open Graph
and Twitter Card tags. On top of that:

**One URL per page.** A paginated list gives each pager its own canonical, since
each is a distinct set of posts rather than a copy of page one — and `og:url`,
which is the canonical Facebook and LinkedIn read, names the same URL as the
`<link rel="canonical">` beside it. `og:title` and the `<title>` both say which
pager it is, and `rel="prev"` and `rel="next"` say what it is a pager of —
Google retired those as an indexing signal in 2019, Bing did not.

**The same page in another language** is named twice over: as `hreflang`, with
an `x-default`, and as `og:locale:alternate` for the platforms that read Open
Graph and nothing else. Both sets follow one rule, so they cannot disagree — a
translation kept out of the index appears in neither.

**`max-image-preview:large`**, so Google can show a full-width picture beside
the page in Search and in Discover instead of a thumbnail — except on a page
that is kept out of the index, where the directive would say nothing. There is
one `robots` tag either way. A search page is kept out without being asked: it
is thin by construction, and Google's guidance is to keep internal search
results unindexed. See
[Keeping a page out of things](docs/config.md#keeping-a-page-out-of-things).

**JSON-LD**, and only JSON-LD. Google reads it in preference to microdata, and
the theme no longer emits any: Hugo's embedded `schema.html` wrote six
`itemprop` attributes with no `itemscope` to hold them, which parses to nothing.
Structured data of your own goes in
[`layouts/_partials/extra-head.html`](#how-to-edit-the-theme). The home page is
described as a `WebSite`, and any dated single page
as a `BlogPosting` carrying its headline, description, dates, author, publisher,
language, word count, and its image and tags when it has them. A page with no
date is a `WebPage`: its URL, name, language and its own description, and
nothing the theme would have to invent to say.

The values come from what you already set: `author` (a string or a map with a
`name`, in the page or in the site params), `description` — falling back to a
trimmed summary — and the picture, which is the one the social card shows: the
page's `images` or its `cover`, resolved by the same partial so the two can
never disagree. The site-wide fallback is not borrowed here. It is the right
picture for a card, which shows whatever it is handed, and the wrong one for
structured data, where it would assert one file as the subject of every article
on the site.

**`Person`.** A name on its own is a string. What makes it an entity a search
engine can recognise is the evidence tying it to the same person elsewhere, so
the author of the site is described as a `Person` carrying `sameAs` — every
`params.social` URL, which is the same claim `rel="me"` already makes on the
links themselves. An email entry is an address rather than a profile and is left
out. `params.portrait.path` becomes the image, and `params.author` carries the
rest: a job title, a sentence of description, the subjects the author works in,
and the qualifications behind them.

```toml
[params.author]
  name        = "Jane Doe"
  jobTitle    = "Platform Engineer"
  description = "Writes about Hugo, and about the parts of the web that hold still."
  knowsAbout  = ["Hugo", "Static site generators", "Web typography"]

  [[params.author.credentials]]
    name     = "Certified Hugo Themer"
    category = "certification"
    url      = "https://example.com/badges/hugo-themer"
    issuer   = "Hugo"
```

`knowsAbout` and `credentials` are the two that say something a name and a job
title do not. Each entry under `credentials` becomes an
`EducationalOccupationalCredential`, where `name` is the only field that has to
be there:

| field | becomes | what it is |
| --- | --- | --- |
| `name` | `name` | the qualification |
| `category` | `credentialCategory` | what kind of thing it is |
| `url` | `url` | the credential itself — the badge, the certificate, the page that shows it |
| `issuer` | `recognizedBy` | the body that awarded it, as an `Organization` |

`url` is the credential and not its issuer, because that is what `url` means on
any schema.org `Thing`. An issuer homepage there would tell a crawler the
homepage is the credential, and say the same of every credential from that
issuer — `recognizedBy` is the property for the awarding body. An entry with no
name is dropped rather than emitted empty.

All of it is optional, and a site setting none of it emits exactly the `Person`
it emitted before.

The same `Person` is the author of every article, under one `@id`, so it reads
as one person rather than as a name repeated. An article that names its own
author in its front matter gets that name and nothing else — the site owner's
profiles and job title are not theirs to claim.

**`publisher`.** A `BlogPosting` names who published it. Left alone, that is the
site owner as the `Person` above: on a personal site the publisher is the
person, and an `Organization` carrying nothing but the site title says less than
the entity already described in full. A page naming its own author does not move
the publisher, since a guest writer did not publish the site.

A site published by an organisation says so, and gives the logo Google asks for
alongside the name:

```toml
[params.publisher]
  name = "Acme Inc."
  logo = "/img/logo.png"
```

The logo is resolved like the portrait, from `assets/` first and then from
`static/`, and carries its dimensions when Hugo can measure it. `name` on its
own falls back to the site title.

**`BreadcrumbList`.** A single page that sits in a section carries the trail
to it, so a search result shows *Home › Blog › the title* in place of the bare
URL. The current page is named but not linked, which is what Google asks for.
A page at the root of the site gets none: *Home › About* says nothing the URL
did not.

The section is named by its `linkTitle`, and by its title when it has none. A
section title that works in a search result says what the section is about, and
that is too long to read as one step of a trail:

```toml
+++
title     = "Articles on Vault, Terraform and AWS"
linkTitle = "Blog"
+++
```

**`ProfilePage`.** An about page is not an article and has no date, so it used
to come out with no structured data at all, which is backwards for the page
that exists to say who is behind the site. Give it `schema = "ProfilePage"` in
its front matter and it is described as one, with the `Person` above as its
`mainEntity` under the same `@id`:

```toml
+++
title  = "About"
schema = "ProfilePage"
+++
```

**`hreflang="x-default"`.** Translated pages list every language, and the
primary one is additionally tagged `x-default`, which is what a search engine
serves to a visitor whose language matches none of them. Primary means first in
`hugo.Sites`, i.e. the language with the lowest `weight`, so ordering your
languages orders this too.

## Requirements

- **Hugo extended**, version **0.158.0 or newer** (tested against 0.164.0). The
  extended edition is required because the theme compiles SCSS.
- **[Dart Sass](https://sass-lang.com/install/)** — required.

The stylesheet is written in the Sass module system (`@use`), which only Dart
Sass implements, and Hugo does not bundle it. Install it with one of:

``` bash
brew install sass/sass/sass          # macOS / Linuxbrew
choco install sass                   # Windows
snap install dart-sass               # Linux
npm install -g sass-embedded         # any platform
```

Without it the build stops and says so. It used to fall back to LibSass
instead, which does not implement `@use`: it passed the rules through as
unknown at-rules and emitted a stylesheet with no CSS in it, reporting no
error — a build that looked successful and shipped an unstyled site.

## How to start

You can download the theme manually by going to [https://github.com/mehdilaruelle/hugo-theme-hello-friend-ia](https://github.com/mehdilaruelle/hugo-theme-hello-friend-ia) and pasting it to `themes/hello-friend-ia` in your root directory.

You can also clone it directly to your Hugo folder:

``` bash
git clone https://github.com/mehdilaruelle/hugo-theme-hello-friend-ia.git themes/hello-friend-ia
```

If you don't want to make any radical changes, it's the best option, because you can get new updates when they are available. To do so, include it as a git submodule:

``` bash
git submodule add https://github.com/mehdilaruelle/hugo-theme-hello-friend-ia.git themes/hello-friend-ia
```

The directory name matters: keep it `hello-friend-ia`, since that is the value `theme` takes in your configuration.

Coming from an earlier version, the names changed: the repository moved from
`hugo-theme-hello-friend-ng-ia` to `hugo-theme-hello-friend-ia`, and the theme
directory from `hello-friend-ng` to `hello-friend-ia`. GitHub redirects the old
clone and submodule URLs, so fetching still works; Hugo redirects nothing, so
the directory has to be renamed by hand.

If you cloned the theme, or pasted it in:

``` bash
mv themes/hello-friend-ng themes/hello-friend-ia
```

If you added it as a submodule, the old path is recorded in `.gitmodules`, in
the index and in `.git/config` as well, so moving the directory on its own
leaves the next `git submodule update` — and any fresh clone of your site —
pointing at a path that no longer exists:

``` bash
git mv themes/hello-friend-ng themes/hello-friend-ia
git submodule set-url themes/hello-friend-ia https://github.com/mehdilaruelle/hugo-theme-hello-friend-ia.git
git submodule sync themes/hello-friend-ia
git commit -am "Rename the theme directory"
```

Either way, finish by setting `theme = "hello-friend-ia"` in your
configuration. Miss that step and Hugo reports
`module "hello-friend-ng" not found`.

The section name matters too: articles go in `content/posts/`. Hugo resolves an
article's template by section name, and the theme's article layouts are
`layouts/posts/page.html` and `layouts/posts/section.rss.xml`. A section named
anything else falls back to the generic page template and to Hugo's built-in
feed — silently, with no error and no warning. What that costs:

- on the page: reading time, date, word count, last-modified, sharing buttons,
  previous/next links, Disqus, Commento, Utterances, the description
  standfirst, the audio player
- in the feed: the full-text `<content:encoded>`, the theme's channel metadata,
  and `services.rss.limit`

`params.mainSections` does not move this. It points the footer's RSS icon and
the 404 page at a section; it does not change which template renders an
article.

For the original, unforked theme, use
[rhazdon/hugo-theme-hello-friend-ng](https://github.com/rhazdon/hugo-theme-hello-friend-ng) instead.

## How to configure

The theme doesn't require any advanced configuration. Just copy the following config file.
To see all possible configurations, [check the docs](docs/config.md).
Note: There are more options to configure. Take a look into the `config.toml` in `exampleSite`.

``` toml
baseurl      = "localhost"
title        = "My Blog"
locale       = "en-US"
theme        = "hello-friend-ia"
pagination.pagerSize     = 10

[params]
  dateform        = "Jan 2, 2006"
  dateformShort   = "Jan 2"
  dateformNum     = "2006-01-02"
  dateformNumTime = "2006-01-02 15:04"

  # Subtitle for home
  homeSubtitle = "A simple and beautiful blog"

  # Set disableReadOtherPosts to true in order to hide the links to other posts.
  disableReadOtherPosts = false

  # Enable sharing buttons, if you like
  enableSharingButtons = true
  
  # Show a global language switcher — a globe in the header, beside the theme
  # toggle, at every screen width
  enableGlobalLanguageMenu = true

  # Metadata mostly used in document's head
  description = "My new homepage or blog"
  images = [""]

[taxonomies]
    category = "blog"
    tag      = "tags"
    series   = "series"

[languages]
  [languages.en]
    title = "Hello Friend IA"
    copyright = '<a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener">CC BY-NC 4.0</a>'
    readOtherPosts = "Read other posts"

  [languages.en.params]
    subtitle  = "A simple theme for Hugo"

    [languages.en.params.logo]
      logoText = "hello friend ia"
      logoHomeLink = "/"
    # or
    #
    # path = "/img/your-example-logo.svg"
    # alt = "Your example logo alt text"

  # And you can even create generic menu
  [[menu.main]]
    identifier = "blog"
    name       = "Blog"
    url        = "/posts"

  # and submenus
  [[menu.main]]
    identifier  = "parent"
    name        = "Parent"
    url         = "/parent"
    hasChildren = true

  [[menu.main]]
    identifier  = "child"
    name        = "Child"
    url         = "/parent/child"
    parent      = "parent"
```

## More things

### The font, and the fallbacks that match it

Inter loads with `font-display: swap`, so a page is painted in whatever the
system offers and repainted in Inter. Two fonts with different metrics take
different amounts of room, so that second paint used to move everything under
the text. The theme declares fallback faces told to occupy exactly the space
Inter will, so the swap costs nothing, and preloads the regular weight so it
happens sooner.

There is **one face per weight** the theme asks Inter for. A fallback family
with a single face is matched for every weight, and the browser is left to
synthesise the rest. Headings are the visible case: `h1` to `h6` keep the
browser's own `font-weight: bold`, which resolves to Inter Bold, and against a
single regular face they came out too narrow, then widened when Inter arrived.
Measured over the ten headings of one article:

```text
                     mean error   worst
one regular face         -4.02%   -4.98%
one face per weight      -0.10%   -1.31%
```

The defaults are measured from the fonts shipped here, not copied from an
article:

```text
unitsPerEm 2816, winAscent 2728, winDescent 680, lineGap 0
  read from static/fonts/Inter-Regular.woff and Inter-Bold.woff, head and OS/2
  the three weights share them
Inter is 105.39% the width of Arial
Inter Medium is 100.16% the width of Arial Bold
Inter Bold is 102.33% the width of Arial Bold
  measured over ten headings and pangrams in English and French
```

**Replace the font files and keep the family name, and these numbers describe a
font that is no longer there**, which shifts the page rather than steadying it.
Nothing can detect that, so it is yours to override. The flat keys are the
regular face, weight 400, and the two tables are the weights above it:

```toml
[params.fontFallback]
  sizeAdjust      = "105.39%"
  ascentOverride  = "91.92%"
  descentOverride = "22.91%"
  lineGapOverride = "0%"
  local           = ["Arial", "Helvetica", "Liberation Sans"]

  # weight 600, which the theme maps to Inter Medium
  [params.fontFallback.semiBold]
    sizeAdjust      = "100.16%"
    ascentOverride  = "96.73%"
    descentOverride = "24.11%"
    lineGapOverride = "0%"
    local           = ["Arial Bold", "Arial-BoldMT", "Helvetica Bold", "Helvetica-Bold", "Liberation Sans Bold"]

  # weight 700 to 900, which the theme maps to Inter Bold
  [params.fontFallback.bold]
    sizeAdjust      = "102.33%"
    ascentOverride  = "94.67%"
    descentOverride = "23.60%"
    lineGapOverride = "0%"
    local           = ["Arial Bold", "Arial-BoldMT", "Helvetica Bold", "Helvetica-Bold", "Liberation Sans Bold"]
```

Set `semiBold = false` or `bold = false` to drop one of them, or
`fontFallback = false` under `params` to drop all three and leave the swap as it
was.

`.github/scripts/font-metrics.mjs` reads the first four numbers out of any WOFF:

```bash
node .github/scripts/font-metrics.mjs static/fonts/Inter-Bold.woff
```

The width ratio needs a rendering engine rather than a parser, so measure it in
a browser with the font loaded, against the weight and the local font the face
actually names, and divide the overrides by it. `size-adjust` rescales the em
box, and a percentage against `font-size` has to compensate:

```js
const c = document.createElement("canvas").getContext("2d")
const w = f => { c.font = f; return c.measureText(sample).width }
w("800 100px Inter") / w("700 100px Arial")   // the bold face
```

Measure over several samples: the ratio moves by two points or more between one
piece of running text and the next, and digits move it further still.

A missing local font is safe: the face has no source, the browser skips it, and
the family falls through to the face below it, which is where every weight
started.

### Where to put the portrait

The front page portrait is measured like any other image, so it goes out with
`width` and `height`. Without them nothing reserves its space, and the title,
the subtitle and everything under them move when the file arrives, which is a
layout shift on the page that gets looked at most.

A portrait wider than the cap is also resized to it and converted to WebP. One
already at or below it is left in the format you saved it in, and only gains
its dimensions.

For any of that to happen the file has to be somewhere Hugo can read as a
resource, which means `assets/`:

```text
assets/img/portrait.png     measured, resized if oversized, given its dimensions
static/img/portrait.png     emitted as it is, with none of them
```

Its URL does not change, and it stays served at that URL for whatever else
points at it, `params.images` and your `og:image` included. Nothing breaks if
you leave it in `static/`: the portrait is simply emitted unprocessed, as it
was before.

The cap is twice `params.portrait.maxWidth` when that is given in pixels, and
512 otherwise.

### Front page content

The front page shows a portrait, the site title, `homeSubtitle` and the social
icons. Add a `content/_index.md` and its body is rendered between the subtitle
and the icons:

```markdown
---
title: "Home"
---

Platform engineer, writing about AWS and Terraform. Start with
[the Terraform series]({{< ref "/posts/terraform" >}}).
```

Ordinary Markdown, set to the same measure and alignment as a post rather than
centred with the title. A site with no `_index.md` gets the front page exactly
as before.

Worth having: the front page is the page search engines weigh most, and a name
with a one-line subtitle gives them, and a first-time visitor, nothing to read.

A `description` in its front matter also becomes the page's meta description,
in place of `homeSubtitle` — that line is written to be read on the page, and a
search result gives you more room than it uses. Without one, `homeSubtitle`
stays the fallback.

The [showcase](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ia/showcase/)
has one, in all four of its languages. The
[default demo](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ia/)
has none, so the two sites show the front page with it and without.

### Built-in shortcodes

Of course you are able to use all default shortcodes from hugo (https://gohugo.io/content-management/shortcodes/).

#### image

Properties:

  - `src` (required)
  - `alt` (optional)
  - `position` (optional, default: `left`, options: [`left`, `center`, `right`])
  - `style`

Example:

``` golang
{{< image src="/img/hello.png" alt="Hello Friend" position="center" style="border-radius: 8px;" >}}
```

#### video

Plays a clip in place of an animated GIF: the same silent loop, a fraction of
the weight. Encode once with ffmpeg and drop the files next to your images.

Properties:

  - `src` (required, the path **without** an extension)
  - `poster` (optional, an image shown before the clip loads)
  - `width` / `height` (optional but recommended — a video has no size until it
    loads, and the page jumps around without them)
  - `alt` (optional, becomes the accessible name)
  - `controls` (optional, default `false`; `true` drops the autoplay and the
    loop, so the clip waits to be started. The player controls are emitted
    either way — a loop has to be stoppable)
  - `position` (optional, options: [`left`, `center`, `right`])
  - `formats` (optional, default `webm,mp4`; emitted in that order and the
    browser takes the first it can play, so put the smaller encoding first)

Example:

``` golang
{{< video src="/video/demo" poster="/video/demo.jpg" width="1600" height="900" alt="A session being recorded" >}}
```

Converting a GIF, scaled to twice the width the theme renders. Both encodings
need `-pix_fmt yuv420p`: a GIF carries an alpha channel that neither H.264 nor
VP9 will accept.

``` bash
ffmpeg -i demo.gif -vf "scale=1600:-2:flags=lanczos" -c:v libvpx-vp9 -crf 34 -b:v 0 -pix_fmt yuv420p -an demo.webm
ffmpeg -i demo.gif -vf "scale=1600:-2:flags=lanczos" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an demo.mp4
ffmpeg -i demo.gif -vf "scale=1600:-2:flags=lanczos" -frames:v 1 demo.jpg
```

#### faq

A question and its answer, written once and read twice: a `<details>` element
for a person, and a `FAQPage` block in the `<head>` for a machine.

```markdown
{{< faq "Does the theme send anything to a service?" >}}
No. Everything is produced at build time.
{{< /faq >}}
```

The answer takes Markdown. Repeat the shortcode for each pair; they collect into
one `FAQPage` per page. The `<details>` opens without JavaScript.

Use it where a page really is a list of questions, and nowhere else — it is the
only shortcode here that asks you to write content in a particular shape, and a
theme has no business dictating the form of a post. Google restricted the FAQ
rich result to government and health sites in 2023, so expect the markup to be
read rather than drawn; answer engines read it either way.

### Code highlighting

Hugo colours your code as it builds the page, with its built-in Chroma
highlighter. All you need to do is to wrap your code like this:

<pre>
``` html
  // your code here
```
</pre>

The theme used to ship PrismJS on top of this, 178 KB of JavaScript re-doing
work Hugo had already done at build time. It is gone, and the language label it
wrote above each block is now drawn in CSS from the `data-lang` attribute Hugo
emits.

Chroma is configured in your site config rather than in the theme, and it is
worth setting a style:

```toml
[markup.highlight]
  codeFences = true
  style      = "monokai"
```

The [style gallery](https://xyproto.github.io/splash/docs/) shows what is
available. A language Chroma does not know is rendered as plain text in the
page's own colours, which stays readable in either theme.

### Favicon

Check the [docs](docs/favicons.md).

### Audio Support

You wrote an article and recorded it? Or do you have a special music that you would like to put on a certain article? Then you can do this now without further ado.

In your article add to your front matters part:

```yaml
audio: path/to/file.mp3
```

## Social Icons:

A large variety of social icons are available and can be configured like this:

```toml
[[params.social]]
  name = "<site>"
  url = "<profile_URL>"
```

Take a look into this [list](docs/svgs.md) of available icon options. 

If you need another one, just open an issue or create a pull request with your wished icon. :)

## Known issues

There is a bug in Hugo that sometimes causes the main page not to render correctly. The reason is an taxonomy part with empty entries.
Related issue tickets: [!14](https://github.com/rhazdon/hugo-theme-hello-friend-ng/issues/14) [!59](https://github.com/rhazdon/hugo-theme-hello-friend-ng/issues/59).

Either you comment it out completely or you write the following in

``` toml
[taxonomies]
  tag      = "tags"
  category = "categories"
```

In case you'd like to actually have an empty taxonomy, you can do so by specifying the following (i.e. without adding any entries to the taxonomy part):

``` toml
[taxonomies]
```

## How to edit the theme

Just edit it. You don't need any node stuff. ;)

The theme follows the template layout introduced in Hugo 0.146, so when you
override something in your own site, mind these locations:

| What | Where |
| --- | --- |
| Partials | `layouts/_partials/` |
| Shortcodes | `layouts/_shortcodes/` |
| Markdown render hooks | `layouts/_markup/` |
| Home page | `layouts/home.html` |
| Single pages | `layouts/page.html` |
| List pages (section, taxonomy, term) | `layouts/list.html` |
| Text outputs (`llms.txt`, `llms-full.txt`, Markdown) | `layouts/home.llms.txt`, `layouts/home.llmsfull.txt`, `layouts/{home,list,page}.md.md` |
| Base template | `layouts/baseof.html` |
| Extra `<head>` tags | `layouts/_partials/extra-head.html` |

Styles live in `assets/scss/`. They use the Sass module system (`@use`), so a
partial that needs a variable or a mixin loads it explicitly, e.g.
`@use "variables" as *;`.

## Sponsoring

The theme is Djordje Atlialp's work, so the coffee should go to him: <br />
<a href="https://www.buymeacoffee.com/djordjeatlialp" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-green.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>

## Licence

Original work Copyright © 2018 Track3, © 2019 panr <br />
Modified work Copyright © 2019-2025 Djordje Atlialp <br />
Modified work Copyright © 2026 mehdilaruelle

The theme is released under the MIT License. See [LICENSE.md](LICENSE.md), and the [upstream license](https://github.com/rhazdon/hugo-theme-hello-friend-ng/blob/master/LICENSE.md) for additional licensing information.
