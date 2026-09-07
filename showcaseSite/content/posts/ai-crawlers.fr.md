+++
title = "Refuser l'entraînement sans refuser la citation"
description = "Les deux interrupteurs derrière le robots.txt de ce site, ce qu'ils écrivent, et ce qu'ils ne peuvent pas faire"
date = "2026-03-05"
type = ["posts","post"]
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

Un robot qui lit cette page pour entraîner un modèle et un robot qui la lit pour
répondre à la question de quelqu'un forment la même requête HTTP, avec des
finalités différentes. La première finit par le texte à l'intérieur d'un modèle,
sans lien retour ; la seconde par une réponse qui cite la page. Le thème en fait
deux questions plutôt qu'une :

```toml
[params.ai]
  train = false
  cite  = true
```

Les deux valent `true` par défaut : un site qui n'en règle aucun obtient le
`robots.txt` qu'il a toujours eu. Ce site les règle, et c'est pourquoi son
fichier sort en deux moitiés :

```
User-agent: *
Disallow:
Content-Signal: search=yes, ai-input=yes, ai-train=no

# Declined: fetched to train a model, with no link back.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: CCBot
Disallow: /
```

Seul ce qui est refusé reçoit son propre groupe. Dans `robots.txt`, le silence
vaut permission : lister les robots de récupération sous un `Allow` répéterait ce
que le groupe joker dit déjà, et ajouterait un deuxième endroit où se tromper.

La ligne `Content-Signal` énonce la même intention en trois jetons : `search`,
c'est être indexé et affiché sous forme de lien ; `ai-input`, être lu pour
construire une réponse ; `ai-train`, servir d'apprentissage. C'est une
proposition de Cloudflare, pas une norme, et elle tient sur une ligne.

Deux choses qu'elle ne fait pas. `robots.txt` est une requête : ce qui la
respecte la respecte, le reste relève du CDN. Et la séparation ne vaut que ce que
valent les jetons : `Google-Extended` couvre à la fois l'entraînement de Gemini
et l'ancrage de ses réponses, donc `train = false` coûte l'encadré de réponse de
Google quoi que dise `cite`.

L'autre moitié de la question, c'est `llms.txt`, qui dit comment lire le site
plutôt que qui en a le droit. Ce site en publie un, et une copie Markdown de
chaque page avec lui.
