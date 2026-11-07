# Performance

Both demo sites are measured, not a private one, so you can re-run these
yourself: each link below starts a fresh PageSpeed Insights run. Both home pages
are **100 across the board**, on mobile and on desktop:

| | performance | accessibility | best practices | SEO | agentic browsing |
| --- | --- | --- | --- | --- | --- |
| [demo, desktop](https://pagespeed.web.dev/report?url=https%3A%2F%2Fmehdilaruelle.github.io%2Fhugo-theme-hello-friend-ai%2F&form_factor=desktop) | 100 | 100 | 100 | 100 | 100 |
| [demo, mobile](https://pagespeed.web.dev/report?url=https%3A%2F%2Fmehdilaruelle.github.io%2Fhugo-theme-hello-friend-ai%2F&form_factor=mobile) | 100 | 100 | 100 | 100 | 100 |
| [showcase, desktop](https://pagespeed.web.dev/report?url=https%3A%2F%2Fmehdilaruelle.github.io%2Fhugo-theme-hello-friend-ai%2Fshowcase%2F&form_factor=desktop) | 100 | 100 | 100 | 100 | 100 |
| [showcase, mobile](https://pagespeed.web.dev/report?url=https%3A%2F%2Fmehdilaruelle.github.io%2Fhugo-theme-hello-friend-ai%2Fshowcase%2F&form_factor=mobile) | 100 | 100 | 100 | 100 | 100 |

Measured on 7 November 2026 with Lighthouse 13.6, three runs per row, every
one of them 100. These are Lighthouse's default mobile and desktop settings,
the ones PageSpeed Insights uses, but run from a container rather than Google's
servers, so the timings are that machine's:

| | Largest Contentful Paint | Speed Index |
| --- | --- | --- |
| demo, mobile | 1.1 s | 1.1–1.6 s |
| demo, desktop | 0.3 s | 0.5 s |
| showcase, mobile | 0.9 s | 1.1–1.5 s |
| showcase, desktop | 0.3 s | 0.4–0.5 s |

The previous measurement, with PageSpeed Insights on 30 September 2026, gave
the same scores.

**These are home pages, not articles.** An article is scored on what it carries,
and a photograph is most of that. The theme resizes and measures it when the
file is in the page bundle or `assets/`, whether it is written in Markdown,
`![alt](photo.jpg)`, or comes from the `image` shortcode, the cover or the
gallery, see below. A file under `static/` or on another host is served as you
put it there: not resized, not converted, and with no `width` or `height`. A
large one costs mobile performance points when it is the Largest Contentful
Paint.

**Read a mobile performance score as a range.** Earlier runs put the demo's home
page at 99, 97 and 97 and the showcase at 99, with Speed Index the part that
moves most: across the three mobile runs above it varies by up to half a
second, without leaving 100. The theme changed between some of those runs, so not every point of
the difference is noise, but not every point is code either. Re-run before
believing a drop, or a gain.

The largest thing Lighthouse still offers, efficient cache lifetimes, is not the
theme's to give: GitHub Pages serves everything with `Cache-Control: max-age=600`. Every asset the theme emits is fingerprinted, so
on a host where you set headers yourself, a year and `immutable` is safe and
that item disappears.

**On agentic browsing.** Lighthouse 13 added the category, and both sites return
100 on it. Take the number for what it measures: on a page with no WebMCP
integration it comes down to a well-formed accessibility tree and a
Cumulative Layout Shift of 0, which is the same markup discipline a screen reader
benefits from. Its `llms.txt` check does not contribute here at all — it reports
*not applicable*, because it looks at the origin root and these demos are served
from a subpath of `github.io`. The file is where it should be relative to each
site, and on a blog at its own domain root the check would see it.

None of it is bought with layout: **Cumulative Layout Shift is 0 on all four**,
and Total Blocking Time is 0 ms.

Your content, your images and anything you add have as much say in the result
as the theme does. What the theme contributes is the part it controls:

- **No client-side highlighter.** Hugo colours code at build time with Chroma,
  so a page with code ships no JavaScript for it. See
  [Code highlighting](content.md#code-highlighting).
- **A metric-matched fallback font, one face per weight**, so the swap to
  Inter moves nothing. See [The font](fonts.md).
- **Images measured and resized**, with `width`, `height` and a `srcset`, so
  nothing reflows when a picture arrives — one written in Markdown, the
  `image` shortcode's, the cover's and the gallery's, when the file is in the
  page bundle or `assets/`. One under `static/` or on another host is served
  as it is. See [Pictures in Markdown](content.md#pictures-in-markdown) and
  [Where to put the portrait](content.md#where-to-put-the-portrait).
- **KaTeX and Mermaid are opt-in per page**, so a page without a formula or a
  diagram fetches neither.
- **`imageSizes` and `imageMaxWidth`**, which decide how many bytes a phone
  downloads for a picture. Set them if your content column is not the measure of
  an article. See [Responsive images](config.md#responsive-images).
- **Only the flags your site can draw.** The theme draws a flag in one place,
  the "Also available in" line, for a language mapped in `data/langFlags.yaml`.
  It used to carry all 534 of `flag-icons`' SVGs and all ~530 of its CSS rules
  regardless: 5.8 MB copied into every build and 25 744 of the stylesheet's
  57 612 bytes, on monolingual sites too. Now the rules are generated per site
  and the files are published on demand. The four-language showcase ships 8
  SVGs; the monolingual demo ships none and no flag CSS at all.

  | | demo (1 language) | showcase (4 languages) |
  | --- | --- | --- |
  | flag files | 534 → **0** | 534 → **8** |
  | stylesheet | 57 612 → **31 868 B** | 57 612 → **32 260 B** |
  | gzipped | 9 149 → **6 447 B** | 9 149 → **6 520 B** |
  | whole build | 9 MB → **3 MB** | 12 MB → **6 MB** |

  Measured when the change landed. The stylesheet has grown since with the
  features added after it, to 41 728 B (7 882 B gzipped) on the demo.

  Nothing to configure, and adding a language to `data/langFlags.yaml` in your
  own site is enough to get its flag.
