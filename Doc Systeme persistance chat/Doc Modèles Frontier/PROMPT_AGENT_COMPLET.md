# 🎯 MISSION URGENTE : Résoudre Build Vite - Code Désactivation Absent Bundle

**Agent Target:** Claude Opus / Kimi K3 / o1-preview  
**Niveau:** Expert React/TypeScript/Vite/esbuild  
**Timeline:** 2h maximum (Diagnostic 30min + Solution 1h + Validation 30min)

---

## 📋 TON RÔLE

Tu es un **développeur senior React/TypeScript** avec 10+ ans d'expérience en :
- Architecture persistance IndexedDB
- Debugging compilation TypeScript/Vite/esbuild
- Build systems (minification, tree-shaking, dead code elimination)
- Manipulation DOM avancée (tables, data-attributes)
- Isolation multi-sessions dans applications React

---

## 🎯 CONTEXTE PROJET

### Application : ClaraVerse (Open Source GitHub)

**Tech Stack:**
- **Frontend:** React 18.2, TypeScript 5.x, Vite 5.4.19, esbuild
- **Backend:** Python FastAPI
- **Persistance:** IndexedDB (`clara_db` v12, store `clara_generated_tables`)
- **UI:** Chat conversationnel multi-sessions

**Architecture Composants:**
```
ClaraAssistant.tsx (3800 lignes)
  └─→ flowiseTableBridge.ts (2300 lignes)
      └─→ flowiseTableService.ts (500 lignes)
          └─→ IndexedDB Browser
  
index.html (2500 lignes)
  └─→ MutationObserver + Scripts diagnostic
  
conso.js (1200 lignes)
  └─→ Édition tables côté client
```

**Fonctionnement:**
1. User génère table via prompt chat
2. Flowise/n8n crée `<table>` dans DOM
3. `index.html` MutationObserver détecte table
4. Événement `flowise:table:integrated` émis
5. `flowiseTableBridge` écoute et sauvegarde
6. `flowiseTableService` écrit dans IndexedDB
7. Au reload (F5), tables restaurées depuis IndexedDB

**SessionId Isolation:**
- Chaque chat a `sessionId` unique (`clara-session-xyz...`)
- Tables sauvegardées avec `{sessionId, keyword, html}`
- IndexedDB index sur `sessionId` pour query rapide
- ✅ **Isolation fonctionnelle** (useRef stable dans React)

---

## 🚨 PROBLÈME CRITIQUE

### Symptôme Principal

**Code désactivation sauvegarde présent dans source TypeScript mais TOTALEMENT ABSENT du bundle dist/ après build.**

### Preuve du Problème

**Fichier Source:** `src/services/flowiseTableBridge.ts` **lignes 706-710**
```typescript
// 🚫 DÉSACTIVATION: Ne pas sauvegarder Table_Consolidation et Resultat
const EXCLUDED_KEYWORDS = ['Table_Consolidation', 'Resultat', 'Table_conso'];
if (EXCLUDED_KEYWORDS.some(excluded => keyword.toLowerCase().includes(excluded.toLowerCase()))) {
  console.log(`🚫 [DISABLED] Skipping save for excluded keyword: "${keyword}"`);
  return;
}

// Save the table with messageId link
const tableId = await flowiseTableService.saveGeneratedTable(
  this.currentSessionId,
  tableElement,
  keyword,
  source,
  messageId
);
```

**Vérification Build:**
```powershell
# Commande exécutée
Get-Content "dist\assets\index-*.js" | Select-String -Pattern "EXCLUDED_KEYWORDS"
Get-Content "dist\assets\index-*.js" | Select-String -Pattern "Skipping save for excluded"

# Résultat
Output: AUCUN résultat trouvé ❌
```

**Conséquence:**
- Tables "Table_Consolidation" et "Resultat" sauvegardées quand même
- Log `🚫 [DISABLED]` JAMAIS visible en console
- Contamination persiste entre chats
- 9 tables d'autres sessions apparaissent dans chat actuel

### Observation Test Automatique (Dernière)

