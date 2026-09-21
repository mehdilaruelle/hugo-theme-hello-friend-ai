+++
title = "A video where a GIF used to be"
description = "The video shortcode: a screen recording that does not weigh megabytes"
date = "2026-01-24"
type = ["posts","post"]
# Rooted on purpose: absURL resolved a leading slash against the domain root,
# so og:audio and og:video named a file outside the tree on a subpath site. A
# relative path never showed it. videos is here for the same reason.
audio = ["/video/demo.mp4"]
videos = ["/video/demo.mp4"]
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

An animated GIF is a poor way to ship a screen recording. A few seconds of
motion runs to megabytes, and a reader cannot stop it. Measured on an eleven
second, 3840×2160 capture:

| file | size |
| --- | --- |
| `demo.gif` | 4248 Ko |
| `demo.mp4` | 366 Ko |
| `demo.webm` | 290 Ko |

The `video` shortcode takes the path without an extension and emits one
`<source>` per format, so the browser takes the first it can play:

{{< video src="/video/demo" poster="/video/demo.jpg" width="640" height="360" alt="A test pattern looping" >}}

It autoplays, muted, on a loop — exactly like the GIF it replaces, so an article
reads the same, but with the player controls a GIF never had: a loop runs for as
long as the page is open. Pass `controls="true"` to drop the autoplay and the
loop, so the clip waits to be started:

{{< video src="/video/demo" poster="/video/demo.jpg" width="640" height="360" controls="true" alt="A test pattern" >}}

`width` and `height` matter more here than for an image: a video has no
intrinsic size until it loads, so without them the page reflows when it arrives.
The `poster` is what fills the frame in the meantime.

Hugo has no built-in shortcode for this. It ships `youtube` and `vimeo`, but
those embed somebody else's player; there is nothing for a file you host
yourself.
