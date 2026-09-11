---
title: "A page kept out, asked for in a string"
description: "The same request as its neighbour, written noai: \"true\" rather than as a boolean — the spelling a quoted TOML or YAML value produces."
date: 2026-01-06
noai: "true"
---

The same request as [the page next door](/kept-out/), written `noai: "true"`
instead of `noai: true`.

A Go template reads any non-empty string as true, but `eq .Params.noai true`
matched the boolean alone, so this spelling was read as no answer at all and the
page went out in `llms.txt`, in `llms-full.txt` and in the Markdown listings —
the opposite of what it asks for.

It is here so the spelling is built on every run, and `--absent` names it in CI:
a page that asked to stay out and is mapped anywhere fails the build.
