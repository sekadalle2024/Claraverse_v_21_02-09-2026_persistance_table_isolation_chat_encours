# Configuration Credential Google Drive - n8n Cloud

## ⚠️ IMPORTANT : Étapes à suivre dans l'ordre

---

## Étape 1 : Créer le Credential dans n8n Cloud

1. Dans n8n Cloud, aller dans **Settings** (icône engrenage)
2. Cliquer sur **Credentials**
3. Cliquer sur **+ Add Credential**
4. Chercher **"Google Drive OAuth2 API"**
5. Remplir :

```
Client ID: [VOTRE_GOOGLE_CLIENT_ID]
Client Secret: [VOTRE_GOOGLE_CLIENT_SECRET]
```

6. **NE PAS CLIQUER SUR "Sign in with Google" ENCORE !**
7. Copier l'**OAuth Redirect URL** affichée (ressemble à `https://app.n8n.cloud/rest/oauth2-credential/callback`)

---

## Étape 2 : Configurer Google Cloud Console

1. Aller sur https://console.cloud.google.com
2. Sélectionner votre projet
3. **APIs & Services** > **Credentials**
4. Trouver votre OAuth 2.0 Client ID
5. Cliquer dessus pour éditer
6. Dans **Authorized redirect URIs**, ajouter :
   ```
   https://app.n8n.cloud/rest/oauth2-credential/callback
   ```
7. **Sauvegarder**

---

## Étape 3 : Activer l'API Google Drive

1. Dans Google Cloud Console
2. **APIs & Services** > **Library**
3. Chercher **"Google Drive API"**
4. Cliquer **Enable** (si pas déjà activé)

---

## Étape 4 : Finaliser dans n8n

1. Retourner dans n8n Cloud
2. Dans le credential Google Drive OAuth2
3. Cliquer **"Sign in with Google"**
4. Autoriser l'accès
5. Le credential devrait afficher ✅ **Connected**

---

## Étape 5 : Importer le Workflow

1. Dans n8n, créer un nouveau workflow
2. Cliquer sur **...** > **Import from File**
3. Sélectionner `workflows/n8n-google-drive-scanner-v2.json`

---

## Étape 6 : Associer le Credential

1. Cliquer sur le node **"Google Drive - List All"**
2. Dans **Credential to connect with**, sélectionner votre credential
3. Sauvegarder

---

## Étape 7 : Tester

1. Activer le workflow (toggle en haut à droite)
2. Copier l'URL du webhook (cliquer sur le node Webhook)
3. Tester avec :

```bash
curl -X POST https://votre-instance.app.n8n.cloud/webhook/scan-drive-v2
```

---

## 🔧 Si erreur "Cannot read properties of undefined"

Cette erreur signifie que le credential n'est pas correctement lié. Vérifier :

1. Le credential est bien créé et connecté (✅ vert)
2. Le node Google Drive utilise ce credential
3. L'API Google Drive est activée dans Google Cloud Console
4. L'URI de redirection est correcte

---

## 📋 Checklist Rapide

- [ ] Credential créé dans n8n avec Client ID/Secret
- [ ] URI de redirection ajoutée dans Google Cloud Console
- [ ] API Google Drive activée
- [ ] "Sign in with Google" effectué avec succès
- [ ] Workflow importé
- [ ] Credential associé au node Google Drive
- [ ] Workflow activé
