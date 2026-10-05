{{- /* The home page's description is text; the subtitle and the site
       description are HTML wherever else they are shown. */ -}}
{{- $desc := .Description | default (partial "flatten.html" (site.Params.homeSubtitle | default site.Params.description | default "")) -}}
{{- /* .Pages leaves out the pages Hugo generates, so /tags/ and /categories/
       were published with nothing linking them. */ -}}
{{- $children := slice -}}
{{- range .Pages -}}{{- $children = $children | append . -}}{{- end -}}
{{- range where site.Pages "Kind" "taxonomy" -}}{{- $children = $children | append . -}}{{- end -}}
{{- $children = partial "md/pages.html" $children -}}
{{ partial "md/header.html" (dict "page" . "title" site.Title "desc" $desc "note" true) }}
{{- partial "md/list.html" (dict "heading" (partial "i18n.html" (dict "key" "contents" "fallback" "Contents")) "pages" $children) }}
{{- with .Params.llmsNote }}
{{ partial "flatten.html" . | safeHTML }}
{{ end }}
{{ partial "md/canonical.html" . }}
