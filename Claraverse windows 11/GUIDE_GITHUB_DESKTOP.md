# 🖥️ Guide GitHub Desktop - Nouveau Repository

## 🎯 Objectif
Créer un nouveau repository et y envoyer votre projet ClaraVerse avec GitHub Desktop.

---

## 📋 ÉTAPES COMPLÈTES

### 1️⃣ Créer le Nouveau Repository sur GitHub.com

1. Allez sur **https://github.com**
2. Cliquez sur le **+** en haut à droite
3. Sélectionnez **"New repository"**
4. Remplissez :
   - **Repository name :** `claraverse-backup-v3` (ou le nom de votre choix)
   - **Description :** "ClaraVerse - Version mise à jour"
   - **Visibilité :** Public ou Private (votre choix)
   - ⚠️ **NE COCHEZ PAS** "Initialize with README"
   - ⚠️ **NE COCHEZ PAS** "Add .gitignore"
   - ⚠️ **NE COCHEZ PAS** "Add license"
5. Cliquez sur **"Create repository"**

**Notez l'URL du repository** (exemple : `https://github.com/sekadalle2024/claraverse-backup-v3.git`)

---

### 2️⃣ Ouvrir GitHub Desktop

1. Lancez **GitHub Desktop**
2. Si vous n'êtes pas connecté, connectez-vous avec votre compte GitHub

---

### 3️⃣ Ajouter Votre Projet Local

**Option A : Si le projet n'est pas encore dans GitHub Desktop**

1. Dans GitHub Desktop, cliquez sur **File** → **Add Local Repository**
2. Cliquez sur **"Choose..."**
3. Naviguez vers le dossier de votre projet ClaraVerse
4. Cliquez sur **"Add Repository"**

**Option B : Si Git n'est pas initialisé**

Si vous voyez un message d'erreur :
1. Cliquez sur **"Create a repository"**
2. Ou dans le menu : **File** → **New Repository**
3. Sélectionnez le dossier de votre projet
4. Cliquez sur **"Create Repository"**

---

### 4️⃣ Vérifier les Fichiers à Commiter

Dans GitHub Desktop, vous devriez voir :

**Onglet "Changes" :**
- ✅ Tous vos fichiers modifiés
- ✅ `src/assets/logo.png` devrait être visible
- ✅ `src/assets/temo.png` devrait être visible

