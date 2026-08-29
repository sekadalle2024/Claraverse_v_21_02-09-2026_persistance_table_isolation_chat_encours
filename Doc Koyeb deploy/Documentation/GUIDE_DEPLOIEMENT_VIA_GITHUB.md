# Guide de Déploiement Koyeb via Github

## Vue d'ensemble

Le backend Clara est déployé sur Koyeb via une intégration Github. Chaque push sur la branche `main` du repository déclenche automatiquement un nouveau déploiement.

## Configuration actuelle

### Service Koyeb
- **Nom**: `back-end-python-v0-03-03-2026`
- **Type**: WEB Service
- **URL**: https://proud-del-saasauditnterne-9f15de46.koyeb.app/

### Repository Github
- **URL**: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
- **Branche**: `main`
- **Auto-deploy**: Activé (chaque push déclenche un déploiement)

## Workflow de déploiement

### 1. Développement local

```bash
# Naviguer vers le dossier backend
cd py_backend

# Faire vos modifications
# Tester localement avec:
python -m uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

### 2. Synchroniser avec le repository Github

Le code local (dans `py_backend/`) doit être synchronisé avec le repository Github séparé.

```bash
# Option A: Copier manuellement les fichiers vers le repository Github
# 1. Copier le contenu de py_backend/ vers le dossier du repository Github
# 2. Commit et push depuis le repository Github

# Option B: Utiliser un script de synchronisation
# Voir: Doc Koyeb deploy/Scripts/sync-to-github-backend.ps1
```

### 3. Push vers Github

```bash
# Dans le dossier du repository Github
cd /path/to/Back-end-python-V0_03_03_2026

git add .
git commit -m "Description des modifications"
git push origin main
```

### 4. Déploiement automatique

Koyeb détecte automatiquement le push et:
1. Clone le repository
2. Build l'image Docker avec le Dockerfile
3. Déploie la nouvelle version
4. Effectue un health check
5. Bascule le trafic vers la nouvelle version

## Structure du repository Github

Le repository Github doit contenir:

```
Back-end-python-V0_03_03_2026/
├── Dockerfile                    # Configuration Docker
├── requirements.txt              # Dépendances Python
├── main.py                       # Point d'entrée FastAPI
├── .env.example                  # Template variables d'environnement
├── README.md                     # Documentation
└── ... (autres fichiers backend)
```

### Dockerfile requis

Le Dockerfile doit être à la racine et configurer correctement l'application:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
```

## Configuration Koyeb

### Variables d'environnement

Configurées dans le dashboard Koyeb (région: fra):

```
HOST=0.0.0.0
PORT=5000
PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1
```

### Scaling

- **Min instances**: 0 (sleep mode après inactivité)
- **Max instances**: 1
- **Sleep delay**: 3900 secondes (65 minutes)

### Health Check

- **Type**: TCP
- **Port**: 5000
- **Grace period**: 5 secondes
- **Interval**: 30 secondes
- **Timeout**: 5 secondes

## Surveillance du déploiement

### Via Dashboard Koyeb

1. Aller sur https://app.koyeb.com
2. Sélectionner le service `back-end-python-v0-03-03-2026`
3. Onglets disponibles:
   - **Overview**: Statut général, URL, derniers déploiements
   - **Metrics**: CPU, mémoire, requêtes
   - **Console**: Logs en temps réel
   - **Settings**: Configuration du service

### Via CLI Koyeb (optionnel)

```bash
# Installer la CLI (si nécessaire)
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh
export PATH="$HOME/.koyeb/bin:$PATH"

# Se connecter
koyeb login

# Voir le statut
koyeb service get back-end-python-v0-03-03-2026

# Voir les logs en temps réel
koyeb service logs back-end-python-v0-03-03-2026 --follow

# Voir les logs de build
koyeb service logs back-end-python-v0-03-03-2026 --type build
```

## Redéploiement manuel

### Via Dashboard

1. Aller sur https://app.koyeb.com
2. Sélectionner le service
3. Cliquer sur le bouton vert "Redeploy" en haut à droite
4. Confirmer

### Via CLI

```bash
koyeb service redeploy back-end-python-v0-03-03-2026
```

