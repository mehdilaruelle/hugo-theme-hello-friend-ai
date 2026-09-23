+++
title = "A post with no description of its own"
date = "2026-01-06"
tags = ["hugo"]
categories = ["Development"]
+++

Hugo's typographer turns this apostrophe into an entity, and "these quotes"
into curly ones -- and a code span like `<script>alert(1)</script>` or a
comparison such as a < b & c > d has to reach the reader as text, not markup.

Every other article here has a `description`, so this is the one page whose
list excerpt, meta description and JSON-LD come from the summary. `plainify`
strips the tags from it but leaves the entities, and printing them escaped
them a second time: the list used to show the entity's name, not the apostrophe.
