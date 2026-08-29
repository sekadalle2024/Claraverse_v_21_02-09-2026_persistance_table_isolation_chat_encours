# 📦 Documentation Déploiement Docker Compose sur Zeabur

**Date de création:** 20 Avril 2026  
**Dernière mise à jour:** 20 Avril 2026 - Correction erreurs déploiement  
**Objectif:** Déployer Claraverse (Frontend + Backend) via Docker Compose sur Zeabur

---

## ⚡ CORRECTION EN COURS (20 Avril 2026)

> **🚨 IMPORTANT:** Des erreurs de déploiement ont été identifiées et corrigées.
> 
> **📖 LIRE EN PREMIER:** [START_HERE_DEPLOIEMENT_ZEABUR.txt](../START_HERE_DEPLOIEMENT_ZEABUR.txt) (à la racine)
> 
> **Action immédiate:** Lire [START_HERE_20_AVRIL_2026.txt](./START_HERE_20_AVRIL_2026.txt)
> 
> **Guide complet:** [QUICK_FIX_DEPLOIEMENT_20_AVRIL_2026.txt](./QUICK_FIX_DEPLOIEMENT_20_AVRIL_2026.txt)

### Problèmes Identifiés et Solutions

- ✅ **Frontend:** Erreur nginx "events directive" → Fichier nginx.conf supprimé
- ⚠️ **Backend:** Configuration service incorrecte → **À corriger dans Zeabur Dashboard**
  - **Problème:** Service Name = "frontend" au lieu de "backend"
  - **Solution:** Modifier dans Settings → Service Name → "backend"
  - **Temps:** 2 minutes

---

## 🎯 Vue d'Ensemble

Cette documentation complète vous guide pour déployer votre application Claraverse en utilisant Docker Compose, avec un workflow de développement continu entre environnement local et production Zeabur.

### Problématique Résolue

- ✅ Synchronisation automatique entre développement local et production
- ✅ Déploiement atomique Frontend + Backend
- ✅ Switch backend dynamique préservé
- ✅ Workflow simplifié (git push → déploiement automatique)

---

## 📚 Documentation

### 🚨 Documents de Correction (20 Avril 2026)

| Document | Description | Priorité |
|----------|-------------|----------|
| [START_HERE_20_AVRIL_2026.txt](./START_HERE_20_AVRIL_2026.txt) | Action immédiate | ⭐⭐⭐ |
| [QUICK_FIX_DEPLOIEMENT_20_AVRIL_2026.txt](./QUICK_FIX_DEPLOIEMENT_20_AVRIL_2026.txt) | Guide rapide (12 min) | ⭐⭐⭐ |
| [00_LIRE_MAINTENANT_CORRECTION_20_AVRIL_2026.txt](./00_LIRE_MAINTENANT_CORRECTION_20_AVRIL_2026.txt) | Vue d'ensemble | ⭐⭐⭐ |
| [00_INDEX_CORRECTION_DEPLOIEMENT_20_AVRIL_2026.md](./00_INDEX_CORRECTION_DEPLOIEMENT_20_AVRIL_2026.md) | Index complet | ⭐⭐ |
| [00_CORRECTION_NGINX_CONF_20_AVRIL_2026.txt](./00_CORRECTION_NGINX_CONF_20_AVRIL_2026.txt) | Détails frontend | ⭐⭐ |
| [00_ANALYSE_ERREUR_BACKEND_20_AVRIL_2026.txt](./00_ANALYSE_ERREUR_BACKEND_20_AVRIL_2026.txt) | Détails backend | ⭐⭐ |

### Documents Principaux

| Document | Description | Temps de lecture |
|----------|-------------|------------------|
| [00_COMMENCER_ICI.txt](./00_COMMENCER_ICI.txt) | Point d'entrée, vue d'ensemble | 5 min |
| [00_ANALYSE_SITUATION_ACTUELLE.md](./00_ANALYSE_SITUATION_ACTUELLE.md) | Contexte et problèmes identifiés | 15 min |
| [01_HYPOTHESES_SOLUTIONS.md](./01_HYPOTHESES_SOLUTIONS.md) | Analyse des 3 options + recommandation | 20 min |
| [02_SOLUTION_DOCKER_COMPOSE_ZEABUR.md](./02_SOLUTION_DOCKER_COMPOSE_ZEABUR.md) | Solution technique détaillée | 30 min |
| [04_GUIDE_IMPLEMENTATION.md](./04_GUIDE_IMPLEMENTATION.md) | Guide pratique étape par étape | 45 min |

### Scripts d'Automatisation

| Script | Description | Usage |
|--------|-------------|-------|
| **[push-correction-nginx-zeabur.ps1](./Scripts/push-correction-nginx-zeabur.ps1)** | **Push corrections Zeabur** | `.\Doc zeabur docker\Scripts\push-correction-nginx-zeabur.ps1` |
| [create-docker-compose.ps1](./Scripts/create-docker-compose.ps1) | Génère docker-compose.yml | `.\Scripts\create-docker-compose.ps1` |
| [test-docker-local.ps1](./Scripts/test-docker-local.ps1) | Teste le déploiement local | `.\Scripts\test-docker-local.ps1` |

---

## 🚀 Démarrage Rapide (15 minutes)

### Prérequis

