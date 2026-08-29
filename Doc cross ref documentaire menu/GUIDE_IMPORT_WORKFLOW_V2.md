# Guide d'importation du Workflow V2 Corrigé

## 🎯 Objectif

Importer et configurer le workflow n8n corrigé pour l'upload de documents CAC dans Google Drive avec structure organisée.

## 📁 Fichier à importer

```
Doc cross ref documentaire menu/WORKFLOW_N8N_XREF_HTTP_SOLUTION_V2.json
```

## 🔧 Étapes d'importation

### 1. Ouvrir n8n

Accédez à votre instance n8n dans le navigateur :
```
https://hkj0631c.rpcl.app
```

### 2. Créer un nouveau workflow

- Cliquer sur le bouton **"+"** en haut à gauche
- Ou aller dans **Workflows** > **New Workflow**

### 3. Importer le fichier JSON

1. Cliquer sur les **3 points (⋮)** en haut à droite
2. Sélectionner **"Import from File"**
3. Choisir le fichier : `WORKFLOW_N8N_XREF_HTTP_SOLUTION_V2.json`
4. Le workflow s'ouvre avec tous les 14 nodes

### 4. Configurer les credentials OAuth2

**IMPORTANT** : Vous devez configurer les credentials pour les 7 nodes HTTP Request.

#### Créer le credential Google OAuth2

1. Aller dans **Settings** > **Credentials**
2. Cliquer sur **"New Credential"**
3. Choisir **"Google OAuth2 API"**
4. Remplir les informations :

```
Name: Google OAuth2
Client ID: ${GOOGLE_OAUTH_CLIENT_ID}
Client Secret: ${GOOGLE_OAUTH_CLIENT_SECRET}
OAuth Redirect URL: https://hkj0631c.rpcl.app/rest/oauth2-credential/callback

Scopes:
- https://www.googleapis.com/auth/drive
- https://www.googleapis.com/auth/drive.file
```

5. Cliquer sur **"Connect my account"**
6. Autoriser l'accès à Google Drive
7. Sauvegarder le credential

#### Assigner le credential aux nodes

Pour chaque node HTTP Request (7 nodes au total) :

1. **Rechercher Dossier CAC**
2. **Créer Dossier CAC**
3. **Rechercher Dossier Client**
4. **Créer Dossier Client**
5. **Créer Cycles**
6. **Rechercher Cycle**
7. **Upload Fichier**

Pour chaque node :
- Cliquer sur le node
- Dans **"Credential to connect with"**
- Sélectionner le credential **"Google OAuth2"** créé précédemment
- Sauvegarder

### 5. Activer le workflow

1. Cliquer sur le bouton **"Active"** en haut à droite
2. Le workflow est maintenant actif et prêt à recevoir des soumissions

### 6. Récupérer l'URL du formulaire

1. Cliquer sur le node **"Cross References Form"**
2. Copier l'URL du formulaire affichée
3. Format : `https://hkj0631c.rpcl.app/form/20bcf9fd-b7bb-49de-9707-590a794c4763`

## 🧪 Test du workflow

### 1. Ouvrir le formulaire

Ouvrir l'URL du formulaire dans un navigateur.

### 2. Remplir le formulaire

```
Client: Orange
Exercice: 2025
Cycle comptable: Trésorerie
Cross référence: I1
Document: Lead sheet trésorerie
Files: [Sélectionner un fichier Excel ou PDF]
```

### 3. Soumettre

Cliquer sur **"Submit"**.

### 4. Vérifier dans Google Drive

Aller dans Google Drive et vérifier la structure :

```
Google Drive (root)
└── Dossier CAC/
    └── Orange-2025/
        ├── Capitaux propres/
        ├── Charge d'exploitation/
        ├── Client/
        ├── Fournisseur/
        ├── Immobilisations/
        ├── Impôt et taxes/
        ├── Personnel/
        ├── Stock/
        ├── Trésorerie/
        │   └── [I1]-Lead sheet trésorerie.xlsx
        └── Ventes/
```

