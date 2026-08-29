# Architecture: Système de Conversion des Matrices de Risques

**Date:** 02 Avril 2026  
**Version:** 2.0  
**Fichier:** `public/menu.js`

## 📐 Vue d'Ensemble

Le système de conversion des matrices de risques permet de transformer les valeurs entre différents formats (alphabétiques et numériques) tout en préservant la sémantique du niveau de risque.

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                  ContextualMenuManager                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Méthodes de Normalisation (v1)               │  │
│  │  - normalizeToNum3/4/5()                             │  │
│  │  - normalizeToAlpha3/4/5()                           │  │
│  │  ⚠️  Ne convertissent PAS entre types                │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Méthodes de Conversion Intégrale (v2) ✨        │  │
│  │  - convertToNumeric3/4/5()                           │  │
│  │  - convertToAlpha3/4/5()                             │  │
│  │  ✅ Convertissent entre TOUS les types               │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Méthodes de Conversion de Matrices              │  │
│  │  - convertToMatrixNum3/4/5()                         │  │
│  │  - convertToMatrixAlpha3/4/5()                       │  │
│  │  ✅ Utilisent les méthodes de conversion v2          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Conversion

### Conversion Alpha → Num

```
┌─────────────┐
│ Cellule     │
│ "Faible"    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────┐
│ convertToMatrixNum5()   │
│ - Détecte colonne       │
│ - Parcourt lignes       │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│ convertToNumeric5()     │
│ - Analyse "Faible"      │
│ - Retourne 2            │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│ Mise à jour cellule     │
│ - Valeur: 2             │
│ - Couleur: Vert         │
│ - Criticité: Calculée   │
└─────────────────────────┘
```

### Conversion Num → Alpha

```
┌─────────────┐
│ Cellule     │
│ "3"         │
└──────┬──────┘
       │
       ↓
┌─────────────────────────┐
│ convertToMatrixAlpha5() │
│ - Détecte colonne       │
│ - Parcourt lignes       │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│ convertToAlpha5()       │
│ - Analyse "3"           │
│ - Retourne "Modéré"     │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│ Mise à jour cellule     │
│ - Valeur: "Modéré"      │
│ - Couleur: Jaune        │
│ - Criticité: Calculée   │
└─────────────────────────┘
```

## 📦 Composants

### 1. Méthodes de Conversion Numériques

#### convertToNumeric3(value)

**Responsabilité:** Convertir vers format Num-3 (1-3)

**Entrées supportées:**
- Alpha-3: "Faible", "Moyen", "Élevé"
- Alpha-4: "Mineur", "Significatif", "Majeur", "Critique"
- Alpha-5: "Très faible", "Faible", "Modéré", "Élevé", "Très élevé"
- Num-3/4/5: 1, 2, 3, 4, 5

**Sorties:**
- 1: Faible
- 2: Moyen
- 3: Élevé

**Logique de mapping:**
```javascript
Alpha-3:  Faible → 1, Moyen → 2, Élevé → 3
Alpha-4:  Mineur → 1, Significatif → 2, Majeur/Critique → 3
Alpha-5:  Très faible → 1, Faible/Modéré → 2, Élevé/Très élevé → 3
Num-3:    1 → 1, 2 → 2, 3 → 3
Num-4:    1 → 1, 2 → 2, 3/4 → 3
Num-5:    1 → 1, 2 → 2, 3/4/5 → 3
```

#### convertToNumeric4(value)

**Responsabilité:** Convertir vers format Num-4 (1-4)

**Sorties:**
- 1: Mineur
- 2: Significatif
- 3: Majeur
- 4: Critique

#### convertToNumeric5(value)

**Responsabilité:** Convertir vers format Num-5 (1-5)

**Sorties:**
- 1: Très faible
- 2: Faible
- 3: Modéré
- 4: Élevé
- 5: Très élevé

### 2. Méthodes de Conversion Alphabétiques

#### convertToAlpha3(value)

**Responsabilité:** Convertir vers format Alpha-3

**Sorties:**
- "Faible"
- "Moyen"
- "Élevé"

#### convertToAlpha4(value)

**Responsabilité:** Convertir vers format Alpha-4

**Sorties:**
- "Mineur"
- "Significatif"
- "Majeur"
- "Critique"

#### convertToAlpha5(value)

**Responsabilité:** Convertir vers format Alpha-5

**Sorties:**
- "Très faible"
- "Faible"
- "Modéré"
- "Élevé"
- "Très élevé"

### 3. Méthodes de Conversion de Matrices

#### convertToMatrixNum3/4/5()

