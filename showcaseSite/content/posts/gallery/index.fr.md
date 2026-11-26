+++
title = "Une galerie tirée d'un page bundle"
description = "Le shortcode gallery : les images du bundle en grille de miniatures, chacune un lien vers l'original"
date = "2026-02-02"
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]

# 02-lake.fr.jpg is published under this page's URL, the others under the English one.
[[resources]]
  src = "photos/01-dunes.jpg"
  [resources.params]
    alt = "Deux dunes de sable sous un ciel orange"

[[resources]]
  src = "photos/02-lake.fr.jpg"
  [resources.params]
    alt = "Un soleil bas sur un lac bleu et calme"

[[resources]]
  src = "photos/03-tower.jpg"
  [resources.params]
    alt = "Un phare rayé au crépuscule sous la pleine lune"

[[resources]]
  src = "photos/04-field.jpg"
  [resources.params]
    alt = "Un champ"

[[resources]]
  src = 'photos/05-lake \[copy\].jpg'
  [resources.params]
    alt = "Le lac encore, d'un fichier dont le nom a des crochets"

[author]
  name = "Jane Doe"
+++

Toutes les images du dossier de cette page, recadrées au même carré, trois
par ligne — deux sur un téléphone. Chaque miniature mène au fichier entier.

{{< gallery match="photos/*" >}}
