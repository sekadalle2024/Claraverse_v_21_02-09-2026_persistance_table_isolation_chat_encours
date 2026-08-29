# Patterns de Détection des Tables Clara

## 📋 Table des matières
1. [Pattern FRAP](#pattern-frap)
2. [Pattern Recos Révision](#pattern-recos-révision)
3. [Pattern Recos Contrôle Interne](#pattern-recos-contrôle-interne)
4. [Pattern générique](#pattern-générique)
5. [Détection par contenu vs structure](#détection-par-contenu-vs-structure)

---

## Pattern FRAP

### Description
FRAP = Feuille de Révélation et d'Analyse de Problème

### Structure
- **6 tables consécutives** pour un point FRAP
- Table 1: Métadonnées (Etape, Norme, Méthode, Reference)
- Table 2: Intitulé
- Table 3: Observation
- Table 4: Constat
- Table 5: Risque
- Table 6: Recommandation

### Identification
```javascript
// Identifier une table FRAP
const isFrap = firstTableData.some(row => 
  row.some(cell => (cell || '').toLowerCase().includes('frap'))
);
```

### Contenu typique
```
Table 1 (Métadonnées):
| Etape | Audit des comptes |
| Norme | ISA 200 |
| Méthode | Procédure d'audit |
| Reference | Ref-001 |

Table 2 (Intitulé):
| Intitulé du point FRAP |

Table 3 (Observation):
| Observation détaillée du problème |

Table 4 (Constat):
| Constat du problème |

Table 5 (Risque):
| Risque associé |

Table 6 (Recommandation):
| Recommandation pour corriger |
```

### Code d'extraction
```javascript
collectFrapPoints(tables) {
  const frapPoints = [];
  const processedIndices = new Set();

  for (let i = 0; i < tables.length; i++) {
    if (processedIndices.has(i)) continue;

    const firstTable = tables[i];
    const firstTableData = this.extractTableDataOptimized(firstTable);
    
    // Identifier une table FRAP
    const isFrap = firstTableData.some(row => 
      row.some(cell => (cell || '').toLowerCase().includes('frap'))
    );

    if (!isFrap) continue;

    // Collecter les 6 tables consécutives
    const groupSize = Math.min(6, tables.length - i);
    const tableGroup = [];
    for (let j = 0; j < groupSize; j++) {
      tableGroup.push(tables[i + j]);
      processedIndices.add(i + j);
    }

    console.log(`✅ [FRAP] Table FRAP détectée avec ${tableGroup.length} sous-tables`);

    // Extraire les données
    const frapData = {
      metadata: {},
      intitule: '',
      observation: '',
      constat: '',
      risque: '',
      recommandation: ''
    };

    tableGroup.forEach((subTable, index) => {
      const data = this.extractTableDataOptimized(subTable);
      
      if (index === 0) {
        // Métadonnées
        data.forEach(row => {
          if (row.length >= 2) {
            const key = (row[0] || '').toLowerCase().trim();
            const value = row[1] || '';
            if (key.includes('etape')) frapData.metadata.etape = value;
            if (key.includes('norme')) frapData.metadata.norme = value;
            if (key.includes('méthode') || key.includes('methode')) frapData.metadata.methode = value;
            if (key.includes('reference') || key.includes('référence')) frapData.metadata.reference = value;
          }
        });
      } else if (index === 1 && data.length > 0) {
        frapData.intitule = this.extractFullCellContent(data);
      } else if (index === 2 && data.length > 0) {
        frapData.observation = this.extractFullCellContent(data);
      } else if (index === 3 && data.length > 0) {
        frapData.constat = this.extractFullCellContent(data);
      } else if (index === 4 && data.length > 0) {
        frapData.risque = this.extractFullCellContent(data);
      } else if (index === 5 && data.length > 0) {
        frapData.recommandation = this.extractFullCellContent(data);
      }
    });

    if (frapData.intitule) {
      frapPoints.push(frapData);
    }
  }

  return frapPoints;
}
```

### Logs attendus
```
✅ [FRAP] Table FRAP détectée avec 6 sous-tables
✅ [FRAP] Table FRAP détectée avec 6 sous-tables
```

---

## Pattern Recos Révision

### Description
Recos Révision = Recommandations pour la Révision des Comptes

### Structure
- **6 tables consécutives** pour une recommandation
- Table 1: Métadonnées (Etape, Norme, Méthode, Reference)
- Table 2: Intitulé
- Table 3: Description
- Table 4: Observation
- Table 5: Ajustement
- Table 6: Régularisation

### Identification
```javascript
// Identifier une table Recos Révision
const isRecosRevision = firstTableData.some(row => 
  row.some(cell => {
    const cellLower = (cell || '').toLowerCase();
    return (cellLower.includes('recos') && cellLower.includes('revision')) || 
           (cellLower.includes('recommendations') && cellLower.includes('comptable') && 
            !cellLower.includes('contrôle') && !cellLower.includes('controle') && 
            !cellLower.includes('interne'));
  })
);
```

### Contenu typique
```
Table 1 (Métadonnées):
| Etape | Révision des comptes |
| Norme | ISA 700 |
| Méthode | Procédure de révision |
| Reference | Ref-002 |

Table 2 (Intitulé):
| Intitulé de la recommandation |

Table 3 (Description):
| Description détaillée |

Table 4 (Observation):
| Observation |

Table 5 (Ajustement):
| Ajustement proposé |

Table 6 (Régularisation):
| Régularisation |
```

### Code d'extraction
```javascript
collectRecosRevisionPoints(tables) {
  const recosPoints = [];
  const processedIndices = new Set();

  for (let i = 0; i < tables.length; i++) {
    if (processedIndices.has(i)) continue;

    const firstTable = tables[i];
    const firstTableData = this.extractTableDataOptimized(firstTable);
    
    // Identifier une table Recos Révision
    const isRecosRevision = firstTableData.some(row => 
      row.some(cell => {
        const cellLower = (cell || '').toLowerCase();
        return (cellLower.includes('recos') && cellLower.includes('revision')) || 
               (cellLower.includes('recommendations') && cellLower.includes('comptable') && 
                !cellLower.includes('contrôle') && !cellLower.includes('controle') && 
                !cellLower.includes('interne'));
      })
    );

    if (!isRecosRevision) continue;

    // Collecter les 6 tables consécutives
    const groupSize = Math.min(6, tables.length - i);
    const tableGroup = [];
    for (let j = 0; j < groupSize; j++) {
      tableGroup.push(tables[i + j]);
      processedIndices.add(i + j);
    }

    console.log(`✅ [Recos Révision] Table détectée avec ${tableGroup.length} sous-tables`);

    // Extraire les données
    const recosData = {
      metadata: {},
      intitule: '',
      description: '',
      observation: '',
      ajustement: '',
      regularisation: ''
    };

    tableGroup.forEach((subTable, index) => {
      const data = this.extractTableDataOptimized(subTable);
      
      if (index === 0) {
        // Métadonnées
        data.forEach(row => {
          if (row.length >= 2) {
            const key = (row[0] || '').toLowerCase().trim();
            const value = row[1] || '';
            if (key.includes('etape')) recosData.metadata.etape = value;
            if (key.includes('norme')) recosData.metadata.norme = value;
            if (key.includes('méthode') || key.includes('methode')) recosData.metadata.methode = value;
            if (key.includes('reference') || key.includes('référence')) recosData.metadata.reference = value;
          }
        });
      } else if (index === 1 && data.length > 0) {
        recosData.intitule = this.extractFullCellContent(data);
      } else if (index === 2 && data.length > 0) {
        recosData.description = this.extractFullCellContent(data);
      } else if (index === 3 && data.length > 0) {
        recosData.observation = this.extractFullCellContent(data);
      } else if (index === 4 && data.length > 0) {
        recosData.ajustement = this.extractFullCellContent(data);
      } else if (index === 5 && data.length > 0) {
        recosData.regularisation = this.extractFullCellContent(data);
      }
    });

    if (recosData.intitule) {
      recosPoints.push(recosData);
    }
  }

  return recosPoints;
}
```

### Logs attendus
```
✅ [Recos Révision] Table détectée avec 6 sous-tables
✅ [Recos Révision] Table détectée avec 6 sous-tables
```

---

## Pattern Recos Contrôle Interne

### Description
Recos CI = Recommandations pour le Contrôle Interne Comptable

### Structure
- **6 tables consécutives** pour une recommandation
- Table 1: Métadonnées (Etape, Norme, Méthode, Reference)
- Table 2: Intitulé
- Table 3: Observation
- Table 4: Constat
- Table 5: Risque
- Table 6: Recommandation

### Identification
```javascript
// Identifier une table Recos CI
const isRecosCI = firstTableData.some(row => 
  row.some(cell => {
    const cellLower = (cell || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const hasRecos = cellLower.includes('recos');
    const hasControle = cellLower.includes('controle');
    const hasInterne = cellLower.includes('interne');
    const hasComptable = cellLower.includes('comptable');
    
    return hasRecos && hasControle && hasInterne && hasComptable;
  })
);
```

### Contenu typique
```
Table 1 (Métadonnées):
| Etape | Contrôle interne |
| Norme | COSO |
| Méthode | Procédure de contrôle |
| Reference | Ref-003 |

Table 2 (Intitulé):
| Intitulé de la recommandation CI |

Table 3 (Observation):
| Observation |

Table 4 (Constat):
| Constat |

Table 5 (Risque):
| Risque |

Table 6 (Recommandation):
| Recommandation |
```

### Code d'extraction
```javascript
collectRecosControleInternePoints(tables) {
  const recosPoints = [];
  const processedIndices = new Set();

  for (let i = 0; i < tables.length; i++) {
    if (processedIndices.has(i)) continue;

    const firstTable = tables[i];
    const firstTableData = this.extractTableDataOptimized(firstTable);
    
    // Identifier une table Recos CI
    const isRecosCI = firstTableData.some(row => 
      row.some(cell => {
        const cellLower = (cell || '').toLowerCase().replace(/\s+/g, ' ').trim();
        const hasRecos = cellLower.includes('recos');
        const hasControle = cellLower.includes('controle');
        const hasInterne = cellLower.includes('interne');
        const hasComptable = cellLower.includes('comptable');
        
        return hasRecos && hasControle && hasInterne && hasComptable;
      })
    );

    if (!isRecosCI) continue;

    // Collecter les 6 tables consécutives
    const groupSize = Math.min(6, tables.length - i);
    const tableGroup = [];
    for (let j = 0; j < groupSize; j++) {
      tableGroup.push(tables[i + j]);
      processedIndices.add(i + j);
    }

    console.log(`✅ [Recos CI] Table détectée avec ${tableGroup.length} sous-tables`);

    // Extraire les données
    const recosData = {
      metadata: {},
      intitule: '',
      observation: '',
      constat: '',
      risque: '',
      recommandation: ''
    };

    tableGroup.forEach((subTable, index) => {
      const data = this.extractTableDataOptimized(subTable);
      
      if (index === 0) {
        // Métadonnées
        data.forEach(row => {
          if (row.length >= 2) {
            const key = (row[0] || '').toLowerCase().trim();
            const value = row[1] || '';
            if (key.includes('etape')) recosData.metadata.etape = value;
            if (key.includes('norme')) recosData.metadata.norme = value;
            if (key.includes('méthode') || key.includes('methode')) recosData.metadata.methode = value;
            if (key.includes('reference') || key.includes('référence')) recosData.metadata.reference = value;
          }
        });
      } else if (index === 1 && data.length > 0) {
        recosData.intitule = this.extractFullCellContent(data);
      } else if (index === 2 && data.length > 0) {
        recosData.observation = this.extractFullCellContent(data);
      } else if (index === 3 && data.length > 0) {
        recosData.constat = this.extractFullCellContent(data);
      } else if (index === 4 && data.length > 0) {
        recosData.risque = this.extractFullCellContent(data);
      } else if (index === 5 && data.length > 0) {
        recosData.recommandation = this.extractFullCellContent(data);
      }
    });

    if (recosData.intitule) {
      recosPoints.push(recosData);
    }
  }

  return recosPoints;
}
```

### Logs attendus
```
✅ [Recos CI] Table détectée avec 6 sous-tables
```

---

## Pattern générique

### Description
Pattern réutilisable pour détecter n'importe quel type de table.

### Code
```javascript
// Pattern générique
detectAndProcessTables(tables, typeIdentifier, processor) {
  const results = [];
  const processedIndices = new Set();

  for (let i = 0; i < tables.length; i++) {
    if (processedIndices.has(i)) continue;

    const firstTable = tables[i];
    const firstTableData = this.extractTableDataOptimized(firstTable);
    
    // Identifier le type de table
    const isType = typeIdentifier(firstTableData);

    if (!isType) continue;

    // Collecter N tables consécutives
    const groupSize = Math.min(6, tables.length - i);
    const tableGroup = [];
    for (let j = 0; j < groupSize; j++) {
      tableGroup.push(tables[i + j]);
      processedIndices.add(i + j);
    }

    // Traiter le groupe
    const result = processor(tableGroup);
    
    if (result) {
      results.push(result);
    }
  }

  return results;
}

// Utilisation
const frapPoints = this.detectAndProcessTables(
  tables,
  (data) => data.some(row => row.some(cell => (cell || '').toLowerCase().includes('frap'))),
  (tableGroup) => this.processFrapGroup(tableGroup)
);
```

---

## Détection par contenu vs structure

### Détection par contenu (RECOMMANDÉ)
```javascript
// ✅ BON: Vérifier le contenu
const isFrap = firstTableData.some(row => 
  row.some(cell => (cell || '').toLowerCase().includes('frap'))
);
```

**Avantages**:
- Robuste aux changements de structure HTML
- Fonctionne même si les classes CSS changent
- Identifie correctement le type de table
- Pas de dépendances externes

### Détection par structure (À ÉVITER)
```javascript
// ❌ MAUVAIS: Vérifier la structure HTML
const isFrap = table.classList.contains('frap-table');
```

**Inconvénients**:
- Dépend de la structure HTML
- Casse si les classes changent
- Nécessite de modifier le HTML
- Pas flexible

### Détection par attribut (À ÉVITER)
```javascript
// ❌ MAUVAIS: Vérifier un attribut
const isFrap = table.getAttribute('data-type') === 'frap';
```

**Inconvénients**:
- Dépend d'un attribut qui n'existe pas
- Nécessite de modifier le HTML
- Pas flexible

---

## Résumé des patterns

| Pattern | Identification | Nombre de tables | Champs |
|---------|----------------|------------------|--------|
| FRAP | Contient "frap" | 6 | metadata, intitule, observation, constat, risque, recommandation |
| Recos Révision | Contient "recos" + "revision" | 6 | metadata, intitule, description, observation, ajustement, regularisation |
| Recos CI | Contient "recos" + "controle" + "interne" + "comptable" | 6 | metadata, intitule, observation, constat, risque, recommandation |

---

**Dernière mise à jour**: 26 Mars 2026  
**Statut**: ✅ Tous les patterns implémentés et testés
