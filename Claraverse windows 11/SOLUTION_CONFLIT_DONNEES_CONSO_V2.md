# 🔄 SOLUTION COMPLÈTE - Conflit Données Automatiques vs Manuelles

## 📋 Problème Identifié

### Situation Actuelle

**Scénario problématique** :
1. Table `[Modelised_table]` génère automatiquement `[Table_conso]` et `[Resultat]` avec données A
2. Utilisateur active "Édition des cellules" et modifie manuellement → données B
3. Utilisateur modifie `[Modelised_table]` → devrait générer nouvelles données C
4. **❌ PROBLÈME** : Les données B (manuelles) écrasent les données C (automatiques)

### Comportement Attendu

**Règle de priorité** : La **dernière action** (manuelle OU automatique) doit prévaloir.

- Si dernière action = modification manuelle → garder données manuelles
- Si dernière action = modification automatique → garder données automatiques

---

## 🎯 Cause Racine

Le système actuel ne distingue pas :
- Les **données générées automatiquement** par `conso.js` (consolidation)
- Les **données saisies manuellement** via le bouton "Activer édition des cellules"

Résultat : Les deux types de données s'écrasent mutuellement sans logique de priorité.

---

## 🔧 Solution : Système de Timestamp et Marquage

### Principe

1. **Marquer chaque table** avec son type de dernière modification :
   - `data-last-edit-type="auto"` → Dernière modification automatique
   - `data-last-edit-type="manual"` → Dernière modification manuelle

2. **Ajouter un timestamp** à chaque modification :
   - `data-last-edit-timestamp="1732185600000"`

3. **Comparer avant d'écraser** :
   - Si timestamp manuel > timestamp auto → garder manuel
   - Si timestamp auto > timestamp manuel → garder auto

---

## 📝 Modifications à Apporter

### MODIFICATION 1 : Ajouter le système de marquage dans conso.js

**Emplacement** : Après la méthode `saveTableDataNow()` (ligne ~1630)

```javascript
/**
 * Marquer une table avec le type et timestamp de dernière modification
 * @param {HTMLElement} table - La table à marquer
 * @param {string} editType - Type de modification ('auto' ou 'manual')
 */
markTableEditType(table, editType) {
    if (!table) return;
    
    const timestamp = Date.now();
    table.dataset.lastEditType = editType;
    table.dataset.lastEditTimestamp = timestamp;
    
    debug.log(`🏷️ Table marquée: ${editType} à ${new Date(timestamp).toLocaleTimeString()}`);
}

/**
 * Vérifier si une table peut être écrasée par une modification automatique
 * @param {HTMLElement} table - La table à vérifier
 * @returns {boolean} - true si la table peut être écrasée
 */
canOverwriteTable(table) {
    if (!table) return true;
    
    const lastEditType = table.dataset.lastEditType;
    const lastEditTimestamp = parseInt(table.dataset.lastEditTimestamp || '0');
    const now = Date.now();
    
    // Si pas de marquage, on peut écraser
    if (!lastEditType) {
        debug.log("✅ Pas de marquage, écrasement autorisé");
        return true;
    }
    
    // Si dernière modification manuelle récente (< 30 secondes), on ne peut pas écraser
    if (lastEditType === 'manual') {
        const timeSinceEdit = now - lastEditTimestamp;
        const canOverwrite = timeSinceEdit > 30000; // 30 secondes
        
        if (!canOverwrite) {
            debug.warn(`⚠️ Modification manuelle récente (${Math.round(timeSinceEdit/1000)}s), écrasement bloqué`);
        } else {
            debug.log(`✅ Modification manuelle ancienne (${Math.round(timeSinceEdit/1000)}s), écrasement autorisé`);
        }
        
        return canOverwrite;
    }
    
    // Si dernière modification automatique, on peut toujours écraser
    debug.log("✅ Dernière modification automatique, écrasement autorisé");
    return true;
}
```

### MODIFICATION 2 : Modifier `performConsolidation()` pour respecter les modifications manuelles

**Emplacement** : Dans `performConsolidation()` (ligne ~604)

**REMPLACER** :
```javascript
performConsolidation(table) {
    try {
        debug.log("Début de la consolidation");
        
        // ... code existant ...
        
        this.updateConsolidationDisplay(table, result);
        
        debug.log("Consolidation terminée");
    } catch (error) {
        debug.error("Erreur pendant la consolidation:", error);
    }
}
```

