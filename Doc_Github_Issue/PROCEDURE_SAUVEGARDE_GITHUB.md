# 📚 Procédure de Sauvegarde sur GitHub

## 🎯 Guide Complet pour Sauvegarder ClaraVerse sur un Nouveau Repository

---

## 📋 ÉTAPE 1 : Créer le Repository sur GitHub.com

1. Allez sur **https://github.com**
2. Cliquez sur le **+** en haut à droite
3. Sélectionnez **"New repository"**
4. Remplissez :
   - **Repository name :** `Claraverse_version_nouveau_repo_VX`
   - **Description :** (optionnel) "ClaraVerse - Version X"
   - **Visibilité :** Public ou Private
   - ⚠️ **NE COCHEZ RIEN** (pas de README, pas de .gitignore, pas de license)
5. Cliquez sur **"Create repository"**

**Notez l'URL du repository :**
```
https://github.com/sekadalle2024/Claraverse_version_nouveau_repo_VX.git
```

---

## 💻 ÉTAPE 2 : Ouvrir PowerShell dans le Dossier du Projet

1. Ouvrez l'explorateur Windows
2. Naviguez vers votre dossier : `D:\ClaraVerse-v firebase`
3. Dans la barre d'adresse, tapez : `powershell` et appuyez sur Entrée
4. PowerShell s'ouvre dans le bon dossier

---

## ⚡ ÉTAPE 3 : Commandes à Exécuter (Copier-Coller)

### Commande 1 : Ajouter tous les fichiers
```powershell
git add .
```
**Explication :** Prépare tous les fichiers modifiés pour le commit.

---

### Commande 2 : Créer un commit
```powershell
git commit -m "Sauvegarde ClaraVerse - Version X"
```
**Explication :** Crée un point de sauvegarde avec un message descriptif.

---

### Commande 3 : Changer le repository distant
```powershell
git remote set-url origin https://github.com/sekadalle2024/Claraverse_version_nouveau_repo_VX.git
```
**⚠️ IMPORTANT :** Remplacez `Claraverse_version_nouveau_repo_VX` par le nom de VOTRE nouveau repository !

**Explication :** Connecte votre projet local au nouveau repository GitHub.

---

### Commande 4 : Vérifier la connexion
```powershell
git remote -v
```
**Explication :** Affiche l'URL du repository pour vérifier que c'est le bon.

**Vous devriez voir :**
```
origin  https://github.com/sekadalle2024/Claraverse_version_nouveau_repo_VX.git (fetch)
origin  https://github.com/sekadalle2024/Claraverse_version_nouveau_repo_VX.git (push)
```

---

### Commande 5 : Voir sur quelle branche vous êtes
```powershell
git branch
```
**Explication :** Affiche le nom de votre branche actuelle (ex: `ClaraVerse-v-firebase-V3-24.11.25`).

---

### Commande 6 : Envoyer vers GitHub
```powershell
git push -u origin NOM_DE_VOTRE_BRANCHE
```

**Exemples :**
- Si votre branche s'appelle `main` :
  ```powershell
  git push -u origin main
  ```

- Si votre branche s'appelle `ClaraVerse-v-firebase-V3-24.11.25` :
  ```powershell
  git push -u origin ClaraVerse-v-firebase-V3-24.11.25
  ```

**Explication :** Envoie tous vos fichiers sur GitHub.

---

## ✅ ÉTAPE 4 : Vérifier sur GitHub

1. Allez sur : `https://github.com/sekadalle2024/Claraverse_version_nouveau_repo_VX`
2. Si vous ne voyez pas de fichiers, cliquez sur le menu déroulant des branches (en haut à gauche)
3. Sélectionnez votre branche (ex: `ClaraVerse-v-firebase-V3-24.11.25`)
4. Vérifiez que tous vos fichiers sont présents
5. **IMPORTANT :** Vérifiez que `src/assets/logo.png` est bien là

---

## 🔄 RÉSUMÉ : Les 6 Commandes à Copier-Coller

