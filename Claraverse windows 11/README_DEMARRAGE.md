# 🚀 README - Démarrage ClaraVerse

## ✅ Installation Terminée !

Votre environnement ClaraVerse est **100% opérationnel** et prêt à l'emploi !

## 🎯 Démarrage Ultra-Rapide

### Méthode 1 : Double-Clic (Recommandé)

1. Ouvrez l'explorateur Windows
2. Naviguez vers `H:\ClaraVerse`
3. **Double-cliquez sur `start-all.bat`**

C'est tout ! 🎉

### Méthode 2 : Ligne de Commande

```powershell
# PowerShell
.\start-all.ps1

# Ou CMD
start-all.bat
```

## 📦 Scripts Disponibles

| Script | Description | Usage |
|--------|-------------|-------|
| `start-all.bat` / `.ps1` | Démarre frontend + backend | Double-clic ou `.\start-all.ps1` |
| `start-frontend.bat` / `.ps1` | Démarre uniquement le frontend | Double-clic ou `.\start-frontend.ps1` |
| `start-backend.bat` / `.ps1` | Démarre uniquement le backend | Double-clic ou `.\start-backend.ps1` |

## 🌐 URLs

Une fois démarré :

- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:8000
- **API Docs** : http://localhost:8000/docs

## 📚 Documentation

### Démarrage
- `DEMARRAGE_SIMPLE.txt` - Guide ultra-simple
- `GUIDE_SCRIPTS_DEMARRAGE.md` - Guide complet des scripts
- `README_DEMARRAGE.md` - Ce fichier

### Installation
- `SUCCES_INSTALLATION.txt` - Résumé de l'installation
- `RESULTAT_FINAL_INSTALLATION.md` - Détails complets
- `INDEX_INSTALLATION.md` - Index de toute la documentation

### Guides Techniques
- `GUIDE_MISE_A_JOUR_DEPENDANCES.md` - Mise à jour des dépendances
- `DEMARRAGE_RAPIDE.md` - Guide de démarrage rapide
- `SOLUTION_FINALE_SIMPLE.md` - Solutions aux problèmes

## 🛑 Arrêter les Serveurs

- Appuyez sur `Ctrl+C` dans le terminal
- Ou fermez la fenêtre du terminal

## 💡 Commandes Utiles

```powershell
# Vérifier l'installation
.\check-install.ps1

# Activer l'environnement Python
.\venv_claraverse\Scripts\Activate.ps1

# Démarrer tout
.\start-all.ps1

# Démarrer frontend uniquement
.\start-frontend.ps1

# Démarrer backend uniquement
.\start-backend.ps1
```

## 🔧 Structure du Projet

```
ClaraVerse/
├── src/                    # Code source frontend (React)
├── py_backend/             # Code source backend (Python/FastAPI)
├── public/                 # Fichiers publics
├── venv_claraverse/        # Environnement virtuel Python
├── node_modules/           # Dépendances npm
├── start-all.bat           # Script de démarrage complet
├── start-frontend.bat      # Script frontend
├── start-backend.bat       # Script backend
└── package.json            # Configuration npm
```

## 📊 Technologies Utilisées

### Frontend
- React 18.2.0
- TypeScript
- Vite
- TailwindCSS

### Backend
- Python 3.14.3
- FastAPI 0.99.1
- Pydantic 1.10.26
- Uvicorn
- Pandas, Numpy

## 🎯 Développement

### Frontend Uniquement
Si vous travaillez uniquement sur le frontend :
```powershell
.\start-frontend.ps1
```

### Backend Uniquement
Si vous travaillez uniquement sur le backend :
```powershell
.\start-backend.ps1
```

### Full-Stack
Pour travailler sur les deux :
```powershell
.\start-all.ps1
```

## 🐛 Dépannage

### Les scripts ne s'exécutent pas

**PowerShell :**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port déjà utilisé

Fermez l'application qui utilise le port ou changez le port dans la configuration.

### Environnement virtuel non trouvé

```powershell
python -m venv venv_claraverse
.\venv_claraverse\Scripts\Activate.ps1
cd py_backend
pip install -r requirements.txt
```

## 📖 Ressources

- [Documentation React](https://react.dev/)
- [Documentation FastAPI](https://fastapi.tiangolo.com/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Python](https://docs.python.org/)

## 🎉 Prêt à Développer !

Tout est configuré et prêt. Lancez simplement :

```
Double-clic sur start-all.bat
```

Ou :

```powershell
.\start-all.ps1
```

Et commencez à coder ! 🚀

---

**Bon développement avec ClaraVerse !** 💻✨
