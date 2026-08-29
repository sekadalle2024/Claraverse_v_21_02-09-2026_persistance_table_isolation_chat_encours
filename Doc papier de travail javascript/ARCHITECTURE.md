# 📐 Architecture - Schéma de Calcul et Cross Référence Horizontale

## Vue d'ensemble

Le système de papier de travail est composé de 2 modules principaux:
1. **Schéma de Calcul**: Formules de calcul pour les tests
2. **Cross Référence Horizontale**: Références documentaires pour chaque variable

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Menu Contextuel (menu.js)                           │  │
│  │  - Ajouter Schéma (Ctrl+Shift+K)                     │  │
│  │  - Régénérer Schéma                                   │  │
│  │  - Supprimer Schéma                                   │  │
│  │  - Ajouter Cross Référence (Ctrl+Shift+H)            │  │
│  │  - Actualiser Cross Référence                         │  │
│  │  - Supprimer Cross Référence                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE LOGIQUE                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SchemaCalculManager                                  │  │
│  │  - Détection automatique des tables                   │  │
│  │  - Extraction "Nature de test"                        │  │
│  │  - Génération du schéma approprié                     │  │
│  │  - Gestion de la persistance                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CrossRefHorizontaleManager                           │  │
│  │  - Détection automatique des tables                   │  │
│  │  - Extraction "Nature de test"                        │  │
│  │  - Génération des références selon nature            │  │
│  │  - Gestion de la persistance                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE DONNÉES                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  localStorage                                         │  │
│  │  - Schéma: claraverse_schema_calcul_data             │  │
│  │  - Cross Ref: claraverse_cross_ref_data              │  │
│  │  - Format: JSON                                       │  │
│  │  - Sauvegarde automatique (debounce 500ms)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Composants principaux

### 1. SchemaCalculManager

**Fichier**: `public/papier-travail-schema-calcul.js`

**Responsabilités**:
- Surveillance continue des tables dans le DOM
- Détection de la "Nature de test" dans la table 2
- Identification de la table principale (Modelised_table)
- Génération du schéma de calcul approprié
- Gestion de la persistance avec localStorage
- Restauration des schémas au chargement

**Méthodes principales**:

```javascript
class SchemaCalculManager {
  init()                          // Initialisation du gestionnaire
  start()                         // Démarrage de la surveillance
  processAllTables()              // Traitement de toutes les tables
  processDivTables(div)           // Traitement des tables d'une div
  extractNatureDeTest(table)      // Extraction de la nature de test
  isModelizedTable(table)         // Vérification table modelisée
  createSchemaCalcul(...)         // Création du schéma
  determinerModele(natureDeTest)  // Détermination du modèle
  buildSchemaTable(modele)        // Construction de la table HTML
  saveSchemaData(schemaTable)     // Sauvegarde des données
  restoreAllSchemas()             // Restauration des schémas
}
```

### 2. Menu Contextuel Integration

**Fichier**: `public/menu-papier-travail-integration.js`

**Responsabilités**:
- Intégration dans le menu contextuel existant
- Actions manuelles sur les schémas
- Raccourcis clavier

**Méthodes à ajouter dans ContextualMenuManager**:

```javascript
ajouterSchemaCalcul()      // Ajouter un schéma manuellement
regenererSchemaCalcul()    // Régénérer le schéma
supprimerSchemaCalcul()    // Supprimer le schéma
extractNatureDeTest(table) // Extraire la nature de test
isModelizedTable(table)    // Vérifier si table modelisée
createSchemaCalculTable()  // Créer la table du schéma
determinerModeleSchemaCalcul() // Déterminer le modèle
```

### 3. Intégration avec n8n

**Traitement des données n8n**:
- Les données de papier de travail arrivent via n8n
- Le schéma de calcul est détecté automatiquement dans le DOM
- Pas de service TypeScript dédié (intégration directe JavaScript)
- Le module `papier-travail-schema-calcul.js` gère tout le traitement

## Flux de données

### 1. Détection automatique

