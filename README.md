# Hello Friend AI

**[See the theme live →](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ai/)**
&nbsp;·&nbsp;
[every option turned on →](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ai/showcase/)

[![Hello Friend AI](https://raw.githubusercontent.com/mehdilaruelle/hugo-theme-hello-friend-ai/master/images/screenshot.png)](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ai/)

**100 on accessibility, best practices and SEO** on PageSpeed Insights — on both
demo sites, on mobile and on desktop, with every option in the theme switched on
at once. Lighthouse 13's agentic browsing category is 100 on all four runs too.
Performance is 100 on desktop on both; on mobile, 100 on the demo and 99 on the
showcase.
[The four reports →](docs/performance.md)

> **This is a fork.** All the credit for the theme goes to
> [Djordje Atlialp (@rhazdon)](https://github.com/rhazdon), who wrote
> [hugo-theme-hello-friend-ng](https://github.com/rhazdon/hugo-theme-hello-friend-ng).
> This fork exists to keep the theme current with Hugo; upstream has not shipped
> a change since November 2025. See [Differences from upstream](#differences-from-upstream).
>
> Fork maintained by [@mehdilaruelle](https://github.com/mehdilaruelle)
> ([X](https://x.com/mehdilaruelle)). Report anything specific to this fork
> here; anything about the theme itself belongs upstream.

## About

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
  `x-default`. See [SEO](docs/seo.md).
- Writes a `robots.txt` that names the sitemap Hugo leaves out, and — when a
  site asks for one — an AI policy split the way the fetches differ: training
  on one side, answering with a link on the other. See
  [AI crawlers](docs/config.md#ai-crawlers).
- Renders `content/_index.md` on the front page, which upstream ignores. See
  [Front page content](docs/content.md#front-page-content).
- CI builds the exampleSite on every change and fails on any new deprecation.
- The exampleSite is published as a
  [live demo](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ai/) on
  every push, so what you see is what the current code produces. A second build
  of the same site, with
  [every option turned on](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ai/showcase/),
  is published alongside it — and built in CI, so an optional feature cannot
  break unnoticed.

---

## Documentation

| | |
| --- | --- |
| [Installing](docs/install.md) | as a Hugo Module, upgrading from an older name, where articles go |
| [Configuration](docs/config.md) | every option the theme reads, site-wide and per page |
| [Writing content](docs/content.md) | the portrait, front page content, shortcodes, code highlighting, audio |
| [SEO](docs/seo.md) | canonical URLs, `hreflang`, JSON-LD and what feeds it |
| [Performance](docs/performance.md) | the Lighthouse reports, and what the theme does for the score |
| [The font](docs/fonts.md) | Inter, and the fallback faces that keep the swap from moving the page |
| [Favicons](docs/favicons.md) | the files the theme links, and the ones it does not |
| [Social icons](docs/svgs.md) | every icon `params.social` can draw |

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
- Support for a self-hosted [Commento](https://gitlab.com/commento/commento) or [Comentario](https://comentario.app) instance
- Support for [Plausible](https://plausible.io) (thanks to [@Joffcom](https://github.com/Joffcom))
- Support for [utterances](https://utteranc.es/) comment system
- Front page content from `content/_index.md`, see [Front page content](docs/content.md#front-page-content)
- JSON-LD structured data, breadcrumbs and a complete `hreflang` set, see [SEO](docs/seo.md)
- 100 on accessibility, best practices, SEO and agentic browsing on both demo sites, see [Performance](docs/performance.md)
- Optional `llms.txt`, `llms-full.txt` and a Markdown copy of every page, list pages included, see [llms.txt](docs/config.md#llmstxt)
- A declarative AI crawler policy: refuse training without refusing citation, see [AI crawlers](docs/config.md#ai-crawlers)
- Per-page AI control: `noai` to keep one page out of the text outputs, and a licence that travels with the text, see [Keeping a page out of things](docs/config.md#keeping-a-page-out-of-things)

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

You can download the theme manually by going to [https://github.com/mehdilaruelle/hugo-theme-hello-friend-ai](https://github.com/mehdilaruelle/hugo-theme-hello-friend-ai) and pasting it to `themes/hello-friend-ai` in your root directory.

You can also clone it directly to your Hugo folder:

``` bash
git clone https://github.com/mehdilaruelle/hugo-theme-hello-friend-ai.git themes/hello-friend-ai
```

If you don't want to make any radical changes, it's the best option, because you can get new updates when they are available. To do so, include it as a git submodule:

``` bash
git submodule add https://github.com/mehdilaruelle/hugo-theme-hello-friend-ai.git themes/hello-friend-ai
```

The directory name matters for all three of those: keep it `hello-friend-ai`, since that is the value `theme` takes in your configuration.

To install it as a Hugo Module instead, to move from a directory the theme had
under an older name, and for why articles belong in `content/posts/`, see
[Installing](docs/install.md).

For the original, unforked theme, use
[rhazdon/hugo-theme-hello-friend-ng](https://github.com/rhazdon/hugo-theme-hello-friend-ng) instead.

## How to configure

Nothing is required beyond `theme`. A starting point:

``` toml
baseURL = "https://example.com/"
title   = "My Blog"
locale  = "en-US"
theme   = "hello-friend-ai"
pagination.pagerSize = 10

[params]
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
  tag      = "tags"
  category = "categories"
  series   = "series"

[languages]
  [languages.en]
    title = "Hello Friend AI"
    copyright = '<a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener">CC BY-NC 4.0</a>'

  [languages.en.params]
    subtitle       = "A simple theme for Hugo"
    readOtherPosts = "Read other posts"

    [languages.en.params.logo]
      logoText = "hello friend ai"
      logoHomeLink = "/"
    # or
    #
    # path = "/img/your-example-logo.svg"
    # alt = "Your example logo alt text"

  # A menu, with a submenu under an entry that others name as their parent
  [[menu.main]]
    identifier = "blog"
    name       = "Blog"
    url        = "/posts"

  [[menu.main]]
    identifier = "parent"
    name       = "Parent"
    url        = "/parent"

  [[menu.main]]
    identifier = "child"
    name       = "Child"
    url        = "/parent/child"
    parent     = "parent"
```

Every option is in [docs/config.md](docs/config.md), and
[`exampleSite/config.toml`](exampleSite/config.toml) is a working site that
sets most of them.

## Social icons

A large variety of social icons are available and can be configured like this:

```toml
[[params.social]]
  name = "<site>"
  url = "<profile_URL>"
```

Take a look into this [list](docs/svgs.md) of available icon options. 

If you need another one, just open an issue or create a pull request with your wished icon. :)

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
