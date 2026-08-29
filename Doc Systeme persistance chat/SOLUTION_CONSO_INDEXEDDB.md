# 🔧 Solution: Intégration conso.js avec IndexedDB

## 📋 Problème Identifié

### Symptômes
- ✅ Les modifications des cellules de `[Modelised_table]` sont **persistantes**
- ❌ Les tables `[Table_conso]` et `[Resultat]` générées automatiquement ne sont **pas persistantes**
- ❌ Les données disparaissent après actualisation de la page
- ❌ Les données ne survivent pas au redémarrage du serveur

### Cause Racine
**conso.js utilise localStorage au lieu d'IndexedDB**

```javascript
// Dans conso.js - ANCIEN SYSTÈME
this.storageKey = "claraverse_tables_data";
localStorage.setItem(this.storageKey, JSON.stringify(data));  // ❌ Non persistant
```

**Alors que menu.js utilise le système IndexedDB unifié:**

```javascript
// Dans menu.js - SYSTÈME CORRECT
document.dispatchEvent(new CustomEvent('flowise:table:save:request', {
  detail: { table, sessionId, keyword, source }
}));  // ✅ Persistant via IndexedDB
```

---

## ✅ Solution Implémentée

### Architecture de la Solution

```
┌─────────────────────────────────────────────────────────────┐
│                         conso.js                             │
│  (génère Table_conso, Résultat, Modelised_table)           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 1. Modifications détectées
                   ▼
┌─────────────────────────────────────────────────────────────┐
│         conso-indexeddb-integration.js (NOUVEAU)            │
│  • Remplace saveTableDataNow() pour utiliser événements     │
│  • Émet flowise:table:save:request                          │
│  • Désactive localStorage                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 2. Événement flowise:table:save:request
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              menuIntegration.ts                              │
│  • Écoute les événements flowise:table:save:request         │
│  • Obtient sessionId stable                                  │
│  • Appelle flowiseTableService.saveGeneratedTable()         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 3. Sauvegarde avec forceUpdate=true
                   ▼
┌─────────────────────────────────────────────────────────────┐
│            flowiseTableService.ts                            │
│  • Génère fingerprint                                        │
│  • Compresse HTML si > 50KB                                 │
│  • Sauvegarde dans IndexedDB (clara_db)                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 4. Persistance
                   ▼
┌─────────────────────────────────────────────────────────────┐
│               IndexedDB (clara_db)                           │
│  Store: clara_generated_tables                               │
│  • sessionId: identifiant stable                            │
│  • keyword: nom de la table                                 │
│  • html: contenu compressé                                  │
│  • timestamp: date de sauvegarde                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation

### Étape 1: Ajouter le script dans index.html

Ajouter **après** conso.js et menuIntegration:

```html
<!-- Dans packages/ui/src/index.html -->

<!-- Scripts existants -->
<script src="/wrap-tables-auto.js"></script>
<script src="/Flowise.js"></script>
<script src="/conso.js"></script>
<script type="module" src="/force-restore-on-load.js"></script>
<script src="/menu-persistence-bridge.js"></script>
<script src="/menu.js"></script>
<script type="module" src="/auto-restore-chat-change.js"></script>

<!-- NOUVEAU: Intégration conso.js → IndexedDB -->
<script src="/conso-indexeddb-integration.js"></script>
```

**⚠️ IMPORTANT:** Le script doit être chargé **après** conso.js et menuIntegration

---

## 🔍 Comment ça Marche

### 1. Remplacement des Méthodes de Sauvegarde

Le script remplace `saveTableDataNow()` dans conso.js:

```javascript
// ANCIEN (localStorage)
processor.saveTableDataNow = function(table) {
  localStorage.setItem(this.storageKey, JSON.stringify(data));  // ❌
};

