# 🚀 Guide Complet : Déploiement Backend sur Hugging Face Spaces

## 📋 Informations de Configuration

**Date** : 18 Avril 2026  
**Token Hugging Face** : `[VOTRE_TOKEN_HUGGING_FACE]`  
**Type de token** : Write access  
**Space name** : `claraverse-backend`  
**SDK** : Docker  
**Hardware** : CPU basic (gratuit)  
**Port** : 7860

---

## 🎯 Objectif

Déployer le backend Python (dossier `py_backend`) sur Hugging Face Spaces en utilisant Docker.

---

## 📦 Prérequis

### 1. Compte Hugging Face
- ✅ Compte créé
- ✅ Token obtenu : `[VOTRE_TOKEN_HUGGING_FACE]`

### 2. Git Installé
```powershell
# Vérifier l'installation
git --version
```

### 3. Fichiers Nécessaires
- ✅ `py_backend/Dockerfile` (existe)
- ✅ `py_backend/requirements.txt` (existe)
- ✅ `py_backend/main.py` (existe)
- ✅ `py_backend/README.md` (créé)

---

## 🚀 Processus de Déploiement

### Étape 1 : Créer le Space sur Hugging Face

1. Aller sur : https://huggingface.co/new-space

2. Remplir le formulaire :
   ```
   Owner : [Votre nom d'utilisateur]
   Space name : claraverse-backend
   License : MIT
   SDK : Docker
   Hardware : CPU basic (gratuit)
   Visibility : Public ou Private
   ```

3. Cliquer sur "Create Space"

4. Noter l'URL : `https://huggingface.co/spaces/[username]/claraverse-backend`

### Étape 2 : Exécuter le Script de Déploiement

#### Méthode Automatique (Recommandée)

```powershell
# 1. Ouvrir PowerShell
# 2. Aller dans le dossier py_backend
cd py_backend

# 3. Exécuter le script
..\Doc backend huggings face\deploy-maintenant.ps1

# 4. Entrer votre username Hugging Face quand demandé
```

Le script fait automatiquement :
- ✅ Vérification des prérequis
- ✅ Initialisation Git
- ✅ Configuration du remote Hugging Face
- ✅ Commit des fichiers
- ✅ Push vers Hugging Face

#### Méthode Manuelle (Alternative)

```powershell
# 1. Aller dans py_backend
cd py_backend

# 2. Initialiser Git
git init

# 3. Ajouter le remote (remplacer [USERNAME] et [TOKEN])
git remote add hf https://[USERNAME]:[TOKEN]@huggingface.co/spaces/[USERNAME]/claraverse-backend

# 4. Ajouter les fichiers
git add .

# 5. Créer un commit
git commit -m "Initial deployment: Claraverse backend"

# 6. Pousser vers Hugging Face
git push hf main --force
```

### Étape 3 : Suivre le Build

1. Aller sur votre Space : `https://huggingface.co/spaces/[username]/claraverse-backend`

2. Cliquer sur l'onglet "Logs"

3. Observer les logs de build en temps réel

4. Attendre que le statut passe à "Running" (5-10 minutes)

### Étape 4 : Vérifier le Déploiement

#### Test 1 : Healthcheck
```powershell
# Remplacer [USERNAME] par votre username
curl https://[USERNAME]-claraverse-backend.hf.space/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "timestamp": "2026-04-18T...",
  "version": "1.0.0"
}
```

#### Test 2 : Documentation API
Ouvrir dans le navigateur :
```
https://[USERNAME]-claraverse-backend.hf.space/docs
```

#### Test 3 : Endpoints Principaux
- `/health` - Vérification de l'état
- `/docs` - Documentation Swagger
- `/api/pandas/upload` - Upload de fichiers
- `/api/etats-financiers/generer` - États financiers

---

## 📊 Structure des Fichiers Déployés

```
py_backend/
├── Dockerfile                 # Configuration Docker
├── requirements.txt           # Dépendances Python
├── main.py                   # Point d'entrée FastAPI
├── README.md                 # Documentation pour HF
├── .dockerignore             # Exclusions Docker
│
├── [Modules Python]
│   ├── pandas_api.py
│   ├── etats_financiers.py
│   ├── export_liasse.py
│   └── ...
│
└── [Fichiers de données]
    ├── correspondances_syscohada.json
    └── ...
```