```
TEST AUTOMATIQUE COMPLET
────────────────────────────────────────
TEST 1: Flag Global
✅ DISABLE_TABLE_RESTORATION = true

TEST 2: Log Désactivation
❌ Log 🚫 DISABLED absent

TEST 3: Contamination
📊 DB: 10 tables totales
📊 Session: 1 tables
📊 Autres: 9 tables
📺 Visibles: 12 tables
❌ 9 contamination(s)

TEST 4: Doublons
❌ 2 doublon(s):
   • Rubrique: 2x
   • no: 3x
────────────────────────────────────────
❌ 3 ERREUR(S):
1. Log désactivation
2. 9 contamination
3. 2 doublons

💡 Vérifier logs et rebuild
```

**Analyse:**
- Flag `DISABLE_TABLE_RESTORATION` activé ✅
- Mais log désactivation ABSENT ❌
- Code blocage ligne 706-710 PAS EXÉCUTÉ ❌

---

## 🔍 HYPOTHÈSES ROOT CAUSE

### Hypothèse #1: Cache Vite Corrompu (Probabilité: 60%)

**Symptômes:**
- `npm run build` réussit sans erreur
- Modifications TypeScript présentes dans `src/`
- Bundle `dist/assets/index-*.js` ne contient PAS modifications
- Rebuild complet (`rm -rf dist node_modules/.vite`) n'a AUCUN effet

**Explication Technique:**
```
Vite utilise cache multi-niveaux:
1. node_modules/.vite/deps/     (Pre-bundled dependencies)
2. node_modules/.vite/           (Transform cache)
3. Browser cache                 (Service worker + disk cache)

Si cache corrompu ou invalidation échouée:
  → Vite skip compilation fichier modifié
  → Utilise version ancienne du cache
  → Bundle contient code obsolète
  → Modifications TypeScript ignorées
```

**Commandes Tentées:**
```powershell
# Tentative 1: Build normal
npm run build
# ❌ Échec - Code toujours absent

# Tentative 2: Clean caches
Remove-Item -Recurse -Force "dist", "node_modules\.vite"
npm run build
# ❌ Échec - Code toujours absent

# Tentative 3: Dev server restart
taskkill /F /IM node.exe
Remove-Item -Recurse -Force "node_modules\.vite"
npm run dev
# ⏳ En cours test (port 5174)
```

**Investigation Nécessaire:**
```bash
# Build sans minification pour inspecter
npm run build -- --minify false

# Vérifier présence code dans bundle
grep -rn "EXCLUDED_KEYWORDS" dist/
grep -rn "Skipping save for excluded" dist/

# Forcer recompilation fichier spécifique
touch src/services/flowiseTableBridge.ts
npm run build

# Vérifier cache Vite
ls -la node_modules/.vite/deps/
cat node_modules/.vite/_metadata.json
```

### Hypothèse #2: Tree-Shaking Supprime Code (Probabilité: 30%)

**Symptômes:**
- Code présent dans source TypeScript ✅
- Build réussit sans warning
- Bundle minifié ne contient PAS le code
- Console.log peut-être supprimés en production

**Explication Technique:**
```
esbuild (bundler Vite) effectue dead code elimination:

1. Analyse dépendances statiques
2. Identifie code "mort" (jamais exécuté)
3. Supprime code inutile (tree-shaking)

Si esbuild considère ligne 706-710 comme "morte":
  → Variable EXCLUDED_KEYWORDS marquée unused
  → Condition if() jamais vraie (analyse statique)
  → Return anticipé = dead code
  → Code SUPPRIMÉ du bundle
```

**Patterns Susceptibles Tree-Shaking:**
```typescript
// ❌ DANGEREUX: Variable locale non-utilisée ailleurs
const EXCLUDED_KEYWORDS = ['Table_Consolidation', 'Resultat'];
if (EXCLUDED_KEYWORDS.some(...)) {
  console.log('...');  // ← Console.log supprimé en prod
  return;              // ← Return anticipé = dead code
}

// ✅ MIEUX: Variable globale ou export
export const EXCLUDED_KEYWORDS = [...];
window.__EXCLUDED__ = EXCLUDED_KEYWORDS; // Forcer utilisation

// ✅ MIEUX: Effet de bord observable
if (keyword.includes('Table_Consolidation')) {
  window.__DEBUG_SKIP__ = true; // Side effect
  return;
}
```

