# 📚 SYSTÈME SCRIPTS - Architecture Persistance Tables ClaraVerse

**Date:** 29 Août 2026  
**Objectif:** Comprendre mécanismes persistance sans accès code base complet  
**Agent Target:** Claude Opus, Kimi K3, o1-preview

---

## 🎯 VUE D'ENSEMBLE

### Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND REACT                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ClaraAssistant.tsx (Composant Principal)             │  │
│  │  • Génère sessionId stable (useRef)                  │  │
│  │  • Expose data-session-id dans DOM                   │  │
│  │  • Gère lifecycle chat                               │  │
│  └──────────────────┬────────────────────────────────────┘  │
│                     │                                         │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │ flowiseTableBridge.ts (Service TypeScript)           │   │
│  │  • Écoute événements tables                          │   │
│  │  • handleTableIntegrated() → sauvegarde              │   │
│  │  • restoreTablesForSession() → restauration          │   │
│  └──────────────────┬────────────────────────────────────┘   │
│                     │                                         │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │ flowiseTableService.ts (Service IndexedDB)           │   │
│  │  • saveGeneratedTable() → transaction IndexedDB      │   │
│  │  • restoreSessionTables() → query par sessionId      │   │
│  └──────────────────┬────────────────────────────────────┘   │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │   IndexedDB Browser     │
         │  Database: clara_db     │
         │  Store: clara_generated_tables │
         │  Index: sessionId       │
         └─────────────────────────┘
```

### Cycle de Vie Table

```
1. USER GÉNÈRE TABLE
   └─→ Flowise/n8n crée <table> dans DOM

2. DÉTECTION
   └─→ index.html MutationObserver détecte <table>
       └─→ Émet événement "flowise:table:integrated"

3. SAUVEGARDE
   └─→ flowiseTableBridge écoute événement
       └─→ handleTableIntegrated(detail: {table, keyword, source})
           └─→ flowiseTableService.saveGeneratedTable(sessionId, table, keyword)
               └─→ IndexedDB.put({id, sessionId, keyword, html, timestamp})

4. ACTUALISATION (F5)
   └─→ flowiseTableBridge.initializeRestoration()
       └─→ restoreTablesForSession(sessionId)
           └─→ flowiseTableService.restoreSessionTables(sessionId)
               └─→ IndexedDB.index('sessionId').getAll(sessionId)
                   └─→ injectTableIntoDOM(tableData) pour chaque table
```

---

## 📁 FICHIERS PRINCIPAUX

### 1. `src/components/ClaraAssistant.tsx` (3800 lignes)

**Rôle:** Composant React racine du chat, gère sessionId stable.

**Sections Critiques:**

#### 🔒 Génération SessionId Stable (Lignes 411-438)
```typescript
// AVANT (Problématique - SessionId changeait à chaque render)
const [stableSessionId, setStableSessionId] = useState(
  () => `clara-session-${Date.now()}-${Math.random()...}`
);

// APRÈS (Solution - useRef garde référence stable)
const [stableSessionId, setStableSessionId] = useState(...);
const initialSessionIdRef = useRef<string | null>(null);

useEffect(() => {
  if (!currentSession?.id) return;
  
  // Première initialisation
  if (!initialSessionIdRef.current) {
    initialSessionIdRef.current = currentSession.id;
    setStableSessionId(currentSession.id);
    return;
  }
  
  // Changement de chat détecté
  if (currentSession.id !== initialSessionIdRef.current) {
    initialSessionIdRef.current = currentSession.id;
    setStableSessionId(currentSession.id);
  }
  
  // ✅ Sinon, stableSessionId reste inchangé
}, [currentSession?.id]);
```

**Pourquoi Important:**
- SessionId change à chaque render → tables sauvegardées avec différents IDs → contamination
- useRef conserve valeur entre renders → sessionId stable → isolation garantie

#### 📍 Exposition SessionId dans DOM (Ligne 3743)
```typescript
<div 
  id="clara-assistant-container"
  data-session-id={stableSessionId}  // ← Attribut DOM accessible par index.html
  data-chat-initialized="true"
>
  {/* Contenu chat */}
</div>
```

**Pourquoi Important:**
- Scripts JavaScript (index.html) ne peuvent pas accéder directement à state React
- Attribut `data-session-id` expose sessionId au DOM
- index.html lit cet attribut pour sauvegardes

**Interaction avec Persistance:**
```javascript
// index.html peut maintenant lire sessionId:
const sessionId = document
  .querySelector('[data-session-id]')
  ?.getAttribute('data-session-id');
```

---

### 2. `src/services/flowiseTableBridge.ts` (2300 lignes)

**Rôle:** Service TypeScript pont entre DOM et IndexedDB, gère cycle vie tables.

**Sections Critiques:**

#### 🎧 Initialisation Écouteurs (Lignes 583-586)
```typescript
private initializeEventListeners(): void {
  // Écoute tables générées par Flowise/n8n
  document.addEventListener(
    'flowise:table:integrated',
    this.handleFlowiseTableIntegrated.bind(this)
  );
  
  // Écoute demandes sauvegarde explicites (conso.js)
  document.addEventListener(
    'flowise:table:save:request',
    this.handleTableSaveRequest.bind(this)
  );
  
  // Écoute changements de session
  document.addEventListener(
    'claraverse:session:changed',
    this.handleSessionChanged.bind(this)
  );
}
```

**Flux Événements:**
```
USER ACTION
  ↓
index.html MutationObserver détecte <table>
  ↓
document.dispatchEvent(new CustomEvent('flowise:table:integrated', {
  detail: {
    table: HTMLTableElement,
    keyword: string,
    source: 'n8n' | 'flowise' | 'conso'
  }
}))
  ↓
flowiseTableBridge.handleFlowiseTableIntegrated(event)
  ↓
