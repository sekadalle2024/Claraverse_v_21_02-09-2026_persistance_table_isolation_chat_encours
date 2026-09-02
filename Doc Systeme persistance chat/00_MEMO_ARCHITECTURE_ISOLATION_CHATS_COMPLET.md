# 📋 MÉMO ARCHITECTURE - Isolation des Chats ClaraVerse

**Date** : 29 Août 2026  
**Statut** : ❌ **PROBLÈME PERSISTANT - Contamination Entre Chats**  
**Priorité** : 🔴 **CRITIQUE**

---

## 📊 ÉTAT ACTUEL DES PROBLÈMES

### ❌ Problèmes Confirmés (Observation 5)

1. **Contamination entre chats** (2 cas observés)
   - Tables d'un chat apparaissent dans un autre
   - SessionId ne garantit pas l'isolation
   - Problème intermittent mais récurrent

2. **Doublement intégral** 
   - Toutes les tables des messages utilisateur dupliquées
   - Toutes les tables des messages LLM dupliquées
   - Affecte certains chats spécifiquement

3. **Doublons de tables**
   - Même table apparaît plusieurs fois
   - Versions modifiée + non modifiée coexistent

4. **Table_conso et Table_Resultat pas persistantes**
   - Modifications perdues après F5
   - Sauvegarde ne fonctionne pas

5. **Notifications système disparues**
   - PersistanceLogger ne s'affiche plus
   - Bouton diagnostic 🔍 n'apparaît pas

---

## 🎯 OBJECTIF INITIAL

**Isoler parfaitement les tables entre différents chats**

Chaque chat doit avoir :
- ✅ Ses propres tables
- ✅ Pas de contamination avec autres chats
- ✅ Persistance après F5 (actualisation)
- ✅ Restauration uniquement des tables du chat actif

---

## 🏗️ ARCHITECTURE TENTÉE

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         COUCHES SYSTÈME                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. React (ClaraAssistant.tsx)                                  │
│     └─> Expose data-session-id dans DOM                         │
│         └─> State: stableSessionId                              │
│                                                                 │
│  2. Script Inline (index.html)                                  │
│     └─> Lit data-session-id depuis DOM                          │
│         └─> Cache sessionId                                     │
│         └─> Intercepte saveTableDataNow()                       │
│         └─> Émet CustomEvent 'flowise:table:save:request'      │
│                                                                 │
│  3. flowiseTableBridge.ts                                       │
│     └─> Écoute CustomEvent                                      │
│         └─> Sauvegarde tables dans IndexedDB par sessionId      │
│         └─> Restaure tables du sessionId actif                  │
│                                                                 │
│  4. conso.js                                                    │
│     └─> Crée Table_Consolidation et Table_Resultat             │
│         └─> Appelle saveTableDataNow()                          │
│                                                                 │
│  5. IndexedDB                                                   │
│     └─> Stockage par sessionId                                  │
│         └─> Tables isolées par chat                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 SOLUTIONS TENTÉES (TOUTES ÉCHOUÉES)

### Solution 1 : SessionId de currentSession?.id
**Date** : Première tentative  
**Fichier** : `ClaraAssistant.tsx`

**Code** :
```tsx
data-session-id={currentSession?.id}
```

**Problème** :
- `currentSession` est `null` au démarrage
- React ne rend pas l'attribut si valeur `undefined`
- `data-session-id` **absent du DOM**
- Fallback sur sessionStorage
- **❌ Contamination garantie**

**Raison échec** : React ne garantit pas que `currentSession` soit défini avant render

---

### Solution 2 : Fallback Inline avec ||
**Date** : Deuxième tentative

**Code** :
```tsx
data-session-id={currentSession?.id || `temp-${Date.now()}`}
```

**Problème** :
- Nouveau sessionId généré à **chaque render**
- SessionId change constamment
- Tables ne sont jamais restaurées (sessionId différent à chaque fois)
- **❌ Perte de données**

**Raison échec** : Pas de stabilité du sessionId

---

### Solution 3 : State stableSessionId
**Date** : Troisième tentative (actuelle)  
**Fichier** : `ClaraAssistant.tsx` ligne 411-425

