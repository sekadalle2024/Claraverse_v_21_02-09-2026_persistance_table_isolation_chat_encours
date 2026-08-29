# Exemples de Normalisation Regex - Heatmap Risques

## Vue d'ensemble

La fonction `normalizeValue()` convertit toutes les variations d'écriture en valeurs standardisées.

## Processus de normalisation

```
Valeur source → toLowerCase() → normalize('NFD') → remove accents → regex match → Valeur normalisée
```

## Exemples détaillés

### Catégorie: ÉLEVÉ

| Entrée      | toLowerCase | Sans accents | Regex match | Sortie  |
|-------------|-------------|--------------|-------------|---------|
| Élevé       | élevé       | eleve        | ✓           | Élevé   |
| élevé       | élevé       | eleve        | ✓           | Élevé   |
| ÉLEVÉ       | élevé       | eleve        | ✓           | Élevé   |
| ELEVE       | eleve       | eleve        | ✓           | Élevé   |
| eleve       | eleve       | eleve        | ✓           | Élevé   |
| Elevé       | elevé       | eleve        | ✓           | Élevé   |
| High        | high        | high         | ✓           | Élevé   |
| HIGH        | high        | high         | ✓           | Élevé   |
| Fort        | fort        | fort         | ✓           | Élevé   |
| FORT        | fort        | fort         | ✓           | Élevé   |
| Forte       | forte       | forte        | ✓           | Élevé   |

### Catégorie: MOYEN

| Entrée      | toLowerCase | Sans accents | Regex match | Sortie  |
|-------------|-------------|--------------|-------------|---------|
| Moyen       | moyen       | moyen        | ✓           | Moyen   |
| moyen       | moyen       | moyen        | ✓           | Moyen   |
| MOYEN       | moyen       | moyen        | ✓           | Moyen   |
| Moyenne     | moyenne     | moyenne      | ✓           | Moyen   |
| MOYENNE     | moyenne     | moyenne      | ✓           | Moyen   |
| Medium      | medium      | medium       | ✓           | Moyen   |
| MEDIUM      | medium      | medium       | ✓           | Moyen   |
| Modéré      | modéré      | modere       | ✓           | Moyen   |
| modéré      | modéré      | modere       | ✓           | Moyen   |
| MODÉRÉ      | modéré      | modere       | ✓           | Moyen   |
| Modere      | modere      | modere       | ✓           | Moyen   |
| modere      | modere      | modere       | ✓           | Moyen   |
| Mod         | mod         | mod          | ✓           | Moyen   |
| MOD         | mod         | mod          | ✓           | Moyen   |

### Catégorie: FAIBLE

| Entrée      | toLowerCase | Sans accents | Regex match | Sortie  |
|-------------|-------------|--------------|-------------|---------|
| Faible      | faible      | faible       | ✓           | Faible  |
| faible      | faible      | faible       | ✓           | Faible  |
| FAIBLE      | faible      | faible       | ✓           | Faible  |
| Low         | low         | low          | ✓           | Faible  |
| LOW         | low         | low          | ✓           | Faible  |
| ""          | ""          | ""           | ✗ (défaut)  | Faible  |
| null        | -           | -            | ✗ (défaut)  | Faible  |
| undefined   | -           | -            | ✗ (défaut)  | Faible  |
| Autre       | autre       | autre        | ✗ (défaut)  | Faible  |

## Exemples de clés générées

### Avant normalisation (problématique)

```typescript
// Données source variées
Risque 1: Probabilite="Elevé", Impact="Moyen"    → Clé: "Elevé-Moyen"
Risque 2: Probabilite="Élevé", Impact="moyen"    → Clé: "Élevé-moyen"
Risque 3: Probabilite="ELEVE", Impact="MOYEN"    → Clé: "ELEVE-MOYEN"
Risque 4: Probabilite="Fort", Impact="Modéré"    → Clé: "Fort-Modéré"

// Résultat: 4 clés différentes pour la même cellule!
```

