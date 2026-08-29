# Installation Complète - ClaraVerse

## 📦 Fichiers Créés pour Vous

J'ai créé plusieurs fichiers pour faciliter votre installation :

### 📄 Documentation
- `GUIDE_MISE_A_JOUR_DEPENDANCES.md` - Guide détaillé complet
- `DEMARRAGE_RAPIDE.md` - Guide de démarrage rapide (3 étapes)
- `INSTALLATION_COMPLETE.md` - Ce fichier

### 🔧 Scripts PowerShell
- `install-miniconda.ps1` - Installation automatique de Miniconda
- `setup-python-env.ps1` - Configuration de l'environnement Python
- `verifier-installation.ps1` - Vérification de l'installation

### ⚙️ Configuration
- `environment.yml` - Configuration Conda (alternative)

## 🚀 Installation en 3 Commandes

### 1️⃣ Installer Miniconda
```powershell
.\install-miniconda.ps1
```
Puis redémarrez votre terminal et exécutez :
```bash
conda init
```
Redémarrez à nouveau le terminal.

### 2️⃣ Configurer Python
```powershell
.\setup-python-env.ps1
```

### 3️⃣ Vérifier l'installation
```powershell
.\verifier-installation.ps1
```

## ✅ État Actuel de Votre Installation

### Frontend (npm)
- ✅ Node.js v22.22.0 installé
- ✅ npm v10.9.4 installé
- ⏳ `npm install` en cours d'exécution
  - Attendez la fin (5-10 minutes)
  - Si bloqué, relancez : `npm install --legacy-peer-deps`

### Backend (Python)
- ✅ Python 3.14.3 installé
- ❌ Miniconda non installé → Exécutez `.\install-miniconda.ps1`
- ❌ Environnement conda non créé → Exécutez `.\setup-python-env.ps1`

## 📋 Ordre d'Exécution Recommandé

```powershell
# 1. Vérifier l'état actuel
.\verifier-installation.ps1

# 2. Installer Miniconda (si nécessaire)
.\install-miniconda.ps1
# → Redémarrer le terminal
# → Exécuter: conda init
# → Redémarrer à nouveau le terminal

# 3. Configurer l'environnement Python
.\setup-python-env.ps1

# 4. Vérifier à nouveau
.\verifier-installation.ps1

# 5. Démarrer le projet
conda activate claraverse
npm run dev:full
```

## 🎯 Démarrage du Projet

Une fois tout installé :

```bash
# Activer l'environnement conda
conda activate claraverse

# Démarrer frontend + backend
npm run dev:full
```

Ou séparément :

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

## 🔍 Vérification Rapide

Pour vérifier que tout fonctionne :

```bash
# Vérifier Node.js et npm
node --version  # Devrait afficher v22.22.0
npm --version   # Devrait afficher 10.9.4

# Vérifier Python
python --version  # Devrait afficher Python 3.14.3 ou 3.11.x

# Vérifier Conda
conda --version  # Devrait afficher conda x.x.x

# Vérifier l'environnement
conda env list  # Devrait lister 'claraverse'

# Vérifier les modules npm
ls node_modules  # Devrait lister de nombreux packages

# Vérifier les modules Python
conda activate claraverse
pip list  # Devrait lister fastapi, pandas, etc.
```

## 🐛 Problèmes Courants

### npm install bloqué
```bash
# Arrêter avec Ctrl+C
# Nettoyer et réinstaller
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### conda n'est pas reconnu
1. Vérifiez que Miniconda est installé
2. Redémarrez le terminal
3. Exécutez `conda init`
4. Redémarrez à nouveau le terminal
5. Si toujours pas reconnu, ajoutez manuellement au PATH :
   - `C:\Users\<VotreNom>\miniconda3\Scripts`
   - `C:\Users\<VotreNom>\miniconda3\condabin`

### Erreur lors de l'installation Python
```bash
# Réinstaller l'environnement
conda env remove -n claraverse
conda create -n claraverse python=3.11 -y
conda activate claraverse
cd py_backend
pip install -r requirements.txt
```

## 📚 Documentation Supplémentaire

- **Guide complet** : `GUIDE_MISE_A_JOUR_DEPENDANCES.md`
- **Démarrage rapide** : `DEMARRAGE_RAPIDE.md`
- **README principal** : `README.md`
- **Backend** : `py_backend/README.md` (si existe)

## 💡 Conseils Importants

1. **Toujours activer l'environnement conda** avant de travailler :
   ```bash
   conda activate claraverse
   ```

2. **Vérifier régulièrement** l'état de l'installation :
   ```bash
   .\verifier-installation.ps1
   ```

3. **Mettre à jour les dépendances** régulièrement :
   ```bash
   # Frontend
   npm update
   npm audit fix
   
   # Backend
   conda activate claraverse
   pip install --upgrade -r py_backend/requirements.txt
   ```

4. **Consulter les logs** en cas d'erreur pour identifier le problème

## 🌐 URLs par Défaut

Une fois le projet démarré :

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8000
- **API Documentation** : http://localhost:8000/docs
- **API Redoc** : http://localhost:8000/redoc

## 🎉 Prêt à Commencer !

Suivez les étapes ci-dessus et vous serez prêt à développer sur ClaraVerse !

Pour toute question, consultez les guides ou les issues GitHub du projet.

Bon développement ! 🚀

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez `GUIDE_MISE_A_JOUR_DEPENDANCES.md`
2. Exécutez `.\verifier-installation.ps1` pour diagnostiquer
3. Vérifiez les logs d'erreur
4. Consultez les issues GitHub de ClaraVerse
5. Vérifiez la documentation officielle de Miniconda

## 🔄 Mise à Jour

Pour mettre à jour votre installation :

```bash
# Frontend
npm update
npm audit fix

# Backend
conda activate claraverse
pip list --outdated
pip install --upgrade -r py_backend/requirements.txt

# Conda lui-même
conda update conda
```

## 🗑️ Désinstallation

Si vous devez tout réinstaller :

```bash
# Supprimer node_modules
rm -rf node_modules package-lock.json

# Supprimer l'environnement conda
conda env remove -n claraverse

# Réinstaller
npm install
.\setup-python-env.ps1
```