Sauvegarde déclenchée
```

#### 💾 Gestion Sauvegarde (Lignes 693-750)
```typescript
private async handleTableIntegrated(
  detail: FlowiseTableIntegratedDetail
): Promise<void> {
  
  const { table, keyword, source, messageId } = detail;
  
  // 🔍 Vérifier si table déjà sauvegardée (anti-doublon)
  const fingerprint = this.generateTableFingerprint(table);
  if (await this.tableExists(this.currentSessionId, fingerprint)) {
    console.log(`ℹ️ Table already saved, skipping`);
    return;
  }
  
  // 🚫 BLOCAGE TABLES PROBLÉMATIQUES (Ligne 706-710)
  const EXCLUDED_KEYWORDS = ['Table_Consolidation', 'Resultat', 'Table_conso'];
  if (EXCLUDED_KEYWORDS.some(ex => keyword.toLowerCase().includes(ex.toLowerCase()))) {
    console.log(`🚫 [DISABLED] Skipping save for excluded keyword: "${keyword}"`);
    return; // ← CODE CRITIQUE QUI N'APPARAÎT PAS DANS BUILD
  }
  
  // 💾 Sauvegarder table
  try {
    const tableId = await flowiseTableService.saveGeneratedTable(
      this.currentSessionId,  // ← SessionId du chat actuel
      table,                  // ← DOM HTMLTableElement
      keyword,                // ← Ex: "Rubrique", "Table_JK"
      source,                 // ← 'n8n' | 'flowise' | 'conso'
      messageId               // ← Lien avec message chat (optionnel)
    );
    
    if (tableId) {
      console.log(`✅ Table saved: ${tableId}`);
      this.emitTableSaved(tableId, this.currentSessionId, keyword, fingerprint);
    }
  } catch (error) {
    console.error('❌ Error saving table:', error);
  }
}
```

**Problème Actuel:**
```
✅ Code présent dans source TypeScript ligne 706-710
❌ Code ABSENT dans bundle dist/assets/index-*.js
❌ Log "🚫 [DISABLED]" jamais vu console
❌ Tables exclues quand même sauvegardées

Hypothèses:
1. Tree-shaking supprime code (dead code elimination)
2. Cache Vite corrompu (node_modules/.vite)
3. Code appelé PAR AUTRE CHEMIN (saveTablesBatch?)
```

#### 🔄 Restauration Tables (Lignes 1024-1140)
```typescript
public async restoreTablesForSession(sessionId: string): Promise<void> {
  
  // 🚫 DÉSACTIVATION GLOBALE (TEMPORAIRE)
  if (window.DISABLE_TABLE_RESTORATION) {
    console.log('🚫 [DISABLED] Restauration disabled by flag');
    return;
  }
  
  try {
    console.log(`🔄 Restoring tables for session: ${sessionId}`);
    
    // 📊 Récupérer tables depuis IndexedDB
    const tables = await flowiseTableService.restoreSessionTables(sessionId);
    
    if (tables.length === 0) {
      console.log('ℹ️ No tables to restore for this session');
      return;
    }
    
    console.log(`📊 Found ${tables.length} table(s) to restore`);
    
    // 🚫 FILTRER tables problématiques (APRÈS récupération)
    const SKIP_KEYWORDS = ['Table_Consolidation', 'Resultat', 'Table_conso'];
    const tablesToRestore = tables.filter(t => 
      !SKIP_KEYWORDS.some(skip => t.keyword.toLowerCase().includes(skip.toLowerCase()))
    );
    
    console.log(`✅ Restoring ${tablesToRestore.length} table(s) (skipped ${tables.length - tablesToRestore.length})`);
    
    // 💉 Injecter chaque table dans DOM
    for (const tableData of tablesToRestore) {
      await this.safeInjectTableIntoDOM(tableData, sessionId);
    }
    
    console.log(`✅ Restoration complete for session ${sessionId}`);
    
  } catch (error) {
    console.error('❌ Error restoring tables:', error);
  }
}
```

**Flux Restauration:**
```
1. User ouvre chat existant ou actualise (F5)
   ↓
2. React monte ClaraAssistant avec sessionId
   ↓
3. flowiseTableBridge.constructor()
   └─→ this.initializeRestoration()
       ↓
4. restoreTablesForSession(sessionId)
   ├─→ Vérifie flag DISABLE_TABLE_RESTORATION
   ├─→ Query IndexedDB: SELECT * WHERE sessionId = ?
   ├─→ Filtre tables exclues (Table_conso, etc.)
   └─→ Inject chaque table dans DOM
       ↓
5. Tables réapparaissent dans chat ✅
```

#### 🚫 Prévention Doublons (Lignes 1392-1406)
```typescript
private injectTableIntoDOM(tableData: FlowiseGeneratedTableRecord): void {
  
  // 🔍 VÉRIFIER SI TABLE EXISTE DÉJÀ DANS DOM
  const allTablesWithKeyword = document.querySelectorAll(
    `table[data-keyword="${tableData.keyword}"]`
  );
  
  if (allTablesWithKeyword.length > 0) {
    console.log(
      `⏭️ Skip restoration of "${tableData.keyword}" - ` +
      `${allTablesWithKeyword.length} table(s) already in DOM`
    );
    
    // Marquer tables existantes pour éviter futures restaurations
    allTablesWithKeyword.forEach(table => {
      if (!table.getAttribute('data-restored')) {
        table.setAttribute('data-skip-restore', 'true');
      }
    });
    
    return; // ✅ Pas de doublon créé
  }
  
  // ✅ Table pas en DOM, continuer restauration normale
  // ...
}
```

**Cas d'Usage:**
```
Scénario: Table "Rubrique" générée par Flowise ET sauvée en IndexedDB

Sans ce code:
  1. Flowise génère <table data-keyword="Rubrique">
  2. F5 actualise page
  3. Restauration injecte 2ème <table data-keyword="Rubrique">
  4. ❌ DOUBLON: 2 tables "Rubrique" identiques