**Si vous ne voyez PAS logo.png :**
1. Vérifiez que le `.gitignore` a été corrigé (c'est déjà fait)
2. Cliquez sur **Repository** → **Repository Settings**
3. Vérifiez que le `.gitignore` est bien pris en compte

---

### 5️⃣ Créer le Premier Commit

1. Dans la zone **"Summary"** en bas à gauche, tapez :
   ```
   Mise à jour ClaraVerse - Version corrigée
   ```

2. (Optionnel) Dans **"Description"**, ajoutez :
   ```
   - Correction du .gitignore pour inclure les assets
   - Ajout de src/assets/logo.png
   - Projet prêt pour le déploiement
   ```

3. Cliquez sur le bouton bleu **"Commit to main"** (ou "Commit to master")

---

### 6️⃣ Publier vers le Nouveau Repository

**Méthode 1 : Publier un nouveau repository**

Si GitHub Desktop propose "Publish repository" :
1. Cliquez sur **"Publish repository"**
2. Vérifiez le nom du repository
3. Décochez **"Keep this code private"** si vous voulez un repo public
4. Cliquez sur **"Publish repository"**

**Méthode 2 : Changer le remote (si déjà lié à un autre repo)**

1. Cliquez sur **Repository** → **Repository Settings**
2. Dans l'onglet **"Remote"**
3. Changez l'URL vers votre nouveau repository :
   ```
   https://github.com/sekadalle2024/claraverse-backup-v3.git
   ```
4. Cliquez sur **"Save"**
5. Retournez à l'écran principal
6. Cliquez sur **"Push origin"** (bouton en haut)

---

### 7️⃣ Vérifier sur GitHub

1. Allez sur votre repository GitHub
2. Vérifiez que tous les fichiers sont présents
3. **IMPORTANT :** Vérifiez que `src/assets/logo.png` est bien là :
   - Naviguez vers `src/assets/`
   - Vous devriez voir `logo.png` et `temo.png`

---

## ✅ CHECKLIST RAPIDE

- [ ] Nouveau repository créé sur GitHub.com
- [ ] GitHub Desktop ouvert et connecté
- [ ] Projet ajouté dans GitHub Desktop
- [ ] Fichiers visibles dans l'onglet "Changes"
- [ ] `logo.png` visible dans la liste des fichiers
- [ ] Commit créé avec un message
- [ ] Repository publié/poussé vers GitHub
- [ ] Vérification sur GitHub.com que logo.png est présent

---

## 🆘 PROBLÈMES COURANTS

### ❌ "logo.png" n'apparaît pas dans GitHub Desktop

**Solution :**
1. Fermez GitHub Desktop
2. Ouvrez un terminal dans le dossier du projet
3. Tapez :
   ```bash
   git add -f src/assets/logo.png
   git add -f src/assets/temo.png
   ```
4. Rouvrez GitHub Desktop
5. Les fichiers devraient maintenant apparaître

---

### ❌ "Repository not found" lors du push

**Solution :**
1. Vérifiez que le repository existe sur GitHub.com
2. Dans GitHub Desktop : **Repository** → **Repository Settings**
3. Vérifiez l'URL du remote
4. Assurez-vous d'être connecté au bon compte GitHub

---

### ❌ "Permission denied"

**Solution :**
1. Dans GitHub Desktop : **File** → **Options** → **Accounts**
2. Déconnectez-vous et reconnectez-vous
3. Ou utilisez un Personal Access Token :
   - Allez sur GitHub.com → Settings → Developer settings → Personal access tokens
   - Créez un nouveau token avec les permissions "repo"
   - Utilisez ce token comme mot de passe

---

### ❌ Trop de fichiers à commiter (très lent)

**Solution :**
1. Vérifiez que `node_modules/` est bien dans `.gitignore` (c'est déjà fait)
2. Si `node_modules/` apparaît quand même :
   ```bash
   git rm -r --cached node_modules
   ```
3. Recommitez

---

## 🚀 MÉTHODE ALTERNATIVE (Plus Rapide)

Si GitHub Desktop est trop lent, utilisez la ligne de commande :

```bash
# 1. Changer le remote vers le nouveau repository
git remote set-url origin https://github.com/sekadalle2024/claraverse-backup-v3.git

# 2. Vérifier
git remote -v

# 3. Ajouter tous les fichiers
git add .

# 4. Commiter
git commit -m "Mise à jour ClaraVerse"

# 5. Pousser
git push -u origin main
```

Si "main" ne fonctionne pas, essayez "master" :
```bash
git push -u origin master
```

---

## 📊 APRÈS LE PUSH

### Vérifier sur GitHub

1. Allez sur : `https://github.com/votre-username/claraverse-backup-v3`
2. Vérifiez la structure :
   ```
   ✅ src/assets/logo.png
   ✅ src/assets/temo.png
   ✅ src/components/Sidebar.tsx
   ✅ vite.config.ts
   ✅ package.json
   ✅ .gitignore
   ```

### Tester le Déploiement

Sur Firebase Studio ou votre plateforme :
```bash
git clone https://github.com/votre-username/claraverse-backup-v3.git
cd claraverse-backup-v3
npm install
npm run build
```

Le build devrait réussir sans l'erreur "Failed to resolve import" !

---

## 🎯 RÉSUMÉ VISUEL

```
1. GitHub.com
   └─> Créer nouveau repository (vide)

2. GitHub Desktop
   └─> Ajouter projet local
   └─> Vérifier que logo.png est visible
   └─> Commit
   └─> Publish/Push

3. Vérification
   └─> GitHub.com
   └─> Vérifier que logo.png est présent
```

---

## ✨ AVANTAGES DE GITHUB DESKTOP

- ✅ Interface visuelle simple
- ✅ Pas besoin de commandes Git
- ✅ Voir facilement les fichiers modifiés
- ✅ Gestion des conflits simplifiée
- ✅ Historique visuel des commits

---

**URL du nouveau repository :** `https://github.com/sekadalle2024/claraverse-backup-v3.git`  
**Date :** 24 novembre 2025  
**Statut :** ✅ Prêt pour GitHub Desktop