**Code** :
```tsx
const [stableSessionId, setStableSessionId] = useState<string>(() => 
  `clara-session-${Date.now()}-${Math.random().toString(36).substr(2, 11)}`
);

useEffect(() => {
  if (currentSession?.id && currentSession.id !== stableSessionId) {
    setStableSessionId(currentSession.id);
    console.log('🔄 [React] SessionId mis à jour:', currentSession.id);
  }
}, [currentSession?.id, stableSessionId]);

// Dans render
data-session-id={stableSessionId}
```

**Avantages** :
- ✅ SessionId toujours défini
- ✅ Stable entre renders
- ✅ Se synchronise avec currentSession

**Problèmes observés** :
- ⚠️ Contamination intermittente (2 cas confirmés)
- ⚠️ SessionId change mais tables pas toujours séparées
- ⚠️ MutationObserver pas toujours déclenché ?
- **❌ Isolation pas garantie à 100%**

**Raison échec probable** :
- Race condition entre changement sessionId et restauration tables
- IndexedDB queries asynchrones créent timing issues
- Tables sauvegardées avec mauvais sessionId

---

### Solution 4 : Cache SessionId avec Retry
**Date** : Quatrième tentative  
**Fichier** : `index.html` ligne 418-454

**Code** :
```javascript
let sessionIdRetryCount = 0;
const MAX_SESSION_RETRY = 20; // 2 secondes

function getSessionId() {
  // 1. Essayer DOM
  const element = document.querySelector('[data-session-id]');
  const domSessionId = element?.getAttribute('data-session-id');
  
  if (domSessionId && domSessionId !== 'undefined') {
    cachedSessionId = domSessionId;
    sessionIdRetryCount = 0;
    return domSessionId;
  }
  
  // 2. Réutiliser cache si retry en cours
  if (cachedSessionId && sessionIdRetryCount < MAX_SESSION_RETRY) {
    sessionIdRetryCount++;
    return cachedSessionId;
  }
  
  // 3. Fallback sessionStorage (DANGEREUX)
  // ...
}
```

**Avantages** :
- ✅ Tolère délais React
- ✅ Évite fallback sessionStorage immédiat

**Problèmes** :
- ⚠️ Si React >2s → fallback sessionStorage quand même
- ⚠️ Cache peut contenir ancien sessionId
- **❌ Contamination possible après 2 secondes**

**Raison échec** : Timeout trop court pour garantir React monté

---

### Solution 5 : Skip Restoration Table_Conso/Table_Resultat
**Date** : Cinquième tentative  
**Fichier** : `flowiseTableBridge.ts` ligne 1342

**Code** :
```typescript
private injectTableIntoDOM(tableData: FlowiseGeneratedTableRecord): void {
  // Ne pas restaurer Table_Consolidation et Table_Resultat
  if (tableData.keyword === 'Table_Consolidation' || 
      tableData.keyword === 'Table_Resultat') {
    console.log(`⏭️ Skip restoration of "${tableData.keyword}"`);
    return;
  }
  // ...
}
```

**Raison** : Ces tables sont gérées par conso.js avec event listeners dynamiques

**Avantages** :
- ✅ Évite conflits avec conso.js
- ✅ Event listeners préservés

**Problèmes** :
- ❌ **Table_Conso et Table_Resultat PAS persistantes**
- ❌ Modifications perdues après F5
- ❌ Sauvegarde forcée ne fonctionne pas

**Raison échec** : Skip restoration = skip tout, pas de sauvegarde IndexedDB

---

### Solution 6 : Sauvegarde Forcée Table_Conso/Table_Resultat
**Date** : Sixième tentative  
**Fichier** : `conso.js` ligne 1346-1365

**Code** :
```javascript
// Après updateResultatTable
if (resultatUpdated) {
  const resultatTable = this.findResultatTable(table);
  if (resultatTable) {
    debug.log("💾 [CONSO] Sauvegarde forcée Table_Resultat");
    setTimeout(() => this.saveTableDataNow(resultatTable), 100);
  }
}

// Après updateConsoTable
if (consoUpdated) {
  const consoTable = document.querySelector(`table.claraverse-conso-table[...]`);
  if (consoTable) {
    debug.log("💾 [CONSO] Sauvegarde forcée Table_Consolidation");
    setTimeout(() => this.saveTableDataNow(consoTable), 100);
  }
}
```