Avec ce code:
  1. Flowise génère <table data-keyword="Rubrique">
  2. F5 actualise page
  3. Restauration vérifie: querySelectorAll('[data-keyword="Rubrique"]').length > 0
  4. ✅ Skip injection, pas de doublon
```

---

### 3. `src/services/flowiseTableService.ts` (500 lignes)

**Rôle:** Service bas niveau pour opérations IndexedDB sur tables.

**Sections Critiques:**

#### 💾 Sauvegarde Table (Lignes 150-250)
```typescript
async saveGeneratedTable(
  sessionId: string,
  tableElement: HTMLTableElement,
  keyword: string,
  source: string = 'n8n',
  messageId?: string
): Promise<string | null> {
  
  try {
    // 🔑 Générer ID unique
    const tableId = this.generateUUID();
    
    // 🔒 Générer empreinte anti-doublon
    const fingerprint = this.generateTableFingerprint(tableElement);
    
    // 🔍 Vérifier si existe déjà
    if (await this.tableExists(sessionId, fingerprint)) {
      console.log(`ℹ️ Table already exists (fingerprint: ${fingerprint.substring(0, 8)})`);
      return null;
    }
    
    // 📦 Extraire HTML + métadonnées
    let html = tableElement.outerHTML;
    const metadata = this.extractTableMetadata(tableElement, html);
    
    // 🗜️ Compression si taille > seuil
    if (html.length > this.COMPRESSION_THRESHOLD) {
      html = this.compressHTML(html);
      metadata.compressed = true;
    }
    
    // 🆔 Déterminer containerId + position
    const container = tableElement.closest('[data-container-id]');
    const containerId = container?.getAttribute('data-container-id') 
      || this.generateContainerId();
    const position = this.detectTablePosition(tableElement, container);
    
    // 📋 Construire enregistrement
    const tableRecord: FlowiseGeneratedTableRecord = {
      id: tableId,
      sessionId,           // ← CRITIQUE: Associe table à chat
      messageId,           // ← Lien avec message (optionnel)
      keyword,             // ← Ex: "Rubrique", "Table_JK"
      html,                // ← Contenu table (compressé ou non)
      fingerprint,         // ← Hash MD5 pour déduplication
      containerId,         // ← Groupement visuel
      position,            // ← Ordre affichage
      timestamp: new Date().toISOString(),
      source,              // ← 'n8n' | 'flowise' | 'conso'
      metadata: {
        rowCount: metadata.rowCount,
        colCount: metadata.colCount,
        headers: metadata.headers,
        compressed: metadata.compressed
      }
    };
    
    // 💾 Transaction IndexedDB
    await indexedDBService.putGeneratedTable(tableRecord);
    
    console.log(`✅ Table saved successfully: ${tableId}`);
    return tableId;
    
  } catch (error) {
    console.error('❌ Error saving table:', error);
    throw error;
  }
}
```

**Structure IndexedDB:**
```javascript
// Database: clara_db (version 12)
// ObjectStore: clara_generated_tables
{
  id: "table_abc123...",              // Primary key
  sessionId: "clara-session-xyz...",  // Index (pour query rapide)
  messageId: "msg_456...",             // Optionnel
  keyword: "Rubrique",
  html: "<table class='...'>...</table>",
  fingerprint: "a1b2c3d4...",         // MD5 hash
  containerId: "container_789...",
  position: 2,
  timestamp: "2026-08-29T14:30:00.000Z",
  source: "n8n",
  metadata: {
    rowCount: 15,
    colCount: 5,
    headers: ["Col A", "Col B", ...],
    compressed: false
  }
}
```

#### 🔄 Restauration Tables Session (Lignes 300-350)
```typescript
async restoreSessionTables(sessionId: string): Promise<FlowiseGeneratedTableRecord[]> {
  
  try {
    // 🔓 Ouvrir transaction lecture
    const db = await indexedDBService.openDatabase();
    const transaction = db.transaction(['clara_generated_tables'], 'readonly');
    const store = transaction.objectStore('clara_generated_tables');
    
    // 🔍 Query par index sessionId
    const index = store.index('sessionId');
    const request = index.getAll(sessionId); // ← Récupère TOUTES tables de ce session
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const tables = request.result || [];
        
        console.log(`📊 Found ${tables.length} table(s) for session ${sessionId}`);
        
        // 📈 Trier par timestamp (ordre chronologique)
        tables.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        resolve(tables);
      };
      
      request.onerror = () => {
        console.error('❌ Error querying IndexedDB:', request.error);
        reject(request.error);
      };
    });
    
  } catch (error) {
    console.error('❌ Error restoring session tables:', error);
    return [];
  }
}
```

**Query IndexedDB:**
```
Query: index.getAll(sessionId)
  ↓
Filtre automatique: WHERE sessionId = "clara-session-xyz..."
  ↓
Retourne: Array<FlowiseGeneratedTableRecord>
  ↓
Exemple résultat:
[
  {id: "t1", keyword: "Rubrique", sessionId: "clara-session-xyz..."},
  {id: "t2", keyword: "Table_JK", sessionId: "clara-session-xyz..."},
  {id: "t3", keyword: "no", sessionId: "clara-session-xyz..."}
]
  ↓
✅ Toutes appartiennent à MÊME session
```

---

### 4. `index.html` (2500 lignes)

**Rôle:** Bootstrap application + scripts inline détection/diagnostic.

**Sections Critiques:**

#### 🔍 Lecture SessionId avec Retry (Lignes 140-200)
```javascript
// CONSTANTES
const STABLE_KEY = 'claraverse_stable_session';
const MAX_SESSION_RETRY = 20; // 20 tentatives × 100ms = 2 secondes
let sessionIdRetryCount = 0;
let cachedSessionId = null;

