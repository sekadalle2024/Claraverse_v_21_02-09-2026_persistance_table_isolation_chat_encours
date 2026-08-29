# DIAGNOSTIC DÉTECTION TABLES - RAPPORT CONSOLIDÉ CAC
**Date**: 26 Mars 2026  
**Statut**: 🔍 En diagnostic - Script amélioré

---

## 🎯 PROBLÈME IDENTIFIÉ

Le système d'export du rapport consolidé CAC ne détecte pas correctement les tables dans le chat, ce qui empêche la génération du rapport Word.

### Symptômes
- ❌ Aucune table FRAP détectée
- ❌ Aucune table Recos Révision détectée
- ❌ Aucune table Recos Contrôle Interne détectée
- ❌ Message: "Aucune table Claraverse trouvée dans le chat"

---

## 🔍 SCRIPT DE DIAGNOSTIC AUTOMATIQUE - VERSION AMÉLIORÉE

Un script d'alerte automatique AMÉLIORÉ a été créé dans `public/diagnostic-tables.js` pour diagnostiquer le problème.

### Améliorations (26 Mars 2026)

✅ **Analyse détaillée des 5 premières tables** (au lieu de 3)  
✅ **Affichage des classes CSS complètes**  
✅ **Affichage de l'ID des tables**  
✅ **Affichage des classes du parent**  
✅ **Affichage du contenu de la première cellule**  
✅ **Test de 10 sélecteurs alternatifs** (au lieu de 4)  
✅ **Logs dans la console pour traçabilité**  
✅ **Fonction accessible globalement**: `window.diagnosticTables()`  
✅ **Recommandations automatiques**

### Fonctionnement

**Déclenchement**: 3 secondes après le chargement de la page

**Alerte 1 - Informations générales**:
```
=== DIAGNOSTIC TABLES CLARAVERSE ===

✓ Sélecteur Claraverse: X table(s)
  Sélecteur: table.min-w-full.border...

✓ Toutes les tables: X

--- ANALYSE DÉTAILLÉE DES TABLES ---

Table 1:
  Classes: "..."
  ID: "..."
  Parent: DIV
  Classes parent: "..."
  Première cellule: "..."

Table 2:
  ...
```

**Alerte 2 - Test des sélecteurs**:
```
=== SÉLECTEURS ALTERNATIFS ===

table                          → X table(s)
table.min-w-full              → X table(s)
table.border                  → X table(s)
.prose table                  → X table(s)
main table                    → X table(s)
div.prose table               → X table(s)
div[class*='prose'] table     → X table(s)
div[class*='chat'] table      → X table(s)
table[class*='min-w']         → X table(s)
table[class*='border']        → X table(s)

--- RECOMMANDATION ---
✓ Des tables sont présentes dans le DOM
→ Utiliser le sélecteur qui retourne le plus de tables
→ Vérifier les classes CSS des tables ci-dessus
```

---

## 📝 INSTRUCTIONS POUR L'UTILISATEUR

### Étape 1: Rafraîchir la page
```
Ctrl+F5 (rafraîchissement forcé)
```

### Étape 2: Attendre 3 secondes après le chargement
Les deux alertes vont s'afficher automatiquement.

### Étape 3: Lire et copier les informations
- **Alerte 1**: Nombre de tables, classes CSS, contenu
- **Alerte 2**: Résultats des différents sélecteurs