- Docker Desktop installé et démarré
- Git configuré
- Compte Zeabur avec accès GitHub

### Étapes Rapides

```powershell
# 1. Créer les fichiers de configuration
.\Doc zeabur docker\Scripts\create-docker-compose.ps1

# 2. Tester localement
.\Doc zeabur docker\Scripts\test-docker-local.ps1

# 3. Valider le fonctionnement
# Ouvrir http://localhost:3000 dans le navigateur

# 4. Déployer sur Zeabur
git add docker-compose.yml Dockerfile.frontend
git commit -m "feat: ajout Docker Compose pour Zeabur"
git push origin main

# 5. Configurer Zeabur (voir guide détaillé)
```

---

## 📋 Architecture

### Développement Local

```
┌─────────────────────────────────────────┐
│  docker-compose up -d                   │
├─────────────────────────────────────────┤
│  Frontend (React)                       │
│  └─ http://localhost:3000               │
│                                          │
│  Backend (Python/FastAPI)               │
│  └─ http://localhost:5000               │
│                                          │
│  Switch: http://localhost:5000          │
└─────────────────────────────────────────┘
```

### Production Zeabur

```
┌─────────────────────────────────────────┐
│  Auto-deploy depuis GitHub              │
├─────────────────────────────────────────┤
│  Frontend (Nginx)                       │
│  └─ https://prclaravi.zeabur.app        │
│                                          │
│  Backend (Uvicorn)                      │
│  └─ https://pybackend.zeabur.app        │
│                                          │
│  Switch: https://pybackend.zeabur.app   │
└─────────────────────────────────────────┘
```

---

## 🔑 Points Clés

### ✅ Avantages de la Solution

1. **Stack Unifiée**
   - Frontend + Backend sur la même plateforme
   - Déploiement atomique
   - Configuration centralisée

2. **Workflow Simplifié**
   - Développement local identique à production
   - Tests fiables
   - Déploiement automatique via GitHub

3. **Switch Backend Préservé**
   - Détection automatique de l'environnement
   - Pas de modification de code nécessaire
   - Compatible Docker

4. **Portabilité**
   - Facile à migrer vers autre plateforme
   - Pas de vendor lock-in
   - Configuration standard Docker

### ⚠️ Points d'Attention

1. **Coût Zeabur**
   - 2 services = 2x ressources
   - Vérifier le plan tarifaire
   - Optimiser les images Docker

2. **Configuration CORS**
   - Bien configurer les origines autorisées
   - Exposer les headers nécessaires
   - Tester en production

3. **Monitoring**
   - Surveiller les logs
   - Configurer des alertes
   - Vérifier les métriques

---

## 📊 Comparaison des Options

| Critère | Option 1<br>(Backend Zeabur) | Option 2<br>(Switch Dynamique) | Option 3<br>(Docker Compose) | **Option 3+**<br>(Recommandée) |
|---------|------------------------------|--------------------------------|------------------------------|--------------------------------|
| Simplicité | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Fiabilité | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Flexibilité | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Coût | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Scalabilité | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **TOTAL** | **16/25** | **20/25** | **21/25** | **23/25** |

---

## 🛠️ Commandes Utiles

### Développement Local

```powershell
# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose stop

# Redémarrer
docker-compose restart

# Tout supprimer
docker-compose down -v
```

### Tests

```powershell
# Test backend
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000/health

# Ouvrir l'application
Start-Process "http://localhost:3000"
```

### Déploiement

```powershell
# Commit et push
git add .
git commit -m "feat: mise à jour"
git push origin main

# Zeabur déploie automatiquement
```

---

## 📞 Support

### Problèmes Courants

1. **Build échoue**
   - Vérifier les logs: `docker-compose build --no-cache --progress=plain`
   - Vérifier les dépendances

2. **Services ne démarrent pas**
   - Vérifier les ports: `netstat -ano | findstr "3000"`
   - Vérifier les logs: `docker-compose logs`

3. **CORS errors**
   - Vérifier la configuration CORS dans docker-compose.yml
   - Vérifier les headers: `curl -v -X OPTIONS ...`

### Ressources

- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation Zeabur](https://zeabur.com/docs)
- [Guide FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)

---

## 📝 Changelog

### Version 1.1.0 (20 Avril 2026) - Correction Déploiement

- ✅ Identification et correction erreur nginx frontend
- ✅ Analyse erreur configuration backend
- ✅ Création documentation de correction complète
- ✅ Script automatique de push des corrections
- ✅ Guide rapide de résolution (12 minutes)

### Version 1.0.0 (20 Avril 2026)

- ✅ Création de la documentation complète
- ✅ Analyse des 3 options de déploiement
- ✅ Solution Docker Compose détaillée
- ✅ Scripts d'automatisation PowerShell
- ✅ Guide d'implémentation étape par étape
- ✅ Préservation du switch backend dynamique

---

## 🎯 Prochaines Étapes

1. Lire [00_COMMENCER_ICI.txt](./00_COMMENCER_ICI.txt)
2. Suivre [04_GUIDE_IMPLEMENTATION.md](./04_GUIDE_IMPLEMENTATION.md)
3. Exécuter les scripts de test
4. Déployer sur Zeabur
5. Valider en production

---

**Bonne chance avec votre déploiement! 🚀**

Pour toute question, consultez la documentation détaillée ou les scripts d'automatisation.
