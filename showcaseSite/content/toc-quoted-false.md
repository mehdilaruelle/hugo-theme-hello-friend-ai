+++
title = "A page that declined a table of contents, in a string"
description = "toc = \"false\" asks for no table of contents, and used to get one, because a template reads any non-empty string as true."
date = 2026-01-07
toc = "false"
+++

`toc` written as the string `"false"` rather than the boolean. A template reads
any non-empty string as true, so this page used to render the table of contents
it had just declined.

## A heading

There are two headings here, so the table of contents would have something to
list if it were rendered. It should not be.

## Another heading

It is here so the spelling is built on every run. Nothing asserts the absence —
no checker reads a table of contents — so this fixture is for the build and for
whoever looks.
