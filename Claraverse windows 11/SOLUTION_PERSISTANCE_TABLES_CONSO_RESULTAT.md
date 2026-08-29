# 🔧 Solution : Persistance des Tables [Table_conso] et [Resultat]

## 📋 Analyse du Problème

### Situation Actuelle

✅ **Fonctionne** :
- Les modifications des cellules dans [Modelised_table] sont persistantes
- Le système de sauvegarde IndexedDB fonctionne pour les tables modifiées manuellement

❌ **Ne fonctionne pas** :
- Les tables [Table_conso] générées automatiquement ne sont pas persistantes
- Les tables [Resultat] générées automatiquement ne sont pas persistantes
- Les données renseignées automatiquement par consolidation disparaissent après F5

### Cause Racine

Les tables [Table_conso] et [Resultat] sont créées dynamiquement par conso.js mais :

1. **Elles ne sont pas enregistrées dans IndexedDB** lors de leur création
2. **Elles ne sont pas restaurées** lors du rechargement de la page
3. **Le système de détection de changements** ne les capture pas correctement
4. **Elles n'ont pas d'ID stable** pour être identifiées lors de la restauration

---

## 🎯 Solution Proposée

### Approche en 3 Étapes

#### Étape 1 : Assigner des IDs Stables aux Tables Générées
#### Étape 2 : Sauvegarder Automatiquement après Génération
#### Étape 3 : Restaurer les Tables Générées au Chargement

---

## 🔧 Modifications à Apporter

### Modification 1 : Améliorer `createConsolidationTable()`

**Fichier** : `conso.js`  
**Ligne** : ~525

**Objectif** : Assigner un ID stable et sauvegarder la table après création

```javascript
createConsolidationTable(table) {
  const existingConso = this.findExistingConsoTable(table);
  if (existingConso) {
    debug.log("Table de consolidation existante trouvée");
    return;
  }

  const consoTable = document.createElement("table");
  consoTable.className = "claraverse-conso-table";
  
  // ✅ AJOUT : Générer un ID stable basé sur la table source
  const sourceTableId = this.generateUniqueTableId(table);
  const consoTableId = `conso_${sourceTableId}`;
  consoTable.dataset.tableId = consoTableId;
  consoTable.dataset.tableType = "consolidation";
  consoTable.dataset.sourceTableId = sourceTableId;
  
  consoTable.style.cssText = `
      width: 100%;
      margin-bottom: 20px;
      border-collapse: collapse;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 2px solid #007bff;
      border-radius: 8px;
      overflow: hidden;
    `;

  const tableId = this.generateTableId(table);
  consoTable.innerHTML = `
      <thead>
        <tr>
          <th style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 15px; text-align: left; font-weight: bold;">
            📊 Table de Consolidation
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td id="conso-content-${tableId}" style="padding: 15px; background: #f8f9fa; min-height: 50px;">
            ⏳ En attente de consolidation...
          </td>
        </tr>
      </tbody>
    `;

  // Insérer la table de consolidation
  this.insertConsoTable(table, consoTable);
  debug.log(`Table de consolidation créée avec ID: ${consoTableId}`);

  // ✅ AJOUT : Installer le détecteur de changements sur la table conso
  this.setupTableChangeDetection(consoTable);

  // ✅ AJOUT : Sauvegarder immédiatement la structure de la table
  setTimeout(() => {
    this.saveTableData(consoTable);
    debug.log(`💾 Table de consolidation ${consoTableId} sauvegardée`);
  }, 500);

  // Notifier dev.js de la création de la nouvelle table
  this.notifyTableCreated(consoTable);
}
```

---

### Modification 2 : Sauvegarder après Mise à Jour de Consolidation

**Fichier** : `conso.js`  
**Ligne** : ~1050 (dans `updateConsolidationDisplay`)

**Objectif** : Sauvegarder automatiquement après chaque mise à jour du contenu

```javascript
updateConsolidationDisplay(table, content) {
  const tableId = this.generateTableId(table);
  const contentCell = document.getElementById(`conso-content-${tableId}`);

  if (contentCell) {
    contentCell.innerHTML = content;
    debug.log("✅ Affichage de consolidation mis à jour");
    
    // ✅ AJOUT : Sauvegarder la table conso après mise à jour
    const consoTable = contentCell.closest('table');
    if (consoTable) {
      setTimeout(() => {
        this.saveTableData(consoTable);
        debug.log(`💾 Contenu consolidation sauvegardé pour ${tableId}`);
      }, 300);
    }
  } else {
    debug.warn(`⚠️ Cellule de contenu non trouvée pour ${tableId}`);
  }
}
```

