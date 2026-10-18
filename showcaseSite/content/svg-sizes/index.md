+++
title = "SVG sizes"
noindex = true
+++

An SVG is never decoded, so the image partial reads its size from the root
element. `check-svg-sizing.mjs` asserts what each of these is given.

{{< image src="commas.svg" alt="commas" >}}
{{< image src="exponent.svg" alt="exponent" >}}
{{< image src="stroke-width.svg" alt="stroke-width" >}}
{{< image src="root-px.svg" alt="root-px" >}}
{{< image src="root-percent.svg" alt="root-percent" >}}
{{< image src="root-em.svg" alt="root-em" >}}
{{< image src="no-viewbox.svg" alt="no-viewbox" >}}
{{< image src="empty-viewbox.svg" alt="empty-viewbox" >}}
{{< image src="dot-width.svg" alt="dot-width" >}}
{{< image src="dotted-width.svg" alt="dotted-width" >}}
{{< image src="trailing-junk.svg" alt="trailing-junk" >}}

The first of them as a plain [Markdown link](commas.svg), relative to this page:
llms-full.txt, which carries this text from the site's root, has to make it
absolute.

The same file with its destination in angle brackets: [Markdown link](<commas.svg>).

````markdown
A fence opens with three backticks:
```
````

And after that block, [the second of them](dot-width.svg).

Code is carried as written. A code span, `[a span](commas.svg)`, and an
indented block:

    [indented](commas.svg)

- A fence inside a list item:

    ```
    [in a list](commas.svg)
    ```

> ```
> [in a quote](commas.svg)
> ```

- A list item's own indented block, four spaces past its text:

      [six in a list](commas.svg)

A fence whose code shows a quoted fence, which only a quote could close:

```
> ```
[behind a quoted close](commas.svg)
```

And a [reference link][commas], whose definition is a relative path too.

[commas]: commas.svg

A footnote is not a definition, and keeps its text.[^sizes]

[Note]: neither is a line shaped like one, commas.svg and all.

[^sizes]: Each size is read from the file itself.

    The note goes on, with [the first of them](commas.svg) again.

> ```
> a fence the quote leaves open

Out of the quote, [the first of them](commas.svg) once more.
