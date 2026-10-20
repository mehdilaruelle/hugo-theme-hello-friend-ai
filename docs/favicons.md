# Favicons

Use [RealFaviconGenerator](https://realfavicongenerator.net/) to generate these
files, and put them in your site's `static` folder:

| file | how it is reached |
| --- | --- |
| `favicon.ico` | linked by the theme |
| `favicon-16x16.png` | linked by the theme |
| `favicon-32x32.png` | linked by the theme |
| `apple-touch-icon.png` | linked by the theme |
| `safari-pinned-tab.svg` | linked by the theme |
| `site.webmanifest` | linked by the theme |
| `android-chrome-192x192.png` | named inside `site.webmanifest`, not in the HTML |
| `android-chrome-512x512.png` | named inside `site.webmanifest`, not in the HTML |
| `mstile-150x150.png` | named inside `browserconfig.xml`, which Windows looks for at the site root |

The six the theme links are each linked **only when the file is present**, so a
site without them emits no broken links. The theme looks in `static/`; a site
whose `staticDir` is elsewhere names it, or a list of them, as
`params.favicon.staticDir`. The last three are never referenced
from the HTML at all — they are reached through the two files that name them,
which RealFaviconGenerator generates alongside the images. Ship those two files
too, or the three images are dead weight.

## A site with no favicon

A browser that finds no icon linked asks for `/favicon.ico` anyway, and a site
without one answers with a 404, an error in the console. So when the theme links
neither `favicon.ico` nor a PNG icon, it links an empty one instead:

```html
<link rel="icon" href="data:,">
```

That is no request at all, and the tab shows the browser's default icon, as it
did before.

Two things to know:

- A `favicon.ico` the theme cannot see is no longer asked for either. If yours
  is in a `staticDir` other than `static/`, or in another theme's
  `themes/<name>/static`, name that directory in `params.favicon.staticDir` and
  it is linked as usual.
- A Content-Security-Policy with an `img-src` that leaves out `data:` blocks the
  empty icon, and Firefox reports that in the console. Ship a favicon, or allow
  `data:` there.

## Colours

Two of the tags carry a colour, and neither is guessed:

```toml
[params.favicon]
  # Safari's pinned-tab icon is a silhouette, and takes its colour from here.
  mask          = "#1b1c1d"
  # The Windows tile.
  msapplication = "#1b1c1d"
```

Each is emitted only when set. The browser's own default is a better answer than
a tag asserting the colour is blank.

The tint of the browser UI on mobile is a different thing and lives at the top
level, as `params.themeColor` — see
[Everything else the theme reads](config.md#site-params).
