# 🔧 PHASE 2 - IndexedDB & Restauration Intelligente

**Date:** 29 août 2026  
**Phase:** 2/4 - Réparation IndexedDB + Restauration Conditionnelle

---

## ✅ PHASE 1 COMPLÉTÉE

- ✅ Contamination éliminée
- ✅ Doublons éliminés  
- ✅ SessionId stable
- ✅ Interface diagnostic (5 boutons)

---

## 🎯 OBJECTIFS PHASE 2

1. **Réparer accès IndexedDB** (diagnostic cherchait mauvaise DB)
2. **Vérifier sauvegardes fonctionnent** réellement
3. **Implémenter restauration conditionnelle** (sans réintroduire bugs)
4. **Tester persistance complète** (F5 conserve tables)

---

## 🔧 CORRECTION 1: Nom DB Correct

### Problème Identifié
```javascript
// ❌ Diagnostic cherchait:
indexedDB.open('ClaraverseDB', 1);

// ✅ DB réelle:
const DB_NAME = 'clara_db';
const DB_VERSION = 12;
```

### Correction Appliquée

**Fichier:** `index.html` fonction `analyzeContaminationUI()`

**Changement:**
```javascript
// AVANT (ligne ~1100)
const dbRequest = indexedDB.open('ClaraverseDB', 1);

// APRÈS
const dbRequest = indexedDB.open('clara_db', 12); // ✅ Bon nom + version
```

**Résultat attendu:**
- Bouton 🔬 Contam accède à la vraie DB
- Affiche tables sauvegardées (si elles existent)
- Plus d'erreur "Table n'existe pas"

---

## 🧪 TESTS VALIDATION CORRECTION DB

### Test 1: Accès IndexedDB ✅
```
1. Relancer: npm run dev
2. F12 → Application → IndexedDB
3. Vérifier: Base "clara_db" existe
4. Vérifier: Store "clara_generated_tables" existe
5. Vérifier contenu (doit avoir données si tables créées)
```

### Test 2: Bouton Contam Fonctionne ✅
```
1. Créer chat avec table
2. Cliquer bouton "🔬 Contam"
3. Lire notification
4. Doit afficher: 
   - "📊 Total IndexedDB: X tables"
   - "Session actuelle: Y tables"
   - Pas "Table n'existe pas"
```

### Test 3: Sauvegardes Persistent ✅
```
1. Créer table
2. Attendre 2s (sauvegarde auto)
3. F12 → Application → IndexedDB → clara_db → clara_generated_tables
4. Vérifier: Ligne ajoutée avec:
   - sessionId
   - keyword
   - html (contenu table)
   - timestamp
```

---

## 🔧 CORRECTION 2: Restauration Conditionnelle

### Architecture Restauration Sécurisée

**Principe:** Restaurer SEULEMENT si conditions réunies (ET logique).

**Conditions requises:**
```typescript
const shouldRestore = 
  sessionJustOpened() &&           // Pas reload pendant utilisation
  !tableExistsInDOM(keyword) &&    // Table pas déjà présente
  sessionIdMatches(table) &&       // Table appartient à ce chat
  !alreadyRestored(sessionId);     // Pas déjà restauré
```

### Implémentation

**Fichier:** `src/services/flowiseTableBridge.ts`

**Étape 1: Ajouter Flag Restoration**
```typescript
private sessionRestorationDone = new Set<string>();

private hasRestoredSession(sessionId: string): boolean {
  return this.sessionRestorationDone.has(sessionId);
}

private markSessionRestored(sessionId: string): void {
  this.sessionRestorationDone.add(sessionId);
  console.log(`✅ Session ${sessionId} marked as restored`);
}
```

**Étape 2: Modifier restoreTablesForSession**
```typescript
public async restoreTablesForSession(sessionId: string): Promise<void> {
  // 🔒 Si déjà restauré, skip
  if (this.hasRestoredSession(sessionId)) {
    console.log(`✅ Session ${sessionId} already restored, skip`);
    return;
  }
  
  console.log(`🔄 Restoring tables for session: ${sessionId}`);
  
  try {
    const tables = await flowiseTableService.restoreSessionTables(sessionId);
    console.log(`📊 Found ${tables.length} table(s) for session`);
    
    let restoredCount = 0;
    let skippedCount = 0;
    
    for (const table of tables) {
      // Vérifier si table existe déjà dans DOM
      const existsInDOM = document.querySelectorAll(
        `table[data-keyword="${table.keyword}"]`
      ).length > 0;
      
      if (existsInDOM) {
        console.log(`⏭️ Table "${table.keyword}" exists in DOM, skip`);
        skippedCount++;
        continue;
      }
      
      // Restaurer
      this.injectTableIntoDOM(table);
      restoredCount++;
    }
    
    console.log(`✅ Restoration complete: ${restoredCount} restored, ${skippedCount} skipped`);
    
    // Marquer session comme restaurée
    this.markSessionRestored(sessionId);
    
  } catch (error) {
    console.error(`❌ Error restoring session ${sessionId}:`, error);
  }
}
```

