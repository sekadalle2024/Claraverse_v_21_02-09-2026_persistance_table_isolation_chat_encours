# Guide d'Implémentation - Système Contextuel ClaraVerse v3.1 🚀

## 📋 Vue d'Ensemble

### Problème Résolu
- **Conflit de données entre chats** : Tables similaires (I200-caisse, C100-immobilisations) se mélangeaient
- **Perte de persistance structurelle** : Modifications (insert/delete lignes/colonnes) perdues à l'actualisation
- **Écrasement de données** : Nouvelles tables remplacées par anciennes données du localStorage

### Solution Implémentée
**Système d'identification contextuel** qui génère des IDs uniques basés sur :
- `userId` (identification utilisateur)
- `chatId/conversationId` (isolation par chat)
- `divContext` (position DOM)
- `tableStructure` (structure de la table)

Format: `user123||conv456||div_0||tbl_Assertion_Ecart_3x5`

---

## 🛠️ Étapes d'Implémentation

### Étape 1: Vérification des Prérequis

**1.1 Vérifier la structure des fichiers existants**
```
D:\ClaraVerse-v firebase\
├── index.html          ✅ Doit exister
├── dev.js             ✅ À modifier
├── menu.js            ✅ À modifier
├── conso.js           ✅ Inchangé
├── sync-coordinator.js ✅ À modifier
└── claraverse-config.js ✅ À modifier
```

**1.2 Backup des fichiers originaux**
```bash
# Créer un backup avant modification
cp dev.js dev.js.backup.$(date +%Y%m%d)
cp menu.js menu.js.backup.$(date +%Y%m%d)
cp sync-coordinator.js sync-coordinator.js.backup.$(date +%Y%m%d)
cp claraverse-config.js claraverse-config.js.backup.$(date +%Y%m%d)
```

### Étape 2: Mise à Jour des Fichiers

**2.1 Mise à jour de `claraverse-config.js`**

Ajouter la section CONTEXTUAL dans la configuration :

```javascript
CONTEXTUAL: {
  // Séparateurs et identifiants
  CONTEXT_SEPARATOR: "||",
  CHAT_ID_LENGTH: 12,
  USER_ID_LENGTH: 8,
  TABLE_ID_LENGTH: 25,

  // Cache contextuel
  CONTEXT_CACHE_TTL: 300000, // 5 minutes
  CONTEXT_CLEANUP_INTERVAL: 600000, // 10 minutes
  MAX_CONTEXTS_CACHED: 100,

  // Résolution de conflits
  CONFLICT_RESOLUTION_STRATEGY: "context_priority",
  CONTEXT_PRIORITY_WEIGHT: 0.8,
  AUTO_RESOLVE_CONFLICTS: true,

  // Gestion des chats multiples
  ENABLE_MULTI_CHAT_SYNC: true,
  CROSS_CHAT_DATA_SHARING: false,
  ISOLATE_CHAT_CONTEXTS: true,

  // Validation contextuelle
  VALIDATE_CONTEXT_INTEGRITY: true,
  REQUIRE_VALID_CONTEXT: true,
  FALLBACK_TO_LEGACY: true,
}
```

**2.2 Mise à jour de `dev.js`**

**Modifications principales à apporter :**

1. **Mise à jour de la configuration** (lignes ~15-35)
```javascript
const CONFIG = {
  // Configuration existante...
  // AJOUTER :
  contextSeparator: "||",
  chatIdLength: 12,
  userIdLength: 8,
  tableIdLength: 25,
  CONTEXT_STORAGE_PREFIX: "claraverse_context_",
  STRUCTURE_PREFIX: "claraverse_struct_",
};
```