## ✅ Vérifications

### Checklist de configuration

- [ ] Workflow importé dans n8n
- [ ] Credential Google OAuth2 créé
- [ ] Credential assigné aux 7 nodes HTTP Request
- [ ] Workflow activé
- [ ] URL du formulaire récupérée
- [ ] Test effectué avec succès
- [ ] Structure de dossiers créée dans Google Drive
- [ ] Fichier uploadé avec le bon nom

## 🔍 Dépannage

### Erreur 401 Unauthorized

**Cause** : Credentials OAuth2 non configurés ou expirés

**Solution** :
1. Vérifier que tous les nodes HTTP Request ont le credential assigné
2. Reconnecter le credential OAuth2
3. Vérifier les scopes Google Drive

### Erreur 403 Forbidden

**Cause** : Permissions insuffisantes

**Solution** :
1. Vérifier que les scopes incluent :
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/drive.file`
2. Reconnecter le compte Google

### Le fichier n'est pas uploadé

**Cause** : Données binaires non récupérées

**Solution** :
1. Vérifier le node "Préparer Upload"
2. S'assurer que `$('Cross References Form').item.binary.data` est accessible
3. Vérifier que le formulaire accepte bien les fichiers

### Les dossiers ne sont pas créés

**Cause** : Permissions Google Drive

**Solution** :
1. Vérifier que le compte Google a les droits de création
2. Vérifier que l'API Google Drive est activée
3. Vérifier les quotas de l'API

## 📊 Architecture du workflow

### Nodes du workflow (14 au total)

1. **Cross References Form** (Form Trigger)
   - Formulaire d'upload avec 6 champs

2. **Rechercher Dossier CAC** (HTTP Request GET)
   - Cherche si "Dossier CAC" existe

3. **Dossier CAC existe?** (IF)
   - Vérifie l'existence du dossier

4. **Créer Dossier CAC** (HTTP Request POST)
   - Crée le dossier si nécessaire

5. **Préparer Recherche Client** (Code)
   - Prépare les données pour la recherche

6. **Rechercher Dossier Client** (HTTP Request GET)
   - Cherche le dossier "Client-Exercice"

7. **Dossier Client existe?** (IF)
   - Vérifie l'existence du dossier client

8. **Créer Dossier Client** (HTTP Request POST)
   - Crée le dossier client si nécessaire

9. **Préparer Création Cycles** (Code)
   - Génère 10 items pour les cycles

10. **Créer Cycles** (HTTP Request POST)
    - Crée les 10 dossiers de cycles

11. **Préparer Recherche Cycle** (Code)
    - Prépare la recherche du cycle

12. **Rechercher Cycle** (HTTP Request GET)
    - Cherche le dossier du cycle

13. **Préparer Upload** (Code)
    - Prépare le nom du fichier et les données

14. **Upload Fichier** (HTTP Request POST multipart)
    - Upload le fichier dans le cycle

## 🎯 Résultat attendu

Après soumission du formulaire :

1. ✅ Dossier "Dossier CAC" créé (si n'existe pas)
2. ✅ Dossier "Client-Exercice" créé (si n'existe pas)
3. ✅ 10 dossiers de cycles créés (si n'existent pas)
4. ✅ Fichier uploadé dans le cycle avec le nom `[Cross référence]-Document`

## 📞 Support

Pour toute question ou problème :

1. Vérifier les logs d'exécution dans n8n
2. Vérifier les credentials OAuth2
3. Vérifier les permissions Google Drive
4. Consulter la documentation Google Drive API v3

## 🔗 Ressources

- [Documentation n8n](https://docs.n8n.io/)
- [Google Drive API v3](https://developers.google.com/drive/api/v3/reference)
- [OAuth2 Google](https://developers.google.com/identity/protocols/oauth2)
