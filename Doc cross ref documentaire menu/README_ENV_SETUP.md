# Configuration des Secrets Google OAuth

## Vue d'ensemble

Les secrets Google OAuth sont maintenant gérés via des variables d'environnement pour éviter de les exposer dans le code source.

## Fichiers concernés

- `.env.google-oauth` - Template avec les variables d'environnement
- `GUIDE_CONFIGURATION_OAUTH2_GOOGLE_DRIVE.md` - Référence les variables d'env
- `COMMANDES_TEST_RAPIDE.txt` - Référence les variables d'env
- `GUIDE_IMPORT_WORKFLOW_V2.md` - Référence les variables d'env

## Configuration

### 1. Créer le fichier local

Copiez le template et créez votre fichier local:

```bash
cp .env.google-oauth .env.google-oauth.local
```

### 2. Remplir les credentials

Éditez `.env.google-oauth.local` et remplacez les valeurs:

```env
GOOGLE_OAUTH_CLIENT_ID=votre_client_id_ici
GOOGLE_OAUTH_CLIENT_SECRET=votre_client_secret_ici
GOOGLE_OAUTH_REDIRECT_URL=https://hkj0631c.rpcl.app/rest/oauth2-credential/callback
```

### 3. Charger les variables

#### Pour Node.js/n8n:
```bash
source .env.google-oauth.local
```

#### Pour Python:
```python
import os
from dotenv import load_dotenv

load_dotenv('.env.google-oauth.local')
client_id = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
client_secret = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET')
```

#### Pour n8n:
Dans n8n, utilisez les variables d'environnement directement:
- `${{ env.GOOGLE_OAUTH_CLIENT_ID }}`
- `${{ env.GOOGLE_OAUTH_CLIENT_SECRET }}`

## Sécurité

✅ Le fichier `.env.google-oauth.local` est dans `.gitignore`
✅ Les secrets ne sont jamais commitées dans Git
✅ Les fichiers de documentation référencent les variables d'env, pas les secrets réels

## Fichiers à ignorer

Assurez-vous que `.gitignore` contient:
```
.env
.env.local
.env.*.local
.env.google-oauth.local
```

## Prochaines étapes

1. Créez `.env.google-oauth.local` avec vos credentials
2. Chargez les variables avant de lancer n8n ou votre application
3. Les fichiers de documentation utiliseront automatiquement les variables d'env