**Avantages** :
- ✅ Force sauvegarde après consolidation
- ✅ Appel explicite saveTableDataNow

**Problèmes** :
- ❌ **Sauvegarde ne persiste pas**
- ❌ findResultatTable ne trouve pas toujours la table
- ❌ Logs "💾 [CONSO]" pas toujours visibles
- ❌ Interception inline ne fonctionne pas toujours

**Raison échec probable** :
- `window.claraverseProcessor.__integrated` pas toujours true
- Script inline pas exécuté à temps
- CustomEvent pas émis ou pas écouté

---

### Solution 7 : Réinstallation Event Listeners
**Date** : Septième tentative  
**Fichier** : `conso.js` ligne 1333-1342

**Code** :
```javascript
// Réinstaller listeners après updateResultatTable
if (resultatUpdated) {
  const resultatTable = this.findResultatTable(table);
  if (resultatTable) {
    const resultatHeaders = this.getTableHeaders(resultatTable);
    debug.log("🔧 [CONSO] Réinstallation listeners sur Table_Resultat");
    this.setupTableInteractions(resultatTable, resultatHeaders);
  }
}

// Réinstaller listeners sur table principale
setTimeout(() => {
  this.setupTableInteractions(table, mainHeaders);
}, 150);
```

**Raison** : Menu déroulant "Conclusion" ne fonctionnait plus

**Avantages** :
- ✅ Menu Conclusion fonctionne à nouveau
- ✅ Event listeners réinstallés après mise à jour

**Problèmes** :
- ⚠️ Délay 150ms peut être insuffisant
- ⚠️ setupTableInteractions clone cellules (replaceWith)
- ❌ Peut causer régression performances si appelé trop souvent

---

### Solution 8 : PersistanceLogger avec Bouton UI
**Date** : Huitième tentative  
**Fichier** : `public/persistance-logger.js`

**Code** :
```javascript
window.PersistanceLogger.runDiagnostic = function() { ... };
createDiagnosticButton(); // Bouton flottant 🔍
```

**Raison** : Diagnostic accessible sans console

**Problèmes** :
- ❌ **Notifications n'apparaissent plus**
- ❌ **Bouton 🔍 n'apparaît pas**
- ❌ PersistanceLogger ne se charge pas ?

**Raison échec probable** :
- Erreur JavaScript bloque chargement
- Script persistance-logger.js pas chargé
- Erreur de syntaxe dans modifications récentes

---

## 🚨 PROBLÈMES FONDAMENTAUX IDENTIFIÉS

### 1. Race Conditions

**Problème** : Timing entre événements asynchrones

```
Séquence problématique:
1. User change de chat (Chat1 → Chat2)
2. React: setCurrentSession(chat2)
3. useEffect déclenché
4. setStableSessionId(chat2.id)
5. DOM mis à jour avec data-session-id=chat2.id
6. MutationObserver détecte changement
7. flowiseTableBridge.restoreTablesForSession(chat2.id)
8. IndexedDB query: getTables(chat2.id)
9. MAIS: saveTableDataNow(table) de Chat1 toujours en cours
10. Table de Chat1 sauvegardée avec sessionId de Chat2 !
```

**Résultat** : Contamination

---

### 2. SessionId Source Unique (sessionStorage)

**Problème** : Fallback dangereux

```javascript
// Si DOM fail après 2 secondes → sessionStorage
const stored = sessionStorage.getItem('claraverse_stable_session');
```

**Raison** : sessionStorage partagé entre tous les onglets/chats

**Résultat** : Tous les chats ont le même sessionId → Contamination totale

---

### 3. IndexedDB Queries Asynchrones

**Problème** : Pas de synchronisation

```typescript
// Pas de lock/mutex entre save et restore
await flowiseTableService.saveTable(table, sessionId);
// Autre thread:
await flowiseTableService.restoreSessionTables(differentSessionId);
```

