# Guide de Dépannage - Repository Backend

## 🔧 Problèmes Courants et Solutions

### 1. Remote Non Restauré

**Symptôme** :
```powershell
git remote -v
# origin  https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
```

**Cause** : Script interrompu avant la restauration du remote

**Solution** :
```powershell
# Utiliser le script de restauration
.\Doc backend github\Scripts\restaurer-remote-original.ps1

# Ou manuellement
git remote set-url origin https://github.com/sekadalle2024/Claverse_windows__v_9_19-04-2026_V5-Export_CAC-V0-Public.git

# Vérifier
git remote -v
```

---

### 2. Dossier py_backend/ Non Trouvé

**Symptôme** :
```
✗ Dossier py_backend non trouvé!
```

**Cause** : Script exécuté depuis le mauvais dossier

**Solution** :
```powershell
# Vérifier où vous êtes
Get-Location

# Aller à la racine du projet
cd C:\chemin\vers\projet\Claraverse

# Vérifier que py_backend/ existe
Test-Path "py_backend"

# Réexécuter le script
.\Doc backend github\Scripts\push-backend-to-github.ps1
```

---

### 3. Erreur d'Authentification GitHub

**Symptôme** :
```
fatal: Authentication failed
```

**Cause** : Credentials GitHub non configurés ou expirés

**Solution** :

#### Option 1 : Utiliser GitHub CLI
```powershell
# Installer GitHub CLI si nécessaire
winget install GitHub.cli

# S'authentifier
gh auth login

# Suivre les instructions
```

#### Option 2 : Utiliser Personal Access Token
```powershell
# 1. Créer un token sur GitHub
# Aller sur : https://github.com/settings/tokens
# Générer un nouveau token avec les permissions "repo"

# 2. Utiliser le token
# Lors du push, utiliser le token comme mot de passe
```

#### Option 3 : Configurer Git Credential Manager
```powershell
# Installer Git Credential Manager
winget install Git.Git

# Configurer
git config --global credential.helper manager-core

# Réessayer le push
```

---

### 4. Conflit de Versions

**Symptôme** :
```
! [rejected]        master -> master (fetch first)
```

**Cause** : Version distante différente de la version locale

**Solution** :

Le script utilise `--force` pour résoudre ce problème automatiquement.

Si vous voulez vérifier avant :
```powershell
# Récupérer les infos distantes
git fetch origin

# Voir les différences
git log origin/master..master

# Voir les commits distants
git log master..origin/master

# Puis décider :
# - Force push (version locale prioritaire) : utiliser le script
# - Merge (combiner) : git merge origin/master puis push
```

---

### 5. Fichiers Trop Volumineux

**Symptôme** :
```
remote: error: File too large
```

**Cause** : Fichiers > 100 MB dans py_backend/

**Solution** :
```powershell
# 1. Identifier les gros fichiers
Get-ChildItem -Path "py_backend" -Recurse -File | 
    Where-Object { $_.Length -gt 50MB } | 
    Select-Object FullName, @{Name="SizeMB";Expression={[math]::Round($_.Length/1MB,2)}}

# 2. Options :
# - Ajouter au .gitignore
# - Utiliser Git LFS
# - Supprimer/déplacer les fichiers

# 3. Ajouter au .gitignore
Add-Content -Path ".gitignore" -Value "`npy_backend/fichier_volumineux.ext"

# 4. Utiliser Git LFS (si nécessaire)
git lfs install
git lfs track "py_backend/*.ext"
git add .gitattributes
```

---

### 6. Nothing to Commit

**Symptôme** :
```
nothing to commit, working tree clean
```

**Cause** : Aucune modification dans py_backend/

**Solution** :

C'est normal si vous n'avez rien modifié. Le script continue quand même pour permettre un push si nécessaire.

```powershell
# Vérifier les modifications
git status py_backend/

# Si vous voulez forcer un commit
git commit --allow-empty -m "Commit vide pour synchronisation"
```

---

### 7. Permission Denied

**Symptôme** :
```
Permission denied (publickey)
```

**Cause** : Clé SSH non configurée ou HTTPS non authentifié

**Solution** :

#### Pour HTTPS (recommandé)
```powershell
# Vérifier l'URL du remote
git remote get-url origin

# Doit commencer par https://
# Si c'est git@github.com, changer :
git remote set-url origin https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
```

#### Pour SSH
```powershell
# Générer une clé SSH
ssh-keygen -t ed25519 -C "votre@email.com"

