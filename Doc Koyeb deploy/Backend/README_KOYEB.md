# Déploiement Clara Backend sur Koyeb

## 🎯 Démarrage Rapide

### Option 1 : Script Automatique (Recommandé)

#### Windows (PowerShell)
```powershell
# Depuis la racine du projet
.\deploy-koyeb.ps1 dev
```

#### Linux/Mac (Bash)
```bash
# Depuis la racine du projet
chmod +x deploy-koyeb.sh
./deploy-koyeb.sh dev
```

### Option 2 : Commande Manuelle

```bash
cd py_backend
koyeb deploy . clara-backend/clara-service \
  --archive-builder docker \
  --archive-docker-dockerfile Dockerfile \
  --type WEB \
  --ports 5000:http \
  --routes /:5000 \
  --regions fra \
  --instance-type nano \
  --min-scale 1 \
  --max-scale 1
```

## 📋 Prérequis

1. **Installer Koyeb CLI**

```bash
# Linux/Mac
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh
export PATH=$HOME/.koyeb/bin:$PATH

# Ou via Docker
docker pull koyeb/koyeb-cli:latest
```

2. **S'authentifier**

```bash
koyeb login
```

3. **Configurer les variables d'environnement** (optionnel)

```bash
# Copier le fichier exemple
cp .env.koyeb.example .env

# Éditer .env avec vos valeurs
```

## 🚀 Environnements de Déploiement

### Development (dev)
- Instance: `nano` (gratuit)
- Scale: 1-1
- Région: Frankfurt

```bash
./deploy-koyeb.sh dev
```

### Staging
- Instance: `small`
- Scale: 1-2
- Région: Frankfurt

```bash
./deploy-koyeb.sh staging
```

### Production
- Instance: `medium`
- Scale: 2-4
- Région: Frankfurt

```bash
./deploy-koyeb.sh production
```

## 📊 Gestion du Service

### Vérifier le statut
```bash
koyeb service get clara-backend/clara-service
```

### Voir les logs en temps réel
```bash
koyeb service logs clara-backend/clara-service
```

### Voir les logs de build
```bash
koyeb service logs clara-backend/clara-service --type build
```

### Mettre à jour le service
```bash
cd py_backend
koyeb deploy . clara-backend/clara-service
```

### Redémarrer le service
```bash
koyeb service redeploy clara-backend/clara-service
```

### Supprimer le service
```bash
koyeb service delete clara-backend/clara-service
```

## 🔧 Configuration Avancée

### Variables d'environnement

Les variables suivantes peuvent être configurées :

```bash
# Obligatoires
HOST=0.0.0.0
PORT=5000
PYTHONUNBUFFERED=1

# Optionnelles - LightRAG
OPENAI_API_KEY=sk-...
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password

# Optionnelles - Google Drive
GOOGLE_API_KEY=...

# Optionnelles - N8N
N8N_WEBHOOK_URL=https://...
```

### Ajouter des variables lors du déploiement

```bash
koyeb deploy . clara-backend/clara-service \
  --env OPENAI_API_KEY=sk-... \
  --env NEO4J_URI=neo4j://... \
  --env NEO4J_USERNAME=neo4j \
  --env NEO4J_PASSWORD=...
```

### Modifier les variables d'un service existant

```bash
koyeb service update clara-backend/clara-service \
  --env OPENAI_API_KEY=new-key
```

## 🌐 Accès à l'API

Une fois déployé, votre API sera accessible à :
```
https://clara-backend-[your-org].koyeb.app
```

### Endpoints disponibles

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /docs` - Documentation Swagger UI
- `GET /redoc` - Documentation ReDoc
- `POST /notebooks` - Créer un notebook LightRAG
- `GET /notebooks` - Lister les notebooks
- `POST /notebooks/{id}/documents` - Upload documents
- `POST /notebooks/{id}/query` - Interroger un notebook
- `POST /pandas/analyze` - Analyse de données avec Pandas
- `POST /word/export` - Export Word
- `POST /speech-to-text` - Transcription audio
- `POST /text-to-speech` - Synthèse vocale

## 🔍 Vérification du Déploiement

### Test du health check
```bash
curl https://clara-backend-[your-org].koyeb.app/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "port": 5000,
  "uptime": "0:05:23.456789"
}
```

### Test de l'API
```bash
# Ouvrir dans le navigateur
https://clara-backend-[your-org].koyeb.app/docs
```

## 🛠️ Dépannage

### Le service ne démarre pas

1. Vérifier les logs de build :
```bash
koyeb service logs clara-backend/clara-service --type build
```

2. Vérifier les logs d'exécution :
```bash
koyeb service logs clara-backend/clara-service
```

### Erreur de mémoire

Augmenter la taille de l'instance :
```bash
koyeb service update clara-backend/clara-service \
  --instance-type small
```

### Timeout lors du build

Le build peut prendre du temps (installation de spaCy, etc.). Attendre quelques minutes.

### Port incorrect

Vérifier que le port 5000 est bien exposé :
```bash
koyeb service update clara-backend/clara-service \
  --ports 5000:http
```

## 📈 Monitoring

### Métriques disponibles

- CPU usage
- Memory usage
- Request count
- Response time
- Error rate

Accéder au dashboard Koyeb : https://app.koyeb.com

### Alertes

Configurer des alertes dans le dashboard Koyeb pour :
- High CPU usage
- High memory usage
- Service down
- Error rate threshold

## 💰 Coûts

### Instance nano (gratuit)
- 0.1 vCPU
- 512 MB RAM
- Idéal pour dev/test

### Instance small
- 0.5 vCPU
- 2 GB RAM
- ~$5/mois

### Instance medium
- 1 vCPU
- 4 GB RAM
- ~$15/mois

Voir la tarification complète : https://www.koyeb.com/pricing

## 🔗 Ressources

- [Documentation Koyeb](https://www.koyeb.com/docs)
- [Koyeb CLI Reference](https://www.koyeb.com/docs/build-and-deploy/cli/reference)
- [Dashboard Koyeb](https://app.koyeb.com)
- [Status Koyeb](https://status.koyeb.com)

## ✅ Checklist de Production

Avant de déployer en production :

- [ ] Variables d'environnement configurées
- [ ] API keys sécurisées
- [ ] Instance type appropriée (medium ou large)
- [ ] Min scale >= 2 pour haute disponibilité
- [ ] Health check fonctionnel
- [ ] Logs configurés
- [ ] Monitoring activé
- [ ] Alertes configurées
- [ ] Backup des données configuré
- [ ] Documentation à jour
- [ ] Tests de charge effectués
- [ ] Plan de rollback défini
