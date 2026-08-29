# Démarrage Rapide - ClaraVerse

## 📋 Prérequis

- ✅ Node.js v22.22.0
- ✅ npm v10.9.4
- ✅ Python 3.14.3
- ⏳ Miniconda (à installer)

## 🚀 Installation Rapide (3 étapes)

### Étape 1 : Installation Frontend (npm)

```bash
# Si npm install n'est pas terminé, attendez ou relancez :
npm install

# En cas de problème :
npm install --legacy-peer-deps
```

### Étape 2 : Installation Miniconda

**Option A - Installation automatique (recommandé) :**
```powershell
# Exécuter le script d'installation
.\install-miniconda.ps1

# Redémarrer le terminal, puis :
conda init

# Redémarrer à nouveau le terminal
```

**Option B - Installation manuelle :**
1. Téléchargez : https://docs.conda.io/en/latest/miniconda.html
2. Installez en cochant "Add to PATH"
3. Redémarrez le terminal
4. Exécutez : `conda init`
5. Redémarrez à nouveau le terminal

### Étape 3 : Configuration Python

```powershell
# Exécuter le script de configuration
.\setup-python-env.ps1

# Ou manuellement :
conda create -n claraverse python=3.11 -y
conda activate claraverse
cd py_backend
pip install -r requirements.txt
```

## 🎯 Démarrage du Projet

### Option 1 : Démarrage complet (Frontend + Backend)

```bash
# Activer l'environnement conda
conda activate claraverse

# Démarrer tout
npm run dev:full
```

### Option 2 : Démarrage séparé

**Terminal 1 - Frontend :**
```bash
npm run dev
```

**Terminal 2 - Backend :**
```bash
conda activate claraverse
cd py_backend
python main.py
```

## 🔧 Commandes Utiles

### Frontend
```bash
# Développement
npm run dev

# Build production
npm run build

# Tests
npm test

# Linter
npm run lint
```

### Backend
```bash
# Activer l'environnement
conda activate claraverse

# Démarrer le serveur
cd py_backend
python main.py

# Désactiver l'environnement
conda deactivate
```

### Electron (Application Desktop)
```bash
# Développement
npm run electron:dev

# Build
npm run electron:build

# Build pour toutes les plateformes
npm run electron:build-all
```

## 📦 Mise à Jour des Dépendances

### Frontend
```bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour
npm update

# Vérifier les vulnérabilités
npm audit
npm audit fix
```

### Backend
```bash
conda activate claraverse
pip list --outdated
pip install --upgrade -r py_backend/requirements.txt
```

## 🐛 Résolution de Problèmes

### npm install échoue
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### conda n'est pas reconnu
1. Redémarrez le terminal
2. Vérifiez le PATH système
3. Réinstallez Miniconda avec l'option "Add to PATH"

### Le backend ne démarre pas
```bash
# Vérifier l'environnement
conda activate claraverse
which python  # ou "where python" sur Windows

# Réinstaller les dépendances
pip install --force-reinstall -r py_backend/requirements.txt
```

### Port déjà utilisé
```bash
# Frontend (port 5173 par défaut)
# Modifier dans vite.config.ts

# Backend (port 8000 par défaut)
# Modifier dans py_backend/main.py
```

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `GUIDE_MISE_A_JOUR_DEPENDANCES.md` - Guide complet de mise à jour
- `README.md` - Documentation du projet
- `py_backend/README.md` - Documentation backend

## 🌐 URLs par Défaut

- Frontend : http://localhost:5173
- Backend API : http://localhost:8000
- API Docs : http://localhost:8000/docs

## 💡 Conseils

1. **Toujours activer l'environnement conda** avant de travailler sur le backend
2. **Utilisez `npm run dev:full`** pour démarrer frontend et backend ensemble
3. **Consultez les logs** en cas d'erreur pour identifier le problème
4. **Gardez vos dépendances à jour** régulièrement

## 🎉 Vous êtes prêt !

Une fois toutes les étapes complétées, votre environnement ClaraVerse est prêt pour le développement !

Pour démarrer :
```bash
conda activate claraverse
npm run dev:full
```

Bon développement ! 🚀
