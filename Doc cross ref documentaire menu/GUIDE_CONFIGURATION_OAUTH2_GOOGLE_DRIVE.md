# Guide de Configuration OAuth2 pour Google Drive dans n8n

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer l'authentification OAuth2 pour utiliser l'API Google Drive dans n8n avec des nodes HTTP Request.

---

## 🔑 Étape 1 : Créer le Credential OAuth2 dans n8n

### 1.1 Accéder aux Credentials

1. Ouvrir n8n dans votre navigateur
2. Cliquer sur **Settings** (⚙️) dans le menu de gauche
3. Cliquer sur **Credentials**
4. Cliquer sur **+ New Credential**

### 1.2 Sélectionner le Type

1. Dans la liste, chercher **"Google OAuth2 API"**
2. Cliquer dessus

### 1.3 Remplir les Informations

Remplir les champs suivants :

```
Credential Name: Google Drive OAuth2 (ou un nom de votre choix)

Client ID: 
${GOOGLE_OAUTH_CLIENT_ID}

Client Secret: 
${GOOGLE_OAUTH_CLIENT_SECRET}

OAuth Redirect URL:
https://your-n8n-instance.app/rest/oauth2-credential/callback

Scopes (ajouter ces 2 scopes):
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/drive.file
```

### 1.4 Autoriser l'Accès

1. Cliquer sur **"Connect my account"**
2. Une fenêtre popup s'ouvre
3. Sélectionner votre compte Google
4. Autoriser l'accès à Google Drive
5. La fenêtre se ferme automatiquement

### 1.5 Sauvegarder

1. Cliquer sur **"Save"**
2. Le credential est maintenant disponible

---

## 🔧 Étape 2 : Configurer les Nodes HTTP Request

### 2.1 Liste des Nodes à Configurer

Le workflow contient **7 nodes HTTP Request** qui doivent tous utiliser le credential OAuth2 :

1. **Rechercher Dossier CAC**
2. **Créer Dossier CAC**
3. **Rechercher Dossier Client**
4. **Créer Dossier Client**
5. **Créer Cycles**
6. **Rechercher Cycle**
7. **Upload Fichier**

### 2.2 Configuration de Chaque Node

Pour chaque node HTTP Request :

1. **Cliquer sur le node** pour l'ouvrir
2. Dans la section **"Authentication"**
3. Sélectionner **"OAuth2"**
4. Dans **"Credential to connect with"**
5. Sélectionner le credential créé à l'étape 1
6. Cliquer sur **"Execute Node"** pour tester (optionnel)
7. Fermer le node

---

## 📊 Étape 3 : Vérifier la Configuration

### 3.1 Test Rapide

1. Ouvrir le node **"Rechercher Dossier CAC"**
2. Cliquer sur **"Execute Node"**
3. Si la configuration est correcte :
   - Vous verrez une réponse JSON
   - Pas d'erreur 401 ou 403

### 3.2 Erreurs Courantes

#### Erreur 401 Unauthorized

```json
{
  "error": {
    "code": 401,
    "message": "Request is missing required authentication credential"
  }
}
```

**Solution** : Le credential OAuth2 n'est pas configuré ou invalide
- Vérifier que le credential est bien sélectionné dans le node
- Reconnecter le compte Google

#### Erreur 403 Forbidden

```json
{
  "error": {
    "code": 403,
    "message": "Insufficient Permission"
  }
}
```

**Solution** : Les scopes sont incorrects
- Vérifier que les 2 scopes sont bien ajoutés
- Reconnecter le compte Google

---

## 🎯 Étape 4 : Test Complet du Workflow

### 4.1 Activer le Workflow

1. Cliquer sur le bouton **"Active"** en haut à droite
2. Le workflow passe en mode actif

### 4.2 Obtenir l'URL du Formulaire

1. Cliquer sur le node **"Cross References Form"**
2. Copier l'URL affichée
3. Exemple : `https://hkj0631c.rpcl.app/form/20bcf9fd-b7bb-49de-9707-590a794c4763`

### 4.3 Tester le Formulaire

