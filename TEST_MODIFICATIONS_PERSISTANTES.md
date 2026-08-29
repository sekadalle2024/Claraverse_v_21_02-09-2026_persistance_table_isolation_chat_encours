# 🧪 Test des Modifications Persistantes - Guide Complet

## 🎯 Objectif
Vérifier que TOUTES les modifications dans les tables sont automatiquement sauvegardées et restaurées après actualisation.

---

## ⚡ Test Rapide (2 minutes)

### Étape 1 : Configuration Initiale
Ouvrez la console (F12) et exécutez :

```javascript
// 1. Attribuer les IDs aux tables
claraverseCommands.forceAssignIds()

// 2. Vérifier que les observers sont installés
claraverseCommands.testPersistence()
```

**Vérifiez dans les logs :**
- Colonne `observer` doit afficher "✅" pour chaque table
- Si "❌", réactualisez la page (Ctrl+F5)

### Étape 2 : Modifier une Table
Choisissez UNE méthode selon le type de table :

#### A. Table Modelisée (avec Assertion/Conclusion)
1. Cliquez sur une cellule "Assertion"
2. Sélectionnez "Validité" dans le dropdown
3. Cliquez sur une cellule "Conclusion"
4. Sélectionnez "Non-Satisfaisant"

#### B. Table Standard (autre type)
1. Cliquez sur une cellule éditable (contenteditable="true")
2. Modifiez le texte
3. Appuyez sur Entrée ou cliquez ailleurs

### Étape 3 : Vérifier la Sauvegarde Automatique
Dans la console, attendez 1 seconde et vérifiez les logs :

```
📝 Changement détecté dans table table_xyz123
⏳ Sauvegarde programmée dans 500 ms
💾 Début de sauvegarde immédiate
✅ Table table_xyz123 sauvegardée avec succès
```

**Si vous ne voyez PAS ces logs :**
```javascript
// Activer le mode verbose
claraverseCommands.debug.enableVerbose()

// Puis modifier à nouveau une cellule
```

### Étape 4 : Vérifier le Stockage
```javascript
claraverseCommands.getStorageInfo()
```

**Résultat attendu :**
- Au moins 1 table sauvegardée
- Timestamp récent (moins de 1 minute)

### Étape 5 : Test de Restauration
1. **Actualiser la page** : Appuyez sur **F5**
2. Attendre 2-3 secondes
3. **Vérifier** : Les modifications doivent être là !

**Notification attendue :**
```
✅ X table(s) restaurée(s)
```

---

## 🔬 Test Détaillé (5 minutes)

### Test 1 : Détection des Changements

#### A. Modification de Texte
```javascript
// 1. Activer les logs
claraverseCommands.debug.enableVerbose()

// 2. Modifier une cellule
// (cliquer et taper du texte)

// 3. Vérifier dans la console
// Doit afficher : "📝 Changement détecté"
```

#### B. Modification de Style
```javascript
// 1. Sélectionner une cellule dans une table modelisée
// 2. Choisir "Non-Satisfaisant" (change le background en rouge)
// 3. Vérifier : "📝 Changement détecté" dans console
```

### Test 2 : Sauvegarde Multiple
```javascript
// 1. Modifier 3 cellules différentes rapidement
// 2. Observer les logs
// Résultat : Une seule sauvegarde (grâce au debounce de 500ms)
```

### Test 3 : Toutes les Tables
```javascript
// 1. Modifier une cellule dans chaque table
// 2. Attendre 1 seconde entre chaque
// 3. Vérifier les logs : chaque table doit être sauvegardée

// 4. Actualiser (F5)
// 5. Vérifier : TOUTES les modifications présentes
```

---

## 🐛 Dépannage

### Problème 1 : "Observer: ❌" dans testPersistence

**Cause :** MutationObserver non installé

**Solution :**
```javascript
// Actualisation forcée
// Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)

// Puis vérifier
claraverseCommands.testPersistence()
// Doit afficher "observer: ✅"
```

### Problème 2 : Aucun log "Changement détecté"

**Cause :** Logs désactivés ou cellule non éditable

**Solution :**
```javascript
// 1. Activer les logs
claraverseCommands.debug.enableVerbose()

// 2. Vérifier que la cellule est éditable
// Dans la console :
document.querySelector('td').contentEditable
// Doit retourner "true" ou "inherit"

// 3. Forcer la réinstallation des observers
// Actualiser : Ctrl+F5
```

### Problème 3 : Modifications non sauvegardées

**Vérification :**
```javascript
// 1. Vérifier que la table a un ID
claraverseCommands.debug.listTables()
// Colonne "id" ne doit PAS être "❌ AUCUN"

// 2. Si pas d'ID, forcer
claraverseCommands.forceAssignIds()

// 3. Modifier à nouveau et vérifier
claraverseCommands.getStorageInfo()
```

### Problème 4 : Restauration incomplète

**Solution :**
```javascript
// 1. Vérifier les données sauvegardées
claraverseCommands.debug.showStorage()

// 2. Forcer la restauration
claraverseCommands.restoreAll()

// 3. Si échec, vérifier les IDs
// Les IDs doivent être IDENTIQUES avant et après F5
```

---

## 📊 Tests par Type de Table

### Test A : Table Modelisée (Assertion/Conclusion)

**Actions :**
1. Cliquer sur "Assertion" → Sélectionner "Validité"
2. Cliquer sur "Conclusion" → Sélectionner "Non-Satisfaisant"
3. Cliquer sur "CTR 1" → Sélectionner "+"

