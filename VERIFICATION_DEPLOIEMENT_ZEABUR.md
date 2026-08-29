# ✅ Guide de Vérification - Déploiement Zeabur

## 📋 Checklist Complète

### 1️⃣ Vérification Backend (✅ Déjà OK)

#### Test Health Check
```bash
curl https://pybackend.zeabur.app/
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "service": "Clara Backend",
  "port": 8080,
  "uptime": "0:01:31.941593",
  "start_time": "2026-04-20T15:22:33.688742"
}
```

#### Vérifier les Logs
- Aller sur Zeabur Dashboard
- Sélectionner service "backend"
- Onglet "Logs"
- Vérifier: `INFO: Uvicorn running on http://0.0.0.0:8080`

✅ **Statut:** FONCTIONNEL

---

### 2️⃣ Vérification Frontend (⏳ Après Redéploiement)

#### Test Accès Principal
```
https://prclaravi.zeabur.app
```

**À vérifier:**
- [ ] Page se charge sans erreur 404
- [ ] Logo Claraverse visible
- [ ] Menu de navigation présent
- [ ] Bouton "Démarrer" visible
- [ ] Pas d'erreur dans la console (F12)

#### Test Console Navigateur
1. Ouvrir https://prclaravi.zeabur.app
2. Appuyer sur F12
3. Onglet "Console"

**Erreurs à NE PAS voir:**
- ❌ Failed to fetch
- ❌ CORS error
- ❌ 404 Not Found
- ❌ net::ERR_CONNECTION_REFUSED

**Messages OK:**
- ✅ Warnings normaux de React
- ✅ Messages de chargement des composants

#### Test Communication Backend
1. Cliquer sur "Démarrer"
2. Sélectionner un mode (ex: E-Audit Plan)
3. Vérifier dans la console:
   - ✅ Requête vers `https://pybackend.zeabur.app`
   - ✅ Réponse 200 OK
   - ✅ Données JSON reçues

---

### 3️⃣ Vérification Build Logs Zeabur

#### Frontend Build Logs

**Étapes attendues:**
```
[1/7] Building image...
[2/7] FROM node:18-alpine
[3/7] WORKDIR /app
[4/7] COPY package*.json ./
[5/7] RUN npm install --production=false  ✅ DOIT RÉUSSIR
[6/7] COPY src/ ./src/
[7/7] RUN npm run build
```

**Erreurs à surveiller:**
- ❌ `npm ci` failed → Corrigé par `npm install`
- ❌ Build failed → Vérifier les dépendances
- ❌ Out of memory → Augmenter les ressources Zeabur

**Succès attendu:**
```
✓ Built successfully
✓ Image pushed to registry
✓ Deployment started
✓ Service is running
```

---

### 4️⃣ Tests Fonctionnels Complets

#### Test 1: Menu Démarrer
1. Ouvrir https://prclaravi.zeabur.app
2. Cliquer sur "Démarrer"
3. Vérifier que le menu s'affiche avec toutes les sections:
   - E-Audit Plan
   - E-Audit Réalisation
   - E-Révision
   - E-Contrôle
   - etc.

#### Test 2: Sélection d'un Mode
1. Cliquer sur "E-Audit Plan"
2. Sélectionner "Mode Document"
3. Vérifier:
   - [ ] Interface de chat s'affiche
   - [ ] Possibilité d'envoyer un message
   - [ ] Réponse du backend reçue

#### Test 3: Upload de Fichier
1. Aller dans un mode qui accepte les fichiers
2. Uploader un fichier Excel de test
3. Vérifier:
   - [ ] Upload réussi
   - [ ] Traitement par le backend
   - [ ] Résultat affiché

#### Test 4: Export de Rapport
1. Générer un rapport (ex: Lead Balance)
2. Cliquer sur "Exporter"
3. Vérifier:
   - [ ] Fichier téléchargé
   - [ ] Format correct (Excel/PDF)
   - [ ] Contenu complet

---

### 5️⃣ Vérification Configuration Zeabur

#### Service Frontend
```yaml
Name: frontend
Build Method: Docker Compose
Service: frontend
Port: 80
Domain: prclaravi.zeabur.app
Root Directory: /
Environment Variables:
  - VITE_APP_NAME=Claraverse
  - VITE_BACKEND_URL=https://pybackend.zeabur.app
  - NODE_ENV=production
```

#### Service Backend
```yaml
Name: backend
Build Method: Docker Compose
Service: backend
Port: 8080
Domain: pybackend.zeabur.app
Root Directory: /
Environment Variables:
  - HOST=0.0.0.0
  - PORT=8080
  - CORS_ORIGINS=https://prclaravi.zeabur.app
```

---

### 6️⃣ Tests de Performance

#### Temps de Chargement
- [ ] Page d'accueil < 3 secondes
- [ ] Menu Démarrer < 1 seconde
- [ ] Réponse backend < 5 secondes

#### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

### 7️⃣ Tests de Sécurité

#### Headers HTTP
```bash
curl -I https://prclaravi.zeabur.app
```

**Headers attendus:**
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block

#### CORS
```bash
curl -H "Origin: https://prclaravi.zeabur.app" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://pybackend.zeabur.app/api/endpoint
```

**Headers attendus:**
- ✅ Access-Control-Allow-Origin: https://prclaravi.zeabur.app
- ✅ Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS

---

## 🚨 Problèmes Courants et Solutions

### Problème 1: Frontend 404
**Symptôme:** Page blanche ou 404
**Solution:**
1. Vérifier que le build a réussi
2. Vérifier le port (doit être 80)
3. Vérifier la configuration Nginx

### Problème 2: CORS Error
**Symptôme:** Failed to fetch, CORS error
**Solution:**
1. Vérifier CORS_ORIGINS dans backend
2. Vérifier VITE_BACKEND_URL dans frontend
3. Redéployer les deux services

### Problème 3: Build Failed
**Symptôme:** npm install échoue
**Solution:**
1. Vérifier package.json
2. Vérifier Dockerfile.frontend (npm install, pas npm ci)
3. Vérifier les logs de build

### Problème 4: Backend Timeout
**Symptôme:** Requêtes qui timeout
**Solution:**
1. Vérifier que le backend est running
2. Vérifier les health checks
3. Augmenter le timeout dans claraApiService.ts

---

## 📊 Métriques de Succès

### ✅ Déploiement Réussi Si:
- [ ] Frontend accessible sur https://prclaravi.zeabur.app
- [ ] Backend accessible sur https://pybackend.zeabur.app
- [ ] Menu Démarrer fonctionne
- [ ] Communication frontend ↔ backend OK
- [ ] Pas d'erreur dans les logs
- [ ] Temps de réponse < 5 secondes
- [ ] Tous les tests fonctionnels passent

### 📈 Monitoring Continu
- Vérifier les logs Zeabur quotidiennement
- Surveiller les temps de réponse
- Vérifier les erreurs utilisateurs
- Mettre à jour régulièrement

---

## 🔗 Liens Utiles

- **Frontend:** https://prclaravi.zeabur.app
- **Backend:** https://pybackend.zeabur.app
- **Dashboard Zeabur:** https://zeabur.com/dashboard
- **Documentation:** `Doc zeabur docker/`
- **Support:** Logs Zeabur + GitHub Issues

---

## 📝 Notes

- Le backend est déjà déployé et fonctionnel ✅
- Le frontend nécessite un redéploiement après la correction npm install
- Le déploiement automatique est activé sur push GitHub
- Les logs sont disponibles en temps réel sur Zeabur Dashboard
