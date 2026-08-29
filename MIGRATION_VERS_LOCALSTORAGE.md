# 🔄 Migration vers localStorage (sans dev.js)

## En 2 minutes

### Étape 1: Remplacer le script dans index.html

**Avant:**
```html
<script src="public/dev.js"></script>
<script src="public/menu.js"></script>
<script src="public/menu_alpha_simple.js"></script>
```

**Après:**
```html
<!-- Supprimer dev.js et menu_alpha_simple.js -->
<script src="public/menu.js"></script>
<script src="public/menu_alpha_localstorage.js"></script>
```

### Étape 2: Tester

```bash
# Ouvrir dans le navigateur
public/test-cia-localstorage.html
```

1. Cocher une checkbox
2. Actualiser (F5)
3. Vérifier que la checkbox reste cochée ✅

### Étape 3: Vérifier

Console (F12) doit afficher:
```
✅ Menu Alpha CIA chargé (localStorage uniquement)
🎓 X table(s) CIA détectée(s) et configurée(s)
```

## C'est tout! 🎉

Votre système CIA fonctionne maintenant **sans dev.js**.

## Avantages

✅ **Plus simple** - Aucune dépendance
✅ **Plus léger** - ~400 lignes vs ~2000
✅ **Plus rapide** - Moins de code à charger
✅ **Plus fiable** - Moins de points de défaillance

## Différences

| Fonctionnalité | Avec dev.js | Sans dev.js |
|----------------|-------------|-------------|
| Persistance | IndexedDB | localStorage |
| Limite stockage | Illimitée | 5-10 MB |
| Dépendances | dev.js requis | Aucune |
| Complexité | Élevée | Simple |
| Performance | Excellente | Excellente |

## Notes importantes

### localStorage est suffisant si:

- ✅ Vous avez < 500 tables CIA
- ✅ Vos tables sont de taille normale
- ✅ Vous voulez une solution simple

### Revenir à dev.js si:

- ⚠️ Vous dépassez la limite de localStorage
- ⚠️ Vous avez des milliers de tables
- ⚠️ Vous utilisez déjà dev.js pour autre chose

## Vérification rapide

```javascript
// Console (F12)

// 1. Vérifier que menu_alpha_localstorage.js est chargé
console.log("CIA localStorage:", typeof window !== 'undefined');

// 2. Compter les tables CIA
const ciaTables = document.querySelectorAll("table[data-cia-table='true']");
console.log(`${ciaTables.length} table(s) CIA`);

// 3. Vérifier localStorage
const ciaKeys = Object.keys(localStorage).filter(k => k.includes("cia_"));
console.log(`${ciaKeys.length} entrée(s) localStorage`);
```

## Rollback (retour en arrière)

Si vous voulez revenir à dev.js:

```html
<!-- Restaurer l'ancien code -->
<script src="public/dev.js"></script>
<script src="public/menu.js"></script>
<script src="public/menu_alpha_simple.js"></script>
```

## Support

- **Documentation:** [SOLUTION_FINALE_CIA_LOCALSTORAGE.md](SOLUTION_FINALE_CIA_LOCALSTORAGE.md)
- **Test:** [public/test-cia-localstorage.html](public/test-cia-localstorage.html)

---

**Migration:** 2 minutes
**Difficulté:** Facile
**Risque:** Faible