**Étape 3: Réactiver injectTableIntoDOM**
```typescript
private injectTableIntoDOM(tableData: FlowiseGeneratedTableRecord): void {
  // ✅ RÉACTIVATION avec protection renforcée
  
  try {
    // Exception: Skip conso.js tables
    if (tableData.keyword === 'Table_Consolidation' || 
        tableData.keyword === 'Table_Resultat' ||
        tableData.keyword.includes('Consolidation') ||
        tableData.keyword.includes('Resultat') ||
        tableData.keyword.includes('Résultat')) {
      console.log(`⏭️ Skip restoration of "${tableData.keyword}" (managed by conso.js)`);
      return;
    }
    
    // 🔥 VÉRIFICATION CRITIQUE: Table existe déjà?
    const allTablesWithKeyword = document.querySelectorAll(
      `table[data-keyword="${tableData.keyword}"]`
    );
    
    if (allTablesWithKeyword.length > 0) {
      console.log(`⏭️ Skip restoration of "${tableData.keyword}" - ${allTablesWithKeyword.length} already in DOM`);
      return;
    }
    
    console.log(`🔄 Restoring "${tableData.keyword}" - no existing table in DOM`);
    
    // Trouver conteneur ou créer
    const container = this.findOrCreateContainer(tableData);
    
    // Parser HTML table
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tableData.html;
    const restoredTable = tempDiv.querySelector('table');
    
    if (!restoredTable) {
      console.error(`❌ Invalid HTML for table "${tableData.keyword}"`);
      return;
    }
    
    // Ajouter au DOM
    restoredTable.setAttribute('data-restored', 'true');
    restoredTable.setAttribute('data-restored-timestamp', Date.now().toString());
    restoredTable.setAttribute('data-keyword', tableData.keyword);
    restoredTable.setAttribute('data-table-id', tableData.id);
    
    container.appendChild(restoredTable);
    
    console.log(`✅ Restored table "${tableData.keyword}" (${tableData.id})`);
    
  } catch (error) {
    console.error(`❌ Error restoring table ${tableData.id}:`, error);
  }
}
```

**Étape 4: Helper findOrCreateContainer**
```typescript
private findOrCreateContainer(tableData: FlowiseGeneratedTableRecord): HTMLElement {
  // Chercher conteneur existant
  let container = document.querySelector('[data-flowise-container="true"]');
  
  if (!container) {
    // Créer conteneur
    container = document.createElement('div');
    container.setAttribute('data-flowise-container', 'true');
    container.className = 'flowise-tables-container';
    
    // Ajouter au DOM principal
    const mainContent = document.querySelector('#root, main, .app');
    if (mainContent) {
      mainContent.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
    
    console.log('📦 Created tables container');
  }
  
  return container as HTMLElement;
}
```

---

## 🧪 TESTS VALIDATION RESTAURATION

### Test 1: Restauration Initiale ✅
```
1. Créer Chat A
2. Générer table "TestA"
3. Attendre 2s (sauvegarde)
4. F5 (recharger page)
5. Attendre 3s (restauration)
6. Vérifier: Table "TestA" réapparaît
```

**Logs attendus:**
```
🔄 Restoring tables for session: abc123...
📊 Found 1 table(s) for session
🔄 Restoring "TestA" - no existing table in DOM
✅ Restored table "TestA" (xyz...)
✅ Restoration complete: 1 restored, 0 skipped
✅ Session abc123 marked as restored
```

### Test 2: Pas de Doublon F5 Multiple ✅
```
1. Sur Chat A avec table
2. F5 première fois → Table restaurée
3. F5 deuxième fois → Vérifier PAS de doublon
4. F5 troisième fois → Vérifier toujours 1 seule table
```

**Logs attendus:**
```
# Premier F5
🔄 Restoring tables...
✅ Restored table "TestA"

# Deuxième F5
✅ Session abc123 already restored, skip

# Troisième F5
✅ Session abc123 already restored, skip
```