```powershell
# 1. Ajouter tous les fichiers
git add .

# 2. Créer un commit
git commit -m "Sauvegarde ClaraVerse - Version X"

# 3. Changer le repository (REMPLACEZ L'URL !)
git remote set-url origin https://github.com/sekadalle2024/Claraverse_version_nouveau_repo_VX.git

# 4. Vérifier la connexion
git remote -v

# 5. Voir votre branche
git branch

# 6. Envoyer vers GitHub (REMPLACEZ LE NOM DE LA BRANCHE !)
git push -u origin VOTRE_BRANCHE
```

---

## 🆘 EN CAS DE PROBLÈME

### Erreur : "remote origin already exists"
**Solution :** La commande 3 a déjà changé l'URL, c'est normal. Passez à la commande 4.

---

### Erreur : "Permission denied"
**Solution :** GitHub vous demande de vous connecter.
1. Suivez les instructions à l'écran
2. Ou créez un Personal Access Token sur GitHub.com

---

### Erreur : "Updates were rejected"
**Solution :** Le repository distant a du contenu.
```powershell
git pull origin VOTRE_BRANCHE --allow-unrelated-histories
git push -u origin VOTRE_BRANCHE
```

---

### Erreur : "not a git repository"
**Solution :** Vous n'êtes pas dans le bon dossier.
```powershell
cd "D:\ClaraVerse-v firebase"
```

---

## 📝 EXEMPLE COMPLET

Supposons que vous créez un repository nommé `ClaraVerse-backup-2025` :

```powershell
# 1. Ajouter
git add .

# 2. Commit
git commit -m "Sauvegarde ClaraVerse - Janvier 2025"

# 3. Changer le repository
git remote set-url origin https://github.com/sekadalle2024/ClaraVerse-backup-2025.git

# 4. Vérifier
git remote -v

# 5. Voir la branche
git branch
# Résultat : * ClaraVerse-v-firebase-V3-24.11.25

# 6. Push
git push -u origin ClaraVerse-v-firebase-V3-24.11.25
```

---

## 💡 CONSEILS

### Pour les Sauvegardes Régulières (Même Repository)

Si vous voulez juste sauvegarder des modifications sur le même repository :

```powershell
# 1. Ajouter les modifications
git add .

# 2. Commit
git commit -m "Description des modifications"

# 3. Push (pas besoin de changer le remote)
git push
```

---

### Pour Créer une Nouvelle Branche

Si vous voulez créer une nouvelle branche pour une nouvelle version :

```powershell
# Créer et basculer sur une nouvelle branche
git checkout -b ClaraVerse-v-firebase-V4-25.11.25

# Puis faire le commit et push
git add .
git commit -m "Version 4"
git push -u origin ClaraVerse-v-firebase-V4-25.11.25
```

---

## 🎯 CHECKLIST RAPIDE

Avant de sauvegarder, vérifiez :
- [ ] Repository créé sur GitHub.com (vide, sans README)
- [ ] PowerShell ouvert dans le bon dossier
- [ ] URL du repository notée
- [ ] Nom de la branche connu (`git branch`)
- [ ] Commandes copiées et URL remplacée

---

## 📊 STRUCTURE DES COMMANDES

```
Votre PC                          GitHub
    |                                |
    | git add .                      |
    | (prépare les fichiers)         |
    |                                |
    | git commit                     |
    | (crée un point de sauvegarde)  |
    |                                |
    | git remote set-url             |
    | (connecte au repository)       |
    |                                |
    | git push                       |
    |------------------------------>|
    |     (envoie les fichiers)     |
    |                                |
```

---

## ✨ RÉSULTAT FINAL

Après avoir suivi cette procédure :
- ✅ Votre projet est sauvegardé sur GitHub
- ✅ Tous les fichiers sont présents (y compris logo.png)
- ✅ Vous pouvez le cloner sur n'importe quel ordinateur
- ✅ Vous pouvez le déployer sur Firebase Studio
- ✅ Vous avez une sauvegarde sécurisée

---

**Date de création :** 24 novembre 2025  
**Testé et validé :** ✅ OUI  
**Projet :** ClaraVerse
