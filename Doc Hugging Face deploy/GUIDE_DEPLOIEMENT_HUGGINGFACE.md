# 🚀 Guide Détaillé : Déploiement sur Hugging Face Spaces

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer votre backend Python Claraverse sur Hugging Face Spaces en utilisant Docker.

## 🎯 Pourquoi Hugging Face Spaces ?

- ✅ **Gratuit** : Tier gratuit généreux avec CPU
- ✅ **Simple** : Déploiement via Git
- ✅ **Docker natif** : Support complet de Docker
- ✅ **Scalable** : Possibilité d'upgrader vers GPU
- ✅ **Communauté** : Large communauté ML/AI

## 📦 Structure du Projet

```
py_backend/
├── Dockerfile              # Configuration Docker (déjà existant)
├── requirements.txt        # Dépendances Python
├── main.py                # Point d'entrée FastAPI
├── README.md              # Documentation pour HF (à créer)
├── .dockerignore          # Fichiers à exclure
└── [autres fichiers]      # Vos modules Python
```

## 🔧 Configuration Spécifique Hugging Face

### 1. Port et Host

Hugging Face Spaces utilise le **port 7860** par défaut. Votre application doit écouter sur ce port.

**Modification nécessaire dans `main.py` ou via variables d'environnement :**

```python
# Hugging Face utilise le port 7860
PORT = int(os.getenv('PORT', 7860))
HOST = os.getenv('HOST', '0.0.0.0')
```

### 2. Dockerfile Optimisé pour Hugging Face

Votre Dockerfile actuel est bon, mais voici quelques optimisations :

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copier et installer les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY . .

# Variables d'environnement pour Hugging Face
ENV HOST=0.0.0.0
ENV PORT=7860
ENV PYTHONUNBUFFERED=1

# Exposer le port
EXPOSE 7860

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Commande de démarrage
CMD ["python", "main.py", "--host", "0.0.0.0", "--port", "7860"]
```

### 3. README.md pour Hugging Face

Créer un fichier `README.md` à la racine de `py_backend` :

```markdown
---
title: Claraverse Backend
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Claraverse Backend API

Backend FastAPI pour l'application Claraverse - Assistant IA pour l'audit et la comptabilité.

## 🚀 Fonctionnalités

- API REST FastAPI
- Traitement de fichiers Excel (balances comptables)
- Génération d'états financiers SYSCOHADA
- Export de documents (Word, Excel)
- Analyse de données avec Pandas

## 📡 Endpoints Principaux

- `/health` - Vérification de l'état du service
- `/docs` - Documentation interactive Swagger
- `/api/pandas/analyze` - Analyse de données
- `/api/etats-financiers/generer` - Génération d'états financiers

## 🔧 Configuration

L'application écoute sur le port 7860 (standard Hugging Face Spaces).

## 📚 Documentation

Pour plus d'informations, consultez la documentation complète sur [GitHub](https://github.com/votre-repo/claraverse).
```

### 4. .dockerignore Optimisé

Créer/mettre à jour `.dockerignore` pour réduire la taille de l'image :

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/

# Tests
test_*.py
*_test.py
tests/

# Documentation
*.md
!README.md
Doc*/
doc*/

# Git
.git/
.gitignore
.gitattributes

# IDE
.vscode/
.idea/
*.swp
*.swo

# Fichiers volumineux (exemples)
*.xlsx
*.xls
*.xlsm
!Liasse_officielle_revise.xlsx
*.pdf
!Manuel*.pdf

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

## 🚀 Processus de Déploiement

### Méthode 1 : Via Git (Recommandée)

#### Étape 1 : Créer le Space

1. Aller sur https://huggingface.co/new-space
2. Remplir :
   - **Space name** : `claraverse-backend`
   - **SDK** : Docker
   - **Hardware** : CPU basic (gratuit)
3. Cliquer sur "Create Space"

#### Étape 2 : Cloner et Configurer

```powershell
# Dans le dossier py_backend
cd py_backend

# Initialiser Git si nécessaire
git init

# Ajouter le remote Hugging Face
git remote add hf https://huggingface.co/spaces/[votre-username]/claraverse-backend

# Configurer votre identité Git
git config user.name "Votre Nom"
git config user.email "votre@email.com"
```

#### Étape 3 : Préparer les Fichiers

```powershell
# Créer le README.md (voir contenu ci-dessus)
# Créer/mettre à jour .dockerignore

# Vérifier les fichiers à commiter
git status
```

#### Étape 4 : Commit et Push

```powershell
# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "Initial deployment: Claraverse backend API"

# Pousser vers Hugging Face
git push hf main