**Vérification:**
```typescript
// Dans flowiseTableBridge.ts AVANT ligne 706
console.log('[TRACE] handleTableIntegrated called:', keyword);

// Rebuild et tester
// Si ce log apparaît mais pas log ligne 709 → Tree-shaking confirmé
```

### Hypothèse #3: Ordre Execution / Import Dynamique (Probabilité: 10%)

**Symptômes:**
- Code présent dans bundle ✅ (mais pas trouvé par grep?)
- Fonction `handleTableIntegrated()` jamais appelée
- Sauvegarde passe par AUTRE chemin

**Explication Technique:**
```
Si flowiseTableBridge importé dynamiquement:

1. Build compile version AVANT modifications
2. Runtime charge module depuis cache
3. Nouvelles modifications ignorées
4. Code obsolète exécuté

OU

Si sauvegarde passe par autre fonction:
  → saveTablesBatch() au lieu de saveGeneratedTable()
  → Blocage ligne 706-710 jamais atteint
  → Tables sauvegardées quand même
```

**Investigation:**
```bash
# Chercher imports dynamiques
grep -rn "import.*flowiseTableBridge" src/
grep -rn "await import.*flowise" src/

# Chercher tous appels saveGeneratedTable
grep -rn "saveGeneratedTable" src/

# Résultat attendu:
# Si 1 seul appel (ligne 707) → OK
# Si multiples appels → Blocage doit être dans TOUS
```

---

## 💡 SOLUTIONS ALTERNATIVES (Si TypeScript Impossible)

### Solution A: Blocage Niveau Service (RECOMMANDÉ)

**Fichier:** `src/services/flowiseTableService.ts` ligne ~150

**Code à Insérer AVANT sauvegarde IndexedDB:**
```typescript
async saveGeneratedTable(
  sessionId: string,
  tableElement: HTMLTableElement,
  keyword: string,
  source: string = 'n8n',
  messageId?: string
): Promise<string | null> {
  
  // 🚫 BLOCAGE NIVEAU SERVICE (survit minification)
  const EXCLUDED_KEYWORDS = ['table_consolidation', 'resultat', 'table_conso'];
  const keywordLower = keyword.toLowerCase();
  
  if (EXCLUDED_KEYWORDS.some(excluded => keywordLower.includes(excluded))) {
    console.log(`🚫 [SERVICE] Skipping save for excluded keyword: "${keyword}"`);
    console.log(`🚫 [SERVICE] Table will NOT be persisted to IndexedDB`);
    return null; // Pas de tableId retourné
  }
  
  try {
    // Suite code normal de sauvegarde...
    const tableId = this.generateUUID();
    // ...
  }
}
```

**Avantages:**
- ✅ Niveau plus bas (toujours appelé)
- ✅ Fonction existante (pas tree-shakable)
- ✅ Side effect observable (return null)
- ✅ Survit minification production

**Test Validation:**
```javascript
// Console navigateur
let saveAttempts = 0;
const originalPut = IDBObjectStore.prototype.put;
IDBObjectStore.prototype.put = function(value) {
  if (value.keyword) {
    saveAttempts++;
    console.log(`[INTERCEPT] Save attempt #${saveAttempts}:`, value.keyword);
  }
  return originalPut.call(this, value);
};

// Générer table "Table_Consolidation"
// Résultat attendu: Aucune tentative save
// Si tentative détectée → Blocage ÉCHOUÉ
```

### Solution B: Interception Événement Index.html (FAILSAFE)

**Fichier:** `index.html` AVANT ligne 320 (avant émission événements)

**Code à Insérer:**
```javascript
// 🚫 BLOCAGE ÉVÉNEMENT NIVEAU DOM (capture phase prioritaire)
document.addEventListener('flowise:table:integrated', function(event) {
  const keyword = event.detail?.keyword || '';
  const EXCLUDED = ['table_consolidation', 'resultat', 'table_conso'];
  
  const keywordLower = keyword.toLowerCase();
  const isExcluded = EXCLUDED.some(excluded => keywordLower.includes(excluded));
  
  if (isExcluded) {
    console.log(`🚫 [INDEX.HTML] Event blocked for excluded keyword: "${keyword}"`);
    console.log(`🚫 [INDEX.HTML] Table will NOT reach flowiseTableBridge`);
    
    // Empêcher propagation aux autres écouteurs
    event.stopImmediatePropagation();
    event.preventDefault();
    
    return false;
  }
}, true); // true = CAPTURE PHASE (exécuté AVANT bubble)