# Ajouter la clé à GitHub
# Copier le contenu de ~/.ssh/id_ed25519.pub
# Aller sur https://github.com/settings/keys
# Ajouter la clé
```

---

### 8. Script PowerShell Bloqué

**Symptôme** :
```
cannot be loaded because running scripts is disabled
```

**Cause** : Politique d'exécution PowerShell restrictive

**Solution** :
```powershell
# Vérifier la politique actuelle
Get-ExecutionPolicy

# Changer temporairement (session actuelle)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Ou de manière permanente (admin requis)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Réexécuter le script
```

---

### 9. Modifications Non Détectées

**Symptôme** : Fichiers modifiés mais `git status` ne les montre pas

**Cause** : Fichiers dans .gitignore ou problème de cache Git

**Solution** :
```powershell
# Vérifier .gitignore
Get-Content .gitignore | Select-String "py_backend"

# Rafraîchir le cache Git
git rm -r --cached py_backend/
git add py_backend/

# Vérifier à nouveau
git status py_backend/
```

---

### 10. Erreur de Réseau

**Symptôme** :
```
fatal: unable to access 'https://github.com/...': Failed to connect
```

**Cause** : Problème de connexion internet ou proxy

**Solution** :
```powershell
# Vérifier la connexion
Test-Connection github.com

# Si derrière un proxy, configurer Git
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080

# Ou désactiver SSL (temporaire, non recommandé)
git config --global http.sslVerify false

# Réessayer
```

---

## 🔍 Diagnostic Général

### Commandes de Diagnostic

```powershell
# 1. État général
git status

# 2. État du backend
git status py_backend/

# 3. Remote actuel
git remote -v

# 4. Branche actuelle
git branch --show-current

# 5. Derniers commits
git log --oneline -5

# 6. Configuration Git
git config --list

# 7. Vérifier l'authentification
git ls-remote origin

# 8. Taille du dossier
Get-ChildItem -Path "py_backend" -Recurse -File | 
    Measure-Object -Property Length -Sum | 
    Select-Object @{Name="SizeMB";Expression={[math]::Round($_.Sum/1MB,2)}}
```

### Script de Diagnostic Complet

```powershell
# Utiliser le script de vérification
.\Doc backend github\Scripts\verifier-etat-backend.ps1

# Lire attentivement le résumé
```

---

## 🆘 Procédures d'Urgence

### Réinitialisation Complète du Remote

```powershell
# 1. Sauvegarder l'état actuel
git log --oneline -10 > backup-commits.txt

# 2. Vérifier le remote
git remote -v

# 3. Supprimer le remote
git remote remove origin

# 4. Recréer le remote (principal)
git remote add origin https://github.com/sekadalle2024/Claverse_windows__v_9_19-04-2026_V5-Export_CAC-V0-Public.git

# 5. Vérifier
git remote -v
```

### Annuler le Dernier Push

```powershell
# 1. Voir l'historique
git log --oneline -5

# 2. Revenir au commit précédent (local)
git reset --hard HEAD~1

# 3. Force push
.\Doc backend github\Scripts\push-backend-to-github.ps1
```

⚠️ **ATTENTION** : Cela supprime le dernier commit. À utiliser avec précaution.

### Récupération Après Erreur Grave

```powershell
# 1. Créer une branche de sauvegarde
git branch backup-$(Get-Date -Format "yyyyMMdd-HHmmss")

# 2. Revenir à un état stable
git log --oneline -10
git reset --hard [commit-hash-stable]

# 3. Vérifier l'état
git status

# 4. Restaurer le remote si nécessaire
.\Doc backend github\Scripts\restaurer-remote-original.ps1

# 5. Réessayer l'opération
```

---

## 📞 Support Avancé

### Logs Détaillés

```powershell
# Activer les logs Git détaillés
$env:GIT_TRACE=1
$env:GIT_CURL_VERBOSE=1

# Exécuter le script
.\Doc backend github\Scripts\push-backend-to-github.ps1

# Désactiver les logs
Remove-Item Env:\GIT_TRACE
Remove-Item Env:\GIT_CURL_VERBOSE
```

### Vérification de l'Intégrité

```powershell
# Vérifier l'intégrité du repository
git fsck

# Nettoyer le repository
git gc --aggressive --prune=now

# Vérifier les références
git show-ref
```

---

## 📚 Ressources Supplémentaires

- **Documentation Git** : https://git-scm.com/doc
- **GitHub Docs** : https://docs.github.com
- **PowerShell Docs** : https://docs.microsoft.com/powershell

---

**Dernière mise à jour** : 19 avril 2026
