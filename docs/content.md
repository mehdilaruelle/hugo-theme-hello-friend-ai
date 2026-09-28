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
