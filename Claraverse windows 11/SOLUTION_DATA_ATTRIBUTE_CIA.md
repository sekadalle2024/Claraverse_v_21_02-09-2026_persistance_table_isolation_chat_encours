# ✅ SOLUTION DATA-ATTRIBUTE CIA

## 🎯 Nouvelle approche

Au lieu d'essayer de restaurer les checkboxes directement, nous **stockons les états dans un attribut `data-cia-states` sur la table**.

## 📝 Comment ça fonctionne

### 1. Sauvegarde (TypeScript)

Quand une table est sauvegardée :
```typescript
// Extrait les états des checkboxes
const states = [{index: 0, checked: true}, {index: 1, checked: false}, ...]

// Stocke dans l'attribut data-cia-states
table.setAttribute('data-cia-states', JSON.stringify(states))

// Sauvegarde le HTML (avec l'attribut)
```

### 2. Restauration (TypeScript)

Quand la table est restaurée :
```typescript
// Le HTML restauré contient l'attribut data-cia-states
<table data-cia-states='[{"index":0,"checked":true},...]'>
```

### 3. Application (JavaScript)

Le script `cia-restore-from-data-attr.js` :
```javascript
// Détecte les tables avec data-cia-states
// Attend que les checkboxes soient créées
// Lit l'attribut et applique les états
// Nettoie l'attribut
```

## ✅ Avantages

- ✅ **Pas de problème de timing** : Les états sont dans le HTML
- ✅ **Pas de conflit avec React** : Le script JavaScript lit simplement l'attribut
- ✅ **Robuste** : Fonctionne même si React recrée le DOM
- ✅ **Simple** : Une seule source de vérité (l'attribut data-)

## 🧪 TEST MAINTENANT

### 1. Recompiler

```bash
npm run build
```

### 2. Redémarrer

```bash
npm run dev
```

### 3. Tester

1. Générer une table CIA avec Flowise
2. Cocher des checkboxes
3. Actualiser (F5)
4. ✅ Les checkboxes doivent rester cochées

## 📊 Logs attendus

### Sauvegarde
```
💾 CIA: Extracted 5 checkbox states, 2 checked
✅ Table saved: [id]
```

### Restauration
```
🔍 CIA: Table avec data-cia-states détectée
✅ CIA: Restauration de 5 états depuis data-attribute
✅ CIA: 2 checkbox(es) cochée(s) restaurée(s)
```

## 🔧 Fichiers modifiés

1. `src/services/flowiseTableService.ts` - Ajoute l'attribut data-cia-states
2. `public/cia-restore-from-data-attr.js` - Lit et applique les états
3. `index.html` - Charge le nouveau script

---

**🚀 C'est la solution la plus simple et la plus robuste !**
