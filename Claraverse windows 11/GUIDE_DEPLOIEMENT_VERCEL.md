# Guide de Déploiement Vercel - ClaraVerse

## 🚀 Déploiement via CLI

### Prérequis
```bash
npm install -g vercel
```

### Étapes

1. **Se connecter à Vercel**
```bash
vercel login
```

2. **Déployer en preview**
```bash
vercel
```

3. **Déployer en production**
```bash
vercel --prod
```

## 📁 Structure du projet pour Vercel

```
├── api/
│   ├── index.py          # Serverless Function Python (FastAPI)
│   └── requirements.txt  # Dépendances Python
├── dist/                 # Build React (généré par npm run build)
├── vercel.json          # Configuration Vercel
└── .vercelignore        # Fichiers à ignorer
```

## ⚙️ Configuration

Le fichier `vercel.json` configure :
- Build du frontend React/Vite
- API Python via Serverless Functions
- Headers CORS pour WebContainers
- Rewrites pour SPA routing

## 🔧 Variables d'environnement

Dans le dashboard Vercel, ajouter si nécessaire :
- `GOOGLE_CLIENT_ID` - Pour Google Drive
- `GOOGLE_CLIENT_SECRET` - Pour Google Drive

## ⚠️ Limitations Vercel Serverless

- Timeout max : 60 secondes (plan gratuit)
- Mémoire : 1024 MB configuré
- Pas de persistance fichiers (utiliser stockage externe)

## 🐳 Alternative Docker

Ce projet reste 100% compatible Docker :
```bash
docker-compose up -d
```

Les fichiers Vercel sont ignorés par Docker.