// FONCTION LECTURE SessionId
function getSessionId() {
  
  // 1. Cache si déjà récupéré
  if (cachedSessionId) {
    return cachedSessionId;
  }
  
  // 2. Essayer lire depuis attribut DOM React
  const container = document.querySelector('[data-session-id]');
  if (container) {
    const sessionId = container.getAttribute('data-session-id');
    
    // Valider format
    if (sessionId && 
        sessionId !== 'undefined' && 
        sessionId !== 'null' &&
        sessionId.includes('clara-session-')) {
      
      cachedSessionId = sessionId;
      console.log(`✅ SessionId detected from DOM:`, sessionId.substring(0, 30));
      return sessionId;
    }
  }
  
  // 3. React pas encore monté, attendre (retry)
  if (sessionIdRetryCount < MAX_SESSION_RETRY) {
    sessionIdRetryCount++;
    console.warn(`⏳ SessionId not available yet (attempt ${sessionIdRetryCount}/20)`);
    return null; // ← Signale que sessionId pas prêt
  }
  
  // 4. ÉCHEC après 2 secondes
  console.error('🚨 CRITICAL: SessionId not found after 2 seconds');
  console.error('   React ClaraAssistant may not be mounted');
  console.error('   Check data-session-id attribute in DOM');
  return null; // ← PAS DE FALLBACK DANGEREUX
}
```

**Pourquoi Retry Important:**
```
Timeline Loading Page:

0ms    - index.html exécuté (scripts inline)
50ms   - React bundle chargé
100ms  - React.createElement(ClaraAssistant)
150ms  - ClaraAssistant render initial
200ms  - useEffect génère stableSessionId
250ms  - DOM mis à jour avec data-session-id  ← sessionId DISPONIBLE

Si index.html lit sessionId à 100ms:
  → Attribut data-session-id pas encore dans DOM
  → getSessionId() retourne null
  → Besoin retry jusqu'à 250ms

Avec retry (20 × 100ms = 2s):
  ✅ Attend que React monte
  ✅ Détecte sessionId dès disponible
  ✅ Pas de fallback dangereux (sessionStorage partagé)
```

#### 📡 Émission Événement Sauvegarde (Lignes 320-380)
```javascript
function emitSaveEvent(table) {
  
  // 🔑 VÉRIFIER SessionId VALIDE (CRITIQUE)
  const sessionId = getSessionId();
  if (!sessionId) {
    console.warn('⚠️ Save ignored - SessionId not available yet');
    
    // 🔄 Retry après 100ms
    setTimeout(() => {
      const retrySessionId = getSessionId();
      if (retrySessionId) {
        console.log('✅ SessionId now available, retrying save');
        emitSaveEvent(table); // Récursif
      } else {
        console.error('❌ SessionId still unavailable after retry');
        console.error('   Table NOT saved:', extractKeyword(table));
      }
    }, 100);
    return; // ← PAS DE SAUVEGARDE SANS SessionId
  }
  
  // 📋 Extraire données table
  const keyword = extractKeyword(table);
  const source = table.closest('[data-source]')?.getAttribute('data-source') || 'unknown';
  
  // 📡 Émettre événement
  const event = new CustomEvent('flowise:table:integrated', {
    detail: {
      table: table,           // HTMLTableElement
      keyword: keyword,        // Ex: "Rubrique"
      source: source,          // 'n8n' | 'flowise' | 'conso'
      sessionId: sessionId     // "clara-session-xyz..."
    },
    bubbles: true,
    cancelable: true
  });
  
  document.dispatchEvent(event);
  console.log(`📡 Event emitted: flowise:table:integrated (${keyword})`);
}
```

**Protection Critique:**
```
AVANT (Buggy):
  emitSaveEvent() appelé
    ↓
  getSessionId() retourne null (React pas monté)
    ↓
  Événement émis avec sessionId: null
    ↓
  flowiseTableBridge sauvegarde avec sessionId: null
    ↓
  ❌ Table orpheline en IndexedDB
    ↓
  ❌ Restaurée dans TOUS les chats (contamination)

APRÈS (Fixé):
  emitSaveEvent() appelé
    ↓
  getSessionId() retourne null
    ↓
  ❌ STOP - Pas d'événement émis
    ↓
  setTimeout 100ms → Retry
    ↓
  getSessionId() retourne "clara-session-xyz..."
    ↓
  ✅ Événement émis avec BON sessionId
    ↓
  ✅ Table sauvegardée correctement
    ↓
  ✅ Isolation garantie
```

#### 👁️ MutationObserver Tables (Lignes 440-520)
```javascript
// OBSERVER DOM POUR NOUVELLES TABLES
const tableObserver = new MutationObserver((mutations) => {
  
  for (const mutation of mutations) {
    
    // Vérifier nœuds ajoutés
    for (const node of mutation.addedNodes) {
      
      // Ignorer nœuds non-éléments
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      
      const element = node;
      
      // 🔍 Détecter tables directes
      if (element.tagName === 'TABLE') {
        handleNewTable(element);
      }
      
      // 🔍 Détecter tables dans conteneurs
      const tables = element.querySelectorAll('table');
      tables.forEach(table => handleNewTable(table));
    }
  }
});

// DÉMARRER OBSERVATION
tableObserver.observe(document.body, {
  childList: true,      // Observer ajouts/suppressions
  subtree: true,        // Observer tous descendants
  attributes: false     // Ignorer changements attributs (performance)
});

console.log('👁️ MutationObserver started - watching for new tables');
```

**Flux Détection:**
```
Flowise/n8n génère:
<div class="chat-message">
  <table data-keyword="Rubrique">
    <tr><th>Col A</th></tr>
    <tr><td>Data 1</td></tr>
  </table>
</div>
  ↓
MutationObserver détecte addedNodes
  ↓
handleNewTable(table) appelé
  ↓
