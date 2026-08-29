# 🚀 COMMENCEZ ICI - Installation ClaraVerse

## ⚡ Installation Ultra-Rapide (Copier-Coller)

Ouvrez PowerShell dans le dossier ClaraVerse et exécutez ces commandes une par une :

### Étape 1 : Vérifier l'état actuel
```powershell
.\verifier-installation.ps1
```

### Étape 2 : Installer Miniconda
```powershell
.\install-miniconda.ps1
```
**⚠️ IMPORTANT : Après cette étape :**
1. Fermez PowerShell
2. Ouvrez un nouveau PowerShell
3. Exécutez : `conda init`
4. Fermez et rouvrez à nouveau PowerShell

### Étape 3 : Configurer Python
```powershell
.\setup-python-env.ps1
```

### Étape 4 : Vérifier que tout est OK
```powershell
.\verifier-installation.ps1
```

### Étape 5 : Démarrer le projet
```powershell
conda activate claraverse
npm run dev:full
```

## ✅ C'est tout !

Votre projet ClaraVerse devrait maintenant fonctionner sur :
- Frontend : http://localhost:5173
- Backend : http://localhost:8000

## 📚 Besoin d'aide ?

- **Guide rapide** : `DEMARRAGE_RAPIDE.md`
- **Guide complet** : `GUIDE_MISE_A_JOUR_DEPENDANCES.md`
- **Détails installation** : `INSTALLATION_COMPLETE.md`

## 🐛 Problème ?

Exécutez à nouveau :
```powershell
.\verifier-installation.ps1
```

Ce script vous dira exactement ce qui manque et quoi faire.

---

**Note** : L'installation de `npm install` est actuellement en cours. Attendez qu'elle se termine avant de continuer (5-10 minutes).
