+++
title = "A page whose images key is a string"
images = "img/example.png"
noindex = true
+++

`images` is documented as a list, and a bare string is the mistake people make.
`index` on a Go string returns the byte at that offset, so this page's card used
to name `/105` — the byte value of `i` — on both halves at once, which is why
agreeing was never enough for `check-cards.mjs` to check.

A page may of course link to [the page kept out](https://example.com/subpath/showcase/kept-out/) in prose.
