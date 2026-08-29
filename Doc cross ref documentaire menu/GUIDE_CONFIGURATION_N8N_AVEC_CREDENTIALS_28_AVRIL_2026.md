# Guide Configuration N8N avec Credentials Fournis - 28 Avril 2026

## Vue d'Ensemble

Vous avez fourni des credentials OAuth2 Google Drive complets. Ce guide vous montre comment les configurer dans n8n pour faire fonctionner le workflow de cross-référence documentaire.

---

## Credentials Fournis

**⚠️ IMPORTANT**: Les vraies credentials sont stockées dans `.env.google-oauth.local` (non versionné).

```
Grant Type: Authorization Code
Authorization URL: https://accounts.google.com/o/oauth2/v2/auth
Access Token URL: https://oauth2.googleapis.com/token
Client ID: VOTRE_CLIENT_ID_ICI (voir .env.google-oauth.local)
Client Secret: VOTRE_CLIENT_SECRET_ICI (voir .env.google-oauth.local)
Scope: https://www.googleapis.com/auth/drive
Auth URI Query Parameters: access_type=offline
Authentication: Body
Ignore SSL Issues: NON
```

---

## Configuration dans N8N

### Étape 1: Accéder à N8N

1. Ouvrir: `https://n8nsqlite.zeabur.app`
2. Se connecter avec vos identifiants

### Étape 2: Créer les Credentials

1. Cliquer sur l'icône **Credentials** (clé) en haut à droite
2. Cliquer sur **"Add Credential"**
3. Dans la recherche, taper: `Google Drive OAuth2`
4. Sélectionner: **"Google Drive OAuth2 API"**

### Étape 3: Remplir le Formulaire

Copier-coller les valeurs suivantes:

| Champ | Valeur |
|-------|--------|
| **Credential Name** | `Google Drive OAuth2 - Cross Reference` |
| **Authentication** | `OAuth2` |
| **Grant Type** | `Authorization Code` |
| **Authorization URL** | `https://accounts.google.com/o/oauth2/v2/auth` |
| **Access Token URL** | `https://oauth2.googleapis.com/token` |
| **Client ID** | `VOTRE_CLIENT_ID_ICI` (voir `.env.google-oauth.local`) |
| **Client Secret** | `VOTRE_CLIENT_SECRET_ICI` (voir `.env.google-oauth.local`) |
| **Scope** | `https://www.googleapis.com/auth/drive` |
| **Auth URI Query Parameters** | `access_type=offline` |
| **Authentication** | `Body` |
| **Ignore SSL Issues** | `NON` (décoché) |

### Étape 4: Autoriser l'Accès Google

1. Cliquer sur **"Connect my account"** ou **"Sign in with Google"**
2. Une fenêtre popup Google s'ouvre
3. **Sélectionner le compte Google** qui a accès au dossier "Dossier CAC"
4. **Accepter les permissions** demandées:
   - Voir, modifier, créer et supprimer tous vos fichiers Google Drive
5. La fenêtre se ferme automatiquement
6. Vous devriez voir **"Connected"** en vert avec une coche

### Étape 5: Sauvegarder

1. Cliquer sur **"Save"**
2. Les credentials sont maintenant disponibles pour vos workflows

---

## Configuration du Workflow

### Option A: Import du Workflow Corrigé (Recommandé)

1. Dans n8n, aller dans **"Workflows"**
2. Cliquer sur **"Import from File"**
3. Sélectionner: `workflow_n8n_ouvrir_xref_v2_corrige.json`
4. Le workflow s'ouvre avec tous les nodes configurés

### Option B: Correction Manuelle

Si vous avez déjà un workflow existant:

1. Ouvrir le workflow "Cross Reference - Ouvrir Document"
2. Pour **chaque node Google Drive**:
   - Cliquer sur le node
   - Dans **"Credential to connect with"**, sélectionner: `Google Drive OAuth2 - Cross Reference`
   - Sauvegarder

### Nodes à Configurer

Le workflow contient ces nodes Google Drive:

1. **"Rechercher Dossier"**
   - Operation: `Search`
   - Query: `name contains '{{ $json.body.dossier }}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`

2. **"Rechercher Fichier"**
   - Operation: `Search`
   - Query: `name contains '{{ $json.body.index }}' and '{{ $('Rechercher Dossier').item.json.id }}' in parents and trashed = false`

---

## Activation du Workflow

1. En haut à droite du workflow, mettre le toggle sur **"Active"**
2. Le workflow est maintenant prêt à recevoir des requêtes

