# 🧪 Test CIA sans menu.js et conso.js

## ✅ Désactivation temporaire

**Fichiers désactivés dans `index.html`:**
- `menu.js` - Commenté
- `conso.js` - Commenté

## 🎯 Objectif du test

Vérifier si `menu.js` ou `conso.js` sont responsables de la disparition des tables CIA.

## 📋 Procédure de test

1. **Rechargez** l'application (Ctrl+F5)
2. **Créez** une table CIA dans le chat
3. **Observez** si la table reste visible
4. **Cochez** une checkbox
5. **Actualisez** (F5)
6. **Vérifiez** la persistance

## ✅ Si ça fonctionne

Alors le problème vient de `menu.js` ou `conso.js`.

**Prochaine étape:**
- Réactiver un par un pour identifier le coupable
- Modifier le script problématique pour ignorer les tables CIA

## ❌ Si ça ne fonctionne pas

Alors le problème vient d'un autre script.

**Scripts restants à tester:**
- `examen_cia.js`
- `examen-cia-auto-fix.js`
- `modelisation-ultra-compact.js`
- Ou un script TypeScript dans `src/`

## 🔄 Pour réactiver

Décommentez dans `index.html`:
```html
<script src="/menu.js"></script>
<script src="/conso.js"></script>
```

## 📊 Logs à surveiller

Dans la console:
```
✅ Table CIA configurée avec succès (protégée)
🛡️ Table CIA ignorée par Flowise
🛡️ Table CIA ignorée par wrap-tables-auto
```

Si vous voyez:
```
💥 TABLE CIA SUPPRIMÉE DU DOM!
```

Alors le diagnostic temps réel a capturé le coupable avec la stack trace.

---

**Testez maintenant et partagez le résultat!**