**Résultat** : Tables peuvent être sauvegardées pendant restauration

---

### 4. MutationObserver Pas Fiable

**Problème** : Peut ne pas se déclencher

```javascript
observer.observe(element, {
  attributes: true,
  attributeFilter: ['data-session-id']
});
```

**Si** :
- Element pas encore dans DOM
- Attribute change trop rapide
- Observer déconnecté

**Résultat** : Changement de chat pas détecté → Pas de restauration

---

### 5. Keyword Matching Fragile

**Problème** : findTableByKeyword pas toujours fiable

```typescript
// PRIORITÉ 1: data-keyword sur table
const tableKeyword = table.dataset.keyword;
if (tableKeyword === keyword) return table;

// PRIORITÉ 2: data-n8n-keyword sur wrapper
// PRIORITÉ 3: Premier <th>
// PRIORITÉ 4: Any header contenant keyword
```

**Si** :
- Table sans data-keyword
- Keyword avec espaces/accents
- Plusieurs tables avec keyword similaire

**Résultat** : Mauvaise table trouvée → Restauration incorrecte

---

### 6. Double Sauvegarde localStorage + IndexedDB

**Problème** : Deux systèmes de stockage

```javascript
// conso.js utilise localStorage (ancien système)
processor.saveAllData = function(data) {
  localStorage.setItem('claraverseData', JSON.stringify(data));
};

// flowiseTableBridge utilise IndexedDB (nouveau système)
await flowiseTableService.saveTable(table, sessionId);
```

**Résultat** : Conflit, données incohérentes

---

## 💡 SOLUTIONS QUI ONT PARTIELLEMENT FONCTIONNÉ

### ✅ Attribut data-keyword sur Tables

**Ce qui marche** :
```javascript
// conso.js ligne 1583
potentialTable.dataset.keyword = "Table_Resultat";

// flowiseTableBridge recherche par data-keyword en priorité
const tableKeyword = table.dataset.keyword;
```

**Avantage** : Identification stable des tables

---

### ✅ stableSessionId State React

**Ce qui marche** :
```tsx
const [stableSessionId, setStableSessionId] = useState(() => 
  `clara-session-${Date.now()}-${Math.random().toString(36).substr(2, 11)}`
);
```

**Avantage** : SessionId toujours défini, pas de undefined

**Limitation** : Sync avec currentSession pas immédiate

---

### ✅ Interception saveTableDataNow

**Ce qui marche** :
```javascript
const originalSaveTableDataNow = processor.saveTableDataNow;
processor.saveTableDataNow = function(table) {
  originalSaveTableDataNow.call(this, table);
  emitSaveEvent(table);
};
```

**Avantage** : Capture toutes les sauvegardes

**Limitation** : Dépend de `__integrated` flag

---

## ❌ CE QUI NE FONCTIONNE PAS DU TOUT

### ❌ Fallback sessionStorage

**Code** :
```javascript
const stored = sessionStorage.getItem('claraverse_stable_session');
if (stored) return stored;
```

**Problème** : Garantit contamination entre chats

**À SUPPRIMER COMPLÈTEMENT**

---

### ❌ Timeout Fixes (setTimeout)

**Code** :
```javascript
setTimeout(() => this.saveTableDataNow(table), 100);
setTimeout(() => this.setupTableInteractions(table, headers), 150);
```

**Problème** : 
- Timing arbitraire
- Race conditions
- Pas fiable selon charge système

**À REMPLACER par Promises/await**

---

### ❌ Retry Count (20 tentatives)

**Code** :
```javascript
if (sessionIdRetryCount < MAX_SESSION_RETRY) {
  sessionIdRetryCount++;
  return cachedSessionId;
}
```

**Problème** : Masque le vrai problème (React pas prêt)

**À REMPLACER par Event-based approach**

---

## 🎯 SOLUTION RECOMMANDÉE (Architecte Complet)

