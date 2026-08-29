# 📚 DOCUMENTATION COMPLÈTE - Partie 2

## 5. ARCHITECTURE TECHNIQUE

### 5.1 Flux de Données Complet

```
┌─────────────────────────────────────────────────────────────┐
│                    CHARGEMENT DE LA PAGE                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  1. conso.js s'initialise                                    │
│     - waitForReact() attend que React soit prêt              │
│     - testLocalStorage() vérifie la disponibilité           │
│     - setupGlobalEventListeners() configure les événements   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. startTableMonitoring()                                   │
│     - processAllTables() traite toutes les tables           │
│     - setupMutationObserver() surveille les changements      │
│     - setInterval() pour surveillance continue               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. processTable() pour chaque table                         │
│     - getTableHeaders() extrait les en-têtes                │
│     - generateUniqueTableId() assigne un ID                  │
│     - isCIATable = headers.some(h => /reponse_user/i)       │
│     - Si CIA → setupTableInteractions()                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. setupTableInteractions()                                 │
│     - Pour chaque cellule :                                  │
│       • Si "Reponse_user" → setupReponseUserCell()          │
│       • Si "Assertion" → setupAssertionCell()               │
│       • Si "Conclusion" → setupConclusionCell()             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. setupReponseUserCell()                                   │
│     - Vérifier localStorage pour état sauvegardé            │
│     - Créer checkbox avec état restauré                      │
│     - Attacher event listeners                               │
│     - Configurer styles                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. restoreAllTablesData() (après 1.5s)                     │
│     - loadAllData() charge depuis localStorage               │
│     - Pour chaque table dans le DOM :                        │
│       • Générer ID si nécessaire                             │
│       • restoreTableData() restaure les données              │
│     - Afficher notification de succès                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  7. INTERACTION UTILISATEUR                                  │
│     - Utilisateur coche une checkbox                         │
│     - handleCheckboxChange() déclenché                       │
│     - Décocher les autres checkboxes de la table            │
│     - Appliquer styles (fond vert)                           │
│     - saveTableData() avec debounce 500ms                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  8. saveTableDataNow()                                       │
│     - Vérifier si table CIA                                  │
│     - Si non CIA → return (ignorer)                          │
│     - Si CIA → extraire données (cells, headers)            │
│     - Sauvegarder dans localStorage                          │
│     - Log de confirmation                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  9. RECHARGEMENT DE LA PAGE                                  │
│     - Retour à l'étape 1                                     │
│     - setupReponseUserCell() vérifie localStorage            │
│     - Checkboxes recréées avec état sauvegardé ✅            │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Structure des Données

#### Format localStorage
```javascript
{
  "claraverse_tables_data": {
    "table_x9gdpi": {
      "timestamp": 1732646400000,
      "headers": [
        "Option",
        "Question", 
        "REF QUESTION",
        "Remarques",
        "REPONSE CIA",
        "Reponse User"
      ],
      "isModelized": false,
      "isCIATable": true,
      "cells": [
        {
          "row": 0,
          "col": 5,
          "value": "",
          "bgColor": "#f8f9fa",
          "isCheckboxCell": true,
          "isChecked": false
        },
        {
          "row": 2,
          "col": 5,
          "value": "",
          "bgColor": "#e8f5e8",
          "isCheckboxCell": true,
          "isChecked": true  // ← Checkbox cochée
        }
      ]
    }
  }
}
```

#### Taille des Données
- **Par checkbox** : ~50 bytes
- **Par table CIA** : ~2-3 KB (4 checkboxes)
- **Total 22 tables CIA** : ~137 KB
- **Quota disponible** : 5-10 MB
- **Utilisation** : ~1.4% du quota

### 5.3 Patterns de Détection

#### Pattern Reponse_user
```javascript
reponse_user: /reponse[_\s]?user/i
```

**Correspond à** :
- `reponse_user` ✅
- `reponse user` ✅
- `Reponse_user` ✅
- `REPONSE_USER` ✅
- `ReponseUser` ✅
- `Reponse User` ✅

**Ne correspond pas à** :
- `reponse` ❌
- `user` ❌
- `response_user` ❌

### 5.4 Gestion des Événements

#### Event Listeners
```javascript
// Sur la checkbox
checkbox.addEventListener("change", handleCheckboxChange);

