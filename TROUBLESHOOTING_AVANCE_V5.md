# 🔧 Troubleshooting Avancé - Sauvegarde ClaraVerse V5

## 🎯 Guide de Résolution de Problèmes Avancés

---

## 1️⃣ Problèmes d'Authentification

### Symptôme: "Authentication failed"

#### Solution A: Utiliser un Personal Access Token (PAT)

1. Créez un token sur GitHub:
   - Allez sur: https://github.com/settings/tokens
   - Cliquez sur "Generate new token" → "Generate new token (classic)"
   - Sélectionnez les permissions: `repo` (toutes les sous-options)
   - Générez et copiez le token (vous ne le reverrez plus!)

2. Utilisez le token lors du push:
   ```bash
   git push -u origin main
   # Username: sekadalle2024
   # Password: [COLLEZ VOTRE TOKEN ICI]
   ```

3. Sauvegardez le token pour les prochaines fois:
   ```bash
   git config --global credential.helper wincred
   ```

#### Solution B: Configurer SSH (Alternative)

1. Générez une clé SSH:
   ```bash
   ssh-keygen -t ed25519 -C "votre-email@example.com"
   ```

2. Ajoutez la clé à GitHub:
   - Copiez le contenu de `~/.ssh/id_ed25519.pub`
   - Allez sur: https://github.com/settings/keys
   - Ajoutez la clé

3. Changez l'URL du repository en SSH:
   ```bash
   git remote set-url origin git@github.com:sekadalle2024/Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public.git
   ```

---

## 2️⃣ Problèmes de Push Rejeté

### Symptôme: "Updates were rejected"

#### Cause: Le repository distant a des commits que vous n'avez pas

#### Solution A: Pull avec Rebase (Recommandé)
```bash
git pull origin main --rebase
# Résolvez les conflits si nécessaire
git push -u origin main
```

#### Solution B: Pull avec Merge
```bash
git pull origin main
# Résolvez les conflits si nécessaire
git push -u origin main
```

#### Solution C: Force Push (⚠️ ATTENTION: Écrase l'historique distant)
```bash
git push -u origin main --force
```

**Utilisez --force uniquement si:**
- Vous êtes sûr de vouloir écraser l'historique distant
- Personne d'autre ne travaille sur ce repository
- Vous avez une sauvegarde

---

## 3️⃣ Problèmes de Branche

### Symptôme: "src refspec main does not match any"

#### Cause: La branche n'existe pas ou a un nom différent

#### Solution:
```bash
# Vérifiez le nom de votre branche
git branch

# Si c'est "master" au lieu de "main":
git push -u origin master

# Ou renommez la branche:
git branch -M main
git push -u origin main
```

---

## 4️⃣ Problèmes de Taille de Fichiers

### Symptôme: "file size exceeds GitHub's file size limit"

#### Cause: Fichiers > 100 MB

#### Solution A: Utiliser Git LFS
```bash
# Installer Git LFS
git lfs install

# Tracker les gros fichiers
git lfs track "*.zip"
git lfs track "*.mp4"

# Ajouter .gitattributes
git add .gitattributes

# Commit et push
git add .
git commit -m "Ajout Git LFS"
git push
```

#### Solution B: Exclure les gros fichiers
```bash
# Ajoutez-les au .gitignore
echo "gros-fichier.zip" >> .gitignore
git rm --cached gros-fichier.zip
git commit -m "Retrait gros fichier"
git push
```

---

## 5️⃣ Problèmes de Connexion Réseau

### Symptôme: "Failed to connect to github.com"

#### Solution A: Vérifier le proxy
```bash
# Si vous êtes derrière un proxy
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080

# Pour retirer le proxy
git config --global --unset http.proxy
git config --global --unset https.proxy
```

#### Solution B: Augmenter le timeout
```bash
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

---

## 6️⃣ Problèmes de Conflits

### Symptôme: "CONFLICT (content): Merge conflict"

#### Solution:
```bash
# 1. Voir les fichiers en conflit
git status

