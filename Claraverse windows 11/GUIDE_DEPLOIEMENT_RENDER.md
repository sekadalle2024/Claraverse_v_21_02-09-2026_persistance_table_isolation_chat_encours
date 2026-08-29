# 🚀 Déploiement sur Render - Clara E-Audit

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      RENDER                              │
├─────────────────────────┬───────────────────────────────┤
│   clara-frontend        │      clara-backend            │
│   (Static Site)         │      (Web Service)            │
│   React/Vite            │      Python FastAPI           │
│   Port: 443 (HTTPS)     │      Port: 10000              │
└─────────────────────────┴───────────────────────────────┘
```

## 📋 Prérequis

1. Compte Render (gratuit) : https://render.com
2. Repo GitHub connecté à Render

---

## 🔧 Méthode 1 : Blueprint (Automatique)

### Étape 1 : Push sur GitHub
```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

### Étape 2 : Déployer via Blueprint
1. Aller sur https://dashboard.render.com
2. Cliquer sur **"New"** → **"Blueprint"**
3. Connecter votre repo GitHub
4. Render détecte automatiquement `render.yaml`
5. Cliquer **"Apply"**

### Étape 3 : Attendre le déploiement
- Backend : ~3-5 minutes
- Frontend : ~2-3 minutes

---

## 🔧 Méthode 2 : Manuelle

### A. Déployer le Backend

1. **New** → **Web Service**
2. Connecter le repo GitHub
3. Configuration :
   - **Name**: `clara-backend`
   - **Region**: Frankfurt (EU)
   - **Branch**: main
   - **Root Directory**: `py_backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

4. Cliquer **Create Web Service**

### B. Déployer le Frontend

1. **New** → **Static Site**
2. Connecter le repo GitHub
3. Configuration :
   - **Name**: `clara-frontend`
   - **Branch**: main
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables** :
   ```
   VITE_API_URL=https://clara-backend.onrender.com
   ```

5. Cliquer **Create Static Site**

---

## 🔗 URLs après déploiement

| Service | URL |
|---------|-----|
| Frontend | `https://clara-frontend.onrender.com` |
| Backend | `https://clara-backend.onrender.com` |
| API Docs | `https://clara-backend.onrender.com/docs` |
| Health | `https://clara-backend.onrender.com/health` |

---

## ⚙️ Configuration Frontend

Après déploiement du backend, mettre à jour l'URL de l'API dans le frontend.

Créer/modifier `.env.production` :
```env
VITE_API_URL=https://clara-backend.onrender.com
```

---

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifier les logs dans Render Dashboard
- S'assurer que `requirements.txt` est dans `py_backend/`

### Erreur CORS
Le backend autorise déjà tous les origins (`allow_origins=["*"]`)

### Cold Start (Plan Free)
- Le service s'endort après 15 min d'inactivité
- Premier accès peut prendre 30-60 secondes

### Limite mémoire
- Plan Free : 512 MB RAM
- Si dépassé, passer au plan Starter ($7/mois)

---

## 📊 Limites Plan Free

| Ressource | Limite |
|-----------|--------|
| RAM | 512 MB |
| CPU | Shared |
| Bandwidth | 100 GB/mois |
| Build minutes | 500/mois |
| Sleep après inactivité | 15 min |

---

## ✅ Checklist Déploiement

- [ ] Repo GitHub à jour
- [ ] `render.yaml` présent à la racine
- [ ] `py_backend/requirements.txt` existe
- [ ] `package.json` avec script `build`
- [ ] Backend déployé et `/health` répond
- [ ] Frontend déployé et accessible
- [ ] Variable `VITE_API_URL` configurée

---

## 🎉 C'est fait !

Votre application est maintenant en ligne sur Render !