---

### Modification 3 : Sauvegarder les Tables Résultat

**Fichier** : `conso.js`  
**Ligne** : ~1186 (dans `updateResultatTable`)

**Objectif** : Sauvegarder la table Résultat après mise à jour

```javascript
updateResultatTable(table, fullContent) {
  debug.log(
    "📋 Recherche de la table Résultat (située au-dessus de la table conso)...",
  );

  const htmlContent = fullContent;

  // Stratégie 1: Chercher la table Résultat juste au-dessus de la table conso
  const parent = table.parentElement;
  if (parent) {
    const consoTable = parent.querySelector(".claraverse-conso-table");
    if (consoTable) {
      const previousSibling = consoTable.previousElementSibling;

      if (previousSibling && previousSibling.tagName === "TABLE") {
        debug.log("✓ Table Résultat trouvée (sibling de conso)");

        const headers = previousSibling.querySelectorAll("th");
        for (const header of headers) {
          const headerText = header.textContent.trim().toLowerCase();
          debug.log(`En-tête trouvé: "${headerText}"`);
          if (
            headerText.includes("resultat") ||
            headerText.includes("résultat")
          ) {
            debug.log("✓ En-tête Résultat confirmé");

            const contentCell = previousSibling.querySelector("td");
            if (contentCell) {
              const isConsoCell = contentCell.id?.startsWith("conso-content-");
              if (!isConsoCell) {
                contentCell.innerHTML = htmlContent;
                contentCell.setAttribute("data-updated", "resultat");
                debug.log("✓ Mise à jour effectuée");
                
                // ✅ AJOUT : Assigner un ID stable à la table Résultat
                if (!previousSibling.dataset.tableId) {
                  const sourceTableId = this.generateUniqueTableId(table);
                  const resultatTableId = `resultat_${sourceTableId}`;
                  previousSibling.dataset.tableId = resultatTableId;
                  previousSibling.dataset.tableType = "resultat";
                  previousSibling.dataset.sourceTableId = sourceTableId;
                  debug.log(`🆔 ID assigné à table Résultat: ${resultatTableId}`);
                }
                
                // ✅ AJOUT : Installer le détecteur et sauvegarder
                this.setupTableChangeDetection(previousSibling);
                setTimeout(() => {
                  this.saveTableData(previousSibling);
                  debug.log(`💾 Table Résultat sauvegardée`);
                }, 300);
                
                return true;
              }
            }
          }
        }
      }
    }
  }

  // ... reste du code existant ...
  
  // ✅ AJOUT : Dans chaque cas de succès, ajouter la sauvegarde
  // Exemple pour la Stratégie 2 :
  
  const allTables = document.querySelectorAll(
    'table.min-w-full, table[class*="border"]',
  );

  for (const candidateTable of allTables) {
    if (candidateTable === table) continue;
    if (candidateTable.classList.contains("claraverse-conso-table")) continue;

    const headers = candidateTable.querySelectorAll("th");
    for (const header of headers) {
      const headerText = header.textContent.trim().toLowerCase();
      if (
        headerText.includes("resultat") ||
        headerText.includes("résultat")
      ) {
        const contentCell = candidateTable.querySelector("td");
        if (contentCell) {
          contentCell.innerHTML = htmlContent;
          contentCell.setAttribute("data-updated", "resultat");
          
          // ✅ AJOUT : Assigner ID et sauvegarder
          if (!candidateTable.dataset.tableId) {
            const sourceTableId = this.generateUniqueTableId(table);
            const resultatTableId = `resultat_${sourceTableId}`;
            candidateTable.dataset.tableId = resultatTableId;
            candidateTable.dataset.tableType = "resultat";
            candidateTable.dataset.sourceTableId = sourceTableId;
          }
          
          this.setupTableChangeDetection(candidateTable);
          setTimeout(() => {
            this.saveTableData(candidateTable);
            debug.log(`💾 Table Résultat sauvegardée (stratégie 2)`);
          }, 300);
          
          return true;
        }
      }
    }
  }

  // ... reste du code ...
}
```

---

### Modification 4 : Restaurer les Tables Générées

