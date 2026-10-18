+++
title = "Learn C #"
description = "- a description that opens like a list"
noindex = true
+++

Front-matter text opens two Markdown blocks in this page's copy: the title an
H1, whose closing " #" Markdown would drop, and the description a quote, where
"- " would start a list. Both are carried as text.

Entities are decoded for the reader, outside code only. A code span shows one
as written: `&rsquo;`. So does a fence:

```html
<p>It&rsquo;s &mdash; written as entities</p>
```

&#43; this line is a paragraph, and a decoded "+" opening it would make it a
list item.

A footnote's second paragraph is prose, not code.[^edge]

[^edge]: The note.

    Its second paragraph: it&rsquo;s decoded.

```md
> ```
inside a plain fence, &rsquo; stays
```

> ```
> a fence the quote leaves open

Out of the quote, it&rsquo;s prose again.
