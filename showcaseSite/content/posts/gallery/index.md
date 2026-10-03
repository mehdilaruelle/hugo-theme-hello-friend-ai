+++
title = "A gallery from a page bundle"
description = "The gallery shortcode: the bundle's pictures as a grid of thumbnails, each a link to the full one"
date = "2026-02-02"
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]

# The fourth picture has no alt, to exercise the file-name fallback.
[[resources]]
  src = "photos/01-dunes.jpg"
  [resources.params]
    alt = "Two sand dunes under an orange sky"
    caption = "Dunes, cropped to a square"

[[resources]]
  src = "photos/02-lake.jpg"
  [resources.params]
    alt = "A low sun over a still blue lake"

[[resources]]
  src = "photos/03-tower.jpg"
  [resources.params]
    alt = "A striped lighthouse at dusk under a full moon"
    caption = "Portrait, cropped from the **centre**"

[author]
  name = "Jane Doe"
+++

Every picture in this page's folder, cropped to the same square and laid out
three to a row — two on a phone. Each thumbnail links to the full file.

{{< gallery match="photos/*" >}}

The same pictures, two to a row:

{{< gallery match="photos/*" columns="2" >}}