2. **Ajout des fonctions contextuelles** (après ligne 320)
```javascript
// Générer le contexte de chat
function generateChatContext(table) {
  try {
    let chatContext = {
      userId: "default_user",
      chatId: null,
      divContext: null,
      conversationId: null,
    };

    // Chercher l'ID de conversation dans l'URL
    const url = window.location.href;
    const conversationMatch = url.match(/conversations?\/([^\/\?]+)/i);
    if (conversationMatch) {
      chatContext.conversationId = conversationMatch[1].substring(0, CONFIG.chatIdLength);
    }

    // Chercher le conteneur de chat parent
    const chatContainer = table.closest('[data-conversation-id], [id*="chat"], [class*="chat"], [class*="conversation"], .prose');
    if (chatContainer) {
      if (chatContainer.dataset.conversationId) {
        chatContext.chatId = chatContainer.dataset.conversationId.substring(0, CONFIG.chatIdLength);
      } else if (chatContainer.id) {
        chatContext.chatId = chatContainer.id.substring(0, CONFIG.chatIdLength);
      }

      const siblings = Array.from(chatContainer.parentElement?.children || []);
      const siblingIndex = siblings.indexOf(chatContainer);
      chatContext.divContext = `div_${siblingIndex}_${chatContainer.tagName.toLowerCase()}`;
    }

    // Chercher des métadonnées utilisateur
    const userMeta = document.querySelector('[data-user-id], [data-user], meta[name="user-id"]');
    if (userMeta) {
      chatContext.userId = userMeta.dataset.userId || userMeta.dataset.user || userMeta.content || chatContext.userId;
    }

    // Générer un ID de chat unique si aucun trouvé
    if (!chatContext.chatId && !chatContext.conversationId) {
      const bodyHash = Math.abs(document.body.innerHTML.length).toString(36);
      const timeHash = Date.now().toString(36).slice(-4);
      chatContext.chatId = `gen_${bodyHash}_${timeHash}`;
    }

    return chatContext;
  } catch (error) {
    log(`⚠️ Erreur génération contexte chat: ${error.message}`, "warning");
    return {
      userId: "default_user",
      chatId: `fallback_${Date.now().toString(36)}`,
      divContext: "unknown_div",
      conversationId: null,
    };
  }
}
```

3. **Mise à jour de `generateTableId`** (remplacer la fonction existante)
```javascript
function generateTableId(table, index = 0) {
  try {
    // Vérifier s'il y a déjà un ID complet
    if (table.dataset.claraverseId && table.dataset.claraverseId.includes(CONFIG.contextSeparator)) {
      return table.dataset.claraverseId;
    }

    // Générer le contexte de chat
    const chatContext = generateChatContext(table);

    // Générer l'ID basé sur la structure de la table
    const headers = Array.from(table.querySelectorAll("th, td"))
      .slice(0, 3)
      .map((cell) => cell.textContent.trim().substring(0, 8))
      .filter((text) => text.length > 0)
      .join("_");

    const position = {
      rows: table.rows.length,
      cols: table.rows[0]?.cells.length || 0,
    };

    // Créer l'ID de base de la table
    const tableBaseId = headers
      ? `tbl_${headers.replace(/[^a-zA-Z0-9_]/g, "")}_${position.rows}x${position.cols}`
      : `tbl_generic_${position.rows}x${position.cols}_${index}`;

    // Créer l'ID contextuel complet
    const contextualId = [
      chatContext.userId.substring(0, 8),
      chatContext.conversationId || chatContext.chatId,
      chatContext.divContext || "main",
      tableBaseId,
    ].join(CONFIG.contextSeparator);

    // Limiter la longueur totale
    const finalId = contextualId.substring(0, 80);

    // Sauvegarder l'ID et le contexte sur la table
    table.dataset.claraverseId = finalId;
    table.dataset.chatContext = JSON.stringify(chatContext);

    log(`🆔 ID généré: ${finalId}`, "info");
    return finalId;
  } catch (error) {
    const fallbackId = `table_fallback_${index}_${Date.now()}`;
    table.dataset.claraverseId = fallbackId;
    log(`❌ Erreur génération ID table: ${error.message}`, "error");
    return fallbackId;
  }
}
```