### Étape 4: Communiquer les résultats
Envoyer le contenu des deux alertes (capture d'écran ou texte copié).

### Étape 5: Relancer manuellement si nécessaire
```javascript
// Dans la console (F12)
window.diagnosticTables()
```

---

## 🔧 SÉLECTEURS TESTÉS

Le script teste 10 sélecteurs CSS différents:

1. **`table`**: Toutes les balises `<table>`
2. **`table.min-w-full`**: Tables avec classe `min-w-full`
3. **`table.border`**: Tables avec classe `border`
4. **`.prose table`**: Tables dans un div avec classe `prose`
5. **`main table`**: Tables dans l'élément `<main>`
6. **`div.prose table`**: Tables dans un div.prose
7. **`div[class*='prose'] table`**: Tables dans un div contenant "prose"
8. **`div[class*='chat'] table`**: Tables dans un div contenant "chat"
9. **`table[class*='min-w']`**: Tables dont la classe contient "min-w"
10. **`table[class*='border']`**: Tables dont la classe contient "border"

---

## 🎯 OBJECTIF

Identifier le bon sélecteur CSS pour détecter les tables dans le chat et corriger la fonction `exportSyntheseCAC()` dans `menu.js`.

### Sélecteur actuel (menu.js ligne ~7320)
```javascript
const CLARAVERSE_SELECTORS = {
  CHAT_TABLES: "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
  PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
};
```

### Correction à apporter
Une fois le bon sélecteur identifié, remplacer `CHAT_TABLES` par le sélecteur qui fonctionne.

**Exemple**:
```javascript
const CLARAVERSE_SELECTORS = {
  CHAT_TABLES: "table",  // ← Remplacer par le bon sélecteur
  PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
};
```

---

## 📊 ANALYSE ATTENDUE

### Scénario 1: Aucune table détectée
```
✓ Sélecteur Claraverse: 0 table(s)
✓ Toutes les tables: 0
```
**Cause possible**: Les tables ne sont pas encore chargées.

**Solution**: Attendre 10 secondes et relancer avec `window.diagnosticTables()`.

### Scénario 2: Tables détectées mais sélecteur incorrect
```
✓ Sélecteur Claraverse: 0 table(s)
✓ Toutes les tables: 15

Table 1:
  Classes: "autre-classe table-custom"
  Parent: DIV
  Classes parent: "message-content"
```
**Cause possible**: Le sélecteur Claraverse ne correspond pas aux classes réelles.

**Solution**: Utiliser un sélecteur alternatif qui fonctionne (ex: `.message-content table`).

### Scénario 3: Tables détectées avec le bon sélecteur
```
✓ Sélecteur Claraverse: 15 table(s)
✓ Toutes les tables: 15
```
**Cause possible**: Le sélecteur fonctionne, problème ailleurs.

**Solution**: Vérifier la détection des types de tables (FRAP, Recos, etc.).

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Script d'alerte amélioré créé
2. ⏳ Utilisateur rafraîchit la page (Ctrl+F5)
3. ⏳ Utilisateur lit les 2 alertes
4. ⏳ Utilisateur communique les résultats
5. ⏳ Correction du sélecteur dans `menu.js`
6. ⏳ Test de l'export du rapport consolidé

---

## 📁 FICHIERS MODIFIÉS

- ✅ `public/diagnostic-tables.js` - Script de diagnostic amélioré (26 Mars 2026)

## 📁 FICHIERS À MODIFIER

- ⏳ `public/menu.js` - Correction du sélecteur CSS (ligne ~7320)

---

## 🔗 DOCUMENTS LIÉS

### Nouveaux documents (26 Mars 2026)
- `00_DIAGNOSTIC_SELECTEURS_CSS.txt` - Guide complet du diagnostic
- `QUICK_START_DIAGNOSTIC_SELECTEURS.txt` - Guide rapide
- `SYNTHESE_SESSION_DIAGNOSTIC_26_MARS_2026.md` - Synthèse de la session
- `INDEX_DIAGNOSTIC_SELECTEURS_26_MARS_2026.md` - Index des documents

### Documents existants
- `Doc export rapport/GUIDE_EXPORT_SYNTHESE_CAC.md` - Guide d'utilisation
- `Doc export rapport/CORRECTION_MENU_ET_DETECTION_RECOS_CI.md` - Corrections précédentes
- `public/menu.js` - Fichier à corriger

---

## 📝 LOGS ATTENDUS

### Console Frontend (F12)
```
🔍 [DIAGNOSTIC] Démarrage du diagnostic des tables...
⏳ [DIAGNOSTIC] Page déjà chargée, attente de 3 secondes...
📊 [DIAGNOSTIC] Résultats: ...
🔍 [DIAGNOSTIC] Sélecteurs alternatifs: ...
✅ [DIAGNOSTIC] Script chargé. Utilisez window.diagnosticTables() pour relancer le diagnostic.
```

---

**FIN DU DOCUMENT**

