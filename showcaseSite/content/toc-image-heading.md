+++
title = "A table of contents over a heading with a picture"
description = "toc = true and a picture in a heading. The table used to copy the picture with its src as written, broken there."
date = 2026-01-10
toc = true
noindex = true
+++

Hugo builds the table of contents without render hooks, so the picture below
reaches it with its relative `src` unresolved. The table lists the heading's
words only.

## ![The theme's logo](img/logo.svg) A heading with a picture

Prose under it.
