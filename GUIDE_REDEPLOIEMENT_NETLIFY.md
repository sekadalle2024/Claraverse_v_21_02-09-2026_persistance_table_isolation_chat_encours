# 🔄 Guide de Redéploiement Netlify - Mises à Jour

## 📋 Contexte

Ce guide explique comment redéployer les nouvelles mises à jour de ClaraVerse sur Netlify après avoir modifié l'application.

## ✅ Prérequis

- ✓ Netlify CLI installé
- ✓ Authentification Netlify active
- ✓ Site déjà configuré (prclaravi.netlify.app)

## 🚀 Méthode 1 : Script Automatique (Recommandé)

### Windows PowerShell

```powershell
# Exécuter le script de redéploiement
.\deploy-netlify-update.ps1
```

Le script effectue automatiquement :
1. Vérification de Netlify CLI
2. Vérification de l'authentification
3. Build du projet (avec allocation mémoire optimisée)
4. Déploiement en production

## 🛠️ Méthode 2 : Commandes Manuelles

### Étape 1 : Build du projet

```bash
npm run build
```

**Note** : Le script de build a été optimisé avec `--max-old-space-size=8192` pour éviter les erreurs de mémoire.

### Étape 2 : Déployer sur Netlify

```bash
# Déploiement direct en production
netlify deploy --prod --dir=dist
```

**OU** pour tester d'abord :

```bash
# Déploiement de test
netlify deploy --dir=dist

# Puis si OK, déployer en production
netlify deploy --prod --dir=dist
```

## 📊 Informations du Site

- **Nom du projet** : prclaravi
- **URL de production** : https://prclaravi.netlify.app
- **Admin URL** : https://app.netlify.com/projects/prclaravi
- **Dossier de build** : dist/
- **Commande de build** : npm run build

## 🔍 Vérifications Après Déploiement

### 1. Vérifier le statut

```bash
netlify status
```

### 2. Voir les logs de déploiement

```bash
netlify logs
```

### 3. Ouvrir le dashboard Netlify

```bash
netlify open
```

### 4. Tester l'application

Ouvrez https://prclaravi.netlify.app dans votre navigateur et vérifiez que les nouvelles fonctionnalités sont présentes.

## ⚙️ Optimisations Appliquées

### Build Optimisé

Le fichier `package.json` a été modifié pour augmenter la mémoire allouée :

```json
"build": "node --max-old-space-size=8192 ./node_modules/vite/bin/vite.js build"
```

Cela évite l'erreur "JavaScript heap out of memory" lors du build.

### Configuration Netlify

Le fichier `netlify.toml` contient :
- Headers de sécurité pour WebContainer
- Redirections SPA
- Optimisations CSS/JS/Images
- Node.js 20

## 🐛 Dépannage

### Erreur : "Build failed - Out of memory"

Si le build échoue encore avec une erreur de mémoire :

```bash
# Augmenter encore la limite
node --max-old-space-size=12288 ./node_modules/vite/bin/vite.js build
```

### Erreur : "Not logged in"

```bash
netlify login
```

### Erreur : "No site configured"

```bash
netlify link
# Puis sélectionner "prclaravi"
```

### Déploiement trop lent

Le déploiement peut prendre 5-10 minutes selon :
- La taille du build (~11 MB)
- Votre connexion internet
- La charge des serveurs Netlify

**Soyez patient !** Le déploiement continue même si la commande semble bloquée.

## 📈 Taille du Build

- **Build final (dist/)** : ~11 MB
- **Fichier principal** : index-C729HgUK.js (~11 MB)
- **CSS** : index-BMCJvyXk.css (~483 KB)
- **Assets** : Fonts, images, etc.

## 🔄 Workflow de Mise à Jour

1. **Développement local**
   ```bash
   npm run dev
   ```

2. **Tester les modifications**
   - Vérifier que tout fonctionne localement

3. **Build de production**
   ```bash
   npm run build
   ```

4. **Tester le build localement**
   ```bash
   npm run preview
   ```

5. **Déployer sur Netlify**
   ```bash
   netlify deploy --prod --dir=dist
   ```

6. **Vérifier en production**
   - Ouvrir https://prclaravi.netlify.app
   - Tester les nouvelles fonctionnalités

## 📝 Commandes Utiles

```bash
# Voir la version de Netlify CLI
netlify --version

# Voir le statut du site
netlify status

# Ouvrir le dashboard
netlify open

# Voir les logs
netlify logs

# Lister tous les sites
netlify sites:list

# Voir les déploiements récents
netlify deploys:list

# Annuler un déploiement
netlify rollback
```

## 🌐 Variables d'Environnement

Si vous avez ajouté de nouvelles variables d'environnement dans votre code :

### Via CLI

```bash
netlify env:set VITE_API_URL "https://votre-api.com"
netlify env:set VITE_AUTRE_VAR "valeur"
```

### Via Dashboard

1. Ouvrir https://app.netlify.com/projects/prclaravi
2. Aller dans "Site settings" > "Environment variables"
3. Ajouter les variables nécessaires
4. Redéployer

## ⚠️ Important

### Ce qui est déployé

✅ Front-end React uniquement
✅ Assets statiques (images, fonts, etc.)
✅ Configuration Netlify (headers, redirections)

### Ce qui n'est PAS déployé

❌ Backend Python (py_backend/)
❌ Electron (application desktop)
❌ Documentation
❌ Tests

Le backend Python doit être déployé séparément sur une autre plateforme (Render, Railway, Heroku, Koyeb, etc.).

## 📞 Support

- **Documentation Netlify** : https://docs.netlify.com/
- **CLI Reference** : https://cli.netlify.com/
- **Community** : https://answers.netlify.com/
- **Status** : https://www.netlifystatus.com/

## ✅ Checklist de Redéploiement

- [ ] Modifications testées localement
- [ ] Build local réussi (`npm run build`)
- [ ] Preview local testé (`npm run preview`)
- [ ] Variables d'environnement mises à jour (si nécessaire)
- [ ] Déploiement lancé (`netlify deploy --prod --dir=dist`)
- [ ] Site testé en production
- [ ] Nouvelles fonctionnalités vérifiées

---

**Dernière mise à jour** : Mars 2026
**Version** : 0.1.25
**Site** : https://prclaravi.netlify.app
