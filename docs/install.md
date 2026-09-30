# Installing the theme

The three routes in the [README](../README.md#how-to-start) — a download, a
clone or a submodule — put the theme in `themes/hello-friend-ai`. This page
covers the fourth, and what to know whichever you took.

## As a Hugo Module

The theme is also a Hugo Module, which is the one route with no directory to
name and no submodule bookkeeping — updates are a version bump rather than a
checkout. It needs [Go](https://go.dev/dl/) installed; the other three routes do not.

``` bash
hugo mod init github.com/you/your-site   # once, if your site is not a module yet
hugo mod get github.com/mehdilaruelle/hugo-theme-hello-friend-ai/v5
```

Then import it in your configuration instead of setting `theme` to a directory:

``` toml
[module]
  [[module.imports]]
    path = "github.com/mehdilaruelle/hugo-theme-hello-friend-ai/v5"
```

Update it with `hugo mod get -u`, and pin a release the way you would any Go
dependency — `hugo mod get github.com/mehdilaruelle/hugo-theme-hello-friend-ai/v5@v5.2.0`.

**The `/v5` is not optional, and it changes.** Go requires a module at major
version 2 or above to carry the major in its path, so the import path moves to
`/v6` the day this theme releases a v6 — a rename, a dropped option, anything
breaking. Nothing updates it for you: `hugo mod get -u` keeps you on the newest
v5 and says nothing about v6 existing. That is the cost of this route; the other
three have no equivalent, since a checkout follows whatever the branch does.

## Coming from an earlier version

Coming from an earlier version, the theme directory has had three names: it was
`hello-friend-ng` before v4, `hello-friend-ia` in v4, and is `hello-friend-ai`
now. The repository moved with it each time, most recently from
`hugo-theme-hello-friend-ia`. GitHub redirects the old clone and submodule URLs,
so fetching still works; Hugo redirects nothing, so the directory has to be
renamed by hand. Substitute whichever of the two old names you have for `<old>`.

If you cloned the theme, or pasted it in:

``` bash
mv themes/<old> themes/hello-friend-ai
```

If you added it as a submodule, the old path is recorded in `.gitmodules`, in
the index and in `.git/config` as well, so moving the directory on its own
leaves the next `git submodule update` — and any fresh clone of your site —
pointing at a path that no longer exists:

``` bash
git mv themes/<old> themes/hello-friend-ai
git submodule set-url themes/hello-friend-ai https://github.com/mehdilaruelle/hugo-theme-hello-friend-ai.git
git submodule sync themes/hello-friend-ai
git commit -am "Rename the theme directory"
```

Either way, finish by setting `theme = "hello-friend-ai"` in your
configuration. Miss that step and Hugo reports `module "<old>" not found`.

## Where articles go

The section name matters too: articles go in `content/posts/`. Hugo resolves an
article's template by section name, and the theme's article layouts are
`layouts/posts/page.html` and `layouts/posts/section.rss.xml`. A section named
anything else falls back to the generic page template and to Hugo's built-in
feed. What that costs:

- on the page: reading time, date, word count, last-modified, sharing buttons,
  previous/next links, Disqus, Commento, Utterances, the description
  standfirst, the audio player
- in the feed: the full-text `<content:encoded>`, the theme's channel metadata,
  and `services.rss.limit`

`params.mainSections` does not move this. It points the footer's RSS icon and
the 404 page at a section; it does not change which template renders an
article. It does, however, say which section you *meant* to hold articles, so
the build warns when it names one the theme has no article template for:

```
WARN  params.mainSections names "blog", but the theme's article template is
      layouts/posts/page.html. Articles in content/blog/ render without reading
      time, word count, dates, sharing buttons, prev/next, related posts or
      comments, and blog/index.xml loses its full-text content:encoded.
```

Add `layouts/blog/page.html` (or the older name, `single.html`) to your own site and the warning stops — a site
that supplies the template is not doing anything wrong. To keep the fallback
and silence the line, name it in `ignoreLogs`:

```toml
ignoreLogs = ['mainsections-no-article-template-blog']
```

A section that is not in `mainSections` is not checked, so a `content/about/`
page is never warned about.
