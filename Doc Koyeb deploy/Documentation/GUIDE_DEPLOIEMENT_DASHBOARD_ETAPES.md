# 🎯 Guide Étape par Étape - Déploiement Dashboard Koyeb

> Suivez ces étapes exactement dans le Dashboard Koyeb ouvert dans votre navigateur

---

## ✅ Préparation Terminée

- ✅ Archive créée : `backend.zip` (2.95 MB)
- ✅ Dashboard Koyeb ouvert : https://app.koyeb.com
- ✅ Prêt à déployer !

---

## 📋 Étapes de Déploiement

### Étape 1 : Créer un Nouveau Service

Dans le Dashboard Koyeb :

1. **Cliquez sur le bouton "Create Service"** (ou "Create App" si c'est votre premier service)
   - Il se trouve généralement en haut à droite ou au centre de la page

---

### Étape 2 : Choisir la Méthode de Déploiement

Vous verrez plusieurs options :

1. **Sélectionnez "Archive"** (ou "Upload")
   - C'est l'option pour uploader votre fichier `backend.zip`

2. **Cliquez sur "Choose file"** ou glissez-déposez
   - Sélectionnez le fichier `backend.zip` depuis votre dossier ClaraVerse

3. **Attendez l'upload** (quelques secondes)

---

### Étape 3 : Configuration du Builder

Une fois l'archive uploadée :

1. **Builder** :
   - Sélectionnez : **"Dockerfile"**
   - Path du Dockerfile : `Dockerfile` (déjà présent dans l'archive)

2. **Build context** :
   - Laissez vide ou mettez `.` (point)

---

### Étape 4 : Configuration du Service

#### Nom du Service
```
Service name: clara-backend
```

#### Région
```
Region: Frankfurt (fra)
```
(Europe - meilleure latence pour la France)

#### Instance Type
```
Instance type: Nano
```
(Gratuit - parfait pour commencer)

---

### Étape 5 : Configuration du Port

**IMPORTANT** : Configurez le port correctement

1. **Port** : `5000`
2. **Protocol** : `HTTP`
3. **Path** : `/` (racine)

---

### Étape 6 : Variables d'Environnement

Cliquez sur **"Add environment variable"** et ajoutez :

```
HOST = 0.0.0.0
PORT = 5000
PYTHONUNBUFFERED = 1
PYTHONDONTWRITEBYTECODE = 1
```

**Variables optionnelles** (pour LightRAG, ajoutez si nécessaire) :
```
OPENAI_API_KEY = votre-cle-si-vous-en-avez-une
```

---

### Étape 7 : Configuration Avancée (Optionnel)

#### Health Check
- **Path** : `/health`
- **Port** : `5000`
- **Initial delay** : `30` secondes
- **Timeout** : `10` secondes

#### Scaling
- **Min instances** : `1`
- **Max instances** : `1` (pour commencer)

---

### Étape 8 : Déployer !

1. **Vérifiez la configuration** :
   - Service name : `clara-backend`
   - Builder : `Dockerfile`
   - Port : `5000`
   - Instance : `Nano`
   - Variables : `HOST`, `PORT`, etc.

2. **Cliquez sur "Deploy"** (bouton en bas ou en haut à droite)

---

## 🔄 Suivi du Déploiement

### Phase 1 : Building (5-10 minutes)

Le service va :
1. **Extraire l'archive**
2. **Construire l'image Docker** :
   - Installer Python 3.11
   - Installer les dépendances (`requirements.txt`)
   - Installer spaCy et le modèle anglais
   - Copier le code

**Logs à surveiller** :
```
✓ Extracting archive...
✓ Building Docker image...
✓ Installing dependencies...
✓ Installing spaCy model...
✓ Image built successfully
```

### Phase 2 : Deploying (1-2 minutes)

Le service va :
1. **Démarrer le container**
2. **Lancer FastAPI**
3. **Vérifier le health check**

**Logs à surveiller** :
```
✓ Starting container...
✓ Application started on port 5000
✓ Health check passed
```

### Phase 3 : Healthy ✅

Le service est opérationnel !

**Statut** : 🟢 **Healthy**

---

## 🌐 Accéder à votre API

### URL de votre API

Une fois déployé, votre API sera accessible à :
```
https://clara-backend-[votre-org].koyeb.app
```

L'URL exacte s'affiche dans le Dashboard.

### Tester l'API

1. **Copier l'URL** depuis le Dashboard

2. **Tester le Health Check** :
   ```
   https://clara-backend-[votre-org].koyeb.app/health
   ```
   
   Réponse attendue :
   ```json
   {
     "status": "healthy",
     "port": 5000,
     "uptime": "0:05:23.456789"
   }
   ```

3. **Ouvrir la Documentation** :
   ```
   https://clara-backend-[votre-org].koyeb.app/docs
   ```
   
   Vous verrez l'interface Swagger avec tous les endpoints.

---

## 📊 Vérifier les Logs

### Pendant le Build

1. Allez dans l'onglet **"Deployments"**
2. Cliquez sur le déploiement en cours
3. Consultez les **"Build logs"**

### Après le Déploiement

1. Allez dans l'onglet **"Logs"**
2. Sélectionnez **"Runtime logs"**
3. Vous verrez les logs de FastAPI

**Logs normaux** :
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5000
```

---

## 🎯 Endpoints Disponibles

Une fois déployé, votre API expose :

### Core
```
GET  /              → Root endpoint
GET  /health        → Health check
GET  /docs          → Documentation Swagger
GET  /redoc         → Documentation ReDoc
```

### LightRAG Notebooks
```
POST /notebooks                    → Créer un notebook
GET  /notebooks                    → Lister les notebooks
GET  /notebooks/{id}               → Détails d'un notebook
DELETE /notebooks/{id}             → Supprimer un notebook
POST /notebooks/{id}/documents     → Upload documents
GET  /notebooks/{id}/documents     → Lister les documents
POST /notebooks/{id}/query         → Interroger un notebook
```

### Pandas API
```
POST /pandas/analyze               → Analyse de données
POST /pandas/agent                 → Agent Pandas avec LLM
```

### Autres Services
```
POST /word/export                  → Export Word
POST /speech-to-text               → Transcription audio
POST /text-to-speech               → Synthèse vocale
GET  /gdrive/pdf/{file_id}         → Proxy Google Drive PDF
```

---

## 🛠️ Dépannage

### Le Build Échoue

**Symptômes** :
- Statut : 🔴 Build failed
- Erreur dans les logs de build

**Solutions** :

1. **Vérifier les logs de build** :
   - Cherchez l'erreur exacte
   - Souvent liée aux dépendances

2. **Problèmes courants** :
   - **Timeout** : Le build prend trop de temps
     - Solution : Augmenter l'instance à "Small"
   - **Dépendance manquante** : Erreur dans `requirements.txt`
     - Solution : Vérifier le fichier
   - **Erreur spaCy** : Problème avec le modèle
     - Solution : Vérifier le Dockerfile

### Le Service ne Démarre Pas

**Symptômes** :
- Build réussi mais service "Unhealthy"
- Erreur dans les logs runtime

**Solutions** :

1. **Vérifier les logs runtime** :
   - Onglet "Logs" → "Runtime logs"

2. **Problèmes courants** :
   - **Port incorrect** : Le service n'écoute pas sur 5000
     - Solution : Vérifier la variable `PORT`
   - **Erreur Python** : Exception au démarrage
     - Solution : Lire l'erreur dans les logs
   - **Health check échoue** : `/health` ne répond pas
     - Solution : Vérifier que FastAPI démarre correctement

### L'API n'est pas Accessible

**Symptômes** :
- Service "Healthy" mais URL ne répond pas

**Solutions** :

1. **Vérifier l'URL** :
   - Copier l'URL exacte depuis le Dashboard
   - Essayer avec `/health` à la fin

2. **Vérifier le port** :
   - Doit être 5000
   - Protocol HTTP (pas HTTPS dans la config, Koyeb ajoute HTTPS automatiquement)

3. **Attendre quelques minutes** :
   - Le DNS peut prendre 1-2 minutes à se propager

---

## 💡 Conseils

### Pendant le Build
- ⏱️ Le premier build prend 5-10 minutes (installation de spaCy)
- 📊 Surveillez les logs pour voir la progression
- ☕ Prenez un café pendant que ça build !

### Après le Déploiement
- ✅ Testez toujours le `/health` en premier
- 📚 Explorez la documentation `/docs`
- 🔍 Gardez les logs ouverts pour débugger

### Optimisation Future
- 🚀 Passez à "Small" si besoin de plus de ressources
- 📈 Activez le scaling automatique (min: 1, max: 2)
- 🔐 Utilisez des Secrets pour les API keys sensibles

---

## 📝 Récapitulatif de la Configuration

```yaml
Service Configuration:
  Name: clara-backend
  Region: Frankfurt (fra)
  Instance: Nano (gratuit)
  
Build:
  Method: Archive (backend.zip)
  Builder: Dockerfile
  Context: .
  
Network:
  Port: 5000
  Protocol: HTTP
  Health Check: /health
  
Environment:
  HOST: 0.0.0.0
  PORT: 5000
  PYTHONUNBUFFERED: 1
  PYTHONDONTWRITEBYTECODE: 1
  
Scaling:
  Min: 1
  Max: 1
```

---

## ✅ Checklist de Déploiement

### Avant de Cliquer sur "Deploy"
- [ ] Archive uploadée : `backend.zip`
- [ ] Builder : `Dockerfile`
- [ ] Service name : `clara-backend`
- [ ] Port : `5000`
- [ ] Instance : `Nano`
- [ ] Variables d'environnement ajoutées

### Pendant le Déploiement
- [ ] Build en cours (5-10 min)
- [ ] Logs de build surveillés
- [ ] Aucune erreur détectée

### Après le Déploiement
- [ ] Statut : 🟢 Healthy
- [ ] URL copiée
- [ ] Health check testé
- [ ] Documentation accessible

---

## 🎉 Succès !

Une fois que vous voyez :
- ✅ Statut : **Healthy** (vert)
- ✅ URL accessible
- ✅ `/health` répond
- ✅ `/docs` affiche la documentation

**Votre backend est déployé avec succès !** 🎊

---

## 🔗 Prochaines Étapes

1. **Noter l'URL de votre API** :
   ```
   https://clara-backend-[votre-org].koyeb.app
   ```

2. **Connecter le frontend** :
   ```bash
   netlify env:set VITE_API_URL https://clara-backend-[votre-org].koyeb.app
   netlify deploy --prod
   ```

3. **Tester l'application complète** !

---

**Temps estimé** : 15-20 minutes  
**Coût** : Gratuit (instance Nano)  
**Difficulté** : Facile avec ce guide  

**Bon déploiement ! 🚀**
