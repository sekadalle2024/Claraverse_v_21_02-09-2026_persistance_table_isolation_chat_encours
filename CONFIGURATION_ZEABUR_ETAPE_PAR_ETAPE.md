# 🎯 Configuration Zeabur - Guide Étape par Étape

## 📋 Vue d'ensemble

Ce guide vous montre **exactement** comment configurer vos 2 services dans Zeabur pour qu'ils fonctionnent correctement.

## 🔧 Service 1: Backend (Python/FastAPI)

### Étape 1: Créer ou Modifier le Service

1. **Aller sur Zeabur Dashboard**
   - URL: https://zeabur.com/dashboard
   - Sélectionner votre projet

2. **Cliquer sur le service Backend**
   - Nom: `backend` ou `claraverse-backend`
   - Domaine: `pybackend.zeabur.app`

### Étape 2: Configuration Build

Dans l'onglet **Settings** ou **Configuration**:

```
┌─────────────────────────────────────────────────────────────┐
│ Build Configuration                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Repository:                                                 │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ github.com/votre-username/claraverse            ▼  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Branch:                                                     │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ main                                            ▼  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Build Method:                                               │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Docker Compose                                  ▼  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Service Name:                    ⚠️ IMPORTANT !            │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ backend                                         ▼  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Root Directory:                                             │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ /                                                  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Étape 3: Configuration Port

```
┌─────────────────────────────────────────────────────────────┐
│ Port Configuration                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Port:                                                       │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ 8080                                                │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Protocol:                                                   │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ HTTP                                            ▼  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Étape 4: Variables d'Environnement (Optionnel)

```
┌─────────────────────────────────────────────────────────────┐
│ Environment Variables                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────┬─────────────────────────────────┐   │
│ │ Key                 │ Value                           │   │
│ ├─────────────────────┼─────────────────────────────────┤   │
│ │ APP_ENV             │ production                      │   │
│ │ LOG_LEVEL           │ info                            │   │
│ │ CORS_ORIGINS        │ https://prclaravi.zeabur.app    │   │
│ └─────────────────────┴─────────────────────────────────┘   │
│                                                             │
│ [+ Add Variable]                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Étape 5: Domaine

```
┌─────────────────────────────────────────────────────────────┐
│ Domain Configuration                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Generated Domain:                                           │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ pybackend.zeabur.app                                │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ [Generate Domain]  [Add Custom Domain]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ✅ Checklist Backend

- [ ] Build Method = `Docker Compose`
- [ ] Service Name = `backend` (PAS `frontend` !)
- [ ] Root Directory = `/`
- [ ] Port = `8080`
- [ ] Domaine généré (ex: `pybackend.zeabur.app`)

---

## ⚛️ Service 2: Frontend (React/Nginx)

### Étape 1: Créer ou Modifier le Service

1. **Aller sur Zeabur Dashboard**
   - Sélectionner votre projet

2. **Cliquer sur le service Frontend**
   - Nom: `frontend` ou `claraverse-frontend`
   - Domaine: `prclaravi.zeabur.app`

### Étape 2: Configuration Build

```
┌─────────────────────────────────────────────────────────────┐
│ Build Configuration                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Repository:                                                 │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ github.com/votre-username/claraverse            ▼  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Branch:                                                     │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ main                                            ▼  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Build Method:                                               │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Docker Compose                                  ▼  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Service Name:                    ⚠️ IMPORTANT !            │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ frontend                                        ▼  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Root Directory:                                             │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ /                                                  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Étape 3: Configuration Port

```
┌─────────────────────────────────────────────────────────────┐
│ Port Configuration                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Port:                                                       │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ 80                                                  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ Protocol:                                                   │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ HTTP                                            ▼  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Étape 4: Variables d'Environnement

```
┌─────────────────────────────────────────────────────────────┐
│ Environment Variables                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────┬─────────────────────────────────┐   │
│ │ Key                 │ Value                           │   │
│ ├─────────────────────┼─────────────────────────────────┤   │
│ │ VITE_BACKEND_URL    │ https://pybackend.zeabur.app    │   │
│ │ NODE_ENV            │ production                      │   │
│ └─────────────────────┴─────────────────────────────────┘   │
│                                                             │
│ [+ Add Variable]                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Étape 5: Domaine

```
┌─────────────────────────────────────────────────────────────┐
│ Domain Configuration                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Generated Domain:                                           │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ prclaravi.zeabur.app                                │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ [Generate Domain]  [Add Custom Domain]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ✅ Checklist Frontend

