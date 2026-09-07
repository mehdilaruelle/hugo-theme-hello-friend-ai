{{- /* Children listed whole, not one pager at a time: pagination is a reading
       aid for a screen. Taxonomies by title, as in list.html. */ -}}
{{- $children := .Pages -}}
{{- if eq .Kind "taxonomy" -}}{{- $children = .Pages.ByTitle -}}{{- end -}}
{{- $children = partial "md/pages.html" $children -}}
# {{ partial "title.html" . }}
{{ with partial "description.html" . }}
> {{ . | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace }}
{{ end }}
{{- with partial "md/body.html" . | strings.TrimSpace }}
{{ . }}
{{ end }}
{{- with $children }}
## {{ partial "i18n.html" (dict "key" "contents" "fallback" "Contents") }}

{{ range . -}}
- [{{ partial "md/label.html" . }}]({{ partial "md/url.html" . }}){{ with (partial "md/note.html" .) }}: {{ . }}{{ end }}
{{ end }}
{{- end }}
---

{{ partial "i18n.html" (dict "key" "llmsCanonical" "fallback" "Originally published at") }} {{ .Permalink }}
