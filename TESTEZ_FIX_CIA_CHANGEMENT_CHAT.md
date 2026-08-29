# 🧪 TEST - Fix Persistance CIA Changement de Chat

## ✅ Modifications Appliquées

1. ✅ `public/auto-restore-chat-change.js` - Version améliorée avec détection CIA
2. ✅ `public/conso.js` - Délai de restauration augmenté (1s → 2s)

## 🎯 Test Rapide (2 minutes)

### Étape 1 : Préparation

1. Ouvrez l'application dans votre navigateur
2. Ouvrez la console (F12)
3. Naviguez vers un chat contenant des tables CIA

### Étape 2 : Vérification du Système

Dans la console, exécutez:

```javascript
// Vérifier que les systèmes sont chargés
console.log('conso.js:', window.claraverseProcessor ? '✅' : '❌');
console.log('auto-restore:', window.restoreCurrentSession ? '✅' : '❌');
console.log('Tables CIA:', window.countCIATables ? window.countCIATables() : '?');
```

**Résultat attendu** :
```
conso.js: ✅
auto-restore: ✅
Tables CIA: 16 (ou autre nombre > 0)
```

### Étape 3 : Test de Sauvegarde

1. Cochez 3-4 checkboxes dans différentes tables CIA
2. Attendez 2 secondes (sauvegarde automatique)
3. Dans la console, vérifiez:

```javascript
// Vérifier localStorage
const data = JSON.parse(localStorage.getItem('claraverse_tables_data') || '{}');
const ciaCount = Object.values(data).filter(t => t.isCIATable).length;
const checkedCount = Object.values(data)
  .filter(t => t.isCIATable)
  .reduce((sum, t) => sum + (t.cells || []).filter(c => c.isCheckboxCell && c.isChecked).length, 0);

console.log(`Tables CIA sauvegardées: ${ciaCount}`);
console.log(`Checkboxes cochées: ${checkedCount}`);
```

**Résultat attendu** :
```
Tables CIA sauvegardées: 16 (ou votre nombre)
Checkboxes cochées: 3 (ou votre nombre)
```

### Étape 4 : Test de Changement de Chat

1. **Changez de chat** (cliquez sur un autre chat dans la liste)
2. Observez la console, vous devriez voir:
   ```
   🔄 Nouvelles tables CIA détectées (X → Y)
   ⏰ Restauration planifiée dans 5 secondes
   ```
3. Attendez 5 secondes
4. Vous devriez voir:
   ```
   🎯 === RESTAURATION VIA ÉVÉNEMENT (CIA) ===
   📊 Tables CIA détectées: Y
   📍 Session: xxx
   ✅ Événement de restauration déclenché
   ```
5. Attendez 2 secondes supplémentaires
6. Vous devriez voir:
   ```
   🔄 Événement de restauration reçu pour les tables CIA
   📍 Session demandée: xxx
   🔄 Restauration des tables CIA...
   📂 Restauration de toutes les tables...
   ✅ X table(s) restaurée(s)
   ```

### Étape 5 : Test de Retour au Chat Initial

1. **Revenez au chat initial** (celui avec les checkboxes cochées)
2. Attendez 7 secondes (5s + 2s)
3. **Vérifiez visuellement** : Les checkboxes doivent être cochées
4. Dans la console, vous devriez voir les mêmes logs qu'à l'étape 4

## 🔍 Diagnostic en Cas de Problème

### Problème 1 : Aucun log dans la console

**Cause** : Les scripts ne sont pas chargés

**Solution** :
```javascript
// Recharger avec Ctrl+F5 (hard refresh)
// Puis vérifier:
console.log('Scripts chargés:', {
  conso: !!window.claraverseProcessor,
  autoRestore: !!window.restoreCurrentSession,
  countCIA: !!window.countCIATables
});
```

### Problème 2 : "Tables CIA détectées: 0"

**Cause** : Les tables ne sont pas reconnues comme CIA

