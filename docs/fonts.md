# The font, and the fallbacks that match it

Inter loads with `font-display: swap`, so a page is painted in whatever the
system offers and repainted in Inter. Two fonts with different metrics take
different amounts of room, so that second paint used to move everything under
the text. The theme declares fallback faces told to occupy exactly the space
Inter will, so the swap costs nothing, and preloads the regular and bold
weights, which every page draws, so it happens sooner.

Each face is split by script into `static/fonts/Inter-<Face>.<subset>.woff2`,
where the subset is `latin`, `latin-ext`, `cyrillic`, `greek` or `symbols`,
and a page downloads only the files whose `unicode-range` it draws: a page in
English fetches about 25 KB per weight instead of 100.
`.github/scripts/subset-fonts.py` writes them from the full faces.

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
  read from static/fonts/Inter-Regular and Inter-Bold, head and OS/2
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

`fontFallback = true` keeps all three at the measured defaults, which is also
what an unset `fontFallback` does.

`.github/scripts/font-metrics.mjs` reads the first four numbers out of any WOFF or WOFF2:

```bash
node .github/scripts/font-metrics.mjs static/fonts/Inter-Bold.latin.woff2
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
