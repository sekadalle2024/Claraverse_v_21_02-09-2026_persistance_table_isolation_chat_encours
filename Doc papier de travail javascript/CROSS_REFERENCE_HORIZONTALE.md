# 📎 Cross Référence Horizontale - Documentation

## Vue d'ensemble

La **Cross Référence Horizontale** est une table d'une ligne qui contient les références documentaires pour chaque variable du Schéma de calcul. Elle utilise la même structure (nombre de colonnes) que le Schéma de calcul, mais sans en-tête.

## Principe de fonctionnement

### 1. Structure identique au Schéma de calcul

La Cross Référence Horizontale a **le même nombre de cellules** que le Schéma de calcul:

**Exemple pour un Rapprochement:**
- Schéma de calcul: `(A) | (B) | (C) = (A) - (B)` → 3 colonnes
- Cross Référence: `[  ] | [  ] | [  ]` → 3 colonnes

### 2. Contenu des cellules

Chaque cellule contient une **référence alphanumérique** vers un document du dossier de travail:

**Format:** `[Lettre + Numéro]`

**Exemples:**
- `[I1]` - Lead (indexation 1)
- `[C100]` - Balance (indexation 10, 100, etc.)
- `[F150]` - Document de test (multiples de 5 ou 10)
- `[C100.1]`, `[C100.2]` - Déclinaisons pour mouvements

### 3. Indexation selon le cycle comptable

**La lettre alphabétique** correspond au cycle comptable audité:
- `A` - Cycle A
- `B` - Cycle B
- `C` - Cycle C (Caisse, par exemple)
- etc.

**Le numéro** correspond au type de document:
- `1` - Lead
- `10`, `100` - Balance
- `30`, `50`, `130`, `150` - Autres documents (multiples de 5 ou 10)

**Important:** Toutes les cross références d'un même papier de travail ont la **même lettre alphabétique** (même cycle).

## Modèles selon la Nature de test

### Validation (5 colonnes)
```
Schéma:     (A) | (B) | (C) = (A) + (B) | (D) | (E) = (C) - (D)
Cross Ref:  [  ] | [  ] | [  ] | [  ] | [  ]
```

### Mouvement (6 colonnes)
```
Schéma:     (A) | (B) | (C) | (D) = (A) + (B) - (C) | (E) | (F) = (D) - (E)
Cross Ref:  [  ] | [  ] | [  ] | [  ] | [  ] | [  ]
```

### Rapprochement (3 colonnes)
```
Schéma:     (A) | (B) | (C) = (A) - (B)
Cross Ref:  [  ] | [  ] | [  ]
```

### Séparation (3 colonnes)
```
Schéma:     (A) | (B) | (C) = (A) - (B)
Cross Ref:  [  ] | [  ] | [  ]
```

### Estimation (5 colonnes)
```
Schéma:     (A) | (B) | (C) = (A) * (B) | (D) | (E) = (C) - (D)
Cross Ref:  [  ] | [  ] | [  ] | [  ] | [  ]
```

### Revue analytique (3 colonnes)
```
Schéma:     (A) | (B) | (C) = (A) - (B)
Cross Ref:  [  ] | [  ] | [  ]
```

### Cadrage TVA (6 colonnes)
```
Schéma:     (A) | (B) = (A) * 18% | (C) | (D) | (E) | (F) = (B) - (C) - (D) - (E)
Cross Ref:  [  ] | [  ] | [  ] | [  ] | [  ] | [  ]
```

### Cotisations sociales (4 colonnes)
```
Schéma:     (A) | (B) | (C) | (D)
Cross Ref:  [  ] | [  ] | [  ] | [  ]
```

### Vierge (0 colonnes)
```
Schéma:     (vide)
Cross Ref:  (vide)
```

### Modélisation (variable)
```
Schéma:     Détection automatique des variables (A), (B), (C), etc.
Cross Ref:  Nombre de colonnes = nombre de variables détectées
```

## Exemples concrets

### Exemple 1: Test de Caisse - Rapprochement

