# 🏗️ Architecture Technique - Système CIA

## Vue d'Ensemble Technique

### Stack Technologique

```
Frontend:
├── HTML5 (index.html)
├── JavaScript ES6+ (conso.js, auto-restore-chat-change.js)
├── TypeScript (flowiseTableBridge.ts)
└── LocalStorage API (Persistance)

Backend:
└── Aucun (Tout côté client)
```

---

## 🔄 Diagramme de Flux Détaillé

```
┌─────────────────────────────────────────────────────────────────┐
│                    INITIALISATION                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  index.html      │
                    │  chargé          │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  conso.js        │
                    │  initialisé      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Vérification    │
                    │  LocalStorage    │
                    └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
          ┌──────────────────┐  ┌──────────────────┐
          │  Tables          │  │  Pas de          │
          │  trouvées        │  │  données         │
          └──────────────────┘  └──────────────────┘
                    │                   │
                    ▼                   ▼
          ┌──────────────────┐  ┌──────────────────┐
          │  Restauration    │  │  Attente         │
          │  des tables      │  │  nouvelles       │
          └──────────────────┘  │  tables          │
                    │            └──────────────────┘
                    ▼
          ┌──────────────────┐
          │  Ajout           │
          │  checkboxes      │
          └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │  Restauration    │
          │  états           │
          └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │  Activation      │
          │  listeners       │
          └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │  Système prêt    │
          └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    INTERACTION UTILISATEUR                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Checkbox        │
                    │  cochée/décochée │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Event 'change'  │
                    │  déclenché       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  scheduleSave()  │
                    │  (debounce 500ms)│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  saveCheckbox    │
                    │  States()        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  LocalStorage    │
                    │  mis à jour      │
                    └──────────────────┘
```

---

## 📦 Structure des Données

### 1. Table CIA dans LocalStorage

**Clé:** `claraverse_table_{tableId}`

**Structure:**
```javascript
{
  id: "table_x9gdrb",           // ID stable généré
  html: "<table>...</table>",   // HTML complet de la table
  type: "CIA",                  // Type de table
  timestamp: 1732617600000,     // Timestamp de création
  metadata: {
    chatId: "chat_123",         // ID du chat
    messageId: "msg_456",       // ID du message
    cellCount: 20,              // Nombre de cellules
    hasConsolidation: false     // A une consolidation ?
  }
}
```

---

### 2. États des Checkboxes dans LocalStorage

**Clé:** `checkbox_{tableId}`

**Structure:**
```javascript
[
  {
    index: 0,                   // Index de la checkbox
    checked: true,              // État coché/décoché
    rowIndex: 1,                // Index de la ligne
    cellIndex: 0                // Index de la cellule
  },
  {
    index: 1,
    checked: false,
    rowIndex: 2,
    cellIndex: 0
  }
  // ... autres checkboxes
]
```

---

## 🔐 Génération d'ID Stable

### Algorithme

```javascript
function generateStableTableId(tableElement) {
  // 1. Extraire le contenu de la première cellule
  const firstCell = tableElement.querySelector('td, th');
  const content = firstCell?.textContent?.trim() || '';
  
  // 2. Générer un hash simple
  const hash = simpleHash(content);
  
  // 3. Retourner l'ID
  return `table_${hash}`;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
```

**Exemple:**
```
Contenu: "Option"
Hash: 1234567890
ID: "table_kf12xy"
```

---

## ⚡ Optimisations de Performance

### 1. Debouncing

**Problème:** Sauvegarder à chaque changement = trop de writes

**Solution:**
```javascript
let saveTimeout;
function scheduleSave(tableId) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTableToStorage(tableId);
  }, 500); // Attendre 500ms d'inactivité
}
```

**Résultat:** 
- 10 changements en 2 secondes = 1 seule sauvegarde
- Réduction de 90% des writes

---

### 2. Lazy Loading des Tables

**Problème:** Charger 60 tables d'un coup = lent

**Solution:**
```javascript
async function restoreAllTables() {
  const tables = await getAllTablesFromStorage();
  
  // Restaurer par batch de 10
  for (let i = 0; i < tables.length; i += 10) {
    const batch = tables.slice(i, i + 10);
    await Promise.all(batch.map(t => restoreTable(t)));
    
    // Pause pour ne pas bloquer l'UI
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
```

---

### 3. Compression des Données

**Optionnel - Pour réduire l'utilisation du LocalStorage:**

```javascript
function compressTableData(tableData) {
  // Supprimer les espaces inutiles
  tableData.html = tableData.html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><');
  
  return tableData;
}
```

---

## 🔒 Gestion des Erreurs

### 1. LocalStorage Plein

```javascript
function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('❌ LocalStorage plein');
      
      // Nettoyer les anciennes tables
      cleanOldTables();
      
      // Réessayer
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e2) {
        console.error('❌ Impossible de sauvegarder même après nettoyage');
      }
    }
  }
}

function cleanOldTables() {
  const tables = Object.keys(localStorage)
    .filter(k => k.startsWith('claraverse_table_'))
    .map(k => ({
      key: k,
      data: JSON.parse(localStorage.getItem(k))
    }))
    .sort((a, b) => a.data.timestamp - b.data.timestamp);
  
  // Supprimer les 20 plus anciennes
  tables.slice(0, 20).forEach(t => {
    localStorage.removeItem(t.key);
  });
}
```

---

### 2. Données Corrompues

```javascript
function safeGetFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (e) {
    console.error(`❌ Données corrompues pour ${key}`, e);
    
    // Supprimer les données corrompues
    localStorage.removeItem(key);
    
    return null;
  }
}
```

---

## 🧪 Tests et Validation

### 1. Test de Persistance