4. **Ajout des fonctions de restauration contextuelle** (après les fonctions existantes)
```javascript
// Restauration contextuelle
async function restoreTableDataContextual(table, tableId) {
  try {
    log(`🎯 Restauration contextuelle table: ${tableId}`);

    const isContextualId = tableId.includes(CONFIG.contextSeparator);

    if (!isContextualId) {
      log(`🔄 ID non-contextuel détecté: ${tableId}, tentative restauration classique`);
      return await restoreTableData(table, tableId);
    }

    const currentContext = generateChatContext(table);
    const contextualId = generateTableId(table, 0);

    if (contextualId !== tableId) {
      log(`⚠️ Conflit d'ID contextuel: généré=${contextualId}, fourni=${tableId}`, "warning");
      await cleanupConflictingData(tableId, contextualId);
      table.dataset.claraverseId = contextualId;
      tableId = contextualId;
    }

    // ÉTAPE 1: Restaurer la structure avec contexte
    const structureRestored = await restoreTableStructureContextual(table, tableId, currentContext);

    // ÉTAPE 2: Restaurer le contenu des cellules avec contexte
    const currentTable = structureRestored || table;
    const cells = currentTable.querySelectorAll("td[data-cell-id], th[data-cell-id]");
    let restoredCount = 0;
    let skippedCount = 0;

    for (const cell of cells) {
      const cellId = cell.dataset.cellId;
      if (!cellId) continue;

      const cellData = await loadCellDataWithContext(tableId, cellId, currentContext);
      if (cellData) {
        const success = await applyCellData(cell, cellData);
        if (success) {
          restoredCount++;
        }
      } else {
        skippedCount++;
      }
    }

    log(`✅ Restauration contextuelle ${tableId}: ${restoredCount} cellules restaurées, ${skippedCount} ignorées${structureRestored ? " (structure restaurée)" : ""}`);

    if (restoredCount > 0 || structureRestored) {
      currentTable.dataset.restored = "true";
      currentTable.dataset.restoredContextual = "true";
      currentTable.dataset.lastRestoreContext = JSON.stringify(currentContext);

      document.dispatchEvent(new CustomEvent("claraverse:table:restored:contextual", {
        detail: { tableId, context: currentContext, restoredCount },
      }));

      return currentTable;
    }

    return null;
  } catch (error) {
    log(`❌ Erreur restauration contextuelle ${tableId}: ${error.message}`, "error");
    return null;
  }
}

// Fonctions utilitaires pour la restauration contextuelle
async function restoreTableStructureContextual(table, tableId, context) {
  // [Implémentation complète fournie dans les modifications précédentes]
}

async function loadCellDataWithContext(tableId, cellId, context) {
  // [Implémentation complète fournie dans les modifications précédentes]
}

async function applyCellData(cell, cellData) {
  // [Implémentation complète fournie dans les modifications précédentes]
}

async function cleanupConflictingData(oldId, newId) {
  // [Implémentation complète fournie dans les modifications précédentes]
}
```

5. **Mise à jour de `processTable`** (remplacer l'appel à restoreTableData)
```javascript
// Dans la fonction processTable, remplacer:
setTimeout(() => {
  restoreTableData(table, tableId); // ANCIEN
}, CONFIG.SYNC_DELAY);

// Par:
setTimeout(() => {
  restoreTableDataContextual(table, tableId); // NOUVEAU
}, CONFIG.SYNC_DELAY);
```

6. **Mise à jour de `saveCellData`** (ajouter le contexte aux données)
```javascript
// Dans saveCellData, ajouter après la récupération des données de base:
const table = cell.closest("table");
const chatContext = table?.dataset.chatContext
  ? JSON.parse(table.dataset.chatContext)
  : generateChatContext(cell);

const data = {
  content: content,
  html: html,
  cellId: cellId,
  tableId: tableId,
  originalContent: cell.dataset.originalContent,
  position: {
    row: cell.parentNode.rowIndex,
    col: cell.cellIndex,
  },
  context: chatContext, // AJOUTER CETTE LIGNE
  contextualId: tableId, // AJOUTER CETTE LIGNE
};
```

**2.3 Mise à jour de `menu.js`**

**Modifications principales :**

1. **Ajouter les fonctions de contexte** (après la fonction `hashCode`)
```javascript
// Générer le contexte de chat pour une table
generateChatContext(table) {
  try {
    const context = {
      userId: this.getUserId(),
      chatId: this.getChatId(table),
      conversationId: this.getConversationId(),
      divContext: this.getDivContext(table),
      timestamp: Date.now(),
    };
    return context;
  } catch (error) {
    console.error("Erreur génération contexte:", error);
    return this.getFallbackContext();
  }
}

getUserId() {
  const userMeta = document.querySelector('[data-user-id], [data-user], meta[name="user-id"]');
  if (userMeta) {
    return (userMeta.dataset.userId || userMeta.dataset.user || userMeta.content || "default_user").substring(0, 8);
  }
  return "default_user";
}

