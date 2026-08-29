# Guide d'Import du Workflow N8N Corrigé

## 🎯 Objectif
Importer et configurer le workflow corrigé pour l'upload de documents CAC dans Google Drive

## 📋 Prérequis
- Accès à votre instance n8n
- Compte Google avec accès à Google Drive
- Credentials Google Drive configurés dans n8n

## 🚀 Étapes d'Import

### 1. Importer le Workflow

1. Ouvrir n8n dans votre navigateur
2. Cliquer sur le menu (☰) en haut à gauche
3. Sélectionner "Workflows" → "Import from File"
4. Sélectionner le fichier: `WORKFLOW_N8N_XREF_CORRIGE.json`
5. Cliquer sur "Import"

### 2. Configurer les Credentials Google Drive

Pour chaque node Google Drive (il y en a 17 au total):

1. Cliquer sur le node
2. Dans le panneau de droite, section "Credential to connect with"
3. Sélectionner vos credentials Google Drive existants OU
4. Cliquer sur "Create New" pour créer de nouveaux credentials:
   - Choisir "Google Drive OAuth2 API"
   - Suivre les instructions pour autoriser l'accès
   - Sauvegarder

### 3. Vérifier la Configuration

#### Node "Cross References Form"
- ✅ URL du webhook doit être active
- ✅ Tous les champs du formulaire sont présents

#### Nodes de Recherche (3 nodes)
- ✅ "Rechercher Dossier CAC"
- ✅ "Rechercher Dossier Client"  
- ✅ "Rechercher Cycle"
- Vérifier que "resource": "folder" et "operation": "search"

#### Nodes de Création (12 nodes)
- ✅ "Créer Dossier CAC"
- ✅ "Créer Dossier Client"
- ✅ "Créer Cycle 1" à "Créer Cycle 10"
- Vérifier que "resource": "folder" et "operation": "create"

#### Node Upload
- ✅ "Upload Fichier"
- Vérifier que "resource": "file" et "operation": "upload"

### 4. Activer le Workflow

1. Cliquer sur le bouton "Active" en haut à droite
2. Le workflow passe en mode actif (bouton devient vert)
3. Copier l'URL du formulaire depuis le node "Cross References Form"

### 5. Tester le Workflow

#### Test Manuel dans n8n
1. Cliquer sur "Execute Workflow" en bas
2. Remplir le formulaire de test
3. Vérifier que tous les nodes s'exécutent sans erreur

#### Test via le Formulaire
1. Ouvrir l'URL du formulaire dans un navigateur
2. Remplir tous les champs:
   - Client: Orange
   - Exercice: 2025
   - Cycle comptable: Trésorerie
   - Cross référence: I1
   - Document: Lead sheet trésorerie
   - Files: Sélectionner un fichier test
3. Soumettre le formulaire
4. Vérifier dans Google Drive:
   - Dossier CAC créé
   - Sous-dossier Orange-2025 créé
   - 10 dossiers de cycles créés
   - Fichier uploadé dans Trésorerie/

## 🔍 Vérification dans Google Drive

Structure attendue:
```
Mon Drive/
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

## ⚠️ Problèmes Courants

### Erreur: "Cannot read properties of undefined"
- **Solution**: Vérifier que tous les nodes ont le paramètre "resource" défini

### Erreur: "Credentials not found"
- **Solution**: Configurer les credentials Google Drive pour tous les nodes

### Erreur: "Folder not found"
- **Solution**: Vérifier que les conditions IF fonctionnent correctement

### Fichier non uploadé
- **Solution**: Vérifier que le node "Upload Fichier" a:
  - "resource": "file"
  - "operation": "upload"
  - "options": {"binaryPropertyName": "data"}

## 📝 Notes Importantes

1. **Première Exécution**: Le workflow créera automatiquement tous les dossiers nécessaires
2. **Exécutions Suivantes**: Le workflow détectera les dossiers existants et ne les recréera pas
3. **Format des Fichiers**: Les fichiers sont automatiquement renommés selon le format: `[Cross référence]-Document`
4. **Types de Fichiers Acceptés**: .xlsx, .xls, .pdf, .doc, .docx

## 🎯 Intégration avec menu.js

Une fois le workflow fonctionnel, vous pourrez l'intégrer dans menu.js avec:

```javascript
case 'importer-xref-documentaire':
    const formUrl = 'https://votre-instance-n8n.app/form/20bcf9fd-b7bb-49de-9707-590a794c4763';
    window.open(formUrl, '_blank');
    break;
```

## ✅ Checklist Finale

- [ ] Workflow importé dans n8n
- [ ] Credentials Google Drive configurés pour tous les nodes
- [ ] Workflow activé
- [ ] Test manuel réussi
- [ ] Test via formulaire réussi
- [ ] Structure de dossiers créée dans Google Drive
- [ ] Fichier test uploadé avec succès
- [ ] URL du formulaire copiée pour intégration

## 🆘 Support

Si vous rencontrez des problèmes:
1. Vérifier les logs d'exécution dans n8n
2. Vérifier les permissions Google Drive
3. Consulter la documentation n8n: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/