**Solution** :
```javascript
// Vérifier manuellement
const tables = document.querySelectorAll('table');
tables.forEach((t, i) => {
  const headers = Array.from(t.querySelectorAll('th, td'))
    .map(h => h.textContent.trim())
    .slice(0, 5);
  console.log(`Table ${i}:`, headers);
});

// Chercher "Reponse_user" dans les headers
```

### Problème 3 : Checkboxes non restaurées

**Cause** : Données non sauvegardées ou ID manquant

**Solution** :
```javascript
// 1. Forcer la sauvegarde
claraverseProcessor.saveNow();

// 2. Vérifier les IDs
document.querySelectorAll('table').forEach((t, i) => {
  console.log(`Table ${i} ID:`, t.dataset.tableId || '❌ SANS ID');
});

// 3. Forcer la restauration
claraverseProcessor.restoreAllTablesData();
```

### Problème 4 : Événement non reçu

**Cause** : Listener non configuré

**Solution** :
```javascript
// Tester manuellement
document.dispatchEvent(new CustomEvent('flowise:table:restore:request', {
  detail: { sessionId: 'test' }
}));

// Attendre 2 secondes et vérifier les logs
```

## 📊 Résultats Attendus

### Timing

| Étape | Délai | Total |
|-------|-------|-------|
| Changement de chat | 0s | 0s |
| Détection des tables | ~0.5s | 0.5s |
| Attente stabilisation | 5s | 5.5s |
| Déclenchement événement | 0s | 5.5s |
| Attente restauration | 2s | 7.5s |
| Restauration complète | ~0.5s | 8s |

**Total : ~8 secondes** (acceptable)

### Logs Attendus

```
🔄 AUTO RESTORE CHAT CHANGE - Démarrage (Version CIA)
👀 Observer activé - 16 table(s) CIA initiale(s)
✅ Auto Restore Chat Change activé (Version CIA)

[Changement de chat]

🔄 Nouvelles tables CIA détectées (16 → 0)
⏰ Restauration planifiée dans 5 secondes
⏰ Timeout écoulé - Lancement
🎯 === RESTAURATION VIA ÉVÉNEMENT (CIA) ===
📊 Tables CIA détectées: 0
⏭️ Aucune table CIA, skip restauration

[Retour au chat initial]

🔄 Nouvelles tables CIA détectées (0 → 16)
⏰ Restauration planifiée dans 5 secondes
⏰ Timeout écoulé - Lancement
🎯 === RESTAURATION VIA ÉVÉNEMENT (CIA) ===
📊 Tables CIA détectées: 16
📍 Session: xxx
✅ Événement de restauration déclenché
🎯 === FIN ===
🔄 Événement de restauration reçu pour les tables CIA
📍 Session demandée: xxx
🔄 Restauration des tables CIA...
📂 Restauration de toutes les tables...
📊 16 table(s) trouvée(s) dans le stockage
🔍 16 table(s) trouvée(s) dans le DOM
✅ Résultat: 16 table(s) restaurée(s) sur 16 tentatives
✅ 16 table(s) restaurée(s)
🔓 Flag de restauration désactivé
```

## 🎉 Succès

Si vous voyez:
- ✅ Logs complets dans la console
- ✅ Checkboxes restaurées visuellement
- ✅ Notification "X table(s) restaurée(s)" en haut à droite
- ✅ Pas d'erreurs en rouge

**Le fix fonctionne ! 🎉**

## 🔧 Commandes Utiles

```javascript
// Diagnostic complet
const script = document.createElement('script');
script.src = '/diagnostic-cia-chat-change.js';
document.head.appendChild(script);

// Forcer la restauration
claraverseProcessor.restoreAllTablesData();

// Compter les tables CIA
window.countCIATables();

// Tester une table
const table = document.querySelector('table');
window.isCIATable(table);

// Forcer l'événement
document.dispatchEvent(new CustomEvent('flowise:table:restore:request', {
  detail: { sessionId: 'current' }
}));
```

---

**Date** : 26 novembre 2025  
**Version** : 1.0  
**Statut** : ✅ Prêt à tester
