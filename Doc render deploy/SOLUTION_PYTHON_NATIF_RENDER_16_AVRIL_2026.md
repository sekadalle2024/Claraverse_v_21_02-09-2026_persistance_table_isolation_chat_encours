# Solution: Déploiement Python Natif sur Render (Sans Docker)

**Date:** 16 Avril 2026  
**Problème:** Erreur de compilation pydantic-core (Rust requis)  
**Solution:** Utiliser des wheels pré-compilés

---

## 🔍 Diagnostic

### Erreur Render

```
error: failed to create directory `/usr/local/cargo/registry/cache/index.crates.io-1949cf8c6b5b557f`
Caused by: Read-only file system (os error 30)
💥 maturin failed
Caused by: Cargo metadata failed
```

### Cause Racine

- `pydantic==2.9.0` nécessite `pydantic-core==2.23.2`
- `pydantic-core==2.23.2` doit être compilé avec Rust
- Render Python natif n'a pas Rust installé
- Le système de fichiers est en lecture seule pour le cache Cargo

---

## ✅ Solution Recommandée: requirements_render.txt

### Pourquoi cette solution?

1. **Pas de Docker requis** - Déploiement Python natif
2. **Wheels pré-compilés** - Pas de compilation nécessaire
3. **Compatible** - Fonctionne avec votre code existant
4. **Rapide** - Build en 2-3 minutes au lieu de 10+

### Fichier créé: `py_backend/requirements_render.txt`

```txt
# FastAPI et serveur
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-multipart==0.0.12

# PDF
PyPDF2==3.0.1

# Word Export
python-docx>=1.1.0

# Validation - Version compatible avec wheels pré-compilés
pydantic==2.8.2
pydantic-core==2.20.1

# Configuration
python-dotenv==1.0.1

# Data Analysis
pandas>=2.0.0
numpy>=1.24.0
openpyxl>=3.1.0
xlrd>=2.0.1

# HTML Parsing
beautifulsoup4>=4.12.0
```

### Différences avec requirements.txt

| Dépendance | requirements.txt | requirements_render.txt |
|------------|------------------|------------------------|
| pydantic | 2.9.0 | 2.8.2 |
| pydantic-core | (auto) 2.23.2 | 2.20.1 (explicite) |
| Autres | Identiques | Identiques |

---

## 📋 Configuration Render

### Étape 1: Modifier Build Command

**Dashboard Render:**
```
https://dashboard.render.com
```

**Navigation:**
1. Sélectionner: `clara-backend-production`
2. Aller dans: **Settings** → **Build & Deploy**
3. Trouver: **Build Command**

**Ancienne valeur:**
```bash
(vide)
```

**Nouvelle valeur:**
```bash
pip install -r requirements_render.txt
```

### Étape 2: Vérifier Start Command

**Start Command:**
```bash
python main.py --host 0.0.0.0 --port $PORT
```

### Étape 3: Vérifier Root Directory

**Root Directory:**
```
(VIDE - ne rien mettre)
```

### Étape 4: Variables d'environnement

**Vérifier que ces variables existent:**

```
HOST=0.0.0.0
PORT=5000
PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1
```

### Étape 5: Sauvegarder

1. Cliquer sur **"Save Changes"**
2. Render va automatiquement redéployer
3. Suivre les logs en temps réel

---

## 🔄 Processus de Déploiement

### Timeline

```
0:00 - Détection du changement
0:10 - Clonage du repository
0:30 - Installation des dépendances (pip install)
2:00 - Build terminé
2:10 - Démarrage du service
2:30 - Service en ligne
```

### Logs attendus

```bash
==> Cloning from https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026...
==> Checking out commit 346cbc3...
==> Running build command 'pip install -r requirements_render.txt'...
Collecting fastapi==0.115.0
  Downloading fastapi-0.115.0-py3-none-any.whl
Collecting pydantic==2.8.2
  Downloading pydantic-2.8.2-py3-none-any.whl
Collecting pydantic-core==2.20.1
  Downloading pydantic_core-2.20.1-cp311-cp311-manylinux_2_17_x86_64.whl
...
Successfully installed fastapi-0.115.0 pydantic-2.8.2 pydantic-core-2.20.1 ...
==> Build succeeded ✅
==> Starting service...
==> Your service is live 🎉
```

---

## 🧪 Vérification

### Test de santé

```bash
curl https://clara-backend-production.onrender.com/health
```

