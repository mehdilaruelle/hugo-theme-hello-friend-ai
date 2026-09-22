+++
title = "A page that asked for a table of contents and has nothing to list"
description = "toc = true on a page with no headings. The box used to render anyway, titled and empty, between two rules."
date = 2026-01-08
toc = true
noindex = true
+++

`toc` is on here, and this page has no headings for it to list. Hugo still
returns a table of contents in that case — an empty nav element, which is a
non-empty string — so the emptiness cannot be read off it with `with`. What
gets tested is the text the table actually renders.

A page may of course link to [the page kept out](https://example.com/subpath/showcase/kept-out/) in prose.
