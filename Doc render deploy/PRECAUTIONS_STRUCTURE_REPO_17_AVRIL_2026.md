# Précautions - Structure Repository Backend

**Date:** 17 Avril 2026  
**Importance:** 🔴 CRITIQUE pour le déploiement Render

## ⚠️ POINT CRITIQUE

Le repository backend GitHub contient **UNIQUEMENT** le contenu du dossier `py_backend/`.

Les fichiers Python sont à la **RACINE** du repository backend, **PAS** dans un sous-dossier.

## 📁 Structure des Repositories

### Repository 1: Projet Complet (Développement Local)

```
Claverse_windows__v8_17-04-2026_V5-Export_CAC-V0-Public/
├── src/                    ← Frontend React
├── public/
├── py_backend/            ← Backend Python (SOUS-DOSSIER)
│   ├── runtime.txt
│   ├── requirements_render.txt
│   ├── main.py
│   └── ...
├── index.html
└── ...
```

**URL:** https://github.com/sekadalle2024/Claverse_windows__v8_17-04-2026_V5-Export_CAC-V0-Public.git

**Usage:** Développement local complet (frontend + backend)

### Repository 2: Backend Seul (Déploiement Render)

```
Back-end-python-V0_03_03_2026/
├── runtime.txt              ← À LA RACINE
├── requirements_render.txt  ← À LA RACINE
├── main.py                  ← À LA RACINE
├── export_synthese_cac.py
└── ...autres fichiers Python
```

**URL:** https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git

**Usage:** Déploiement sur Render.com

## 🎯 Configuration Render CORRECTE

### Settings de Base

| Paramètre | Valeur | Explication |
|-----------|--------|-------------|
| **Root Directory** | **VIDE** | Fichiers déjà à la racine du repo |
| **Build Command** | `pip install -r requirements_render.txt` | Pas de `cd py_backend` |
| **Start Command** | `python main.py --host 0.0.0.0 --port $PORT` | Pas de `cd py_backend` |
| **Runtime** | Python 3.11.9 | Détecté depuis runtime.txt |

### ❌ Configuration INCORRECTE (à éviter)

| Paramètre | Valeur Incorrecte | Pourquoi c'est faux |
|-----------|-------------------|---------------------|
| Root Directory | `py_backend` | Ce dossier n'existe pas dans le repo backend |
| Build Command | `cd py_backend && pip install...` | py_backend n'existe pas |
| Start Command | `cd py_backend && python...` | py_backend n'existe pas |

## 🔧 Workflow de Déploiement

### Étape 1: Développement Local

Vous travaillez dans le projet complet:
```
Claverse_windows__v8_17-04-2026_V5-Export_CAC-V0-Public/
└── py_backend/
    ├── runtime.txt
    ├── requirements_render.txt
    └── main.py
```

### Étape 2: Push vers Repository Backend

Vous devez pousser le **CONTENU** de `py_backend/` vers le repo backend:

```powershell
# Depuis la racine du projet
cd py_backend

# Vérifier le remote (doit pointer vers le repo backend)
git remote get-url origin
# Doit afficher: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git

# Ajouter les fichiers
git add runtime.txt requirements_render.txt main.py

# Commit
git commit -m "Fix: Add runtime.txt for Python 3.11.9"

# Push
git push origin main
```

### Étape 3: Render Détecte et Déploie

Render détecte le push et cherche les fichiers à la **RACINE**:
- ✅ `runtime.txt` → Utilise Python 3.11.9
- ✅ `requirements_render.txt` → Installe les dépendances
- ✅ `main.py` → Lance l'application

## 🚨 Erreurs Courantes

### Erreur 1: "runtime.txt not found"

**Cause:** `runtime.txt` n'est pas à la racine du repo backend

**Solution:**
```powershell
cd py_backend
git add runtime.txt
git commit -m "Add runtime.txt"
git push origin main
```

### Erreur 2: "Root directory does not exist: py_backend"

**Cause:** Root Directory configuré avec `py_backend` dans Render

**Solution:** Mettre Root Directory = **VIDE** dans les settings Render

### Erreur 3: "No such file or directory: py_backend/main.py"

**Cause:** Build/Start Command contient `cd py_backend`

**Solution:** Enlever `cd py_backend` des commandes:
- Build: `pip install -r requirements_render.txt`
- Start: `python main.py --host 0.0.0.0 --port $PORT`

## ✅ Checklist de Vérification

### Avant le Push

- [ ] Je suis dans le dossier `py_backend/` localement
- [ ] `runtime.txt` existe avec `python-3.11.9`
- [ ] `requirements_render.txt` contient pydantic 2.6.4
- [ ] Git remote pointe vers le repo backend
- [ ] Les fichiers sont ajoutés à git

### Après le Push

- [ ] `runtime.txt` visible sur GitHub (racine du repo backend)
- [ ] `requirements_render.txt` visible sur GitHub (racine)
- [ ] `main.py` visible sur GitHub (racine)
- [ ] Pas de dossier `py_backend/` dans le repo backend

### Configuration Render

- [ ] Root Directory = VIDE
- [ ] Build Command sans `cd py_backend`
- [ ] Start Command sans `cd py_backend`
- [ ] Repository = Back-end-python-V0_03_03_2026
- [ ] Branch = main

## 📝 Script Automatique

Pour simplifier, utilisez le script:

```powershell
.\Doc render deploy\push-runtime-backend-repo.ps1
```

Ce script:
1. ✅ Navigue vers `py_backend/`
2. ✅ Vérifie que `runtime.txt` existe
3. ✅ Vérifie le repository Git
4. ✅ Commit les fichiers
5. ✅ Push vers GitHub backend
6. ✅ Affiche les instructions suivantes

## 🎓 Comprendre la Différence

### Développement Local

```
Projet/
└── py_backend/          ← Sous-dossier
    └── main.py
```

Vous lancez: `cd py_backend && python main.py`

### Déploiement Render

```
Repository Backend/
└── main.py              ← Racine
```

Render lance: `python main.py` (pas de cd)

## 🔗 Liens Utiles

- Repository Backend: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
- Dashboard Render: https://dashboard.render.com/
- Script de push: `Doc render deploy/push-runtime-backend-repo.ps1`

## 📞 Support

En cas de problème:

1. Vérifier que `runtime.txt` est à la racine du repo backend sur GitHub
2. Vérifier la configuration Render (Root Directory = VIDE)
3. Consulter les logs Render pour l'erreur exacte
4. Utiliser le script automatique `push-runtime-backend-repo.ps1`

---

**Créé le:** 17 Avril 2026  
**Auteur:** Clara Team  
**Version:** 1.0.0
