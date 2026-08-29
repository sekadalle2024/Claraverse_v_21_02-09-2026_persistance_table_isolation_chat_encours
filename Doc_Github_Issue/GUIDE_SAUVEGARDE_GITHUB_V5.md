# 🚀 Guide de Sauvegarde ClaraVerse vers GitHub V5

## 📋 Informations du Repository

- **Repository GitHub**: `Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public`
- **URL**: https://github.com/sekadalle2024/Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public.git
- **Date**: 21 Mars 2026
- **Version**: V5

---

## ⚡ Méthode Rapide (Recommandée)

### Utiliser le script automatique

```powershell
.\push-to-github-v5.ps1
```

Ce script effectue automatiquement toutes les étapes ci-dessous.

---

## 📝 Méthode Manuelle (Étape par étape)

### 1️⃣ Vérifier l'état actuel

```bash
git status
git remote -v
git branch
```

### 2️⃣ Ajouter tous les fichiers modifiés

```bash
git add .
```

### 3️⃣ Créer un commit

```bash
git commit -m "Sauvegarde ClaraVerse Windows 11 - Version V5 - 21-03-2026"
```

### 4️⃣ Changer le repository distant

```bash
git remote set-url origin https://github.com/sekadalle2024/Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public.git
```

### 5️⃣ Vérifier la nouvelle connexion

```bash
git remote -v
```

Vous devriez voir:
```
origin  https://github.com/sekadalle2024/Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public.git (fetch)
origin  https://github.com/sekadalle2024/Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public.git (push)
```

### 6️⃣ Identifier votre branche

```bash
git branch
```

La branche active est marquée avec `*` (généralement `main` ou `master`)

### 7️⃣ Envoyer vers GitHub

Remplacez `VOTRE_BRANCHE` par le nom de votre branche (ex: `main` ou `master`):

```bash
git push -u origin VOTRE_BRANCHE
```

Exemples:
```bash
git push -u origin main
# ou
git push -u origin master
```

---

## 🔧 Résolution de Problèmes

### Problème: "Repository not found"

**Solution**: Vérifiez que le repository existe sur GitHub et que vous avez les droits d'accès.

### Problème: "Authentication failed"

**Solution**: Configurez vos identifiants GitHub:

```bash
git config --global user.name "sekadalle2024"
git config --global user.email "votre-email@example.com"
```

Vous devrez peut-être utiliser un Personal Access Token au lieu d'un mot de passe.

### Problème: "Updates were rejected"

**Solution**: Si le repository distant a des commits que vous n'avez pas localement:

```bash
git pull origin VOTRE_BRANCHE --rebase
git push -u origin VOTRE_BRANCHE
```

### Problème: Conflit de branches

**Solution**: Forcer le push (⚠️ Attention: écrase l'historique distant):

```bash
git push -u origin VOTRE_BRANCHE --force
```

---

## ✅ Vérification Post-Sauvegarde

1. Visitez votre repository sur GitHub:
   https://github.com/sekadalle2024/Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public

2. Vérifiez que tous vos fichiers sont présents

3. Vérifiez la date du dernier commit

---

## 📌 Commandes Utiles

### Voir l'historique des commits
```bash
git log --oneline -10
```

### Voir les fichiers modifiés
```bash
git status
```

### Annuler le dernier commit (si erreur)
```bash
git reset --soft HEAD~1
```

### Voir les différences avant commit
```bash
git diff
```

---

## 🔄 Sauvegardes Futures

Pour les prochaines sauvegardes, utilisez simplement:

```bash
git add .
git commit -m "Description des modifications"
git push
```

Le repository est maintenant configuré, plus besoin de refaire `git remote set-url`.

---

## 📞 Support

Si vous rencontrez des problèmes, vérifiez:
- Votre connexion Internet
- Vos droits d'accès au repository GitHub
- Que le repository existe bien sur GitHub
