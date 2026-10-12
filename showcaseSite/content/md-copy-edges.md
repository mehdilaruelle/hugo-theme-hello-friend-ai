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
