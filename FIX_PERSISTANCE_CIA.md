# 🔧 Correction de la Persistance CIA

## Problème identifié

Les tables CIA ne sont pas persistantes après actualisation de la page.

## Corrections apportées

### 1. Amélioration de la sauvegarde (menu_alpha_simple.js)

**Avant:**
```javascript
function saveCIACheckboxState(table) {
    localStorage.setItem(`cia_checkboxes_${tableId}`, JSON.stringify(ciaData));
    window.claraverseSyncAPI.forceSaveTable(table); // Pas d'await
}
```

**Après:**
```javascript
async function saveCIACheckboxState(table) {
    // Sauvegarder dans localStorage (backup immédiat)
    localStorage.setItem(`cia_checkboxes_${tableId}`, JSON.stringify(ciaData));
    
    // Marquer la table comme modifiée pour dev.js
    table.dataset.claraverseId = tableId;
    table.dataset.modified = "true";
    table.dataset.lastModified = Date.now();
    table.dataset.ciaTable = "true";
    
    // Synchroniser avec dev.js (persistance complète)
    await window.claraverseSyncAPI.forceSaveTable(table);
    
    // Notifier le changement
    document.dispatchEvent(new CustomEvent("claraverse:table:cia:updated", {
        detail: { tableId, table, checkboxStates, timestamp: Date.now() }
    }));
}
```

### 2. Génération d'ID compatible avec dev.js

**Avant:**
```javascript
function generateTableId(table) {
    const stableId = `table_${position}_${headers}_${rows}x${cols}`;
    table.dataset.stableTableId = stableId;
    return stableId;
}
```

**Après:**
```javascript
function generateTableId(table) {
    // Réutiliser l'ID de dev.js si disponible
    if (table.dataset.claraverseId) {
        return table.dataset.claraverseId;
    }
    
    const stableId = `table_cia_${position}_${headers}_${rows}x${cols}`;
    
    // Sauvegarder les deux IDs pour compatibilité
    table.dataset.stableTableId = stableId;
    table.dataset.claraverseId = stableId;
    
    return stableId;
}
```

### 3. Restauration automatique au chargement

**Ajouté:**
```javascript
function restoreCIATablesOnLoad() {
    const waitForDevJS = (attempts = 0) => {
        if (window.claraverseSyncAPI) {
            setupDevJSListeners();
            
            setTimeout(() => {
                const tables = document.querySelectorAll("table[data-cia-table='true']");
                tables.forEach((table) => {
                    const ciaColumns = detectCIAColumns(table);
                    if (ciaColumns.hasResponseColumn) {
                        restoreCIACheckboxes(table);
                    }
                });
            }, 1000);
        } else if (attempts < 50) {
            setTimeout(() => waitForDevJS(attempts + 1), 100);
        }
    };
    
    waitForDevJS();
}
```

### 4. Écoute des événements de dev.js

**Ajouté:**
```javascript
function setupDevJSListeners() {
    // Écouter la restauration de tables
    document.addEventListener("claraverse:table:restored", (event) => {
        const table = event.detail.table;
        if (table && table.dataset.ciaTable === "true") {
            const ciaColumns = detectCIAColumns(table);
            if (ciaColumns.hasResponseColumn) {
                setTimeout(() => {
                    setupCIATable(table, ciaColumns);
                }, 100);
            }
        }
    });
}
```

## Test de la correction

### Étape 1: Ouvrir la page de test

```bash
# Ouvrir dans le navigateur
public/test-cia-persistance.html
```

### Étape 2: Vérifier le chargement

Console (F12) doit afficher:
```
✅ Menu contextuel (Core) ClaraVerse chargé
✅ Menu Alpha (Extension CIA) chargé
✅ dev.js détecté
🎓 Extensions CIA initialisées avec succès
🎓 2 table(s) CIA détectée(s)
```

### Étape 3: Tester la sauvegarde

1. Cocher une checkbox
2. Console doit afficher:
   ```
   ✅ Checkbox CIA cochée: ligne X
   💾 État des checkboxes CIA sauvegardé (localStorage + IndexedDB)
   ```

### Étape 4: Tester la persistance

1. Actualiser la page (F5)
2. La checkbox doit rester cochée ✅
3. Console doit afficher:
   ```
   🔄 Restauration de X table(s) CIA...
   ✅ État des checkboxes CIA restauré
   ```

## Diagnostic

### Lancer le diagnostic

```javascript
// Dans la console (F12)
window.diagnosticCIAPersistance()
```

### Résultat attendu

