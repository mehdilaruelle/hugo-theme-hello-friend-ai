+++
title = "Déployer hugo-theme-hello-friend-ai depuis un chemin assez long pour passer à la ligne"
slug = "long-title-no-cover"
description = "La ligne sans miniature dont le titre ne tient pas : le cas où la date n'a nulle part où aller, sinon en dessous."
date = "2026-01-10"
type = ["posts","post"]
tags = ["hugo"]
categories = ["Development"]
[author]
  name = "Jane Doe"
+++

Une ligne de liste, c'est un titre, une date tout à droite, et désormais un
extrait sous les deux. Avec une couverture, le titre reçoit déjà l'ordre de
prendre la place que la miniature et la date laissent. Sans couverture, non :
un titre de cette longueur poussait la date sur la ligne de flex suivante, où
`space-between` la laissait au début plutôt qu'à la fin.

Cette page existe pour que cette ligne soit construite, et regardée, à chaque
exécution.
