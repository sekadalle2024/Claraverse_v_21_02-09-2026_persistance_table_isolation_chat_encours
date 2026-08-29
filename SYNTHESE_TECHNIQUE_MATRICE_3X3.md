# Synthèse Technique - Matrice 3x3 avec Normalisation Regex

## Vue d'ensemble

Conversion de la heatmap de risques de 4x4 à 3x3 avec normalisation automatique des variations d'écriture via regex.

## Modifications apportées

### 1. Fonction de normalisation

```typescript
function normalizeValue(value: string): 'Élevé' | 'Moyen' | 'Faible' {
  if (!value) return 'Faible';
  
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Supprime les accents
  
  if (/^(eleve|elevé|élevé|elev|high|fort|forte)$/i.test(normalized)) {
    return 'Élevé';
  } else if (/^(moyen|moyenne|medium|mod|modere|moderé|modérée)$/i.test(normalized)) {
    return 'Moyen';
  } else {
    return 'Faible';
  }
}
```

**Fonctionnement:**
1. Conversion en minuscules
2. Normalisation Unicode (NFD) pour séparer les caractères de base des accents
3. Suppression des accents
4. Pattern matching avec regex
5. Retour d'une valeur normalisée

### 2. Calcul de répartition avec normalisation

```typescript
function calculerRepartitionRisques(risques: RisqueItem[]): { [key: string]: RisqueItem[] } {
  const repartition: { [key: string]: RisqueItem[] } = {};

  risques.forEach((risque) => {
    // Normaliser les valeurs avant de créer la clé
    const probNormalized = normalizeValue(risque.Probabilite);
    const impactNormalized = normalizeValue(risque.Impact);
    const key = `${probNormalized}-${impactNormalized}`;
    
    if (!repartition[key]) {
      repartition[key] = [];
    }
    repartition[key].push(risque);
  });

  return repartition;
}
```

**Avantage:** Toutes les variations d'écriture sont converties en clés standardisées.

### 3. Calcul de criticité avec normalisation

```typescript
const getCriticite = (probabilite: string, impact: string): string => {
  // Normaliser les valeurs pour la comparaison
  const probNorm = normalizeValue(probabilite);
  const impactNorm = normalizeValue(impact);
  
  // Matrice 3x3: Faible, Moyen, Élevé
  if (
    (probNorm === 'Élevé' && impactNorm === 'Élevé') ||
    (probNorm === 'Élevé' && impactNorm === 'Moyen') ||
    (probNorm === 'Moyen' && impactNorm === 'Élevé')
  ) {
    return 'Élevé';
  } else if (
    (probNorm === 'Moyen' && impactNorm === 'Moyen') ||
    (probNorm === 'Faible' && impactNorm === 'Élevé') ||
    (probNorm === 'Élevé' && impactNorm === 'Faible')
  ) {
    return 'Moyen';
  } else {
    return 'Faible';
  }
};
```

### 4. Structure de la grille 3x3

```typescript
<table className="heatmap-grid">
  <thead>
    <tr>
      <th className="heatmap-header-corner">Probabilité / Impact</th>
      <th className="heatmap-header-impact">Faible</th>
      <th className="heatmap-header-impact">Moyen</th>
      <th className="heatmap-header-impact">Élevé</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th className="heatmap-header-prob">Élevé</th>
      {renderCell('Élevé', 'Faible')}
      {renderCell('Élevé', 'Moyen')}
      {renderCell('Élevé', 'Élevé')}
    </tr>
    <tr>
      <th className="heatmap-header-prob">Moyen</th>
      {renderCell('Moyen', 'Faible')}
      {renderCell('Moyen', 'Moyen')}
      {renderCell('Moyen', 'Élevé')}
    </tr>
    <tr>
      <th className="heatmap-header-prob">Faible</th>
      {renderCell('Faible', 'Faible')}
      {renderCell('Faible', 'Moyen')}
      {renderCell('Faible', 'Élevé')}
    </tr>
  </tbody>
</table>
```

## Matrice de criticité 3x3

|              | Faible | Moyen | Élevé |
|--------------|--------|-------|-------|
| **Élevé**    | Moyen  | Élevé | Élevé |
| **Moyen**    | Faible | Moyen | Élevé |
| **Faible**   | Faible | Faible| Moyen |

## Variations supportées

### Élevé
- Élevé, élevé, ÉLEVÉ, ELEVE, eleve, Elevé
- High, high, HIGH
- Fort, fort, FORT, Forte, forte

### Moyen
- Moyen, moyen, MOYEN
- Moyenne, moyenne, MOYENNE
- Medium, medium, MEDIUM
- Modéré, modéré, MODÉRÉ, Modere, modere
- Mod, mod, MOD

### Faible
- Faible, faible, FAIBLE
- Low, low, LOW
- Toute autre valeur (par défaut)

## Exemples de normalisation

```typescript
normalizeValue("Elevé")    // → "Élevé"
normalizeValue("élevé")    // → "Élevé"
normalizeValue("ELEVE")    // → "Élevé"
normalizeValue("Fort")     // → "Élevé"
normalizeValue("Modéré")   // → "Moyen"
normalizeValue("modere")   // → "Moyen"
normalizeValue("Faible")   // → "Faible"
normalizeValue("low")      // → "Faible"
normalizeValue("")         // → "Faible"
```

## Flux de traitement

```
Données source
    ↓
normalizeValue() → Valeurs standardisées
    ↓
calculerRepartitionRisques() → Clés normalisées
    ↓
getCriticite() → Calcul de criticité
    ↓
renderCell() → Affichage dans la matrice
```

## Avantages

1. **Robustesse:** Gère toutes les variations d'écriture
2. **Maintenabilité:** Code centralisé, facile à étendre
3. **Performance:** Normalisation une seule fois par risque
4. **Conformité:** Matrice 3x3 standard
5. **Intégration complète:** Tous les risques automatiquement placés

## Tests recommandés

1. Tester avec différentes casses (majuscules, minuscules, mixte)
2. Tester avec et sans accents
3. Tester avec synonymes (Fort, High, etc.)
4. Vérifier que tous les risques sont intégrés
5. Vérifier le comptage dans chaque cellule

## Fichiers modifiés

- `src/components/Clara_Components/HeatmapRisqueAccordionRenderer.tsx`

## Aucune erreur de compilation

✅ Toutes les modifications ont été validées sans erreur TypeScript.
