# 🔍 DIAGNOSTIC: Tables Modelisées Disparues

## 🎯 Problème

Les tables modelisées n'apparaissent plus au démarrage de l'application.

## 📋 Causes Possibles (Basées sur l'Historique)

### 1. **Tables Vides Sauvegardées au Chargement**
- **Symptôme**: Les tables sont créées vides puis sauvegardées, écrasant les données existantes
- **Cause**: `saveTableDataNow()` appelé avant que les données soient chargées
- **Solution**: Désactiver la sauvegarde automatique des tables vides

### 2. **Restauration Automatique Non Déclenchée**
- **Symptôme**: Les données existent dans IndexedDB mais ne sont pas restaurées
- **Cause**: `flowiseTableBridge.initializeRestoration()` bloqué ou non appelé
- **Solution**: Vérifier le gestionnaire de verrouillage et l'ordre de chargement

### 3. **Événement `flowise:table:integrated` Non Déclenché**
- **Symptôme**: Les tables sont créées mais pas sauvegardées dans IndexedDB
- **Cause**: `notifyTableCreated()` non appelé ou événement non écouté
- **Solution**: Vérifier que l'événement est bien émis et écouté

### 4. **Conflit entre localStorage et IndexedDB**
- **Symptôme**: Données dans localStorage mais pas dans IndexedDB (ou inverse)
- **Cause**: Système de sauvegarde désactivé ou mal configuré
- **Solution**: Vérifier que les deux systèmes sont synchronisés

### 5. **Race Condition au Chargement**
- **Symptôme**: Parfois les tables apparaissent, parfois non
- **Cause**: Restauration lancée avant que le DOM soit prêt
- **Solution**: Ajouter des délais ou attendre DOMContentLoaded

## 🧪 Diagnostic Automatique

Un script de diagnostic a été ajouté: `public/diagnostic-tables-modelisees.js`

### Utilisation

1. **Ouvrir la console** (F12)
2. **Recharger la page**
3. **Attendre 3 secondes**
4. **Lire les résultats** dans la console

### Ce que le diagnostic vérifie

```
🔍 1. VÉRIFICATION INDEXEDDB
   ✅ IndexedDB accessible
   📊 Nombre de tables
   📋 Liste des tables avec détails

🔒 2. VÉRIFICATION VERROUILLAGE
   ✅ Lock Manager présent
   📊 État de la restauration
   ⚠️ Blocages éventuels

📦 3. VÉRIFICATION LOCALSTORAGE
   ✅ Données présentes
   📋 Liste des tables

🔄 4. VÉRIFICATION RESTAURATION AUTO
   ✅ flowiseTableBridge chargé
   ✅ conso.js chargé

🎯 5. VÉRIFICATION TABLES DOM
   📊 Nombre de tables
   📋 Tables avec ID
   📊 Tables modelisées

📝 6. VÉRIFICATION ÉVÉNEMENTS
   ✅ Événements reçus
   ⚠️ Événements manquants
```

## 🔧 Solutions par Scénario

### Scénario A: IndexedDB Vide
**Diagnostic**: `📊 Nombre de tables dans IndexedDB: 0`

**Cause**: Les tables ne sont pas sauvegardées

**Solution**:
1. Vérifier que `notifyTableCreated()` est appelé dans `conso.js`
2. Vérifier que `flowiseTableBridge` écoute l'événement `flowise:table:integrated`
3. Vérifier que `saveTableDataNow()` n'est pas désactivé pour les tables modelisées

### Scénario B: Restauration Bloquée
**Diagnostic**: `⚠️ PROBLÈME: Restauration bloquée!`

**Cause**: Le gestionnaire de verrouillage empêche la restauration

**Solution**:
```javascript
// Dans la console
window.restoreLockManager.reset();
window.testTableRestore();
```

### Scénario C: Tables dans IndexedDB mais pas dans DOM
**Diagnostic**: 
- `📊 Nombre de tables dans IndexedDB: 5`
- `📋 Tables avec ID: 0`

**Cause**: La restauration ne s'est pas déclenchée

**Solution**:
1. Vérifier que `flowiseTableBridge.initializeRestoration()` est appelé
2. Vérifier l'ordre de chargement des scripts
3. Forcer la restauration: `window.testTableRestore()`

### Scénario D: Tables Vides Sauvegardées
**Diagnostic**: Tables présentes mais sans données (cells: 0)

**Cause**: Sauvegarde avant chargement des données

**Solution**: Vérifier dans `conso.js`:
```javascript
saveTableDataNow(table) {
  // ✅ Vérifier que la table n'est pas vide
  const cells = table.querySelectorAll('td');
  const hasData = Array.from(cells).some(cell => cell.textContent.trim() !== '');
  
  if (!hasData) {
    debug.log('⏭️ Table vide, skip sauvegarde');
    return;
  }
  
  // Continuer la sauvegarde...
}
```

## 🎯 Test Manuel

Pour tester manuellement la restauration:

```javascript
// 1. Ouvrir la console (F12)

// 2. Vérifier l'état
window.restoreLockManager.getState()

// 3. Réinitialiser si nécessaire
window.restoreLockManager.reset()

// 4. Forcer la restauration
window.testTableRestore()

// 5. Vérifier les tables
document.querySelectorAll('table[data-table-id]').length
```

## 📊 Logs à Surveiller

### Logs Normaux (Tout fonctionne)
```
✅ flowiseTableBridge initialized
🔄 Auto-restoring tables for session: xxx
✅ Restored X tables from IndexedDB
📊 Table de Consolidation créée
✅ Table xxx sauvegardée avec succès
```

### Logs Problématiques
```
❌ No session detected on initialization
⚠️ Table vide, skip sauvegarde
❌ Erreur restauration: xxx
🔒 Restauration bloquée par le gestionnaire
```

## 🔄 Flux Normal de Restauration

1. **Page chargée** → `restore-lock-manager.js` chargé
2. **flowiseTableBridge initialisé** → `initializeRestoration()` appelé
3. **Session détectée** → `restoreTablesForSession()` appelé
4. **Tables restaurées depuis IndexedDB** → Insérées dans le DOM
5. **conso.js détecte les tables** → Ajoute les fonctionnalités
6. **Tables affichées** ✅

## 🚨 Points de Défaillance

- ❌ Lock Manager bloque la restauration
- ❌ Session non détectée
- ❌ IndexedDB vide (tables non sauvegardées)
- ❌ Ordre de chargement incorrect
- ❌ Race condition (restauration avant DOM ready)
- ❌ Tables vides écrasent les données

## 💡 Prochaines Étapes

1. **Lancer le diagnostic** (recharger la page avec console ouverte)
2. **Identifier le scénario** (A, B, C ou D)
3. **Appliquer la solution** correspondante
4. **Tester** avec `window.testTableRestore()`
5. **Vérifier** que les tables apparaissent

## 📝 Notes

- Le diagnostic s'exécute automatiquement 3 secondes après le chargement
- Les résultats sont affichés dans la console
- Utilisez `window.testTableRestore()` pour forcer une restauration
- Le script peut être désactivé en commentant la ligne dans `index.html`
