+++
title = "Refusing training without refusing citation"
description = "The two switches behind this site's robots.txt, what they emit, and what they cannot do"
date = "2026-03-05"
type = ["posts","post"]
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

A crawler that reads this page to train a model and a crawler that reads it to
answer somebody's question are the same HTTP request with different purposes.
One ends with the text inside a model and no link back; the other ends with an
answer that cites the page. The theme treats that as two questions rather than
one:

```toml
[params.ai]
  train = false
  cite  = true
```

Both default to `true`, so a site that sets neither gets the `robots.txt` it
always got. This site sets them, which is why its own file comes out in two
halves:

```
User-agent: *
Disallow:
Content-Signal: search=yes, ai-input=yes, ai-train=no

# Declined: fetched to train a model, with no link back.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: CCBot
Disallow: /
```

Only what is refused gets a group of its own. Silence is permission in
`robots.txt`, so listing the retrieval crawlers under an `Allow` would repeat
what the wildcard group already says, and add a second place to get it wrong.

The `Content-Signal` line states the same intention in three tokens: `search` is
being indexed and shown as a link, `ai-input` is being read to build an answer,
`ai-train` is being learned from. It is a Cloudflare proposal rather than a
standard, and one line long.

Two things it does not do. `robots.txt` is a request — what honours it, honours
it, and the rest is a matter for the CDN. And the split is only as clean as the
tokens allow: `Google-Extended` covers both training Gemini and grounding its
answers, so `train = false` costs the Google answer box whatever `cite` says.

The other half of the question is `llms.txt`, which says how to read the site
rather than who may. This site emits one, and a Markdown copy of every page
alongside it.