# Entrer vos credentials :
# Username: [votre-username-huggingface]
# Password: [votre-token-huggingface]
```

#### Étape 5 : Suivre le Build

1. Aller sur https://huggingface.co/spaces/[votre-username]/claraverse-backend
2. Cliquer sur "Logs" pour voir le build en temps réel
3. Attendre que le statut passe à "Running" (5-10 minutes)

### Méthode 2 : Via l'Interface Web

1. Aller sur votre Space
2. Cliquer sur "Files" → "Add file" → "Upload files"
3. Sélectionner tous les fichiers nécessaires
4. Cliquer sur "Commit changes to main"

## ✅ Vérification du Déploiement

### 1. Vérifier le Statut

```powershell
# Tester l'endpoint de santé
curl https://[votre-username]-claraverse-backend.hf.space/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "timestamp": "2026-04-18T...",
  "version": "1.0.0"
}
```

### 2. Accéder à la Documentation

Ouvrir dans le navigateur :
```
https://[votre-username]-claraverse-backend.hf.space/docs
```

### 3. Tester un Endpoint

```powershell
# Exemple : tester l'upload de fichier
curl -X POST "https://[votre-username]-claraverse-backend.hf.space/api/pandas/upload" \
  -F "file=@test.xlsx"
```

## 🔧 Configuration Avancée

### Variables d'Environnement

Pour ajouter des variables d'environnement :

1. Aller dans votre Space
2. Cliquer sur "Settings"
3. Section "Repository secrets"
4. Ajouter vos secrets (API keys, etc.)

Exemple :
```
OPENAI_API_KEY=sk-...
NEO4J_URI=neo4j://...
```

### Mise à Jour du Déploiement

```powershell
# Faire vos modifications
# ...

# Commit et push
git add .
git commit -m "Update: description des changements"
git push hf main
```

Le Space se rebuild automatiquement.

## 🐛 Dépannage

### Problème : Build échoue

**Solution 1 : Vérifier les logs**
```
Aller dans l'onglet "Logs" de votre Space
```

**Solution 2 : Vérifier requirements.txt**
```
Assurez-vous que toutes les dépendances sont compatibles
```

**Solution 3 : Réduire la taille de l'image**
```
Vérifier .dockerignore
Supprimer les fichiers volumineux inutiles
```

### Problème : Application ne démarre pas

**Vérifier le port :**
```python
# Dans main.py
PORT = int(os.getenv('PORT', 7860))  # Doit être 7860 pour HF
```

**Vérifier les logs de démarrage :**
```
Onglet "Logs" → Section "Container logs"
```

### Problème : Timeout ou Erreur de Mémoire

**Solution : Upgrader le hardware**
1. Aller dans "Settings"
2. Section "Space hardware"
3. Choisir "CPU upgrade" ou "GPU"
4. Confirmer (peut nécessiter un paiement)

### Problème : CORS Errors

**Ajouter dans main.py :**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Monitoring et Logs

### Accéder aux Logs

1. Aller sur votre Space
2. Cliquer sur "Logs"
3. Deux types de logs :
   - **Build logs** : Logs de construction de l'image
   - **Container logs** : Logs de l'application en cours d'exécution

### Métriques

Hugging Face fournit des métriques basiques :
- Nombre de requêtes
- Temps de réponse
- Utilisation CPU/Mémoire

## 🔐 Sécurité

### Bonnes Pratiques

1. **Ne jamais commiter de secrets**
   - Utiliser les "Repository secrets" de HF
   - Ajouter les fichiers sensibles dans .gitignore

2. **Limiter les origines CORS**
   ```python
   allow_origins=["https://votre-frontend.com"]
   ```

3. **Ajouter une authentification**
   ```python
   from fastapi.security import HTTPBearer
   ```

4. **Rate limiting**
   ```python
   from slowapi import Limiter
   ```

## 💰 Coûts

### Tier Gratuit
- CPU basic : Gratuit
- Limitations :
  - 2 vCPU
  - 16 GB RAM
  - Peut être mis en veille après inactivité

### Tiers Payants
- **CPU upgrade** : ~$0.03/heure
- **GPU T4** : ~$0.60/heure
- **GPU A10G** : ~$1.05/heure

## 🔄 CI/CD

### Déploiement Automatique

Créer un workflow GitHub Actions :

```yaml
name: Deploy to Hugging Face

on:
  push:
    branches: [ main ]
    paths:
      - 'py_backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Push to Hugging Face
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
        run: |
          cd py_backend
          git remote add hf https://user:$HF_TOKEN@huggingface.co/spaces/[username]/claraverse-backend
          git push hf main
```

## 📚 Ressources

- [Documentation Hugging Face Spaces](https://huggingface.co/docs/hub/spaces)
- [Docker Spaces Guide](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Forum Hugging Face](https://discuss.huggingface.co/)

## 🎉 Félicitations !

Votre backend est maintenant déployé sur Hugging Face Spaces !

URL de votre API : `https://[votre-username]-claraverse-backend.hf.space`

N'oubliez pas de mettre à jour votre frontend pour pointer vers cette nouvelle URL.