**Fichier** : `conso.js`  
**Ligne** : ~1650 (dans `restoreAllTablesData`)

**Objectif** : Restaurer aussi les tables [Table_conso] et [Resultat]

```javascript
async restoreAllTablesData() {
  debug.log("🔄 Début de la restauration des tables");

  try {
    // Obtenir la session actuelle
    const sessionId = await this.getCurrentSessionId();
    debug.log(`📍 Session pour restauration: ${sessionId}`);

    // Déclencher la restauration via événement (système IndexedDB)
    const event = new CustomEvent('flowise:table:restore:request', {
      detail: {
        sessionId: sessionId,
        source: 'conso',
        timestamp: Date.now(),
        // ✅ AJOUT : Indiquer qu'on veut aussi restaurer les tables générées
        includeGenerated: true,
        tableTypes: ['modelized', 'consolidation', 'resultat']
      }
    });

    document.dispatchEvent(event);
    debug.log("✅ Restauration demandée via événement IndexedDB");

    // Attendre un peu pour que la restauration se fasse
    await new Promise(resolve => setTimeout(resolve, 2000)); // Augmenté à 2s

    // ✅ AJOUT : Restaurer spécifiquement les tables générées
    await this.restoreGeneratedTables();

    // Fallback: essayer aussi avec localStorage
    this.restoreFromLocalStorage();
  } catch (error) {
    debug.error("❌ Erreur restauration:", error);
    // Fallback vers localStorage
    this.restoreFromLocalStorage();
  }
}

/**
 * ✅ NOUVELLE MÉTHODE : Restaurer les tables générées (conso et résultat)
 */
async restoreGeneratedTables() {
  debug.log("🔄 Restauration des tables générées (conso et résultat)");

  try {
    // Attendre que l'API soit disponible
    if (!window.claraverseSyncAPI) {
      debug.warn("⚠️ API de synchronisation non disponible");
      return;
    }

    // Récupérer toutes les tables sauvegardées
    const sessionId = await this.getCurrentSessionId();
    
    // Déclencher un événement spécifique pour les tables générées
    const event = new CustomEvent('flowise:generated:tables:restore', {
      detail: {
        sessionId: sessionId,
        tableTypes: ['consolidation', 'resultat'],
        source: 'conso'
      }
    });

    document.dispatchEvent(event);
    debug.log("✅ Restauration tables générées demandée");

  } catch (error) {
    debug.error("❌ Erreur restauration tables générées:", error);
  }
}
```

---

### Modification 5 : Améliorer `generateUniqueTableId()`

**Fichier** : `conso.js`  
**Ligne** : ~1400 (chercher `generateUniqueTableId`)

**Objectif** : Générer des IDs stables et reproductibles

```javascript
generateUniqueTableId(table) {
  // Vérifier si la table a déjà un ID
  if (table.dataset.tableId) {
    return table.dataset.tableId;
  }

  // ✅ AMÉLIORATION : Générer un ID basé sur le contenu et la structure
  try {
    // Extraire les en-têtes pour créer une signature
    const headers = Array.from(table.querySelectorAll('th'))
      .map(th => th.textContent.trim())
      .filter(text => text.length > 0)
      .slice(0, 3) // Limiter à 3 en-têtes
      .join('_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .substring(0, 30);

    // Compter les lignes et colonnes
    const rows = table.querySelectorAll('tr').length;
    const cols = table.querySelector('tr')?.querySelectorAll('td, th').length || 0;

    // Obtenir la position dans le DOM
    const allTables = Array.from(document.querySelectorAll('table'));
    const position = allTables.indexOf(table);

    // Créer un ID stable
    const stableId = `table_${headers}_${rows}x${cols}_pos${position}`;

    // Sauvegarder l'ID sur la table
    table.dataset.tableId = stableId;

    debug.log(`🆔 ID stable généré: ${stableId}`);
    return stableId;

  } catch (error) {
    debug.error("❌ Erreur génération ID:", error);
    
    // Fallback : ID basé sur timestamp
    const fallbackId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    table.dataset.tableId = fallbackId;
    return fallbackId;
  }
}
```

---

## 📝 Résumé des Modifications

### Dans conso.js

