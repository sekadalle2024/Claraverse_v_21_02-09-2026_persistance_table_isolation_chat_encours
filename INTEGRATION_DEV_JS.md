# 🛠️ Intégration de dev.js avec le Système de Persistance

## 📋 Analyse du Conflit

### Problème Identifié

Le script `dev.js` utilise **localStorage** avec le préfixe `claraverse_dev_`, ce qui **entre en conflit** avec le système de persistance existant qui utilise **IndexedDB**.

#### Conflits Détectés :

1. **Système de stockage différent** :
   - `dev.js` → localStorage (`claraverse_dev_*`)
   - Système existant → IndexedDB (`clara_db`)

2. **Risques** :
   - Données dupliquées
   - Incohérence entre localStorage et IndexedDB
   - Conflits de restauration
   - Perte de données lors des synchronisations

3. **Préfixes localStorage utilisés par dev.js** :
   ```javascript
   STORAGE_PREFIX: "claraverse_dev_"
   SYNC_PREFIX: "claraverse_sync_"
   META_PREFIX: "claraverse_meta_"
   ```

---

## ✅ Solution Implémentée

### Option 1 : dev-indexedDB.js (RECOMMANDÉ)

Un nouveau script **`public/dev-indexedDB.js`** a été créé qui :

✅ **Utilise IndexedDB** au lieu de localStorage  
✅ **S'intègre avec flowiseTableService** existant  
✅ **Pas de conflit** avec le système de persistance  
✅ **Même fonctionnalités** que dev.js (édition de cellules)  
✅ **Compatible** avec le système de restauration automatique  

#### Fonctionnalités :

- ✏️ **Édition en place** : Double-clic sur une cellule pour l'éditer
- 💾 **Sauvegarde automatique** : Via IndexedDB (flowiseTableService)
- 🔄 **Restauration automatique** : Compatible avec auto-restore-chat-change.js
- 🎨 **Indicateur visuel** : Badge violet "✏️ DEV" sur les tables éditables
- ⌨️ **Raccourcis clavier** :
  - `Ctrl+Shift+D` : Ouvrir le panel de développement
  - `Ctrl+Shift+R` : Restaurer toutes les tables
  - `Ctrl+S` : Sauvegarder la cellule en cours d'édition
  - `Escape` : Annuler l'édition

#### Intégration avec le Système Existant :

```javascript
// Utilise le service existant
const service = window.flowiseTableService || window.flowiseTableBridge;

// Sauvegarde via IndexedDB
await service.saveTable({
  sessionId: getCurrentSessionId(),
  keyword: tableId,
  html: table.outerHTML,
  source: "dev-indexeddb",
  metadata: {
    cellId: cellId,
    cellContent: content,
    editedAt: Date.now()
  }
});
```

---

## 📦 Intégration dans index.html

### Étape 1 : Ajouter dev-indexedDB.js

Ajoutez le script dans `index.html` **après** les scripts de persistance :

```html
<!-- Scripts de persistance existants -->
<script src="/wrap-tables-auto.js"></script>
<script src="/Flowise.js"></script>
<script type="module" src="/force-restore-on-load.js"></script>
<script src="/menu-persistence-bridge.js"></script>
<script src="/menu.js"></script>
<script type="module" src="/auto-restore-chat-change.js"></script>

<!-- NOUVEAU : Dev Mode avec IndexedDB -->
<script src="/dev-indexedDB.js"></script>
```

### Étape 2 : NE PAS ajouter l'ancien dev.js

⚠️ **IMPORTANT** : Ne pas charger l'ancien `dev.js` pour éviter les conflits.

---

## 🔄 Migration de dev.js vers dev-indexedDB.js

### Comparaison des Fonctionnalités

| Fonctionnalité | dev.js (ancien) | dev-indexedDB.js (nouveau) |
|----------------|-----------------|----------------------------|
| Édition cellules | ✅ | ✅ |
| Sauvegarde | localStorage | IndexedDB ✅ |
| Restauration | localStorage | IndexedDB ✅ |
| Indicateur visuel | ✅ | ✅ (violet) |
| Panel dev | ✅ | ✅ |
| Raccourcis clavier | ✅ | ✅ |
| Compatibilité système | ❌ Conflit | ✅ Compatible |
| Hiérarchie IDs | ✅ Complexe | ✅ Simple |
| Synchronisation | localStorage events | IndexedDB + événements |

### Avantages de dev-indexedDB.js

1. **Pas de conflit** : Utilise le même système que Flowise.js et menu.js
2. **Données centralisées** : Tout dans IndexedDB (`clara_db`)
3. **Restauration cohérente** : Fonctionne avec auto-restore-chat-change.js
4. **Plus simple** : Moins de code, plus maintenable
5. **Meilleure performance** : IndexedDB plus rapide que localStorage

---

## 🧪 Tests et Vérification

### Test 1 : Édition de Cellule

```javascript
// 1. Ouvrir la console
// 2. Scanner les tables
window.devIndexedDB.scanTables()

// 3. Double-cliquer sur une cellule
// 4. Modifier le contenu
// 5. Appuyer sur Enter ou perdre le focus
// 6. Vérifier la sauvegarde dans IndexedDB

// Vérifier dans IndexedDB
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    console.log('Tables sauvegardées:', getAll.result);
    // Chercher les entrées avec source: "dev-indexeddb"
    const devTables = getAll.result.filter(t => t.source === 'dev-indexeddb');
    console.log('Tables Dev:', devTables);
  };
};
```

### Test 2 : Restauration

