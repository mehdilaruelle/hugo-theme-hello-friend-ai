+++
title = "Deploying hugo-theme-hello-friend-ai from a path long enough to wrap"
slug = "long-title-no-cover"
description = "The row that has no thumbnail and a title that does not fit: the case where the date has nowhere to go but down."
date = "2026-01-10"
type = ["posts","post"]
tags = ["hugo"]
categories = ["Development"]
[author]
  name = "Jane Doe"
+++

A list row is a title, a date at the far right, and now an excerpt under both.
With a cover the title is already told to take the space the thumbnail and the
date leave. Without one it was not, so a title this long pushed the date onto
the next flex line, where `space-between` left it at the start rather than at
the end.

This page exists so that row is built, and looked at, on every run.
