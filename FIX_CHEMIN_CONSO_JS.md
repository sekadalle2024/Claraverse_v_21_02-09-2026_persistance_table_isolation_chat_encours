# 🔧 FIX - Chemin conso.js dans test HTML

## 🐛 Problème

Les checkboxes n'apparaissent pas dans `public/test-examen-cia-checkbox.html`.

## 🔍 Cause

Le fichier HTML est dans le dossier `public/` mais essayait de charger `conso.js` avec un chemin relatif incorrect :

```html
<!-- ❌ INCORRECT -->
<script src="conso.js"></script>
```

Le fichier `conso.js` est à la racine du projet, pas dans `public/`.

## ✅ Solution

Corriger le chemin pour remonter d'un niveau :

```html
<!-- ✅ CORRECT -->
<script src="../conso.js"></script>
```

## 📁 Structure des fichiers

```
ClaraVerse-v-firebase/
├── conso.js                              ← À la racine
└── public/
    ├── test-examen-cia-checkbox.html     ← Dans public/
    └── diagnostic-checkboxes-cia.js      ← Dans public/
```

## 🧪 Test

1. Ouvrir `public/test-examen-cia-checkbox.html`
2. Ouvrir la console (F12)
3. Vérifier qu'il n'y a pas d'erreur de chargement
4. Les checkboxes doivent maintenant apparaître dans la colonne `Reponse_user`

## ✅ Résultat attendu

### Console

```
🚀 Claraverse Table Script - Démarrage
📋 [Claraverse] Initialisation du processeur de tables
✅ localStorage fonctionne correctement
📦 0 table(s) trouvée(s) dans le stockage
...
🔍 DIAGNOSTIC CHECKBOXES CIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ claraverseCommands disponible
```

### Dans les tables

Chaque cellule de la colonne `Reponse_user` doit contenir une checkbox :

```
┌─────────────────────────────────────────────────────────────────┐
│ Ref_question │ Question │ Option │ Reponse_CIA │ Reponse_user │
├─────────────────────────────────────────────────────────────────┤
│ Q1           │ Quest. 1 │ A      │ Réponse A   │ ☐            │ ← Checkbox
│ Q1           │ Quest. 1 │ B      │ Réponse B   │ ☐            │ ← Checkbox
│ Q1           │ Quest. 1 │ C      │ Réponse C   │ ☐            │ ← Checkbox
│ Q1           │ Quest. 1 │ D      │ Réponse D   │ ☐            │ ← Checkbox
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Prochaine étape

Maintenant que le script est chargé correctement, vous pouvez :

1. **Tester les checkboxes** : Cliquer pour cocher/décocher
2. **Tester la persistance** : Console → `diagnosticCheckboxesCIA.testComplete()`
3. **Recharger la page** : Vérifier que les checkboxes sont restaurées

---

**Date** : 26 novembre 2025  
**Statut** : ✅ Corrigé
