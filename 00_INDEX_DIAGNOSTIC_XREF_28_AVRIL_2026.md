# 📋 Index - Diagnostic Détection Table X-Ref Documentaire
**Date:** 28 avril 2026

## 🎯 Objectif
Diagnostiquer et résoudre le problème de détection de la table "Cross references documentaire" dans le menu contextuel de Claraverse.

---

## 📁 Fichiers Créés

### 1. 🚀 Fichiers de Test
| Fichier | Description | Usage |
|---------|-------------|-------|
| `test-detection-xref-table.html` | Page de test avec table X-Ref et tests automatiques | Ouvrir dans le navigateur |
| `test-detection-xref.ps1` | Script PowerShell pour lancer le test | `.\test-detection-xref.ps1` |

### 2. 📖 Documentation
| Fichier | Description | Contenu |
|---------|-------------|---------|
| `00_LIRE_MAINTENANT_XREF_28_AVRIL_2026.txt` | **COMMENCER ICI** - Guide de démarrage rapide | Action immédiate à prendre |
| `QUICK_START_DIAGNOSTIC_XREF_28_AVRIL_2026.txt` | Guide rapide en 4 étapes | Procédure simplifiée |
| `00_DIAGNOSTIC_DETECTION_XREF_28_AVRIL_2026.txt` | Analyse détaillée du problème | Causes possibles et solutions |
| `00_SOLUTION_DETECTION_XREF_28_AVRIL_2026.txt` | Solution proposée avec code | Correction à appliquer |
| `00_INDEX_DIAGNOSTIC_XREF_28_AVRIL_2026.md` | Ce fichier - Index complet | Navigation dans les documents |

---

## 🔍 Problème Identifié

### Erreur Affichée
```
⚠️ Aucune table X-Ref documentaire trouvée.

La table doit contenir les colonnes:
- Cross references (ou X-Ref)
- Document
```

### Contexte
- ✅ Le workflow n8n fonctionne (test AFRILAND réussi)
- ✅ L'endpoint est correct: `https://n8nsqlite.zeabur.app/webhook/cross_reference`
- ✅ La table existe dans Claraverse
- ❌ Le code JavaScript ne détecte pas la table

---

## 🎯 Démarche de Diagnostic

### Étape 1: Lancer le Test
```powershell
.\test-detection-xref.ps1
```

### Étape 2: Analyser les Résultats
Le test affiche:
- ✅ Structure de la table (thead, tbody)
- ✅ En-têtes trouvés
- ✅ Détection des colonnes clés
- ✅ Index des colonnes
- ✅ Extraction des données

### Étape 3: Comparer avec Claraverse
1. Ouvrir Claraverse dans le navigateur
2. Afficher la table X-Ref documentaire
3. Appuyer sur F12 (console développeur)
4. Onglet "Elements" ou "Inspecteur"
5. Cliquer sur l'icône de sélection
6. Cliquer sur la table X-Ref
7. Copier le HTML de la table

### Étape 4: Identifier la Différence
Comparer:
- Structure HTML (thead/tbody)
- Noms exacts des colonnes
- Ordre des colonnes
- Présence de caractères invisibles

---

## 💡 Hypothèses Principales

### Hypothèse 1: Structure HTML Différente
**Problème:** La table dans Claraverse n'a pas de `<thead>`

**Code actuel:**
```javascript
const headers = Array.from(table.querySelectorAll('th, thead td'))
```

**Solution proposée:**
```javascript
const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
const headers = Array.from(headerRow.querySelectorAll('th, td'));
```

### Hypothèse 2: Nom de Colonne Différent
**Problème:** La colonne s'appelle "Cross reference" (singulier) ou "Xref"

**Code actuel:**
```javascript
if ((text.includes('cross') && text.includes('ref')) || 
    text.includes('x-ref') || text.includes('xref'))
```

**Solution proposée:**
```javascript
if (text.includes('cross') || 
    text.includes('xref') || 
    text.includes('x-ref') || 
    text.includes('x ref') ||
    text.includes('référence'))
```

### Hypothèse 3: Mauvaise Table Sélectionnée
**Problème:** Plusieurs tables dans la page, la mauvaise est sélectionnée

**Solution:** Améliorer la sélection de table avec des critères plus précis

---

## 📊 Code Concerné

### Fichier: `public/menu.js`
### Fonction: `ouvrirXRefDocumentaire()`
### Ligne: 9866

```javascript
// 4. Trouver les index des colonnes
const headerCells = Array.from(rows[0].querySelectorAll('th, td'));
let crossRefIndex = -1;
let documentIndex = -1;

headerCells.forEach((cell, index) => {
  const text = cell.textContent.trim().toLowerCase();
  if ((text.includes('cross') && text.includes('ref')) || 
      text.includes('x-ref') || text.includes('xref')) {
    crossRefIndex = index;
  }
  if (text.includes('document') || text === 'doc') {
    documentIndex = index;
  }
});

if (crossRefIndex === -1 || documentIndex === -1) {
  this.showAlert("⚠️ Colonnes 'Cross references' et 'Document' non trouvées");
  return;
}
```

---

## 🔧 Tests Disponibles

### Test 1: Tester Détection
- Vérifie la structure de la table
- Extrait les en-têtes
- Teste la détection des colonnes clés
- Affiche les en-têtes en minuscules

### Test 2: Tester Index Colonnes
- Affiche chaque cellule d'en-tête avec son index
- Trouve les index de "Cross references" et "Document"
- Vérifie que les index sont corrects

### Test 3: Tester Données Ligne
- Extrait les données de chaque ligne
- Construit le nom de fichier: `[Cross references]-[Document]`
- Affiche les résultats pour chaque ligne

---

## 📞 Informations Nécessaires

Pour finaliser la correction, fournir:

1. **Résultats du test**
   - Exécuter: `.\test-detection-xref.ps1`
   - Copier les résultats affichés

2. **HTML de la table Claraverse**
   - F12 → Elements
   - Clic droit sur `<table>` → Copy → Copy outerHTML
   - Coller dans un fichier texte

3. **Captures d'écran**
   - Table X-Ref dans Claraverse
   - Erreur affichée
   - Console du navigateur (F12)

---

## 🚀 Action Immédiate

```powershell
.\test-detection-xref.ps1
```

---

## 📚 Références

### Documents Connexes
- `Doc cross ref documentaire menu/` - Documentation complète X-Ref
- `public/menu.js` - Code source du menu contextuel
- `test-workflow-xref-afriland.ps1` - Test du workflow n8n (réussi)

### Workflow N8N
- **Endpoint:** `https://n8nsqlite.zeabur.app/webhook/cross_reference`
- **Méthode:** POST
- **Body:** `{ "question": "[index] = [I30]-AFRILAND", "dossier": "Dossier CAC" }`
- **Statut:** ✅ Fonctionne correctement

---

## ✅ Prochaines Étapes

1. ✅ Exécuter le test: `.\test-detection-xref.ps1`
2. 📊 Analyser les résultats
3. 🔍 Comparer avec Claraverse
4. 📸 Fournir les informations demandées
5. 🔧 Appliquer la correction

---

**Dernière mise à jour:** 28 avril 2026