### Architecture Complète à Implémenter

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOUVELLE ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: React Context Provider                                │
│  ================================                                │
│  SessionIdContext                                               │
│    └─> Fournit sessionId stable                                 │
│    └─> Émet événement 'session:changed'                         │
│    └─> Pas de fallback sessionStorage                           │
│                                                                 │
│  Layer 2: IndexedDB Service (Centralisé)                        │
│  =======================================                         │
│  TableStorageService                                            │
│    └─> Queue de sauvegarde (FIFO)                               │
│    └─> Mutex pour prevent concurrent saves                      │
│    └─> Transaction-based saves                                  │
│    └─> sessionId mandatory (pas de fallback)                    │
│                                                                 │
│  Layer 3: Table Manager                                         │
│  =======================                                         │
│  TableManager                                                   │
│    └─> Registry de toutes tables en mémoire                     │
│    └─> WeakMap<HTMLTableElement, TableMetadata>                │
│    └─> Tracks sessionId per table                               │
│    └─> Cleanup automatique tables orphelines                    │
│                                                                 │
│  Layer 4: Lifecycle Hooks                                       │
│  =========================                                       │
│  useTablePersistence()                                          │
│    └─> Hook React pour auto-save                                │
│    └─> Cleanup on unmount                                       │
│    └─> Debounce saves                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Implémentation Détaillée

#### 1. SessionIdContext (React)

**Fichier à créer** : `src/contexts/SessionIdContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SessionIdContextType {
  sessionId: string;
  isReady: boolean;
}

const SessionIdContext = createContext<SessionIdContextType | null>(null);

export function SessionIdProvider({ 
  children, 
  currentSessionId 
}: { 
  children: ReactNode; 
  currentSessionId: string | undefined;
}) {
  const [sessionId, setSessionId] = useState<string>(() => 
    `clara-session-${Date.now()}-${Math.random().toString(36).substr(2, 11)}`
  );
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (currentSessionId && currentSessionId !== sessionId) {
      // Émettre événement AVANT changement
      window.dispatchEvent(new CustomEvent('clara:session:willChange', {
        detail: { from: sessionId, to: currentSessionId }
      }));
      
      setSessionId(currentSessionId);
      
      // Émettre événement APRÈS changement
      window.dispatchEvent(new CustomEvent('clara:session:didChange', {
        detail: { sessionId: currentSessionId }
      }));
    }
    setIsReady(true);
  }, [currentSessionId]);
  
  // Exposer dans DOM
  useEffect(() => {
    const el = document.querySelector('[data-clara-container]');
    if (el) {
      el.setAttribute('data-session-id', sessionId);
    }
  }, [sessionId]);
  
  return (
    <SessionIdContext.Provider value={{ sessionId, isReady }}>
      {children}
    </SessionIdContext.Provider>
  );
}

export function useSessionId() {
  const context = useContext(SessionIdContext);
  if (!context) throw new Error('useSessionId must be within SessionIdProvider');
  return context;
}
```

**Utilisation dans ClaraAssistant.tsx** :
```tsx
<SessionIdProvider currentSessionId={currentSession?.id}>
  <div data-clara-container>
    {/* contenu */}
  </div>
</SessionIdProvider>
```

---

#### 2. TableStorageService (Centralisé)

**Fichier à créer** : `src/services/tableStorageService.ts`