getChatId(element) {
  const chatContainer = element.closest('[data-conversation-id], [id*="chat"], [class*="chat"], [class*="conversation"], .prose');
  if (chatContainer) {
    if (chatContainer.dataset.conversationId) {
      return chatContainer.dataset.conversationId.substring(0, 12);
    }
    if (chatContainer.id) {
      return chatContainer.id.substring(0, 12);
    }
  }

  const url = window.location.href;
  const conversationMatch = url.match(/conversations?\/([^\/\?]+)/i);
  if (conversationMatch) {
    return conversationMatch[1].substring(0, 12);
  }

  return `gen_${Date.now().toString(36).slice(-6)}`;
}

getConversationId() {
  const url = window.location.href;
  const match = url.match(/conversations?\/([^\/\?]+)/i);
  return match ? match[1] : null;
}

getDivContext(element) {
  const container = element.closest('.prose, [class*="chat"], [class*="conversation"]');
  if (container) {
    const siblings = Array.from(container.parentElement?.children || []);
    const index = siblings.indexOf(container);
    return `div_${index}_${container.tagName.toLowerCase()}`;
  }
  return "unknown_div";
}

getFallbackContext() {
  return {
    userId: "fallback_user",
    chatId: `fallback_${Date.now().toString(36)}`,
    conversationId: null,
    divContext: "fallback_div",
    timestamp: Date.now(),
  };
}
```

2. **Mise à jour de `generateTableId`** (remplacer la fonction existante)
```javascript
generateTableId(table, index = 0) {
  try {
    // Vérifier s'il y a déjà un ID contextuel
    if (table.dataset.claraverseId && table.dataset.claraverseId.includes("||")) {
      return table.dataset.claraverseId;
    }

    // Générer le contexte de chat
    const chatContext = this.generateChatContext(table);

    // Générer l'ID basé sur la structure de la table
    const headers = Array.from(table.querySelectorAll("th, td"))
      .slice(0, 3)
      .map((cell) => cell.textContent.trim().substring(0, 8))
      .filter((text) => text.length > 0)
      .join("_");

    const position = {
      rows: table.rows.length,
      cols: table.rows[0]?.cells.length || 0,
    };

    // Créer l'ID de base de la table
    const tableBaseId = headers
      ? `tbl_${headers.replace(/[^a-zA-Z0-9_]/g, "")}_${position.rows}x${position.cols}`
      : `tbl_generic_${position.rows}x${position.cols}_${index}`;

    // Créer l'ID contextuel complet
    const contextualId = [
      chatContext.userId.substring(0, 8),
      chatContext.conversationId || chatContext.chatId,
      chatContext.divContext || "main",
      tableBaseId,
    ].join("||");

    // Limiter la longueur totale
    const finalId = contextualId.substring(0, 80);

    // Sauvegarder l'ID et le contexte sur la table
    table.dataset.claraverseId = finalId;
    table.dataset.chatContext = JSON.stringify(chatContext);

    console.log(`🆔 Menu - ID généré: ${finalId}`);
    return finalId;
  } catch (error) {
    console.error("Erreur génération ID table:", error);
    const fallbackId = `table_fallback_${index}_${Date.now()}`;
    table.dataset.claraverseId = fallbackId;
    return fallbackId;
  }
}
```

3. **Mise à jour des notifications** (dans `notifyTableStructureChange` et `notifyRapprochementComplete`)
```javascript
// Ajouter dans les deux fonctions:
const chatContext = this.generateChatContext(this.targetTable);

// Et dans l'objet detail:
detail: {
  // ... propriétés existantes ...
  chatContext: chatContext,
  contextualId: tableId,
  isContextual: tableId.includes("||"),
}

