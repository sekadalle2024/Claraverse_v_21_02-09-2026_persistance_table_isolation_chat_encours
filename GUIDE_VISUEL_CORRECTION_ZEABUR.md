# 🎯 Guide Visuel - Correction Configuration Zeabur

## 📸 Captures d'écran annotées

### ❌ Configuration INCORRECTE (Actuelle)

```
┌─────────────────────────────────────────────────────────────┐
│ Zeabur Dashboard > Backend Service > Settings              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Build Configuration                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Build Method:    [Docker Compose ▼]                 │   │
│  │                                                      │   │
│  │ Service Name:    [frontend      ▼]  ← ❌ ERREUR    │   │
│  │                                                      │   │
│  │ Root Directory:  [/             ▼]                  │   │
│  │                                                      │   │
│  │ Port:            [8080          ]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancel]  [Save Changes]                                  │
└─────────────────────────────────────────────────────────────┘

RÉSULTAT: Build le frontend au lieu du backend !
Logs montrent: dist/assets/*.js
```

### ✅ Configuration CORRECTE (À appliquer)

```
┌─────────────────────────────────────────────────────────────┐
│ Zeabur Dashboard > Backend Service > Settings              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Build Configuration                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Build Method:    [Docker Compose ▼]                 │   │
│  │                                                      │   │
│  │ Service Name:    [backend       ▼]  ← ✅ CORRECT   │   │
│  │                                                      │   │
│  │ Root Directory:  [/             ▼]                  │   │
│  │                                                      │   │
│  │ Port:            [8080          ]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancel]  [Save Changes]                                  │
└─────────────────────────────────────────────────────────────┘

RÉSULTAT: Build le backend Python correctement !
Logs montrent: pip install, uvicorn running
```

## 🔄 Processus de Correction Étape par Étape

### Étape 1: Accéder aux Settings

```
Zeabur Dashboard
    ↓
Sélectionner votre projet
    ↓
Cliquer sur le service "Backend"
    ↓
Onglet "Settings" (ou "Configuration")
```

### Étape 2: Modifier la Configuration

**Localiser la section "Build Configuration" ou "Docker Compose Settings"**

Vous devriez voir un dropdown "Service Name" avec les options:
- `backend`
- `frontend`

**Sélectionner `backend`** (pas `frontend` !)

### Étape 3: Sauvegarder et Redéployer

1. Cliquer sur **"Save Changes"** ou **"Update"**
2. Cliquer sur **"Redeploy"** ou **"Rebuild"**
3. Attendre 3-5 minutes

### Étape 4: Vérifier les Logs

**Logs CORRECTS du Backend:**
```
Step 1/12 : FROM python:3.11-slim
Step 2/12 : WORKDIR /app
Step 3/12 : RUN apt-get update
Step 4/12 : COPY requirements.txt .
Step 5/12 : RUN pip install --no-cache-dir -r requirements.txt
Collecting fastapi
Collecting uvicorn
...
Successfully installed fastapi-0.109.0 uvicorn-0.27.0
...
INFO:     Uvicorn running on http://0.0.0.0:8080
```

**Logs INCORRECTS (actuels):**
```
Step 1/12 : FROM node:18-alpine AS builder
Step 2/12 : WORKDIR /app
Step 3/12 : COPY package*.json ./
Step 4/12 : RUN npm ci
...
vite v5.0.0 building for production...
✓ 1234 modules transformed.
dist/assets/index-abc123.js
dist/assets/vendor-def456.js
```

## 📊 Comparaison Visuelle

### Architecture Docker Compose

```yaml
# docker-compose.yml
services:
  backend:          ← Service pour le backend Python
    build:
      context: ./py_backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
  
  frontend:         ← Service pour le frontend React
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
```

### Mapping Zeabur

```
┌─────────────────────────────────────────────────────────────┐
│                    CONFIGURATION ZEABUR                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Service Zeabur: "Backend"                                  │
│  ├── Service Name: backend  ← Doit correspondre            │
│  └── Build: py_backend/Dockerfile                          │
│                                                             │
│  Service Zeabur: "Frontend"                                 │
│  ├── Service Name: frontend ← Doit correspondre            │
│  └── Build: Dockerfile.frontend                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Points de Vérification

### ✅ Backend Correctement Configuré

- [ ] Service Name = `backend`
- [ ] Port = `8080`
- [ ] Logs montrent `pip install`
- [ ] Logs montrent `uvicorn running`
- [ ] URL `/health` retourne JSON
- [ ] Pas de fichiers `.js` dans les logs

### ✅ Frontend Correctement Configuré

- [ ] Service Name = `frontend`
- [ ] Port = `80`
- [ ] Logs montrent `npm ci`
- [ ] Logs montrent `vite build`
- [ ] Logs montrent `nginx` démarré
- [ ] URL principale affiche l'app

## 🚨 Erreurs Courantes

### Erreur 1: Mauvais Service Name
```
❌ Backend avec Service Name = "frontend"
   → Build le frontend au lieu du backend
   
✅ Backend avec Service Name = "backend"
   → Build le backend correctement
```

### Erreur 2: Mauvais Port
```
❌ Backend avec Port = 80
   → Le backend écoute sur 8080, pas 80
   
✅ Backend avec Port = 8080
   → Correspond au EXPOSE dans le Dockerfile
```

### Erreur 3: Mauvais Root Directory
```
❌ Backend avec Root Directory = "py_backend"
   → Docker Compose ne trouve pas le fichier
   
✅ Backend avec Root Directory = "/"
   → Docker Compose à la racine du projet
```

## 💡 Alternative: Déploiement Sans Docker Compose

Si Docker Compose pose trop de problèmes, vous pouvez déployer chaque service séparément:

### Backend Seul

```
┌─────────────────────────────────────────────────────────────┐
│ Nouveau Service: "Backend Python"                          │
├─────────────────────────────────────────────────────────────┤
│ Build Method:     Dockerfile                                │
│ Root Directory:   py_backend                                │
│ Dockerfile Path:  Dockerfile                                │
│ Port:             8080                                      │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Seul

```
┌─────────────────────────────────────────────────────────────┐
│ Nouveau Service: "Frontend React"                          │
├─────────────────────────────────────────────────────────────┤
│ Build Method:     Dockerfile                                │
│ Root Directory:   /                                         │
│ Dockerfile Path:  Dockerfile.frontend                       │
│ Port:             80                                        │
└─────────────────────────────────────────────────────────────┘
```

## 📞 Support

Si après ces corrections le problème persiste:

1. **Vérifier les variables d'environnement** dans Zeabur
2. **Consulter les logs complets** du build
3. **Essayer le déploiement séparé** (sans Docker Compose)
4. **Contacter le support Zeabur** avec les logs

## 🎉 Succès !

Quand tout fonctionne, vous devriez voir:

```
✅ Backend:  https://pybackend.zeabur.app/health
   → {"status": "healthy"}

✅ Frontend: https://prclaravi.zeabur.app
   → Application Claraverse chargée
```
