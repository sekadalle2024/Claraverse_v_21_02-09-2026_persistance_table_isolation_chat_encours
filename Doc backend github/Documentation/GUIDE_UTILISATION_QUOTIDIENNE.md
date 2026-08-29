# Guide d'Utilisation Quotidienne

## 🎯 Workflow Quotidien

### Scénario 1 : Sauvegarde Rapide du Backend

**Situation** : Vous avez modifié des fichiers dans `py_backend/` et voulez les sauvegarder sur GitHub.

```powershell
# 1. Vérifier l'état (optionnel mais recommandé)
.\Doc backend github\Scripts\verifier-etat-backend.ps1

# 2. Sauvegarder
.\Doc backend github\Scripts\push-backend-to-github.ps1

# 3. Confirmer quand demandé
# Répondre "o" pour continuer
```

**Durée** : ~30 secondes

### Scénario 2 : Vérification Avant Sauvegarde

**Situation** : Vous voulez vérifier l'état avant de sauvegarder.

```powershell
# Vérifier l'état complet
.\Doc backend github\Scripts\verifier-etat-backend.ps1

# Lire le résumé
# Vérifier les modifications
# Puis sauvegarder si tout est OK
.\Doc backend github\Scripts\push-backend-to-github.ps1
```

### Scénario 3 : Récupération Après Interruption

**Situation** : Le script a été interrompu et le remote n'est pas restauré.

```powershell
# 1. Vérifier le remote actuel
git remote -v

# 2. Si c'est le repo backend, restaurer
.\Doc backend github\Scripts\restaurer-remote-original.ps1

# 3. Vérifier la restauration
git remote -v
```

## 📅 Fréquence Recommandée

### Sauvegarde Backend

- **Quotidienne** : À la fin de chaque journée de travail
- **Après modifications importantes** : Après ajout de fonctionnalités
- **Avant déploiement** : Avant tout déploiement en production

### Vérification

- **Avant chaque sauvegarde** : Utiliser le script de vérification
- **Hebdomadaire** : Vérifier l'état général du repository

## 🔄 Processus Complet

### Développement → Sauvegarde

```
1. Développement
   ↓
   Modifications dans py_backend/
   ↓
   Tests locaux
   ↓
2. Vérification
   ↓
   .\Doc backend github\Scripts\verifier-etat-backend.ps1
   ↓
   Lecture du résumé
   ↓
3. Sauvegarde
   ↓
   .\Doc backend github\Scripts\push-backend-to-github.ps1
   ↓
   Confirmation
   ↓
4. Vérification GitHub
   ↓
   Aller sur le repository
   ↓
   Vérifier les fichiers
```

## 🛠️ Commandes Utiles

### Vérifier l'État Local

```powershell
# État Git général
git status

# État du backend uniquement
git status py_backend/

# Derniers commits
git log --oneline -5

# Fichiers modifiés récemment
Get-ChildItem -Path "py_backend" -Recurse -File | 
    Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-1) }
```

### Vérifier le Remote

```powershell
# Afficher le remote
git remote -v

# Afficher l'URL du remote origin
git remote get-url origin
```

### Vérifier la Branche

```powershell
# Branche actuelle
git branch --show-current

# Toutes les branches
git branch -a
```

## 📊 Suivi des Sauvegardes

### Vérifier sur GitHub

1. Aller sur : https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
2. Vérifier la date du dernier commit
3. Vérifier que les fichiers sont à jour
4. Vérifier le message de commit

### Historique Local

```powershell
# Voir l'historique des commits backend
git log --oneline --all -- py_backend/

# Voir les détails d'un commit
git show [commit-hash]

# Voir les fichiers modifiés dans un commit
git show --name-only [commit-hash]
```

## 🎨 Personnalisation

### Modifier le Message de Commit

Éditer le script `push-backend-to-github.ps1` :

```powershell
# Ligne à modifier
$commitMessage = "Sauvegarde Backend Python - $date"

# Exemple personnalisé
$commitMessage = "Backend: Ajout fonctionnalité X - $date"
```

### Ajouter des Vérifications

Éditer le script `verifier-etat-backend.ps1` pour ajouter vos propres vérifications.

## 🚨 Situations Spéciales

### Sauvegarde Urgente

Si vous devez sauvegarder rapidement sans vérifications :

```powershell
# Directement
.\Doc backend github\Scripts\push-backend-to-github.ps1

# Confirmer immédiatement
# Répondre "o"
```

⚠️ **Attention** : Toujours vérifier après une sauvegarde urgente.

### Sauvegarde Après Gros Changements

Si vous avez fait beaucoup de modifications :

```powershell
# 1. Vérifier en détail
git status py_backend/
git diff py_backend/

# 2. Vérifier la taille
.\Doc backend github\Scripts\verifier-etat-backend.ps1

# 3. Sauvegarder
.\Doc backend github\Scripts\push-backend-to-github.ps1

# 4. Vérifier sur GitHub
# Aller sur le repository et vérifier
```

### Annuler une Sauvegarde

Si vous avez sauvegardé par erreur :

```powershell
# 1. Récupérer le commit précédent
git log --oneline -5

# 2. Revenir au commit précédent (local)
git reset --hard [commit-hash-precedent]

# 3. Force push à nouveau
.\Doc backend github\Scripts\push-backend-to-github.ps1
```

⚠️ **Attention** : Cela écrase l'historique. À utiliser avec précaution.

## 📝 Bonnes Pratiques

### Avant de Commencer la Journée

```powershell
# Vérifier l'état
git status
git remote -v

# S'assurer d'être sur master
git branch --show-current
```

### Pendant le Développement

- Sauvegarder régulièrement en local (git commit)
- Tester les modifications
- Documenter les changements importants

### En Fin de Journée

```powershell
# 1. Vérifier
.\Doc backend github\Scripts\verifier-etat-backend.ps1

# 2. Sauvegarder
.\Doc backend github\Scripts\push-backend-to-github.ps1

# 3. Vérifier sur GitHub
```

## 🔍 Dépannage Rapide

### Le Script Ne Trouve Pas py_backend/

```powershell
# Vérifier où vous êtes
Get-Location

# Aller à la racine du projet
cd [chemin-vers-racine-projet]

# Vérifier que py_backend/ existe
Test-Path "py_backend"
```

### Le Remote N'est Pas Restauré

```powershell
# Restaurer manuellement
.\Doc backend github\Scripts\restaurer-remote-original.ps1
```

### Erreur de Push

```powershell
# Vérifier la connexion
git remote -v

# Vérifier les credentials
# S'assurer d'être authentifié sur GitHub

# Réessayer
.\Doc backend github\Scripts\push-backend-to-github.ps1
```

## 📞 Aide

Pour plus d'informations :
- **Précautions** : `Documentation/PRECAUTIONS_IMPORTANTES.md`
- **Dépannage** : `Documentation/TROUBLESHOOTING.md`
- **Architecture** : `Documentation/ARCHITECTURE_BACKEND_GITHUB.md`

---

**Dernière mise à jour** : 19 avril 2026