---

## Test du Workflow

### Test Rapide

Exécuter le script PowerShell:

```powershell
.\test-workflow-xref-afriland.ps1
```

### Test Manuel

Envoyer une requête POST:

```powershell
$body = @{
    dossier = "AFRILAND"
    index = "[I30]"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://n8nsqlite.zeabur.app/webhook/ouvrir-xref" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Réponse Attendue

```json
{
  "success": true,
  "fileUrl": "https://drive.google.com/file/d/...",
  "fileName": "[I30]-AFRILAND-Document.pdf"
}
```

---

## Vérifications

### ✓ Credentials Configurés

- [ ] Credentials créés dans n8n
- [ ] Compte Google autorisé
- [ ] Status "Connected" visible
- [ ] Credentials sauvegardés

### ✓ Workflow Configuré

- [ ] Workflow importé ou corrigé
- [ ] Nodes Google Drive utilisent les bons credentials
- [ ] Workflow activé
- [ ] Test réussi

### ✓ Accès Google Drive

- [ ] Dossier "Dossier CAC" existe
- [ ] Sous-dossiers clients présents (ex: AFRILAND)
- [ ] Fichiers nommés correctement (ex: [I30]-AFRILAND-...)
- [ ] Compte autorisé a les permissions de lecture

---

## Troubleshooting

### Erreur: "Unauthorized" ou "401"

**Cause**: Credentials non autorisés ou expirés

**Solution**:
1. Retourner dans Credentials
2. Cliquer sur "Reconnect"
3. Autoriser à nouveau l'accès Google
4. Sauvegarder

### Erreur: "Insufficient permissions"

**Cause**: Scope insuffisant

**Solution**:
1. Vérifier que le scope est: `https://www.googleapis.com/auth/drive`
2. Recréer les credentials si nécessaire
3. Autoriser à nouveau

### Erreur: "Cannot read properties of undefined"

**Cause**: Mauvaise version de Google Drive node

**Solution**:
1. Utiliser **Google Drive v2** (pas v3)
2. Vérifier que l'opération est bien **"Search"**
3. Réimporter le workflow corrigé

### Erreur: "File not found"

**Cause**: Structure Google Drive incorrecte

**Solution**:
1. Vérifier que le dossier "Dossier CAC" existe
2. Vérifier que le sous-dossier client existe (ex: AFRILAND)
3. Vérifier le format des noms de fichiers: `[I30]-AFRILAND-...`

### Erreur: "Timeout"

**Cause**: Recherche trop longue

**Solution**:
1. Optimiser la structure des dossiers
2. Réduire le nombre de fichiers par dossier
3. Augmenter le timeout dans n8n settings

---

## Notes Importantes

### Sécurité

- ⚠️ Ces credentials donnent accès à votre Google Drive complet
- ⚠️ Ne pas partager les credentials publiquement
- ⚠️ Utiliser uniquement dans un environnement n8n sécurisé
- ✓ Le refresh token (`access_type=offline`) permet l'accès continu

### Refresh Token

Le paramètre `access_type=offline` permet à n8n de:
- Renouveler automatiquement l'access token
- Maintenir l'accès sans re-authentification manuelle
- Fonctionner même si vous n'êtes pas connecté

### Permissions Google Drive

Les credentials demandent l'accès complet à Google Drive:
- Lecture de tous les fichiers
- Modification de tous les fichiers
- Création de nouveaux fichiers
- Suppression de fichiers

**Note**: Le workflow n'utilise que la lecture, mais les permissions OAuth2 sont globales.

---

## Prochaines Étapes

1. ✓ Configurer les credentials dans n8n
2. ✓ Importer ou corriger le workflow
3. ✓ Tester le workflow
4. → Intégrer dans le menu contextuel Clara
5. → Déployer en production

---

## Fichiers de Référence

- `00_CREDENTIALS_AVANCES_FOURNIS_28_AVRIL_2026.txt` - Résumé des credentials
- `COPIER_COLLER_CREDENTIALS_28_AVRIL_2026.txt` - Valeurs à copier-coller
- `QUICK_FIX_WORKFLOW_28_AVRIL_2026.txt` - Solution rapide
- `workflow_n8n_ouvrir_xref_v2_corrige.json` - Workflow corrigé

---

## Support

En cas de problème:
1. Consulter la section Troubleshooting ci-dessus
2. Vérifier les logs n8n (Executions > View logs)
3. Tester la connexion Google Drive dans n8n
4. Vérifier la structure Google Drive