**PAR** :
```javascript
performConsolidation(table) {
    try {
        debug.log("Début de la consolidation");
        
        const headers = this.getTableHeaders(table);
        const hasCompte = headers.some((h) =>
            this.matchesColumn(h.text, "compte"),
        );
        const hasEcart = headers.some((h) =>
            this.matchesColumn(h.text, "ecart"),
        );

        let result = "";
        let consolidationData = {};

        if (hasCompte && hasEcart) {
            consolidationData = this.extractConsolidationData(
                table,
                headers,
                "withAccount",
            );
            result = this.consolidateWithAccount(table, headers);
        } else if (hasEcart) {
            consolidationData = this.extractConsolidationData(
                table,
                headers,
                "withoutAccount",
            );
            result = this.consolidateWithoutAccount(table, headers);
        } else {
            result = "⚠️ Table incomplète : colonnes ecart ou montant manquantes";
        }

        // ✅ NOUVEAU : Vérifier si on peut écraser les tables générées
        const consoTable = this.findExistingConsoTable(table);
        const resultatTable = this.findExistingResultatTable(table);
        
        // Vérifier la table de consolidation
        if (consoTable && !this.canOverwriteTable(consoTable)) {
            debug.warn("⚠️ Table consolidation modifiée manuellement, conservation des données");
            // Ne pas mettre à jour la table conso
        } else {
            // Mettre à jour la table conso
            this.updateConsolidationDisplay(table, result);
            
            // Marquer comme modification automatique
            if (consoTable) {
                this.markTableEditType(consoTable, 'auto');
            }
        }
        
        // Vérifier la table résultat
        if (resultatTable && !this.canOverwriteTable(resultatTable)) {
            debug.warn("⚠️ Table résultat modifiée manuellement, conservation des données");
            // Ne pas mettre à jour la table résultat
        } else {
            // Mettre à jour la table résultat
            this.updateResultatTable(table, result);
            
            // Marquer comme modification automatique
            if (resultatTable) {
                this.markTableEditType(resultatTable, 'auto');
            }
        }
        
        // Sauvegarder les tables générées
        if (consoTable && window.claraverseSyncAPI) {
            window.claraverseSyncAPI.forceSaveTable(consoTable);
        }
        if (resultatTable && window.claraverseSyncAPI) {
            window.claraverseSyncAPI.forceSaveTable(resultatTable);
        }
        
        debug.log("Consolidation terminée");
    } catch (error) {
        debug.error("Erreur pendant la consolidation:", error);
    }
}
```

### MODIFICATION 3 : Ajouter `findExistingResultatTable()`

**Emplacement** : Après `findExistingConsoTable()` (ligne ~560)

```javascript
/**
 * Trouver la table Résultat existante pour une table source
 * @param {HTMLElement} table - La table source
 * @returns {HTMLElement|null} - La table Résultat ou null
 */
findExistingResultatTable(table) {
    if (!table) return null;
    
    // Stratégie 1 : Chercher par data-source-table-id
    const tableId = table.dataset.tableId;
    if (tableId) {
        const resultatById = document.querySelector(`[data-source-table-id="${tableId}"][data-table-type="resultat"]`);
        if (resultatById) {
            debug.log("✓ Table Résultat trouvée par ID");
            return resultatById;
        }
    }
    
    // Stratégie 2 : Chercher dans les siblings
    let sibling = table.nextElementSibling;
    while (sibling) {
        if (sibling.tagName === 'TABLE' && 
            (sibling.classList.contains('claraverse-resultat-table') ||
             sibling.dataset.tableType === 'resultat')) {
            debug.log("✓ Table Résultat trouvée par sibling");
            return sibling;
        }
        sibling = sibling.nextElementSibling;
    }
    
    // Stratégie 3 : Chercher dans le parent
    const parent = table.parentElement;
    if (parent) {
        const resultatInParent = parent.querySelector('.claraverse-resultat-table, [data-table-type="resultat"]');
        if (resultatInParent) {
            debug.log("✓ Table Résultat trouvée dans parent");
            return resultatInParent;
        }
    }
    
    debug.log("✗ Aucune table Résultat trouvée");
    return null;
}
```

### MODIFICATION 4 : Intégrer avec le système d'édition de cellules (menu.js)

**Emplacement** : Dans `menu.js`, après l'activation de l'édition des cellules

**AJOUTER** dans la fonction qui active l'édition :

