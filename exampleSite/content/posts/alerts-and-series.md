+++
title = "Alerts, and the series this post belongs to"
description = "GitHub-style alerts drawn as callouts, and the line that says which part of a series you are reading"
date = "2026-11-02"
type = ["posts","post"]
toc = true
tags = ["hugo", "markdown"]
categories = ["Development"]
series = ["Hugo 101", "Showcase"]
[author]
  name = "Hugo Authors"
+++

Two things the theme draws without a shortcode: the alerts below, written the
way GitHub reads them, and the line under the title that says which part of a
series this is.

## Alerts

A blockquote whose first line is a marker becomes a callout, with a coloured
edge, an icon and a title in the page's language:

```markdown
> [!NOTE]
> Worth knowing, even when skimming.
```

There are five of them:

> [!NOTE]
> Worth knowing, even when skimming.

> [!TIP]
> A better way to do it.

> [!IMPORTANT]
> Needed to get it right.

> [!WARNING]
> Needs attention now.

> [!CAUTION]
> Has consequences.

### Your own title

Words after the marker replace the title, and keep their Markdown:

```markdown
> [!WARNING] Before you *upgrade*
> Back up the site first.
```

> [!WARNING] Before you *upgrade*
> Back up the site first.

### Folded

A `-` after the marker folds the alert away, a `+` folds it but leaves it open.
Either opens on a click of its title, without JavaScript:

```markdown
> [!TIP]- The long way round
> Hidden until the title is clicked.
```

> [!TIP]- The long way round
> Hidden until the title is clicked.

> [!NOTE]+ Open to begin with
> Can be folded away.

### Anything a blockquote holds

An alert is a blockquote underneath, so lists and code go inside it as they
would anywhere else:

> [!IMPORTANT]
> Before a release:
>
> 1. build with the lowest Hugo version the site supports;
> 2. clear the cache, then build again:
>
> ```sh
> hugo --gc --minify
> ```

### A type the theme does not know

Hugo accepts any word, so Obsidian's callouts build too. The theme gives them
the neutral colour, the note's icon and the word as their title:

> [!DANGER]
> Drawn, but in no colour of its own.

### And a quotation

Without a marker, a blockquote is still a quotation:

> A theme should look like itself out of the box, not like a feature list.

The titles are not headings, so the contents at the top list only the sections
of this page. The Markdown copy of the page keeps every marker as written.

## Series

Under the title of this post, a line says which part of "Hugo 101" this is on
the demo site, or of "Showcase" on the showcase. Open it: it lists every part,
oldest first, with this one marked instead of linked.

A post joins a series by naming it in its front matter:

```toml
series = ["Hugo 101"]
```

This one names two:

```toml
series = ["Hugo 101", "Showcase"]
```

The same file is in both demo sites, and each site has only one of the two
series. The other holds this post alone, and a series of one shows nothing,
since there is nowhere else to go. That is why one line shows, not two.

> [!TIP]
> The series is a taxonomy, so a site has to declare it under `[taxonomies]`,
> as both demos do. See [Series](https://github.com/mehdilaruelle/hugo-theme-hello-friend-ai/blob/master/docs/config.md#series)
> for turning the line off.