1. Ouvrir l'URL dans un navigateur
2. Remplir tous les champs :
   - **Client** : Orange
   - **Exercice** : 2025
   - **Cycle comptable** : Trésorerie
   - **Cross référence** : I1
   - **Document** : Lead sheet trésorerie
   - **Files** : Sélectionner un fichier test
3. Cliquer sur **"Submit"**

### 4.4 Vérifier dans Google Drive

1. Aller sur [Google Drive](https://drive.google.com)
2. Vérifier la structure créée :
   ```
   Dossier CAC/
   └── Orange-2025/
       └── Trésorerie/
           └── [I1]-Lead sheet trésorerie.xlsx
   ```

---

## 🔍 Détails Techniques

### API Endpoints Utilisés

Le workflow utilise ces endpoints de l'API Google Drive v3 :

#### 1. Recherche de Fichiers/Dossiers

```
GET https://www.googleapis.com/drive/v3/files
Query Parameters:
  - q: Requête de recherche (ex: "name='Dossier CAC' and mimeType='application/vnd.google-apps.folder'")
  - fields: Champs à retourner (ex: "files(id, name)")
```

#### 2. Création de Dossier

```
POST https://www.googleapis.com/drive/v3/files
Body:
{
  "name": "Nom du dossier",
  "mimeType": "application/vnd.google-apps.folder",
  "parents": ["ID_du_parent"]
}
```

#### 3. Upload de Fichier

```
POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart
Content-Type: multipart/form-data
Body:
  - metadata: JSON avec name et parents
  - file: Données binaires du fichier
```

### Syntaxe des Requêtes de Recherche

La syntaxe `q` (query) utilise le format Google Drive :

```javascript
// Rechercher un dossier par nom
"name='Dossier CAC' and mimeType='application/vnd.google-apps.folder' and trashed=false"

// Rechercher dans un dossier parent spécifique
"name='Orange-2025' and '{{parentId}}' in parents and trashed=false"

// Rechercher un fichier par nom
"name='document.pdf' and mimeType='application/pdf'"
```

---

## 🛠️ Dépannage Avancé

### Problème : Le credential ne fonctionne pas

**Vérifications** :
1. Le Client ID et Client Secret sont corrects
2. L'OAuth Redirect URL correspond à votre instance n8n
3. Les scopes sont bien configurés
4. Le compte Google a autorisé l'accès

**Solution** :
1. Supprimer le credential
2. Le recréer avec les bonnes informations
3. Reconnecter le compte Google

### Problème : Les dossiers ne sont pas créés

**Vérifications** :
1. Le workflow est bien activé
2. Tous les nodes HTTP Request ont le credential configuré
3. Le compte Google a les permissions d'écriture

**Solution** :
1. Tester chaque node individuellement
2. Vérifier les logs d'exécution
3. Vérifier les permissions Google Drive

### Problème : L'upload échoue

**Vérifications** :
1. Le fichier est bien sélectionné dans le formulaire
2. Le node "Préparer Upload" récupère les binary data
3. Le Content-Type est "multipart/form-data"

**Solution** :
1. Vérifier que `$binary.data` existe
2. Vérifier la taille du fichier (limite : 5MB par défaut)
3. Tester avec un fichier plus petit

---

## 📚 Ressources

- [Documentation API Google Drive v3](https://developers.google.com/drive/api/v3/reference)
- [Documentation OAuth2 n8n](https://docs.n8n.io/credentials/google/)
- [Guide des Scopes Google](https://developers.google.com/identity/protocols/oauth2/scopes#drive)

---

## ✅ Checklist Finale

Avant de considérer la configuration terminée :

- [ ] Credential OAuth2 créé dans n8n
- [ ] Compte Google connecté et autorisé
- [ ] Les 2 scopes ajoutés
- [ ] Les 7 nodes HTTP Request configurés avec le credential
- [ ] Test de recherche réussi (pas d'erreur 401/403)
- [ ] Workflow activé
- [ ] Test complet avec le formulaire réussi
- [ ] Structure de dossiers créée dans Google Drive
- [ ] Fichier uploadé avec succès

---

## 🎉 Félicitations !

Votre workflow n8n est maintenant configuré et fonctionnel pour importer des documents dans Google Drive avec une structure organisée par client, exercice et cycle comptable.

