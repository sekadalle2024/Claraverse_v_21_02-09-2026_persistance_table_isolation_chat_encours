# Ouvrir X-Ref documentaire - Documentation

## Vue d'ensemble

Cette fonctionnalité permet d'ouvrir directement les documents référencés dans la table Cross-Références depuis Google Drive, avec affichage dans une barre latérale élégante.

## Fichiers créés

1. **IMPLEMENTATION_OUVRIR_XREF.md** - Documentation technique complète
2. **workflow_n8n_ouvrir_xref.json** - Workflow n8n pour la recherche dans Google Drive
3. **GUIDE_TEST_OUVRIR_XREF.md** - Guide de test avec 10 scénarios
4. **test-xref-ouvrir.ps1** - Script PowerShell de test
5. **00_LIRE_EN_PREMIER.txt** - Guide de démarrage rapide
6. **COMMANDES_RAPIDES.txt** - Commandes de test rapide
7. **README.md** - Ce fichier

## Modifications apportées

### Fichier : `public/menu.js`

#### 1. Nouvelle méthode : `ouvrirXRefDocumentaire()`

Cette méthode :
- Détecte si la table active est une table X-Ref
- Extrait les données de la ligne sélectionnée
- Construit le nom du fichier selon la nomenclature `[Cross references]-[Document]`
- Appelle le workflow n8n pour rechercher le fichier dans Google Drive
- Affiche le document dans une barre latérale

#### 2. Nouvelle méthode : `displayDocumentSidebar(file, fileName)`

Cette méthode :
- Crée une barre latérale à droite de l'écran
- Affiche le document selon son type (PDF, Excel, Word, Image)
- Fournit un bouton "Ouvrir dans Drive"
- Gère l'animation d'ouverture/fermeture

#### 3. Mise à jour du menu

Ajout dans la section "Papier de travail" :
```javascript
{ text: "📂 Ouvrir X-Ref documentaire", action: () => this.ouvrirXRefDocumentaire(), shortcut: "Ctrl+Shift+O" }
```

## Workflow n8n

### Configuration requise

1. **Importer le workflow** : `workflow_n8n_ouvrir_xref.json`
2. **Configurer Google Drive** : Ajouter les credentials
3. **Activer le workflow**
4. **Endpoint** : `https://hkj0631c.rpcl.app/webhook/cross_reference`

### Structure du workflow

```
Webhook POST → Rechercher Dossier → Rechercher Fichier → Formater Réponse → Response
```

### Payload

```json
{
  "index": "[I150]-Balances generale",
  "dossier": "Dossier CAC"
}
```

### Réponse

```json
{
  "success": true,
  "file": {
    "id": "1abc...",
    "name": "[I150]-Balances generale.xlsx",
    "webViewLink": "https://drive.google.com/file/d/...",
    "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
}
```

## Utilisation

### 1. Préparer la table X-Ref

Créer une table avec au minimum ces colonnes :

| Cross references | Document |
|-----------------|----------|
| [I1] | Lead sheet trésorerie |
| [I20] | Proces verbal inventaire de caisse |
| [I150] | Balances generale |

### 2. Préparer Google Drive

Créer un dossier "Dossier CAC" et y ajouter les documents avec la nomenclature :
- `[I1]-Lead sheet trésorerie.pdf`
- `[I20]-Proces verbal inventaire de caisse.docx`
- `[I150]-Balances generale.xlsx`

### 3. Ouvrir un document

1. Cliquer sur une ligne de la table X-Ref
2. Ouvrir le menu contextuel (clic droit)
3. Naviguer vers "Papier de travail" > "📂 Ouvrir X-Ref documentaire"
4. Le document s'affiche dans la barre latérale

**Raccourci clavier** : `Ctrl+Shift+O`

## Types de fichiers supportés

- **PDF** : Affichage via Google Drive Viewer
- **Excel** (.xlsx, .xls) : Affichage via Google Sheets Viewer
- **Word** (.docx, .doc) : Affichage via Google Docs Viewer
- **Images** (.jpg, .png, .gif) : Affichage direct
- **Google Docs/Sheets/Slides** : Affichage natif
- **Autres** : Lien de téléchargement

## Tests

### Test rapide du workflow

```powershell
.\test-xref-ouvrir.ps1
```

### Test manuel avec curl

```bash
curl -X POST "https://hkj0631c.rpcl.app/webhook/cross_reference" \
  -H "Content-Type: application/json" \
  -d '{
    "index": "[I150]-Balances generale",
    "dossier": "Dossier CAC"
  }'
```

### Tests dans Claraverse

Voir `GUIDE_TEST_OUVRIR_XREF.md` pour les 10 scénarios de test complets.

## Dépannage

### Document non trouvé

**Causes possibles :**
- Nomenclature incorrecte du fichier
- Fichier absent du dossier "Dossier CAC"
- Permissions insuffisantes

**Solution :**
1. Vérifier l'orthographe exacte
2. Vérifier l'emplacement du fichier
3. Vérifier les permissions de partage

### Erreur lors de la recherche

**Causes possibles :**
- Workflow n8n inactif
- Credentials Google Drive invalides
- Problème réseau

**Solution :**
1. Vérifier que le workflow est actif
2. Vérifier les credentials dans n8n
3. Consulter les logs n8n

### Barre latérale ne s'affiche pas

**Causes possibles :**
- Erreur JavaScript
- Conflit de z-index
- Styles CSS non appliqués

**Solution :**
1. Ouvrir la console du navigateur
2. Vérifier les erreurs JavaScript
3. Rafraîchir la page

## Architecture technique

### Flux de données

```
1. Utilisateur sélectionne une ligne
2. Menu contextuel > Ouvrir X-Ref
3. Extraction des données (Cross ref + Document)
4. Construction du nom de fichier
5. Appel API vers n8n
6. n8n recherche dans Google Drive
7. Réponse avec informations du fichier
8. Affichage dans la barre latérale
```

### Composants

- **menu.js** : Logique métier et gestion du menu
- **Workflow n8n** : Recherche dans Google Drive
- **Barre latérale** : Affichage du document
- **Google Drive API** : Accès aux fichiers

## Améliorations futures

1. **Cache** : Mémoriser les documents déjà ouverts
2. **Historique** : Liste des derniers documents consultés
3. **Annotations** : Permettre d'annoter les documents
4. **Téléchargement** : Bouton de téléchargement direct
5. **Partage** : Générer un lien de partage
6. **Composant React** : Version React pour meilleure intégration
7. **Prévisualisation** : Aperçu dans la liste
8. **Recherche avancée** : Filtres et tri

## Contribution

Pour contribuer à cette fonctionnalité :

1. Lire la documentation technique : `IMPLEMENTATION_OUVRIR_XREF.md`
2. Exécuter les tests : `GUIDE_TEST_OUVRIR_XREF.md`
3. Proposer des améliorations
4. Soumettre des pull requests

## Support

Pour toute question ou problème :

1. Consulter `00_LIRE_EN_PREMIER.txt`
2. Vérifier `GUIDE_TEST_OUVRIR_XREF.md`
3. Consulter les logs dans la console
4. Vérifier les logs n8n

## Licence

Ce code fait partie du projet Claraverse.

---

**Date de création** : 12 avril 2026  
**Version** : 1.0.0  
**Auteur** : Équipe Claraverse
