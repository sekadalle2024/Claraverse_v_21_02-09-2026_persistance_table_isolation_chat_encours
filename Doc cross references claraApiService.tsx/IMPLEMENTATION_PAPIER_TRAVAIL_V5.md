# Documentation de l'implémentation Papier de Travail V5

Cette documentation décrit la logique d'automatisation des papiers de travail d'audit dans ClaraVerse, implémentée dans `claraPapierTravailService.ts`.

## 1. Structure Globale
Le service intercepte les réponses JSON de n8n contenant une "Nature de test" et génère une structure HTML riche divisée en sections :
- **Signature Worksheet** : Informations client et préparateur.
- **Feuille de couverture** : Détails de la mission et nature du test.
- **Objectifs du test** : Description textuelle de l'objectif.
- **Travaux à effectuer** : Liste numérotée des procédures.
- **Section Test** : Un bloc unifié regroupant le schéma de calcul et la table principale.
- **Annexes** : Légendes, Revue Manager et Cross-références documentaires.

## 2. Schéma de Calcul (Correction d'Alignement)
Le schéma de calcul a été refondu pour garantir un alignement parfait avec les colonnes de la table de test.
- **Intégration** : Le schéma n'est plus une table séparée, mais une ligne `<tr class="schema-calcul-row">` injectée comme **première ligne du `<thead>`** de la table principale.
- **Alignement Automatique** : Grâce à cette intégration, le navigateur aligne nativement les variables du schéma sur les colonnes correspondantes.
- **Ancrage** : Les variables sont positionnées de la droite vers la gauche, s'arrêtant sur la colonne "Ecart" (incluse).
- **Styles Visuels** :
    - `.ltr` : Fond bleu clair pour les variables de calcul (A, B...).
    - `.ltr-e` : Fond orange clair pour la cellule de résultat (la formule de l'Écart).
    - `.nb` : Cellules vides sans bordure pour préserver l'esthétique "flottante".

## 3. Modèles de Calcul
Les modèles ont été ajustés selon les normes d'audit :
- **Validation** : `(A)`, `(B)`, `(C) = (A) + (B)` (Ancré sur Ecart).
- **Mouvement** : `(A)`, `(B)`, `(C)`, `(D) = (A+B-C)`, `(E)`.
- **Rapprochement / Séparation** : `(A)`, `(B)`, `(C) = (A) - (B)`.
- **Estimation** : `(A)`, `(B)`, `(C) = (A) * (B)`, `(D)`.
- **Cadrage TVA** : `(A)`, `(B) = (A)*18%`, `(C)`, `(D)`, `(E)`, `(F) = (B)-(C)-(D)-(E)`.

## 4. Table de Test Principale
- **Interactivité** : Classes `col-assertion`, `col-conclusion`, `col-ctr` activées pour les menus contextuels de `conso.js`.
- **Totalisation** : Ligne `.total-row` calculée dynamiquement ou extraite du JSON.
- **Cross-références** : Ligne `.cross-ref-h-row` pour l'indexation vers les pièces justificatives.

## 5. Design Premium
- **Conteneur Unique** : La table et son schéma partagent un seul conteneur `overflow-x:auto`, permettant un défilement horizontal synchronisé.
- **Zéro Espace** : La marge supérieure de la table a été supprimée (`margin-top:0`) pour "coller" les variables aux entêtes.

---
*Date de dernière mise à jour : 24 Avril 2026 (Fix Alignement Schéma)*
*Auteur : Antigravity AI - Senior Audit Systems Dev*
