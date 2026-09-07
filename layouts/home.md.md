{{- $desc := .Description | default site.Params.homeSubtitle | default site.Params.description -}}
{{- /* .Pages leaves out the pages Hugo generates, so /tags/ and /categories/
       were published with nothing linking them. */ -}}
{{- $children := slice -}}
{{- range .Pages -}}{{- $children = $children | append . -}}{{- end -}}
{{- range where site.Pages "Kind" "taxonomy" -}}{{- $children = $children | append . -}}{{- end -}}
{{- $children = partial "md/pages.html" $children -}}
# {{ site.Title }}
{{ with $desc }}
> {{ . | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace }}
{{ end }}
{{- with partial "md/body.html" . | strings.TrimSpace }}
{{ . }}
{{ end }}
{{- with site.Params.llmsNote }}
{{ . | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace }}
{{ end }}
{{- with $children }}
## {{ partial "i18n.html" (dict "key" "contents" "fallback" "Contents") }}

{{ range . -}}
- [{{ partial "md/label.html" . }}]({{ partial "md/url.html" . }}){{ with (partial "md/note.html" .) }}: {{ . }}{{ end }}
{{ end }}
{{- end }}
---

{{ partial "i18n.html" (dict "key" "llmsCanonical" "fallback" "Originally published at") }} {{ .Permalink }}
