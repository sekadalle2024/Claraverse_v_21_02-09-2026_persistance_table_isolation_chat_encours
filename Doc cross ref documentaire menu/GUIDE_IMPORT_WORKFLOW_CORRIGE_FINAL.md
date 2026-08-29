# 📘 Guide d'Import du Workflow Corrigé - Upload Google Drive

## 🎯 Objectif

Importer et configurer le workflow n8n corrigé pour l'upload de documents dans Google Drive avec structure hiérarchique.

## 📋 Prérequis

### 1. Compte Google Cloud Platform

Vous devez avoir :
- Un projet Google Cloud Platform
- Les API Google Drive activées
- Des credentials OAuth2 configurés

### 2. n8n Installé

- Version minimale : n8n 2.15.1
- Accès à l'interface web n8n

## 🔧 Étape 1 : Configuration OAuth2 Google Drive

### A. Créer les Credentials dans Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionner votre projet ou en créer un nouveau
3. Activer l'API Google Drive :
   - Menu → APIs & Services → Library
   - Rechercher "Google Drive API"
   - Cliquer sur "Enable"

4. Créer des credentials OAuth2 :
   - Menu → APIs & Services → Credentials
   - Cliquer sur "Create Credentials" → "OAuth client ID"
   - Type d'application : "Web application"
   - Nom : "n8n Google Drive"
   - Authorized redirect URIs : `https://votre-n8n-url/rest/oauth2-credential/callback`
   - Cliquer sur "Create"
   - **Noter le Client ID et Client Secret**

### B. Configurer dans n8n

1. Ouvrir n8n
2. Aller dans **Settings** (icône engrenage) → **Credentials**
3. Cliquer sur **"New Credential"**
4. Rechercher et sélectionner **"Google OAuth2 API"**
5. Remplir les champs :
   ```
   Credential Name: Google Drive OAuth2
   Client ID: [Votre Client ID]
   Client Secret: [Votre Client Secret]
   Scope: https://www.googleapis.com/auth/drive
   ```
6. Cliquer sur **"Connect my account"**
7. Autoriser l'accès dans la fenêtre Google
8. Cliquer sur **"Save"**

## 📥 Étape 2 : Import du Workflow

### A. Télécharger le Fichier

Le fichier `WORKFLOW_N8N_XREF_CORRIGE_FINAL.json` se trouve dans :
```
Doc cross ref documentaire menu/WORKFLOW_N8N_XREF_CORRIGE_FINAL.json
```

### B. Importer dans n8n

1. Ouvrir n8n
2. Cliquer sur le menu **"..."** (en haut à droite)
3. Sélectionner **"Import from File"**
4. Choisir le fichier `WORKFLOW_N8N_XREF_CORRIGE_FINAL.json`
5. Cliquer sur **"Import"**

### C. Configurer les Credentials

Après l'import, vous devez associer le credential OAuth2 à chaque node Google Drive :

