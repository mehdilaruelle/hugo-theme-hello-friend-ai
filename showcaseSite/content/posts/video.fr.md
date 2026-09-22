+++
title = "Une vidéo là où il y avait un GIF"
description = "Le shortcode video : une capture d'écran qui ne pèse pas des mégaoctets"
date = "2026-01-24"
type = ["posts","post"]
# Rooted on purpose: a relative path never showed the subpath bug.
audio = ["/video/demo.mp4"]
videos = ["/video/demo.mp4"]
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

Un GIF animé est un mauvais moyen de livrer une capture d'écran. Quelques
secondes de mouvement pèsent des mégaoctets, et le lecteur ne peut pas
l'arrêter. Mesuré sur une capture de onze secondes en 3840×2160 :

| fichier | taille |
| --- | --- |
| `demo.gif` | 4248 Ko |
| `demo.mp4` | 366 Ko |
| `demo.webm` | 290 Ko |

Le shortcode `video` prend le chemin sans extension et émet un `<source>` par
format, pour que le navigateur prenne le premier qu'il sait lire :

{{< video src="/video/demo" poster="/video/demo.jpg" width="640" height="360" alt="Une mire qui tourne en boucle" >}}

Il démarre seul, muet, en boucle — exactement comme le GIF qu'il remplace, donc
l'article se lit pareil, mais avec les contrôles qu'un GIF n'a jamais eus : une
boucle tourne tant que la page est ouverte. Passez `controls="true"` pour retirer
l'autolecture et la boucle, le clip attend alors qu'on le démarre :

{{< video src="/video/demo" poster="/video/demo.jpg" width="640" height="360" controls="true" alt="Une mire" >}}

`width` et `height` comptent davantage ici que pour une image : une vidéo n'a
pas de taille propre tant qu'elle n'est pas chargée, donc sans eux la page
sursaute à son arrivée. Le `poster` remplit le cadre en attendant.

Hugo n'a pas de shortcode intégré pour ça. Il fournit `youtube` et `vimeo`, mais
ceux-là encapsulent le lecteur de quelqu'un d'autre ; rien n'existe pour un
fichier que vous hébergez vous-même.
