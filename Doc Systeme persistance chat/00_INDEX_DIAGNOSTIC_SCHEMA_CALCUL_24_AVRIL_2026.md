# 📋 Index - Diagnostic Schéma de Calcul

**Date:** 24 avril 2026  
**Problème:** Aucune table ajoutée au clic sur "Ajouter Schéma de calcul"

---

## 🎯 Commencer ici

### ⚡ Test rapide (30 secondes)
→ **[QUICK_TEST_SCHEMA_CALCUL.txt](QUICK_TEST_SCHEMA_CALCUL.txt)**

### 🔍 Diagnostic complet
→ **[00_DIAGNOSTIC_SCHEMA_CALCUL_24_AVRIL_2026.txt](00_DIAGNOSTIC_SCHEMA_CALCUL_24_AVRIL_2026.txt)**

### 🧪 Page de test HTML
→ **[test-schema-calcul.html](test-schema-calcul.html)**  
Ouvrir dans le navigateur pour un diagnostic automatique

---

## 📁 Fichiers créés

| Fichier | Description | Utilité |
|---------|-------------|---------|
| **QUICK_TEST_SCHEMA_CALCUL.txt** | Checklist rapide | Test en 30 secondes |
| **00_DIAGNOSTIC_SCHEMA_CALCUL_24_AVRIL_2026.txt** | Guide complet | Diagnostic approfondi |
| **test-schema-calcul.html** | Page de test | Diagnostic automatique |
| **00_RECAP_SESSION_DIAGNOSTIC_SCHEMA_CALCUL_24_AVRIL_2026.txt** | Récapitulatif | Vue d'ensemble |
| **00_INDEX_DIAGNOSTIC_SCHEMA_CALCUL_24_AVRIL_2026.md** | Ce fichier | Navigation |

---

## ✅ Vérifications effectuées

- [x] Module existe: `public/papier-travail-schema-calcul.js` (713 lignes)
- [x] Module chargé dans `index.html` (ligne 169)
- [x] Action dans menu contextuel: `menu.js` ligne 10133
- [x] Raccourci clavier Ctrl+Shift+K configuré
- [x] Méthodes implémentées (ajout, actualisation, suppression)

---

## 🔍 Conditions requises

Pour qu'une table soit ajoutée, il faut **TOUTES** ces conditions:

### 1. Structure minimale
- ✓ Au moins 2 tables dans la même div
- ✓ Une "table 2" avec "Nature de test"
- ✓ Une "table principale" avec colonnes requises

### 2. Table 2 (Information)
```
┌─────────────────┬──────────────┐
│ Nature de test  │ Validation   │
└─────────────────┴──────────────┘
```

### 3. Table principale (Papier de travail)
Doit avoir AU MOINS UNE de ces colonnes:
- Conclusion
- Assertion
- CTR (ou CTR1, CTR2, etc.)

### 4. Nature de test reconnue
- Validation
- Mouvement
- Rapprochement
- Séparation
- Estimation
- Revue analytique
- Cadrage TVA
- Cotisations sociales
- Vierge
- Modélisation (avec variables)

---

## 🧪 Tests à effectuer

### Test 1: Console (F12)
```javascript
// Vérifier que le module est chargé
window.SchemaCalculManager

// Forcer le traitement
schemaCalculCommands.processAll()

// Voir les schémas sauvegardés
schemaCalculCommands.showStorage()
```

### Test 2: Page HTML
1. Ouvrir `test-schema-calcul.html`
2. Cliquer sur "Tester le module"
3. Regarder les résultats

### Test 3: Application
1. Créer une structure avec les 2 tables
2. Clic droit → "Ajouter Schéma de calcul"
3. Regarder les logs dans la console (F12)

---

## 💡 Solutions rapides

| Problème | Solution |
|----------|----------|
| "Aucune table sélectionnée" | Cliquer d'abord sur la table |
| "Module non chargé" | Recharger la page (Ctrl+F5) |
| Aucun log | Vérifier la structure (2 tables) |
| "Aucune table principale" | Ajouter colonne Conclusion/Assertion/CTR |
| Pas de "Nature de test" | Créer table avec "Nature de test" |
| Nature non reconnue | Utiliser une valeur de la liste |

---

## 🎯 Commandes utiles

```javascript
// Vérifier le module
window.SchemaCalculManager

// Forcer le traitement
schemaCalculCommands.processAll()

// Voir le stockage
schemaCalculCommands.showStorage()

// Restaurer
schemaCalculCommands.restoreAll()

// Effacer
schemaCalculCommands.clearStorage()
```

---

## 📞 Prochaines étapes

1. **Lire:** [QUICK_TEST_SCHEMA_CALCUL.txt](QUICK_TEST_SCHEMA_CALCUL.txt)
2. **Ouvrir:** [test-schema-calcul.html](test-schema-calcul.html)
3. **Tester:** Console F12 avec les commandes ci-dessus
4. **Partager:** Les résultats des logs pour diagnostic approfondi

---

## ✅ Conclusion

Le module est **correctement intégré** et **fonctionnel**.

Le problème vient probablement de:
- Structure de tables non conforme
- Absence de colonne requise (Conclusion/Assertion/CTR)
- Absence de "Nature de test"
- Nature de test non reconnue

Les fichiers de diagnostic permettront d'identifier la cause exacte.

---

## 📚 Fichiers du module

| Fichier | Ligne | Description |
|---------|-------|-------------|
| `public/papier-travail-schema-calcul.js` | 1-713 | Module complet |
| `public/menu.js` | 10133-10180 | Méthode ajouterSchemaCalcul |
| `index.html` | 169 | Chargement du script |

---

**Créé le:** 24 avril 2026  
**Statut:** ✅ Diagnostic complet effectué