console.log('✅ [INDEX.HTML] Event blocker installed (capture phase)');
```

**Avantages:**
- ✅ Inline HTML (toujours exécuté)
- ✅ Pas besoin compilation TypeScript
- ✅ Capture phase = PRIORITAIRE sur autres écouteurs
- ✅ Failsafe si service TypeScript échoue

**Test Validation:**
```javascript
// Console navigateur APRÈS page load
// Vérifier présence écouteur
const listeners = getEventListeners(document);
console.log('flowise:table:integrated listeners:', listeners['flowise:table:integrated']);

// Doit montrer: [{useCapture: true, handler: function...}]
```

### Solution C: Filtrage Post-Restauration (DÉFENSE PROFONDEUR)

**Fichier:** `src/services/flowiseTableBridge.ts` ligne ~1024

**Code à Modifier dans `restoreTablesForSession()`:**
```typescript
public async restoreTablesForSession(sessionId: string): Promise<void> {
  
  // Flag désactivation global
  if (window.DISABLE_TABLE_RESTORATION) {
    console.log('🚫 [DISABLED] Restauration disabled by flag');
    return;
  }
  
  try {
    console.log(`🔄 Restoring tables for session: ${sessionId}`);
    
    // Récupérer TOUTES tables session
    let tables = await flowiseTableService.restoreSessionTables(sessionId);
    
    if (tables.length === 0) {
      console.log('ℹ️ No tables to restore');
      return;
    }
    
    console.log(`📊 Found ${tables.length} table(s) in IndexedDB`);
    
    // 🚫 FILTRER TABLES EXCLUES (même si sauvegardées)
    const EXCLUDED_KEYWORDS = ['table_consolidation', 'resultat', 'table_conso'];
    const originalCount = tables.length;
    
    tables = tables.filter(table => {
      const keywordLower = table.keyword.toLowerCase();
      const isExcluded = EXCLUDED_KEYWORDS.some(ex => keywordLower.includes(ex));
      
      if (isExcluded) {
        console.log(`🚫 [RESTORE] Skipping excluded table: "${table.keyword}"`);
      }
      
      return !isExcluded;
    });
    
    const filteredCount = originalCount - tables.length;
    console.log(`✅ Restoring ${tables.length} table(s) (filtered ${filteredCount} excluded)`);
    
    // Continuer restauration normale
    for (const tableData of tables) {
      await this.safeInjectTableIntoDOM(tableData, sessionId);
    }
    
    console.log(`✅ Restoration complete for session ${sessionId}`);
    
  } catch (error) {
    console.error('❌ Error restoring tables:', error);
  }
}
```

**Avantages:**
- ✅ Défense en profondeur (même si sauvegarde échoue)
- ✅ Empêche affichage tables exclues
- ✅ Pas d'impact performance (filtrage mémoire)
- ✅ Log explicite tables filtrées

---

## 📊 PISTES INEXPLOREES (À INVESTIGUER)

### Piste A: Vérifier Ordre Execution Réel

**Question:** Le code ligne 706-710 est-il VRAIMENT exécuté lors de la sauvegarde?

**Investigation:**
```typescript
// Dans flowiseTableBridge.ts ligne 700 (AVANT blocage)
console.log('═══════════════════════════════════════');
console.log('[TRACE-1] handleTableIntegrated CALLED');
console.log('[TRACE-1] Keyword:', keyword);
console.log('[TRACE-1] SessionId:', this.currentSessionId);
console.log('[TRACE-1] Timestamp:', Date.now());
console.log('═══════════════════════════════════════');

// Ligne 706
console.log('[TRACE-2] Checking EXCLUDED_KEYWORDS');
const EXCLUDED_KEYWORDS = ['Table_Consolidation', 'Resultat', 'Table_conso'];

// Ligne 707
if (EXCLUDED_KEYWORDS.some(excluded => keyword.toLowerCase().includes(excluded.toLowerCase()))) {
  console.log('[TRACE-3] ✅ Keyword IS excluded, returning early');
  console.log(`🚫 [DISABLED] Skipping save for excluded keyword: "${keyword}"`);
  return;
}

