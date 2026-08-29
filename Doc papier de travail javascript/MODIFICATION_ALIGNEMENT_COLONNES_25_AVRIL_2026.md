# Modification - Alignement des colonnes Schéma de Calcul et Cross Référence
**Date:** 25 avril 2026

## 🎯 Objectif

Modifier l'architecture actuelle pour que:
1. Les tables [Schéma de calcul] et [Cross référence horizontale] aient le **même nombre de colonnes** que la table principale de test
2. Les variables se terminent toujours sur l'axe de la colonne "Ecart" pour un meilleur alignement esthétique

## 📊 Situation actuelle

### Avant modification:
```
Table Schéma de calcul (3 colonnes):
| (A) | (B) | (C) = (A) - (B) |

Table principale (6 colonnes):
| Compte | Libellé | Solde BG | Solde PV | Ecart | Conclusion |
```

### Après modification:
```
Table Schéma de calcul (6 colonnes - alignée):
|     |     |     | (A) | (B) | (C) = (A) - (B) |

Table principale (6 colonnes):
| Compte | Libellé | Solde BG | Solde PV | Ecart | Conclusion |
                                    ↑        ↑              ↑
                                    A        B              C (Ecart)
```

## 🔧 Modifications à apporter

### 1. Détection de la colonne "Ecart"

Ajouter une méthode pour trouver l'index de la colonne "Ecart":

```javascript
/**
 * Trouver l'index de la colonne "Ecart" dans une table
 */
findEcartColumnIndex(table) {
  const headers = this.getTableHeadersDirect(table);
  
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase().trim();
    if (h.includes("ecart") || h.includes("écart") || h.includes("montant")) {
      return i;
    }
  }
  
  return -1; // Pas trouvé
}
```

### 2. Calcul du nombre de colonnes vides à ajouter

```javascript
/**
 * Calculer le nombre de colonnes vides à ajouter avant les variables
 */
calculateEmptyColumnsCount(tablePrincipale, modele) {
  const totalColumns = this.getTableHeadersDirect(tablePrincipale).length;
  const ecartIndex = this.findEcartColumnIndex(tablePrincipale);
  
  if (ecartIndex === -1) {
    // Pas de colonne Ecart, aligner à droite
    return totalColumns - modele.colonnes.length;
  }
  
  // Aligner pour que la dernière variable soit sur la colonne Ecart
  const variablesCount = modele.colonnes.length;
  const emptyColumns = ecartIndex - variablesCount + 1;
  
  return Math.max(0, emptyColumns);
}
```

### 3. Modification de la création du schéma

```javascript
createSchemaCalculTableDirect(tablePrincipale, natureDeTest) {
  // ... code existant ...
  
  // Déterminer le modèle
  const modele = this.determinerModeleSchemaCalculDirect(natureDeTest);
  
  // Calculer le nombre de colonnes vides
  const totalColumns = this.getTableHeadersDirect(tablePrincipale).length;
  const emptyColumnsCount = this.calculateEmptyColumnsCount(tablePrincipale, modele);
  
  // Créer le tbody
  const tbody = document.createElement("tbody");
  const row = document.createElement("tr");

  // Ajouter les colonnes vides
  for (let i = 0; i < emptyColumnsCount; i++) {
    const td = document.createElement("td");
    td.className = "px-4 py-3 border border-gray-200 dark:border-gray-700";
    td.style.cssText = `
      background: #fffbf0;
      min-width: 80px;
    `;
    td.textContent = "";
    row.appendChild(td);
  }

  // Ajouter les colonnes du modèle
  modele.colonnes.forEach((colonne) => {
    const td = document.createElement("td");
    td.className = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    td.style.cssText = `
      background: #fff9e6;
      font-weight: 500;
      text-align: center;
      min-width: 80px;
      cursor: text;
    `;
    td.textContent = colonne;
    td.contentEditable = "true";
    row.appendChild(td);
  });

  // Compléter avec des colonnes vides si nécessaire
  const remainingColumns = totalColumns - emptyColumnsCount - modele.colonnes.length;
  for (let i = 0; i < remainingColumns; i++) {
    const td = document.createElement("td");
    td.className = "px-4 py-3 border border-gray-200 dark:border-gray-700";
    td.style.cssText = `
      background: #fffbf0;
      min-width: 80px;
    `;
    td.textContent = "";
    row.appendChild(td);
  }

  tbody.appendChild(row);
  schemaTable.appendChild(tbody);
  
  // ... reste du code ...
}
```

## 📐 Exemple visuel

### Cas: Rapprochement (3 variables)

**Table principale (6 colonnes):**
```
| Compte | Libellé | Solde BG | Solde PV | Ecart | Conclusion |
```

**Schéma de calcul (6 colonnes alignées):**
```
|        |         |          | (A)      | (B)   | (C) = (A) - (B) |
```

**Cross référence (6 colonnes alignées):**
```
|        |         |          | [AA10]   | [AA20]| [AA30]          |
```

### Cas: Mouvement (6 variables)

**Table principale (8 colonnes):**
```
| Compte | Libellé | Solde N-1 | Augm | Dim | Solde N | Ecart | Conclusion |
```

**Schéma de calcul (8 colonnes alignées):**
```
|        |         | (A)       | (B)  | (C) | (D)=(A)+(B)-(C) | (E) | (F)=(D)-(E) |
```

## 🔄 Même logique pour Cross Référence Horizontale

Appliquer exactement la même logique pour `ajouterCrossRefHorizontale()`:

1. Détecter le nombre de colonnes de la table principale
2. Trouver l'index de la colonne "Ecart"
3. Aligner les références pour que la dernière soit sur "Ecart"
4. Compléter avec des colonnes vides

## ✅ Avantages

1. **Alignement visuel parfait** entre les 3 tables
2. **Lecture facilitée** des correspondances
3. **Esthétique professionnelle** du papier de travail
4. **Cohérence** avec les standards d'audit

## 📝 Fichiers à modifier

1. `public/menu.js` - Méthodes:
   - `createSchemaCalculTableDirect()`
   - `ajouterCrossRefHorizontale()` (méthode similaire)
   - Ajouter `findEcartColumnIndex()`
   - Ajouter `calculateEmptyColumnsCount()`

2. `public/papier-travail-schema-calcul.js` - Même modifications
3. `public/papier-travail-cross-ref-horizontale.js` - Même modifications

## 🎯 Prochaines étapes

1. Implémenter les modifications dans `menu.js`
2. Tester avec différentes natures de test
3. Vérifier l'alignement visuel
4. Mettre à jour les modules standalone
5. Documenter les changements

