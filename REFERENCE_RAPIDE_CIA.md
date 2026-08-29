# 🚀 Référence Rapide - Système CIA

## ✅ Vérification Rapide

### 1. Le Système Fonctionne-t-il ?

**Console (F12):**
```
✅ Chercher ces logs:
⚠️ Duplicate removal DISABLED to preserve all tables including CIA tables
📋 [Claraverse] ✅ Résultat: X table(s) restaurée(s)

❌ Ne PAS voir:
🗑️ Removing duplicate original table...
```

---

## 📁 Fichiers Essentiels

| Fichier | Utilisation | Priorité |
|---------|-------------|----------|
| `public/conso.js` | Gestion complète des tables CIA | ⭐⭐⭐ |
| `src/services/flowiseTableBridge.ts` | Fix suppression tables (ligne 1252) | ⭐⭐⭐ |
| `index.html` | Charge les scripts | ⭐⭐ |
| `public/auto-restore-chat-change.js` | Restauration auto | ⭐⭐ |

---

## 🔧 Commandes Utiles

### Vérifier le LocalStorage
```javascript
// Console
Object.keys(localStorage).filter(k => k.startsWith('claraverse_table_')).length
// Retourne le nombre de tables sauvegardées
```

### Vider le Cache
```javascript
// Console
Object.keys(localStorage)
  .filter(k => k.startsWith('claraverse_') || k.startsWith('checkbox_'))
  .forEach(k => localStorage.removeItem(k));
console.log('✅ Cache vidé');
```

### Voir les Stats
```javascript
// Console
console.log('Tables:', Object.keys(localStorage).filter(k => k.startsWith('claraverse_table_')).length);
console.log('Checkboxes:', Object.keys(localStorage).filter(k => k.startsWith('checkbox_')).length);
```

---

## 🚨 Dépannage Express

### Tables Disparaissent ?
1. Vérifier `flowiseTableBridge.ts` ligne 1252: `if (false) {`
2. Recompiler: `npm run build`
3. Actualiser: Ctrl+F5

### Checkboxes Non Sauvegardées ?
1. Vérifier que `conso.js` est chargé
2. Console: `typeof window.Claraverse`
3. Doit retourner: `"object"`

### Trop de Données ?
```javascript
// Garder seulement les 50 dernières tables
const tables = Object.keys(localStorage)
  .filter(k => k.startsWith('claraverse_table_'))
  .sort()
  .slice(0, -50);
tables.forEach(k => localStorage.removeItem(k));
```

---

## 📊 Monitoring Rapide

```javascript
// Copier/coller dans la console
(function() {
  const tables = Object.keys(localStorage).filter(k => k.startsWith('claraverse_table_')).length;
  const checkboxes = Object.keys(localStorage).filter(k => k.startsWith('checkbox_')).length;
  console.log(`📊 Tables: ${tables} | Checkboxes: ${checkboxes}`);
})();
```

---

## 🎯 Workflow Normal

1. **Charger la page** → Tables restaurées automatiquement
2. **Cocher/décocher** → Sauvegarde auto après 500ms
3. **Actualiser (F5)** → Tout est restauré
4. **Changer de chat** → Tables restaurées dans le nouveau contexte

---

## 📞 Aide Rapide

**Problème persistant ?**
1. Consulter `GUIDE_COMPLET_EXAMEN_CIA_PERSISTANCE.md`
2. Vérifier les logs console
3. Recompiler le TypeScript si modifié

---

**Version:** 1.0 | **Date:** 26 novembre 2025
