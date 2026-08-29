# 📝 Mémo des Problèmes et Solutions - Déploiement Netlify

## 🎯 Objectif

Ce document recense tous les problèmes rencontrés lors des déploiements Netlify et leurs solutions testées.

## 🔴 Problèmes Critiques

### 1. Erreur "JavaScript heap out of memory"

**Symptômes :**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Cause :** Le build Vite consomme plus de mémoire que la limite par défaut de Node.js

**Solution ✅ :**
- Modifier le script de build dans `package.json` :
```json
"build": "node --max-old-space-size=8192 ./node_modules/vite/bin/vite.js build"
```
- Alloue 8 GB de mémoire heap au lieu de 1.4 GB par défaut

**Statut :** ✅ Résolu et testé

---

### 2. Erreur "EPERM: operation not permitted"

**Symptômes :**
```
Error: EPERM: operation not permitted, rename 'config.json.xxx' -> 'config.json'
```

**Cause :** Problème de permissions Windows avec les fichiers de configuration Netlify

**Solutions ✅ :**
1. **Solution rapide :** Redémarrer PowerShell en tant qu'administrateur
2. **Solution alternative :** Utiliser le processus en arrière-plan
3. **Solution permanente :** Configurer les permissions du dossier `%APPDATA%\netlify`

**Commandes :**
```powershell
# Redémarrer PowerShell en admin, puis :
netlify deploy --prod --dir=dist
```

**Statut :** ✅ Résolu

---

### 3. Build qui semble bloqué

**Symptômes :**
- Le build reste sur "transforming (xxxx)" pendant longtemps
- Aucune progression visible

**Cause :** Build normal pour un gros projet (6400+ modules)

**Solution ✅ :**
- **Patience !** Le build prend 2-4 minutes normalement
- Surveiller la mémoire système (doit avoir >8 GB libre)
- Ne pas interrompre le processus

**Temps normaux :**
- Build local : 2-3 minutes
- Build Netlify : 3-4 minutes
- Upload : 3-5 minutes

**Statut :** ✅ Comportement normal

---

## 🟡 Problèmes Modérés

### 4. Déploiement qui semble bloqué

**Symptômes :**
- "Uploading blobs to deploy store..." reste affiché longtemps
- Pas de progression visible

**Cause :** Upload de ~50 MB prend du temps

**Solution ✅ :**
- **Patience !** L'upload prend 5-8 minutes
- Vérifier la connexion internet
- Ne pas interrompre le processus

**Indicateurs normaux :**
```
⠋ Uploading blobs to deploy store...
⠙ Hashing files...
⠹ CDN diffing files...
⠸ Waiting for deploy to go live...
```

**Statut :** ✅ Comportement normal

---

### 5. Erreur "Not logged in"

**Symptômes :**
```
Error: Not logged in
```

**Cause :** Session Netlify expirée

**Solution ✅ :**
```powershell
netlify logout
netlify login
```

**Vérification :**
```powershell
netlify status
```

**Statut :** ✅ Résolu

---

### 6. Erreur "No site configured"

**Symptômes :**
```
Error: No site configured
```

**Cause :** Le projet n'est pas lié au site Netlify

**Solution ✅ :**
```powershell
netlify link
# Puis sélectionner "prclaravi"
```

**Vérification :**
```powershell
netlify status
```

**Statut :** ✅ Résolu

---

## 🟢 Problèmes Mineurs

### 7. Avertissement "browsers data is 9 months old"

**Symptômes :**
```
Browserslist: browsers data (caniuse-lite) is 9 months old
```

**Cause :** Base de données des navigateurs obsolète

**Solution ✅ :**
```powershell
npx update-browserslist-db@latest
```

**Impact :** Aucun sur le déploiement (juste un avertissement)

**Statut :** ✅ Optionnel

---

### 8. Avertissement "Some chunks are larger than 500 kB"

**Symptômes :**
```
(!) Some chunks are larger than 500 kB after minification
```

**Cause :** Le fichier principal fait 11 MB (très gros)

**Solutions futures :**
- Implémenter le code splitting
- Utiliser dynamic import()
- Configurer manualChunks

**Impact :** Aucun sur le déploiement (juste performance)

**Statut :** ⚠️ À optimiser plus tard

---

## 🛠️ Solutions Préventives

### Configuration Optimale

1. **package.json optimisé :**
```json
{
  "scripts": {
    "build": "node --max-old-space-size=8192 ./node_modules/vite/bin/vite.js build"
  }
}
```

2. **netlify.toml configuré :**
```toml
[build]
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"
```

3. **Mémoire système :**
- Minimum 8 GB RAM libre
- Fermer les applications gourmandes pendant le build

### Workflow Recommandé

1. **Avant chaque déploiement :**
```powershell
cd deploiement-netlify
.\verifier-config.ps1
```

2. **Déploiement normal :**
```powershell
.\deploy.ps1
```

3. **Déploiement rapide (build existant) :**
```powershell
.\deploy-rapide.ps1
```

## 📊 Métriques Normales

### Temps de Build
- **Local :** 2-3 minutes
- **Netlify :** 3-4 minutes

### Temps de Déploiement
- **Upload :** 3-5 minutes (50 MB)
- **Traitement :** 1-2 minutes
- **Total :** 5-8 minutes

### Tailles
- **Dossier dist/ :** ~50 MB
- **Fichier principal :** ~11 MB
- **CSS :** ~500 KB
- **Assets :** ~38 MB

## 🔍 Diagnostic Rapide

### Commandes de Vérification

```powershell
# Vérifier la configuration
.\verifier-config.ps1

# Vérifier l'authentification
netlify status

# Vérifier le build
npm run build

# Vérifier la taille
(Get-ChildItem -Path "../dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
```

### Logs Utiles

```powershell
# Logs de déploiement
netlify logs

# Logs de build
netlify logs --function

# Ouvrir le dashboard
netlify open
```

## 📞 Escalade

### Si les solutions ne fonctionnent pas :

1. **Vérifier :**
   - Connexion internet stable
   - Espace disque suffisant (>2 GB)
   - Mémoire RAM disponible (>8 GB)

2. **Nettoyer :**
```powershell
# Nettoyer node_modules
Remove-Item -Recurse -Force node_modules
npm install

# Nettoyer le cache Netlify
netlify logout
netlify login
```

3. **Redémarrer :**
   - Redémarrer PowerShell
   - Redémarrer l'ordinateur si nécessaire

4. **Support externe :**
   - Documentation Netlify : https://docs.netlify.com/
   - Community : https://answers.netlify.com/
   - Status : https://www.netlifystatus.com/

## 📈 Historique des Résolutions

| Date | Problème | Solution | Statut |
|------|----------|----------|--------|
| 2026-03-10 | Heap out of memory | Augmentation mémoire à 8GB | ✅ Résolu |
| 2026-03-10 | EPERM permissions | PowerShell admin | ✅ Résolu |
| 2026-03-10 | Build lent | Patience (comportement normal) | ✅ Documenté |
| 2026-03-10 | Upload lent | Patience (comportement normal) | ✅ Documenté |

---

**Dernière mise à jour :** Mars 2026  
**Version :** 1.0  
**Maintenu par :** Équipe ClaraVerse