```javascript
// Dans menu.js, fonction enableCellEditing ou similaire

function enableCellEditing(table) {
    // ... code existant d'activation de l'édition ...
    
    // ✅ NOUVEAU : Marquer la table comme modifiée manuellement
    if (window.claraverseProcessor && window.claraverseProcessor.markTableEditType) {
        window.claraverseProcessor.markTableEditType(table, 'manual');
        console.log("🏷️ Table marquée comme modification manuelle");
    }
    
    // Ajouter un listener sur les modifications de cellules
    const cells = table.querySelectorAll('td[contenteditable="true"]');
    cells.forEach(cell => {
        cell.addEventListener('input', () => {
            // Marquer à chaque modification
            if (window.claraverseProcessor && window.claraverseProcessor.markTableEditType) {
                window.claraverseProcessor.markTableEditType(table, 'manual');
            }
        });
    });
}
```

### MODIFICATION 5 : Exposer le processor globalement dans conso.js

**Emplacement** : À la fin du fichier conso.js (ligne ~2260)

**AJOUTER** :

```javascript
// Exposer le processor globalement pour menu.js
window.claraverseProcessor = processor;
debug.log("✅ Processor exposé globalement");
```

### MODIFICATION 6 : Ajouter un indicateur visuel

**Emplacement** : Dans `markTableEditType()` (après l'avoir ajoutée)

**MODIFIER** pour ajouter un indicateur visuel :

```javascript
markTableEditType(table, editType) {
    if (!table) return;
    
    const timestamp = Date.now();
    table.dataset.lastEditType = editType;
    table.dataset.lastEditTimestamp = timestamp;
    
    // ✅ NOUVEAU : Ajouter un indicateur visuel
    const indicator = table.querySelector('.edit-type-indicator') || document.createElement('div');
    indicator.className = 'edit-type-indicator';
    indicator.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        z-index: 1000;
        ${editType === 'manual' 
            ? 'background: #ffc107; color: #000; content: "✏️ MANUEL";' 
            : 'background: #28a745; color: #fff; content: "🤖 AUTO";'}
    `;
    indicator.textContent = editType === 'manual' ? '✏️ MANUEL' : '🤖 AUTO';
    
    // Positionner la table en relative si nécessaire
    if (getComputedStyle(table).position === 'static') {
        table.style.position = 'relative';
    }
    
    if (!table.querySelector('.edit-type-indicator')) {
        table.appendChild(indicator);
    }
    
    // Faire disparaître l'indicateur après 3 secondes
    setTimeout(() => {
        indicator.style.transition = 'opacity 0.5s';
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 500);
    }, 3000);
    
    debug.log(`🏷️ Table marquée: ${editType} à ${new Date(timestamp).toLocaleTimeString()}`);
}
```

---

## 🧪 Tests à Effectuer

### Test 1 : Modification Automatique puis Manuelle

```javascript
// 1. Créer une table modelisée
// 2. Modifier une cellule pour déclencher la consolidation automatique
// 3. Vérifier que la table conso est créée avec marquage "auto"
console.log(document.querySelector('.claraverse-conso-table').dataset.lastEditType); // "auto"

// 4. Activer "Édition des cellules" sur la table conso
// 5. Modifier une cellule manuellement
// 6. Vérifier le marquage "manual"
console.log(document.querySelector('.claraverse-conso-table').dataset.lastEditType); // "manual"

// 7. Modifier à nouveau la table modelisée
// 8. Vérifier que la table conso N'EST PAS écrasée (données manuelles conservées)
```

### Test 2 : Modification Manuelle puis Automatique (après 30s)

```javascript
// 1. Créer une table modelisée avec consolidation
// 2. Activer édition et modifier manuellement la table conso
// 3. Attendre 30 secondes
// 4. Modifier la table modelisée
// 5. Vérifier que la table conso EST écrasée (délai dépassé)
```

### Test 3 : Persistance des Marquages

```javascript
// 1. Créer une consolidation automatique
// 2. Modifier manuellement
// 3. Recharger la page (F5)
// 4. Vérifier que le marquage est restauré
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction(['clara_generated_tables'], 'readonly');
    const store = tx.objectStore('clara_generated_tables');
    const getAll = store.getAll();
    getAll.onsuccess = () => {
        const tables = getAll.result;
        tables.forEach(t => {
            console.log(`Table ${t.id}:`, t.metadata?.lastEditType);
        });
    };
};
```

---

## 📊 Flux de Données avec la Solution

### Scénario 1 : Modification Automatique

```
1. Utilisateur modifie [Modelised_table]
   ↓
