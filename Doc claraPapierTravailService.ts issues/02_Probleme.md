# Problème : Affichage des Tables d'Audit

Le problème s'est présenté en deux phases distinctes.

## Phase 1 : Affichage en colonnes inadapté
**Symptômes :** Les deux premiers tableaux de synthèse (Table 0: Signature Worksheet et Table 1: Feuille de Couverture) s'affichaient avec les métadonnées en colonnes d'en-tête (Header) au lieu de s'afficher comme une liste structurée par lignes.
- Les colonnes étaient trop nombreuses pour la largeur du chat.
- Les étiquettes (ex: Client, Exercice, Date) servaient d'en-têtes.

## Phase 2 : Perte du design natif (Thème Rouge)
**Symptômes :** Suite à une première tentative de correction qui encapsulait le rendu dans du HTML personnalisé (bleu) :
- Le design natif de l'application (en-têtes rouges) était perdu pour ces tableaux.
- Des conteneurs sombres encadraient les tableaux.
- Des titres HTML intrusifs (`<h3>`) étaient ajoutés automatiquement.
- La cohérence visuelle globale (design "classique") était rompue.
