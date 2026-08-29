# 🚀 Guide de Déploiement Netlify - ClaraVerse Front-End

## 📋 Résumé

Ce guide explique comment déployer uniquement le **front-end** de ClaraVerse sur Netlify via la CLI.

## ⚠️ Fichiers Volumineux Identifiés

Les dossiers suivants sont **exclus automatiquement** du déploiement :

### 🔴 Très volumineux (> 500 MB)
- `node_modules/` - Sera réinstallé par Netlify
- `venv_claraverse/` - Environnement Python (non nécessaire)
- `electron/llamacpp-binaries/` - Binaires Electron (non nécessaire)

### 🟡 Volumineux (> 100 MB)
- `py_backend/` - Backend Python (non déployé sur Netlify)
- `Claraverse windows 11/` - Documentation locale
- `documentation/` - Documentation Docusaurus
- `release/` - Builds Electron

### 🟢 Modérés (> 10 MB)
- `workflows/` - Workflows N8N
- `test-configs/` - Configurations de test
- `tests/` - Tests unitaires

## 📦 Ce qui sera déployé

Uniquement les fichiers essentiels au front-end :
- ✅ `src/` - Code source React/TypeScript
- ✅ `public/` - Assets statiques
- ✅ `index.html` - Point d'entrée
- ✅ `package.json` - Dépendances
- ✅ `vite.config.ts` - Configuration Vite
- ✅ `tailwind.config.js` - Configuration Tailwind

## 🛠️ Installation Netlify CLI

```bash
# Installer Netlify CLI globalement
npm install -g netlify-cli

# Vérifier l'installation
netlify --version
```

## 🔐 Authentification

```bash
# Se connecter à Netlify
netlify login
```

Une fenêtre de navigateur s'ouvrira pour l'authentification.

## 🚀 Déploiement

### Option 1 : Déploiement Initial (Recommandé)

```bash
# Initialiser le projet Netlify
netlify init

# Suivre les instructions :
# 1. Choisir "Create & configure a new site"
# 2. Sélectionner votre équipe
# 3. Nom du site : claraverse-app (ou votre choix)
# 4. Build command : npm run build
# 5. Publish directory : dist
```

### Option 2 : Déploiement Direct

```bash
# Build local
npm run build

# Déploiement en production
netlify deploy --prod --dir=dist

# OU déploiement de test d'abord
netlify deploy --dir=dist
# Puis si OK :
netlify deploy --prod --dir=dist
```

## 📊 Taille Estimée du Déploiement

- **Avant optimisation** : ~2-3 GB (avec node_modules, backend, etc.)
- **Après optimisation** : ~50-100 MB (front-end uniquement)
- **Build final (dist/)** : ~10-20 MB

## ⚙️ Configuration Automatique

Les fichiers suivants ont été créés :

1. **`netlify.toml`** - Configuration principale
   - Commande de build : `npm run build`
   - Dossier de publication : `dist`
   - Headers de sécurité
   - Redirections SPA

2. **`.netlify-ignore`** - Fichiers exclus
   - Backend Python
   - Electron
   - Documentation
   - Tests

## 🔍 Vérification Avant Déploiement

```bash
# Tester le build localement
npm run build

# Vérifier la taille du dossier dist
du -sh dist/

# Prévisualiser localement
npm run preview
```

## 📝 Commandes Netlify Utiles

```bash
# Voir le statut du site
netlify status

# Ouvrir le dashboard Netlify
netlify open

# Voir les logs de déploiement
netlify logs

# Lister les sites
netlify sites:list

# Supprimer un site
netlify sites:delete
```

## 🌐 Variables d'Environnement

Si votre application nécessite des variables d'environnement :

```bash
# Via CLI
netlify env:set VITE_API_URL "https://votre-api.com"

# OU via le dashboard Netlify
# Site settings > Environment variables
```

## 🐛 Dépannage

### Erreur : "Build failed"
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erreur : "File size too large"
```bash
# Vérifier les fichiers volumineux
find dist -type f -size +1M -exec ls -lh {} \;

# Optimiser les images si nécessaire
```

### Erreur : "Command not found: netlify"
```bash
# Réinstaller Netlify CLI
npm install -g netlify-cli --force
```

## 📈 Optimisations Appliquées

1. ✅ Exclusion du backend Python
2. ✅ Exclusion des binaires Electron
3. ✅ Exclusion de la documentation
4. ✅ Exclusion des tests
5. ✅ Minification CSS/JS automatique
6. ✅ Compression des images
7. ✅ Headers de sécurité configurés

## 🎯 Prochaines Étapes

Après le déploiement :

1. Tester l'application sur l'URL Netlify
2. Configurer un nom de domaine personnalisé (optionnel)
3. Activer HTTPS (automatique sur Netlify)
4. Configurer les variables d'environnement si nécessaire

## 📞 Support

- Documentation Netlify : https://docs.netlify.com/
- CLI Reference : https://cli.netlify.com/
- Community : https://answers.netlify.com/

## ✅ Checklist de Déploiement

- [ ] Netlify CLI installé
- [ ] Authentification réussie
- [ ] Build local testé (`npm run build`)
- [ ] Variables d'environnement configurées (si nécessaire)
- [ ] `netlify init` exécuté
- [ ] Déploiement de test réussi
- [ ] Déploiement en production (`--prod`)
- [ ] Application testée sur l'URL Netlify

---

**Note** : Ce déploiement ne contient que le front-end. Le backend Python (`py_backend/`) doit être déployé séparément sur une plateforme comme Render, Railway, ou Heroku.