- [ ] Build Method = `Docker Compose`
- [ ] Service Name = `frontend` (PAS `backend` !)
- [ ] Root Directory = `/`
- [ ] Port = `80`
- [ ] Variable `VITE_BACKEND_URL` configurée
- [ ] Domaine généré (ex: `prclaravi.zeabur.app`)

---

## 🚀 Déploiement

### Étape 1: Sauvegarder les Configurations

Pour chaque service:
1. Cliquer sur **"Save"** ou **"Update"**
2. Attendre la confirmation

### Étape 2: Déclencher le Build

Pour chaque service:
1. Cliquer sur **"Redeploy"** ou **"Rebuild"**
2. Ou faire un `git push` pour déclencher automatiquement

### Étape 3: Surveiller les Logs

#### Logs Backend (Corrects)

```
✅ Building backend service...
Step 1/12 : FROM python:3.11-slim
Step 2/12 : WORKDIR /app
Step 3/12 : RUN apt-get update
Step 4/12 : COPY requirements.txt .
Step 5/12 : RUN pip install --no-cache-dir -r requirements.txt
Collecting fastapi==0.109.0
Collecting uvicorn==0.27.0
...
Successfully installed fastapi uvicorn pydantic
...
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8080
```

#### Logs Frontend (Corrects)

```
✅ Building frontend service...
Step 1/12 : FROM node:18-alpine AS builder
Step 2/12 : WORKDIR /app
Step 3/12 : COPY package*.json ./
Step 4/12 : RUN npm ci
...
vite v5.0.0 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-abc123.js     234.56 kB
...
Step 8/12 : FROM nginx:alpine
...
Configuration complete; ready for start up
```

---

## 🧪 Tests de Vérification

### Test 1: Backend Health Check

```bash
curl https://pybackend.zeabur.app/health
```

**Réponse attendue:**
```json
{
  "status": "healthy"
}
```

### Test 2: Frontend Accessible

Ouvrir dans le navigateur:
```
https://prclaravi.zeabur.app
```

**Résultat attendu:**
- Page se charge
- Pas d'erreur 404
- Application React visible

### Test 3: Communication Frontend → Backend

Dans la console du navigateur (F12):
```javascript
fetch('https://pybackend.zeabur.app/health')
  .then(r => r.json())
  .then(console.log)
```

**Résultat attendu:**
```json
{
  "status": "healthy"
}
```

---

## ❌ Erreurs Courantes et Solutions

### Erreur 1: Backend Build le Frontend

**Symptôme:**
```
Logs montrent: dist/assets/*.js
npm ci
vite build
```

**Cause:**
Service Name = `frontend` au lieu de `backend`

**Solution:**
1. Settings → Build Configuration
2. Service Name → Changer en `backend`
3. Save → Redeploy

---

### Erreur 2: Frontend Build le Backend

**Symptôme:**
```
Logs montrent: pip install
uvicorn running
```

**Cause:**
Service Name = `backend` au lieu de `frontend`

**Solution:**
1. Settings → Build Configuration
2. Service Name → Changer en `frontend`
3. Save → Redeploy

---

### Erreur 3: Port Incorrect

**Symptôme:**
```
Service running but not accessible
Health check failed
```

**Cause:**
Port configuré ne correspond pas au port exposé

**Solution Backend:**
- Port doit être `8080`

**Solution Frontend:**
- Port doit être `80`

---

### Erreur 4: CORS

**Symptôme:**
```
Access to fetch at 'https://pybackend.zeabur.app' 
from origin 'https://prclaravi.zeabur.app' 
has been blocked by CORS policy
```

**Solution:**
Ajouter variable d'environnement au backend:
```
CORS_ORIGINS=https://prclaravi.zeabur.app
```

---

## 📊 Récapitulatif Visuel

```
┌─────────────────────────────────────────────────────────────┐
│                    CONFIGURATION FINALE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SERVICE BACKEND                                            │
│  ├── Build Method:    Docker Compose                        │
│  ├── Service Name:    backend                               │
│  ├── Root Directory:  /                                     │
│  ├── Port:            8080                                  │
│  └── Domain:          pybackend.zeabur.app                  │
│                                                             │
│  SERVICE FRONTEND                                           │
│  ├── Build Method:    Docker Compose                        │
│  ├── Service Name:    frontend                              │
│  ├── Root Directory:  /                                     │
│  ├── Port:            80                                    │
│  └── Domain:          prclaravi.zeabur.app                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎉 Succès !

Quand tout fonctionne:

✅ Backend accessible: `https://pybackend.zeabur.app/health`  
✅ Frontend accessible: `https://prclaravi.zeabur.app`  
✅ Pas d'erreur CORS  
✅ Application fonctionnelle  

**Félicitations ! Votre application est déployée ! 🚀**
