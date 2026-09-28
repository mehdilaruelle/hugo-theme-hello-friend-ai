# SEO

Nothing to configure. Every page already carries a canonical link, Open Graph
and Twitter Card tags. On top of that:

**One URL per page.** A paginated list gives each pager its own canonical, since
each is a distinct set of posts rather than a copy of page one — and `og:url`,
which is the canonical Facebook and LinkedIn read, names the same URL as the
`<link rel="canonical">` beside it. `og:title` and the `<title>` both say which
pager it is, and `rel="prev"` and `rel="next"` say what it is a pager of —
Google retired those as an indexing signal in 2019, Bing did not.

**The same page in another language** is named twice over: as `hreflang`, with
an `x-default`, and as `og:locale:alternate` for the platforms that read Open
Graph and nothing else. Both sets follow one rule, so they cannot disagree — a
translation kept out of the index appears in neither.

**`max-image-preview:large`**, so Google can show a full-width picture beside
the page in Search and in Discover instead of a thumbnail — except on a page
that is kept out of the index, where the directive would say nothing. There is
one `robots` tag either way. A search page is kept out without being asked: it
is thin by construction, and Google's guidance is to keep internal search
results unindexed. See
[Keeping a page out of things](config.md#keeping-a-page-out-of-things).

**JSON-LD**, and only JSON-LD. Google reads it in preference to microdata, and
the theme no longer emits any: Hugo's embedded `schema.html` wrote six
`itemprop` attributes with no `itemscope` to hold them, which parses to nothing.
Structured data of your own goes in
[`layouts/_partials/extra-head.html`](../README.md#how-to-edit-the-theme). The home page is
described as a `WebSite`, and any dated single page
as a `BlogPosting` carrying its headline, description, dates, author, publisher,
language, word count, and its image and tags when it has them. A page with no
date is a `WebPage`: its URL, name, language and its own description, and
nothing the theme would have to invent to say.

The values come from what you already set: `author` (a string or a map with a
`name`, in the page or in the site params), `description` — falling back to a
trimmed summary — and the picture, which is the one the social card shows: the
page's `images` or its `cover`, resolved by the same partial so the two can
never disagree. The site-wide fallback is not borrowed here. It is the right
picture for a card, which shows whatever it is handed, and the wrong one for
structured data, where it would assert one file as the subject of every article
on the site.

**`Person`.** A name on its own is a string. What makes it an entity a search
engine can recognise is the evidence tying it to the same person elsewhere, so
the author of the site is described as a `Person` carrying `sameAs` — every
`params.social` URL, which is the same claim `rel="me"` already makes on the
links themselves. An email entry is an address rather than a profile and is left
out. `params.portrait.path` becomes the image, and `params.author` carries the
rest: a job title, a sentence of description, the subjects the author works in,
and the qualifications behind them.

```toml
[params.author]
  name        = "Jane Doe"
  jobTitle    = "Platform Engineer"
  description = "Writes about Hugo, and about the parts of the web that hold still."
  knowsAbout  = ["Hugo", "Static site generators", "Web typography"]

  [[params.author.credentials]]
    name     = "Certified Hugo Themer"
    category = "certification"
    url      = "https://example.com/badges/hugo-themer"
    issuer   = "Hugo"
```

`knowsAbout` and `credentials` are the two that say something a name and a job
title do not. Each entry under `credentials` becomes an
`EducationalOccupationalCredential`, where `name` is the only field that has to
be there:

| field | becomes | what it is |
| --- | --- | --- |
| `name` | `name` | the qualification |
| `category` | `credentialCategory` | what kind of thing it is |
| `url` | `url` | the credential itself — the badge, the certificate, the page that shows it |
| `issuer` | `recognizedBy` | the body that awarded it, as an `Organization` |

`url` is the credential and not its issuer, because that is what `url` means on
any schema.org `Thing`. An issuer homepage there would tell a crawler the
homepage is the credential, and say the same of every credential from that
issuer — `recognizedBy` is the property for the awarding body. An entry with no
name is dropped rather than emitted empty.

All of it is optional, and a site setting none of it emits exactly the `Person`
it emitted before.

The same `Person` is the author of every article, under one `@id`, so it reads
as one person rather than as a name repeated. An article that names its own
author in its front matter gets that name and nothing else — the site owner's
profiles and job title are not theirs to claim.

**`publisher`.** A `BlogPosting` names who published it. Left alone, that is the
site owner as the `Person` above: on a personal site the publisher is the
person, and an `Organization` carrying nothing but the site title says less than
the entity already described in full. A page naming its own author does not move
the publisher, since a guest writer did not publish the site.

A site published by an organisation says so, and gives the logo Google asks for
alongside the name:

```toml
[params.publisher]
  name = "Acme Inc."
  logo = "/img/logo.png"
```

The logo is resolved like the portrait, from `assets/` first and then from
`static/`, and carries its dimensions when Hugo can measure it. `name` on its
own falls back to the site title.

**`BreadcrumbList`.** A single page that sits in a section carries the trail
to it, so a search result shows *Home › Blog › the title* in place of the bare
URL. The current page is named but not linked, which is what Google asks for.
A page at the root of the site gets none: *Home › About* says nothing the URL
did not.

The section is named by its `linkTitle`, and by its title when it has none. A
section title that works in a search result says what the section is about, and
that is too long to read as one step of a trail:

```toml
+++
title     = "Articles on Vault, Terraform and AWS"
linkTitle = "Blog"
+++
```

**`ProfilePage`.** An about page is not an article and has no date, so it used
to come out with no structured data at all, which is backwards for the page
that exists to say who is behind the site. Give it `schema = "ProfilePage"` in
its front matter and it is described as one, with the `Person` above as its
`mainEntity` under the same `@id`:

```toml
+++
title  = "About"
schema = "ProfilePage"
+++
```

**`hreflang="x-default"`.** Translated pages list every language, and the
primary one is additionally tagged `x-default`, which is what a search engine
serves to a visitor whose language matches none of them. Primary means first in
`hugo.Sites`, i.e. the language with the lowest `weight`, so ordering your
languages orders this too.
