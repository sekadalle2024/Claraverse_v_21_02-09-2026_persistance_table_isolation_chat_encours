# Guide de Test - Système de Persistance ClaraVerse v3.1 🧪

## 📋 Vue d'Ensemble

Ce guide vous permet de vérifier que le système contextuel ClaraVerse v3.1 résout les problèmes de persistance des structures HTML (insertion/suppression de lignes/colonnes).

## 🚀 Étapes de Test

### 1. Vérification de l'Installation

Ouvrez la console développeur (F12) et vérifiez que le système est chargé :

```javascript
// Vérifier la version
console.log('Version:', window.CLARAVERSE_CONFIG?.VERSION);
console.log('Contextuel:', !!window.CLARAVERSE_CONFIG?.CONTEXTUAL);

// Vérifier les fonctions critiques
console.log('forceTableStructureSave:', typeof window.forceTableStructureSave);
console.log('restoreTableDataContextual:', typeof window.restoreTableDataContextual);
```

**Résultat attendu :**
```
Version: 3.1.0
Contextuel: true
forceTableStructureSave: function
restoreTableDataContextual: function
```

### 2. Test Rapide du Système

Exécutez le test rapide dans la console :

```javascript
quickContextualTest()
```

**Résultat attendu :**
```
🧪 Test rapide du système contextuel...
✅ ID contextuel généré: user||chat||div||table
✅ Séparateur détecté: true
🎯 Test rapide terminé avec succès!
```

### 3. Test Spécialisé des Structures HTML

**Le test le plus important pour votre problème :**

```javascript
testStructurePersistence()
```

**Résultat attendu :**
```
🏗️ Test spécialisé persistance des structures HTML...
➕ Test insertion de ligne...
💾 Sauvegarde après insertion: true
🔄 Test restauration de structure...
📊 Lignes finales: 3
🎯 Persistance structures: ✅ FONCTIONNE
```

### 4. Test Manuel Complet

#### 4.1 Créer une Table de Test

1. Dans votre chat, créez ou trouvez une table existante
2. Ouvrez la console et identifiez la table :

```javascript
// Trouver toutes les tables ClaraVerse
const tables = document.querySelectorAll('table[data-claraverse-id]');
console.log(`${tables.length} tables ClaraVerse trouvées`);

// Afficher les IDs
tables.forEach((table, i) => {
  console.log(`Table ${i}: ${table.dataset.claraverseId}`);
  console.log(`Contextuel: ${table.dataset.claraverseId.includes('||')}`);
});
```

#### 4.2 Test d'Insertion de Ligne

1. **Faire clic droit** sur une cellule de la table
2. **Sélectionner "Insérer ligne en dessous"**
3. **Vérifier** qu'une nouvelle ligne apparaît
4. **Dans la console, vérifier la sauvegarde :**

```javascript
// Vérifier la dernière sauvegarde
const table = document.querySelector('table[data-claraverse-id]');
const tableId = table.dataset.claraverseId;
console.log('Table ID:', tableId);

// Vérifier les données sauvegardées
const structureKey = `claraverse_struct_${tableId}`;
const savedStructure = localStorage.getItem(structureKey);
if (savedStructure) {
  const data = JSON.parse(savedStructure);
  console.log('✅ Structure sauvegardée:', data.rows, 'lignes');
  console.log('📅 Sauvegardée le:', new Date(data.savedAt));
} else {
  console.log('❌ Aucune structure sauvegardée trouvée');
}
```

#### 4.3 Test de Persistance (Critique)

1. **Actualiser la page** (F5)
2. **Attendre** que la page se recharge complètement (3-5 secondes)
3. **Vérifier** que la ligne ajoutée est toujours présente
4. **Dans la console :**

```javascript
// Vérifier que la restauration a fonctionné
const table = document.querySelector('table[data-claraverse-id]');
console.log('Restaurée:', table.dataset.restored);
console.log('Restauration contextuelle:', table.dataset.restoredContextual);
console.log('Nombre de lignes:', table.querySelectorAll('tr').length);
```

#### 4.4 Test d'Insertion de Colonne

1. **Faire clic droit** sur une cellule
2. **Sélectionner "Insérer colonne à droite"**
3. **Actualiser la page**
4. **Vérifier** que la colonne est toujours là

#### 4.5 Test de Suppression

1. **Supprimer une ligne** via le menu contextuel
2. **Actualiser la page**
3. **Vérifier** que la ligne reste supprimée