// Sur la cellule
cell.addEventListener("click", (e) => {
  if (e.target !== checkbox) {
    checkbox.checked = !checkbox.checked;
    handleCheckboxChange(e);
  }
});
```

#### Debounce de Sauvegarde
```javascript
saveTableData(table) {
  // Annuler la sauvegarde en attente
  if (this.saveTimeout) {
    clearTimeout(this.saveTimeout);
  }
  
  // Programmer nouvelle sauvegarde après 500ms
  this.saveTimeout = setTimeout(() => {
    this.saveTableDataNow(table);
  }, 500);
}
```

**Avantages** :
- Évite les sauvegardes multiples rapides
- Réduit la charge sur localStorage
- Améliore les performances

### 5.5 Gestion des Conflits

#### Une Seule Checkbox par Table
```javascript
if (isNowChecked) {
  // Décocher toutes les autres checkboxes
  const allRows = tbody.querySelectorAll("tr");
  
  allRows.forEach((otherRow) => {
    if (otherRow !== row) {
      const cells = otherRow.querySelectorAll("td");
      cells.forEach((otherCell) => {
        const otherCheckbox = otherCell.querySelector("input[type='checkbox']");
        if (otherCheckbox) {
          otherCheckbox.checked = false;
          otherCell.dataset.checked = "false";
          otherCell.style.backgroundColor = "#f8f9fa";
        }
      });
    }
  });
}
```

---

## 6. FICHIERS CONCERNÉS

### 6.1 Fichiers Modifiés

#### `public/conso.js` (Principal)
**Lignes modifiées** : ~100 lignes

**Fonctions modifiées** :
1. `processTable()` (lignes ~220-260)
   - Ajout détection tables CIA
   - Appel setupTableInteractions() pour tables CIA

2. `setupReponseUserCell()` (lignes ~420-500)
   - Ajout vérification localStorage
   - Restauration état lors de la création

3. `autoSaveAllTables()` (lignes ~1982-2020)
   - Ajout filtrage tables CIA
   - Compteur tables ignorées

4. `saveTableDataNow()` (lignes ~1662-1750)
   - Ajout vérification isCIATable
   - Return early si non CIA

**Impact** :
- ✅ Checkboxes créées automatiquement
- ✅ Sauvegarde filtrée (seulement CIA)
- ✅ Restauration lors de la création
- ✅ Persistance fonctionnelle

#### `public/test-persistance-checkboxes-cia.html`
**Modification** : Correction du chemin vers conso.js
- Avant : `script.src = '../conso.js';`
- Après : `script.src = './conso.js';`

**Impact** : Page de test fonctionnelle

#### `index.html`
**Aucune modification nécessaire**

Le fichier charge déjà `conso.js` :
```html
<script src="/conso.js"></script>
```

### 6.2 Fichiers Créés

#### Documentation
1. `DOCUMENTATION_COMPLETE_CHECKBOXES_CIA_PARTIE1.md`
2. `DOCUMENTATION_COMPLETE_CHECKBOXES_CIA_PARTIE2.md`
3. `DOCUMENTATION_COMPLETE_CHECKBOXES_CIA_PARTIE3.md`
4. `FIX_CHECKBOXES_N_APPARAISSENT_PAS.md`
5. `FIX_FINAL_PERSISTANCE_CHECKBOXES_CIA.md`
6. `DEPANNAGE_CHECKBOXES_CIA.md`
7. `ACTION_IMMEDIATE_CHECKBOXES_CIA.txt`
8. `TESTEZ_PERSISTANCE_FINALE_CIA.txt`
9. `TEST_PERSISTANCE_MAINTENANT.txt`

#### Outils de Test
1. `public/test-checkboxes-cia-rapide.js`
   - Test automatique de détection des checkboxes
   - Vérification du nombre de tables CIA
   - Comptage des checkboxes créées

2. `public/test-persistance-immediat.js`
   - Vérification localStorage
   - Comparaison DOM vs localStorage
   - Diagnostic de persistance

3. `public/test-persistance-checkboxes-cia.html`
   - Page de test interactive
   - Boutons de diagnostic
   - Console intégrée

#### Guides
1. `README_FINAL_PERSISTANCE_CIA.md`
2. `GUIDE_VISUEL_PERSISTANCE_CIA.md`
3. `RESUME_MODIFICATIONS_PERSISTANCE_CIA.md`
4. `INDEX_PERSISTANCE_CHECKBOXES_CIA.md`

### 6.3 Dépendances

**Aucune nouvelle dépendance** :
- Utilise uniquement JavaScript vanilla
- Compatible avec React/Flowise existant
- Pas de bibliothèque externe requise

---

*Suite dans DOCUMENTATION_COMPLETE_CHECKBOXES_CIA_PARTIE3.md*