Vérifie attributs:
  • data-keyword existe? ✅
  • data-already-saved? ❌
  • data-restored? ❌
  ↓
emitSaveEvent(table)
  ↓
Événement "flowise:table:integrated" émis
  ↓
flowiseTableBridge écoute et sauvegarde
```

#### 🔬 Boutons Diagnostic (Lignes 1620-2400)
```javascript
// CRÉER CONTENEUR BOUTONS (bas droite écran)
const diagnosticContainer = document.createElement('div');
diagnosticContainer.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10000;
`;

// BOUTON 1: Test Général
const btnGeneral = createButton('🔍', 'Test', runGeneralDiagnostic, ['#3498db', '#2980b9']);

// BOUTON 2: Doublons
const btnDoublons = createButton('📋', 'Doublons', checkTableDuplicates, ['#9b59b6', '#8e44ad']);

// BOUTON 3: Contamination
const btnContamination = createButton('🔬', 'Contam', analyzeContaminationUI, ['#e67e22', '#d35400']);

// BOUTON 4: Save Debug
const btnSave = createButton('💾', 'Save', debugSaveEvent, ['#16a085', '#138b75']);

// BOUTON 5: Logs Système
const btnLogs = createButton('📜', 'Logs', displaySystemLogs, ['#95a5a6', '#7f8c8d']);

// BOUTON 6: Logs Complet
const btnSystemLogs = createButton('📊', 'System', window.runFullDiagnostic, ['#34495e', '#2c3e50']);

// BOUTON 7: Clean DB
const btnCleanDB = createButton('🗑️', 'Clean', cleanIndexedDB, ['#c0392b', '#a93226']);

// BOUTON 8: Test Automatique
const btnAutoTest = createButton('🧪', 'Test Auto', runAutoTest, ['#f39c12', '#e67e22']);

// BOUTON 9: Nettoyer Storage
const btnCleanStorage = createButton('🧹', 'Storage', cleanAllStorage, ['#e74c3c', '#c0392b']);

// AJOUTER AU DOM
diagnosticContainer.appendChild(btnGeneral);
diagnosticContainer.appendChild(btnDoublons);
diagnosticContainer.appendChild(btnContamination);
diagnosticContainer.appendChild(btnSave);
diagnosticContainer.appendChild(btnLogs);
diagnosticContainer.appendChild(btnSystemLogs);
diagnosticContainer.appendChild(btnAutoTest);
diagnosticContainer.appendChild(btnCleanStorage);
diagnosticContainer.appendChild(btnCleanDB);

document.body.appendChild(diagnosticContainer);
```

**Fonctions Boutons:**

**🧪 Test Auto (runAutoTest)** - Ligne 2130
```javascript
function runAutoTest() {
  let output = "TEST AUTOMATIQUE COMPLET\n\n";
  output += "─".repeat(40) + "\n\n";
  
  let errors = 0;
  
  // TEST 1: Flag Global
  output += "TEST 1: Flag Global\n";
  if (window.DISABLE_TABLE_RESTORATION === true) {
    output += "✅ DISABLE_TABLE_RESTORATION = true\n\n";
  } else {
    output += "❌ Flag absent ou false\n\n";
    errors++;
  }
  
  // TEST 2: Log Désactivation
  output += "TEST 2: Log Désactivation\n";
  const logs = capturedLogs.join('\n');
  if (logs.includes('🚫') && logs.includes('DISABLED')) {
    output += "✅ Log 🚫 DISABLED présent\n\n";
  } else {
    output += "❌ Log 🚫 DISABLED absent\n\n";
    errors++;
  }
  
  // TEST 3: Contamination
  output += "TEST 3: Contamination\n";
  output += "⏳ Analyse en cours...\n\n";
  
  analyzeContaminationData((result) => {
    output += `📊 DB: ${result.dbTotal} tables totales\n`;
    output += `📊 Session: ${result.sessionTables} tables\n`;
    output += `📊 Autres: ${result.otherTables} tables\n`;
    output += `📺 Visibles: ${result.visibleTables} tables\n\n`;
    
    if (result.otherTables === 0) {
      output += "✅ Aucune contamination\n\n";
    } else {
      output += `❌ ${result.otherTables} contamination(s)\n\n`;
      errors++;
    }
    
    // TEST 4: Doublons
    output += "TEST 4: Doublons\n";
    const duplicates = findDuplicateTables();
    if (duplicates.length === 0) {
      output += "✅ Aucun doublon\n\n";
    } else {
      output += `❌ ${duplicates.length} doublon(s):\n`;
      duplicates.forEach(d => {
        output += `   • ${d.keyword}: ${d.count}x\n`;
      });
      output += "\n";
      errors++;
    }
    
    // RÉSUMÉ
    output += "─".repeat(40) + "\n\n";
    if (errors === 0) {
      output += "🎉 TOUS LES TESTS PASSÉS!\n";
    } else {
      output += `❌ ${errors} ERREUR(S):\n\n`;
      if (/* test 1 failed */) output += "1. Flag global\n";
      if (/* test 2 failed */) output += "2. Log désactivation\n";
      if (/* test 3 failed */) output += "3. Contamination\n";
      if (/* test 4 failed */) output += "4. Doublons\n";
      output += "\n💡 Vérifier logs et rebuild\n";
    }
    
    showLongNotification(output, errors === 0 ? 'success' : 'error');
  });
}
```

