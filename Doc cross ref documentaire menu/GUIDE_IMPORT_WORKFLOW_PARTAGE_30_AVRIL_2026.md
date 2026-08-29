# Guide d'Import du Workflow avec Partage - 30 Avril 2026

## 🎯 Objectif

Importer le workflow n8n corrigé qui partage automatiquement les fichiers Google Drive pour permettre leur affichage dans Claraverse.

## 📋 Prérequis

- Accès à n8n: https://n8nsqlite.zeabur.app
- Credentials Google Drive OAuth2 configurés
- Fichier: `workflow_n8n_ouvrir_xref_AVEC_PARTAGE.json`

## 🚀 Étapes d'Import

### Étape 1: Accéder à n8n

1. Ouvrir le navigateur
2. Aller sur: https://n8nsqlite.zeabur.app
3. Se connecter avec vos identifiants

### Étape 2: Importer le Workflow

1. Cliquer sur le bouton **"+"** (Nouveau workflow)
2. Cliquer sur les **3 points** (menu) en haut à droite
3. Sélectionner **"Import from File"**
4. Choisir le fichier: `workflow_n8n_ouvrir_xref_AVEC_PARTAGE.json`
5. Cliquer sur **"Import"**

### Étape 3: Configurer les Credentials

Pour chaque node Google Drive (3 nodes au total):

1. **Rechercher Dossier**
   - Cliquer sur le node
   - Dans "Credential to connect with"
   - Sélectionner ou créer "Google Drive OAuth2 API"

2. **Rechercher Fichier**
   - Même procédure

3. **Partager Fichier** (NOUVEAU)
   - Même procédure

#### Configuration du Credential Google Drive OAuth2

Si vous devez créer un nouveau credential:

```
Name: Google Drive OAuth2
Grant Type: Authorization Code
Authorization URL: https://accounts.google.com/o/oauth2/v2/auth
Access Token URL: https://oauth2.googleapis.com/token
Client ID: [VOTRE_GOOGLE_CLIENT_ID]
Client Secret: [VOTRE_GOOGLE_CLIENT_SECRET]
Scope: https://www.googleapis.com/auth/drive
Auth URI Query Parameters: access_type=offline
Authentication: Body
```

Cliquer sur **"Connect my account"** et autoriser l'accès.

### Étape 4: Vérifier la Configuration

Vérifier que tous les nodes sont correctement configurés:

✓ **Webhook OPTIONS preflight**
  - Path: `cross_reference`
  - Method: OPTIONS
  - Headers CORS configurés

✓ **Webhook POST**
  - Path: `cross_reference`
  - Method: POST
  - Headers CORS configurés

✓ **Rechercher Dossier**
  - Operation: search
  - Query: `name contains "Dossier CAC"`
  - Credential: Google Drive OAuth2

✓ **Rechercher Fichier**
  - Operation: search
  - Query: `name contains "[I30]-AFRILAND"`
  - Credential: Google Drive OAuth2

✓ **Partager Fichier** (NOUVEAU NODE)
  - Resource: file
  - Operation: share
  - File ID: `={{ $json.id }}`
  - Permission Type: anyone
  - Permission Role: reader
  - Credential: Google Drive OAuth2

✓ **Formater Réponse**
  - Code JavaScript pour formater la réponse
  - Génère l'URL publique

✓ **Respond to Webhook**
  - Headers CORS configurés

### Étape 5: Activer le Workflow

1. En haut à droite, basculer le switch sur **"Active"**
2. Le workflow est maintenant actif et prêt à recevoir des requêtes

### Étape 6: Tester le Workflow

#### Test Manuel dans n8n

1. Cliquer sur **"Execute Workflow"**
2. Dans le node "Webhook POST", fournir les données de test:

```json
{
  "body": {
    "index": "[I30]-AFRILAND",
    "dossier": "Dossier CAC"
  }
}
```

3. Cliquer sur **"Execute Node"**
4. Vérifier que chaque node s'exécute correctement
5. Vérifier la réponse finale