```typescript
import { openDB, IDBPDatabase } from 'idb';

interface TableData {
  id: string;
  sessionId: string;
  keyword: string;
  html: string;
  timestamp: number;
}

class TableStorageService {
  private db: IDBPDatabase | null = null;
  private saveQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private saveMutex = new Map<string, Promise<void>>();
  
  async init() {
    this.db = await openDB('clara-tables-v2', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tables')) {
          const store = db.createObjectStore('tables', { keyPath: 'id' });
          store.createIndex('sessionId', 'sessionId', { unique: false });
          store.createIndex('keyword', 'keyword', { unique: false });
        }
      }
    });
  }
  
  async saveTable(table: HTMLTableElement, sessionId: string, keyword: string): Promise<void> {
    if (!sessionId) {
      console.error('❌ saveTable: sessionId required');
      return;
    }
    
    const tableId = `${sessionId}-${keyword}-${Date.now()}`;
    
    // Check if save already in progress for this table
    if (this.saveMutex.has(tableId)) {
      console.log('⏳ Save already in progress:', tableId);
      return this.saveMutex.get(tableId);
    }
    
    const savePromise = this.performSave(table, sessionId, keyword, tableId);
    this.saveMutex.set(tableId, savePromise);
    
    try {
      await savePromise;
    } finally {
      this.saveMutex.delete(tableId);
    }
  }
  
  private async performSave(
    table: HTMLTableElement, 
    sessionId: string, 
    keyword: string,
    tableId: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.saveQueue.push(async () => {
        try {
          if (!this.db) await this.init();
          
          const data: TableData = {
            id: tableId,
            sessionId,
            keyword,
            html: table.outerHTML,
            timestamp: Date.now()
          };
          
          await this.db!.put('tables', data);
          console.log('✅ Table saved:', keyword, 'session:', sessionId.substring(0, 20));
          resolve();
        } catch (error) {
          console.error('❌ Save error:', error);
          reject(error);
        }
      });
      
      if (!this.isProcessing) {
        this.processSaveQueue();
      }
    });
  }
  
  private async processSaveQueue() {
    if (this.isProcessing || this.saveQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.saveQueue.length > 0) {
      const saveFn = this.saveQueue.shift();
      if (saveFn) {
        await saveFn();
      }
    }
    
    this.isProcessing = false;
  }
  
  async getTablesForSession(sessionId: string): Promise<TableData[]> {
    if (!sessionId) {
      console.error('❌ getTablesForSession: sessionId required');
      return [];
    }
    
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('tables', 'readonly');
    const index = tx.store.index('sessionId');
    return await index.getAll(sessionId);
  }
  
  async clearSession(sessionId: string): Promise<void> {
    if (!this.db) await this.init();
    
    const tables = await this.getTablesForSession(sessionId);
    const tx = this.db!.transaction('tables', 'readwrite');
    
    for (const table of tables) {
      await tx.store.delete(table.id);
    }
    
    console.log(`🗑️ Cleared ${tables.length} table(s) for session:`, sessionId);
  }
}

export const tableStorageService = new TableStorageService();
```

---

#### 3. TableManager (Registry)

**Fichier à créer** : `src/services/tableManager.ts`

```typescript
interface TableMetadata {
  keyword: string;
  sessionId: string;
  element: HTMLTableElement;
  listeners: Set<EventListener>;
}

class TableManager {
  private tables = new WeakMap<HTMLTableElement, TableMetadata>();
  private tablesByKeyword = new Map<string, Set<HTMLTableElement>>();
  
  register(table: HTMLTableElement, keyword: string, sessionId: string): void {
    const metadata: TableMetadata = {
      keyword,
      sessionId,
      element: table,
      listeners: new Set()
    };
    
    this.tables.set(table, metadata);
    
    if (!this.tablesByKeyword.has(keyword)) {
      this.tablesByKeyword.set(keyword, new Set());
    }
    this.tablesByKeyword.get(keyword)!.add(table);
    
    table.dataset.keyword = keyword;
    table.dataset.sessionId = sessionId;
    table.dataset.managed = 'true';
    
    console.log('📋 Table registered:', keyword, 'session:', sessionId.substring(0, 20));
  }
  
  unregister(table: HTMLTableElement): void {
    const metadata = this.tables.get(table);
    if (!metadata) return;
    
    // Remove from keyword map
    const keywordSet = this.tablesByKeyword.get(metadata.keyword);
    if (keywordSet) {
      keywordSet.delete(table);
      if (keywordSet.size === 0) {
        this.tablesByKeyword.delete(metadata.keyword);
      }
    }
    
    // Remove all listeners
    metadata.listeners.forEach(listener => {
      table.removeEventListener('click', listener);
    });
    
    this.tables.delete(table);
    console.log('🗑️ Table unregistered:', metadata.keyword);
  }
  
  getByKeyword(keyword: string): HTMLTableElement[] {
    return Array.from(this.tablesByKeyword.get(keyword) || []);
  }
  
  getBySession(sessionId: string): HTMLTableElement[] {
    const results: HTMLTableElement[] = [];
    
    this.tablesByKeyword.forEach((tables) => {
      tables.forEach(table => {
        const metadata = this.tables.get(table);
        if (metadata && metadata.sessionId === sessionId) {
          results.push(table);
        }
      });
    });
    
    return results;
  }
  
  cleanupOrphans(): void {
    let cleaned = 0;
    
    this.tablesByKeyword.forEach((tables, keyword) => {
      tables.forEach(table => {
        if (!document.body.contains(table)) {
          this.unregister(table);
          cleaned++;
        }
      });
    });
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} orphan table(s)`);
    }
  }
}