```javascript
// Test automatique
async function testPersistence() {
  console.log('🧪 Test de persistance...');
  
  // 1. Créer une table de test
  const testTable = {
    id: 'test_table_123',
    html: '<table><tr><td>Test</td></tr></table>',
    type: 'CIA',
    timestamp: Date.now()
  };
  
  // 2. Sauvegarder
  await saveTableToStorage(testTable.id, testTable);
  
  // 3. Récupérer
  const retrieved = await getTableFromStorage(testTable.id);
  
  // 4. Vérifier
  if (JSON.stringify(testTable) === JSON.stringify(retrieved)) {
    console.log('✅ Test de persistance réussi');
  } else {
    console.error('❌ Test de persistance échoué');
  }
  
  // 5. Nettoyer
  localStorage.removeItem(`claraverse_table_${testTable.id}`);
}
```

---

### 2. Test de Restauration

```javascript
async function testRestoration() {
  console.log('🧪 Test de restauration...');
  
  const before = document.querySelectorAll('table').length;
  
  await restoreAllTables();
  
  const after = document.querySelectorAll('table').length;
  
  console.log(`📊 Tables avant: ${before}, après: ${after}`);
  
  if (after > before) {
    console.log('✅ Test de restauration réussi');
  } else {
    console.error('❌ Test de restauration échoué');
  }
}
```

---

## 📈 Métriques et Monitoring

### 1. Métriques Clés

```javascript
function getSystemMetrics() {
  return {
    tables: {
      total: Object.keys(localStorage)
        .filter(k => k.startsWith('claraverse_table_')).length,
      cia: 0, // À calculer
      consolidation: 0 // À calculer
    },
    checkboxes: {
      total: Object.keys(localStorage)
        .filter(k => k.startsWith('checkbox_')).length,
      checked: 0, // À calculer
      unchecked: 0 // À calculer
    },
    storage: {
      used: new Blob(Object.values(localStorage)).size,
      available: 5 * 1024 * 1024, // ~5MB (estimation)
      percentage: 0 // À calculer
    },
    performance: {
      lastSaveTime: 0,
      lastRestoreTime: 0,
      averageSaveTime: 0
    }
  };
}
```

---

### 2. Logging Structuré

```javascript
const Logger = {
  info: (msg, data) => console.log(`ℹ️ [CIA] ${msg}`, data),
  success: (msg, data) => console.log(`✅ [CIA] ${msg}`, data),
  warning: (msg, data) => console.warn(`⚠️ [CIA] ${msg}`, data),
  error: (msg, data) => console.error(`❌ [CIA] ${msg}`, data),
  debug: (msg, data) => console.debug(`🔍 [CIA] ${msg}`, data)
};

// Utilisation
Logger.success('Table sauvegardée', { tableId: 'table_123' });
```

---

## 🔄 Cycle de Vie d'une Table

```
1. CRÉATION
   ├── Table générée par Flowise
   ├── Détection par conso.js
   └── Génération d'un ID stable

2. ENRICHISSEMENT
   ├── Ajout des checkboxes
   ├── Ajout des listeners
   └── Ajout des data-attributes

3. SAUVEGARDE
   ├── Extraction du HTML
   ├── Extraction des métadonnées
   ├── Stockage dans LocalStorage
   └── Sauvegarde des états checkboxes

4. RESTAURATION
   ├── Récupération depuis LocalStorage
   ├── Injection dans le DOM
   ├── Restauration des checkboxes
   └── Restauration des états

5. MISE À JOUR
   ├── Détection des changements
   ├── Debouncing (500ms)
   ├── Sauvegarde incrémentale
   └── Mise à jour du timestamp

6. SUPPRESSION (optionnel)
   ├── Nettoyage automatique (anciennes tables)
   ├── Suppression manuelle
   └── Libération de l'espace
```

---

## 🎯 Points d'Extension Futurs

### 1. Synchronisation Cloud

```javascript
// Exemple d'architecture
class CloudSync {
  async syncToCloud(tableData) {
    // Upload vers un service cloud
    await fetch('/api/tables', {
      method: 'POST',
      body: JSON.stringify(tableData)
    });
  }
  
  async syncFromCloud() {
    // Download depuis le cloud
    const response = await fetch('/api/tables');
    return await response.json();
  }
}
```

---

### 2. Export/Import

```javascript
function exportAllTables() {
  const tables = Object.keys(localStorage)
    .filter(k => k.startsWith('claraverse_table_'))
    .map(k => JSON.parse(localStorage.getItem(k)));
  
  const blob = new Blob([JSON.stringify(tables, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cia_tables_${Date.now()}.json`;
  a.click();
}

function importTables(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const tables = JSON.parse(e.target.result);
    tables.forEach(table => {
      saveTableToStorage(table.id, table);
    });
  };
  reader.readAsText(file);
}
```

---

### 3. Versioning des Tables

```javascript
const tableData = {
  id: 'table_123',
  version: 2, // Version du schéma
  html: '...',
  metadata: {
    // ...
  },
  history: [
    {
      version: 1,
      timestamp: 1732617600000,
      changes: ['Ajout checkboxes']
    },
    {
      version: 2,
      timestamp: 1732617700000,
      changes: ['Modification structure']
    }
  ]
};
```

---

## 📚 Références Techniques

### APIs Utilisées

- **LocalStorage API**: Persistance côté client
- **DOM API**: Manipulation des tables
- **Event API**: Gestion des interactions
- **Blob API**: Calcul de taille des données

### Limites Techniques

- **LocalStorage**: ~5-10 MB selon le navigateur
- **Nombre de tables**: Recommandé < 100
- **Taille par table**: Recommandé < 50 KB

---

**Document créé le:** 26 novembre 2025  
**Version:** 1.0 - Architecture Technique Complète
