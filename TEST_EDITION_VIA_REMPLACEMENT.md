# 🧪 Test - Édition via Remplacement de Ligne

## 🎯 Principe

**Modifier une cellule = Supprimer l'ancienne ligne + Ajouter nouvelle ligne**

Cette approche utilise le système de sauvegarde existant qui fonctionne déjà pour l'ajout/suppression de lignes.

---

## ⚡ Test Rapide (2 minutes)

### Étape 1 : Recharger

1. **F5** (recharger la page)
2. **Attendre** 3 secondes
3. **Ouvrir** la console (F12)

### Étape 2 : Vérifier l'Initialisation

Dans la console, vous devriez voir :

```
🔧 Initialisation: Édition via remplacement de ligne
✅ Menu.js détecté, activation de l'édition de cellules
✏️ Table activée pour l'édition: X cellules
```

### Étape 3 : Modifier une Cellule

1. **Double-cliquer** sur une cellule (n'importe laquelle)
2. **Observer** :
   - Fond jaune
   - Bordure orange
   - Curseur texte
3. **Modifier** le contenu (ex: "TEST REMPLACEMENT")
4. **Appuyer** sur Enter ou cliquer ailleurs

### Étape 4 : Observer la Sauvegarde

Dans la console :

```
✏️ Édition cellule [2, 3]
🔄 Remplacement de ligne: ["val1", "val2", "TEST REMPLACEMENT", "val4"]
💾 Événement de sauvegarde déclenché
```

**Visuel** :
- Ligne devient verte pendant 1,5 secondes
- Notification "💾 Sauvegardé" en haut à droite

### Étape 5 : Recharger et Vérifier

1. **F5** (recharger)
2. **Attendre** 5 secondes (restauration automatique)
3. **Chercher** la cellule modifiée
4. **Vérifier** que "TEST REMPLACEMENT" est toujours là

**Résultat attendu** : ✅ **Modification persistante !**

---

## 🎮 Fonctionnalités

### Édition

- **Double-clic** sur une cellule pour éditer
- **Enter** pour valider
- **Escape** pour annuler
- **Clic ailleurs** pour valider

### Indicateurs Visuels

| État | Visuel |
|------|--------|
| En édition | Fond jaune + bordure orange |
| Sauvegardé | Ligne verte pendant 1,5s |
| Notification | "💾 Sauvegardé" en haut à droite |

### Automatique

- ✅ Toutes les tables sont automatiquement éditables
- ✅ Sauvegarde automatique via le système existant
- ✅ Restauration automatique au rechargement

---

## 🔍 Vérification

### Console Logs

**Après modification** :
```
✏️ Édition cellule [rowIndex, cellIndex]
🔄 Remplacement de ligne: [données]
💾 Événement de sauvegarde déclenché
```

### IndexedDB

```javascript
// Vérifier les données sauvegardées
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    const cellEdits = getAll.result.filter(t => t.source === 'cell-edit');
    console.log('Éditions de cellules:', cellEdits.length);
  };
};
```

---

## 📊 Avantages de Cette Approche

### 1. Utilise ce qui Fonctionne

- ✅ Système de sauvegarde existant
- ✅ Pas de nouveau système complexe
- ✅ Restauration automatique garantie

### 2. Simple et Fiable

- ✅ Logique claire : remplacement de ligne
- ✅ Pas de gestion de tableId complexe
- ✅ Pas de conflit avec d'autres systèmes

### 3. Transparent pour l'Utilisateur

- ✅ Double-clic pour éditer
- ✅ Sauvegarde automatique
- ✅ Restauration automatique

---

## ✅ Checklist

- [ ] Page rechargée (F5)
- [ ] Console affiche l'initialisation
- [ ] Tables détectées
- [ ] Double-clic fonctionne
- [ ] Cellule éditable (fond jaune)
- [ ] Modification effectuée
- [ ] Enter ou clic ailleurs
- [ ] Ligne devient verte
- [ ] Notification "💾 Sauvegardé"
- [ ] Console affiche "Remplacement de ligne"
- [ ] F5 effectué
- [ ] Modification toujours présente

---

## 🚨 Si Ça Ne Fonctionne Pas

### Vérification 1 : Script Chargé

```javascript
console.log(window.cellEditViaRowReplacement);
// Résultat attendu: { version: '1.0', enableTable: function }
```

### Vérification 2 : Tables Activées

```javascript
document.querySelectorAll('table[data-cell-edit-enabled]').length
// Résultat attendu: > 0
```

### Vérification 3 : Événement Émis

```javascript
// Écouter l'événement
document.addEventListener('flowise:table:structure:changed', (e) => {
  console.log('Événement reçu:', e.detail);
});
```

---

## 🎯 Résultat Attendu

**Avant** :
- ❌ Systèmes complexes ne fonctionnant pas
- ❌ Modifications perdues

**Après** :
- ✅ **Approche simple via remplacement de ligne**
- ✅ **Utilise le système existant**
- ✅ **Modifications persistantes**

---

## 🎉 Succès !

Si le test passe :
- ✅ **Édition de cellules fonctionne**
- ✅ **Sauvegarde automatique**
- ✅ **Persistance garantie**

**Profitez de votre système d'édition simple et fiable !** 🚀

---

*Test créé le 17 novembre 2025*
