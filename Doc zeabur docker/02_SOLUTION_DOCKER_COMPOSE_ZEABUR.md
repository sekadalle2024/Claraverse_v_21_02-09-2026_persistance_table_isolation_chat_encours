# 🐳 SOLUTION DOCKER COMPOSE POUR ZEABUR

**Date:** 20 Avril 2026  
**Solution:** Docker Compose + Switch Backend Dynamique

---

## 1. VUE D'ENSEMBLE

### 1.1 Architecture Cible

```
┌─────────────────────────────────────────────────────────────────┐
│                    DÉVELOPPEMENT LOCAL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  docker-compose up -d                                           │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │   Frontend       │────────▶│   Backend        │            │
│  │   React/Vite     │         │   Python/FastAPI │            │
│  │   Port: 3000     │         │   Port: 5000     │            │
│  └──────────────────┘         └──────────────────┘            │
│         │                              │                        │
│         └──────────────────────────────┘                        │
│              claraverse-network                                 │
│                                                                  │
│  Switch Backend: http://localhost:5000                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    git push origin main
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ZEABUR                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Auto-deploy depuis GitHub                                      │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │   Frontend       │────────▶│   Backend        │            │
│  │   Nginx          │         │   Uvicorn        │            │
│  │   Port: 80       │         │   Port: 8080     │            │
│  └──────────────────┘         └──────────────────┘            │
│         │                              │                        │
│         └──────────────────────────────┘                        │
│              zeabur-network                                     │
│                                                                  │
│  URLs:                                                          │
│  - Frontend: https://prclaravi.zeabur.app                       │
│  - Backend: https://pybackend.zeabur.app                        │
│                                                                  │
│  Switch Backend: https://pybackend.zeabur.app                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. FICHIERS DE CONFIGURATION

### 2.1 docker-compose.yml (Racine du projet)

```yaml
version: '3.8'