### Test 3: Isolation Entre Chats ✅
```
1. Chat A → Table A (F5 restaurée)
2. Chat B → Table B (F5 restaurée)
3. Retour Chat A
4. Vérifier: SEULEMENT Table A visible
5. Retour Chat B
6. Vérifier: SEULEMENT Table B visible
```

**Résultat attendu:** ZÉRO contamination

### Test 4: Persistance Table_conso ✅
```
1. Générer [Table_Resultat]
2. Modifier colonnes Conclusion
3. F5
4. Vérifier: Modifications PERDUES (normal, conso.js gère)
5. Mais structure table restaurée
```

**Note:** Table_conso/Resultat restaurées SANS modifications car gérées spécialement.

---

## 🎯 PLAN D'ACTION ÉTAPE PAR ÉTAPE

### Étape 1: Rebuild avec Correction DB ✅
```powershell
cd h:\Claverse_1
npm run build
npm run dev
```

### Étape 2: Tester Accès IndexedDB
```
1. Bouton "🔬 Contam"
2. Vérifier: Liste tables affichée
3. Si erreur persist: Vérifier DevTools → Application → IndexedDB
```

### Étape 3: Implémenter Restauration Conditionnelle
```typescript
// Modifier flowiseTableBridge.ts:
// 1. Ajouter sessionRestorationDone Set
// 2. Modifier restoreTablesForSession
// 3. Réactiver injectTableIntoDOM avec protections
// 4. Ajouter findOrCreateContainer helper
```

### Étape 4: Rebuild et Test
```powershell
npm run build
npm run dev
```

### Étape 5: Validation Complète
```
Exécuter tous les tests validation:
- Test 1: Restauration initiale
- Test 2: Pas de doublon F5
- Test 3: Isolation chats
- Test 4: Persistance Table_conso
```

---

## 📊 CRITÈRES DE SUCCÈS PHASE 2

| Critère | Test | Status |
|---------|------|--------|
| IndexedDB accessible | Bouton Contam affiche données | ⏳ À tester |
| Tables sauvegardées | DevTools montre lignes dans clara_generated_tables | ⏳ À tester |
| Restauration F5 | Table réapparaît après reload | ⏳ À tester |
| Pas de doublon | F5 multiple = 1 seule table | ⏳ À tester |
| Isolation maintenue | Chat A ≠ Chat B | ⏳ À tester |
| Zéro contamination | Aucune table autre chat | ⏳ À tester |

**Succès = 6/6 critères validés** ✅

---

## 🚨 SI PROBLÈMES

### IndexedDB Toujours Inaccessible

**Diagnostic:**
```javascript
// Console
indexedDB.open('clara_db', 12).onsuccess = (e) => {
  const db = e.target.result;
  console.log('Stores:', Array.from(db.objectStoreNames));
};
```

**Si clara_generated_tables absent:**
- DB version < 12 → Incrémente version manquée
- Solution: Incrémenter à 13 et rebuild

### Restauration Crée Doublons

**Diagnostic:**
```javascript
// Logs console, chercher:
"⏭️ Table exists in DOM, skip" // ✅ Protection active
"🔄 Restoring..." // ❌ Restaure malgré présence
```

**Si restaure quand même:**
- querySelectorAll retourne vide
- data-keyword pas set sur tables existantes
- Solution: Vérifier tables ont bien data-keyword

### Contamination Réapparaît

**Diagnostic:**
```javascript
// Pour chaque table dans Chat A:
document.querySelectorAll('table').forEach(t => {
  console.log(t.dataset.keyword, t.dataset.sessionId);
});

// Comparer sessionId tables vs sessionId chat actuel
```

**Si sessionId différents:**
- Restauration charge mauvaises tables
- Solution: Filtrer par sessionId dans restoreSessionTables

---

## 📝 FICHIERS À MODIFIER

| Fichier | Modifications | Lignes |
|---------|---------------|--------|
| `index.html` | ✅ Nom DB corrigé | ~1100+ |
| `flowiseTableBridge.ts` | ⏳ sessionRestorationDone | +20 |
| `flowiseTableBridge.ts` | ⏳ restoreTablesForSession | ~990 |
| `flowiseTableBridge.ts` | ⏳ injectTableIntoDOM | ~1379 |
| `flowiseTableBridge.ts` | ⏳ findOrCreateContainer | +30 |

**Total:** ~80 lignes à ajouter/modifier

---

**PROCHAINE ACTION:** Rebuild avec correction DB, tester bouton Contam, puis implémenter restauration conditionnelle.
