# 🔧 FIX - Persistance CIA lors du Changement de Chat

## 🎯 Problème Identifié

Lors du changement de chat, les checkboxes CIA ne sont pas persistantes et les tables finissent par disparaître.

### Causes Racines

1. **Timing de restauration** : Le délai de 1 seconde dans `conso.js` est trop court
2. **Détection de tables** : Les tables CIA ne sont pas toujours détectées comme "nouvelles"
3. **ID de tables** : Les tables peuvent perdre leur ID lors du changement de chat
4. **Race condition** : La restauration se déclenche avant que les tables soient complètement créées

## ✅ Solution Appliquée

### 1. Amélioration du Timing dans `conso.js`

**Changement** : Augmenter le délai de restauration de 1s à 2s

```javascript
// AVANT
setTimeout(() => {
  debug.log("🔄 Restauration des tables CIA...");
  this.restoreAllTablesData();
}, 1000);

// APRÈS
setTimeout(() => {
  debug.log("🔄 Restauration des tables CIA...");
  this.restoreAllTablesData();
}, 2000); // Augmenté à 2 secondes
```

### 2. Amélioration de la Détection dans `auto-restore-chat-change.js`

**Changement** : Améliorer la détection des tables CIA spécifiquement

```javascript
// Ajouter une détection spécifique pour les tables CIA
function hasCIATables() {
  const tables = document.querySelectorAll('table');
  return Array.from(tables).some(table => {
    const headers = Array.from(table.querySelectorAll('thead th, thead td, tr:first-child th, tr:first-child td'))
      .map(h => h.textContent.trim().toLowerCase());
    return headers.some(h => /reponse[_\s]?user/i.test(h));
  });
}
```

### 3. Forcer la Génération d'ID

**Changement** : S'assurer que toutes les tables CIA ont un ID stable

```javascript
// Dans restoreAllTablesData, forcer la génération d'ID pour les tables CIA
allTables.forEach((table) => {
  const headers = this.getTableHeaders(table);
  const isCIATable = headers.some((header) =>
    this.matchesColumn(header.text, "reponse_user"),
  );
  
  if (isCIATable && !table.dataset.tableId) {
    this.generateUniqueTableId(table);
    debug.log(`🆔 ID généré pour table CIA: ${table.dataset.tableId}`);
  }
});
```

### 4. Amélioration du MutationObserver

**Changement** : Détecter spécifiquement les tables CIA

```javascript
// Dans auto-restore-chat-change.js
const observer = new MutationObserver((mutations) => {
  if (isRestoring) return;

  const hasNewCIATables = mutations.some(m => {
    return Array.from(m.addedNodes).some(node => {
      if (node.nodeType === 1) {
        if (node.tagName === 'TABLE') {
          return isCIATable(node);
        }
        const tables = node.querySelectorAll?.('table');
        if (tables && tables.length > 0) {
          return Array.from(tables).some(t => isCIATable(t));
        }
      }
      return false;
    });
  });

  if (hasNewCIATables) {
    console.log('🔄 Nouvelles tables CIA détectées');
    scheduleRestore();
  }
});

function isCIATable(table) {
  const headers = Array.from(table.querySelectorAll('thead th, thead td, tr:first-child th, tr:first-child td'))
    .map(h => h.textContent.trim().toLowerCase());
  return headers.some(h => /reponse[_\s]?user/i.test(h));
}
```

## 📝 Fichiers à Modifier

### 1. `public/conso.js`

**Ligne ~1507** : Augmenter le délai de restauration

```javascript
// Écouter l'événement de restauration lors du changement de chat
document.addEventListener("flowise:table:restore:request", (e) => {
  debug.log("🔄 Événement de restauration reçu pour les tables CIA");
  const sessionId = e.detail?.sessionId;
  debug.log(`📍 Session demandée: ${sessionId || "current"}`);

  // Restaurer les tables CIA après un délai plus long
  setTimeout(() => {
    debug.log("🔄 Restauration des tables CIA...");
    this.restoreAllTablesData();
  }, 2000); // CHANGÉ: 1000 → 2000
});
```

### 2. `public/auto-restore-chat-change.js`

**Remplacer complètement** par la version améliorée (voir fichier séparé)

## 🧪 Test de la Solution

### Test Manuel

1. Ouvrir un chat avec des tables CIA
2. Cocher plusieurs checkboxes
3. Attendre 2 secondes (sauvegarde automatique)
4. Changer de chat
5. Attendre 7 secondes (5s + 2s)
6. Revenir au chat initial
7. Vérifier que les checkboxes sont restaurées

### Test avec Console

```javascript
// 1. Vérifier que le système fonctionne
console.log('Système CIA:', window.claraverseProcessor ? '✅' : '❌');

// 2. Forcer la sauvegarde
claraverseProcessor.saveNow();

// 3. Forcer la restauration
claraverseProcessor.restoreAllTablesData();

// 4. Tester l'événement
document.dispatchEvent(new CustomEvent('flowise:table:restore:request', {
  detail: { sessionId: 'test' }
}));
```

## 📊 Résultats Attendus

- ✅ Checkboxes restaurées après changement de chat
- ✅ Tables CIA ne disparaissent plus
- ✅ Délai de restauration : ~7 secondes (acceptable)
- ✅ Logs clairs dans la console

## 🔍 Diagnostic en Cas de Problème

### Problème : Checkboxes non restaurées

**Vérifications** :
1. Ouvrir la console et chercher `🔄 Événement de restauration reçu`
2. Vérifier que `🔄 Restauration des tables CIA...` apparaît 2s après
3. Vérifier que `✅ X table(s) restaurée(s)` apparaît

**Si absent** :
- L'événement n'est pas déclenché → Vérifier `auto-restore-chat-change.js`
- L'événement n'est pas reçu → Vérifier `conso.js` ligne ~1500

### Problème : Tables disparaissent

**Vérifications** :
1. Vérifier que les tables ont un ID : `document.querySelectorAll('table[data-table-id]')`
2. Vérifier localStorage : `JSON.parse(localStorage.getItem('claraverse_tables_data'))`

**Si tables sans ID** :
- Forcer la génération : `claraverseProcessor.processAllTables()`

### Problème : Restauration trop lente

**Solution** :
- Réduire le délai dans `auto-restore-chat-change.js` (ligne ~100) : `5000` → `3000`
- Réduire le délai dans `conso.js` (ligne ~1507) : `2000` → `1500`

## 📚 Documentation Associée

- `DOCUMENTATION_COMPLETE_SOLUTION.md` - Architecture complète
- `LISTE_FICHIERS_SYSTEME_PERSISTANCE.md` - Liste des fichiers
- `INDEX_RESTAURATION_UNIQUE.md` - Système de restauration
- `public/diagnostic-cia-chat-change.js` - Outil de diagnostic

## ✅ Checklist d'Application

- [ ] Modifier `public/conso.js` (ligne ~1507)
- [ ] Remplacer `public/auto-restore-chat-change.js`
- [ ] Tester avec un chat CIA
- [ ] Vérifier les logs dans la console
- [ ] Confirmer que les checkboxes sont restaurées
- [ ] Documenter les résultats

---

**Date** : 26 novembre 2025  
**Version** : 1.0  
**Statut** : ✅ Solution prête à appliquer