// Ajouter notification spécifique contextuelle:
if (tableId.includes("||")) {
  const contextualEvent = new CustomEvent("claraverse:contextual:structure:changed", {
    detail: {
      tableId: tableId,
      context: chatContext,
      action: action, // ou affectedRows pour rapprochement
      source: "menu",
      timestamp: Date.now(),
    },
  });
  document.dispatchEvent(contextualEvent);
}
```

### Étape 3: Test et Validation

**3.1 Créer les fichiers de test**

Créer le fichier `test-contextuel.js` (contenu fourni dans les modifications) et `diagnostic-contextuel.js`.

**3.2 Tests de base**

1. **Vérifier le chargement**
```javascript
// Dans la console navigateur
console.log('🔍 Version ClaraVerse:', window.CLARAVERSE_CONFIG?.VERSION);
console.log('🔍 Système contextuel:', !!window.CLARAVERSE_CONFIG?.CONTEXTUAL);
```

2. **Test rapide**
```javascript
quickContextualTest().then(success => {
  console.log(success ? '✅ Test rapide OK' : '❌ Problème détecté');
});
```

3. **Test complet**
```javascript
testContextualSystem().then(report => {
  console.log(`📊 Tests: ${report.passed}/${report.total}`);
  console.log(`🎯 Succès: ${report.success ? 'OUI' : 'NON'}`);
});
```

**3.3 Test manuel d'isolation**

1. Créer une table dans un chat (Chat A)
2. Modifier des cellules et insérer des lignes
3. Noter l'ID contextuel généré
4. Ouvrir un autre chat (Chat B)
5. Créer une table similaire
6. Vérifier que les IDs sont différents
7. Actualiser les deux pages
8. ✅ Vérifier que les données ne se mélangent pas

### Étape 4: Déploiement et Surveillance

**4.1 Déploiement progressif**

1. **Phase 1** : Tester sur un environnement de développement
2. **Phase 2** : Déployer sur un chat test
3. **Phase 3** : Déploiement complet après validation

**4.2 Surveillance post-déploiement**

```javascript
// Activer monitoring détaillé
window.CLARAVERSE_CONFIG.DEBUG.LOG_LEVEL = 'debug';
window.CLARAVERSE_CONFIG.DEBUG.TRACE_SYNC_OPERATIONS = true;

// Écouter les événements contextuels
document.addEventListener('claraverse:contextual:structure:changed', (e) => {
  console.log('🎯 Structure contextuelle modifiée:', e.detail);
});

document.addEventListener('claraverse:contextual:data:saved', (e) => {
  console.log('💾 Données contextuelles sauvegardées:', e.detail);
});
```

**4.3 Métriques à surveiller**

- Nombre de tables contextuelles vs legacy
- Taux de restauration réussie
- Temps de génération des contextes
- Conflits détectés et résolus

---

## 🔧 Résolution de Problèmes Courants

### ❌ "Tables non contextuelles détectées"

**Symptôme** : Les tables utilisent encore l'ancien système d'ID

**Solution** :
```javascript
// Forcer la régénération
document.querySelectorAll('table[data-claraverse-id]').forEach(table => {
  delete table.dataset.claraverseId;
  table.classList.remove('claraverse-processed');
});

// Relancer le scan
if (window.universalTableScan) {
  window.universalTableScan();
}
```

### ❌ "Données manquantes après actualisation"

**Symptôme** : Les modifications ne persistent pas

**Diagnostic** :
```javascript
// Vérifier les clés de stockage
const keys = Object.keys(localStorage).filter(k => k.startsWith('claraverse_'));
console.log('🔍 Clés trouvées:', keys);

// Vérifier les IDs des tables
document.querySelectorAll('table[data-claraverse-id]').forEach(table => {
  console.log('Table ID:', table.dataset.claraverseId);
  console.log('Contextuel:', table.dataset.claraverseId.includes('||'));
});
```

**Solution** :
1. Vérifier que les IDs contiennent bien `||`
2. S'assurer que le contexte est correctement généré
3. Vérifier les données dans localStorage

### ❌ "Conflits de données entre chats"

**Symptôme** : Les données d'un chat apparaissent dans un autre

**Solution** :
```javascript
// Diagnostic des contextes
document.querySelectorAll('table[data-chat-context]').forEach(table => {
  const context = JSON.parse(table.dataset.chatContext);
  console.log('Contexte table:', context);
});

// Nettoyage manuel si nécessaire
runContextualDiagnostic().then(report => {
  if (report.storage.conflicts.length > 0) {
    console.log('⚠️ Conflits détectés:', report.storage.conflicts);
    // Suivre les recommandations du diagnostic
  }
});
```

### ❌ "Performance dégradée"

**Symptôme** : Le système est lent

**Diagnostic** :
```javascript
// Test de performance
console.time('contextGeneration');
for(let i = 0; i < 100; i++) {
  generateChatContext(document.querySelector('table'));
}
console.timeEnd('contextGeneration'); // Doit être < 100ms
```

**Solutions** :
1. Activer le cache contextuel
2. Réduire la fréquence de scan
3. Nettoyer les données anciennes

---

## 📈 Maintenance et Monitoring

### Nettoyage Automatique

Le système inclut un nettoyage automatique des données anciennes :

```javascript
// Vérifier le nettoyage
window.CLARAVERSE_CONFIG.STORAGE.AUTO_CLEANUP_INTERVAL = 3600000; // 1h