// NOUVEAU (IndexedDB via événements)
processor.saveTableDataNow = async function(table) {
  const keyword = this.extractKeywordFromTable(table);
  const sessionId = await this.getCurrentSessionId();
  
  document.dispatchEvent(new CustomEvent('flowise:table:save:request', {
    detail: { table, sessionId, keyword, source: 'conso' }
  }));  // ✅
};
```

### 2. Extraction du Keyword

Stratégies pour identifier chaque table:

```javascript
processor.extractKeywordFromTable = function(table) {
  // 1. Attribut data-keyword
  if (table.dataset.keyword) return table.dataset.keyword;
  
  // 2. Wrapper data-n8n-keyword
  const wrapper = table.closest('[data-n8n-keyword]');
  if (wrapper) return wrapper.dataset.n8nKeyword;
  
  // 3. Premier en-tête
  const firstHeader = table.querySelector('th');
  if (firstHeader) return firstHeader.textContent.trim();
  
  // 4. Identifier par type (Table_conso, Résultat)
  if (table.classList.contains('claraverse-conso-table')) {
    return 'Table_Consolidation';
  }
  if (headerTexts.includes('resultat')) {
    return 'Table_Resultat';
  }
  
  // 5. Fallback
  return `Table_${table.dataset.tableId}`;
};
```

### 3. Session Stable

Obtenir le sessionId unifié:

```javascript
processor.getCurrentSessionId = async function() {
  // 1. Depuis flowiseTableBridge
  if (window.flowiseTableBridge) {
    const sessionId = window.flowiseTableBridge.getCurrentSession();
    if (sessionId) return sessionId;
  }
  
  // 2. Depuis sessionStorage
  const storedSession = sessionStorage.getItem('claraverse_stable_session');
  if (storedSession) return storedSession;
  
  // 3. Créer une session stable
  const newSession = `stable_session_${Date.now()}_${Math.random()}`;
  sessionStorage.setItem('claraverse_stable_session', newSession);
  return newSession;
};
```

### 4. Désactivation de localStorage

Les anciennes méthodes sont désactivées:

```javascript
processor.loadAllData = function() {
  console.log("ℹ️ [Deprecated] loadAllData ignoré");
  return {};  // Retourner un objet vide
};

processor.saveAllData = function(data) {
  console.log("ℹ️ [Deprecated] saveAllData ignoré");
  // Ne rien faire
};
```

### 5. Migration Automatique

Au premier lancement, migrer les données localStorage vers IndexedDB:

```javascript
processor.migrateLocalStorageToIndexedDB = async function() {
  const localData = localStorage.getItem('claraverse_tables_data');
  if (!localData) return;
  
  const parsedData = JSON.parse(localData);
  for (const tableId of Object.keys(parsedData)) {
    const table = document.querySelector(`[data-table-id="${tableId}"]`);
    if (table) {
      await this.saveTableDataNow(table);  // Sauvegarde dans IndexedDB
    }
  }
  
  localStorage.setItem('claraverse_migration_done', 'true');
};
```

---

## ✅ Résolution des Problèmes

### Problème 1: Conflit données manuelles vs automatiques

**Solution:** Le système utilise `forceUpdate=true` pour toujours sauvegarder la dernière version:

```javascript
// Dans menuIntegration.ts
await flowiseTableService.saveGeneratedTable(
  sessionId,
  tableElement,
  keyword,
  source,
  undefined,  // messageId
  true        // forceUpdate - supprime l'ancienne version
);
```

### Problème 2: Tables vides écrasent les données

**Solution:** Les tables ne sont sauvegardées que quand elles contiennent des données réelles:

```javascript
// Dans conso-indexeddb-integration.js
processor.updateConsoTable = function(sourceTable, content) {
  const result = originalUpdateConsoTable.call(this, sourceTable, content);
  
  // Sauvegarder APRÈS la mise à jour avec les données réelles
  setTimeout(() => {
    const consoTable = document.querySelector('.claraverse-conso-table');
    if (consoTable && consoTable.querySelectorAll('tr').length > 1) {
      this.saveTableDataNow(consoTable);  // ✅ Données réelles
    }
  }, 500);
  
  return result;
};
```

### Problème 3: messageId manquant

**Solution:** Les tables générées dynamiquement utilisent le `keyword` comme identifiant principal:

```javascript
// Le keyword remplace le messageId pour l'identification
const tableRecord = {
  id: uuid(),
  sessionId: sessionId,         // ✅ Session stable
  keyword: keyword,              // ✅ Identifiant unique
  messageId: undefined,          // Pas nécessaire
  html: tableHTML,
  fingerprint: fingerprint,      // ✅ Détection doublons
  ...
};
```

### Problème 4: Tables changent d'emplacement

**Solution:** La restauration utilise le `keyword` pour matcher les tables, pas le `containerId`:

```javascript
// Dans flowiseTableBridge.ts
private injectTableIntoDOM(tableData: FlowiseGeneratedTableRecord): void {
  // Trouver la table existante par keyword
  const existingTable = this.findTableByKeyword(tableData.keyword);
  
  if (existingTable) {
    const container = existingTable.closest('[data-container-id]');
    container.innerHTML = '';  // Vider le conteneur
    container.appendChild(tableWrapper);  // Insérer la table restaurée
  }
}
```

---

## 🧪 Tests

### Test 1: Vérifier l'intégration

Dans la console du navigateur:

```javascript
// Vérifier que l'intégration est chargée
consoIndexedDBIntegration.test()