### Après normalisation (solution)

```typescript
// Données source variées
Risque 1: Probabilite="Elevé", Impact="Moyen"    → Clé: "Élevé-Moyen"
Risque 2: Probabilite="Élevé", Impact="moyen"    → Clé: "Élevé-Moyen"
Risque 3: Probabilite="ELEVE", Impact="MOYEN"    → Clé: "Élevé-Moyen"
Risque 4: Probabilite="Fort", Impact="Modéré"    → Clé: "Élevé-Moyen"

// Résultat: 1 seule clé, tous les risques dans la même cellule!
```

## Cas d'usage réels

### Exemple 1: Données avec accents

```typescript
// Données source
const risque = {
  no: 1,
  Risques: "Erreur de saisie",
  Probabilite: "Élevé",
  Impact: "Modéré"
};

// Traitement
const probNorm = normalizeValue("Élevé");    // → "Élevé"
const impactNorm = normalizeValue("Modéré"); // → "Moyen"
const key = `${probNorm}-${impactNorm}`;     // → "Élevé-Moyen"
```

### Exemple 2: Données sans accents

```typescript
// Données source
const risque = {
  no: 2,
  Risques: "Perte de documents",
  Probabilite: "Eleve",
  Impact: "Modere"
};

// Traitement
const probNorm = normalizeValue("Eleve");    // → "Élevé"
const impactNorm = normalizeValue("Modere"); // → "Moyen"
const key = `${probNorm}-${impactNorm}`;     // → "Élevé-Moyen"
```

### Exemple 3: Données en majuscules

```typescript
// Données source
const risque = {
  no: 3,
  Risques: "Non-respect des délais",
  Probabilite: "ELEVE",
  Impact: "MOYEN"
};

// Traitement
const probNorm = normalizeValue("ELEVE");    // → "Élevé"
const impactNorm = normalizeValue("MOYEN");  // → "Moyen"
const key = `${probNorm}-${impactNorm}`;     // → "Élevé-Moyen"
```

### Exemple 4: Données avec synonymes

```typescript
// Données source
const risque = {
  no: 4,
  Risques: "Fraude comptable",
  Probabilite: "Fort",
  Impact: "Medium"
};

// Traitement
const probNorm = normalizeValue("Fort");     // → "Élevé"
const impactNorm = normalizeValue("Medium"); // → "Moyen"
const key = `${probNorm}-${impactNorm}`;     // → "Élevé-Moyen"
```

## Résultat final

Tous les exemples ci-dessus génèrent la même clé `"Élevé-Moyen"` et seront donc placés dans la même cellule de la matrice, quelle que soit la variation d'écriture dans les données source.

## Regex patterns utilisés

```typescript
// Pattern pour ÉLEVÉ
/^(eleve|elevé|élevé|elev|high|fort|forte)$/i

// Pattern pour MOYEN
/^(moyen|moyenne|medium|mod|modere|moderé|modérée)$/i

// Pattern pour FAIBLE (par défaut)
// Toute valeur qui ne correspond pas aux patterns ci-dessus
```

## Avantages

1. **Robustesse:** Gère toutes les variations courantes
2. **Flexibilité:** Facile d'ajouter de nouveaux synonymes
3. **Maintenabilité:** Code centralisé dans une seule fonction
4. **Performance:** Normalisation rapide avec regex optimisées
5. **Fiabilité:** Tous les risques sont correctement placés

## Extension future

Pour ajouter de nouveaux synonymes, il suffit de modifier les regex patterns:

```typescript
// Ajouter "Haut" comme synonyme de "Élevé"
if (/^(eleve|elevé|élevé|elev|high|fort|forte|haut)$/i.test(normalized)) {
  return 'Élevé';
}

// Ajouter "Modéré" comme synonyme de "Moyen"
if (/^(moyen|moyenne|medium|mod|modere|moderé|modérée|moderate)$/i.test(normalized)) {
  return 'Moyen';
}
```
