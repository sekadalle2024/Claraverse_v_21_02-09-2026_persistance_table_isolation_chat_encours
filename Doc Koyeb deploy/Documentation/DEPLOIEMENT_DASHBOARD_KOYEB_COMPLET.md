# 🌐 Déploiement du Backend via Dashboard Koyeb

> Guide complet pour déployer le backend Python sans utiliser la CLI

## 🎯 Pourquoi le Dashboard ?

- ✅ Pas besoin d'installer de CLI
- ✅ Interface visuelle intuitive
- ✅ Même résultat que le déploiement CLI
- ✅ Fonctionne sur tous les systèmes

---

## 📋 Prérequis

1. **Compte Koyeb** : Créez un compte sur [koyeb.com](https://www.koyeb.com)
2. **Projet prêt** : Votre dossier `py_backend` avec :
   - `main.py`
   - `Dockerfile`
   - `requirements.txt`

---

## 🚀 Étapes de Déploiement

### Étape 1 : Créer un Compte Koyeb

1. Allez sur https://www.koyeb.com
2. Cliquez sur "Sign Up"
3. Créez votre compte (email + mot de passe ou GitHub)
4. Vérifiez votre email

### Étape 2 : Accéder au Dashboard

1. Connectez-vous sur https://app.koyeb.com
2. Vous arrivez sur le Dashboard principal

### Étape 3 : Créer une Nouvelle Application

1. Cliquez sur **"Create App"** ou **"New Service"**
2. Choisissez la méthode de déploiement : **"Docker"**

### Étape 4 : Configurer le Déploiement

#### Option A : Depuis GitHub (Recommandé)

1. **Connecter GitHub** :
   - Cliquez sur "GitHub"
   - Autorisez Koyeb à accéder à vos repos
   - Sélectionnez votre repository Clara

2. **Configuration** :
   - **Branch** : `main` (ou votre branche principale)
   - **Build directory** : `py_backend`
   - **Dockerfile** : `Dockerfile`

3. **Paramètres du Service** :
   - **Service name** : `clara-backend`
   - **App name** : `clara-backend`
   - **Region** : `Frankfurt (fra)` (Europe)
   - **Instance type** : `nano` (gratuit pour commencer)

4. **Port** :
   - **Port** : `5000`
   - **Protocol** : `HTTP`

5. **Variables d'environnement** (optionnel) :
   ```
   HOST=0.0.0.0
   PORT=5000
   PYTHONUNBUFFERED=1
   ```

6. Cliquez sur **"Deploy"**

#### Option B : Upload Direct (Alternative)

Si vous n'avez pas GitHub :

1. **Préparer l'archive** :
   ```powershell
   # Créer une archive du dossier py_backend
   Compress-Archive -Path py_backend\* -DestinationPath backend.zip
   ```

2. **Upload sur Koyeb** :
   - Choisissez "Archive"
   - Uploadez `backend.zip`
   - Configurez comme ci-dessus

---

## ⚙️ Configuration Détaillée

### Variables d'Environnement

Ajoutez ces variables dans la section "Environment variables" :

```
HOST=0.0.0.0
PORT=5000
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
```

Variables optionnelles (pour LightRAG, etc.) :
```
OPENAI_API_KEY=votre-cle-api
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
```

### Scaling

- **Min instances** : `1`
- **Max instances** : `1` (dev) ou `2-4` (production)

### Health Check

Koyeb vérifie automatiquement `/health` endpoint.

---

## 📊 Suivi du Déploiement

### Pendant le Build

1. Allez dans l'onglet **"Deployments"**
2. Cliquez sur le déploiement en cours
3. Consultez les **logs de build** en temps réel

### Vérifier le Statut

1. Le service passe par ces états :
   - 🟡 **Building** : Construction de l'image Docker
   - 🟡 **Deploying** : Déploiement en cours
   - 🟢 **Healthy** : Service opérationnel
   - 🔴 **Unhealthy** : Problème détecté

2. Une fois **Healthy**, votre API est accessible !

---

## 🌐 Accéder à votre API

### URL de l'API

Votre API sera accessible à :
```
https://clara-backend-[your-org].koyeb.app
```

L'URL exacte est affichée dans le Dashboard.

### Tester l'API

1. **Health Check** :
   ```
   https://clara-backend-[your-org].koyeb.app/health
   ```

2. **Documentation Swagger** :
   ```
   https://clara-backend-[your-org].koyeb.app/docs
   ```

3. **Documentation ReDoc** :
   ```
   https://clara-backend-[your-org].koyeb.app/redoc
   ```

---

## 🔧 Gestion du Service

### Voir les Logs

1. Allez dans votre service
2. Cliquez sur l'onglet **"Logs"**
3. Filtrez par type :
   - **Runtime logs** : Logs d'exécution
   - **Build logs** : Logs de construction

### Redémarrer le Service

1. Allez dans **"Settings"**
2. Cliquez sur **"Redeploy"**

### Mettre à Jour

Si vous avez connecté GitHub :
- Chaque push sur la branche déclenchera un nouveau déploiement automatique

Sinon :
- Uploadez une nouvelle archive
- Ou cliquez sur "Redeploy"

### Scaler le Service

1. Allez dans **"Settings"**
2. Section **"Scaling"**
3. Modifiez :
   - **Instance type** : nano → small → medium
   - **Min/Max instances** : 1-1 → 2-4

### Ajouter des Variables

1. Allez dans **"Settings"**
2. Section **"Environment variables"**
3. Cliquez sur **"Add variable"**
4. Entrez nom et valeur
5. Cliquez sur **"Save"**
6. Le service redémarre automatiquement

---

## 🛠️ Dépannage

### Le Build Échoue

1. **Vérifier les logs de build** :
   - Onglet "Deployments" → Cliquez sur le déploiement → "Build logs"

2. **Problèmes courants** :
   - `Dockerfile` introuvable → Vérifiez le chemin
   - Erreur dans `requirements.txt` → Vérifiez les dépendances
   - Timeout → Augmentez la taille de l'instance

### Le Service ne Démarre Pas

1. **Vérifier les logs runtime** :
   - Onglet "Logs" → "Runtime logs"

2. **Problèmes courants** :
   - Port incorrect → Vérifiez que le port est 5000
   - Variables manquantes → Ajoutez les variables nécessaires
   - Erreur Python → Vérifiez les logs pour l'erreur exacte

### L'API n'est pas Accessible

1. **Vérifier le statut** :
   - Le service doit être "Healthy" (vert)

2. **Vérifier l'URL** :
   - Copiez l'URL exacte depuis le Dashboard

3. **Tester le health check** :
   ```
   curl https://clara-backend-[your-org].koyeb.app/health
   ```

---

## 💰 Coûts

### Instance Nano (Gratuit)
- 0.1 vCPU
- 512 MB RAM
- Parfait pour dev/test

### Instance Small (~$5/mois)
- 0.5 vCPU
- 2 GB RAM
- Bon pour staging

### Instance Medium (~$15/mois)
- 1 vCPU
- 4 GB RAM
- Production

---

## 📈 Monitoring

### Métriques Disponibles

Dans le Dashboard, vous pouvez voir :
- **CPU usage** : Utilisation du processeur
- **Memory usage** : Utilisation de la mémoire
- **Request count** : Nombre de requêtes
- **Response time** : Temps de réponse
- **Error rate** : Taux d'erreur

### Alertes

1. Allez dans **"Settings"**
2. Section **"Alerts"**
3. Configurez des alertes pour :
   - CPU élevé
   - Mémoire élevée
   - Service down
   - Taux d'erreur élevé

---

## 🔐 Sécurité

### Secrets

Pour les API keys sensibles :

1. Allez dans **"Secrets"** (menu principal)
2. Cliquez sur **"Create secret"**
3. Entrez nom et valeur
4. Dans votre service, référencez le secret :
   - Variable : `OPENAI_API_KEY`
   - Valeur : `@openai-key` (référence au secret)

### HTTPS

- HTTPS est automatiquement activé
- Certificat SSL gratuit
- Renouvellement automatique

---

## 🎯 Checklist de Déploiement

### Avant de Déployer
- [ ] Compte Koyeb créé
- [ ] Repository GitHub prêt (ou archive préparée)
- [ ] `Dockerfile` vérifié
- [ ] `requirements.txt` à jour
- [ ] Variables d'environnement listées

### Pendant le Déploiement
- [ ] Configuration correcte
- [ ] Build réussi
- [ ] Service démarré

### Après le Déploiement
- [ ] Service "Healthy"
- [ ] Health check OK
- [ ] API accessible
- [ ] Documentation accessible (/docs)
- [ ] Endpoints testés

---

## 🔗 Liens Utiles

- **Dashboard** : https://app.koyeb.com
- **Documentation** : https://www.koyeb.com/docs
- **Status** : https://status.koyeb.com
- **Support** : https://www.koyeb.com/support

---

## 📝 Exemple Complet

### Configuration Minimale

```yaml
Service Name: clara-backend
App Name: clara-backend
Region: Frankfurt (fra)
Instance Type: nano
Port: 5000
Protocol: HTTP

Environment Variables:
  HOST: 0.0.0.0
  PORT: 5000
  PYTHONUNBUFFERED: 1

Build:
  Method: Docker
  Dockerfile: Dockerfile
  Context: py_backend
```

### URL Finale

```
https://clara-backend-[your-org].koyeb.app
```

### Endpoints Disponibles

```
GET  /                    → Root
GET  /health              → Health check
GET  /docs                → Swagger UI
GET  /redoc               → ReDoc
POST /notebooks           → Créer notebook
GET  /notebooks           → Lister notebooks
POST /pandas/analyze      → Analyse Pandas
POST /word/export         → Export Word
POST /speech-to-text      → Transcription
POST /text-to-speech      → Synthèse vocale
```

---

## ✅ Résultat Final

Une fois déployé, vous aurez :

✅ Backend Python accessible publiquement  
✅ HTTPS automatique  
✅ Scaling automatique  
✅ Logs en temps réel  
✅ Monitoring intégré  
✅ Déploiement continu (si GitHub connecté)  

---

**Version** : 1.0.0  
**Date** : 2 mars 2026  
**Méthode** : Dashboard Koyeb (sans CLI)