**🔬 Analyse Contamination (analyzeContaminationUI)** - Ligne 1950
```javascript
async function analyzeContaminationUI() {
  
  try {
    // 1. Ouvrir IndexedDB
    const dbRequest = indexedDB.open('clara_db', 12);
    
    await new Promise((resolve, reject) => {
      dbRequest.onsuccess = resolve;
      dbRequest.onerror = reject;
      
      // Timeout 5s
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
    
    const db = dbRequest.result;
    
    // 2. Vérifier store existe
    if (!db.objectStoreNames.contains('clara_generated_tables')) {
      showLongNotification("❌ ERREUR\n\nTable n'existe pas", 'error');
      return;
    }
    
    // 3. Lire sessionId actuel
    const currentSessionId = getSessionId();
    if (!currentSessionId) {
      showLongNotification("❌ ERREUR\n\nSessionId absent", 'error');
      return;
    }
    
    // 4. Query toutes tables
    const transaction = db.transaction(['clara_generated_tables'], 'readonly');
    const store = transaction.objectStore('clara_generated_tables');
    const allTablesRequest = store.getAll();
    
    allTablesRequest.onsuccess = () => {
      const allTables = allTablesRequest.result || [];
      
      // 5. Filtrer par session
      const sessionTables = allTables.filter(t => t.sessionId === currentSessionId);
      const otherTables = allTables.filter(t => t.sessionId !== currentSessionId);
      
      // 6. Compter tables DOM visibles
      const visibleTables = document.querySelectorAll('table[data-keyword]').length;
      
      // 7. Afficher résultat
      let output = "🔬 ANALYSE CONTAMINATION\n\n";
      output += `📊 DB Total: ${allTables.length} tables\n`;
      output += `📊 Session actuelle: ${sessionTables.length} tables\n`;
      output += `📊 Autres sessions: ${otherTables.length} tables\n`;
      output += `📺 Visibles DOM: ${visibleTables} tables\n\n`;
      
      if (otherTables.length === 0) {
        output += "✅ AUCUNE CONTAMINATION\n\nIsolation parfaite!";
        showLongNotification(output, 'success');
      } else {
        output += `❌ CONTAMINATION DÉTECTÉE!\n\n${otherTables.length} table(s) autres sessions:\n\n`;
        
        otherTables.forEach(t => {
          output += `• ${t.keyword} (session: ${t.sessionId.substring(0, 15)}...)\n`;
        });
        
        showLongNotification(output, 'error');
      }
    };
    
  } catch (error) {
    console.error('Error analyzing contamination:', error);
    showLongNotification("❌ ERREUR\n\n" + error.message, 'error');
  }
}
```

---

### 5. `public/conso.js` (1200 lignes)

**Rôle:** Système édition interactive tables côté client (Table_Consolidation, Table_Resultat).

**Sections Critiques:**

#### ✏️ Détection Modifications Table (Lignes 800-900)
```javascript
// Écouteur événements clavier/souris sur tables
document.addEventListener('input', (event) => {
  
  const target = event.target;
  
  // Vérifier si élément modifié est dans table éditable
  const table = target.closest('table.editable-table');
  if (!table) return;
  
  // Marquer table comme modifiée
  table.setAttribute('data-modified', 'true');
  
  console.log('📝 Table modified:', extractKeyword(table));
  
  // Déclencher sauvegarde différée (debounce 2s)
  clearTimeout(table._saveTimeout);
  table._saveTimeout = setTimeout(() => {
    saveTableDataNow(table);
  }, 2000);
});
```

#### 💾 Sauvegarde Table Modifiée (Lignes 950-1050)
```javascript
// FONCTION ORIGINALE conso.js
function saveTableDataNow(table) {
  
  // Extraction données table
  const data = extractTableData(table);
  const keyword = extractKeyword(table);
  
  console.log(`💾 [conso.js] Saving table: ${keyword}`);
  
  // Envoi backend (API Python)
  fetch('/api/save-table', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keyword: keyword,
      data: data,
      timestamp: Date.now()
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log('✅ Table saved to backend:', result);
  })
  .catch(error => {
    console.error('❌ Error saving to backend:', error);
  });
}
```

**Wrapping par index.html (Lignes 400-430):**
```javascript
// index.html WRAPPE la fonction originale
if (window.claraverseProcessor && window.claraverseProcessor.saveTableDataNow) {
  
  // Sauvegarder fonction originale
  const originalSave = window.claraverseProcessor.saveTableDataNow;
  
  // Remplacer par version wrappée
  window.claraverseProcessor.saveTableDataNow = function(table) {
    
    console.log('🔄 [WRAPPED] saveTableDataNow called');
    
    // 1. Appeler fonction originale (backend)
    originalSave.call(this, table);
    
    // 2. AJOUTER sauvegarde IndexedDB (frontend)
    emitSaveEvent(table);
    
    console.log('✅ [WRAPPED] Table saved to backend + IndexedDB');
  };
  
  console.log('✅ conso.js saveTableDataNow wrapped');
}
```

**Flux Complet:**
```
User modifie cellule table
  ↓
document 'input' event détecté
  ↓
setTimeout 2s (debounce)
  ↓
saveTableDataNow(table) appelé
  ↓
VERSION WRAPPÉE exécutée:
  ├─→ originalSave() → Backend Python API
  └─→ emitSaveEvent() → IndexedDB via flowiseTableBridge
       ↓
       Événement "flowise:table:save:request"
       ↓
       flowiseTableBridge.handleTableSaveRequest()
       ↓
       IndexedDB.put(sessionId, table, keyword)
       ↓
       ✅ PERSISTANCE FRONTEND
```

---

## 🔄 FLUX COMPLETS

### Flux A: Sauvegarde Nouvelle Table