#### Test avec PowerShell

Exécuter le script de test:

```powershell
.\test-workflow-afficher-xref.ps1
```

Résultat attendu:

```
Test 1: Verification de la connectivite...
Endpoint accessible

Test 2: Recherche du document [I30]-AFRILAND...
Reponse recue:
{
  "success": true,
  "file": {
    "id": "...",
    "name": "[I30]-AFRILAND.pdf",
    "webViewLink": "https://drive.google.com/file/d/.../view?usp=sharing",
    "shared": true
  }
}

Document trouve avec succes!
```

## 🔍 Vérification du Partage

Pour vérifier que le fichier est bien partagé:

1. Copier l'URL `webViewLink` de la réponse
2. Ouvrir un navigateur en mode navigation privée
3. Coller l'URL
4. Le fichier doit s'afficher sans demander de connexion

## ⚠️ Dépannage

### Erreur: "Credential not found"

**Solution:**
- Reconfigurer les credentials Google Drive OAuth2
- S'assurer que tous les nodes utilisent le même credential

### Erreur: "File not found"

**Solution:**
- Vérifier que le fichier existe dans Google Drive
- Vérifier le nom exact: `[I30]-AFRILAND.xxx`
- Vérifier qu'il est dans "Dossier CAC"

### Erreur: "Permission denied"

**Solution:**
- Re-authentifier le credential Google Drive
- Vérifier les scopes OAuth2
- S'assurer que le compte a accès au dossier

### Erreur: "Failed to fetch"

**Solution:**
- Vérifier que le workflow est actif
- Vérifier l'URL de l'endpoint
- Vérifier les headers CORS

## 📝 Différences avec l'Ancien Workflow

| Aspect | Ancien Workflow | Nouveau Workflow |
|--------|----------------|------------------|
| Partage | ❌ Non | ✅ Oui (automatique) |
| Accès public | ❌ Non | ✅ Oui |
| URL générée | Privée | Publique |
| Affichage frontend | ❌ Bloqué | ✅ Fonctionne |
| Nodes | 6 | 7 (+1 Partager) |

## 🎯 Avantages du Nouveau Workflow

✅ **Partage automatique**
- Plus besoin de partager manuellement les fichiers
- Gain de temps considérable

✅ **Liens publics**
- Accessibles depuis n'importe où
- Compatible avec iframe et visualiseurs

✅ **Intégration frontend**
- Fonctionne avec XRefSidebar
- Affichage direct dans Claraverse

✅ **Sécurité**
- Lecture seule (pas de modification possible)
- Liens non indexés par Google

## 🔐 Considérations de Sécurité

⚠️ **Les fichiers deviennent publics**
- Toute personne avec le lien peut les voir
- Acceptable pour des documents de travail d'audit
- Pas de données sensibles (mots de passe, etc.)

💡 **Alternative plus sécurisée** (si nécessaire):
- Partager avec des utilisateurs spécifiques
- Utiliser un Service Account Google
- Configurer des permissions par domaine (@votreentreprise.com)

## ✅ Checklist Finale

Avant de considérer l'import terminé:

- [ ] Workflow importé dans n8n
- [ ] Credentials Google Drive configurés
- [ ] Tous les nodes ont le bon credential
- [ ] Workflow activé
- [ ] Test manuel réussi dans n8n
- [ ] Test PowerShell réussi
- [ ] Fichier accessible en navigation privée
- [ ] Affichage dans Claraverse testé

## 📞 Support

En cas de problème:

1. Consulter les logs n8n (Executions)
2. Vérifier le diagnostic: `00_DIAGNOSTIC_FAILED_TO_FETCH_XREF_30_AVRIL_2026.txt`
3. Consulter la solution: `00_SOLUTION_FAILED_TO_FETCH_XREF_30_AVRIL_2026.txt`

---

**Date de création:** 30 avril 2026  
**Version du workflow:** 2.0 (avec partage automatique)  
**Statut:** ✅ Prêt pour production
