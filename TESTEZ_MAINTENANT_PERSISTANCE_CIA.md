# 🧪 TESTEZ MAINTENANT - Persistance Checkboxes CIA

## ⚡ Test Rapide (2 minutes)

### Étape 1 : Ouvrir la Page de Test
```
Ouvrez dans votre navigateur :
public/test-persistance-checkboxes-cia.html
```

### Étape 2 : Charger le Script
1. Cliquez sur le bouton **"📥 Charger conso.js"**
2. Attendez 2 secondes
3. Vous devriez voir : ✅ "Table traitée! Vous pouvez maintenant cocher des checkboxes"

### Étape 3 : Cocher des Checkboxes
1. Cochez **2 ou 3 checkboxes** dans la table
2. Observez qu'elles deviennent vertes (fond #e8f5e8)

### Étape 4 : Vérifier la Sauvegarde
1. Cliquez sur **"💾 Vérifier Sauvegarde"**
2. Regardez la console en bas de la page
3. Vous devriez voir :
   ```
   ✅ 1 table(s) trouvée(s)
   📋 Table: table-xxx
     - Cellules avec checkbox: 5
     - Checkboxes cochées: 2 (ou 3)
   ```

### Étape 5 : Test de Persistance
1. **Rechargez la page** (F5 ou Ctrl+R)
2. Cliquez à nouveau sur **"📥 Charger conso.js"**
3. Attendez 2 secondes
4. **Vérifiez** : Les checkboxes que vous aviez cochées doivent être **toujours cochées** ✅

---

## 🔍 Test dans Votre Application Réelle

### Étape 1 : Vider le Cache (Important!)
```javascript
// Dans la console du navigateur (F12)
claraverseCommands.clearAllData();
```

### Étape 2 : Recharger la Page
```
Appuyez sur F5 ou Ctrl+R
```

### Étape 3 : Trouver une Table CIA
Cherchez une table avec une colonne **"Reponse_user"**

### Étape 4 : Cocher une Checkbox
1. Cliquez sur une checkbox
2. Elle doit devenir verte
3. Attendez 1 seconde

### Étape 5 : Vérifier la Sauvegarde
```javascript
// Dans la console
const data = JSON.parse(localStorage.getItem('claraverse_tables_data'));
console.log('Tables sauvegardées:', Object.keys(data).length);
console.log('Détails:', data);
```

Vous devriez voir :
- **Nombre de tables** : Entre 1 et 20 (seulement les tables CIA)
- **Pas 730 tables** comme avant ✅

### Étape 6 : Test Final
1. **Rechargez la page** (F5)
2. **Attendez 2-3 secondes** que conso.js se charge
3. **Vérifiez** : La checkbox doit être toujours cochée ✅

---

## ❌ Si Ça Ne Marche Pas

### Diagnostic Rapide

```javascript
// 1. Vérifier que conso.js est chargé
console.log(window.claraverseProcessor ? '✅ Chargé' : '❌ Non chargé');

// 2. Vérifier localStorage
const data = localStorage.getItem('claraverse_tables_data');
console.log(data ? '✅ Données présentes' : '❌ Vide');

// 3. Compter les tables CIA
const tables = document.querySelectorAll('table');
let ciaCount = 0;
tables.forEach(t => {
  const headers = Array.from(t.querySelectorAll('th, td')).map(h => h.textContent.toLowerCase());
  if (headers.some(h => /reponse[_\s]?user/i.test(h))) {
    ciaCount++;
    console.log('Table CIA:', t.dataset.tableId || 'sans ID');
  }
});
console.log(`Total tables CIA: ${ciaCount}`);
```

### Diagnostic Complet

Chargez le script de diagnostic :
```html
<script src="public/diagnostic-checkboxes-cia-persistance.js"></script>
```

Ou dans la console :
```javascript
const script = document.createElement('script');
script.src = 'public/diagnostic-checkboxes-cia-persistance.js';
document.head.appendChild(script);
```

---

## ✅ Résultats Attendus

### Avant la Solution
- ❌ 730 tables sauvegardées
- ❌ Quota localStorage dépassé
- ❌ Checkboxes non persistantes
- ❌ Erreur "QuotaExceededError"

### Après la Solution
- ✅ 5-20 tables CIA sauvegardées
- ✅ Quota localStorage OK
- ✅ Checkboxes persistantes
- ✅ Pas d'erreur

---

## 📊 Commandes Utiles

```javascript
// Voir les infos de stockage
claraverseCommands.getStorageInfo();

// Forcer une sauvegarde
claraverseCommands.saveNow();

// Voir toutes les tables
claraverseCommands.listTables();

// Vider le cache (attention!)
claraverseCommands.clearAllData();

// Exporter les données
const backup = claraverseCommands.exportData();
console.log(backup);

// Importer des données
claraverseCommands.importData(backup);
```

---

## 🎯 Critères de Succès

✅ **Test réussi si :**
1. Vous pouvez cocher une checkbox
2. La checkbox reste cochée après rechargement (F5)
3. Le localStorage contient moins de 50 tables
4. Pas d'erreur "QuotaExceededError"
5. Les checkboxes apparaissent automatiquement dans les tables CIA

❌ **Test échoué si :**
1. Les checkboxes n'apparaissent pas
2. Les checkboxes ne restent pas cochées après rechargement
3. Erreur dans la console
4. Plus de 100 tables dans localStorage

---

## 📞 Besoin d'Aide ?

Si le test échoue :
1. Ouvrez la console (F12)
2. Copiez tous les messages d'erreur
3. Exécutez le diagnostic complet
4. Partagez les résultats

---

**Temps estimé** : 2-5 minutes  
**Difficulté** : Facile  
**Prérequis** : Navigateur moderne avec localStorage activé
