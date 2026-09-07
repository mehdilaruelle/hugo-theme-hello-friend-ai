+++
title = "Chaque interrupteur, et ce qu'il coûte"
description = "Ce que chaque option de la configuration vitrine active, et ce qu'elle ajoute à la page"
date = "2026-02-07"
type = ["posts","post"]
cover = "img/cover-switches.svg"
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

Ce site a son propre dossier, `showcaseSite/`, qui contient ses articles
et un fichier de configuration. Ce fichier est posé par-dessus celui de la démo —
Hugo fusionne la configuration au lieu de la remplacer, donc il n'a qu'à nommer
ce qui change :

| option | ce que vous voyez |
| --- | --- |
| `backgroundImage` | l'image derrière la page d'accueil |
| `defaultTheme` | la page arrive en sombre au lieu d'y basculer |
| `enableThumbnails` | les couvertures à côté des titres dans la liste |
| `enableListExcerpts` | la description de chaque article sous son titre dans la liste |

Aucune n'est active dans la démo par défaut, et c'est délibéré : un thème doit
ressembler à lui-même à l'installation, pas à une liste de fonctionnalités. La
liste de fonctionnalités, c'est ici.

Une option reste éteinte même ici. `gitUrl` avec `enableGitInfo` relie chaque
page au commit qui l'a modifiée en dernier : cela lie chaque build à
l'historique complet, et vise l'historique du thème plutôt que ce que vous
lisez.

Les articles appartiennent à la vitrine, dans les quatre langues, pour que chaque
langue affiche la même liste. Les images et la vidéo de la démo restent montées
depuis celle-ci : ce sont des fichiers, pas du texte, et rien ne justifie d'en
garder deux exemplaires.

Certains portent un `cover` et d’autres non, donc la liste mélange les lignes
avec et sans miniature — et c'est ça qui méritait d'être vérifié.
