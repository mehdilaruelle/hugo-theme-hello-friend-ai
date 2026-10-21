# Writing content

## Where to put the portrait

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
512 otherwise. A bare number means pixels, quoted or not — `120` is `"120px"` —
and `0` leaves the width unset.

## Front page content

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

The [showcase](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ai/showcase/)
has one, in all four of its languages. The
[default demo](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ai/)
has none, so the two sites show the front page with it and without.

## Pictures in Markdown

A picture written the plain way goes through the same code as the `image`
shortcode:

```markdown
![A dune at dusk](dune.jpg "Optional title")
```

When the file is a resource — beside the page in a bundle, or under `assets/` —
it is converted to WebP and offered at 480, 800 and 1200 pixels and at its own
width, never wider than it is nor than `params.imageMaxWidth` (1400 by default),
and given `width` and `height`, so nothing moves when it arrives. A 1600-pixel
photograph no longer goes to a phone whole. A picture 480 pixels wide or
narrower has nothing to shrink, so it keeps its own format and is only
measured, as is an SVG; an animated GIF keeps its animation.

Anything else is served as it was:

```text
![…](dune.jpg)            in the page bundle: resized, converted, measured
![…](img/dune.jpg)        found in assets/img/: resized, converted, measured
![…](/img/dune.jpg)       assets/img/ first, as above; else static/: as written
![…](dune.jpg)            beside a page that is not a bundle: as written
![…](https://…)           remote: as written, never fetched
```

A url with a query or a fragment is also left as written: it names no resource.
A `width` or `height` given in an attribute block is kept, in place of the
measured pair. In the Markdown copy, a picture from `assets/` links its
original, which is then published beside the resized ones.

The first picture of a page that has no cover is fetched at once and ahead of
the rest, since it is likely the largest thing on screen; every later one is
lazy. A cover takes that place when there is one.

The title becomes the `title` attribute. With
`markup.goldmark.parser.attribute.block` on, a picture standing alone takes an
attribute block, `{.wide #hero}`, and keeps it; attributes the theme writes
itself, such as `loading` or `srcset`, keep the theme's value; a `style` is kept.
Hugo drops any `on…` handler from the block before the theme sees it.

To keep Hugo's own rendering, put a `layouts/_markup/render-image.html` of
your own in the site; it replaces the theme's.

## Alerts

GitHub's alert syntax is drawn as a callout: a coloured edge, an icon and a
title.

```markdown
> [!NOTE]
> Worth knowing, even when skimming.
```

There are five, each with its own colour and icon: `[!NOTE]`, `[!TIP]`,
`[!IMPORTANT]`, `[!WARNING]` and `[!CAUTION]`. The marker is not case
sensitive. The title is written in the page's language, in all 21 that the
theme translates, and words after the marker replace it, Markdown included:

```markdown
> [!WARNING] Before you *upgrade*
> Back up the site first.
```

A `-` or a `+` right after the marker folds the alert into a `<details>`,
closed or open, which opens on its title without JavaScript:

```markdown
> [!TIP]- The long way round
> Hidden until the title is clicked.
```

Hugo accepts any word as a type, so `[!DANGER]` or Obsidian's other callouts
build too. The theme does not know them: they get the neutral colour, the
note's icon, the word as their title, and a class of their own,
`alert-danger`, for a stylesheet of yours to colour.

The title is a paragraph, not a heading, so it stays out of the table of
contents; the icon is hidden from screen readers, which read the title. The
colours are tokens, `--alert-note` to `--alert-caution`, each 4.5:1 or more on
the page in both schemes, and the edge follows the direction of the language.

Every other blockquote renders as it did. The Markdown copy and `llms-full.txt`
keep the alert as you wrote it, marker and all, which is how GitHub and most
readers of Markdown expect it.

To keep Hugo's own rendering, put a `layouts/_markup/render-blockquote.html` of
your own in the site; it replaces the theme's.

## Built-in shortcodes

Of course you are able to use all default shortcodes from hugo (https://gohugo.io/content-management/shortcodes/).

### image

Properties:

  - `src` (required)
  - `alt` (optional)
  - `position` (optional, default: `left`, options: [`left`, `center`, `right`])
  - `style`

Example:

``` golang
{{< image src="/img/hello.png" alt="Hello Friend" position="center" style="border-radius: 8px;" >}}
```

### video

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

### gallery

A grid of thumbnails, each a link to the full picture. The pictures are files,
not a list written into the call: put them in the page's folder — a
[page bundle](https://gohugo.io/content-management/page-bundles/) — and the
gallery shows them, ordered by file name.

```
content/posts/a-trip/
├── index.md
└── photos/
    ├── 01-arrival.jpg
    └── 02-harbour.jpg
```

```markdown
{{< gallery match="photos/*" >}}
```

Properties:

  - `match` (optional, a glob over the bundle's files. Without it the gallery
    takes every image in the bundle, a `cover` included, so give the gallery a
    folder of its own. When nothing in the bundle matches, the same glob is
    tried against `assets/`)
  - `columns` (optional, `2`, `3` or `4`, default `3`; a phone shows two at most)

Each thumbnail is cropped from the centre to a 600×600 square, so pictures of any
shape line up. The link goes to the file as it is, uncropped and unresized. An
SVG cannot be cropped and is left out, and so is a file under `static/`: Hugo
does not treat those as resources. A gallery that finds nothing warns and
names the page, which stops a build run with `--panicOnWarning`.

Alt text and a caption belong to the file, so they are written once in the
front matter rather than in the shortcode call. The caption takes Markdown:

```toml
[[resources]]
  src = "photos/01-arrival.jpg"
  [resources.params]
    alt     = "The ferry coming into a grey harbour"
    caption = "Arrival, *early*"
```

`src` is a glob, so a file name holding `[`, `]`, `{`, `}`, `*` or `?` takes a
backslash before each, in single quotes: `src = 'photos/lake \[copy\].jpg'`.
Unescaped, it can match another file or none: the alt lands on the wrong
picture, or this one falls back to its file name.

A thumbnail is a link, and a link needs a name, so a picture with no `alt`
falls back to its resource `title` if the front matter sets one, then to its
file name — `01-arrival.jpg` reads "01 arrival". Write the `alt`.

### faq

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

## Code highlighting

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

## Audio Support

You wrote an article and recorded it? Or do you have a special music that you would like to put on a certain article? Then you can do this now without further ado.

In your article add to your front matters part:

```yaml
audio: path/to/file.mp3
```
