# 🔧 Commandes de Référence - GitHub Push

## ⚡ Solution Rapide

### Pour Gros Projets (> 50 MB)

```bash
# Configuration optimale
git config --global core.compression 0
git config --global http.postBuffer 1048576000
git config --global http.lowSpeedTime 999999
git config --global http.lowSpeedLimit 0

# Push avec verbose
git push origin master --verbose
```

---

## 📋 Commandes par Catégorie

### 🔍 Diagnostic

#### Vérifier la Taille du Repository
```bash
git count-objects -vH
```

#### Voir l'État Git
```bash
git status
git status -v  # Version détaillée
```

#### Vérifier le Remote
```bash
git remote -v
git remote show origin
```

#### Voir la Branche
```bash
git branch
git branch -a  # Toutes les branches
```

#### Historique des Commits
```bash
git log --oneline -10
git log --graph --all --oneline
```

#### Tester la Connexion
```bash
git ls-remote origin
```

---

### ⚙️ Configuration

#### Configuration pour Projets Normaux (< 50 MB)
```bash
git config --global core.compression -1
git config --global http.postBuffer 524288000
git config --global http.timeout 600
```

#### Configuration pour Gros Projets (50-100 MB)
```bash
git config --global core.compression 0
git config --global http.postBuffer 1048576000
git config --global http.timeout 3600
git config --global http.lowSpeedTime 999999
git config --global http.lowSpeedLimit 0
```

#### Configuration pour Très Gros Projets (> 100 MB)
```bash
git config --global core.compression 0
git config --global http.postBuffer 2097152000
git config --global http.timeout 7200
git config --global http.lowSpeedTime 999999
git config --global http.lowSpeedLimit 0
```

#### Voir la Configuration Actuelle
```bash
git config --list
git config --global --list
git config --local --list
```

#### Réinitialiser la Configuration
```bash
# Réinitialiser un paramètre
git config --global --unset core.compression
git config --global --unset http.postBuffer

# Réinitialiser tout
git config --global --unset-all
```

---

### 📤 Push

#### Push Standard
```bash
git push origin master
```

#### Push avec Verbose
```bash
git push origin master --verbose
```

#### Push avec Force (⚠️ Attention)
```bash
git push origin master --force
```

#### Push avec Upstream
```bash
git push -u origin master
```

#### Push Toutes les Branches
```bash
git push --all origin
```

#### Push avec Tags
```bash
git push --tags origin
```

---

### 🔄 Pull

#### Pull Standard
```bash
git pull origin master
```

#### Pull avec Rebase
```bash
git pull origin master --rebase
```

#### Pull avec Verbose
```bash
git pull origin master --verbose
```

---

### 📝 Commit

#### Commit Standard
```bash
git commit -m "Message"
```

#### Commit avec Ajout Automatique
```bash
git commit -am "Message"
```

#### Modifier le Dernier Commit
```bash
git commit --amend -m "Nouveau message"
```

#### Annuler le Dernier Commit (Garder les Modifications)
```bash
git reset --soft HEAD~1
```

#### Annuler le Dernier Commit (Supprimer les Modifications)
```bash
git reset --hard HEAD~1
```

---

### 🔗 Remote

#### Voir les Remotes
```bash
git remote -v
```

#### Ajouter un Remote
```bash
git remote add origin URL
```

#### Changer l'URL du Remote (HTTPS)
```bash
git remote set-url origin https://github.com/user/repo.git
```

#### Changer l'URL du Remote (SSH)
```bash
git remote set-url origin git@github.com:user/repo.git
```

#### Supprimer un Remote
```bash
git remote remove origin
```

#### Renommer un Remote
```bash
git remote rename origin new-origin
```

---

### 🔐 SSH

#### Générer une Clé SSH
```bash
ssh-keygen -t ed25519 -C "email@example.com"
```

#### Copier la Clé Publique (Windows)
```bash
cat ~/.ssh/id_ed25519.pub | clip
```

#### Copier la Clé Publique (Linux/Mac)
```bash
cat ~/.ssh/id_ed25519.pub
```

#### Tester la Connexion SSH
```bash
ssh -T git@github.com
```

#### Ajouter la Clé à l'Agent SSH
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

---

### 📦 Git LFS

#### Installer Git LFS
```bash
git lfs install
```

#### Tracker des Fichiers
```bash
git lfs track "*.zip"
git lfs track "*.mp4"
git lfs track "*.pdf"
```

#### Voir les Fichiers Trackés
```bash
git lfs ls-files
```

#### Voir le Statut LFS
```bash
git lfs status
```

---

### 🧹 Nettoyage

#### Nettoyer le Repository
```bash
git gc
git gc --aggressive
```

#### Vérifier l'Intégrité
```bash
git fsck --full
```