**Nature de test:** Rapprochement

**Schéma de calcul:**
```
(A) | (B) | (C) = (A) - (B)
```

**Cross Référence Horizontale:**
```
[C100] | [C10] | [C1]
```

**Signification:**
- `[C100]` - Balance Caisse (Cycle C, document 100)
- `[C10]` - Balance auxiliaire (Cycle C, document 10)
- `[C1]` - Lead Caisse (Cycle C, document 1)

### Exemple 2: Test d'Immobilisations - Mouvement

**Nature de test:** Mouvement

**Schéma de calcul:**
```
(A) | (B) | (C) | (D) = (A) + (B) - (C) | (E) | (F) = (D) - (E)
```

**Cross Référence Horizontale:**
```
[C100.1] | [C100.2] | [C100.3] | [  ] | [C10] | [C1]
```

**Signification:**
- `[C100.1]` - Fichier immobilisations, montant 1
- `[C100.2]` - Fichier immobilisations, montant 2
- `[C100.3]` - Fichier immobilisations, montant 3
- `[  ]` - Calcul intermédiaire (pas de référence)
- `[C10]` - Balance
- `[C1]` - Lead

**Note:** Les déclinaisons `.1`, `.2`, `.3` permettent de référencer plusieurs montants du même document.

## Utilisation dans le menu contextuel

### Actions disponibles

1. **📎 Ajouter Cross référence horizontale** (Ctrl+Shift+H)
   - Ajoute une table de cross référence au-dessus de la table principale
   - Détecte automatiquement la nature de test
   - Crée le bon nombre de colonnes

2. **🔄 Actualiser Cross référence**
   - Supprime et recrée la cross référence
   - Utile si la nature de test a changé

3. **🗑️ Supprimer Cross référence**
   - Supprime la table de cross référence
   - Conserve les données dans localStorage

### Workflow typique

1. Clic droit sur la table principale
2. Menu "Papier de travail" → "Ajouter Cross référence horizontale"
3. La table apparaît au-dessus de la table principale
4. Remplir les cellules avec les références documentaires
5. Les modifications sont sauvegardées automatiquement

## Sauvegarde et persistance

### localStorage

Les cross références sont sauvegardées dans `localStorage` avec la clé:
```
claraverse_cross_ref_data
```

### Format JSON

```json
{
  "crossref_table_abc123_1714000000000": {
    "timestamp": 1714000000000,
    "forTable": "table_abc123",
    "cells": [
      { "row": 0, "col": 0, "value": "[C100]" },
      { "row": 0, "col": 1, "value": "[C10]" },
      { "row": 0, "col": 2, "value": "[C1]" }
    ]
  }
}
```

### Restauration automatique

Au chargement de la page, les cross références sont automatiquement restaurées si:
- La table principale existe dans le DOM
- Les données sont présentes dans localStorage

## Style visuel

### Couleurs

- **Fond de table:** `#f0f9ff` (bleu clair)
- **Fond de cellule:** `#e0f2fe` (bleu plus clair)
- **Bordures:** Gris standard

### Différence avec Schéma de calcul

- **Schéma de calcul:** Fond jaune (`#fffbf0`, `#fff9e6`)
- **Cross Référence:** Fond bleu (`#f0f9ff`, `#e0f2fe`)

Cette différence visuelle permet de distinguer facilement les deux tables.

## Commandes de debug

Dans la console du navigateur:

```javascript
// Afficher toutes les cross références sauvegardées
crossRefCommands.showStorage()

// Forcer le retraitement de toutes les tables
crossRefCommands.processAll()

// Restaurer toutes les cross références
crossRefCommands.restoreAll()

// Effacer toutes les cross références
crossRefCommands.clearStorage()
```

## Architecture technique

### Fichiers

- **Module:** `public/papier-travail-cross-ref-horizontale.js`
- **Intégration menu:** `public/menu.js` (méthodes ajouterCrossRefHorizontale, etc.)
- **Chargement:** `index.html` (script tag)