```
┌─────────────────────────────────────────────────────────────┐
│ 1. MutationObserver détecte un changement dans le DOM       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SchemaCalculManager.processAllTables()                   │
│    - Recherche toutes les divs avec class="prose"           │
│    - Pour chaque div, appelle processDivTables()            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. processDivTables(div)                                     │
│    - Recherche la table 2 (contient "Nature de test")       │
│    - Extrait la valeur de la nature de test                 │
│    - Recherche la table principale (Modelised_table)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. createSchemaCalcul(tablePrincipale, natureDeTest)        │
│    - Détermine le modèle selon la nature                    │
│    - Construit la table HTML du schéma                      │
│    - Insère au-dessus de la table principale                │
│    - Rend les cellules éditables                            │
│    - Installe le détecteur de changements                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Sauvegarde automatique dans localStorage                 │
│    - Debounce de 500ms                                       │
│    - Format JSON avec timestamp                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Action manuelle (menu contextuel)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Utilisateur clique droit sur une table                   │
│    - Menu contextuel s'affiche                               │
│    - Section "Papier de travail" visible                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Utilisateur sélectionne "Ajouter Schéma de calcul"       │
│    ou appuie sur Ctrl+Shift+S                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ajouterSchemaCalcul()                                     │
│    - Vérifie que c'est une table modelisée                  │
│    - Recherche la table 2 dans la div parente               │
│    - Extrait la nature de test                               │
│    - Vérifie si un schéma existe déjà                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. createSchemaCalculTable(tablePrincipale, natureDeTest)   │
│    - Même processus que la détection automatique            │
│    - Notification de succès affichée                         │
└─────────────────────────────────────────────────────────────┘
```

### 3. Restauration au chargement

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Page chargée, SchemaCalculManager.init()                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. restoreAllSchemas()                                       │
│    - Charge les données depuis localStorage                  │
│    - Pour chaque schéma sauvegardé:                          │
│      * Recherche la table principale par ID                  │
│      * Recherche le schéma dans le DOM                       │
│      * Restaure les valeurs des cellules                     │
└─────────────────────────────────────────────────────────────┘
```

## Structure des données

### Format localStorage

```json
{
  "schema_table_abc123_1714000000000": {
    "timestamp": 1714000000000,
    "forTable": "table_abc123",
    "cells": [
      { "row": 0, "col": 0, "value": "(A)" },
      { "row": 0, "col": 1, "value": "(B)" },
      { "row": 0, "col": 2, "value": "(C) = (A) + (B)" },
      { "row": 0, "col": 3, "value": "(D)" },
      { "row": 0, "col": 4, "value": "(E) = (C) - (D)" }
    ]
  },
  "schema_table_def456_1714000100000": {
    "timestamp": 1714000100000,
    "forTable": "table_def456",
    "cells": [
      { "row": 0, "col": 0, "value": "(A)" },
      { "row": 0, "col": 1, "value": "(B)" },
      { "row": 0, "col": 2, "value": "(C) = (A) - (B)" }
    ]
  }
}
```

### Modèles de schémas

```javascript
const MODELES = {
  "Validation": {
    colonnes: ["(A)", "(B)", "(C) = (A) + (B)", "(D)", "(E) = (C) - (D)"]
  },
  "Mouvement": {
    colonnes: ["(A)", "(B)", "(C)", "(D) = (A) + (B) - (C)", "(E)", "(F) = (D) - (E)"]
  },
  "Rapprochement": {
    colonnes: ["(A)", "(B)", "(C) = (A) - (B)"]
  },
  "Séparation": {
    colonnes: ["(A)", "(B)", "(C) = (A) - (B)"]
  },
  "Estimation": {
    colonnes: ["(A)", "(B)", "(C) = (A) * (B)", "(D)", "(E) = (C) - (D)"]
  },
  "Revue analytique": {
    colonnes: ["(A)", "(B)", "(C) = (A) - (B)"]
  },
  "Cadrage TVA": {
    colonnes: ["(A)", "(B) = (A) * 18%", "(C)", "(D)", "(E)", "(F) = (B) - (C) - (D) - (E)"]
  },
  "Cotisations sociales": {
    colonnes: ["(A)", "(B)", "(C)", "(D)"]
  },
  "Vierge": {
    colonnes: []
  },
  "Modélisation": {
    colonnes: [] // Détection automatique des variables
  }
};
```

## Interactions entre composants

### 1. SchemaCalculManager ↔ DOM

```
SchemaCalculManager
    ↓ observe
   DOM (MutationObserver)
    ↓ détecte changement
SchemaCalculManager.processAllTables()
    ↓ crée
Schéma HTML (table)
    ↓ insère dans
   DOM
```

### 2. SchemaCalculManager ↔ localStorage

```
SchemaCalculManager
    ↓ sauvegarde
localStorage (JSON)
    ↓ restaure au chargement
SchemaCalculManager.restoreAllSchemas()
    ↓ applique valeurs
