# 🚀 Déploiement Clara Backend sur Koyeb

> Déployez votre backend Python FastAPI sur Koyeb en quelques minutes !

## ⚡ Démarrage Ultra-Rapide

### 1. Installer Koyeb CLI
```bash
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh
export PATH=$HOME/.koyeb/bin:$PATH
```

### 2. Se Connecter
```bash
koyeb login
```

### 3. Déployer

**Windows PowerShell :**
```powershell
.\deploy-koyeb.ps1 dev
```

**Linux/Mac Bash :**
```bash
chmod +x deploy-koyeb.sh
./deploy-koyeb.sh dev
```

### 4. Vérifier
```bash
curl https://clara-backend-[your-org].koyeb.app/health
```

## 📚 Documentation

| Document | Description | Niveau |
|----------|-------------|--------|
| **[DEMARRAGE_RAPIDE_KOYEB.md](./DEMARRAGE_RAPIDE_KOYEB.md)** | Déploiement en 5 minutes | Débutant |
| **[GUIDE_DEPLOIEMENT_KOYEB.md](./GUIDE_DEPLOIEMENT_KOYEB.md)** | Guide complet détaillé | Tous |
| **[COMMANDES_KOYEB.txt](./COMMANDES_KOYEB.txt)** | Référence des commandes | Intermédiaire |
| **[SYNTHESE_DEPLOIEMENT_KOYEB.md](./SYNTHESE_DEPLOIEMENT_KOYEB.md)** | Vue d'ensemble | Tous |
| **[INDEX_DEPLOIEMENT_KOYEB.md](./INDEX_DEPLOIEMENT_KOYEB.md)** | Navigation | Tous |
| **[py_backend/README_KOYEB.md](./py_backend/README_KOYEB.md)** | Documentation backend | Intermédiaire |

## 🔧 Scripts Disponibles

### Déploiement
- `deploy-koyeb.sh` - Script Bash (Linux/Mac)
- `deploy-koyeb.ps1` - Script PowerShell (Windows)

### Vérification
- `check-koyeb-ready.sh` - Vérification pré-déploiement (Linux/Mac)
- `check-koyeb-ready.ps1` - Vérification pré-déploiement (Windows)

## 🎯 Environnements

### Development (dev)
```bash
./deploy-koyeb.sh dev
```
- Instance : nano (gratuit)
- Scale : 1-1
- Idéal pour : Tests et développement

### Staging
```bash
./deploy-koyeb.sh staging
```
- Instance : small (~$5/mois)
- Scale : 1-2
- Idéal pour : Tests pré-production

### Production
```bash
./deploy-koyeb.sh production
```
- Instance : medium (~$30/mois)
- Scale : 2-4
- Idéal pour : Production avec haute disponibilité

## 📊 API Endpoints

Une fois déployé :

### Core
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /docs` - Documentation Swagger UI
- `GET /redoc` - Documentation ReDoc

### LightRAG Notebooks
- `POST /notebooks` - Créer un notebook
- `GET /notebooks` - Lister les notebooks
- `POST /notebooks/{id}/documents` - Upload documents
- `POST /notebooks/{id}/query` - Interroger un notebook

### Pandas API
- `POST /pandas/analyze` - Analyse de données
- `POST /pandas/agent` - Agent Pandas avec LLM

### Autres Services
- `POST /word/export` - Export Word
- `POST /speech-to-text` - Transcription audio
- `POST /text-to-speech` - Synthèse vocale

## 🛠️ Commandes Utiles

### Gestion
```bash
# Voir le statut
koyeb service get clara-backend/clara-service

# Voir les logs
koyeb service logs clara-backend/clara-service

# Mettre à jour
koyeb service update clara-backend/clara-service --instance-type small

# Redémarrer
koyeb service redeploy clara-backend/clara-service
```

### Scaling
```bash
# Scaler le service
koyeb service update clara-backend/clara-service \
  --min-scale 2 \
  --max-scale 4
```

### Variables d'environnement
```bash
# Ajouter une variable
koyeb service update clara-backend/clara-service \
  --env NEW_VAR=value
```

## 💰 Coûts

| Environnement | Instance | Coût/mois | Usage |
|---------------|----------|-----------|-------|
| Development | nano | **GRATUIT** | Tests |
| Staging | small | ~$5 | Pré-production |
| Production | medium (x2) | ~$30 | Production |

## ✅ Checklist

### Avant de Déployer
- [ ] Koyeb CLI installé
- [ ] Authentifié (`koyeb login`)
- [ ] Variables d'environnement configurées (optionnel)
- [ ] Vérification effectuée (`check-koyeb-ready.sh`)

### Après le Déploiement
- [ ] Service démarré
- [ ] Health check OK
- [ ] API accessible
- [ ] Documentation testée

## 🆘 Dépannage

### Le service ne démarre pas
```bash
# Voir les logs de build
koyeb service logs clara-backend/clara-service --type build

# Voir les logs d'exécution
koyeb service logs clara-backend/clara-service
```

### Erreur de mémoire
```bash
# Augmenter la taille de l'instance
koyeb service update clara-backend/clara-service \
  --instance-type small
```

### Plus d'aide
- [Guide de Dépannage](./GUIDE_DEPLOIEMENT_KOYEB.md#dépannage)
- [Documentation Koyeb](https://www.koyeb.com/docs)
- [Support Koyeb](https://www.koyeb.com/support)

## 🔗 Liens Utiles

### Documentation
- [Index de Navigation](./INDEX_DEPLOIEMENT_KOYEB.md)
- [Travail Accompli](./TRAVAIL_ACCOMPLI_KOYEB.md)

### Koyeb
- [Dashboard](https://app.koyeb.com)
- [Documentation](https://www.koyeb.com/docs)
- [CLI Reference](https://www.koyeb.com/docs/build-and-deploy/cli/reference)
- [Status](https://status.koyeb.com)

## 🎉 Prêt à Déployer !

Choisissez votre point de départ :

1. **Rapide** → [DEMARRAGE_RAPIDE_KOYEB.md](./DEMARRAGE_RAPIDE_KOYEB.md)
2. **Complet** → [GUIDE_DEPLOIEMENT_KOYEB.md](./GUIDE_DEPLOIEMENT_KOYEB.md)
3. **Navigation** → [INDEX_DEPLOIEMENT_KOYEB.md](./INDEX_DEPLOIEMENT_KOYEB.md)

---

**Version** : 1.0.0  
**Date** : 2 mars 2026  
**Statut** : ✅ Prêt pour déploiement