1. Cliquer sur le node **"Find Dossier CAC"**
2. Dans le panneau de droite, section **"Credential to connect with"**
3. Sélectionner **"Google Drive OAuth2"** (le credential créé à l'étape 1)
4. Répéter pour tous les nodes Google Drive :
   - Find Dossier CAC
   - Create Dossier CAC
   - Find Client Folder
   - Create Client Folder
   - Create Cycle Folders
   - Find Cycle Folder
   - Upload File to Drive

## ⚙️ Étape 3 : Configuration du Workflow

### A. Vérifier le Form Trigger

1. Cliquer sur le node **"Cross references Form"**
2. Noter l'URL du formulaire (affichée dans le panneau)
3. Cette URL sera utilisée pour accéder au formulaire

### B. Personnaliser les Valeurs par Défaut (Optionnel)

Dans le node "Cross references Form", vous pouvez modifier :
- Les valeurs par défaut (Client, Exercice, Cross référence, Document)
- Les cycles comptables disponibles
- Les types de fichiers acceptés

## 🧪 Étape 4 : Test du Workflow

### A. Activer le Workflow

1. Cliquer sur le bouton **"Active"** (en haut à droite)
2. Le workflow passe en mode actif

### B. Tester avec le Formulaire

1. Copier l'URL du Form Trigger
2. Ouvrir l'URL dans un navigateur
3. Remplir le formulaire :
   ```
   Client: ORANGE
   Exercice: 2025
   Cycle comptable: Trésorerie
   Cross référence: [I10]
   Document: Proces verbal caisse
   Files: [Sélectionner un fichier PDF ou Excel]
   ```
4. Cliquer sur **"Submit"**

### C. Vérifier dans Google Drive

1. Ouvrir Google Drive
2. Naviguer vers : **Dossier CAC** → **ORANGE-2025** → **Trésorerie**
3. Vérifier que le fichier **[I10]-Proces verbal caisse** est présent

### D. Vérifier l'Exécution dans n8n

1. Retourner dans n8n
2. Cliquer sur **"Executions"** (dans le menu de gauche)
3. Voir la dernière exécution
4. Vérifier que tous les nodes sont en vert (succès)

## 🔍 Étape 5 : Débogage (Si Nécessaire)

### Problème : Erreur d'Authentification

**Symptôme :** Erreur "401 Unauthorized" ou "Invalid credentials"

**Solution :**
1. Vérifier que le credential OAuth2 est bien configuré
2. Reconnecter le compte Google :
   - Settings → Credentials → Google Drive OAuth2
   - Cliquer sur "Reconnect"
3. Vérifier que les scopes incluent `https://www.googleapis.com/auth/drive`

### Problème : Dossier Non Créé

**Symptôme :** Le workflow s'exécute mais les dossiers ne sont pas créés

**Solution :**
1. Vérifier les permissions du compte Google
2. Tester manuellement la création d'un dossier dans Google Drive
3. Vérifier les logs d'exécution dans n8n

### Problème : Fichier Non Uploadé

**Symptôme :** Les dossiers sont créés mais le fichier n'est pas uploadé

**Solution :**
1. Vérifier que le node "Upload File to Drive" a bien le credential
2. Vérifier que `binaryData` est activé
3. Vérifier que le fichier est bien reçu par le Form Trigger

## 📊 Structure Créée dans Google Drive

```
Google Drive (root)
└── Dossier CAC/
    └── [Client]-[Exercice]/
        ├── Capitaux propres/
        ├── Charge d'exploitation/
        ├── Client/
        ├── Fournisseur/
        ├── Immobilisations/
        ├── Impôt et taxes/
        ├── Personnel/
        ├── Stock/
        ├── Trésorerie/
        │   └── [Cross-ref]-[Document].pdf
        └── Ventes/
```

## 🎨 Personnalisation

### Modifier les Cycles Comptables

Dans le node **"Generate Cycles List"**, modifier le tableau :

```javascript
const cycles = [
  "Capitaux propres",
  "Charge d'exploitation",
  "Client",
  "Fournisseur",
  "Immobilisations",
  "Impôt et taxes",
  "Personnel",
  "Stock",
  "Trésorerie",
  "Ventes"
  // Ajouter d'autres cycles ici
];
```

### Modifier le Format du Nom de Fichier

Dans le node **"Prepare Upload Data"**, modifier :

```javascript
const fileName = `[${crossRef}]-${docName}`;
// Changer en :
const fileName = `${docName}_${crossRef}`;
// Ou autre format
```

### Changer le Dossier Racine

Dans le node **"Find Dossier CAC"**, modifier :

```javascript
"queryString": "name='Dossier CAC' ..."
// Changer "Dossier CAC" en un autre nom
```

## ✅ Checklist Finale

- [ ] Credential OAuth2 Google Drive configuré
- [ ] Workflow importé dans n8n
- [ ] Tous les nodes Google Drive ont le credential associé
- [ ] Workflow activé
- [ ] Test réussi avec un fichier
- [ ] Fichier visible dans Google Drive
- [ ] Structure de dossiers correcte

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs d'exécution dans n8n
2. Consulter le fichier `DIAGNOSTIC_WORKFLOW_UPLOAD_13_AVRIL_2026.md`
3. Vérifier la documentation n8n : https://docs.n8n.io/

## 🎉 Félicitations !

Votre workflow d'upload de documents dans Google Drive est maintenant opérationnel !
