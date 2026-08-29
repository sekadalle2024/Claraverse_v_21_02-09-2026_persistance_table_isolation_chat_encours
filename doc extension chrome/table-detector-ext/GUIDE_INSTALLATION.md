# 📦 Guide d'installation - Table Selector Detective

## Installation rapide (3 étapes)

### 1️⃣ Ouvrir la page des extensions Chrome
- Tapez `chrome://extensions/` dans la barre d'adresse
- Ou : Menu ⋮ > Extensions > Gérer les extensions

### 2️⃣ Activer le mode développeur
- Cliquez sur le bouton **Mode développeur** (coin supérieur droit)
- Le bouton doit être activé (bleu)

### 3️⃣ Charger l'extension
- Cliquez sur **Charger l'extension non empaquetée**
- Naviguez vers le dossier : `doc extension chrome/table-detector-ext`
- Sélectionnez le dossier et cliquez sur **Sélectionner le dossier**

✅ **C'est fait !** L'extension apparaît dans votre barre d'outils.

## 🎯 Premier test

1. Ouvrez une page avec des tables (ex: chat Claraverse)
2. Cliquez sur l'icône 🔍 de l'extension
3. Cliquez sur **Scanner**
4. Explorez les résultats !

## 📥 Tester l'export

1. Après un scan réussi, cliquez sur **Export**
2. Choisissez un format (HTML recommandé pour le premier test)
3. Le fichier est téléchargé dans votre dossier Téléchargements
4. Ouvrez-le pour voir le rapport complet

## 🔧 Résolution de problèmes

### L'extension n'apparaît pas
- Vérifiez que le mode développeur est activé
- Rechargez la page `chrome://extensions/`
- Vérifiez que tous les fichiers sont présents dans le dossier

### Erreur au chargement
- Vérifiez que vous avez sélectionné le bon dossier
- Le dossier doit contenir `manifest.json`
- Vérifiez les permissions de fichiers

### L'icône n'apparaît pas dans la barre
- Cliquez sur l'icône puzzle 🧩 dans la barre d'outils
- Trouvez "Table Selector Detective"
- Cliquez sur l'épingle 📌 pour l'épingler

## 📂 Structure attendue

Votre dossier doit contenir :
```
table-detector-ext/
├── manifest.json ✓
├── popup.html ✓
├── popup.js ✓
├── export-functions.js ✓
├── content.js ✓
├── background.js ✓
├── icons/ ✓
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 🔄 Recharger après modification

Si vous modifiez le code :
1. Allez dans `chrome://extensions/`
2. Trouvez "Table Selector Detective"
3. Cliquez sur le bouton circulaire ↻ **Recharger**
4. Testez vos modifications

## ✅ Vérification de l'installation

L'extension est correctement installée si :
- ✓ Elle apparaît dans `chrome://extensions/`
- ✓ Le statut est "Activée"
- ✓ L'icône 🔍 est visible dans la barre d'outils
- ✓ Aucune erreur n'est affichée

## 🎓 Prochaines étapes

1. Lisez le [README.md](README.md) pour les détails complets
2. Testez sur différentes pages avec des tables
3. Explorez les différents formats d'export
4. Personnalisez les sélecteurs si nécessaire

---

**Besoin d'aide ?** Consultez la section Dépannage du README.md
