# Mémo : Implémentation du mode "Wide Screen" pour l'extension Chrome

## Contexte
L'application ClaraVerse génère des "Tables modélisées" (tables contenant des colonnes spécifiques telles que "Conclusion", "Assertion", "Ecart", "Resultat", "CTR"). Ces tables sont souvent très larges, causant un défilement horizontal peu pratique pour l'utilisateur, car le conteneur du chat est limité en largeur (typiquement autour de 800px via la classe Tailwind `max-w-4xl`).

L'objectif de cette modification était d'ajouter des options au menu contextuel de l'extension Chrome `fullscreen-extension-v8` pour permettre d'élargir dynamiquement l'interface afin de lire confortablement ces tables sans défilement, puis de revenir à la vue normale.

## Fichiers Modifiés
- `h:\ClaraVerse\fullscreen-extension-v8\background.js`

## Détail Technique de la Solution

### 1. Ajout au Menu Contextuel
Deux nouvelles options ont été ajoutées dans le menu `📸 FullScreen Pro` existant :
- `🖥️ Ajuster largeur [wide screen]` (ID: `fsp-widescreen`)
- `🖥️ Largeur normale [normal screen]` (ID: `fsp-normalscreen`)

Ces options déclenchent l'injection et l'exécution de scripts dans l'onglet actif via `chrome.scripting.executeScript`.

### 2. Fonction `adjustToWideScreen()`
Cette fonction est injectée lors du clic sur l'option "wide screen". Elle réalise les opérations suivantes :
1. **Identification des tables modélisées :** Parcourt toutes les tables de la page et vérifie la présence de mots-clés dans les 5 premières lignes (`tr`). Cela permet de supporter les tables contenant des titres de table fusionnés, des sous-en-têtes et des structures de lignes complexes (comme les tables de consolidation).
2. **Calcul de la largeur nécessaire :** Récupère la largeur réelle optimale de la table en lui appliquant temporairement le style `width: max-content`, `max-width: none` et `table-layout: auto`, mesure sa propriété `scrollWidth` (ce qui évite de sous-estimer la largeur si les textes des cellules étaient repliés/wrappés), ajoute une marge de protection généreuse de 160px (pour les marges de cellule, bordures et l'ombre portée de droite), puis définit la largeur cible `targetWidth` (au moins 1200px) sans la brider par la taille de l'écran afin de garantir l'absence totale de défilement horizontal sur la table elle-même.
3. **Ascension du DOM (Traversing) :** Remonte l'arbre DOM depuis la table modélisée jusqu'à `document.body` pour trouver tous les conteneurs qui imposent une contrainte de largeur (styles `max-width`, classes Tailwind `max-w-*` ou `mx-auto`, ou classes liées au chat/bulles de message).
4. **Sauvegarde de l'état :** Avant de modifier un élément, ses attributs `style` et `class` originaux sont sauvegardés dans des attributs de données personnalisés : `data-orig-style` et `data-orig-class`.
5. **Modification du style :** Applique des styles en ligne forcés avec `!important` (`max-width: [targetWidth]px` et `width: 95%`) sur l'ensemble des conteneurs parents identifiés. Cela garantit que le conteneur s'adapte précisément à la largeur de la table tout en restant fluide et en s'adaptant aux variations de l'écran. La colonne "Conclusion" et ses ombres portées droites restent toujours parfaitement visibles et alignées.
6. **Isolation des autres tables :** Si d'autres tables non-modélisées (classiques) sont présentes dans le même bloc de message, la fonction impose une largeur stricte de 800px à leurs wrappers pour éviter qu'elles ne s'étirent de manière disproportionnée et inesthétique.

### 3. Fonction `restoreNormalScreen()`
Cette fonction annule l'effet de la fonction précédente :
1. Elle recherche tous les éléments du DOM possédant les attributs `data-orig-style` ou `data-orig-class`.
2. Elle restaure leurs attributs `style` et `class` à partir des valeurs sauvegardées.
3. Elle supprime les attributs de données temporaires, remettant ainsi l'interface exactement dans son état initial.

## Points d'Attention pour les Futures Modifications
- Le code agit en force sur le DOM avec des `!important`. Si de nouvelles classes Tailwind ou des conteneurs intermédiaires complexes sont ajoutés au projet React `ClaraVerse`, il faudra potentiellement revoir la logique de l'ascension du DOM (la boucle `while (current && current !== document.body)`) pour s'assurer que les contraintes de largeur sont bien levées.
- La détection de "Table modélisée" se fait de manière agnostique sur le texte des en-têtes, en ignorant la casse. Tout changement dans le nom de ces colonnes nécessitera une mise à jour de la fonction `isModelizedTable`.
