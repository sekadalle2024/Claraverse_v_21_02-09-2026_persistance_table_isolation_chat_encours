# Guide de Test - Workflow "Afficher X-Ref documentaire"

**Date**: 28 avril 2026  
**Objectif**: Valider le workflow n8n pour la recherche et l'affichage de documents Google Drive

---

## 📋 Vue d'ensemble

Ce guide vous permet de tester le workflow "Afficher X-Ref documentaire" qui recherche des documents dans Google Drive et les affiche dans le frontend Claraverse.

### Workflow testé

- **Endpoint**: `https://n8nsqlite.zeabur.app/webhook/cross_reference`
- **Méthode**: POST
- **Document de test**: `[I30]-AFRILAND`

---

## 🎯 Objectifs du test

1. ✅ Vérifier que le workflow peut retrouver efficacement les documents dans Google Drive
2. ✅ Valider la structure de recherche: Dossier CAC → Dossiers clients → Documents
3. ✅ Tester le partage des documents pour affichage dans le frontend
4. ✅ Valider l'intégration avec les credentials Google Drive

---

## 📁 Structure Google Drive attendue

```
Google Drive
└── Dossier CAC/
    ├── ORANGE-2025/
    │   ├── Capitaux propres/
    │   ├── Charge d'exploitation/
    │   ├── Client/
    │   ├── Fournisseur/
    │   ├── Immobilisations/
    │   ├── Impôt et taxes/
    │   ├── Personnel/
    │   ├── Stock/
    │   ├── Trésorerie/
    │   │   └── [I30]-AFRILAND.pdf (ou .xlsx, .docx)
    │   └── Ventes/
    └── FILTECTCI-2025/
        └── ...
```

---

## 🚀 Étape 1: Préparation

### 1.1 Vérifier Google Drive

1. Ouvrez Google Drive
2. Vérifiez l'existence du dossier "Dossier CAC"
3. Créez un document de test nommé `[I30]-AFRILAND.pdf` (ou autre extension)
4. Placez-le dans un dossier client (ex: ORANGE-2025/Trésorerie/)

### 1.2 Vérifier le workflow n8n

1. Ouvrez n8n: `https://n8nsqlite.zeabur.app`
2. Localisez le workflow "Cross References - Search"
3. Vérifiez qu'il est **actif** (toggle ON)
4. Vérifiez les credentials Google Drive

---

## 🧪 Étape 2: Test du workflow

### 2.1 Test automatique (PowerShell)

```powershell
# Exécuter le script de test
.\test-workflow-afficher-xref.ps1
```

**Résultat attendu**:
```
✅ Connectivité: OK
✅ Workflow: Fonctionnel
✅ Document trouvé avec succès!

📄 Informations du document:
  Nom: [I30]-AFRILAND.pdf
  ID: 1abc...
  Type MIME: application/pdf
  Lien d'affichage: https://drive.google.com/file/d/...
```

### 2.2 Test manuel (curl)

```bash
curl -X POST "https://n8nsqlite.zeabur.app/webhook/cross_reference" \
  -H "Content-Type: application/json" \
  -d '{
    "index": "[I30]-AFRILAND",
    "dossier": "Dossier CAC"
  }'
```

**Réponse attendue**:
```json
{
  "success": true,
  "file": {
    "id": "1abc...",
    "name": "[I30]-AFRILAND.pdf",
    "webViewLink": "https://drive.google.com/file/d/...",
    "mimeType": "application/pdf",
    "thumbnailLink": "https://...",
    "iconLink": "https://...",
    "size": "1234567",
    "createdTime": "2026-04-28T10:00:00.000Z",
    "modifiedTime": "2026-04-28T10:00:00.000Z"
  },
  "searchTerm": "[I30]-AFRILAND",
  "dossier": "Dossier CAC"
}
```

---

## 🎨 Étape 3: Test dans le frontend Claraverse

### 3.1 Créer une table X-Ref

Dans Claraverse, créez une table avec cette structure:

| Cross references | Document |
|-----------------|----------|
| [I1] | Lead sheet trésorerie |
| [I20] | Proces verbal inventaire de caisse |
| [I30] | AFRILAND |
| [I150] | Balances generale |

### 3.2 Tester l'action "Ouvrir X-Ref documentaire"

1. Cliquez sur la ligne `[I30] | AFRILAND`
2. Ouvrez le menu contextuel (clic droit)
3. Naviguez vers **Papier de travail** → **📂 Ouvrir X-Ref documentaire**
4. Ou utilisez le raccourci: `Ctrl+Shift+O`

**Résultat attendu**:
- Une barre latérale s'ouvre à droite
- Le document `[I30]-AFRILAND` s'affiche
- Un bouton "Ouvrir dans Drive" est disponible

### 3.3 Vérifier l'affichage

Selon le type de fichier:

- **PDF**: Affichage via Google Drive Viewer
- **Excel** (.xlsx, .xls): Affichage via Google Sheets Viewer
- **Word** (.docx, .doc): Affichage via Google Docs Viewer
- **Images** (.jpg, .png): Affichage direct
- **Autres**: Lien de téléchargement

---

## 🔍 Étape 4: Tests de cas limites

### Test 4.1: Document inexistant

```json
{
  "index": "[I999]-DocumentInexistant",
  "dossier": "Dossier CAC"
}
```

**Résultat attendu**:
```json
{
  "success": false,
  "message": "Document non trouvé dans Google Drive",
  "searchTerm": "[I999]-DocumentInexistant",
  "dossier": "Dossier CAC"
}
```

### Test 4.2: Dossier inexistant

```json
{
  "index": "[I30]-AFRILAND",
  "dossier": "Dossier Inexistant"
}
```

**Résultat attendu**: Erreur ou création du dossier selon la configuration

### Test 4.3: Caractères spéciaux

```json
{
  "index": "[I30]-AFRILAND (Copie)",
  "dossier": "Dossier CAC"
}
```

### Test 4.4: Plusieurs fichiers avec le même nom

Si plusieurs fichiers correspondent, le workflow doit retourner le premier trouvé.

---

## 📊 Étape 5: Validation des permissions

### 5.1 Vérifier les permissions Google Drive

Le workflow doit avoir accès à:
- ✅ Lecture des dossiers
- ✅ Lecture des fichiers
- ✅ Métadonnées des fichiers
- ✅ Liens de partage

### 5.2 Tester le partage

1. Ouvrir un document via le workflow
2. Cliquer sur "Ouvrir dans Drive"
3. Vérifier que le document s'ouvre correctement

---

## 🐛 Dépannage

### Problème: Document non trouvé

**Causes possibles**:
1. Nomenclature incorrecte du fichier
2. Fichier absent du dossier "Dossier CAC"
3. Permissions insuffisantes

**Solutions**:
1. Vérifier l'orthographe exacte: `[I30]-AFRILAND`
2. Vérifier l'emplacement du fichier dans Google Drive
3. Vérifier les permissions de partage

### Problème: Erreur lors de la recherche

**Causes possibles**:
1. Workflow n8n inactif
2. Credentials Google Drive invalides
3. Problème réseau

**Solutions**:
1. Vérifier que le workflow est actif dans n8n
2. Vérifier les credentials dans n8n
3. Consulter les logs n8n

### Problème: Barre latérale ne s'affiche pas

**Causes possibles**:
1. Erreur JavaScript
2. Conflit de z-index
3. Styles CSS non appliqués

**Solutions**:
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs JavaScript
3. Rafraîchir la page (Ctrl+F5)

---

## ✅ Checklist de validation

- [ ] Le workflow n8n est actif
- [ ] Les credentials Google Drive sont configurés
- [ ] Le dossier "Dossier CAC" existe dans Google Drive
- [ ] Le document `[I30]-AFRILAND` existe
- [ ] Le script PowerShell s'exécute sans erreur
- [ ] La réponse JSON contient `"success": true`
- [ ] Le document s'affiche dans la barre latérale
- [ ] Le bouton "Ouvrir dans Drive" fonctionne
- [ ] Les différents types de fichiers s'affichent correctement
- [ ] Les cas d'erreur sont gérés proprement

---

## 📝 Rapport de test

### Résultats

| Test | Statut | Commentaires |
|------|--------|--------------|
| Connectivité endpoint | ⏳ | À tester |
| Recherche document existant | ⏳ | À tester |
| Recherche document inexistant | ⏳ | À tester |
| Affichage PDF | ⏳ | À tester |
| Affichage Excel | ⏳ | À tester |
| Affichage Word | ⏳ | À tester |
| Affichage Image | ⏳ | À tester |
| Bouton "Ouvrir dans Drive" | ⏳ | À tester |
| Gestion des erreurs | ⏳ | À tester |
| Permissions Google Drive | ⏳ | À tester |

### Légende
- ✅ Réussi
- ❌ Échoué
- ⏳ En attente
- ⚠️ Attention requise

---

## 🎯 Prochaines étapes

1. **Exécuter tous les tests** de ce guide
2. **Documenter les résultats** dans le tableau ci-dessus
3. **Corriger les problèmes** identifiés
4. **Valider l'intégration** complète dans Claraverse
5. **Former les utilisateurs** sur l'utilisation de la fonctionnalité

---

## 📚 Références

- [Documentation X-Ref](Doc cross ref documentaire menu/README.md)
- [Implémentation technique](Doc cross ref documentaire menu/IMPLEMENTATION_OUVRIR_XREF.md)
- [Workflow n8n](Doc cross ref documentaire menu/WORKFLOW_N8N_XREF_CORRIGE_FINAL.json)
- [Google Drive Credentials](Doc cross ref documentaire menu/README_ENV_SETUP.md)

---

**Auteur**: Équipe Claraverse  
**Version**: 1.0.0  
**Date**: 28 avril 2026
