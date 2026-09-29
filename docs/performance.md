# Performance

Both demo sites are measured, not a private one, so you can re-run these
yourself. Everything except the showcase's mobile performance is **100 across
the board**:

| | performance | accessibility | best practices | SEO | agentic browsing |
| --- | --- | --- | --- | --- | --- |
| [demo, desktop](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ai/2zspm8emma?form_factor=desktop) | 100 | 100 | 100 | 100 | 100 |
| [demo, mobile](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ai/2zspm8emma?form_factor=mobile) | 100 | 100 | 100 | 100 | 100 |
| [showcase, desktop](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ai-showcase/u57zu2ffew?form_factor=desktop) | 100 | 100 | 100 | 100 | 100 |
| [showcase, mobile](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ai-showcase/u57zu2ffew?form_factor=mobile) | 99 | 100 | 100 | 100 | 100 |

Measured on 13 September 2026 with Lighthouse 13.4.1, on these URLs.

The CI holds the three that do not vary to it: `lighthouse.yml` builds both
sites as Pages lays them out and fails a pull request that drops accessibility,
best practices or SEO below 100 on six pages, or shifts the layout at all. Mobile
performance moves from one runner to the next, so below 95 it only warns.

**Read a mobile performance score as a range.** The demo's home page has read
99, 97 and 97 before this 100, with Speed Index the part that moved most: 1.5 s,
3.8 s and 3.9 s, now 1.1 s. The theme changed between some of those runs,
so not every point of the difference is noise — but not every point is code
either. Re-run before believing a drop, or a gain.

Lighthouse hands out the mobile score in five weighted parts. The demo takes all
five in full: First Contentful Paint 10/10 at 0.9 s, Largest Contentful Paint
25/25 at 1.5 s, Speed Index 10/10 at 1.1 s, Total Blocking Time 30/30 and
Cumulative Layout Shift 25/25.

The showcase loses its one point in fractions: FCP 9.6/10 at 1.5 s, LCP 24.3/25
at 2.0 s, Speed Index 9.8/10 at 2.5 s, with TBT and CLS in full. The two pages
weigh the same — 228 KiB against 232, most of it the two Inter faces — so the
gap is not bytes. It is three requests the demo does not make, and they are the
showcase's own options rather than the theme's: its `custom.css`, which blocks
rendering, its `custom.js`, and the background SVG. Lighthouse puts
render-blocking at an estimated 1,200 ms on the showcase against 430 ms on the
demo. A page with four languages, thumbnails, excerpts, covers, diagrams, maths
and search still scores 99.

The largest thing Lighthouse still offers, around 205 KiB under efficient cache
lifetimes, is not the theme's to give: GitHub Pages serves everything with
`Cache-Control: max-age=600`. Every asset the theme emits is fingerprinted, so
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
  nothing reflows when a picture arrives. See
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

  Nothing to configure, and adding a language to `data/langFlags.yaml` in your
  own site is enough to get its flag.