# 2. Ouvrir chaque fichier et résoudre les conflits
# Cherchez les marqueurs: <<<<<<<, =======, >>>>>>>

# 3. Après résolution, marquer comme résolu
git add fichier-resolu.txt

# 4. Continuer le rebase ou merge
git rebase --continue
# ou
git merge --continue

# 5. Push
git push
```

---

## 7️⃣ Problèmes de Repository Corrompu

### Symptôme: "fatal: not a git repository"

#### Solution A: Réinitialiser Git
```bash
# Sauvegarder vos fichiers d'abord!
rm -rf .git
git init
git remote add origin https://github.com/sekadalle2024/Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public.git
git add .
git commit -m "Réinitialisation du repository"
git push -u origin main --force
```

#### Solution B: Réparer le repository
```bash
git fsck --full
git gc --prune=now
git remote prune origin
```

---

## 8️⃣ Problèmes de Permissions

### Symptôme: "Permission denied (publickey)"

#### Solution:
```bash
# Vérifier les clés SSH
ssh -T git@github.com

# Si échec, régénérer la clé
ssh-keygen -t ed25519 -C "votre-email@example.com"

# Ajouter la clé à l'agent SSH
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Ajouter la clé publique à GitHub
cat ~/.ssh/id_ed25519.pub
# Copiez et ajoutez sur https://github.com/settings/keys
```

---

## 9️⃣ Problèmes de .gitignore

### Symptôme: "Fichiers ignorés ne sont pas ajoutés"

#### Solution:
```bash
# Forcer l'ajout d'un fichier ignoré
git add -f fichier-ignore.txt

# Ou modifier .gitignore et retirer la règle

# Pour voir ce qui est ignoré
git status --ignored
```

---

## 🔟 Problèmes de Ligne de Fin (CRLF vs LF)

### Symptôme: "warning: LF will be replaced by CRLF"

#### Solution:
```bash
# Sur Windows, configurer pour gérer automatiquement
git config --global core.autocrlf true

# Pour ignorer les avertissements
git config --global core.safecrlf false
```

---

## 🆘 Commandes de Diagnostic

### Vérifier l'état complet
```bash
git status -v
git log --oneline --graph --all -10
git remote -v
git branch -a
```

### Voir les différences
```bash
git diff
git diff --staged
git diff origin/main
```

### Historique des commandes
```bash
git reflog
```

### Informations détaillées
```bash
git config --list
git remote show origin
```

---

## 🔄 Scénarios de Récupération

### Annuler le dernier commit (non pushé)
```bash
git reset --soft HEAD~1
```

### Annuler les modifications locales
```bash
git checkout -- fichier.txt
# ou pour tout
git reset --hard HEAD
```

### Récupérer un fichier supprimé
```bash
git checkout HEAD -- fichier-supprime.txt
```

### Revenir à un commit précédent
```bash
git log --oneline
git reset --hard COMMIT_ID
```

---

## 📞 Obtenir de l'Aide

### Commandes d'aide Git
```bash
git help
git help push
git help config
```

### Logs détaillés
```bash
GIT_TRACE=1 git push
GIT_CURL_VERBOSE=1 git push
```

---

## ✅ Checklist de Vérification Finale

Avant de demander de l'aide, vérifiez:

- [ ] Git est installé et à jour: `git --version`
- [ ] Vous êtes dans le bon dossier: `pwd`
- [ ] Le repository existe sur GitHub
- [ ] Vous avez les droits d'accès au repository
- [ ] Votre connexion Internet fonctionne
- [ ] Vos identifiants Git sont configurés
- [ ] Vous utilisez la bonne branche
- [ ] Aucun fichier trop volumineux (> 100 MB)
- [ ] Pas de conflits non résolus

---

## 🔗 Ressources Utiles

- Documentation Git: https://git-scm.com/doc
- GitHub Docs: https://docs.github.com
- Git Book: https://git-scm.com/book/en/v2
- GitHub Community: https://github.community

---

**Dernière mise à jour**: 21 Mars 2026
