+++
title = "A single media file, written on its own"
description = "One file per key, written as a bare string rather than a list of one"
date = "2026-01-26"
type = ["posts","post"]
audio = "video/demo.mp4"
videos = "video/demo.mp4"
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

Both media keys in this page's front matter name one file, written on its own
rather than wrapped in a list. A page with a single episode or a single clip is
the ordinary case, and writing it that way reads better than a list of one.

The theme normalises either shape before it walks it, so the social card and
the player below agree on the file whichever way it was written. Writing it as
a list of one, as the other showcase pages do, remains exactly equivalent.
