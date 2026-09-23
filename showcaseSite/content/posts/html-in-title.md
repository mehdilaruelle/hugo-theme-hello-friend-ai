+++
title = "Using <details> in a *title*, with \"quotes\""
date = "2025-12-01"
description = "A title that names an HTML element: it reaches the reader as text, and its Markdown still renders."
tags = ["hugo"]
+++

The heading above names `<details>`. Goldmark treats a tag in a title as raw
HTML and drops it, so the heading used to read "Using in a title", and a build
run with `--panicOnWarning` failed outright. The theme escapes `<` before the
title is rendered as Markdown: the element's name stays text, and the emphasis
and curly quotes still render.
