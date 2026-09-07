+++
title = "Every switch, and what it costs"
description = "What each option in the showcase configuration turns on, and what it adds to the page"
date = "2026-02-07"
type = ["posts","post"]
cover = "img/cover-switches.svg"
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

This site has its own folder, `showcaseSite/`, holding its articles and a
configuration file. That file is layered over the demo's — Hugo merges
configuration rather than replacing it, so it only has to name what changes:

| option | what you see |
| --- | --- |
| `backgroundImage` | the image behind the front page |
| `defaultTheme` | the page arrives dark instead of settling there |
| `enableThumbnails` | cover images beside titles on the list |
| `enableListExcerpts` | each post’s description under its title on the list |

None of them are on in the default demo, and that is deliberate: a theme should
look like itself out of the box, not like a feature list. This site is where the
feature list lives.

One option stays off even here. `gitUrl` with `enableGitInfo` links each page to
the commit that last changed it, which ties every build to the full commit
history and points at the theme's own history rather than at anything you are
reading.

The articles are the showcase's own, in all four languages, so every language
shows the same list. The demo's images and video are still mounted from it —
those are files rather than prose, and there is no reason to keep two of each.

Some carry a `cover` and some do not, so the list mixes rows with and
without a thumbnail, which is the part worth checking.