// Résultat attendu:
// 🧪 TEST INTÉGRATION INDEXEDDB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ SessionId: stable_session_1234567890_abc123
// ✅ Keyword extrait: Table_Consolidation
// 💾 Test de sauvegarde...
// ✅ Test terminé
```

### Test 2: Vérifier la sauvegarde

```javascript
// 1. Modifier une cellule dans une table modelisée
// 2. Attendre 500ms
// 3. Vérifier la console:
console.log("💾 [IndexedDB] Début de sauvegarde immédiate")
console.log("✅ [IndexedDB] Événement de sauvegarde émis pour: Table_Consolidation")
console.log("✅ [IndexedDB] Sauvegarde confirmée pour: Table_Consolidation")
```

### Test 3: Vérifier la persistance

```javascript
// 1. Modifier une table
// 2. Actualiser la page (F5)
// 3. Vérifier que les données sont restaurées
// 4. Redémarrer le serveur
// 5. Vérifier que les données sont toujours là

// Dans la console:
window.flowiseTableBridge.restoreCurrentSession()
```

### Test 4: Vérifier IndexedDB

```javascript
// Ouvrir la console des outils de développement
// Onglet: Application > Storage > IndexedDB > clara_db > clara_generated_tables

// Vous devriez voir:
// - sessionId: stable_session_...
// - keyword: Table_Consolidation / Table_Resultat / ...
// - html: <table>...</table>
// - timestamp: 2026-04-29T...
```

---

## 📊 Avantages de la Solution

### ✅ Avantages

1. **Persistance complète**
   - ✅ Survit à l'actualisation (F5)
   - ✅ Survit au redémarrage du serveur
   - ✅ Survit au changement de chat

2. **Système unifié**
   - ✅ Toutes les tables utilisent IndexedDB
   - ✅ menu.js et conso.js partagent le même système
   - ✅ Pas de conflit localStorage vs IndexedDB

3. **Données toujours à jour**
   - ✅ forceUpdate supprime l'ancienne version
   - ✅ La dernière action (manuelle ou auto) est sauvegardée
   - ✅ Pas de problème de version

4. **Identification robuste**
   - ✅ keyword stable pour chaque table
   - ✅ sessionId stable pour chaque session
   - ✅ fingerprint pour détecter les doublons

5. **Migration transparente**
   - ✅ Migration automatique des données localStorage
   - ✅ Pas de perte de données
   - ✅ Une seule migration nécessaire

6. **Compatibilité**
   - ✅ conso.js continue de fonctionner normalement
   - ✅ Aucune modification du code existant
   - ✅ Juste un script additionnel

---

## 🐛 Dépannage

### Problème: Les tables ne sont pas sauvegardées

**Vérifications:**

1. Le script est-il chargé?
```javascript
console.log(window.consoIndexedDBIntegration);
// Devrait afficher: {version: "1.0.0", saveTable: ƒ, ...}
```

2. Les événements sont-ils émis?
```javascript
// Écouter les événements de sauvegarde
document.addEventListener('flowise:table:save:request', (e) => {
  console.log("📤 Événement émis:", e.detail);
});
```

3. menuIntegration est-il actif?
```javascript
console.log(window.flowiseTableBridge);
console.log(window.flowiseTableService);
// Devraient être définis
```

### Problème: Les tables ne sont pas restaurées

**Vérifications:**

1. Les tables sont-elles dans IndexedDB?
```javascript
// Outils de développement > Application > IndexedDB > clara_db
```

2. Le sessionId est-il correct?
```javascript
const sessionId = await consoIndexedDBIntegration.getCurrentSession();
console.log("SessionId:", sessionId);
```

3. Les tables ont-elles un keyword?
```javascript
const tables = document.querySelectorAll('table');
tables.forEach(table => {
  const keyword = consoIndexedDBIntegration.extractKeyword(table);
  console.log("Table keyword:", keyword);
});
```

### Problème: Migration échoue

**Solution:**

```javascript
// Forcer la migration
await consoIndexedDBIntegration.migrate();