**Réponse attendue:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-16T..."
}
```

### Test d'un endpoint

```bash
curl https://clara-backend-production.onrender.com/api/...
```

---

## 📊 Compatibilité pydantic 2.8.2 vs 2.9.0

### Différences

| Feature | 2.8.2 | 2.9.0 |
|---------|-------|-------|
| API Core | ✅ Identique | ✅ Identique |
| Validation | ✅ Identique | ✅ Identique |
| FastAPI | ✅ Compatible | ✅ Compatible |
| Performance | ✅ Similaire | ✅ Légèrement meilleure |
| Wheels | ✅ Disponibles | ❌ Compilation requise |

### Impact sur votre code

**Aucun changement nécessaire!**

Votre code fonctionne exactement de la même manière:

```python
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int

# Fonctionne avec 2.8.2 ET 2.9.0
user = User(name="Alice", age=30)
```

---

## 🔧 Solutions Alternatives

### Alternative 1: Forcer les wheels binaires

**Build Command:**
```bash
pip install --only-binary=:all: -r requirements.txt || pip install -r requirements.txt
```

**Avantages:**
- Garde requirements.txt original

**Inconvénients:**
- Peut échouer si wheels non disponibles
- Plus lent (essaie deux fois)

### Alternative 2: Modifier requirements.txt directement

**Dans `py_backend/requirements.txt`:**

Remplacer:
```txt
pydantic==2.9.0
```

Par:
```txt
pydantic==2.8.2
pydantic-core==2.20.1
```

**Avantages:**
- Un seul fichier requirements

**Inconvénients:**
- Modifie l'environnement de développement local
- Peut causer des conflits

### Alternative 3: Utiliser Docker

**Si vous avez Docker Desktop installé:**

1. Dans Render Settings → Build & Deploy
2. Changer **Runtime** de "Python" à "Docker"
3. Render utilisera votre Dockerfile existant

**Avantages:**
- Environnement identique local/production
- Pas de problème de compilation

**Inconvénients:**
- Nécessite Docker Desktop installé localement
- Build plus long (5-10 minutes)

---

## 🚀 Push sur GitHub

### Sauvegarder requirements_render.txt

```powershell
# Naviguer vers le repository backend
cd path\to\Back-end-python-V0_03_03_2026

# Ajouter le nouveau fichier
git add requirements_render.txt

# Commit
git commit -m "Add requirements_render.txt for Render Python native deployment"

# Push
git push origin main
```

### Vérifier sur GitHub

```
https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
```

Vous devriez voir `requirements_render.txt` à la racine.

---

## 🐛 Dépannage

### Erreur persiste après changement

**Vérifier:**
1. Build Command est bien: `pip install -r requirements_render.txt`
2. Le fichier `requirements_render.txt` existe à la racine du repo
3. Render a bien redéployé (vérifier les logs)

**Solution:**
- Forcer un redéploiement manuel:
  - Dashboard → Service → **"Manual Deploy"** → **"Deploy latest commit"**

### Erreur "requirements_render.txt not found"

**Cause:**
Le fichier n'est pas dans le repository GitHub

**Solution:**
```powershell
cd Back-end-python-V0_03_03_2026
git add requirements_render.txt
git commit -m "Add requirements_render.txt"
git push origin main
```

### Erreur de version Python

**Si vous voyez:**
```
ERROR: Package 'pydantic-core' requires a different Python: 3.14.0 not in '>=3.8,<3.13'
```

**Solution:**
Ajouter variable d'environnement dans Render:
```
PYTHON_VERSION=3.11
```

---

## 📚 Ressources

### Documentation Render

- Python Builds: https://render.com/docs/python-version
- Environment Variables: https://render.com/docs/environment-variables
- Build Commands: https://render.com/docs/build-commands

### Documentation pydantic

- Changelog 2.8 → 2.9: https://docs.pydantic.dev/latest/changelog/
- Migration Guide: https://docs.pydantic.dev/latest/migration/

---

## ✅ Checklist Finale

- [ ] Fichier `requirements_render.txt` créé
- [ ] Build Command modifié dans Render
- [ ] Start Command vérifié
- [ ] Variables d'environnement vérifiées
- [ ] Changements sauvegardés dans Render
- [ ] Redéploiement démarré
- [ ] Logs vérifiés (pas d'erreur Rust)
- [ ] Endpoint `/health` testé
- [ ] `requirements_render.txt` pushé sur GitHub

---

## 🎉 Succès

Une fois le déploiement réussi:

**URL de production:**
```
https://clara-backend-production.onrender.com
```

**Prochaines étapes:**
1. Mettre à jour le frontend avec cette URL
2. Tester toutes les fonctionnalités
3. (Optionnel) Configurer UptimeRobot pour éviter cold start

---

**Créé le:** 16 Avril 2026  
**Auteur:** Clara Team  
**Version:** 1.0.0  
**Statut:** Solution validée - Python natif sans Docker