services:
  # ============================================
  # SERVICE FRONTEND (React + TypeScript)
  # ============================================
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        - NODE_ENV=production
    container_name: claraverse-frontend
    ports:
      - "3000:80"  # Local: 3000, Zeabur: 80
    environment:
      # Variables d'environnement pour le build
      - VITE_APP_NAME=Claraverse
      - VITE_BACKEND_URL=${BACKEND_URL:-http://backend:8080}
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - claraverse-network
    restart: unless-stopped
    labels:
      - "com.claraverse.service=frontend"
      - "com.claraverse.version=1.0.0"

  # ============================================
  # SERVICE BACKEND (Python + FastAPI)
  # ============================================
  backend:
    build:
      context: ./py_backend
      dockerfile: Dockerfile
    container_name: claraverse-backend
    ports:
      - "5000:8080"  # Local: 5000, Zeabur: 8080
    environment:
      # Configuration serveur
      - HOST=0.0.0.0
      - PORT=8080
      - PYTHONUNBUFFERED=1
      - PYTHONDONTWRITEBYTECODE=1
      
      # CORS Configuration
      - CORS_ORIGINS=https://prclaravi.zeabur.app,http://localhost:3000,http://localhost:5173
      - CORS_ALLOW_CREDENTIALS=true
      - CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
      - CORS_ALLOW_HEADERS=*
      - CORS_EXPOSE_HEADERS=Content-Disposition,Content-Type,Content-Length
      
      # Application
      - APP_ENV=${APP_ENV:-production}
      - LOG_LEVEL=${LOG_LEVEL:-info}
    volumes:
      # Persistance des données (optionnel)
      - backend-data:/app/data
    networks:
      - claraverse-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    labels:
      - "com.claraverse.service=backend"
      - "com.claraverse.version=1.0.0"

# ============================================
# NETWORKS
# ============================================
networks:
  claraverse-network:
    driver: bridge
    name: claraverse-network

# ============================================
# VOLUMES
# ============================================
volumes:
  backend-data:
    driver: local
    name: claraverse-backend-data
```

### 2.2 Dockerfile.frontend (Racine du projet)

```dockerfile
# ============================================
# STAGE 1: Build
# ============================================
FROM node:18-alpine AS builder

LABEL org.opencontainers.image.title="Claraverse Frontend"
LABEL org.opencontainers.image.description="Claraverse AI Assistant Frontend"
LABEL org.opencontainers.image.version="1.0.0"

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build de production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm run build

# ============================================
# STAGE 2: Production avec Nginx
# ============================================
FROM nginx:alpine

# Copier la configuration Nginx
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2.3 py_backend/Dockerfile (Adapté pour Zeabur)

```dockerfile
FROM python:3.11-slim

LABEL org.opencontainers.image.title="Claraverse Backend"
LABEL org.opencontainers.image.description="Claraverse AI Assistant Backend Service"
LABEL org.opencontainers.image.version="1.0.0"

WORKDIR /app

# Installer les dépendances système
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        gcc \
        g++ \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p /app/data /app/logs

# Variables d'environnement par défaut
ENV HOST="0.0.0.0" \
    PORT=8080 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

# Exposer le port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Commande de démarrage
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
```

---

## 3. CONFIGURATION ZEABUR

### 3.1 Fichier zeabur.json (Optionnel)

```json
{
  "name": "claraverse",
  "services": [
    {
      "name": "frontend",
      "type": "docker-compose",
      "service": "frontend",
      "port": 80,
      "domains": [
        "prclaravi.zeabur.app"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    },
    {
      "name": "backend",
      "type": "docker-compose",
      "service": "backend",
      "port": 8080,
      "domains": [
        "pybackend.zeabur.app"
      ],
      "env": {
        "APP_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  ],
  "build": {
    "dockerfile": "docker-compose.yml"
  }
}
```

### 3.2 Configuration dans l'Interface Zeabur

#### Étape 1: Créer un Nouveau Service
1. Aller sur https://zeabur.com/dashboard
2. Cliquer sur "New Service"
3. Sélectionner "Docker Compose"
4. Connecter le repository GitHub

#### Étape 2: Configuration du Service Frontend
```
Service Name: claraverse-frontend
Build Method: Docker Compose
Service: frontend
Port: 80
Domain: prclaravi.zeabur.app
```

#### Étape 3: Configuration du Service Backend
```
Service Name: claraverse-backend
Build Method: Docker Compose
Service: backend
Port: 8080
Domain: pybackend.zeabur.app
```

#### Étape 4: Variables d'Environnement
```bash
# Backend
CORS_ORIGINS=https://prclaravi.zeabur.app,http://localhost:3000
APP_ENV=production
LOG_LEVEL=info

# Frontend (si nécessaire)
VITE_BACKEND_URL=https://pybackend.zeabur.app
```

---

## 4. SWITCH BACKEND (Inchangé)

### 4.1 public/backendConfig.js

```javascript
/**
 * Configuration dynamique du backend
 * Compatible avec Docker Compose et déploiement Zeabur
 */
(function() {
  'use strict';
  
  // Détection de l'environnement
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || 
                  hostname === '127.0.0.1' ||
                  hostname.startsWith('192.168.');
  
  // Configuration des URLs backend
  const BACKEND_CONFIG = {
    local: {
      url: 'http://localhost:5000',
      timeout: 300000, // 5 minutes
      env: 'development'
    },
    production: {
      url: 'https://pybackend.zeabur.app',
      timeout: 300000, // 5 minutes
      env: 'production'
    }
  };
  
  // Sélection de la configuration
  const config = isLocal ? BACKEND_CONFIG.local : BACKEND_CONFIG.production;
  
  // Exposition globale
  window.CLARA_BACKEND_URL = config.url;
  window.CLARA_BACKEND_TIMEOUT = config.timeout;
  window.CLARA_ENV = config.env;
  
  // Log pour debug
  console.log('🔗 Claraverse Backend Configuration:');
  console.log('   Environment:', config.env);
  console.log('   Backend URL:', config.url);
  console.log('   Timeout:', config.timeout + 'ms');
  
  // Vérification de disponibilité (optionnel)
  if (window.CLARA_ENV === 'production') {
    fetch(config.url + '/health', { method: 'GET' })
      .then(response => {
        if (response.ok) {
          console.log('✅ Backend is healthy');
        } else {
          console.warn('⚠️  Backend health check failed:', response.status);
        }
      })
      .catch(error => {
        console.error('❌ Backend is unreachable:', error.message);
      });
  }
})();
```

### 4.2 Intégration dans index.html

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Claraverse - E-Audit</title>
  
  <!-- IMPORTANT: Charger backendConfig.js EN PREMIER -->
  <script src="/backendConfig.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

---

## 5. WORKFLOW DE DÉPLOIEMENT

### 5.1 Développement Local

```bash
# 1. Cloner le repository
git clone https://github.com/votre-org/claraverse.git
cd claraverse

# 2. Créer le fichier .env (optionnel)
cat > .env << EOF
APP_ENV=development
LOG_LEVEL=debug
BACKEND_URL=http://localhost:5000
EOF

# 3. Démarrer les services
docker-compose up -d

# 4. Vérifier les logs
docker-compose logs -f

# 5. Accéder à l'application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Backend API Docs: http://localhost:5000/docs
```

### 5.2 Tests Locaux

```bash
# Vérifier le statut des services
docker-compose ps

# Tester le backend
curl http://localhost:5000/health

# Tester le frontend
curl http://localhost:3000/health

# Vérifier les logs
docker-compose logs backend
docker-compose logs frontend
```

### 5.3 Déploiement Production

```bash
# 1. Commit et push
git add .
git commit -m "feat: déploiement Docker Compose"
git push origin main

# 2. Zeabur détecte automatiquement le push
# 3. Build des images Docker
# 4. Déploiement automatique
# 5. Services disponibles sur:
#    - https://prclaravi.zeabur.app (Frontend)
#    - https://pybackend.zeabur.app (Backend)
```

---

## 6. AVANTAGES DE CETTE SOLUTION

### ✅ Développement
- Environnement identique local/production
- Tests fiables
- Pas de "ça marche sur ma machine"

### ✅ Déploiement
- Automatique via GitHub
- Atomique (tout ou rien)
- Rollback facile

### ✅ Maintenance
- Configuration centralisée
- Logs unifiés
- Monitoring simplifié

### ✅ Scalabilité
- Facile d'ajouter des services
- Load balancing possible
- Migration facilitée

---

## 7. PROCHAINES ÉTAPES

1. ✅ Créer les fichiers de configuration
2. ✅ Tester localement avec Docker Compose
3. ✅ Valider le switch backend
4. ✅ Push vers GitHub
5. ✅ Configurer Zeabur
6. ✅ Déployer et tester en production

**Prochaine lecture:** `04_GUIDE_IMPLEMENTATION.md`