## Gestion des branches

### Branche de développement (recommandé)

Pour éviter des déploiements automatiques à chaque commit pendant le développement:

```bash
# Créer une branche de développement
git checkout -b develop

# Travailler sur develop
git add .
git commit -m "Work in progress"
git push origin develop

# Quand prêt, merger vers main
git checkout main
git merge develop
git push origin main  # Déclenche le déploiement
```

### Désactiver l'auto-deploy (optionnel)

Dans les settings du service Koyeb:
- Aller dans Settings > Git
- Cocher "Disable automatic deployments"
- Sauvegarder

## Troubleshooting

### Le déploiement échoue

1. **Vérifier les logs de build**:
   ```bash
   koyeb service logs back-end-python-v0-03-03-2026 --type build
   ```

2. **Vérifier le Dockerfile**:
   - Est-il présent à la racine du repository?
   - Build-t-il correctement en local?
   ```bash
   docker build -t test-backend .
   docker run -p 5000:5000 test-backend
   ```

3. **Vérifier requirements.txt**:
   - Toutes les dépendances sont-elles listées?
   - Les versions sont-elles compatibles?

### L'instance ne démarre pas

1. **Vérifier les logs d'application**:
   ```bash
   koyeb service logs back-end-python-v0-03-03-2026 --follow
   ```

2. **Vérifier le port**:
   - L'application écoute-t-elle sur 0.0.0.0:5000?
   - Le port est-il exposé dans le Dockerfile?

3. **Vérifier les variables d'environnement**:
   - Sont-elles correctement configurées dans Koyeb?
   - L'application les utilise-t-elle correctement?

### L'instance s'endort (sleep mode)

C'est normal avec l'instance free:
- L'instance s'endort après 65 minutes d'inactivité
- Premier appel après le sleep: ~30-60 secondes de latence
- Appels suivants: latence normale

Solutions:
- Passer à une instance payante (nano, small, etc.)
- Accepter le sleep mode pour un environnement de développement
- Mettre en place un ping régulier (attention aux coûts)

## Synchronisation py_backend ↔ Github

### Script de synchronisation

Créer un script pour synchroniser automatiquement:

```powershell
# sync-to-github-backend.ps1
$SOURCE = "py_backend"
$DEST = "C:\path\to\Back-end-python-V0_03_03_2026"

# Copier les fichiers
Copy-Item -Path "$SOURCE\*" -Destination $DEST -Recurse -Force

# Commit et push
cd $DEST
git add .
git commit -m "Sync from local py_backend"
git push origin main
```

### Workflow recommandé

1. Développer dans `py_backend/` (projet principal)
2. Tester localement
3. Synchroniser vers le repository Github
4. Push vers Github → déploiement automatique

## Bonnes pratiques

### 1. Tester avant de push

```bash
# Tester localement
cd py_backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 5000

# Tester le build Docker
docker build -t test-backend .
docker run -p 5000:5000 test-backend
```

### 2. Utiliser des branches

- `main`: Production (déploiement automatique)
- `develop`: Développement
- `feature/*`: Nouvelles fonctionnalités

### 3. Versionner les déploiements

```bash
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

### 4. Surveiller les logs

Après chaque déploiement, vérifier les logs:
```bash
koyeb service logs back-end-python-v0-03-03-2026 --follow
```

### 5. Endpoint de santé

Ajouter un endpoint `/health` dans FastAPI:

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
```

## Coûts

### Instance Free (actuelle)
- **Prix**: Gratuit
- **Limitations**:
  - Sleep après 65 minutes d'inactivité
  - 1 instance maximum
  - Ressources limitées

### Upgrade vers instance payante

Pour éviter le sleep mode:
- **Nano**: ~$5/mois
- **Small**: ~$10/mois
- **Medium**: ~$20/mois

Modifier dans Settings > Instance type

## Liens utiles

- **Dashboard**: https://app.koyeb.com
- **Service**: https://app.koyeb.com/services/back-end-python-v0-03-03-2026
- **API URL**: https://proud-del-saasauditnterne-9f15de46.koyeb.app/
- **Repository**: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026
- **Documentation Koyeb**: https://www.koyeb.com/docs