```javascript
// 1. Modifier une cellule
// 2. Recharger la page (F5)
// 3. Vérifier que la cellule est restaurée

// Ou forcer la restauration
window.devIndexedDB.restoreAllTables()
```

### Test 3 : Changement de Chat

```javascript
// 1. Modifier des cellules dans un chat
// 2. Changer de chat
// 3. Revenir au chat initial
// 4. Vérifier que les modifications sont restaurées
```

### Test 4 : Panel de Développement

```javascript
// Appuyer sur Ctrl+Shift+D
// Ou
window.devIndexedDB.createDevPanel()

// Le panel affiche :
// - Nombre de tables
// - Nombre de tables éditables
// - Session ID actuelle
// - Boutons d'action
```

---

## 🔧 Configuration

### Paramètres Modifiables

Dans `public/dev-indexedDB.js` :

```javascript
const DEV_CONFIG = {
  DEBUG: true,              // Activer les logs
  SAVE_DELAY: 1000,         // Délai avant sauvegarde auto (ms)
  RESTORE_DELAY: 500,       // Délai avant restauration (ms)
  MAX_CELL_LENGTH: 10000,   // Longueur max d'une cellule
};
```

### Sélecteurs de Tables

Modifiez les sélecteurs pour cibler vos tables :

```javascript
const selectors = [
  "div.prose table",
  "table.min-w-full",
  "table[data-claraverse]",
  ".claraverse-table",
  // Ajoutez vos sélecteurs ici
];
```

---

## 📊 Architecture Finale

```
index.html
├── wrap-tables-auto.js
├── Flowise.js
├── force-restore-on-load.js (module)
│   └── flowiseTableBridge.ts
│       └── flowiseTableService.ts
│           └── indexedDB.ts
├── menu-persistence-bridge.js
│   └── menuIntegration.ts
│       └── flowiseTableService.ts
├── menu.js
├── auto-restore-chat-change.js (module)
│   └── Événement: flowise:table:restore:request
│       └── menuIntegration.ts
│           └── flowiseTableService.ts
└── dev-indexedDB.js ⭐ NOUVEAU
    └── flowiseTableService.ts
        └── indexedDB.ts
            └── clara_db/clara_generated_tables
```

### Flux de Données

```
Utilisateur édite cellule (dev-indexedDB.js)
    ↓
Sauvegarde via flowiseTableService
    ↓
IndexedDB (clara_db/clara_generated_tables)
    ↓
Restauration automatique (auto-restore-chat-change.js)
    ↓
Cellule restaurée avec modifications
```

---

## 🎯 Événements Personnalisés

### Événements Émis par dev-indexedDB.js

```javascript
// Cellule sauvegardée
document.dispatchEvent(new CustomEvent('dev:cell:saved', {
  detail: { cellId, tableId, content }
}));
```

### Événements Écoutés

Aucun événement spécifique écouté, mais compatible avec :
- `flowise:table:restore:request`
- `flowise:table:save:request`

---

## 🚨 Dépannage

### Problème : Cellules non éditables

**Solution** :
```javascript
// Forcer le scan
window.devIndexedDB.scanTables()

// Vérifier l'initialisation
window.devIndexedDB.initialized()
```

### Problème : Sauvegarde ne fonctionne pas

**Vérifications** :
1. Vérifier que flowiseTableService est disponible :
   ```javascript
   console.log(window.flowiseTableService)
   ```

2. Vérifier IndexedDB :
   ```javascript
   indexedDB.databases().then(console.log)
   ```

3. Vérifier les logs :
   ```javascript
   // Les logs commencent par [DEV-IDB]
   ```

### Problème : Restauration ne fonctionne pas

**Solution** :
```javascript
// Vérifier le sessionId
window.devIndexedDB.getCurrentSessionId()

// Forcer la restauration
window.devIndexedDB.restoreAllTables()
```

---

## 📝 API Globale

```javascript
window.devIndexedDB = {
  version: "1.0",
  
  // Vérifier l'initialisation
  initialized: () => boolean,
  
  // Scanner les tables
  scanTables: () => Array<HTMLTableElement>,
  
  // Rendre une table éditable
  makeTableEditable: (table: HTMLTableElement) => void,
  
  // Restaurer toutes les tables
  restoreAllTables: () => Promise<void>,
  
  // Sauvegarder toutes les tables
  saveAllTables: () => Promise<void>,
  
  // Créer le panel de développement
  createDevPanel: () => void,
  
  // Obtenir le sessionId actuel
  getCurrentSessionId: () => string,
};
```

---

## ✅ Checklist d'Intégration

- [ ] Fichier `public/dev-indexedDB.js` créé
- [ ] Script ajouté dans `index.html` après les scripts de persistance
- [ ] Ancien `dev.js` **NON** chargé dans index.html
- [ ] Test d'édition de cellule effectué
- [ ] Test de sauvegarde vérifié dans IndexedDB
- [ ] Test de restauration après F5 effectué
- [ ] Test de changement de chat effectué
- [ ] Panel de développement testé (Ctrl+Shift+D)

---

## 🎉 Résumé

**dev-indexedDB.js** est une version modernisée et compatible de `dev.js` qui :

✅ Utilise IndexedDB au lieu de localStorage  
✅ S'intègre parfaitement avec le système existant  
✅ Pas de conflit avec Flowise.js et menu.js  
✅ Même fonctionnalités d'édition de cellules  
✅ Compatible avec la restauration automatique  
✅ Plus simple et plus maintenable  

**Recommandation** : Utiliser `dev-indexedDB.js` et ne pas charger l'ancien `dev.js`.

---

*Documentation créée le 16 novembre 2025*
