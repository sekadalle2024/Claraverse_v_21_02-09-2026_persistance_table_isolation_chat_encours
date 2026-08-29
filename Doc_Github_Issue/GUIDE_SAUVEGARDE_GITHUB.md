# Guide de Sauvegarde ClaraVerse vers GitHub

## Repository Cible
**URL:** https://github.com/sekadalle2024/Calaraverse_windows_s_11_v0_10-03-2026_V5-Public-Public.git

## Méthode Recommandée: Script Automatisé

### Utilisation du Script PowerShell

```powershell
.\push-to-github-backup.ps1
```

Le script effectue automatiquement:
1. ✓ Vérification de l'état du repository
2. ✓ Ajout de tous les fichiers modifiés
3. ✓ Création d'un commit avec horodatage
4. ✓ Configuration du remote vers le bon repository
5. ✓ Détection automatique de la branche
6. ✓ Push vers GitHub avec confirmation

### Avantages du Script
- Sécurisé avec confirmations à chaque étape
- Horodatage automatique des commits
- Vérifications avant chaque action
- Messages d'erreur clairs
- Gestion automatique de la branche

## Méthode Manuelle (Alternative)

Si vous préférez exécuter les commandes manuellement:

### 1. Vérifier l'état actuel
```bash
git status
git remote -v
git branch
```

### 2. Ajouter tous les fichiers
```bash
git add .
```

### 3. Créer un commit
```bash
git commit -m "Sauvegarde ClaraVerse - Mise à jour du 10-03-2026"
```

### 4. Configurer le remote (si nécessaire)
```bash
git remote set-url origin https://github.com/sekadalle2024/Calaraverse_windows_s_11_v0_10-03-2026_V5-Public-Public.git
```

### 5. Vérifier la configuration
```bash
git remote -v
```

### 6. Identifier votre branche
```bash
git branch
```

### 7. Push vers GitHub
```bash
# Remplacez VOTRE_BRANCHE par le nom affiché (probablement 'main' ou 'master')
git push -u origin VOTRE_BRANCHE
```

## Résolution de Problèmes Courants

### Erreur: "remote origin already exists"
```bash
git remote set-url origin https://github.com/sekadalle2024/Calaraverse_windows_s_11_v0_10-03-2026_V5-Public-Public.git
```

### Erreur: "failed to push some refs"
```bash
# Option 1: Pull puis push
git pull origin VOTRE_BRANCHE --rebase
git push -u origin VOTRE_BRANCHE

# Option 2: Force push (ATTENTION: écrase l'historique distant)
git push -u origin VOTRE_BRANCHE --force
```

### Erreur: "Authentication failed"
- Vérifiez vos identifiants GitHub
- Utilisez un Personal Access Token au lieu du mot de passe
- Configurez Git Credential Manager

### Pas de branche détectée
```bash
git checkout -b main
git push -u origin main
```

## Bonnes Pratiques

### 1. Avant chaque sauvegarde
- Vérifiez que votre code fonctionne localement
- Testez les fonctionnalités modifiées
- Vérifiez qu'il n'y a pas de fichiers sensibles (.env, clés API)

### 2. Messages de commit
Utilisez des messages descriptifs:
```bash
git commit -m "Ajout du module E-Revision - 10/03/2026"
git commit -m "Correction bug authentification - 10/03/2026"
git commit -m "Mise à jour dépendances et documentation - 10/03/2026"
```

### 3. Fréquence de sauvegarde
- Après chaque fonctionnalité complétée
- À la fin de chaque session de travail
- Avant des modifications importantes
- Au minimum une fois par jour

### 4. Vérification post-sauvegarde
Après le push, vérifiez sur GitHub:
- Les fichiers sont bien présents
- Le commit apparaît dans l'historique
- La date et le message sont corrects

## Fichiers à Exclure

Vérifiez votre `.gitignore` pour exclure:
```
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
```

## Commandes Utiles

### Voir l'historique des commits
```bash
git log --oneline -10
```

### Voir les fichiers modifiés
```bash
git status
git diff
```

### Annuler le dernier commit (avant push)
```bash
git reset --soft HEAD~1
```

### Voir les branches
```bash
git branch -a
```

## Support

En cas de problème:
1. Vérifiez votre connexion Internet
2. Vérifiez vos permissions sur le repository GitHub
3. Consultez les messages d'erreur Git
4. Utilisez le script automatisé qui gère la plupart des cas

---

**Date de création:** 10 mars 2026
**Repository:** Calaraverse_windows_s_11_v0_10-03-2026_V5-Public-Public