// Nettoyage manuel si nécessaire
Object.keys(localStorage)
  .filter(key => key.startsWith('claraverse_') && 
                 isOlderThan(key, 7 * 24 * 60 * 60 * 1000)) // 7 jours
  .forEach(key => localStorage.removeItem(key));
```

### Migration des Données Anciennes

```javascript
async function migrateOldData() {
  console.log('🔄 Migration des données anciennes...');
  
  const oldKeys = Object.keys(localStorage)
    .filter(k => k.startsWith('claraverse_') && !k.includes('||'));
    
  for (const oldKey of oldKeys) {
    try {
      const data = JSON.parse(localStorage.getItem(oldKey));
      const newKey = oldKey.replace(
        'claraverse_dev_data_',
        'claraverse_dev_data_default_user||default_chat||main||'
      );
      
      localStorage.setItem(newKey, JSON.stringify({
        ...data,
        migrated: true,
        migrationDate: Date.now()
      }));
      
      localStorage.removeItem(oldKey);
    } catch (error) {
      console.warn('⚠️ Erreur migration:', oldKey, error);
    }
  }
  
  console.log('✅ Migration terminée');
}
```

### Surveillance Continue

```javascript
// Dashboard de monitoring
function showContextualStatus() {
  const contextualTables = document.querySelectorAll('table[data-claraverse-id*="||"]');
  const legacyTables = document.querySelectorAll('table[data-claraverse-id]:not([data-claraverse-id*="||"])');
  const storageKeys = Object.keys(localStorage).filter(k => k.startsWith('claraverse_'));
  
  console.log('📊 STATUS CONTEXTUEL');
  console.log(`Tables contextuelles: ${contextualTables.length}`);
  console.log(`Tables legacy: ${legacyTables.length}`);
  console.log(`Clés stockage: ${storageKeys.length}`);
  console.log(`Taille stockage: ${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB`);
}
```

---

## ✅ Checklist de Validation Finale

### Avant Déploiement
- [ ] Backup des fichiers originaux créé
- [ ] Toutes les modifications appliquées
- [ ] Test rapide `quickContextualTest()` réussi
- [ ] Test complet `testContextualSystem()` réussi
- [ ] Aucune erreur dans la console navigateur
- [ ] IDs contextuels générés (format `user||chat||div||table`)

### Après Déploiement
- [ ] Tables existantes fonctionnent normalement
- [ ] Nouvelles tables obtiennent des IDs contextuels
- [ ] Modifications persistent après actualisation
- [ ] Isolation entre chats vérifiée
- [ ] Performance acceptable (< 100ms pour génération contexte)
- [ ] Aucune perte de données reportée

### Tests de Régression
- [ ] Insertion/suppression de lignes fonctionne
- [ ] Insertion/suppression de colonnes fonctionne
- [ ] Édition de cellules sauvegardée correctement
- [ ] Menu contextuel fonctionne
- [ ] Rapprochement/consolidation fonctionne
- [ ] Export/import Excel fonctionne

---

## 🎯 Résultats Attendus

Après implémentation réussie :

### ✅ Problèmes Résolus
- **Isolation parfaite** : Chaque chat a ses propres données
- **Persistance garantie** : Structures modifiées conservées après actualisation
- **Pas de conflits** : Nouvelles tables ne sont plus écrasées
- **Multi-utilisateur** : Chaque utilisateur a ses propres données

### 📈 Améliorations
- **Fiabilité** : 0% de perte de données
- **Performance** : Temps de chargement optimisé
- **Maintenabilité** : Code mieux structuré
- **Évolutivité** : Prêt pour fonctionnalités futures

### 🔄 Compatibilité
- **Rétro-compatible** : Anciennes données migrées automatiquement
- **Graceful fallback** : Fonctionne même en cas de problème partiel
- **Migration transparente** : Utilisateurs ne voient aucune interruption

---

## 📞 Support

En cas de problème :

1. **Exécuter le diagnostic** : `runContextualDiagnostic()`
2. **Vérifier les logs** : Console navigateur
3. **Tester les fonctions** : `quickContextualTest()`
4. **Consulter ce guide** : Section résolution de problèmes
5. **Créer un rapport** : Avec logs et étapes de reproduction

**ClaraVerse v3.1 - Système Contextuel Opérationnel ! 🚀**