| # | Méthode | Action | Ligne |
|---|---------|--------|-------|
| 1 | `createConsolidationTable()` | Assigner ID stable + sauvegarder | ~525 |
| 2 | `updateConsolidationDisplay()` | Sauvegarder après mise à jour | ~1050 |
| 3 | `updateResultatTable()` | Assigner ID + sauvegarder | ~1186 |
| 4 | `restoreAllTablesData()` | Restaurer tables générées | ~1650 |
| 5 | `restoreGeneratedTables()` | NOUVELLE méthode | Après ~1680 |
| 6 | `generateUniqueTableId()` | Améliorer génération ID | ~1400 |

---

## 🧪 Tests à Effectuer

### Test 1 : Création et Sauvegarde

1. Ouvrir un chat avec une table modelisée
2. Modifier une cellule pour déclencher la consolidation
3. Vérifier dans la console :
   ```
   💾 Table de consolidation conso_xxx sauvegardée
   💾 Table Résultat sauvegardée
   ```
4. Vérifier dans IndexedDB (F12 > Application > IndexedDB > clara_db)
   - Chercher les entrées avec `tableType: "consolidation"`
   - Chercher les entrées avec `tableType: "resultat"`

### Test 2 : Restauration après F5

1. Après le Test 1, appuyer sur F5
2. Attendre le chargement complet
3. Vérifier que :
   - La table de consolidation est restaurée avec son contenu
   - La table Résultat est restaurée avec son contenu
4. Vérifier dans la console :
   ```
   🔄 Restauration des tables générées (conso et résultat)
   ✅ Restauration tables générées demandée
   ```

### Test 3 : Changement de Chat

1. Créer une consolidation dans Chat A
2. Passer à Chat B
3. Revenir à Chat A
4. Vérifier que les tables générées sont restaurées

### Test 4 : Modification après Restauration

1. Après restauration, modifier une cellule de la table modelisée
2. Vérifier que la consolidation se met à jour
3. Vérifier que la nouvelle consolidation est sauvegardée
4. F5 et vérifier la persistance

---

## 🔍 Diagnostic

### Commandes Console pour Vérifier

```javascript
// 1. Vérifier les tables avec IDs
document.querySelectorAll('[data-table-id]').forEach(t => {
  console.log('Table:', t.dataset.tableId, 'Type:', t.dataset.tableType);
});

// 2. Vérifier les tables de consolidation
document.querySelectorAll('.claraverse-conso-table').forEach(t => {
  console.log('Conso:', t.dataset.tableId, 'Source:', t.dataset.sourceTableId);
});

// 3. Vérifier IndexedDB
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    const tables = getAll.result;
    console.log('Tables sauvegardées:', tables.length);
    tables.forEach(t => {
      if (t.tableType === 'consolidation' || t.tableType === 'resultat') {
        console.log('Générée:', t.tableType, t.keyword, t.timestamp);
      }
    });
  };
};

// 4. Forcer une sauvegarde manuelle
if (window.claraverseProcessor) {
  const consoTables = document.querySelectorAll('.claraverse-conso-table');
  consoTables.forEach(t => {
    window.claraverseProcessor.saveTableData(t);
    console.log('Sauvegarde forcée:', t.dataset.tableId);
  });
}
```

---

## ⚠️ Points d'Attention

### 1. Ordre de Chargement

Les tables générées doivent être créées **avant** la restauration. S'assurer que :
- `conso.js` est chargé
- Les tables modelisées sont traitées
- Les tables de consolidation sont créées
- **Puis** la restauration est déclenchée

### 2. IDs Stables

Les IDs doivent être **reproductibles** :
- Basés sur le contenu (en-têtes)
- Basés sur la structure (lignes x colonnes)
- Basés sur la position dans le DOM

### 3. Timing

Ajouter des délais appropriés :
- 300-500ms après création de table
- 2000ms pour la restauration complète
- Utiliser `setTimeout` pour éviter les conflits

### 4. Fallback

Toujours avoir un fallback vers localStorage si IndexedDB échoue.

---

## 🎯 Résultat Attendu

Après application de ces modifications :

✅ Les tables [Table_conso] sont sauvegardées automatiquement  
✅ Les tables [Resultat] sont sauvegardées automatiquement  
✅ Les tables générées sont restaurées après F5  
✅ Les tables générées sont restaurées après changement de chat  
✅ Les modifications manuelles dans les tables générées sont persistantes  
✅ Le système fonctionne avec IndexedDB + fallback localStorage  

---

*Solution créée le 20 novembre 2025*