**Responsabilité:** Convertir toute une matrice vers format numérique

**Processus:**
1. Vérifier qu'une table est sélectionnée
2. Identifier les colonnes Probabilité, Impact, Criticité
3. Parcourir toutes les lignes
4. Convertir chaque cellule avec `convertToNumeric*()`
5. Appliquer les couleurs automatiquement
6. Calculer la criticité
7. Notifier l'utilisateur

#### convertToMatrixAlpha3/4/5()

**Responsabilité:** Convertir toute une matrice vers format alphabétique

**Processus:** Identique aux méthodes numériques

## 🎨 Gestion des Couleurs

### Palette Numérique

```javascript
getColorsNumeric(maxValue) {
  // maxValue = 9 pour Num-3 (3x3)
  // maxValue = 16 pour Num-4 (4x4)
  // maxValue = 25 pour Num-5 (5x5)
  
  return {
    1: { bg: '#28a745', text: '#ffffff' },  // Vert foncé
    2: { bg: '#90ee90', text: '#000000' },  // Vert clair
    3: { bg: '#ffc107', text: '#000000' },  // Jaune
    4: { bg: '#ff9800', text: '#000000' },  // Orange
    5: { bg: '#ff5722', text: '#ffffff' },  // Orange foncé
    // ... jusqu'à maxValue
  };
}
```

### Palette Alphabétique

```javascript
getColorsAlpha3() {
  return {
    'Faible': { bg: '#28a745', text: '#ffffff' },
    'Moyen': { bg: '#ffc107', text: '#000000' },
    'Élevé': { bg: '#dc3545', text: '#ffffff' }
  };
}
```

## 🔗 Dépendances

### Méthodes Utilisées

- `getRiskColumnPatterns()` - Détection des colonnes
- `getMatrixNum*/Alpha*()` - Matrices de criticité
- `getColorsNumeric/Alpha*()` - Palettes de couleurs
- `applyRiskStyle()` - Application des styles
- `showQuickNotification()` - Notifications
- `notifyTableStructureChange()` - Événements
- `syncWithDev()` - Synchronisation

### Méthodes Appelantes

- Menu contextuel "Évaluation des risques"
- Actions utilisateur sur les tables
- Workflows automatisés

## 📊 Matrice de Compatibilité

| Source | → Num-3 | → Num-4 | → Num-5 | → Alpha-3 | → Alpha-4 | → Alpha-5 |
|--------|---------|---------|---------|-----------|-----------|-----------|
| **Num-3** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Num-4** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Num-5** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Alpha-3** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Alpha-4** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Alpha-5** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🔐 Gestion des Erreurs

### Valeurs Non Reconnues

```javascript
convertToNumeric5("Invalide") → null
// La cellule n'est pas modifiée
// Pas d'erreur levée
```

### Table Non Sélectionnée

```javascript
convertToMatrixNum5() {
  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.");
    return;
  }
  // ...
}
```

### Colonnes Manquantes

```javascript
if (probIndex === -1 || impactIndex === -1) {
  this.showAlert("⚠️ Colonnes Probabilité et/ou Impact non trouvées.");
  return;
}
```

## 🚀 Performance

### Complexité

- **Temps:** O(n × m) où n = nombre de lignes, m = nombre de colonnes
- **Espace:** O(1) - Modification en place

### Optimisations

1. **Détection précoce:** Vérification des colonnes avant traitement
2. **Conversion unique:** Chaque cellule convertie une seule fois
3. **Cache des couleurs:** Palette calculée une fois
4. **Notification groupée:** Une seule notification à la fin

## 📈 Évolutions Futures

### Améliorations Possibles

1. **Conversion par lot:** Convertir plusieurs matrices simultanément
2. **Historique:** Permettre l'annulation (undo)
3. **Prévisualisation:** Afficher le résultat avant application
4. **Export:** Exporter la matrice convertie
5. **Validation:** Vérifier la cohérence avant conversion

### Nouvelles Fonctionnalités

1. **Conversion personnalisée:** Définir ses propres mappings
2. **Conversion partielle:** Convertir seulement certaines colonnes
3. **Conversion conditionnelle:** Appliquer des règles métier
4. **Conversion automatique:** Détecter et convertir automatiquement

## 🔗 Références

- [PROBLEME_CONVERSION_MATRICES_INCOMPLETE.md](./PROBLEME_CONVERSION_MATRICES_INCOMPLETE.md)
- [SOLUTION_CONVERSION_MATRICES_INTEGRALE.md](./SOLUTION_CONVERSION_MATRICES_INTEGRALE.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