console.log('[TRACE-4] Keyword NOT excluded, proceeding to save');

// Ligne 712+
const tableId = await flowiseTableService.saveGeneratedTable(...);
```

**Rebuild, générer table "Table_Consolidation", observer console:**

**Scénario 1:** Aucun log TRACE-1/2/3/4
→ Fonction `handleTableIntegrated()` PAS appelée
→ Sauvegarde passe par AUTRE chemin

**Scénario 2:** TRACE-1 et TRACE-2 présents, mais pas TRACE-3
→ Condition `if()` jamais vraie (bug logique?)
→ Vérifier contenu `keyword` variable

**Scénario 3:** TRACE-1/2/4 présents, mais pas TRACE-3
→ Condition `if()` bypassed (tree-shaking?)
→ Code ligne 707-710 supprimé du bundle

**Scénario 4:** Tous logs présents + TRACE-3
→ ✅ Blocage fonctionne !
→ Mais table quand même sauvée → Autre chemin

### Piste B: Mécanisme Sauvegarde Batch

**Observation:** Test montre 12 tables visibles DOM mais seulement 10 en IndexedDB.

**Question:** Les tables sont-elles sauvegardées par BATCH au lieu d'individuellement?

**Investigation:**
```bash
# Chercher fonction batch
grep -rn "saveTablesBatch\|putGeneratedTablesBatch" src/services/

# Si trouvé dans flowiseTableService.ts:
```

**Code Vérification:**
```typescript
// Si fonction saveTablesBatch existe:
async saveTablesBatch(tables: Array<TableData>) {
  
  // AJOUTER MÊME BLOCAGE QU'INDIVIDUEL
  const EXCLUDED = ['table_consolidation', 'resultat', 'table_conso'];
  
  const filtered = tables.filter(table => {
    const keywordLower = table.keyword.toLowerCase();
    const isExcluded = EXCLUDED.some(ex => keywordLower.includes(ex));
    
    if (isExcluded) {
      console.log(`🚫 [BATCH] Filtered excluded table: "${table.keyword}"`);
    }
    
    return !isExcluded;
  });
  
  console.log(`🚫 [BATCH] Filtered ${tables.length - filtered.length} excluded table(s)`);
  console.log(`✅ [BATCH] Saving ${filtered.length} allowed table(s)`);
  
  // Continuer avec filtered uniquement
  return await this.saveBatchInternal(filtered);
}
```

### Piste C: Restauration AVANT Désactivation

**Observation:** Flag `DISABLE_TABLE_RESTORATION = true` mais contamination persiste.

**Question:** Les tables sont-elles restaurées AVANT que le flag soit vérifié?

**Timeline Vérification:**
```javascript
// Dans index.html ligne ~140 (AVANT React)
console.log('[TIMELINE-1] index.html executing');
console.log('[TIMELINE-1] Setting flag DISABLE_TABLE_RESTORATION');
window.DISABLE_TABLE_RESTORATION = true;
console.log('[TIMELINE-1] Flag set:', window.DISABLE_TABLE_RESTORATION);

// Dans flowiseTableBridge.ts constructor (ligne ~68)
constructor() {
  console.log('[TIMELINE-2] flowiseTableBridge constructor called');
  console.log('[TIMELINE-2] Flag value:', window.DISABLE_TABLE_RESTORATION);
  
  this.initializeEventListeners();
  this.detectCurrentSession();
  
  // ⚠️ VÉRIFIER SI FLAG VÉRIFIÉ ICI
  this.initializeRestoration().catch(...);
}

