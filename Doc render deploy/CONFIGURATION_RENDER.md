# Configuration Render - Backend Python Clara

**Date:** 16 Avril 2026  
**Statut:** Configuration validée et testée

## Configuration Correcte

### Settings de Base

| Paramètre | Valeur | Notes |
|-----------|--------|-------|
| **Root Directory** | VIDE | Ne PAS mettre `py_backend` |
| **Build Command** | `cd py_backend && pip install -r requirements_render.txt` | Utilise requirements_render.txt |
| **Start Command** | `cd py_backend && python main.py --host 0.0.0.0 --port $PORT` | Port dynamique |
| **Runtime** | Python 3 | Version Python par défaut |

### Variables d'Environnement

| Variable | Valeur | Description |
|----------|--------|-------------|
| `PORT` | Automatique | Fourni par Render |

## Fichier requirements_render.txt

Créé spécifiquement pour Render avec pydantic 2.8.2 (au lieu de 2.9.0) pour éviter la compilation Rust.

```txt
# FastAPI et serveur
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-multipart==0.0.12

# PDF
PyPDF2==3.0.1

# Word Export
python-docx>=1.1.0

# Validation - Version compatible sans compilation Rust
pydantic==2.8.2
pydantic-core==2.20.1

# Configuration
python-dotenv==1.0.1

# Data Analysis (Pandas API - Case 10)
pandas>=2.0.0
numpy>=1.24.0
openpyxl>=3.1.0
xlrd>=2.0.1

# HTML Parsing (Agent Pandas)
beautifulsoup4>=4.12.0
```

## Pourquoi Root Directory est VIDE?

Render clone le repository complet. Les commandes `cd py_backend` dans Build et Start permettent de:
1. Naviguer vers le dossier py_backend
2. Installer les dépendances depuis ce dossier
3. Lancer l'application depuis ce dossier

Si on met `py_backend` dans Root Directory, Render cherchera `py_backend/py_backend`, ce qui n'existe pas.

## Déploiement Automatique

Render est configuré pour déployer automatiquement à chaque push sur la branche `master` du repository GitHub:

```
https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git
```

## Vérification du Déploiement

### 1. Logs de Build

Dans le Dashboard Render, vérifier que:
- Le build utilise `requirements_render.txt`
- Toutes les dépendances s'installent correctement
- Pas d'erreur de compilation Rust (grâce à pydantic 2.8.2)

### 2. Logs de Démarrage

Vérifier que:
- L'application démarre sur le port fourni par Render
- Aucune erreur au démarrage
- Le message "Application startup complete" apparaît

### 3. Test de l'Endpoint

```bash
curl https://clara-backend-production.onrender.com/health
```

Réponse attendue:
```json
{
  "status": "healthy",
  "message": "Clara Backend API is running"
}
```

## Problèmes Courants et Solutions

### Problème 1: "Root directory does not exist"

**Cause:** Root Directory configuré avec `py_backend`  
**Solution:** Laisser Root Directory VIDE

### Problème 2: "requirements_render.txt not found"

**Cause:** Le fichier n'existe pas dans le repository GitHub  
**Solution:** Vérifier que le fichier est bien poussé sur GitHub

### Problème 3: Erreur de compilation Rust

**Cause:** pydantic 2.9.0 nécessite la compilation Rust  
**Solution:** Utiliser pydantic 2.8.2 dans requirements_render.txt

### Problème 4: Port binding error

**Cause:** L'application n'utilise pas la variable $PORT  
**Solution:** Vérifier que main.py utilise `--port $PORT`

## Monitoring

### Dashboard Render

URL: https://dashboard.render.com/

Surveiller:
- Status du service (Running/Deploying/Failed)
- Logs en temps réel
- Métriques de performance
- Historique des déploiements

### Alertes

Configurer des alertes pour:
- Échec de déploiement
- Service down
- Erreurs critiques dans les logs

## Mise à Jour

Pour mettre à jour le backend:

1. Modifier le code localement
2. Commiter les changements
3. Pusher sur GitHub (branche master)
4. Render redéploie automatiquement

## Rollback

En cas de problème après un déploiement:

1. Aller sur le Dashboard Render
2. Sélectionner "Deploys" dans le menu
3. Choisir un déploiement précédent
4. Cliquer sur "Redeploy"

## Sécurité

### Variables d'Environnement Sensibles

Ne JAMAIS commiter sur GitHub:
- Clés API
- Credentials OAuth
- Tokens d'authentification
- Mots de passe

Utiliser les Environment Variables de Render pour stocker ces valeurs.

### HTTPS

Render fournit automatiquement HTTPS pour tous les services.

### CORS

Configurer CORS dans main.py pour autoriser uniquement les domaines de confiance.

## Support

- Documentation Render: https://render.com/docs
- Support Render: https://render.com/support
- Community Forum: https://community.render.com/
