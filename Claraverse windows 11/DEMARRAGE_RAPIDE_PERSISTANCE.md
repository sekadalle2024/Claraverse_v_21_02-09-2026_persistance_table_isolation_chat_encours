# 🚀 Démarrage Rapide - Persistance Claraverse

## ⚡ Test en 3 Étapes (1 minute)

### Étape 1 : Ouvrir la Console
Appuyez sur **F12** → Onglet **Console**

### Étape 2 : Tester la Persistance
```javascript
claraverseCommands.testPersistence()
```

### Étape 3 : Corriger si Nécessaire
```javascript
// Si les tables n'ont pas d'ID (affiche "❌ AUCUN")
claraverseCommands.forceAssignIds()

// Puis sauvegarder
claraverseCommands.saveNow()
```

---

## 🔧 Correction Rapide (Si Échec)

### Scénario 1 : Aucune Table Sauvegardée

**Commandes à exécuter dans l'ordre :**

```javascript
// 1. Forcer l'attribution des IDs
claraverseCommands.forceAssignIds()

// 2. Attendre 1 seconde, puis sauvegarder
claraverseCommands.saveNow()

// 3. Vérifier
claraverseCommands.getStorageInfo()
// Devrait afficher : "X table(s)"
```

### Scénario 2 : Données Non Restaurées Après F5

```javascript
// Forcer la restauration
claraverseCommands.restoreAll()
```

---

## 📊 Test Complet (3 minutes)

### 1. Test Initial
```javascript
claraverseCommands.testPersistence()
```
**Attendu :**
- ✅ localStorage accessible
- ✅ X table(s) trouvée(s)
- ✅ Tables ont des IDs

### 2. Modifier une Table
- Cliquer sur une cellule "Assertion" → Sélectionner "Validité"
- Cliquer sur une cellule "Conclusion" → Sélectionner "Non-Satisfaisant"

### 3. Vérifier la Sauvegarde
```javascript
// Attendre 1 seconde, puis :
claraverseCommands.getStorageInfo()
```
**Attendu :**
- Au moins 1 table sauvegardée
- Taille > 0 KB

### 4. Tester la Restauration
- Actualiser la page : **F5**
- Attendre 2 secondes
- Notification verte : "✅ X table(s) restaurée(s)"
- Vérifier que les valeurs sont toujours là

---

## 🆘 Problèmes Courants & Solutions

### "❌ localStorage non accessible"
**Cause :** Navigation privée ou cookies désactivés  
**Solution :** Utiliser le mode normal du navigateur

### "0 table(s) trouvée(s)"
**Cause :** Les tables ne sont pas détectées  
**Solution :** Vérifier que les tables ont les colonnes "Assertion" et "Conclusion"

### "❌ AUCUN" dans la colonne ID
**Cause :** IDs non assignés  
**Solution :**
```javascript
claraverseCommands.forceAssignIds()
claraverseCommands.saveNow()
```

### Tables vides après F5
**Cause :** Restauration non déclenchée  
**Solution :**
```javascript
claraverseCommands.restoreAll()
```

---

## 🎯 Commandes Essentielles

| Commande | Description | Usage |
|----------|-------------|-------|
| `claraverseCommands.help()` | Afficher l'aide | Toujours en premier |
| `claraverseCommands.testPersistence()` | Tester la persistance | Diagnostic rapide |
| `claraverseCommands.forceAssignIds()` | Attribuer les IDs | Si tables sans ID |
| `claraverseCommands.saveNow()` | Sauvegarder maintenant | Force la sauvegarde |
| `claraverseCommands.getStorageInfo()` | Infos stockage | Vérifier l'état |
| `claraverseCommands.restoreAll()` | Restaurer tout | Si F5 ne restaure pas |
| `claraverseCommands.exportData()` | Exporter backup | Sécurité |
| `claraverseCommands.clearAllData()` | Tout effacer | ⚠️ Destructif |

---

## 💡 Workflow Recommandé

### Première Utilisation
```javascript
// 1. Tester
claraverseCommands.testPersistence()

// 2. Corriger si nécessaire
claraverseCommands.forceAssignIds()

// 3. Travailler normalement
// Les données se sauvent automatiquement
```

