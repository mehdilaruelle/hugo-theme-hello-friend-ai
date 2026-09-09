+++
title = "A page that asked to be indexed, in a string"
noindex = "false"
+++

`noindex` written as the string `"false"` rather than the boolean. A template
reads any non-empty string as true, so this page used to carry the robots tag
and drop out of `sitemap.xml` — the opposite of what its front matter asks.

It is here so the spelling is built on every run: this page should appear in
`sitemap.xml` and carry no `robots` tag.