Schémas dans le DOM
```

### 3. Menu Contextuel ↔ SchemaCalculManager

```
Menu Contextuel (menu.js)
    ↓ appelle
ajouterSchemaCalcul()
    ↓ utilise
SchemaCalculManager (window.SchemaCalculManager)
    ↓ crée/modifie
Schéma dans le DOM
```

### 4. n8n ↔ Rendu HTML

```
n8n Response (JSON)
    ↓ génère HTML
Chat (DOM)
    ↓ détecté par
SchemaCalculManager
    ↓ crée automatiquement
Schéma de calcul dans le DOM
```

## Gestion des événements

### 1. Événements DOM

```javascript
// MutationObserver sur document.body
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false
});

// Événements sur les cellules éditables
cell.addEventListener("blur", () => saveSchemaData());
cell.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    cell.blur();
  }
});
```

### 2. Événements de sauvegarde

```javascript
// Debounce pour éviter les sauvegardes trop fréquentes
saveSchemaData(schemaTable) {
  if (this.saveTimeout) {
    clearTimeout(this.saveTimeout);
  }
  
  this.saveTimeout = setTimeout(() => {
    this.saveSchemaDataNow(schemaTable);
  }, 500); // 500ms de délai
}
```

### 3. Événements de restauration

```javascript
// Au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  manager.start();
  manager.restoreAllSchemas();
});
```

## Optimisations

### 1. WeakSet pour éviter le retraitement

```javascript
this.processedTables = new WeakSet();

// Marquer une table comme traitée
this.processedTables.add(tablePrincipale);

// Vérifier si déjà traitée
if (this.processedTables.has(tablePrincipale)) {
  return; // Skip
}
```

### 2. Debounce pour la sauvegarde

```javascript
// Évite les sauvegardes trop fréquentes
this.autoSaveDelay = 500; // ms

// Annule la sauvegarde précédente si nouvelle modification
if (this.saveTimeout) {
  clearTimeout(this.saveTimeout);
}
```

### 3. MutationObserver ciblé

```javascript
// Observer uniquement les changements pertinents
mutations.forEach((mutation) => {
  if (mutation.type === "childList") {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === "TABLE" || 
            node.querySelector("table")) {
          shouldProcess = true;
        }
      }
    });
  }
});
```

## Sécurité et robustesse

### 1. Gestion des erreurs

```javascript
try {
  this.createSchemaCalculTable(tablePrincipale, natureDeTest);
  this.showQuickNotification(`✅ Schéma créé`);
} catch (error) {
  console.error("❌ Erreur:", error);
  this.showAlert(`❌ Erreur: ${error.message}`);
}
```

### 2. Validation des données

```javascript
// Vérifier que la table est modelisée
if (!this.isModelizedTable(this.targetTable)) {
  this.showAlert("⚠️ Cette table n'est pas modelisée");
  return;
}

// Vérifier la présence de la nature de test
if (!natureDeTest) {
  this.showAlert("⚠️ Nature de test non trouvée");
  return;
}
```

### 3. Nettoyage des ressources

```javascript
cleanup() {
  if (this.observer) {
    this.observer.disconnect();
  }
  
  if (this.intervalId) {
    clearInterval(this.intervalId);
  }
  
  if (this.saveTimeout) {
    clearTimeout(this.saveTimeout);
  }
  
  if (this.schemaObservers) {
    this.schemaObservers.forEach(obs => obs.disconnect());
    this.schemaObservers.clear();
  }
}
```

## Extension et personnalisation

### 1. Ajouter un nouveau modèle

```javascript
// Dans determinerModele()
if (nature.includes("nouveau_type")) {
  return {
    type: "Nouveau Type",
    colonnes: ["(A)", "(B)", "(C) = formule personnalisée"]
  };
}
```

### 2. Modifier le style CSS

```javascript
// Dans buildSchemaTable()
schemaTable.style.cssText = `
  margin-bottom: 1rem;
  border-collapse: separate;
  border-spacing: 0;
  background: #fffbf0; // Modifier la couleur de fond
`;
```

### 3. Ajouter des fonctionnalités

```javascript
// Exemple: Export du schéma en CSV
exportSchemaToCSV(schemaTable) {
  const rows = schemaTable.querySelectorAll("tbody tr");
  const csv = Array.from(rows).map(row => {
    const cells = row.querySelectorAll("td");
    return Array.from(cells).map(cell => cell.textContent).join(",");
  }).join("\n");
  
  // Télécharger le CSV
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "schema-calcul.csv";
  a.click();
}
```