---

## 🔧 Configuration Technique

### Dockerfile

Le Dockerfile est configuré pour :
- Image de base : `python:3.11-slim`
- Port exposé : `7860` (requis par Hugging Face)
- Variables d'environnement :
  ```dockerfile
  ENV HOST=0.0.0.0
  ENV PORT=7860
  ENV PYTHONUNBUFFERED=1
  ```

### README.md

Le README.md contient le frontmatter YAML requis par Hugging Face :
```yaml
---
title: Claraverse Backend
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---
```

### Requirements.txt

Dépendances principales :
- FastAPI
- Uvicorn
- Pandas
- OpenPyXL
- Python-docx
- PyPDF2

---

## 🔄 Mise à Jour du Déploiement

Pour mettre à jour le backend après des modifications :

```powershell
# 1. Aller dans py_backend
cd py_backend

# 2. Ajouter les modifications
git add .

# 3. Créer un commit
git commit -m "Update: description des changements"

# 4. Pousser vers Hugging Face
git push hf main
```

Le Space se rebuild automatiquement.

---

## 📈 Monitoring et Logs

### Accéder aux Logs

1. Aller sur votre Space
2. Cliquer sur "Logs"
3. Deux types de logs :
   - **Build logs** : Construction de l'image Docker
   - **Container logs** : Application en cours d'exécution

### Métriques Disponibles

Hugging Face fournit :
- Nombre de requêtes
- Temps de réponse
- Utilisation CPU/Mémoire
- Statut du service

---

## 💰 Coûts

### Tier Gratuit (CPU basic)
- **Prix** : Gratuit
- **CPU** : 2 vCPU
- **RAM** : 16 GB
- **Limitations** : Peut être mis en veille après inactivité

### Tiers Payants (si besoin)
- **CPU upgrade** : ~$0.03/heure
- **GPU T4** : ~$0.60/heure
- **GPU A10G** : ~$1.05/heure

---

## 🔐 Sécurité

### Token Hugging Face

⚠️ **IMPORTANT** : Ne jamais commiter le token dans Git

Le token est utilisé uniquement pour :
- Authentification lors du push
- Accès en écriture au Space

### Variables d'Environnement

Pour ajouter des secrets (API keys, etc.) :
1. Aller dans Settings du Space
2. Section "Repository secrets"
3. Ajouter vos secrets

Exemple :
```
OPENAI_API_KEY=sk-...
NEO4J_URI=neo4j://...
```

---

## 🆘 Dépannage

### Problème : Build échoue

**Solution** :
1. Vérifier les logs de build
2. Vérifier `requirements.txt`
3. Vérifier le `Dockerfile`

### Problème : Application ne démarre pas

**Solution** :
1. Vérifier que le port 7860 est configuré
2. Vérifier les logs du container
3. Tester localement avec Docker

### Problème : Erreur Git

**Solution** :
```powershell
# Réinitialiser le remote
git remote remove hf
git remote add hf https://[USERNAME]:[TOKEN]@huggingface.co/spaces/[USERNAME]/claraverse-backend

# Forcer le push
git push hf main --force
```

---

## 📚 Ressources

### Documentation Officielle
- [Hugging Face Spaces](https://huggingface.co/docs/hub/spaces)
- [Docker Spaces](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [FastAPI](https://fastapi.tiangolo.com/)

### Support
- [Forum Hugging Face](https://discuss.huggingface.co/)
- [Discord Hugging Face](https://discord.gg/hugging-face)

---

## ✅ Checklist Finale

Après le déploiement, vérifier :

- [ ] Space créé sur Hugging Face
- [ ] Build terminé avec succès
- [ ] Statut "Running"
- [ ] `/health` retourne 200 OK
- [ ] `/docs` accessible
- [ ] API testée avec curl
- [ ] Frontend mis à jour avec nouvelle URL

---

## 🎉 Félicitations !

Votre backend Python est maintenant déployé sur Hugging Face Spaces !

**URL de l'API** : `https://[username]-claraverse-backend.hf.space`  
**Documentation** : `https://[username]-claraverse-backend.hf.space/docs`

---

**Dernière mise à jour** : 18 Avril 2026
