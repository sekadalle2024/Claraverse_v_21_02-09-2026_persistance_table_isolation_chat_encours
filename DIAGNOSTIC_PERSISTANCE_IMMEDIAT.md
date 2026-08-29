# 🔍 Diagnostic Persistance Immédiat

## 🎯 Objectif

Comprendre pourquoi les checkboxes ne sont pas persistantes.

## 🧪 Test de diagnostic (5 minutes)

### Étape 1 : Ouvrir la page de debug

```
public/test-persistance-debug.html
```

### Étape 2 : Ouvrir la console (F12)

### Étape 3 : Observer les logs au chargement

Chercher ces messages :
```
🔍 DIAGNOSTIC CIA - Démarrage
📝 Examen CIA Integration - Chargement
🔧 Configuration table CIA...
🔑 ID table généré: ...
✅ Checkboxes créées
📊 Tables CIA détectées: 1
```

✅ **Noter l'ID généré**

### Étape 4 : Vérifier localStorage au démarrage

Dans les logs, chercher :
```
📦 localStorage CIA au démarrage:
```

**Question :** Y a-t-il des données ?
- ✅ OUI → Passer à l'étape 5
- ❌ NON → C'est normal au premier chargement

### Étape 5 : Cocher une checkbox

1. Cocher "Option A"
2. Observer les logs :
   ```
   💾 localStorage.setItem: cia_exam_...
      Valeur: {"states":[...]}
   💾 État sauvegardé: cia_exam_... → 1 cochée(s)
   ```

✅ **Vérifier que la sauvegarde se fait**

### Étape 6 : Cliquer sur "🧪 Test manuel"

Observer les logs :
```
🧪 TEST MANUEL
Table: [object HTMLTableElement]
ID table: cia_Question_Option_Reponse_user_...
Checkboxes: 3
  Checkbox 0: checked=true, rowIndex=0
  Checkbox 1: checked=false, rowIndex=1
  Checkbox 2: checked=false, rowIndex=2
localStorage keys: ["cia_exam_..."]
  cia_exam_...: {states: [...], timestamp: ...}
```

✅ **Vérifier que :**
- L'ID table existe
- Les checkboxes existent
- localStorage contient les données
- La clé localStorage correspond à l'ID table

### Étape 7 : Noter l'ID exact

**ID table :** `_________________________________`

**Clé localStorage :** `_________________________________`

**Sont-ils identiques ?** ☐ OUI  ☐ NON

### Étape 8 : Actualiser la page (F5)

### Étape 9 : Observer les logs après actualisation

Chercher :
```
🔍 DIAGNOSTIC CIA - Démarrage
📝 Examen CIA Integration - Chargement
🔧 Configuration table CIA...
🔑 ID table généré: ...
✅ Checkboxes créées
📖 localStorage.getItem: cia_exam_...
   Résultat: {"states":[...]}
✅ État restauré: cia_exam_... → 1 cochée(s)
```

### Étape 10 : VÉRIFICATION CRITIQUE

**L'ID généré après F5 est-il identique à celui de l'étape 3 ?**

☐ OUI → Le problème est ailleurs
☐ NON → **C'EST LE PROBLÈME !**

### Étape 11 : Cliquer à nouveau sur "🧪 Test manuel"

Vérifier :
- La checkbox est-elle cochée visuellement ?
- Le log montre-t-il `checked=true` ?
- localStorage contient-il les bonnes données ?

---

## 📊 Analyse des résultats

### Cas 1 : L'ID change à chaque fois

**Symptôme :**
- ID au chargement : `cia_Question_Option_Reponse_user_ABC`
- ID après F5 : `cia_Question_Option_Reponse_user_XYZ`

**Cause :** Le contenu de la table change ou l'algorithme d'ID n'est pas stable

**Solution :** Utiliser un ID encore plus stable (voir ci-dessous)

### Cas 2 : localStorage ne se remplit pas

**Symptôme :**
- Pas de log `💾 localStorage.setItem`
- localStorage vide après avoir coché

**Cause :** La fonction `saveState` n'est pas appelée

**Solution :** Vérifier que l'event listener est bien attaché

### Cas 3 : localStorage se remplit mais ne se restaure pas

**Symptôme :**
- Log `💾 localStorage.setItem` présent
- Log `📖 localStorage.getItem` présent
- Mais pas de log `✅ État restauré`

**Cause :** La fonction `restoreState` échoue

**Solution :** Vérifier les erreurs dans la console

### Cas 4 : Tout semble fonctionner dans les logs mais pas visuellement

**Symptôme :**
- Logs corrects
- localStorage correct
- Mais checkbox non cochée visuellement

**Cause :** Un autre script modifie les checkboxes après la restauration

**Solution :** Augmenter le délai de restauration ou désactiver les autres scripts

---

## 🔧 Solutions selon le diagnostic

### Solution 1 : ID plus stable

Si l'ID change, utiliser un hash du contenu :

```javascript
function getTableId(table) {
    if (table.dataset.ciaTableId) {
        return table.dataset.ciaTableId;
    }

    // Utiliser TOUT le contenu de la table
    const content = table.textContent.trim().replace(/\s+/g, '_');
    const hash = content.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    const id = `cia_table_${Math.abs(hash)}`;
    table.dataset.ciaTableId = id;
    
    console.log("🔑 ID table généré (hash):", id);
    return id;
}
```

### Solution 2 : Restauration plus agressive

Si la restauration ne fonctionne pas, essayer plusieurs fois :

```javascript
function setupTable(table) {
    // ... code existant ...
    
    // Restaurer plusieurs fois
    [100, 500, 1000, 2000, 5000].forEach(delay => {
        setTimeout(() => {
            console.log(`🔄 Restauration à ${delay}ms`);
            restoreState(table);
        }, delay);
    });
}
```

### Solution 3 : Forcer la restauration au clic

Si un autre script interfère, restaurer à chaque clic :

```javascript
checkbox.addEventListener("click", () => {
    setTimeout(() => {
        restoreState(table);
    }, 100);
});
```

---

## 📝 Rapport de diagnostic

```
Date : _____________
Navigateur : _____________

Étape 3 - ID initial : _________________________________
Étape 9 - ID après F5 : _________________________________

IDs identiques ? ☐ OUI  ☐ NON

localStorage se remplit ? ☐ OUI  ☐ NON

localStorage se lit ? ☐ OUI  ☐ NON

Checkbox cochée visuellement après F5 ? ☐ OUI  ☐ NON

Logs "✅ État restauré" présents ? ☐ OUI  ☐ NON

Erreurs dans la console ? ☐ OUI  ☐ NON

Notes :
_________________________________________________________
_________________________________________________________
_________________________________________________________
```

---

**🚀 Commencez le diagnostic avec `test-persistance-debug.html` !**