### Utilisation Quotidienne
```javascript
// Vérifier de temps en temps
claraverseCommands.getStorageInfo()

// Sauvegarder manuellement si besoin
claraverseCommands.saveNow()
```

### Avant de Fermer
```javascript
// Export de sécurité
claraverseCommands.exportData()
```

---

## 🔍 Debug Mode (Pour Développeurs)

### Activer les Logs Détaillés
```javascript
claraverseCommands.debug.enableVerbose()
```

### Voir Toutes les Tables
```javascript
claraverseCommands.debug.listTables()
```

### Voir le Contenu localStorage
```javascript
claraverseCommands.debug.showStorage()
```

---

## ✅ Checklist de Vérification

La persistance fonctionne si :

- [ ] `testPersistence()` → "localStorage accessible" ✅
- [ ] Les tables ont des IDs (pas de "❌ AUCUN")
- [ ] `getStorageInfo()` → Au moins 1 table sauvegardée
- [ ] Après modification → Sauvegarde automatique en 500ms
- [ ] Après F5 → Notification verte "X table(s) restaurée(s)"
- [ ] Les valeurs sont bien restaurées dans les tables

---

## 📋 Script de Test Automatique

Copier-coller dans la console pour un test complet :

```javascript
(async function testPersistenceComplete() {
  console.log("🧪 TEST DE PERSISTANCE COMPLET");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Test 1
  console.log("\n1️⃣ Test localStorage...");
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    console.log("✅ localStorage fonctionne");
  } catch(e) {
    console.error("❌ ÉCHEC:", e);
    return;
  }
  
  // Test 2
  console.log("\n2️⃣ Attribution des IDs...");
  claraverseCommands.forceAssignIds();
  
  // Test 3
  console.log("\n3️⃣ Sauvegarde...");
  claraverseCommands.saveNow();
  
  // Test 4
  await new Promise(r => setTimeout(r, 1000));
  console.log("\n4️⃣ Vérification...");
  const info = claraverseCommands.getStorageInfo();
  
  console.log("\n📊 RÉSULTAT:");
  console.log(`  - Tables sauvegardées: ${info.tableCount}`);
  console.log(`  - Taille: ${info.dataSizeKB} KB`);
  
  if (info.tableCount > 0) {
    console.log("\n✅ PERSISTANCE FONCTIONNELLE");
    console.log("💡 Actualisez (F5) pour tester la restauration");
  } else {
    console.log("\n⚠️ AUCUNE TABLE SAUVEGARDÉE");
    console.log("💡 Vérifiez que vos tables ont les colonnes Assertion/Conclusion");
  }
})();
```

---

## 🎓 Exemples Pratiques

### Exemple 1 : Sauvegarder Avant de Partir
```javascript
// Vérifier l'état
claraverseCommands.getStorageInfo()

// Si OK → Partir
// Si problème → Exporter
claraverseCommands.exportData()
```

### Exemple 2 : Récupérer des Données Perdues
```javascript
// Si vous avez un backup
claraverseCommands.importData(vosDataJSON)

// Puis restaurer
claraverseCommands.restoreAll()
```

### Exemple 3 : Nettoyer et Recommencer
```javascript
// 1. Exporter d'abord (sécurité)
claraverseCommands.exportData()

// 2. Nettoyer
claraverseCommands.clearAllData()

// 3. Actualiser
// F5

// 4. Réattribuer les IDs
claraverseCommands.forceAssignIds()
```

---

## 📞 Besoin d'Aide ?

Si le problème persiste :

1. Exécuter dans la console :
```javascript
claraverseCommands.testPersistence()
claraverseCommands.getStorageInfo()
claraverseCommands.debug.listTables()
```

2. Faire une capture d'écran des résultats

3. Noter :
   - Navigateur et version
   - Mode de navigation (normal/privé)
   - Message d'erreur éventuel

---

**🚀 Prêt à démarrer !**

Ouvrez la console (F12) et tapez :
```javascript
claraverseCommands.testPersistence()
```

**Version** : 1.0  
**Support** : `claraverseCommands.help()`