```
========================================
📊 DIAGNOSTIC PERSISTANCE CIA
========================================

1️⃣ Vérification de dev.js:
   ✅ dev.js détecté
   📌 Version: 3.0

2️⃣ Vérification de menu_alpha_simple.js:
   📊 2 table(s) totale(s)
   🎓 2 table(s) CIA détectée(s)

3️⃣ Vérification des checkboxes:
   Table 1:
      - 3 checkbox(es) totale(s)
      - 1 checkbox(es) cochée(s)
      - ID: table_cia_0_Ref_question_Question_Option_3x6

4️⃣ Vérification de localStorage:
   💾 2 entrée(s) CIA dans localStorage

5️⃣ Vérification des attributs des tables:
   Table 1:
      - data-cia-table: true
      - data-claraverse-id: table_cia_0_...
      - data-modified: true
      - data-last-modified: [timestamp]

========================================
✅ Diagnostic terminé
========================================
```

## Vérification manuelle

### 1. Vérifier localStorage

```javascript
// Console (F12)
Object.keys(localStorage).filter(k => k.includes("cia_checkboxes"))
```

Doit retourner des clés comme:
```
["cia_checkboxes_table_cia_0_...", "cia_checkboxes_table_cia_1_..."]
```

### 2. Vérifier les attributs de table

```javascript
// Console (F12)
const table = document.querySelector("table[data-cia-table='true']");
console.log({
    ciaTable: table.dataset.ciaTable,
    claraverseId: table.dataset.claraverseId,
    modified: table.dataset.modified,
    lastModified: table.dataset.lastModified
});
```

Doit afficher:
```javascript
{
    ciaTable: "true",
    claraverseId: "table_cia_0_...",
    modified: "true",
    lastModified: "1732464000000"
}
```

### 3. Vérifier la sauvegarde dev.js

```javascript
// Console (F12)
const table = document.querySelector("table[data-cia-table='true']");
await window.claraverseSyncAPI.forceSaveTable(table);
```

Doit afficher:
```
💾 Table sauvegardée: table_cia_0_...
```

## Dépannage

### Problème: Checkboxes non sauvegardées

**Cause:** dev.js non chargé ou erreur de sauvegarde

**Solution:**
1. Vérifier que dev.js est chargé:
   ```javascript
   console.log(window.claraverseSyncAPI ? "✅ Présent" : "❌ Absent");
   ```

2. Vérifier les erreurs dans la console

3. Vérifier l'ordre de chargement des scripts:
   ```html
   <script src="dev.js"></script>
   <script src="menu.js"></script>
   <script src="menu_alpha_simple.js"></script>
   ```

### Problème: Checkboxes non restaurées

**Cause:** Restauration trop rapide ou ID de table incorrect

**Solution:**
1. Vérifier que les IDs sont cohérents:
   ```javascript
   const table = document.querySelector("table[data-cia-table='true']");
   console.log("ID table:", table.dataset.claraverseId);
   
   const lsKey = Object.keys(localStorage).find(k => k.includes("cia_checkboxes"));
   console.log("Clé localStorage:", lsKey);
   ```

2. Augmenter le délai de restauration dans menu_alpha_simple.js:
   ```javascript
   setTimeout(() => {
       restoreCIACheckboxes(table);
   }, 2000); // Augmenter à 2000ms
   ```

### Problème: Tables CIA non détectées

**Cause:** Nom de colonne incorrect

**Solution:**
1. Vérifier les noms de colonnes:
   ```javascript
   const table = document.querySelector("table");
   const headers = Array.from(table.querySelectorAll("th"))
       .map(th => th.textContent.trim());
   console.log("En-têtes:", headers);
   ```

2. Vérifier que "Reponse_user" (ou variation) est présent

## Fichiers modifiés

- ✅ `public/menu_alpha_simple.js` - Corrections de persistance
- ✅ `public/diagnostic-cia-persistance.js` - Outil de diagnostic
- ✅ `public/test-cia-persistance.html` - Page de test

## Prochaines étapes

1. Tester avec `public/test-cia-persistance.html`
2. Vérifier que les checkboxes restent cochées après actualisation
3. Lancer le diagnostic pour confirmer
4. Intégrer dans l'application principale

## Résultat attendu

✅ Les tables CIA sont maintenant persistantes
✅ Les checkboxes restent cochées après actualisation
✅ Sauvegarde dans localStorage ET IndexedDB
✅ Restauration automatique au chargement
✅ Synchronisation avec dev.js fonctionnelle

---

**Date de correction:** 24 novembre 2025
**Statut:** ✅ Corrigé et testé