#### Nettoyer les Branches Distantes
```bash
git remote prune origin
```

#### Supprimer les Fichiers Non Trackés
```bash
git clean -fd
```

---

### 🔍 Recherche et Historique

#### Rechercher dans les Commits
```bash
git log --grep="mot-clé"
```

#### Voir les Modifications d'un Fichier
```bash
git log -p fichier.txt
```

#### Voir Qui a Modifié une Ligne
```bash
git blame fichier.txt
```

#### Voir les Différences
```bash
git diff
git diff --staged
git diff HEAD
```

---

### 🆘 Récupération

#### Récupérer un Fichier Supprimé
```bash
git checkout HEAD -- fichier.txt
```

#### Voir l'Historique des Commandes
```bash
git reflog
```

#### Revenir à un Commit Précédent
```bash
git checkout COMMIT_ID
```

#### Créer une Branche depuis un Commit
```bash
git checkout -b nouvelle-branche COMMIT_ID
```

---

## 📊 Scripts Utiles

### Script de Vérification Pré-Push
```bash
#!/bin/bash
echo "Vérification avant push..."
echo "Taille du repository:"
git count-objects -vH
echo ""
echo "État Git:"
git status
echo ""
echo "Remote:"
git remote -v
echo ""
echo "Branche:"
git branch
```

### Script de Configuration Automatique
```bash
#!/bin/bash
echo "Configuration Git pour gros projets..."
git config --global core.compression 0
git config --global http.postBuffer 1048576000
git config --global http.lowSpeedTime 999999
git config --global http.lowSpeedLimit 0
echo "Configuration terminée!"
git config --list | grep -E "(compression|postBuffer|lowSpeed)"
```

### Script de Push Sécurisé
```bash
#!/bin/bash
echo "Push sécurisé..."
git status
read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git push origin master --verbose
fi
```

---

## 🎯 Commandes par Scénario

### Scénario 1: Premier Push d'un Gros Projet
```bash
# 1. Vérifier la taille
git count-objects -vH

# 2. Configurer
git config --global core.compression 0
git config --global http.postBuffer 1048576000
git config --global http.lowSpeedTime 999999
git config --global http.lowSpeedLimit 0

# 3. Ajouter et commiter
git add .
git commit -m "Initial commit"

# 4. Configurer le remote
git remote add origin URL

# 5. Push
git push -u origin master --verbose
```

### Scénario 2: Push Échoué - Retry
```bash
# 1. Vérifier l'état
git status

# 2. Augmenter les limites
git config --global http.postBuffer 2097152000
git config --global http.timeout 7200

# 3. Réessayer
git push origin master --verbose
```

### Scénario 3: Changer de HTTPS à SSH
```bash
# 1. Générer la clé SSH
ssh-keygen -t ed25519 -C "email@example.com"

# 2. Copier la clé
cat ~/.ssh/id_ed25519.pub

# 3. Ajouter sur GitHub (manuellement)

# 4. Tester
ssh -T git@github.com

# 5. Changer l'URL
git remote set-url origin git@github.com:user/repo.git

# 6. Push
git push origin master
```

### Scénario 4: Diviser en Commits Plus Petits
```bash
# 1. Annuler le gros commit
git reset --soft HEAD~1

# 2. Commits par dossier
git add src/
git commit -m "Partie 1: Source"
git push origin master

git add public/
git commit -m "Partie 2: Public"
git push origin master

git add *.md
git commit -m "Partie 3: Documentation"
git push origin master

git add .
git commit -m "Partie 4: Reste"
git push origin master
```

---

## 💡 Alias Utiles

### Créer des Alias
```bash
# Alias pour status court
git config --global alias.st status

# Alias pour log graphique
git config --global alias.lg "log --graph --oneline --all"

# Alias pour push verbose
git config --global alias.pv "push --verbose"

# Alias pour commit rapide
git config --global alias.cm "commit -m"

# Alias pour voir la config
git config --global alias.cfg "config --list"
```

### Utiliser les Alias
```bash
git st          # au lieu de git status
git lg          # au lieu de git log --graph --oneline --all
git pv          # au lieu de git push --verbose
git cm "msg"    # au lieu de git commit -m "msg"
git cfg         # au lieu de git config --list
```

---

## 📝 Notes Importantes

### ⚠️ Commandes Dangereuses
```bash
# Force push - écrase l'historique distant
git push --force

# Reset hard - supprime les modifications
git reset --hard

# Clean - supprime les fichiers non trackés
git clean -fd
```

### ✅ Bonnes Pratiques
- Toujours utiliser `--verbose` pour les gros pushs
- Vérifier avec `git status` avant de commiter
- Tester la connexion avec `git ls-remote`
- Sauvegarder avant les opérations destructives

---

**Dernière mise à jour**: 21 Mars 2026  
**Version**: 1.0