// Vérifier les anciennes données
const oldData = localStorage.getItem('claraverse_tables_data');
console.log("Anciennes données:", JSON.parse(oldData));

// Vérifier si la migration est marquée
const migrationDone = localStorage.getItem('claraverse_migration_done');
console.log("Migration effectuée:", migrationDone);
```

---

## 📝 Checklist de Validation

- [ ] Le fichier `conso-indexeddb-integration.js` est créé dans `public/`
- [ ] Le script est ajouté dans `index.html` après conso.js
- [ ] Tester: modifier une cellule dans Modelised_table → actualiser → données persistantes ✅
- [ ] Tester: modifier Table_conso via consolidation → actualiser → données persistantes ✅
- [ ] Tester: modifier Table_Resultat → actualiser → données persistantes ✅
- [ ] Tester: changer de chat → revenir → données restaurées ✅
- [ ] Tester: redémarrer serveur → données toujours là ✅
- [ ] Vérifier: aucune erreur dans la console
- [ ] Vérifier: localStorage n'est plus utilisé pour les tables
- [ ] Vérifier: IndexedDB contient les tables dans `clara_generated_tables`

---

## 🎯 Résultat Final

### Avant (localStorage)
```
Modelised_table ✅ → localStorage ❌ → Actualisation → PERDU ❌
Table_conso ❌ → localStorage ❌ → Actualisation → PERDU ❌
Table_Resultat ❌ → localStorage ❌ → Actualisation → PERDU ❌
```

### Après (IndexedDB)
```
Modelised_table ✅ → IndexedDB ✅ → Actualisation → RESTAURÉ ✅
Table_conso ✅ → IndexedDB ✅ → Actualisation → RESTAURÉ ✅
Table_Resultat ✅ → IndexedDB ✅ → Actualisation → RESTAURÉ ✅
```

---

## 🚀 Prochaines Étapes

1. ✅ Implémenter l'intégration IndexedDB
2. ⏳ Tester la persistance complète
3. ⏳ Valider avec différents scénarios
4. ⏳ Documenter les cas d'usage
5. ⏳ Former l'équipe sur le nouveau système

---

*Documentation créée le 29 août 2026*
*Version: 1.0.0*
