# Guide Configuration Credentials OAuth2 Google Drive
## Date: 28 avril 2026

## ÉTAPE 1: Créer les Credentials dans n8n

### 1.1 Accéder à la configuration des credentials
1. Ouvrir n8n: https://n8nsqlite.zeabur.app
2. Cliquer sur "Credentials" dans le menu
3. Cliquer sur "+ Add Credential"
4. Rechercher "Google Drive OAuth2 API"

### 1.2 Configurer les credentials OAuth2

**⚠️ IMPORTANT**: Les vraies credentials sont dans `.env.google-oauth.local` (non versionné).

Remplir les champs suivants:

```
Credential Name: Google Drive OAuth2 CAC
Grant Type: Authorization Code
Authorization URL: https://accounts.google.com/o/oauth2/v2/auth
Access Token URL: https://oauth2.googleapis.com/token
Client ID: VOTRE_CLIENT_ID_ICI (voir .env.google-oauth.local)
Client Secret: VOTRE_CLIENT_SECRET_ICI (voir .env.google-oauth.local)
Scope: https://www.googleapis.com/auth/drive
Auth URI Query Parameters: access_type=offline
Authentication: Body
Ignore SSL Issues: décoché (false)
```

### 1.3 Autoriser l'accès
1. Cliquer sur "Connect my account"
2. Se connecter avec le compte Google qui a accès au dossier "Dossier CAC"
3. Autoriser les permissions demandées
4. Sauvegarder les credentials

## ÉTAPE 2: Importer le Workflow Corrigé

### 2.1 Importer le fichier JSON
1. Dans n8n, aller dans "Workflows"
2. Cliquer sur "Import from File"
3. Sélectionner: `Doc cross ref documentaire menu/workflow_n8n_ouvrir_xref_AVEC_CREDENTIALS.json`
4. Cliquer sur "Import"

### 2.2 Associer les credentials
1. Ouvrir le node "Rechercher Dossier"
2. Dans "Credential to connect with", sélectionner "Google Drive OAuth2 CAC"
3. Répéter pour le node "Rechercher Fichier"
4. Sauvegarder le workflow

### 2.3 Activer le workflow
1. Cliquer sur le toggle "Active" en haut à droite
2. Le workflow est maintenant actif et prêt à recevoir des requêtes

## ÉTAPE 3: Tester le Workflow

### 3.1 Vérifier l'URL du webhook
1. Ouvrir le node "Webhook POST"
2. Copier l'URL du webhook (devrait être: https://n8nsqlite.zeabur.app/webhook/cross_reference)
3. Vérifier que c'est bien l'URL dans le script de test

### 3.2 Exécuter le test
```powershell
.\test-workflow-xref-afriland.ps1
```

## ÉTAPE 4: Vérifications

### 4.1 Structure du dossier Google Drive
Vérifier que:
- Le dossier "Dossier CAC" existe dans Google Drive
- Le fichier "[I30]-AFRILAND" existe dans ce dossier
- Le compte Google utilisé a accès à ces fichiers

### 4.2 Format de la requête
Le script envoie:
```json
{
  "question": "[index] = [I30]-AFRILAND",
  "dossier": "Dossier CAC"
}
```

Le workflow extrait:
- `$json.body.dossier` = "Dossier CAC"
- `$json.body.index` = "[I30]-AFRILAND" (extrait de la question)

## ÉTAPE 5: Correction du Body Parsing

### 5.1 Problème potentiel
Le workflow actuel utilise `$json.body.index` mais le script envoie `question`.

### 5.2 Solution A: Modifier le script de test
Changer le body pour envoyer directement `index`:
```powershell
$body = @{
    index = "[I30]-AFRILAND"
    dossier = "Dossier CAC"
} | ConvertTo-Json
```

### 5.2 Solution B: Ajouter un node de parsing
Ajouter un node "Code" après "Webhook POST" pour extraire l'index de la question:
```javascript
// Extraire l'index de la question
const question = $json.body.question || "";
const indexMatch = question.match(/\[([^\]]+)\]/);
const index = indexMatch ? indexMatch[0] : "";

return {
  json: {
    body: {
      index: index,
      dossier: $json.body.dossier
    }
  }
};
```

## TROUBLESHOOTING

### Erreur: "Cannot read properties of undefined (reading 'execute')"
- Cause: Node Google Drive v3 mal configuré
- Solution: Utiliser Google Drive v2 (déjà fait dans le workflow corrigé)

### Erreur: "Unauthorized" ou "Invalid credentials"
- Cause: Credentials OAuth2 non configurés ou expirés
- Solution: Reconfigurer les credentials et réautoriser l'accès

### Erreur: "Document non trouvé"
- Cause: Le fichier n'existe pas ou le nom ne correspond pas
- Solution: Vérifier le nom exact du fichier dans Google Drive

### Erreur: "Folder not found"
- Cause: Le dossier "Dossier CAC" n'existe pas
- Solution: Créer le dossier ou vérifier le nom exact

## NOTES IMPORTANTES

1. Les credentials OAuth2 doivent être configurés AVANT d'importer le workflow
2. Le compte Google doit avoir accès en lecture au dossier "Dossier CAC"
3. Le workflow utilise Google Drive API v2 (plus stable que v3)
4. Les noms de fichiers et dossiers sont sensibles à la casse
5. La recherche utilise "contains" donc "[I30]-AFRILAND" trouvera "[I30]-AFRILAND.pdf"

## PROCHAINES ÉTAPES

Après avoir configuré et testé le workflow:
1. Intégrer l'appel API dans le menu contextuel (menu.js)
2. Créer le composant React pour la barre latérale
3. Afficher le document dans la barre latérale
