+++
title = "Everything an article is made of"
description = "Headings, code, tables, quotes and images, on one page, so nothing goes unstyled"
date = "2026-01-10"
type = ["posts","post"]
toc = true
# Overrides the site licence; the note goes at the end of the Markdown copy.
license = "https://creativecommons.org/licenses/by/4.0/"
llmsNote = "The prose here is a typography specimen. Quote it for what the theme does with text, not for what it says."
math = true
tags = ["hugo", "development"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

Every element below is something the theme styles. They are gathered here so a
change to the stylesheet has one page that shows all of it at once, rather than
being noticed months later on somebody's blog.

## Code

Highlighted by Chroma as Hugo builds the page, with the language taken from the fence:

```go
func main() {
	sites := []string{"example", "showcase"}
	for i, s := range sites {
		fmt.Printf("%d: %s\n", i, s)
	}
}
```

Inline `code` sits inside a sentence without breaking the line height, which is
a thing this theme once got wrong in two selectors at the same time.

## Tables {data-columns=3}

| option | default | what it does |
| --- | --- | --- |
| `enableThumbnails` | off | cover images on list pages |
| `defaultTheme` | unset | follows the operating system |
| `direction` | `ltr` | mirrors the layout for right-to-left languages |

## Quotes

> A theme should look like itself out of the box, not like a feature list.

## Lists

1. Ordered, for steps that happen in order
2. With a second item, so the indent is visible
   - and a nested unordered one
   - which is where left and right margins show up in a right-to-left language


## Mathematics

`math = true` in the front matter loads KaTeX on this page and no other. Inline
\(a^2 + b^2 = c^2\), and set apart:

$$
\int_0^\infty e^{-x}\,dx = 1
$$

Nested indices put a `]]>` in the source — \(A[i[j]]>0\) — and passthrough
emits it raw. That sequence ends a CDATA section, which is why the feed has to
escape it rather than pass it on.

It is opt-in rather than detected from the content, because `$$` is ordinary
text in a shell snippet and a false positive would fetch 300 KB for nothing.

## Images

The `image` shortcode, centred:

{{< image src="img/example.png" alt="A screenshot of the theme" position="center" >}}

`position` stays physical on purpose. Asking for `left` means the left of the
page, in any language — unlike the margins around it, which mirror.

## A shortcode with a body

A callout is a site's own shortcode, not the theme's. It renders its body, so the body picks up the typographer -- and a code sample inside it keeps `a < b` written as an entity.

{{< callout >}}
What I'd call a callout: "quoted", spaced ... and `a < b` in code.
{{< /callout >}}
