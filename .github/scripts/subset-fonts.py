# Splits each Inter face into the subsets _fonts.scss declares, so a page
# downloads only the scripts it draws. Needs fonttools and brotli.
#
#   python .github/scripts/subset-fonts.py <dir of full Inter-*.woff2> static/fonts
#
# The full faces are Inter 3.19, as this theme shipped them before the split:
#   git show 091b810:static/fonts/Inter-Regular.woff2 > Inter-Regular.woff2
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

# Keep in step with $inter-subsets in assets/scss/_fonts.scss. "symbols" is
# every other code point the face carries, so nothing Inter drew is lost.
# latin is Google Fonts' latin, plus the pagination's arrows and the example
# footer's heart, each of which would otherwise fetch symbols on every page.
SUBSETS = {
    "latin": "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2190-2193, U+2212, U+2215, U+2764, U+FEFF, U+FFFD",
    "latin-ext": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1D00-1DBF, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    "cyrillic": "U+0301, U+0400-052F, U+1C80-1C8A, U+20B4, U+2116, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
    "greek": "U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF, U+1F00-1FFF",
}


def parse(ranges):
    out = set()
    for part in ranges.split(","):
        lo, _, hi = part.strip()[2:].partition("-")
        out.update(range(int(lo, 16), int(hi or lo, 16) + 1))
    return out


def fmt(points):
    points, spans = sorted(points), []
    for p in points:
        if spans and p == spans[-1][1] + 1:
            spans[-1][1] = p
        else:
            spans.append([p, p])
    return ", ".join(f"U+{a:04X}" if a == b else f"U+{a:04X}-{b:04X}" for a, b in spans)


src, dst = Path(sys.argv[1]), Path(sys.argv[2])
named = set().union(*map(parse, SUBSETS.values()))
symbols = None
for face in sorted(src.glob("Inter-*.woff2")):
    cmap = set(TTFont(face).getBestCmap())
    rest = cmap - named
    if symbols is not None and rest != symbols:
        sys.exit(f"{face.name}: carries other symbols than the faces before it")
    symbols = rest
    for name, points in [*((n, parse(r)) for n, r in SUBSETS.items()), ("symbols", rest)]:
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.name_languages = ["*"]
        opts.notdef_outline = True
        font = TTFont(face)
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=points & cmap)
        sub.subset(font)
        font.flavor = "woff2"
        font.save(dst / f"{face.stem}.{name}.woff2")

print("symbols:", fmt(symbols))