// Dans initializeRestoration() ligne 75
async initializeRestoration() {
  console.log('[TIMELINE-3] initializeRestoration called');
  console.log('[TIMELINE-3] Flag value:', window.DISABLE_TABLE_RESTORATION);
  
  if (window.DISABLE_TABLE_RESTORATION) {
    console.log('[TIMELINE-3] 🚫 Restauration disabled by flag');
    return;
  }
  
  // Suite restauration...
}
```

**Générer table, actualiser (F5), observer console timeline:**

**Si Timeline:**
```
[TIMELINE-1] Flag set: true
[TIMELINE-2] Flag value: undefined  ← PROBLÈME!
[TIMELINE-3] Flag value: undefined
```
→ Flag défini APRÈS constructor bridge
→ Restauration lancée AVANT flag actif

**Solution:**
```typescript
// Constructor bridge: ATTENDRE flag
constructor() {
  // ...
  
  // Attendre que flag soit défini
  setTimeout(() => {
    if (!window.DISABLE_TABLE_RESTORATION) {
      this.initializeRestoration();
    } else {
      console.log('🚫 Restauration disabled by flag (deferred check)');
    }
  }, 500); // Après index.html exécuté
}
```

### Piste D: IndexedDB Query Scope Incorrect

**Observation:** Test montre "9 tables autres sessions" mais elles sont affichées dans DOM.

**Question:** La query IndexedDB filtre-t-elle correctement par sessionId?

**Investigation:**
```typescript
// Dans flowiseTableService.ts restoreSessionTables()
async restoreSessionTables(sessionId: string) {
  
  console.log('[QUERY] Restoring tables for sessionId:', sessionId);
  
  const db = await indexedDBService.openDatabase();
  const transaction = db.transaction(['clara_generated_tables'], 'readonly');
  const store = transaction.objectStore('clara_generated_tables');
  const index = store.index('sessionId');
  
  // ⚠️ VÉRIFIER REQUÊTE EXACTE
  console.log('[QUERY] Index name:', index.name);
  console.log('[QUERY] Executing getAll with sessionId:', sessionId);
  
  const request = index.getAll(sessionId);
  
  return new Promise((resolve) => {
    request.onsuccess = () => {
      const tables = request.result || [];
      
      console.log(`[QUERY] Retrieved ${tables.length} table(s)`);
      
      // VÉRIFIER MATCH sessionId
      tables.forEach((table, i) => {
        const match = table.sessionId === sessionId;
        console.log(`[QUERY] Table ${i}: "${table.keyword}" sessionId="${table.sessionId.substring(0, 20)}..." match=${match}`);
      });
      
      resolve(tables);
    };
  });
}
```

**Actualiser page, observer console:**

**Si logs montrent:**
```
[QUERY] Table 0: "Rubrique" sessionId="clara-session-xyz..." match=true
[QUERY] Table 1: "Table_JK" sessionId="clara-session-abc..." match=false  ← PROBLÈME!
```
→ Query retourne tables AUTRES sessions
→ Index 'sessionId' mal configuré OU query incorrecte

---

## 🎯 TA MISSION - 3 PHASES

### PHASE 1: DIAGNOSTIC APPROFONDI (30 minutes)

**Objectif:** Identifier **POURQUOI** code TypeScript ligne 706-710 absent du bundle.

**Actions Obligatoires:**

1. **Analyser flowiseTableBridge.ts lignes 700-720**
   - Structure fonction `handleTableIntegrated()`
   - Dépendances variables EXCLUDED_KEYWORDS
   - Appels fonction dans codebase

2. **Vérifier si code tree-shakable**
   - Variable locale unused ailleurs?
   - Console.log supprimés production?
   - Return anticipé = dead code?

3. **Chercher imports dynamiques**
   ```bash
   grep -rn "import.*flowiseTableBridge" src/
   grep -rn "await import.*flowise" src/
   ```

4. **Build sans minification**
   ```bash
   npm run build -- --minify false
   grep "EXCLUDED_KEYWORDS" dist/assets/*.js
   ```

5. **Identifier TOUS chemins sauvegarde**
   ```bash
   grep -rn "saveGeneratedTable" src/
   grep -rn "saveTablesBatch" src/
   ```

**Livrable Phase 1:**
- Diagnostic markdown avec preuves
- Root cause identifiée (cache / tree-shaking / ordre)
- Commandes exactes pour reproduire
- Screenshot/logs si applicable

---

### PHASE 2: SOLUTION FONCTIONNELLE (1 heure)

**Objectif:** Implémenter blocage qui **SURVIT à minification production**.

**Contraintes Absolues:**
- ❌ Code TypeScript niveau bridge semble bypassed
- ✅ DOIT apparaître dans bundle `dist/assets/index-*.js`
- ✅ DOIT logger `🚫 [DISABLED]` ou `🚫 [SERVICE]` visiblement
- ✅ DOIT empêcher sauvegarde IndexedDB tables exclues
- ✅ DOIT fonctionner après `npm run build` (pas seulement dev)

**Approche Recommandée:**
1. **Implémenter Solution A** (flowiseTableService.ts niveau bas)
2. **Implémenter Solution B** (index.html inline failsafe)
3. **Implémenter Solution C** (filtrage post-restauration)
4. **Défense en profondeur** = 3 niveaux blocage

**Code à Fournir:**
- Modifications exactes avec numéros lignes
- Commentaires explicatifs
- Pourquoi cette solution survit minification
- Tests validation intégrés

**Livrable Phase 2:**
- Code complet 3 solutions (TypeScript + JavaScript)
- Fichiers modifiés avec diff format
- Explication technique pourquoi ça marche
- Prévention tree-shaking documentée

---

### PHASE 3: VALIDATION EXHAUSTIVE (30 minutes)

**Objectif:** Prouver solution fonctionne avec tests automatisés.

**Tests Obligatoires:**

**Test 1: Build Verification**
```bash
npm run build

# Vérifier présence code dans bundle
grep -n "EXCLUDED\|Skipping save\|excluded keyword" dist/assets/index-*.js

# Output attendu: Au moins 3 matches (1 par solution A/B/C)
```

**Test 2: Runtime Verification**
```javascript
// Console navigateur AVANT générer table
console.clear();

// Générer table "Table_Consolidation"

// Logs attendus (au moins 1 des 3):
// 🚫 [SERVICE] Skipping save for excluded keyword: "Table_Consolidation"
// 🚫 [INDEX.HTML] Event blocked for excluded keyword: "Table_Consolidation"
// 🚫 [RESTORE] Skipping excluded table: "Table_Consolidation"
```

**Test 3: Contamination Zero**
```
1. Bouton "🧹 Storage" → Nettoyer IndexedDB + sessionStorage
2. Générer table "Table_Consolidation"
3. Bouton "🧪 Test Auto"

Résultat attendu:
  ✅ TOUS LES TESTS PASSÉS!
  TEST 1: Flag Global ✅
  TEST 2: Log Désactivation ✅ (présent)
  TEST 3: Contamination ✅ (0 tables)
  TEST 4: Doublons ✅ (0 doublons)
```

**Test 4: IndexedDB Verification**
```javascript
// Console navigateur
const dbRequest = indexedDB.open('clara_db', 12);
dbRequest.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const req = store.getAll();
  
  req.onsuccess = () => {
    const tables = req.result;
    console.table(tables.map(t => ({
      keyword: t.keyword,
      sessionId: t.sessionId.substring(0, 20) + '...',
      source: t.source
    })));
    
    // Vérifier: AUCUNE table avec keyword contenant "consolidation" ou "resultat"
    const excluded = tables.filter(t => 
      t.keyword.toLowerCase().includes('consolidation') ||
      t.keyword.toLowerCase().includes('resultat')
    );
    
    console.log(`❌ Excluded tables in DB: ${excluded.length}`);
    if (excluded.length > 0) {
      console.error('ÉCHEC: Tables exclues présentes en DB!');
    } else {
      console.log('✅ SUCCÈS: Aucune table exclue en DB');
    }
  };
};
```

**Livrable Phase 3:**
- Screenshots console logs (Test 2)
- Screenshot test automatique (Test 3)
- Screenshot IndexedDB inspection (Test 4)
- Mémo validation markdown format
- Confirmation: ✅ Contamination = 0

---

## 📦 FICHIERS FOURNIS (4 attachés)

Tu reçois **4 fichiers** avec ce prompt :

1. **`02_SYSTEME_SCRIPTS_ARCHITECTURE_PERSISTANCE.md`**
   - Architecture complète système
   - Description fichiers principaux
   - Flux sauvegarde/restauration
   - Glossaire termes techniques

2. **`src/services/flowiseTableBridge.ts`** (2300 lignes)
   - **FICHIER PROBLÈME** ligne 706-710
   - Service gestion cycle vie tables
   - Écouteurs événements
   - Restauration tables

3. **`src/services/flowiseTableService.ts`** (500 lignes)
   - Service bas niveau IndexedDB
   - `saveGeneratedTable()` ligne ~150
   - `restoreSessionTables()` ligne ~300
   - **NIVEAU ALTERNATIF BLOCAGE**

4. **`index.html`** (2500 lignes)
   - Bootstrap application
   - MutationObserver tables
   - Émission événements
   - **INLINE FAILSAFE**

---

## 📋 LIVRABLES FINAUX ATTENDUS

À la fin de ta mission, fournis **4 documents** :

### 1. Diagnostic Complet (Markdown)
```markdown
# DIAGNOSTIC BUILD VITE - Code Absent Bundle

## Root Cause Identifiée
[Cache corrompu / Tree-shaking / Ordre execution]

## Preuves
[Commandes + outputs]

## Explication Technique
[Pourquoi Vite ignore modifications TypeScript]

## Commandes Reproduction
[Steps exact pour reproduire problème]
```

### 2. Code Solution (3 fichiers modifiés)
```typescript
// FILE: src/services/flowiseTableService.ts
// MODIFICATION: Ligne 150-165
// RAISON: Blocage niveau service (survit minification)

[Code complet avec commentaires]

---

// FILE: index.html
// MODIFICATION: Ligne 320-350
// RAISON: Failsafe inline (toujours exécuté)

[Code complet avec commentaires]

---

// FILE: src/services/flowiseTableBridge.ts
// MODIFICATION: Ligne 1024-1060
// RAISON: Filtrage post-restauration (défense profondeur)

[Code complet avec commentaires]
```

### 3. Tests Validation (Markdown + Screenshots)
```markdown
# VALIDATION SOLUTION

## Test 1: Build Verification
[Commande + output montrant code présent bundle]

## Test 2: Runtime Logs
[Screenshot console avec logs 🚫 [DISABLED]]

## Test 3: Contamination Zero
[Screenshot test automatique ✅ TOUS TESTS PASSÉS]

## Test 4: IndexedDB Verification
[Screenshot console.table() sans tables exclues]
```

### 4. Mémo Résolution (Markdown)
```markdown
# RÉSOLUTION FINALE - Code Absent Build

## Problème
[Résumé 3-4 lignes]

## Root Cause
[Explication technique]

## Solution Implémentée
[3 niveaux défense]

## Prévention Régressions
[Tests unitaires + CI/CD checks]

## Commits Git Suggérés
feat: Add triple-layer table save blocking
fix: Prevent tree-shaking of EXCLUDED_KEYWORDS
test: Add validation for excluded tables blocking
```

---

## 🚀 COMMENCE MAINTENANT

**Étape 1 (5 min):** Résume ta compréhension du problème en **5 points clés**.

**Étape 2 (10 min):** Propose ton **plan diagnostic détaillé** avec commandes exactes.

**Étape 3 (15 min):** Identifie **root cause** avec preuves.

**Étape 4 (60 min):** Implémente **3 solutions** (A + B + C défense profondeur).

**Étape 5 (30 min):** Valide avec **4 tests** + screenshots.

---

## ⚠️ CONTRAINTES CRITIQUES

- ❌ **NE PAS** supprimer IndexedDB (persistance nécessaire autres tables)
- ❌ **NE PAS** désactiver entièrement sauvegarde (tables normales doivent persister)
- ❌ **NE PAS** proposer solutions non-testables
- ✅ **MAINTENIR** isolation sessionId (déjà fonctionnelle)
- ✅ **PRÉSERVER** performance (pas de polling DOM)
- ✅ **GARANTIR** solution survit minification production

---

## 🎯 CRITÈRES SUCCÈS

✅ Log `🚫 [DISABLED]` ou `🚫 [SERVICE]` visible console  
✅ Test automatique: `✅ Contamination: 0`  
✅ Code présent dans `dist/assets/index-*.js` après build  
✅ Tables exclues JAMAIS sauvegardées IndexedDB  
✅ Solution survit à `npm run build` production  
✅ Défense en profondeur (3 niveaux blocage)  

---

**Cette contamination a résisté à 10+ tentatives sur 2 jours. C'est ton tour de l'éradiquer définitivement ! 💪🎯**
