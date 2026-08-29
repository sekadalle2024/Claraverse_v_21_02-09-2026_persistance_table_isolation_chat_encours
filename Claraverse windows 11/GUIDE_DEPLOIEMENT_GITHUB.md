# 🚀 Guide de Déploiement GitHub - ClaraVerse

## 📋 Contexte
Ce guide vous aide à sauvegarder votre projet ClaraVerse modifié sur GitHub sans répéter l'erreur précédente concernant le fichier `logo.png`.

## ⚠️ Problème Résolu
**Erreur précédente:** `Failed to resolve import "../assets/logo.png"`

**Cause:** Le fichier existe bien dans `src/assets/logo.png` mais Vite ne le trouvait pas lors du build.

**Solution:** Vérification pré-déploiement et configuration correcte.

## ✅ Étapes de Déploiement

### 1. Vérification Pré-Déploiement

Avant de pousser sur GitHub, exécutez le script de vérification :

```bash
node pre-deploy-check.js
```

Ce script vérifie :
- ✅ Présence de `src/assets/logo.png`
- ✅ Présence de `src/assets/temo.png`
- ✅ Configuration Vite
- ✅ Dépendances installées

### 2. Test du Build Local

Testez le build localement avant de déployer :

```bash
npm run build
```

Si le build réussit, vous verrez un dossier `dist/` créé.

### 3. Nettoyage du Projet

Avant de pousser sur GitHub, nettoyez les fichiers inutiles :

```bash
# Supprimer les fichiers de build temporaires
rm -rf dist
rm -rf node_modules/.vite
rm -rf .vite

# Les fichiers suivants sont déjà dans .gitignore :
# - node_modules/
# - dist/
# - .env
```

### 4. Configuration Git

Si ce n'est pas déjà fait, configurez votre repository :

```bash
# Initialiser git (si nécessaire)
git init

# Ajouter le remote GitHub
git remote add origin https://github.com/sekadalle2024/claraverse_back-up_V2.git

# Vérifier le remote
git remote -v
```

### 5. Commit et Push

```bash
# Vérifier les fichiers modifiés
git status

# Ajouter tous les fichiers
git add .

# Créer un commit avec un message descriptif
git commit -m "✨ Mise à jour ClaraVerse - Version améliorée avec corrections"

# Pousser vers GitHub
git push -u origin main
```

Si vous avez une branche différente (master au lieu de main) :

```bash
git push -u origin master
```

### 6. En cas de conflit

Si GitHub refuse le push car il y a déjà du contenu :

```bash
# Option 1: Forcer le push (⚠️ écrase l'historique distant)
git push -f origin main

# Option 2: Fusionner d'abord (recommandé)
git pull origin main --allow-unrelated-histories
git push origin main
```

## 🔧 Fichiers Importants Vérifiés

### Assets Requis
- ✅ `src/assets/logo.png` - Logo principal
- ✅ `src/assets/temo.png` - Image secondaire
- ✅ `src/components/Sidebar.tsx` - Import correct du logo

### Configuration
- ✅ `vite.config.ts` - Configuration Vite avec alias `@`
- ✅ `package.json` - Scripts de build configurés
- ✅ `.gitignore` - Fichiers à exclure

## 📝 Checklist Avant Déploiement

- [ ] Exécuter `node pre-deploy-check.js`
- [ ] Tester `npm run build` localement
- [ ] Vérifier que `dist/` se crée sans erreur
- [ ] Vérifier `.gitignore` (node_modules, dist, .env exclus)
- [ ] Commit avec message descriptif
- [ ] Push vers GitHub

## 🎯 Commandes Rapides

```bash
# Vérification complète et déploiement
node pre-deploy-check.js && npm run build && git add . && git commit -m "✨ Update" && git push origin main
```

## 🐛 Dépannage

### Erreur: "Failed to resolve import"
- Vérifiez que le fichier existe : `ls -la src/assets/logo.png`
- Vérifiez le chemin dans le composant
- Nettoyez le cache : `rm -rf node_modules/.vite`

### Erreur: "Permission denied"
```bash
git remote set-url origin https://github.com/sekadalle2024/claraverse_back-up_V2.git
```

### Erreur: "Updates were rejected"
```bash
git pull origin main --rebase
git push origin main
```

## 📊 Structure du Projet

```
claraverse/
├── src/
│   ├── assets/
│   │   ├── logo.png ✅
│   │   └── temo.png ✅
│   ├── components/
│   │   └── Sidebar.tsx ✅
│   └── ...
├── public/
├── vite.config.ts ✅
├── package.json ✅
├── .gitignore ✅
└── pre-deploy-check.js ✅ (nouveau)
```

## ✨ Prochaines Étapes

Après le déploiement sur GitHub :

1. **Vérifier sur GitHub** que tous les fichiers sont présents
2. **Tester le déploiement** sur Firebase Studio
3. **Créer un tag de version** : `git tag v1.0.0 && git push --tags`

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `git log --oneline`
2. Vérifiez le statut : `git status`
3. Consultez ce guide

---

**Date de création:** 24 novembre 2025
**Repository:** https://github.com/sekadalle2024/claraverse_back-up_V2.git
**Statut:** ✅ Prêt pour le déploiement