## 🔍 Tests de Diagnostic

### Diagnostic Complet

```javascript
runDiagnostic()
```

Recherchez dans les résultats :
- **Tables contextuelles** > **Tables legacy**
- **Taux de validité** > 90%
- **Aucun conflit critique**

### État du Système

```javascript
claraverseDebugCommands.status()
```

**Résultats optimaux :**
```
📊 STATUS CLARAVERSE v3.1
Tables ClaraVerse: X
Tables contextuelles: X (même nombre)
Clés de stockage: X
Système initialisé: true
```

### Test de Performance

```javascript
// Test de génération de contexte
console.time('contextGeneration');
for(let i = 0; i < 100; i++) {
  generateChatContext(document.querySelector('table'));
}
console.timeEnd('contextGeneration');
```

**Résultat attendu :** < 100ms

## ⚠️ Dépannage

### Si les structures ne persistent pas

1. **Vérifier l'ID contextuel :**
```javascript
const table = document.querySelector('table');
console.log('ID:', table.dataset.claraverseId);
console.log('Contient ||:', table.dataset.claraverseId.includes('||'));
```

2. **Forcer la régénération :**
```javascript
claraverseDebugCommands.fix()
```

3. **Vérifier les événements :**
```javascript
// Écouter les événements de structure
document.addEventListener('claraverse:contextual:structure:changed', (e) => {
  console.log('🔄 Structure modifiée:', e.detail);
});
```

### Si les tests échouent

1. **Nettoyer le cache :**
```javascript
claraverseDebugCommands.cleanup()
```

2. **Sauvegarder toutes les structures :**
```javascript
claraverseDebugCommands.saveAll()
```

3. **Réinitialiser le système :**
```javascript
fixStructurePersistence()
```

## ✅ Checklist de Validation

### Tests Automatisés
- [ ] `quickContextualTest()` → Retourne `true`
- [ ] `testStructurePersistence()` → `success: true`
- [ ] `runDiagnostic()` → Aucune erreur critique

### Tests Manuels
- [ ] Insertion de ligne persiste après F5
- [ ] Insertion de colonne persiste après F5
- [ ] Suppression de ligne persiste après F5
- [ ] Suppression de colonne persiste après F5
- [ ] Modifications de cellules sauvegardées
- [ ] Menu contextuel fonctionne

### Tests Multi-Chat
- [ ] Tables dans Chat A isolées de Chat B
- [ ] Même utilisateur, chats différents → données séparées
- [ ] Utilisateurs différents → données privées

## 📊 Métriques de Succès

**Le système fonctionne correctement si :**

1. **100%** des modifications structurelles persistent
2. **Temps de restauration** < 2 secondes
3. **Isolation parfaite** entre chats/utilisateurs
4. **Aucune perte de données** signalée
5. **Performance** : < 100ms pour génération contexte

## 🚨 Cas d'Échec

**Si un test échoue :**

1. **Noter exactement** quelle étape a échoué
2. **Copier les messages** d'erreur de la console
3. **Exécuter** : `runDiagnostic()` et sauver le rapport
4. **Vérifier** que tous les fichiers ont été modifiés
5. **Redémarrer** le navigateur et retester

## 📞 Support

**Informations à fournir en cas de problème :**

```javascript
// Exécuter et copier le résultat
const debugInfo = {
  version: window.CLARAVERSE_CONFIG?.VERSION,
  contextual: !!window.CLARAVERSE_CONFIG?.CONTEXTUAL,
  browser: navigator.userAgent,
  tables: document.querySelectorAll('table[data-claraverse-id]').length,
  contextualTables: document.querySelectorAll('table[data-claraverse-id*="||"]').length,
  storageKeys: Object.keys(localStorage).filter(k => k.startsWith('claraverse_')).length,
  lastError: window.lastClaraVerseError || 'Aucune'
};
console.log(JSON.stringify(debugInfo, null, 2));
```

---

## 🎯 Résumé

**Ce guide teste spécifiquement les correctifs pour :**
- ✅ Persistance des insertions/suppressions de lignes
- ✅ Persistance des insertions/suppressions de colonnes  
- ✅ Isolation des données entre chats
- ✅ Sauvegarde immédiate des modifications structurelles
- ✅ Restauration fiable après actualisation

**Si tous les tests passent, votre problème de persistance des structures HTML est résolu ! 🎉**