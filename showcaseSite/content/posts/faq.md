+++
title = "Questions the theme is asked"
description = "The faq shortcode: a question and an answer written once, read twice — as a details element by a person, as a FAQPage by a machine"
date = "2026-01-04"
type = ["posts","post"]
tags = ["hugo"]
categories = ["Development"]
+++

Each pair below is one `faq` shortcode. It renders as a `<details>` element,
which opens without JavaScript, and the same text goes into a `FAQPage` block in
the `<head>`.

{{< faq "Does the theme send anything to a service?" >}}
No. Everything is produced at build time: the search index, `llms.txt` and the
Markdown copies are all static files.
{{< /faq >}}

{{< faq "Do I have to write my posts this way?" >}}
No, and you probably should not. This is the one feature that asks you to write
content in a particular shape, so it is worth using only where a page really is
a list of questions — a FAQ page, an objections section, a changelog of
decisions.
{{< /faq >}}

{{< faq "Will Google show a rich result for it?" >}}
Almost certainly not. Google restricted the FAQ rich result to government and
health sites in 2023, so the markup is read but rarely drawn. It is still worth
emitting: answer engines read `FAQPage` whether or not Google draws a box, and
the `<details>` below is for a person either way.
{{< /faq >}}
