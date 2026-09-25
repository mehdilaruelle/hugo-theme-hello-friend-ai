+++
title = "The `<b>` element, and a <kbd> tag"
date = "2025-12-02"
description = "A title with a code span: what the code span holds reaches the reader as written."
tags = ["hugo"]
+++

The heading above holds a code span, `` `<b>` ``, and a bare tag, `<kbd>`.
Outside the code span the theme escapes `<` so Goldmark does not drop the tag
as raw HTML. Inside it, Goldmark escapes the text itself, so the theme leaves
it alone: escaping it too used to show `&lt;b>` in the heading.
