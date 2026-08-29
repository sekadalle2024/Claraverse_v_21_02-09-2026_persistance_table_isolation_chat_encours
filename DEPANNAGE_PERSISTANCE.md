# 🔧 Guide de Dépannage - Persistance Claraverse

## ⚡ Diagnostic Rapide (30 secondes)

### 1. Ouvrir la Console
Appuyez sur **F12** puis allez dans l'onglet **Console**

### 2. Exécuter le Test de Persistance
```javascript
claraverseCommands.testPersistence()
```

### 3. Analyser le Résultat
- ✅ **localStorage accessible** : localStorage fonctionne
- ✅ **X table(s) trouvée(s)** : Les tables sont détectées
- ✅ **Tables ont des IDs** : Les tables peuvent être sauvegardées
- ✅ **X table(s) sauvegardée(s)** : Des données existent déjà

---

## 🚨 Problèmes Fréquents

### Problème 1 : "❌ AUCUN" dans la colonne ID

**Symptôme** : Les tables n'ont pas d'ID assigné

**Solution** :
```javascript
// Forcer l'attribution des IDs
claraverseCommands.forceAssignIds()

// Puis sauvegarder
claraverseCommands.saveNow()

// Vérifier
claraverseCommands.getStorageInfo()
```

### Problème 2 : "0 table(s) sauvegardée(s)"

**Symptôme** : Aucune donnée n'est sauvegardée

**Causes possibles** :
1. Les tables n'ont pas d'ID
2. Les tables ne sont pas "modelisées" (pas de colonnes Assertion/Conclusion)
3. localStorage est bloqué

**Solution** :
```javascript
// Étape 1 : Assigner les IDs
claraverseCommands.forceAssignIds()

// Étape 2 : Sauvegarder manuellement
claraverseCommands.saveNow()

// Étape 3 : Vérifier
claraverseCommands.testPersistence()
```

### Problème 3 : "localStorage non accessible"

**Symptôme** : Erreur lors de l'accès au localStorage

**Causes possibles** :
- Navigation privée/incognito
- Cookies désactivés
- Paramètres de sécurité du navigateur

**Solution** :
1. Sortir du mode navigation privée
2. Activer les cookies dans les paramètres
3. Vérifier les paramètres de sécurité du site

### Problème 4 : Les données ne sont pas restaurées après F5

**Symptôme** : Page actualisée mais tables vides

**Solution immédiate** :
```javascript
// Forcer la restauration
claraverseCommands.restoreAll()
```

**Solution permanente** :
```javascript
// 1. Vérifier que les données existent
claraverseCommands.getStorageInfo()

// 2. Si oui, vérifier les IDs des tables
claraverseCommands.debug.listTables()

// 3. Réassigner les IDs si nécessaire
claraverseCommands.forceAssignIds()
```

### Problème 5 : "QuotaExceededError"

**Symptôme** : Espace de stockage saturé

**Solution** :
```javascript
// 1. Exporter les données importantes
claraverseCommands.exportData()

// 2. Nettoyer le stockage
claraverseCommands.clearAllData()

// 3. Réimporter si nécessaire
claraverseCommands.importData(vosData)
```

---

## 🔍 Commandes de Diagnostic Avancé

### Activer le Mode Debug Verbeux
```javascript
claraverseCommands.debug.enableVerbose()
```
Affiche tous les logs détaillés dans la console.

### Lister Toutes les Tables
```javascript
claraverseCommands.debug.listTables()
```
Affiche un tableau avec toutes les tables détectées.

### Voir le Contenu du localStorage
```javascript
claraverseCommands.debug.showStorage()
```
Affiche le JSON complet des données sauvegardées.

### Voir les Infos de Stockage
```javascript
claraverseCommands.getStorageInfo()
```
Affiche un résumé du stockage (taille, nombre de tables, etc.).

---

## 📝 Procédure de Test Complète

### Test 1 : Vérification Initiale
```javascript
// Étape 1
claraverseCommands.testPersistence()

// Étape 2 : Noter les résultats
// - Nombre de tables dans le DOM
// - Nombre de tables avec ID
// - Nombre de sauvegardes existantes
```

### Test 2 : Sauvegarde Manuelle
```javascript
// Étape 1 : Modifier une cellule dans une table
// (Sélectionner une assertion, conclusion, etc.)

// Étape 2 : Attendre 1 seconde

// Étape 3 : Vérifier la sauvegarde
claraverseCommands.getStorageInfo()
// Devrait afficher au moins 1 table sauvegardée
```

