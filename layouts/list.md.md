{{- /* Children listed whole, not one pager at a time: pagination is a reading
       aid for a screen. Taxonomies by title, as in list.html. */ -}}
{{- $children := .Pages -}}
{{- if eq .Kind "taxonomy" -}}{{- $children = .Pages.ByTitle -}}{{- end -}}
{{- $children = partial "md/pages.html" $children -}}
{{ partial "md/header.html" (dict "page" . "title" (partial "title.html" .) "desc" (partial "description.html" .)) }}
{{- partial "md/list.html" (dict "heading" (partial "i18n.html" (dict "key" "contents" "fallback" "Contents")) "pages" $children) }}
{{ partial "md/canonical.html" . }}