```
┌─────────────────────────────────────────────────────┐
│ 1. USER ACTION                                       │
│    User demande génération table via prompt          │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 2. FLOWISE/N8N GÉNÉRATION                           │
│    Backend génère HTML table                         │
│    Injecte dans DOM chat                             │
│    <table data-keyword="Rubrique">...</table>        │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 3. DÉTECTION (index.html)                           │
│    MutationObserver détecte addedNodes               │
│    Vérifie: table[data-keyword] ajoutée?             │
│    → OUI: handleNewTable(table)                      │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 4. VALIDATION SessionId (index.html)                │
│    getSessionId() avec retry                         │
│    Attribut [data-session-id] présent?               │
│    → OUI: Continue                                   │
│    → NON: Retry 100ms (max 20x)                      │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 5. ÉMISSION ÉVÉNEMENT (index.html)                  │
│    emitSaveEvent(table)                              │
│    document.dispatchEvent(                           │
│      'flowise:table:integrated', {                   │
│        table, keyword, source, sessionId             │
│      }                                                │
│    )                                                  │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 6. RÉCEPTION ÉVÉNEMENT (flowiseTableBridge.ts)     │
│    handleFlowiseTableIntegrated(event)               │
│    Extrait: detail.table, detail.keyword, etc.       │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 7. VÉRIFICATIONS (flowiseTableBridge.ts)            │
│    • Déjà sauvegardée? (fingerprint check)           │
│    • Keyword exclue? (EXCLUDED_KEYWORDS)             │ ← BLOCAGE ICI
│    → OUI: Return (skip)                              │
│    → NON: Continue                                   │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 8. SAUVEGARDE (flowiseTableService.ts)              │
│    saveGeneratedTable(sessionId, table, keyword)     │
│    • Générer tableId, fingerprint                    │
│    • Compression si >50KB                            │
│    • Extraire métadonnées                            │
│    • Construire tableRecord                          │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 9. TRANSACTION IndexedDB                             │
│    indexedDBService.putGeneratedTable(record)        │
│    db.transaction(['clara_generated_tables'])        │
│    store.put({                                       │
│      id, sessionId, keyword, html, timestamp         │
│    })                                                 │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 10. CONFIRMATION                                     │
│     ✅ Table sauvegardée                            │
│     Console: "✅ Table saved: tableId"              │
│     Événement: "flowise:table:saved"                 │
└─────────────────────────────────────────────────────┘
```

### Flux B: Restauration Tables (F5)

```
┌─────────────────────────────────────────────────────┐
│ 1. PAGE RELOAD (F5)                                  │
│    Navigateur recharge page                          │
│    DOM vide, React non-monté                         │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 2. BOOTSTRAP (index.html)                           │
│    Scripts inline exécutés                           │
│    Flag DISABLE_TABLE_RESTORATION défini             │
│    MutationObserver démarré                          │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 3. REACT MOUNT                                       │
│    ClaraAssistant.tsx rendu                          │
│    stableSessionId généré (useRef)                   │
│    Attribut data-session-id={stableSessionId}        │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 4. BRIDGE INIT (flowiseTableBridge.ts)              │
│    constructor()                                     │
│      → initializeEventListeners()                    │
│      → detectCurrentSession()                        │
│      → initializeRestoration()                       │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 5. VÉRIFICATION FLAG (flowiseTableBridge.ts)        │
│    initializeRestoration()                           │
│    if (window.DISABLE_TABLE_RESTORATION) {           │
│      console.log('🚫 Restauration disabled');      │
│      return;                                         │
│    }                                                 │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 6. RESTAURATION (flowiseTableBridge.ts)             │
│    restoreTablesForSession(sessionId)                │
│    • Query IndexedDB par sessionId                   │
│    • Filtre EXCLUDED_KEYWORDS                        │
│    • Trie par timestamp                              │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 7. QUERY IndexedDB (flowiseTableService.ts)         │
│    restoreSessionTables(sessionId)                   │
│    index.getAll(sessionId)                           │
│    → Retourne Array<tableRecord>                     │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 8. INJECTION DOM (flowiseTableBridge.ts)            │
│    Pour chaque table:                                │
│      injectTableIntoDOM(tableData)                   │
│      • Vérifie si existe (anti-doublon)              │
│      • Parse HTML                                    │
│      • Crée container si besoin                      │
│      • Insère table dans DOM                         │
│      • Marque data-restored="true"                   │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ 9. TABLES VISIBLES                                   │
│    ✅ Tables réapparaissent dans chat               │
│    Console: "✅ Restored N table(s)"                │
│    Événement: "flowise:tables:restored"              │
└─────────────────────────────────────────────────────┘
```

### Flux C: Contamination (Scénario Buggy)

```
Chat A: sessionId = "session-AAA"
Chat B: sessionId = "session-BBB"

┌─────────────────────────────────────────────────────┐
│ SAUVEGARDE BUGGY (sessionId null)                   │
│                                                      │
│ 1. Chat A: Table générée                            │
│    ↓                                                 │
│ 2. emitSaveEvent() appelé AVANT React monté         │
│    getSessionId() → null                             │
│    ↓                                                 │
│ 3. Événement émis avec sessionId: null              │
│    ↓                                                 │
│ 4. flowiseTableBridge sauvegarde:                    │
│    {                                                 │
│      id: "table-123",                                │
│      sessionId: null,    ← PROBLÈME!                │
│      keyword: "Rubrique"                             │
│    }                                                 │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ RESTAURATION BUGGY                                   │
│                                                      │
│ 1. Chat B ouvert (sessionId = "session-BBB")        │
│    ↓                                                 │
│ 2. restoreTablesForSession("session-BBB")            │
│    Query: index.getAll("session-BBB")                │
│    ↓                                                 │
│ 3. IndexedDB retourne:                               │
│    • Table "Rubrique" (sessionId: null)  ← Match!   │
│    • (null == "session-BBB" évalué vrai par bug)    │
│    ↓                                                 │
│ 4. Table "Rubrique" restaurée dans Chat B            │
│    ❌ CONTAMINATION!                                │
│                                                      │
│ Chat B voit table de Chat A                         │
└─────────────────────────────────────────────────────┘

SOLUTION APPLIQUÉE:
┌─────────────────────────────────────────────────────┐
│ emitSaveEvent() avec retry:                          │
│                                                      │
│ 1. getSessionId() → null                             │
│ 2. ❌ STOP - Pas d'événement                        │
│ 3. setTimeout 100ms                                  │
│ 4. getSessionId() → "session-AAA" ✅                │
│ 5. Événement émis avec BON sessionId                 │
│ 6. ✅ Isolation garantie                            │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 POINTS BLOCAGE ACTUELS

### Blocage #1: Code Désactivation Absent Build ⚠️

**Localisation:** `flowiseTableBridge.ts` lignes 706-710

**Code Source:**
```typescript
const EXCLUDED_KEYWORDS = ['Table_Consolidation', 'Resultat', 'Table_conso'];
if (EXCLUDED_KEYWORDS.some(excluded => keyword.toLowerCase().includes(excluded.toLowerCase()))) {
  console.log(`🚫 [DISABLED] Skipping save for excluded keyword: "${keyword}"`);
  return;
}
```

**Statut:**
- ✅ Présent dans `src/services/flowiseTableBridge.ts`
- ❌ **ABSENT dans `dist/assets/index-*.js`** après build
- ❌ Log `🚫 [DISABLED]` jamais vu dans console

**Hypothèses:**
1. **Tree-shaking:** Vite/esbuild supprime code considéré "mort"
2. **Cache:** `node_modules/.vite` sert ancien code malgré rebuild
3. **Autre chemin:** Sauvegarde passe par `saveTablesBatch()` qui bypass blocage

**Tentatives Échouées:**
```bash
# 1. Rebuild complet
npm run build  # ❌ Code toujours absent

