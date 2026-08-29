# Guide Upload Manuel - runtime.txt sur GitHub

**Date:** 17 Avril 2026  
**Méthode:** Upload direct via interface web GitHub

## 🎯 Objectif

Ajouter le fichier `runtime.txt` directement sur le repository backend GitHub via l'interface web.

## 📋 Étapes Détaillées

### Étape 1: Ouvrir le Repository Backend

1. Ouvrir ce lien dans votre navigateur:
   ```
   https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
   ```

2. Vous devriez voir la liste des fichiers à la racine du repository

### Étape 2: Cliquer sur "Add file"

1. En haut à droite de la liste des fichiers, cliquer sur le bouton **"Add file"**
2. Dans le menu déroulant, sélectionner **"Upload files"**

### Étape 3: Upload du Fichier

**Option A: Drag & Drop (Glisser-Déposer)**

1. Ouvrir l'explorateur Windows
2. Naviguer vers: `H:\ClaraVerse\py_backend\`
3. Trouver le fichier `runtime.txt`
4. Glisser-déposer le fichier dans la zone GitHub

**Option B: Sélection Manuelle**

1. Cliquer sur **"choose your files"**
2. Naviguer vers: `H:\ClaraVerse\py_backend\`
3. Sélectionner `runtime.txt`
4. Cliquer sur **"Ouvrir"**

### Étape 4: Commit

1. En bas de la page, dans la section "Commit changes":
   - **Commit message:** `Add runtime.txt for Python 3.11.9`
   - **Description (optionnel):** `Force Python 3.11.9 to avoid Rust compiler requirement`

2. Sélectionner **"Commit directly to the main branch"**

3. Cliquer sur **"Commit changes"**

### Étape 5: Vérification

1. Vous devriez être redirigé vers la page du repository
2. Vérifier que `runtime.txt` apparaît dans la liste des fichiers
3. Cliquer sur `runtime.txt` pour vérifier son contenu:
   ```
   python-3.11.9
   ```

## ✅ Contenu du Fichier runtime.txt

Le fichier doit contenir EXACTEMENT cette ligne (sans espace avant/après):

```
python-3.11.9
```

## 🚀 Après l'Upload

### 1. Vérifier sur GitHub

- Aller sur: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
- Vérifier que `runtime.txt` est visible à la racine
- Cliquer dessus pour confirmer le contenu

### 2. Vérifier sur Render

1. Aller sur: https://dashboard.render.com/
2. Sélectionner votre service backend
3. Onglet **"Events"** ou **"Logs"**
4. Render devrait détecter le nouveau commit et lancer un rebuild automatique

### 3. Vérifier les Logs Render

Chercher dans les logs:
```
Using Python version 3.11.9
```

Au lieu de:
```
Using Python version 3.14.3
```

### 4. Si Pas de Rebuild Automatique

1. Dans le dashboard Render, cliquer sur **"Manual Deploy"**
2. Sélectionner **"Deploy latest commit"**
3. Attendre la fin du build (5-10 minutes)

## 📸 Captures d'Écran (Repères Visuels)

### Page Repository GitHub

```
Back-end-python-V0_03_03_2026
├── [Add file ▼]  ← Cliquer ici
├── .dockerignore
├── .env.koyeb.example
├── .gitignore
├── main.py
├── requirements_render.txt
└── ... autres fichiers
```

### Menu "Add file"

```
Add file ▼
├── Create new file
└── Upload files  ← Sélectionner ceci
```

### Zone Upload

```
┌─────────────────────────────────────┐
│  Drag files here to add them to    │
│  your repository                    │
│                                     │
│  or choose your files               │
└─────────────────────────────────────┘
```

## ⚠️ Points d'Attention

### Nom du Fichier

- **EXACT:** `runtime.txt` (tout en minuscules)
- **PAS:** `Runtime.txt`, `RUNTIME.TXT`, `runtime.TXT`

### Contenu du Fichier

- **EXACT:** `python-3.11.9`
- **PAS:** `Python 3.11.9`, `python-3.11`, `3.11.9`
- **PAS d'espace** avant ou après
- **PAS de ligne vide** supplémentaire

### Emplacement

- **À LA RACINE** du repository
- **PAS** dans un sous-dossier

## 🔧 Alternative: Créer le Fichier Directement

Si vous préférez créer le fichier directement sur GitHub:

### Étape 1: Create New File

1. Cliquer sur **"Add file"** → **"Create new file"**

### Étape 2: Nom du Fichier

1. Dans le champ "Name your file...", taper: `runtime.txt`

### Étape 3: Contenu

1. Dans l'éditeur, taper exactement:
   ```
   python-3.11.9
   ```

### Étape 4: Commit

1. Message: `Add runtime.txt for Python 3.11.9`
2. Cliquer sur **"Commit new file"**

## 📞 Vérification Finale

Après l'upload, exécuter le script de vérification:

```powershell
cd "H:\ClaraVerse"
& ".\Doc render deploy\verifier-fichiers-github.ps1"
```

Résultat attendu:
```
[OK] runtime.txt PRESENT
[OK] requirements_render.txt PRESENT
[OK] main.py PRESENT
```

## 🎉 Succès!

Une fois `runtime.txt` uploadé:

1. ✅ Render détectera Python 3.11.9
2. ✅ Utilisera les wheels pré-compilés de pydantic
3. ✅ Pas besoin de compiler avec Rust
4. ✅ Déploiement réussi!

## 🔗 Liens Utiles

- Repository Backend: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
- Dashboard Render: https://dashboard.render.com/
- Fichier local: `H:\ClaraVerse\py_backend\runtime.txt`

---

**Créé le:** 17 Avril 2026  
**Méthode:** Upload manuel via interface web GitHub  
**Durée estimée:** 2 minutes
