# Performance

Both demo sites are measured, not a private one, so you can re-run these
yourself. Both are **100 across the board**, on mobile and on desktop:

| | performance | accessibility | best practices | SEO | agentic browsing |
| --- | --- | --- | --- | --- | --- |
| [demo, desktop](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ai/zeo42l0acb?form_factor=desktop) | 100 | 100 | 100 | 100 | 100 |
| [demo, mobile](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ai/zeo42l0acb?form_factor=mobile) | 100 | 100 | 100 | 100 | 100 |
| [showcase, desktop](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ai-showcase/8r7wpox7me?form_factor=desktop) | 100 | 100 | 100 | 100 | 100 |
| [showcase, mobile](https://pagespeed.web.dev/analysis/https-mehdilaruelle-github-io-hugo-theme-hello-friend-ai-showcase/8r7wpox7me?form_factor=mobile) | 100 | 100 | 100 | 100 | 100 |

Measured on 30 September 2026 with Lighthouse 13, on these URLs.

**Read a mobile performance score as a range.** Earlier runs put the demo's home
page at 99, 97 and 97 and the showcase at 99, with Speed Index the part that
moved most. The theme changed between some of those runs, so not every point of
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