# 2. Suppression caches
Remove-Item -Recurse -Force dist, node_modules\.vite
npm run build  # ❌ Code toujours absent

# 3. Dev server restart
Ctrl+C, npm run dev  # ⏳ Test en cours (port 5174)
```

**Investigation Nécessaire:**
1. Vérifier build sans minification: `npm run build -- --minify false`
2. Chercher appels alternatifs: `grep -rn "saveGeneratedTable" src/`
3. Tracer execution: Ajouter logs AVANT ligne 706

### Blocage #2: Doublons Tables Persistent ⚠️

**Symptôme:**
```
📋 Doublons détectés:
   • Rubrique: 2x
   • no: 3x
   • Table_Consolidation: 2x
```

**Cause Probable:**
Anti-doublon `injectTableIntoDOM()` ligne 1392 **pas exécuté** (même problème compilation).

**Code Protection:**
```typescript
const allTablesWithKeyword = document.querySelectorAll(
  `table[data-keyword="${tableData.keyword}"]`
);

if (allTablesWithKeyword.length > 0) {
  console.log(`⏭️ Skip restoration - ${allTablesWithKeyword.length} already in DOM`);
  return; // ← Empêcher doublon
}
```

**Statut:**
- ✅ Présent dans source TypeScript
- ❌ Log `⏭️ Skip restoration` jamais vu
- ❌ Doublons créés quand même

**Solution Alternative:**
Bloquer en amont dans `restoreTablesForSession()`:
```typescript
const tables = await flowiseTableService.restoreSessionTables(sessionId);

// Filtrer tables déjà en DOM
const filtered = tables.filter(t => {
  const existing = document.querySelectorAll(`table[data-keyword="${t.keyword}"]`);
  return existing.length === 0; // Garder uniquement si absent DOM
});
```

### Blocage #3: SessionId Instable (Résolu ✅)

**Symptôme (Avant):**
```
Test 1: sessionId = "8ed84559-e432-4c09..."
Test 2: sessionId = "2137ed89-2f2a-49a9..." ← DIFFÉRENT!
```

**Cause:**
useState seul → sessionId change à chaque render React.

**Solution Appliquée:**
```typescript
const initialSessionIdRef = useRef<string | null>(null);

useEffect(() => {
  if (!initialSessionIdRef.current) {
    initialSessionIdRef.current = currentSession.id;
    setStableSessionId(currentSession.id);
  }
}, [currentSession?.id]);
```

**Statut:** ✅ **RÉSOLU** - SessionId maintenant stable

---

## 📖 GLOSSAIRE TERMES TECHNIQUES

**SessionId:**  
Identifiant unique chat (ex: `"clara-session-1234567-abc"`). Permet isoler tables par conversation.

**Fingerprint:**  
Hash MD5 du HTML table pour détecter doublons. Même contenu → même fingerprint.

**IndexedDB:**  
Base données navigateur. Store `clara_generated_tables` contient tables sauvegardées.

**MutationObserver:**  
API navigateur surveillant changements DOM (ajouts/suppressions éléments).

**Tree-shaking:**  
Optimisation build supprimant code "mort" (non-utilisé). Peut éliminer code désactivation.

**useRef:**  
Hook React conservant valeur entre renders sans déclencher re-render.

**CustomEvent:**  
Événement JavaScript personnalisé pour communication inter-composants.

**Transaction IndexedDB:**  
Opération atomique lecture/écriture base données. Garantit cohérence.

**Anti-doublon:**  
Mécanisme vérifiant qu'élément pas déjà présent avant ajout.

**Contamination:**  
Bug où tables d'un chat apparaissent dans autre chat (isolation brisée).

---

## 🎯 PROCHAINES ÉTAPES RECOMMANDÉES

1. **Diagnostic Build**
   - Build sans minification
   - Vérifier présence code dans bundle
   - Tracer chemins sauvegarde

2. **Solutions Alternatives**
   - Blocage niveau IndexedDB si TypeScript impossible
   - Blocage événement phase capture
   - Filtrage post-restauration

3. **Tests Validation**
   - Intercept IDBObjectStore.put() pour tracer sauvegardes
   - Test contamination Chat A/B
   - Logs execution complets

4. **Prévention Régressions**
   - Tests unitaires blocage
   - CI/CD vérifie présence code bundle
   - Documentation architecture

---

**Ce document fournit contexte complet pour agent externe reprenant le problème. Tous fichiers, flux, et blocages documentés de manière exhaustive. 🎯**