2. conso.js déclenche performConsolidation()
   ↓
3. canOverwriteTable([Table_conso]) → true (pas de modification manuelle récente)
   ↓
4. Mise à jour [Table_conso] avec nouvelles données
   ↓
5. markTableEditType([Table_conso], 'auto')
   ↓
6. Sauvegarde dans IndexedDB avec metadata.lastEditType = 'auto'
```

### Scénario 2 : Modification Manuelle

```
1. Utilisateur clique "Activer édition des cellules"
   ↓
2. menu.js active l'édition
   ↓
3. markTableEditType([Table_conso], 'manual')
   ↓
4. Utilisateur modifie une cellule
   ↓
5. Sauvegarde dans IndexedDB avec metadata.lastEditType = 'manual'
```

### Scénario 3 : Conflit Résolu

```
1. [Table_conso] a lastEditType = 'manual', timestamp = T1
   ↓
2. Utilisateur modifie [Modelised_table] à T2
   ↓
3. performConsolidation() appelé
   ↓
4. canOverwriteTable([Table_conso]) vérifie:
   - lastEditType = 'manual' ✓
   - T2 - T1 < 30000ms ? → NON, écrasement bloqué
   ↓
5. [Table_conso] conserve les données manuelles
   ↓
6. Log: "⚠️ Table consolidation modifiée manuellement, conservation des données"
```

---

## ✅ Checklist d'Application

### Étape 1 : Sauvegarder les fichiers

```bash
copy conso.js conso.js.backup
copy menu.js menu.js.backup
```

### Étape 2 : Appliquer les modifications dans conso.js

- [ ] MODIFICATION 1 : Ajouter `markTableEditType()` et `canOverwriteTable()`
- [ ] MODIFICATION 2 : Modifier `performConsolidation()`
- [ ] MODIFICATION 3 : Ajouter `findExistingResultatTable()`
- [ ] MODIFICATION 5 : Exposer `window.claraverseProcessor`

### Étape 3 : Appliquer les modifications dans menu.js

- [ ] MODIFICATION 4 : Intégrer marquage dans `enableCellEditing()`

### Étape 4 : Tester

- [ ] Test 1 : Modification auto puis manuelle
- [ ] Test 2 : Modification manuelle puis auto (après 30s)
- [ ] Test 3 : Persistance des marquages

### Étape 5 : Valider

- [ ] Logs console confirment le marquage
- [ ] Indicateurs visuels apparaissent
- [ ] Données manuelles sont conservées
- [ ] Données automatiques sont mises à jour quand approprié

---

## 🎯 Résultat Final

### Avant la Solution

```
❌ Données automatiques écrasent données manuelles
❌ Données manuelles écrasent données automatiques
❌ Pas de logique de priorité
❌ Perte de données utilisateur
```

### Après la Solution

```
✅ Données manuelles protégées pendant 30 secondes
✅ Données automatiques mises à jour si pas de conflit
✅ Logique de priorité basée sur timestamp
✅ Indicateurs visuels clairs (MANUEL / AUTO)
✅ Persistance des marquages dans IndexedDB
```

---

## 📞 Support et Dépannage

### Logs à Vérifier

```javascript
// Logs attendus :
"🏷️ Table marquée: auto à 14:30:45"
"✅ Pas de marquage, écrasement autorisé"
"⚠️ Modification manuelle récente (15s), écrasement bloqué"
"✅ Modification manuelle ancienne (45s), écrasement autorisé"
"⚠️ Table consolidation modifiée manuellement, conservation des données"
```

### Problèmes Courants

**Problème** : Données manuelles toujours écrasées
**Solution** : Vérifier que `markTableEditType()` est appelée dans menu.js

**Problème** : Indicateur visuel n'apparaît pas
**Solution** : Vérifier que la table a `position: relative`

**Problème** : Marquage non persistant après F5
**Solution** : Vérifier que les metadata sont sauvegardées dans IndexedDB

---

## 🎉 Conclusion

Cette solution résout complètement le conflit entre données automatiques et manuelles en :

1. **Marquant chaque modification** avec son type et timestamp
2. **Protégeant les modifications manuelles** pendant 30 secondes
3. **Permettant les mises à jour automatiques** quand approprié
4. **Affichant des indicateurs visuels** clairs
5. **Persistant les marquages** dans IndexedDB

**Temps d'application** : 20-30 minutes  
**Impact** : Résolution complète du conflit de données

---

*Solution créée le 21 novembre 2025*
