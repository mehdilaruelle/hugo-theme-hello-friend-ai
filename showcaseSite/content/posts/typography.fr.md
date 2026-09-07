+++
title = "Tout ce dont un article est fait"
description = "Titres, code, tableaux, citations et images sur une page, pour que rien ne reste sans style"
date = "2026-01-10"
cover = "/img/cover.png"
coverCaption = "Une couverture matricielle : c'est la paire images + cover qui faisait diverger les deux moitiés de la carte."
type = ["posts","post"]
toc = true
math = true
tags = ["hugo", "development"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

Chaque élément ci-dessous est quelque chose que le thème met en forme. Ils sont
réunis ici pour qu'une modification de la feuille de style ait une page qui
montre l'ensemble d'un coup, au lieu d'être remarquée des mois plus tard sur le
blog de quelqu'un.

## Le code

Coloré par Chroma à la construction du site, le langage venant de la clôture du bloc :

```go
func main() {
	sites := []string{"example", "showcase"}
	for i, s := range sites {
		fmt.Printf("%d: %s\n", i, s)
	}
}
```

Le `code` en ligne tient dans une phrase sans casser l'interligne — ce que ce
thème a un jour raté sur deux sélecteurs à la fois.

## Les tableaux {data-columns=3}

| option | défaut | ce qu'elle fait |
| --- | --- | --- |
| `enableThumbnails` | éteinte | les couvertures dans les listes |
| `defaultTheme` | non défini | suit le système d'exploitation |
| `direction` | `ltr` | reflète la mise en page pour les langues RTL |

## Les citations

> Un thème doit ressembler à lui-même à l'installation, pas à une liste de
> fonctionnalités.

## Les listes

1. Ordonnée, pour des étapes qui se suivent
2. Avec un deuxième élément, pour voir le retrait
   - et une sous-liste non ordonnée
   - c'est là que les marges gauche et droite se voient dans une langue RTL


## Les mathématiques

`math = true` dans le front matter charge KaTeX sur cette page et sur aucune
autre. En ligne \(a^2 + b^2 = c^2\), et en bloc :

$$
\int_0^\infty e^{-x}\,dx = 1
$$

C'est explicite plutôt que détecté depuis le contenu, parce que `$$` est du texte
ordinaire dans un extrait shell et qu'un faux positif téléchargerait 300 Ko pour
rien.

## Les images

Le shortcode `image`, centré :

{{< image src="img/example.png" alt="Une capture d'écran du thème" position="center" >}}

`position` reste physique à dessein. Demander `left`, c'est demander la gauche
de la page, dans n'importe quelle langue — contrairement aux marges autour, qui
se reflètent.

## Un shortcode avec un corps

Une callout est un shortcode du site, pas du thème. Elle rend son corps, qui passe donc par le typographe -- et un extrait de code à l'intérieur garde `a < b` écrit en entité.

{{< callout >}}
Ce que j'appelle une callout : « citée », espacée ... et `a < b` dans du code.
{{< /callout >}}
