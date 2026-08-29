# Guide de Correction du Workflow N8N - Cross Reference

**Date:** 28 avril 2026  
**Problème:** Erreur "Cannot read properties of undefined (reading 'execute')"

## Étapes de Correction

### 1. Comprendre le Problème

Le node Google Drive v3 dans n8n a changé sa structure:
- ❌ L'opération `search` n'existe plus
- ✅ Utiliser `resource` + `operation` + `list`

### 2. Modifications à Apporter

#### Node "Rechercher Dossier"

**Avant (ne fonctionne pas):**
```json
{
  "parameters": {
    "operation": "search",
    "queryString": "..."
  }
}
```

**Après (fonctionne):**
```json
{
  "parameters": {
    "resource": "folder",
    "operation": "list",
    "options": {
      "query": "name contains 'Dossier CAC' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    }
  }
}
```

#### Node "Rechercher Fichier"

**Avant (ne fonctionne pas):**
```json
{
  "parameters": {
    "operation": "search",
    "queryString": "..."
  }
}
```

**Après (fonctionne):**
```json
{
  "parameters": {
    "resource": "file",
    "operation": "list",
    "options": {
      "query": "name contains '[I30]-AFRILAND' and 'FOLDER_ID' in parents and trashed = false"
    }
  }
}
```

### 3. Importer le Workflow Corrigé

1. Ouvrir n8n: https://n8nsqlite.zeabur.app
2. Aller dans "Workflows"
3. Cliquer sur "Import from File"
4. Sélectionner: `workflow_n8n_ouvrir_xref_CORRIGE.json`
5. Configurer les credentials Google Drive
6. Activer le workflow

### 4. Configuration des Credentials

Dans chaque node Google Drive:
1. Cliquer sur "Credential to connect with"
2. Sélectionner ou créer "Google Drive OAuth2 API"
3. Autoriser l'accès à votre compte Google Drive

### 5. Tester le Workflow

Exécuter le script PowerShell:
```powershell
.\test-workflow-xref-afriland.ps1
```

### 6. Vérification

Le workflow doit retourner:
```json
{
  "success": true,
  "file": {
    "fileId": "...",
    "fileName": "[I30]-AFRILAND",
    "fileUrl": "https://drive.google.com/...",
    "mimeType": "application/pdf"
  },
  "message": "Document trouvé avec succès"
}
```

## Différences Clés

| Aspect | Ancienne Version | Nouvelle Version |
|--------|-----------------|------------------|
| Opération | `search` | `list` avec `resource` |
| Query | `queryString` | `options.query` |
| Structure | Plate | Hiérarchique (resource/operation) |

## Troubleshooting

### Erreur: "Credential not found"
- Vérifier que les credentials Google Drive sont configurés
- Réautoriser l'accès si nécessaire

### Erreur: "Folder not found"
- Vérifier que le dossier "Dossier CAC" existe dans Google Drive
- Vérifier les permissions d'accès

### Erreur: "File not found"
- Vérifier que le fichier existe dans le dossier
- Vérifier le format du nom: `[I30]-AFRILAND`

## Alternative: HTTP Request

Si les nodes Google Drive continuent à poser problème, utiliser HTTP Request:

```javascript
// Node HTTP Request
{
  "method": "GET",
  "url": "https://www.googleapis.com/drive/v3/files",
  "authentication": "oAuth2",
  "qs": {
    "q": "name contains '[I30]-AFRILAND' and trashed = false",
    "fields": "files(id, name, mimeType, webViewLink)"
  }
}
```

## Ressources

- [Documentation n8n Google Drive](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/)
- [Google Drive API v3](https://developers.google.com/drive/api/v3/reference)
- [Query Language Google Drive](https://developers.google.com/drive/api/v3/search-files)
