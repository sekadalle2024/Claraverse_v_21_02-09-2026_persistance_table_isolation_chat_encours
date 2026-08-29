# Guide Workflow n8n - Scanner Google Drive

## 🎯 Objectif
Scanner automatiquement tous les dossiers, sous-dossiers et fichiers de Google Drive et retourner une structure JSON nested via webhook.

## 📁 Fichiers créés
- `workflows/n8n-google-drive-scanner.json` - Version simple
- `workflows/n8n-google-drive-recursive-scanner.json` - Version complète avec HTTP Request

---

## 🔧 Configuration des Credentials OAuth2

### Étape 1 : Créer les credentials dans n8n

1. Aller dans **Settings > Credentials > Add Credential**
2. Chercher **"Google Drive OAuth2 API"** ou **"OAuth2 API"**
3. Configurer avec vos informations :

```
Client ID: [VOTRE_GOOGLE_CLIENT_ID]
Client Secret: [VOTRE_GOOGLE_CLIENT_SECRET]
```

### Étape 2 : Configuration OAuth2 dans Google Cloud Console

1. Aller sur https://console.cloud.google.com
2. Sélectionner votre projet "Google Cloud novembre"
3. **APIs & Services > Credentials**
4. Ajouter l'URI de redirection n8n :
   - Pour n8n Cloud : `https://app.n8n.cloud/rest/oauth2-credential/callback`
   - Pour n8n self-hosted : `http://localhost:5678/rest/oauth2-credential/callback`

### Étape 3 : Activer l'API Google Drive

1. **APIs & Services > Library**
2. Chercher "Google Drive API"
3. Cliquer **Enable**

---

## 📥 Import du Workflow

### Méthode 1 : Import JSON
1. Dans n8n, cliquer sur **...** > **Import from File**
2. Sélectionner `n8n-google-drive-recursive-scanner.json`

### Méthode 2 : Copier-coller
1. Ouvrir le fichier JSON
2. Dans n8n : **...** > **Import from URL or JSON**
3. Coller le contenu

---

## 🔗 Configuration du Credential dans le Workflow

Après import, mettre à jour le node **"Get All Drive Items"** :

1. Cliquer sur le node
2. Dans **Authentication**, sélectionner **OAuth2**
3. Créer un nouveau credential OAuth2 :

```json
{
  "clientId": "[VOTRE_GOOGLE_CLIENT_ID]",
  "clientSecret": "[VOTRE_GOOGLE_CLIENT_SECRET]",
  "accessTokenUrl": "https://oauth2.googleapis.com/token",
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
  "scope": "https://www.googleapis.com/auth/drive.readonly",
  "authQueryParameters": "access_type=offline&prompt=consent",
  "authentication": "body"
}
```

4. Cliquer **Sign in with Google** pour autoriser

---

## 🚀 Utilisation

### Activer le Workflow
1. Cliquer sur le toggle **Active** en haut à droite
2. Le webhook sera disponible

### URL du Webhook
```
POST https://votre-n8n.com/webhook/scan-drive-full
```

### Test avec cURL
```bash
curl -X POST https://votre-n8n.com/webhook/scan-drive-full
```

### Test avec JavaScript
```javascript
fetch('https://votre-n8n.com/webhook/scan-drive-full', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📊 Format de Réponse JSON

```json
{
  "success": true,
  "timestamp": "2024-12-24T10:30:00.000Z",
  "statistiques": {
    "totalDossiers": 15,
    "totalFichiers": 42,
    "dossiersRacine": 3,
    "fichiersRacine": 5
  },
  "arborescence": {
    "dossiers": [
      {
        "id": "1ABC123...",
        "nom": "Projet Alpha",
        "type": "dossier",
        "sousDossiers": [
          {
            "id": "2DEF456...",
            "nom": "Documents",
            "type": "dossier",
            "sousDossiers": [],
            "fichiers": [
              {
                "id": "3GHI789...",
                "nom": "rapport.pdf",
                "type": "fichier",
                "mimeType": "application/pdf"
              }
            ]
          }
        ],
        "fichiers": [
          {
            "id": "4JKL012...",
            "nom": "notes.txt",
            "type": "fichier",
            "mimeType": "text/plain"
          }
        ]
      }
    ],
    "fichiers": [
      {
        "id": "5MNO345...",
        "nom": "readme.md",
        "type": "fichier",
        "mimeType": "text/markdown"
      }
    ]
  }
}
```

---

## ⚠️ Dépannage

### Erreur 401 Unauthorized
- Vérifier que le credential OAuth2 est bien connecté
- Re-autoriser via "Sign in with Google"

### Erreur 403 Forbidden
- Activer l'API Google Drive dans Google Cloud Console
- Vérifier les scopes OAuth2

### Pas de fichiers retournés
- Vérifier que le compte Google a accès aux fichiers
- Tester avec un dossier partagé

---

## 🔄 Version Alternative avec Node Google Drive

Si vous préférez utiliser le node natif Google Drive :

```json
{
  "parameters": {
    "resource": "fileFolder",
    "operation": "list",
    "options": {
      "fields": ["id", "name", "mimeType", "parents"],
      "filter": "trashed=false"
    }
  },
  "type": "n8n-nodes-base.googleDrive",
  "credentials": {
    "googleDriveOAuth2Api": {
      "id": "votre-credential-id",
      "name": "Google Cloud novembre"
    }
  }
}
```

---

## ✅ Checklist Finale

- [ ] Credential OAuth2 créé dans n8n
- [ ] URI de redirection ajoutée dans Google Cloud Console
- [ ] API Google Drive activée
- [ ] Workflow importé
- [ ] Credential associé au node HTTP Request
- [ ] Autorisation Google effectuée
- [ ] Workflow activé
- [ ] Test webhook réussi