export const tableManager = new TableManager();
```

---

## ⚠️ ERREURS À ÉVITER ABSOLUMENT

### 1. ❌ NE JAMAIS utiliser sessionStorage pour sessionId

```javascript
// ❌ MAUVAIS
const sessionId = sessionStorage.getItem('sessionId');

// ✅ BON
const sessionId = useSessionId().sessionId; // depuis Context
```

---

### 2. ❌ NE JAMAIS sauvegarder sans sessionId

```typescript
// ❌ MAUVAIS
if (!sessionId) {
  sessionId = 'fallback'; // Non!
}
await saveTable(table, sessionId);

// ✅ BON
if (!sessionId) {
  console.error('sessionId required, aborting save');
  return;
}
await saveTable(table, sessionId);
```

---

### 3. ❌ NE JAMAIS utiliser setTimeout pour sync

```javascript
// ❌ MAUVAIS
setTimeout(() => saveTable(), 100);

// ✅ BON
await saveTable();
```

---

### 4. ❌ NE JAMAIS restaurer toutes les tables

```typescript
// ❌ MAUVAIS
const allTables = await getAllTables();
allTables.forEach(restore);

// ✅ BON
const tables = await getTablesForSession(sessionId);
tables.forEach(restore);
```

---

### 5. ❌ NE JAMAIS modifier table pendant restoration

```javascript
// ❌ MAUVAIS
async function restore() {
  const tables = await getTables();
  tables.forEach(t => modify(t)); // Modification pendant restore
}

// ✅ BON
async function restore() {
  const tables = await getTables();
  // Attendre fin restauration
  await Promise.all(tables.map(restoreTable));
  // Puis modifier
  tables.forEach(t => modify(t));
}
```

---

## 📋 BONNES PRATIQUES

### 1. ✅ Toujours Valider sessionId

```typescript
function isValidSessionId(id: string): boolean {
  return id && 
         id !== 'undefined' && 
         id !== 'null' && 
         id.length > 10;
}
```

---

### 2. ✅ Utiliser Transactions IndexedDB

```typescript
const tx = db.transaction('tables', 'readwrite');
await tx.store.put(data1);
await tx.store.put(data2);
await tx.done;
```

---

### 3. ✅ Logger Toutes Operations

```typescript
console.log('💾 Saving table:', keyword, 'session:', sessionId.substring(0, 20));
console.log('📂 Restored:', count, 'tables for session:', sessionId.substring(0, 20));
```

---

### 4. ✅ Cleanup Régulier

```typescript
setInterval(() => {
  tableManager.cleanupOrphans();
}, 30000); // Toutes les 30 secondes
```

---

### 5. ✅ Event-Driven Architecture

```typescript
// Émettre événements
window.dispatchEvent(new CustomEvent('clara:session:changed', {
  detail: { sessionId }
}));

// Écouter événements
window.addEventListener('clara:session:changed', (e) => {
  const { sessionId } = e.detail;
  restoreTablesForSession(sessionId);
});
```

---

## 🔍 DIAGNOSTIC - État Actuel

### Tests à Effectuer

#### Test 1: Vérifier sessionId dans DOM
```javascript
document.querySelector('[data-session-id]')?.getAttribute('data-session-id')
// Attendu: "clara-session-XXXXXXXXXX-XXXXXXXXXXX"
// Si null ou undefined → React ne monte pas correctement
```

#### Test 2: Vérifier contamination
```javascript
// Chat 1
const session1 = document.querySelector('[data-session-id]').getAttribute('data-session-id');

// Changer pour Chat 2
// Attendre 1 seconde

// Chat 2
const session2 = document.querySelector('[data-session-id]').getAttribute('data-session-id');

