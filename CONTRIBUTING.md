# How to contribute

This is a fork of
[hugo-theme-hello-friend-ng](https://github.com/rhazdon/hugo-theme-hello-friend-ng)
by Djordje Atlialp, kept current with Hugo.

Where to report what:

- Anything specific to this fork — a Hugo deprecation, the CI, the demo site —
  belongs in this repository's
  [issues](https://github.com/mehdilaruelle/hugo-theme-hello-friend-ai/issues)
  and [pull requests](https://github.com/mehdilaruelle/hugo-theme-hello-friend-ai/pulls).
- Anything about the theme itself is worth sending
  [upstream](https://github.com/rhazdon/hugo-theme-hello-friend-ng/issues) too,
  so every user benefits rather than only those on this fork.

## Pull request titles

Pull requests are squashed when merged, so the **title becomes the single
commit on `master`** — it is the whole history of that change, and the version
is read from it.

Titles follow [Conventional Commits](https://www.conventionalcommits.org):

```
type(optional scope)!: description
```

`type` is one of:

| type | what it covers |
| --- | --- |
| `feat` | a new capability for people using the theme |
| `fix` | a bug fix |
| `docs` | documentation only |
| `style` | formatting that does not change behaviour |
| `refactor` | a change that neither fixes a bug nor adds a feature |
| `perf` | a performance improvement |
| `test` | tests only |
| `build` | the build itself, or dependencies |
| `ci` | workflows and CI configuration |
| `chore` | anything else, e.g. repository housekeeping |
| `revert` | reverts an earlier commit |

The scope is optional and names the area touched — `fix(menu):`,
`feat(social):`, `ci(pages):`.

Append `!` before the colon for a breaking change, and explain the break in the
body:

```
feat(social)!: match icon names case-insensitively

BREAKING CHANGE: names are lowercased before matching, so a custom svg.html
override keyed on mixed case no longer matches.
```

CI checks the title on every pull request, and this is the only check that
gates a merge.

## Commits on a branch

Commits pushed to a branch are squashed away on merge, so CI does not check
them. Write them in the same form anyway: a branch whose subjects read
`fix(menu): …`, `docs: …` is far easier to review commit by commit, and to
reorder or drop a change from, than one reading `wip`, `wip 2`, `fix tests`.

The rule of thumb: the branch is for whoever reviews the change, the title is
for whoever reads the history a year later.

## Versioning

Releases are cut automatically. Merging a pull request into `master` tags a new
version and publishes a GitHub Release, with no further step — the version comes
from the pull request title, since that is the subject a squash merge lands:

| title starts with | bump | example |
| --- | --- | --- |
| anything with `!`, or a body carrying `BREAKING CHANGE:` | major | `1.4.2` → `2.0.0` |
| `feat` | minor | `1.4.2` → `1.5.0` |
| `fix`, `perf`, `revert` | patch | `1.4.2` → `1.4.3` |
| `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore` | none | no release |

So a pull request that only touches documentation or CI merges without cutting
a version, which is the intent — those change nothing for somebody using the
theme.

This is also why the title matters beyond tidiness: it is what the version is
read from. A bug fix titled `chore` ships silently, with no release at all.

Tags carry a `v` prefix — `v1.2.0`, not `1.2.0`. Upstream tags do not
(`1.0.9`), so the prefix also makes it unambiguous at a glance which of the two
a tag belongs to.

## Before opening a pull request

Build the exampleSite and make sure it stays warning-free:

```bash
cd exampleSite
hugo --themesDir ../.. --gc --panicOnWarning
```

That needs Hugo extended and Dart Sass — see
[Requirements](README.md#requirements). CI runs exactly this, plus a second
build without Dart Sass to keep the LibSass fallback working.

Then build the showcase, which is the same site with every option turned on:

```bash
cd showcaseSite
hugo --themesDir ../.. --gc --panicOnWarning --config ../exampleSite/config.toml,config.toml
```

`showcaseSite/` holds only what differs — a configuration file and a couple of
pages. It mounts the exampleSite content and static files rather than copying
them, and layers its configuration over the exampleSite one, so there is no
second site to keep in sync. CI builds it too, so an option the default demo
leaves off still cannot break unnoticed.
