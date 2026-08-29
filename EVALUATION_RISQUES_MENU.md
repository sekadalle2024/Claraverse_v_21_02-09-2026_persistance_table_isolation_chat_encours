# Évaluation des Risques - Menu Contextuel ClaraVerse

## 📋 Résumé

Nouvelle section **"Évaluation des risques"** ajoutée au menu contextuel des tables ClaraVerse pour calculer automatiquement la criticité selon une matrice de risques 3x3.

## 🎯 Fonctionnalités

### 1. Calculer criticité (matrice) - `Ctrl+R`
Calcule automatiquement la criticité basée sur les colonnes Probabilité et Impact.

### 2. Appliquer couleurs risques
Applique les couleurs visuelles aux cellules de risque existantes.

### 3. Ajouter colonnes risques
Ajoute les colonnes Probabilité, Impact et Criticité avec menus déroulants.

## 📊 Matrice de Criticité

| Probabilité | Impact Faible | Impact Moyen | Impact Élevé |
|-------------|---------------|--------------|--------------|
| **Faible**  | Faible (🟢)   | Faible (🟢)  | Moyen (🟡)   |
| **Moyen**   | Faible (🟢)   | Moyen (🟡)   | Élevé (🔴)   |
| **Élevé**   | Moyen (🟡)    | Élevé (🔴)   | Élevé (🔴)   |

### Cas détaillés :
- **Cas 1**: Faible × Faible = Faible
- **Cas 2**: Moyen × Faible = Faible
- **Cas 3**: Faible × Moyen = Faible
- **Cas 4**: Élevé × Faible = Moyen
- **Cas 5**: Moyen × Moyen = Moyen
- **Cas 6**: Faible × Élevé = Moyen
- **Cas 7**: Élevé × Moyen = Élevé
- **Cas 8**: Moyen × Élevé = Élevé
- **Cas 9**: Élevé × Élevé = Élevé

## 🎨 Couleurs

| Niveau  | Couleur de fond | Couleur texte |
|---------|-----------------|---------------|
| Faible  | Vert (#28a745)  | Blanc         |
| Moyen   | Jaune (#ffc107) | Noir          |
| Élevé   | Rouge (#dc3545) | Blanc         |

Les couleurs sont appliquées avec `!important` pour garantir leur affichage.

## 🔍 Détection des colonnes

### Colonnes Probabilité (variations acceptées) :
- `Probabilite`, `probabilite`, `Probabilité`, `Prob`, `obab`

### Colonnes Impact (variations acceptées) :
- `Impact`, `impact`, `mpa`, `IMPA`

### Colonnes Criticité (variations acceptées) :
- `Criticite`, `criticite`, `Criticité`, `ritici`

## 📝 Valeurs acceptées

Les valeurs suivantes sont reconnues automatiquement (insensible à la casse) :

| Niveau  | Valeurs acceptées                                              |
|---------|----------------------------------------------------------------|
| Faible  | `F`, `f`, `Faible`, `faible`, `Low`, `Bas`, ou contient `f`    |
| Moyen   | `M`, `m`, `Moyen`, `moyen`, `Medium`, `Mod`, `Modéré`, ou contient `m` |
| Élevé   | `E`, `e`, `Eleve`, `Élevé`, `elevé`, `High`, `Haut`, `H`, ou contient `e` |

### Logique de détection :
1. **Correspondance exacte** : Si la valeur correspond exactement à un mot-clé
2. **Contient un mot-clé** : Si la valeur contient "faible", "moyen", "eleve", etc.
3. **Lettre unique** : Si une seule lettre indicatrice (f, m, e) est présente
4. **Première lettre** : Utilise la première lettre comme indicateur (F→Faible, M→Moyen, E→Élevé)

## 🔄 Homogénéité du format

La criticité calculée respecte le format des entrées :

| Probabilité | Impact | Criticité calculée |
|-------------|--------|-------------------|
| `F`         | `M`    | `F` (lettre)      |
| `Faible`    | `Moyen`| `Faible` (mot)    |
| `F`         | `Moyen`| `Faible` (mot)*   |

*Si les formats sont mixtes, le format mot est utilisé par défaut.

## 🚀 Utilisation

### Méthode 1 : Via le menu contextuel
1. Survolez une table dans le chat
2. Le menu contextuel apparaît
3. Cliquez sur **"⚠️ Évaluation des risques"**
4. Sélectionnez l'action souhaitée

### Méthode 2 : Raccourci clavier
- `Ctrl+R` : Calculer la criticité (après avoir cliqué sur une table)

### Méthode 3 : Clic droit
1. Clic droit sur une table
2. Menu contextuel → Évaluation des risques

## 📁 Fichier modifié

- `public/menu.js` - Ajout de la section "Évaluation des risques" et des méthodes associées

## 🔧 Méthodes ajoutées

```javascript
// Configuration
getRiskColumnPatterns()    // Patterns regex pour détecter les colonnes
getCriticityMatrix()       // Matrice de criticité 3x3
getRiskColors()            // Couleurs par niveau de risque

// Utilitaires
normalizeRiskValue(value)           // Normalise F/M/E vers Faible/Moyen/Eleve
findRiskColumnIndexes(headers)      // Trouve les index des colonnes de risque
calculateCriticity(prob, impact)    // Calcule la criticité selon la matrice
applyRiskStyle(cell, riskLevel)     // Applique le style visuel à une cellule

// Actions principales
executeRiskEvaluation()    // Calcule la criticité pour toute la table
applyRiskColors()          // Applique les couleurs aux cellules existantes
addRiskColumns()           // Ajoute les colonnes Probabilité/Impact/Criticité
addCriticityColumn(index)  // Ajoute uniquement la colonne Criticité
```

## ✅ Test rapide

1. Créez une table avec les colonnes : `Risque | Probabilité | Impact | Criticité`
2. Remplissez quelques lignes avec des valeurs (F, M, E ou Faible, Moyen, Eleve)
3. Survolez la table → Menu contextuel
4. Cliquez sur "Évaluation des risques" → "Calculer criticité (matrice)"
5. Les cellules Criticité sont remplies et colorées automatiquement

---
*Version: Menu ClaraVerse v9 - Accordéon avec Évaluation des risques*
