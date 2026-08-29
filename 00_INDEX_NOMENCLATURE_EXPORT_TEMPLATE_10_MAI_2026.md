# 📑 INDEX - Nomenclature Export Template Excel

**Date:** 10 Mai 2026  
**Statut:** ✅ IMPLÉMENTÉ ET DOCUMENTÉ

---

## 🎯 OBJECTIF

Modifier la nomenclature des fichiers exportés via "Export template Excel" pour inclure le nom de l'étape de mission extraite des tables.

---

## 📚 DOCUMENTATION

### 🔴 LIRE EN PREMIER

1. **00_RECAP_NOMENCLATURE_EXPORT_TEMPLATE_10_MAI_2026.txt**
   - Récapitulatif de la session
   - Modifications apportées
   - Fichiers créés
   - Prochaines étapes

2. **QUICK_TEST_NOMENCLATURE_EXPORT_TEMPLATE.txt**
   - Guide de test rapide
   - 5 scénarios de test
   - Vérifications à effectuer
   - Dépannage

### 📖 DOCUMENTATION TECHNIQUE

3. **Doc menu contextuel menu.js update/NOMENCLATURE_FICHIER_EXPORT_TEMPLATE_10_MAI_2026.md**
   - Documentation complète
   - Contexte et objectif
   - Algorithme de détection
   - Format de nomenclature
   - Exemples et tests
   - Cas particuliers
   - Maintenance future

### 📁 DOCUMENTATION EXISTANTE

4. **Doc menu contextuel menu.js update/00_COMMENCER_ICI.txt**
   - Vue d'ensemble du dossier
   - Correction export template toutes les tables

5. **Doc menu contextuel menu.js update/Probleme_resolution_export_table_div.md**
   - Problème d'export d'une seule table
   - Solution implémentée

---

## 🔧 FICHIERS MODIFIÉS

### Code Source

- **public/menu.js**
  - Ligne ~4160: Modification de `exportTemplate()`
  - Ligne ~5805: Ajout de `extractEtapeMission()`

---

## 📊 RÉSUMÉ DES CHANGEMENTS

### Avant

```
Nomenclature: claraverse_template_2026-05-09T23-39-26.xlsx
```

### Après

```
Nomenclature: E-audit_Etape-mission-Leadsheet_2026-05-10T14-30-45.xlsx
Fallback: E-audit_Etape-mission-X_2026-05-10T14-30-45.xlsx
```

---

## 🧪 TESTS

### Scénarios de Test

1. ✅ Table avec étape de mission
2. ✅ Table sans étape de mission (fallback)
3. ✅ Plusieurs tables avec étape
4. ✅ Caractères spéciaux dans le nom
5. ✅ Variations de casse

### Guide de Test

Voir: **QUICK_TEST_NOMENCLATURE_EXPORT_TEMPLATE.txt**

---

## 🔍 LOGS DE DIAGNOSTIC

### Logs Attendus

```
🔍 [Extract Etape Mission] Recherche de l'étape de mission dans 3 table(s)
  ⏭️ Table 1: Pas de colonnes Rubrique/Description
  ✅ Table 2: Colonnes trouvées - Rubrique: col 0, Description: col 1
  🎯 [Extract Etape Mission] Trouvé: "Leadsheet" (Table 2, Ligne 2)
✅ [Export Template] Nom fichier avec étape: E-audit_Etape-mission-Leadsheet_...
```

---

## 📝 PROCHAINES ÉTAPES

1. ✅ Tester avec différents scénarios
2. ✅ Vérifier les logs dans la console
3. ✅ Valider avec des utilisateurs réels
4. 📋 Documenter dans le manuel utilisateur si nécessaire
5. 📋 Appliquer la même logique à `exportTemplateWord()` si souhaité

---

## 🎓 RÉFÉRENCES RAPIDES

### Commandes Console Utiles

```javascript
// Vérifier que la fonction existe
console.log(typeof window.contextualMenuManager?.extractEtapeMission);

// Tester manuellement l'extraction
const tables = document.querySelectorAll('table');
const etape = window.contextualMenuManager?.extractEtapeMission(Array.from(tables));
console.log("Étape trouvée:", etape);
```

### Format de Nomenclature

```
E-audit_Etape-mission-{NomEtape}_{timestamp}.xlsx
```

**Composants:**
- `E-audit` : Préfixe du logiciel (fixe)
- `Etape-mission` : Indicateur de type (fixe)
- `{NomEtape}` : Nom de l'étape extrait de la table (sanitisé)
- `{timestamp}` : Date et heure au format ISO (YYYY-MM-DDTHH-MM-SS)

---

## 🔧 DÉPANNAGE RAPIDE

### Problème: Fichier toujours nommé "claraverse_template_..."

**Solution:**
1. Vérifier que le fichier menu.js a été rechargé (Ctrl+F5)
2. Vérifier les logs console pour voir si `extractEtapeMission()` est appelée

### Problème: Erreur JavaScript dans la console

**Solution:**
1. Vérifier la syntaxe de la fonction `extractEtapeMission()`
2. Vérifier que la fonction est bien placée dans la classe

### Problème: Étape de mission non détectée

**Solution:**
1. Vérifier les logs: colonnes Rubrique/Description trouvées?
2. Vérifier l'orthographe: "Etape de mission" (avec ou sans accent)
3. Vérifier que la valeur dans Description n'est pas vide

---

## ✅ CRITÈRES DE SUCCÈS

- ✅ Fichiers exportés avec la nouvelle nomenclature
- ✅ Logs de diagnostic visibles dans la console
- ✅ Fallback automatique si étape non trouvée
- ✅ Caractères spéciaux correctement gérés
- ✅ Détection insensible à la casse

---

## 📞 SUPPORT

Pour toute question ou problème, consulter:
1. **QUICK_TEST_NOMENCLATURE_EXPORT_TEMPLATE.txt** (dépannage)
2. **NOMENCLATURE_FICHIER_EXPORT_TEMPLATE_10_MAI_2026.md** (documentation complète)
3. Logs console (F12) pour diagnostic

---

**Dernière mise à jour:** 10 Mai 2026  
**Statut:** ✅ IMPLÉMENTÉ ET PRÊT À TESTER

