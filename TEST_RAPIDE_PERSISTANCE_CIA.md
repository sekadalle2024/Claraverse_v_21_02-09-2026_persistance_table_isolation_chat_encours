# ⚡ Test Rapide - Persistance CIA

## Test en 3 minutes

### Étape 1: Ouvrir la page de test (30 secondes)

```bash
# Ouvrir dans le navigateur
public/test-cia-persistance.html
```

### Étape 2: Vérifier le chargement (30 secondes)

Ouvrir la console (F12) et vérifier ces messages:

```
✅ Menu contextuel (Core) ClaraVerse chargé
✅ Menu Alpha (Extension CIA) chargé
✅ dev.js détecté
🎓 Extensions CIA initialisées avec succès
🎓 2 table(s) CIA détectée(s)
```

**Si ces messages apparaissent:** ✅ Tout est OK, continuer

**Si ces messages n'apparaissent pas:** ❌ Voir [Dépannage](#dépannage)

### Étape 3: Tester la sauvegarde (1 minute)

1. **Cocher une checkbox** dans la première table
2. **Vérifier la console:**
   ```
   ✅ Checkbox CIA cochée: ligne X
   💾 État des checkboxes CIA sauvegardé (localStorage + IndexedDB)
   ```

**Si ces messages apparaissent:** ✅ Sauvegarde OK

**Si ces messages n'apparaissent pas:** ❌ Voir [Dépannage](#dépannage)

### Étape 4: Tester la persistance (1 minute)

1. **Actualiser la page** (F5)
2. **Vérifier que la checkbox reste cochée** ✅
3. **Vérifier la console:**
   ```
   🔄 Restauration de 2 table(s) CIA...
   ✅ État des checkboxes CIA restauré
   ```

**Si la checkbox reste cochée:** ✅ **SUCCÈS!** La persistance fonctionne!

**Si la checkbox est décochée:** ❌ Voir [Dépannage](#dépannage)

## Diagnostic automatique

### Lancer le diagnostic

Cliquer sur le bouton **"🔍 Lancer le diagnostic"** sur la page de test

OU dans la console:

```javascript
window.diagnosticCIAPersistance()
```

### Résultat attendu

```
📊 RÉSUMÉ DU DIAGNOSTIC
==================================================

✅ dev.js: Présent
📊 Tables totales: 2
🎓 Tables CIA: 2
💾 Entrées localStorage: 2

📋 Détails des tables:

Table 1:
  - ID: table_cia_0_Ref_question_Question_Option_3x6
  - Checkboxes: 3
  - Cochées: 1

Table 2:
  - ID: table_cia_1_Ref_question_Question_Option_2x6
  - Checkboxes: 2
  - Cochées: 0

==================================================
✅ Diagnostic terminé
```

## Dépannage

### ❌ dev.js non détecté

**Vérifier:**
```javascript
// Console (F12)
console.log(window.claraverseSyncAPI ? "✅ Présent" : "❌ Absent");
```

**Solution:**
- Vérifier que `dev.js` est chargé avant `menu_alpha_simple.js`
- Vérifier qu'il n'y a pas d'erreur JavaScript

### ❌ Tables CIA non détectées

**Vérifier:**
```javascript
// Console (F12)
const tables = document.querySelectorAll("table[data-cia-table='true']");
console.log(`${tables.length} table(s) CIA`);
```

**Solution:**
- Vérifier que les tables ont une colonne "Reponse_user"
- Attendre 5 secondes après le chargement

### ❌ Checkboxes non sauvegardées

**Vérifier:**
```javascript
// Console (F12)
const keys = Object.keys(localStorage).filter(k => k.includes("cia_checkboxes"));
console.log(`${keys.length} entrée(s) localStorage`);
```

**Solution:**
- Cocher une checkbox et attendre 1 seconde
- Vérifier qu'il n'y a pas d'erreur dans la console

### ❌ Checkboxes non restaurées

**Vérifier:**
```javascript
// Console (F12)
const table = document.querySelector("table[data-cia-table='true']");
console.log("ID:", table.dataset.claraverseId);

const lsKey = Object.keys(localStorage).find(k => k.includes("cia_checkboxes"));
console.log("Clé localStorage:", lsKey);
```

**Solution:**
- Vérifier que les IDs correspondent
- Attendre 5 secondes après l'actualisation

## Commandes utiles

### Afficher localStorage

```javascript
// Console (F12)
Object.keys(localStorage)
    .filter(k => k.includes("cia_checkboxes"))
    .forEach(k => {
        const data = JSON.parse(localStorage.getItem(k));
        console.log(k, data);
    });
```

### Vider le cache CIA

```javascript
// Console (F12)
Object.keys(localStorage)
    .filter(k => k.includes("cia_checkboxes"))
    .forEach(k => localStorage.removeItem(k));
console.log("✅ Cache vidé");
location.reload();
```

### Forcer la sauvegarde

```javascript
// Console (F12)
const table = document.querySelector("table[data-cia-table='true']");
await window.claraverseSyncAPI.forceSaveTable(table);
console.log("✅ Sauvegarde forcée");
```

## Checklist rapide

- [ ] Page de test ouverte
- [ ] Console ouverte (F12)
- [ ] Messages de chargement visibles
- [ ] dev.js détecté
- [ ] Tables CIA détectées
- [ ] Checkbox cochée
- [ ] Message de sauvegarde visible
- [ ] Page actualisée (F5)
- [ ] Checkbox toujours cochée ✅

**Toutes les cases cochées?** ✅ **SUCCÈS!**

## Résultat attendu

✅ Les checkboxes restent cochées après actualisation
✅ La sauvegarde fonctionne (localStorage + IndexedDB)
✅ La restauration fonctionne automatiquement
✅ Le diagnostic confirme le bon fonctionnement

## Prochaines étapes

1. ✅ Test réussi → Intégrer dans l'application
2. ❌ Test échoué → Consulter [FIX_PERSISTANCE_CIA.md](FIX_PERSISTANCE_CIA.md)

---

**Temps total:** 3 minutes
**Difficulté:** Facile
**Prérequis:** Navigateur moderne avec console
