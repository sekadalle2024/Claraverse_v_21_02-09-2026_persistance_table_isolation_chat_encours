# 🧪 Test Fix Persistance CIA - 3 minutes

## ⚡ Test rapide

### 1️⃣ Vider le cache (10 secondes)

Ouvrir la console (F12) et exécuter :
```javascript
Object.keys(localStorage).filter(k => k.includes('cia')).forEach(k => localStorage.removeItem(k))
```

Actualiser la page (F5)

### 2️⃣ Ouvrir la page de test (10 secondes)

```
public/test-cia-minimaliste.html
```

### 3️⃣ Vérifier les logs initiaux (20 secondes)

Dans la console, chercher :
```
📝 Examen CIA Integration - Chargement
🔑 ID table généré: cia_...
✅ Checkboxes créées
📊 2 table(s) CIA configurée(s)
✅ Examen CIA Integration prêt
ℹ️ Aucun état sauvegardé pour: cia_exam_...
```

✅ **Noter l'ID généré** (important pour la suite)

### 4️⃣ Cocher une checkbox (10 secondes)

1. Cocher "Option A" dans la Table #1
2. Observer les logs :
   ```
   💾 État sauvegardé: cia_exam_... → 1 cochée(s)
   ```

✅ **Vérifier que la clé commence par `cia_exam_`**

### 5️⃣ Vérifier localStorage (20 secondes)

Dans la console :
```javascript
Object.keys(localStorage).filter(k => k.includes('cia'))
```

Résultat attendu :
```
["cia_exam_Question_Option_Reponse_user_..."]
```

✅ **La clé doit exister**

### 6️⃣ Actualiser la page (10 secondes)

Appuyer sur F5

### 7️⃣ VÉRIFICATION CRITIQUE (30 secondes)

Dans la console, chercher :
```
🔑 ID table généré: cia_...
```

✅ **L'ID doit être IDENTIQUE à celui de l'étape 3**

Puis chercher :
```
✅ État restauré: cia_exam_... → 1 cochée(s)
```

✅ **La checkbox "Option A" doit être cochée**

### 8️⃣ Test avec plusieurs checkboxes (30 secondes)

1. Cocher "Option B" dans la Table #1
   - Observer : Option A se décoche automatiquement
   - Logs : `💾 État sauvegardé: ... → 1 cochée(s)`

2. Cocher "Option A" dans la Table #2
   - Logs : `💾 État sauvegardé: ... → 1 cochée(s)`

3. Actualiser (F5)

4. Vérifier :
   - Table #1 : Option B cochée ✅
   - Table #2 : Option A cochée ✅

### 9️⃣ Vérifier localStorage final (20 secondes)

```javascript
Object.keys(localStorage).filter(k => k.includes('cia')).forEach(k => {
    console.log(k, "→", JSON.parse(localStorage.getItem(k)));
});
```

Résultat attendu :
```
cia_exam_... → {states: [...], timestamp: ...}
cia_exam_... → {states: [...], timestamp: ...}
```

✅ **Deux entrées (une par table)**

---

## ✅ Résultat du test

### ✅ SUCCÈS si :

- [ ] L'ID de la table est identique avant et après F5
- [ ] Les logs affichent "💾 État sauvegardé"
- [ ] Les logs affichent "✅ État restauré"
- [ ] Les checkboxes restent cochées après F5
- [ ] localStorage contient les bonnes clés
- [ ] Aucune erreur dans la console

### ❌ ÉCHEC si :

- [ ] L'ID change après F5
- [ ] Pas de log "💾 État sauvegardé"
- [ ] Pas de log "✅ État restauré"
- [ ] Les checkboxes se décochent après F5
- [ ] localStorage est vide
- [ ] Erreurs dans la console

---

## 🐛 Dépannage rapide

### Problème : L'ID change à chaque fois

**Cause :** Le contenu de la table change

**Solution :**
```javascript
// Vérifier le contenu de la table
document.querySelectorAll('table[data-cia-table="true"]').forEach(t => {
    console.log("Headers:", Array.from(t.querySelectorAll('th')).map(h => h.textContent));
    console.log("First row:", Array.from(t.querySelectorAll('tr:nth-child(2) td')).map(c => c.textContent));
});
```

### Problème : Pas de log "💾 État sauvegardé"

**Cause :** Le script ne détecte pas le changement

**Solution :**
1. Vérifier que le script est chargé
2. Vérifier qu'aucun autre script n'interfère
3. Recharger la page

### Problème : localStorage vide

**Cause :** Erreur de sauvegarde

**Solution :**
1. Vérifier les erreurs dans la console
2. Vérifier que localStorage est activé
3. Vérifier l'espace disponible

---

## 📊 Commandes utiles

### Voir toutes les tables CIA
```javascript
document.querySelectorAll('table[data-cia-table="true"]')
```

### Voir tous les IDs
```javascript
document.querySelectorAll('table[data-cia-table="true"]').forEach(t => {
    console.log("ID:", t.dataset.ciaTableId);
});
```

### Voir toutes les checkboxes
```javascript
document.querySelectorAll('.cia-checkbox')
```

### Voir localStorage CIA
```javascript
Object.keys(localStorage).filter(k => k.includes('cia'))
```

### Voir le détail d'une entrée
```javascript
Object.keys(localStorage).filter(k => k.includes('cia')).forEach(k => {
    console.log(k);
    console.log(JSON.parse(localStorage.getItem(k)));
});
```

### Vider le cache CIA
```javascript
Object.keys(localStorage).filter(k => k.includes('cia')).forEach(k => localStorage.removeItem(k))
```

---

## 📝 Notes de test

```
Date : _____________
Navigateur : _____________

Étape 3 - ID initial : _________________________________
Étape 7 - ID après F5 : _________________________________

IDs identiques ? ☐ OUI  ☐ NON

Checkboxes persistantes ? ☐ OUI  ☐ NON

localStorage contient les données ? ☐ OUI  ☐ NON

Erreurs console ? ☐ OUI  ☐ NON

Notes :
_________________________________________________________
_________________________________________________________
```

---

**Temps total : 3 minutes**  
**Statut attendu : ✅ SUCCÈS**