### Classes CSS

- `.claraverse-cross-ref-horizontale` - Table de cross référence

### Attributs data

- `data-cross-ref-id` - ID unique de la cross référence
- `data-for-table` - ID de la table principale associée
- `data-table-id` - ID de la table principale

## Bonnes pratiques

### 1. Cohérence des références

- Utiliser la même lettre pour tout le papier de travail
- Respecter la convention de numérotation (1, 10, 100, etc.)

### 2. Déclinaisons pour mouvements

- Utiliser `.1`, `.2`, `.3` pour plusieurs montants du même document
- Exemple: `[C100.1]`, `[C100.2]`, `[C100.3]`

### 3. Cellules vides

- Laisser vide `[  ]` pour les calculs intermédiaires
- Ne pas forcer une référence si elle n'existe pas

### 4. Synchronisation avec Schéma de calcul

- Toujours créer le Schéma de calcul en premier
- Puis ajouter la Cross Référence Horizontale
- Les deux tables doivent avoir le même nombre de colonnes

## Dépannage

### La cross référence n'apparaît pas

**Vérifications:**
1. La table est-elle une table modelisée? (Conclusion, Assertion, CTR, Ecart)
2. Y a-t-il une table avec "Nature de test" dans la div?
3. La nature de test est-elle reconnue?

**Solution:** Vérifier dans la console les messages de debug `📎 [Cross Ref]`

### Décalage d'alignement ou largeur incorrecte avec Modelised_table

**Symptôme:** Le tableau de cross référence s'arrête à la colonne Ecart ou ses colonnes ne s'alignent pas pixel par pixel avec la grande table de données (Modelised_table), donnant l'impression qu'il est indexé sur le *Schéma de calcul*.

**Explication & Solution Historique (Juin 2026):**
Ce problème provenait de deux conflits fondamentaux:
1. **Conflit de Ciblage:** La présence de mots-clés comme "Montant" et "Ecart" dans les entêtes du "Schéma de calcul" induisait le système en erreur, qui ciblait la mauvaise table (plus petite). La solution a été d'implémenter une recherche inversée (`reverse`) et d'exclure sciemment le Schéma de calcul en identifiant les headers `(A)`, `(B)` et les petits tableaux (<= 3 lignes).
2. **Conflit de Largeur (Overflow CSS):** Lors de l'application de pourcentages et de la lecture via `getBoundingClientRect().width`, le conteneur écrasait la table de cross-ref sur l'écran (ex: 800px) alors que la vraie table `Modelised_table` défilait horizontalement (ex: 1200px réels). La solution a été d'abandonner le ratio/pourcentage et d'imposer un paramétrage strict:
   - `width: max-content` pour permettre à la table de cross référence de s'étendre
   - Application directe et individuelle des pixels via `width`, `min-width` et `max-width` (couplé à un `box-sizing: border-box`) pour chaque cellule `<td>` générée, en se calquant exactement sur les colonnes du `tbody` de la table principale.

### Le nombre de colonnes est incorrect

**Cause:** La nature de test n'est pas correctement détectée

**Solution:**
1. Vérifier l'orthographe de la nature de test
2. Utiliser "Actualiser Cross référence" pour régénérer

### Les modifications ne sont pas sauvegardées

**Cause:** localStorage plein ou désactivé

**Solution:**
1. Vérifier l'espace disponible dans localStorage
2. Effacer les anciennes données avec `crossRefCommands.clearStorage()`

## Évolutions futures

### Fonctionnalités potentielles

1. **Import depuis JSON n8n**
   - Extraire automatiquement les références de la table 7
   - Pré-remplir les cellules

2. **Validation des références**
   - Vérifier que les références existent dans le dossier
   - Alerter si une référence est invalide

3. **Navigation vers documents**
   - Cliquer sur une référence pour ouvrir le document
   - Intégration avec X-Ref documentaire

4. **Export vers Excel**
   - Exporter le papier de travail complet
   - Inclure Schéma + Cross Référence + Table principale