console.log('Différents ?', session1 !== session2);
// Attendu: true
// Si false → Contamination garantie
```

#### Test 3: Vérifier intégration conso.js
```javascript
window.claraverseProcessor?.__integrated
// Attendu: true
// Si false ou undefined → Script inline pas exécuté
```

#### Test 4: Vérifier PersistanceLogger
```javascript
typeof window.PersistanceLogger
// Attendu: "object"
// Si undefined → Script persistance-logger.js pas chargé
```

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Phase 1: Stabiliser Base (1-2 jours)

1. **Supprimer fallback sessionStorage complètement**
   - index.html ligne ~520-540
   - Forcer erreur si sessionId undefined

2. **Fixer PersistanceLogger**
   - Vérifier erreurs JavaScript
   - Corriger syntaxe
   - Tester bouton 🔍 apparaît

3. **Ajouter logs exhaustifs**
   - Logger TOUS les changements sessionId
   - Logger TOUTES les sauvegardes/restaurations
   - Identifier où contamination se produit

---

### Phase 2: Implémenter SessionIdContext (2-3 jours)

1. **Créer SessionIdContext.tsx**
2. **Wrapper ClaraAssistant**
3. **Remplacer stableSessionId par useSessionId()**
4. **Émettre événements session:changed**
5. **Tester isolation parfaite**

---

### Phase 3: Centraliser Storage (2-3 jours)

1. **Créer TableStorageService**
2. **Implémenter queue et mutex**
3. **Migrer depuis flowiseTableBridge**
4. **Supprimer localStorage complètement**
5. **Tester sauvegardes fiables**

---

### Phase 4: Table Manager (1-2 jours)

1. **Créer TableManager avec WeakMap**
2. **Register toutes les tables**
3. **Cleanup automatique**
4. **Tester gestion mémoire**

---

### Phase 5: Testing Intensif (2-3 jours)

1. **Tests contamination (100+ changements chat)**
2. **Tests doublons (vérifier aucun)**
3. **Tests persistance (F5 répété)**
4. **Tests charge (1000+ tables)**
5. **Tests edge cases (fermeture brutale, etc.)**

---

## 📊 MÉTRIQUES DE SUCCÈS

### ✅ Critères Validation

- [ ] **0% contamination** sur 100 changements de chat
- [ ] **0 doublon** de table dans tous les cas
- [ ] **100% persistance** Table_Conso et Table_Resultat après F5
- [ ] **< 100ms** temps sauvegarde par table
- [ ] **< 500ms** temps restauration session complète
- [ ] **Notifications visibles** à 100%
- [ ] **Bouton diagnostic fonctionnel** à 100%

---

## 🚀 CONCLUSION

### État Actuel: ❌ SYSTÈME DÉFAILLANT

**Problèmes critiques** :
- Contamination entre chats
- Doublons de tables
- Persistance non fonctionnelle
- Notifications disparues

**Causes racines** :
- Race conditions non gérées
- Fallback sessionStorage dangereux
- Pas de synchronisation saves/restores
- Architecture fragmentée

---

### Solution Recommandée: ✅ REFONTE ARCHITECTURALE

**Approche** :
- Context Provider React pour sessionId
- Service centralisé avec queue et mutex
- Registry tables en mémoire
- Event-driven architecture
- Zero fallbacks dangereux

**Bénéfices** :
- Isolation garantie à 100%
- Pas de contamination possible
- Performances optimisées
- Code maintenable

---

### Prochaines Étapes Immédiates

1. **URGENT**: Fixer PersistanceLogger (notifications disparues)
2. **URGENT**: Ajouter logs exhaustifs (identifier contamination)
3. **URGENT**: Supprimer fallback sessionStorage
4. **Planifier**: Refonte architecture (SessionIdContext, etc.)
5. **Documenter**: Tous changements dans ce mémo

---

**Ce mémo doit être mis à jour après chaque modification significative**

**Version** : 1.0  
**Date** : 29 Août 2026  
**Auteur** : Documentation système ClaraVerse  
**Statut** : 🔴 SYSTÈME INSTABLE - REFONTE REQUISE