**Vérification après F5 :**
- ✅ "Validité" présent
- ✅ "Non-Satisfaisant" présent avec fond rouge
- ✅ "+" présent avec fond vert
- ✅ Table Conso mise à jour (si applicable)

### Test B : Table Standard (Légende, Description, etc.)

**Actions :**
1. Cliquer sur une cellule éditable
2. Modifier le texte : "Texte de test"
3. Cliquer ailleurs ou appuyer sur Entrée

**Vérification immédiate :**
```javascript
// Dans les 2 secondes, voir dans console :
// 📝 Changement détecté dans table table_xyz
// ⏳ Sauvegarde programmée dans 500 ms
```

**Vérification après F5 :**
- ✅ "Texte de test" présent dans la cellule

### Test C : Table Conso/Résultat

**Actions :**
1. Dans une table modelisée, déclencher une consolidation
2. Vérifier que les tables Conso et Résultat sont remplies
3. Actualiser (F5)

**Vérification après F5 :**
- ✅ Table Conso conserve son contenu
- ✅ Table Résultat conserve son contenu
- ✅ Consolidation complète restaurée

---

## 🎯 Scénarios de Test Complets

### Scénario 1 : Session de Travail Longue

```javascript
// Début (t = 0)
claraverseCommands.forceAssignIds()

// t = 1 min : Modifier table 1
// (faire des modifications)

// t = 5 min : Modifier table 2
// (faire des modifications)

// t = 10 min : Vérifier
claraverseCommands.getStorageInfo()
// Doit montrer 2+ tables sauvegardées

// t = 15 min : Actualiser (F5)
// Résultat : TOUT doit être là
```

### Scénario 2 : Modifications Rapides

```javascript
// 1. Activer verbose
claraverseCommands.debug.enableVerbose()

// 2. Modifier 5 cellules en 2 secondes
// (cliquer et modifier rapidement)

// 3. Observer dans console
// Résultat : Une seule sauvegarde après 500ms

// 4. Actualiser (F5)
// Résultat : Toutes les 5 modifications présentes
```

### Scénario 3 : Toutes les Tables

```javascript
// 1. Identifier toutes les tables
claraverseCommands.debug.listTables()
// Note : X tables détectées

// 2. Modifier une cellule dans CHAQUE table
// (parcourir toutes les tables)

// 3. Vérifier stockage
claraverseCommands.getStorageInfo()
// Doit afficher X tables sauvegardées

// 4. Actualiser (F5)
// Résultat : TOUTES les modifications présentes
```

---

## ✅ Checklist de Validation

### Configuration
- [ ] `forceAssignIds()` exécuté
- [ ] `testPersistence()` affiche "observer: ✅" pour toutes les tables
- [ ] `getStorageInfo()` affiche au moins 1 table

### Modifications
- [ ] Modification d'une cellule détecte (log "Changement détecté")
- [ ] Sauvegarde déclenchée après 500ms (log "Sauvegarde programmée")
- [ ] Sauvegarde réussie (log "✅ Table ... sauvegardée")
- [ ] `getStorageInfo()` mis à jour (timestamp récent)

### Restauration
- [ ] Actualisation (F5) affiche notification "✅ X table(s) restaurée(s)"
- [ ] Toutes les modifications sont présentes
- [ ] Styles/couleurs préservés
- [ ] Consolidations restaurées (tables modelisées)

---

## 🔍 Logs à Surveiller

### Logs Normaux (Succès)
```
🔍 Installation détecteur de changements sur table_xyz123
✅ Détecteur installé sur table_xyz123
📝 Changement détecté dans table table_xyz123
⏳ Sauvegarde programmée dans 500 ms
💾 Début de sauvegarde immédiate
🆔 ID de table pour sauvegarde: table_xyz123
✅ Table table_xyz123 sauvegardée avec succès
```

### Logs d'Erreur (Problème)
```
⚠️ Table parente non trouvée pour sauvegarde
❌ saveTableData: table est null ou undefined
⚠️ Impossible de trouver l'élément d'affichage
```

**Si vous voyez ces erreurs :**
```javascript
// Réinitialiser
claraverseCommands.clearAllData()
// Ctrl+F5
claraverseCommands.forceAssignIds()
claraverseCommands.saveAllNow()
```

---

## 📞 Support

### Si tout échoue :

1. **Exporter d'abord** (sécurité)
```javascript
claraverseCommands.exportData()
```

2. **Nettoyer complètement**
```javascript
claraverseCommands.clearAllData()
```

3. **Actualisation forcée**
```
Ctrl+F5 (ou Cmd+Shift+R sur Mac)
```

4. **Reconfigurer**
```javascript
claraverseCommands.forceAssignIds()
claraverseCommands.saveAllNow()
```

5. **Test simple**
```javascript
// Modifier UNE cellule
// Attendre 2 secondes
// Vérifier logs
// Actualiser (F5)
// Vérifier modification présente
```

---

## 🎓 Résumé

**Persistance fonctionne si :**
1. ✅ Observer installé ("observer: ✅")
2. ✅ Changements détectés (logs dans console)
3. ✅ Sauvegarde automatique (après 500ms)
4. ✅ Restauration complète (après F5)

**Commande magique en cas de doute :**
```javascript
claraverseCommands.testPersistence()
```

---

**Version** : 2.0  
**Compatibilité** : Toutes les tables (modelisées et standard)  
**Support** : `claraverseCommands.help()`
