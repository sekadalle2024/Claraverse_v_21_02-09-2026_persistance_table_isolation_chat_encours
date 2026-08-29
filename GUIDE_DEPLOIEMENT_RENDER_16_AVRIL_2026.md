# Guide de Déploiement sur Render.com
**Date:** 16 Avril 2026  
**Plateforme:** Render.com (Gratuit, sans carte)

---

## 🎯 Pourquoi Render.com?

- ✅ **Vraiment gratuit** (pas de carte de crédit requise)
- ✅ **Support Docker natif** (votre Dockerfile fonctionne tel quel)
- ✅ **Déploiement automatique** depuis GitHub
- ✅ **Interface simple** et intuitive
- ✅ **750 heures/mois gratuites**
- ⚠️ **Seul inconvénient:** Cold start après 15 min d'inactivité (~30 secondes)

---

## 📋 Étapes de Déploiement

### Étape 1: Créer un compte Render

1. Aller sur: https://render.com
2. Cliquer sur "Get Started"
3. S'inscrire avec:
   - Email: ohada.save12@gmail.com
   - Ou connecter avec GitHub (recommandé)

### Étape 2: Connecter GitHub

1. Dans le dashboard Render, cliquer sur "New +"
2. Sélectionner "Web Service"
3. Cliquer sur "Connect GitHub"
4. Autoriser Render à accéder à vos repos
5. Sélectionner le repository: `Back-end-python-V0_03_03_2026`

### Étape 3: Configurer le Service

**Configuration automatique:**

Render détecte automatiquement votre Dockerfile et propose:

```yaml
Name: clara-backend-production
Region: Frankfurt (Europe) ou Oregon (US)
Branch: main
Root Directory: py_backend
```

**Variables d'environnement à ajouter:**

Cliquer sur "Advanced" puis ajouter:

| Key | Value |
|-----|-------|
| `HOST` | `0.0.0.0` |
| `PORT` | `5000` |
| `PYTHONDONTWRITEBYTECODE` | `1` |
| `PYTHONUNBUFFERED` | `1` |

### Étape 4: Choisir le Plan

- Sélectionner: **Free Plan**
- Pas de carte requise
- 750 heures/mois
- 512 MB RAM

### Étape 5: Déployer

1. Cliquer sur "Create Web Service"
2. Render commence le build automatiquement
3. Attendre 3-5 minutes
4. Le service sera disponible à: `https://clara-backend-production.onrender.com`

---

## 🔧 Configuration Post-Déploiement

### 1. Vérifier le Déploiement

```bash
# Tester l'endpoint health
curl https://clara-backend-production.onrender.com/health
```

### 2. Mettre à Jour le Frontend

Fichier: `src/services/claraApiService.ts`

```typescript
// Remplacer
const API_URL = 'https://hkj0631c.rpcl.app';

// Par
const API_URL = 'https://clara-backend-production.onrender.com';
```

### 3. Configurer les Déploiements Automatiques

Render redéploie automatiquement à chaque push sur `main`.

Pour désactiver:
1. Settings → Build & Deploy
2. Décocher "Auto-Deploy"

---

## ⚙️ Gestion du Service

### Voir les Logs

1. Dashboard Render
2. Sélectionner votre service
3. Onglet "Logs"

Ou via CLI:
```bash
# Installer Render CLI
npm install -g render-cli

# Se connecter
render login

# Voir les logs
render logs clara-backend-production
```

### Redémarrer le Service

1. Dashboard → Service
2. Cliquer sur "Manual Deploy"
3. Sélectionner "Clear build cache & deploy"

### Mettre à Jour les Variables

1. Dashboard → Service
2. Onglet "Environment"
3. Modifier les variables
4. Cliquer sur "Save Changes"
5. Le service redémarre automatiquement

---

## 🚨 Gestion du Cold Start

### Problème

Le service s'endort après 15 minutes d'inactivité.
Premier appel après le sommeil: ~30 secondes de délai.

### Solutions

#### Solution 1: Ping Automatique (Gratuit)

Utiliser un service de monitoring gratuit:

**UptimeRobot** (https://uptimerobot.com):
1. Créer un compte gratuit
2. Ajouter un monitor:
   - Type: HTTP(s)
   - URL: `https://clara-backend-production.onrender.com/health`
   - Interval: 5 minutes
3. Le service reste actif 24/7

**Cron-Job.org** (https://cron-job.org):
1. Créer un compte gratuit
2. Créer un cronjob:
   - URL: `https://clara-backend-production.onrender.com/health`
   - Interval: */5 * * * * (toutes les 5 minutes)

#### Solution 2: Passer au Plan Payant

- **Starter Plan:** $7/mois
- Pas de cold start
- 512 MB RAM
- Toujours actif

---

## 📊 Monitoring

### Métriques Disponibles

Dashboard Render affiche:
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

### Alertes

1. Settings → Notifications
2. Configurer les alertes email pour:
   - Service down
   - High error rate
   - Deploy failures

---

## 🔒 Sécurité

### HTTPS

- Automatiquement activé
- Certificat SSL gratuit
- Renouvellement automatique

### Variables Secrètes

Pour les secrets (API keys, etc.):
1. Environment → Add Secret File
2. Uploader un fichier `.env`
3. Accessible via `/etc/secrets/.env`

---

## 🐛 Dépannage

### Le Build Échoue

**Vérifier:**
1. Logs de build dans Render
2. Dockerfile est correct
3. requirements.txt est à jour

**Solution:**
```bash
# Tester localement
cd py_backend
docker build -t test .
docker run -p 5000:5000 test
```

### Le Service Ne Répond Pas

**Vérifier:**
1. Logs du service
2. Variables d'environnement
3. Port configuré (doit être 5000)

**Solution:**
```bash
# Vérifier les logs
render logs clara-backend-production --tail 100
```

### Erreurs CORS

**Ajouter dans main.py:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://votre-frontend.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 💡 Astuces

### 1. Optimiser le Build

Ajouter un `.dockerignore`:
```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.git
.gitignore
*.md
tests/
```

### 2. Accélérer le Démarrage

Dans `main.py`:
```python
@app.on_event("startup")
async def startup_event():
    # Pré-charger les données
    # Initialiser les connexions
    pass
```

### 3. Logs Structurés

```python
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

---

## 📞 Support

- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

---

## ✅ Checklist Finale

- [ ] Compte Render créé
- [ ] Repository GitHub connecté
- [ ] Service déployé avec succès
- [ ] Variables d'environnement configurées
- [ ] Endpoint /health répond
- [ ] Frontend mis à jour avec la nouvelle URL
- [ ] UptimeRobot configuré (pour éviter cold start)
- [ ] Logs vérifiés
- [ ] Tests effectués

---

## 🎉 Félicitations!

Votre backend est maintenant déployé sur Render.com!

**URL du service:** https://clara-backend-production.onrender.com

**Prochaines étapes:**
1. Mettre à jour le frontend avec la nouvelle URL
2. Configurer UptimeRobot pour éviter les cold starts
3. Tester toutes les fonctionnalités
4. Monitorer les performances

---

**Besoin d'aide?** Consultez la documentation Render ou demandez-moi!