### Test 3 : Restauration
```javascript
// Étape 1 : Noter les valeurs actuelles des tables

// Étape 2 : Actualiser la page (F5)

// Étape 3 : Attendre 2-3 secondes

// Étape 4 : Vérifier que les valeurs sont restaurées

// Si pas restauré, forcer :
claraverseCommands.restoreAll()
```

---

## 🛠️ Solutions par Symptôme

| Symptôme | Commande de Diagnostic | Solution |
|----------|------------------------|----------|
| Tables vides après F5 | `claraverseCommands.testPersistence()` | `claraverseCommands.restoreAll()` |
| Pas de sauvegarde | `claraverseCommands.debug.listTables()` | `claraverseCommands.forceAssignIds()` |
| Erreur localStorage | Console → onglet Application → Storage | Désactiver mode privé |
| Données corrompues | `claraverseCommands.debug.showStorage()` | `claraverseCommands.clearAllData()` |
| Trop de données | `claraverseCommands.getStorageInfo()` | `claraverseCommands.exportData()` puis `clearAllData()` |

---

## 🎯 Workflow de Dépannage (5 minutes)

### Minute 1 : Diagnostic
```javascript
claraverseCommands.testPersistence()
```
→ Noter les résultats

### Minute 2 : Attribution des IDs
```javascript
claraverseCommands.forceAssignIds()
```

### Minute 3 : Sauvegarde Manuelle
```javascript
claraverseCommands.saveNow()
```

### Minute 4 : Vérification
```javascript
claraverseCommands.getStorageInfo()
```
→ Doit afficher des tables sauvegardées

### Minute 5 : Test de Restauration
1. Actualiser la page (F5)
2. Attendre 2 secondes
3. Vérifier que les données sont là
4. Si non : `claraverseCommands.restoreAll()`

---

## 💡 Conseils Pro

### Conseil 1 : Activer les Logs au Démarrage
```javascript
// Dans la console, avant de faire quoi que ce soit
claraverseCommands.debug.enableVerbose()
```

### Conseil 2 : Sauvegarder Régulièrement
```javascript
// Toutes les 5 minutes, exécuter :
claraverseCommands.saveNow()
```

### Conseil 3 : Export de Sécurité
```javascript
// Avant toute modification importante :
claraverseCommands.exportData()
```

### Conseil 4 : Surveiller l'Espace
```javascript
// Vérifier régulièrement :
claraverseCommands.getStorageInfo()
// Si > 5 MB → exporter et nettoyer
```

---

## 🆘 En Cas d'Échec Total

Si rien ne fonctionne :

### 1. Nettoyer Complètement
```javascript
claraverseCommands.clearAllData()
```

### 2. Actualiser la Page
Appuyez sur **Ctrl+F5** (actualisation forcée)

### 3. Tester à Nouveau
```javascript
claraverseCommands.testPersistence()
```

### 4. Réattribuer les IDs
```javascript
claraverseCommands.forceAssignIds()
```

### 5. Modifier une Cellule
Sélectionner une valeur dans une table

### 6. Vérifier la Sauvegarde
```javascript
claraverseCommands.getStorageInfo()
```

### 7. Tester la Restauration
- Actualiser la page (F5)
- Les données doivent réapparaître

---

## 📞 Checklist de Support

Avant de demander de l'aide, fournir ces informations :

```javascript
// Copier-coller le résultat de ces commandes :

// 1. Test de persistance
claraverseCommands.testPersistence()

// 2. Infos de stockage
claraverseCommands.getStorageInfo()

// 3. Liste des tables
claraverseCommands.debug.listTables()

// 4. Navigateur et version
// (Par exemple : Chrome 120, Firefox 121, etc.)

// 5. Mode de navigation
// (Normal ou Privé/Incognito ?)
```

---

## ✅ Vérification de Bon Fonctionnement

La persistance fonctionne correctement si :

1. ✅ `testPersistence()` affiche "localStorage accessible"
2. ✅ Toutes les tables ont un ID (pas de "❌ AUCUN")
3. ✅ `getStorageInfo()` affiche au moins 1 table sauvegardée
4. ✅ Après F5, les données réapparaissent (avec notification verte)
5. ✅ Les consolidations sont restaurées dans les tables conso/résultat

---

**Version** : 1.0  
**Dernière mise à jour** : 2025  
**Support** : Ouvrir la console (F12) et taper `claraverseCommands.help()`
