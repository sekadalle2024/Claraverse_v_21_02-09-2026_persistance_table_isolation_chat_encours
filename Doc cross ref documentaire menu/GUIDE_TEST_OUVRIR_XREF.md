# Guide de Test - Ouvrir X-Ref documentaire

## Prérequis

### 1. Workflow n8n configuré
- Importer le workflow depuis `workflow_n8n_ouvrir_xref.json`
- Configurer les credentials Google Drive
- Activer le workflow
- Vérifier l'endpoint : `https://hkj0631c.rpcl.app/webhook/cross_reference`

### 2. Dossier Google Drive
- Créer un dossier nommé "Dossier CAC" dans Google Drive
- Ajouter des documents de test avec la nomenclature :
  - `[I1]-Lead sheet trésorerie.pdf`
  - `[I20]-Proces verbal inventaire de caisse.pdf`
  - `[I150]-Balances generale.xlsx`

### 3. Table X-Ref dans Claraverse
Créer une table avec les colonnes suivantes :

| Cross references | Document |
|-----------------|----------|
| [I1] | Lead sheet trésorerie |
| [I20] | Proces verbal inventaire de caisse |
| [I150] | Balances generale |

## Tests à effectuer

### Test 1 : Ouverture d'un document PDF

**Étapes :**
1. Ouvrir Claraverse
2. Afficher la table X-Ref documentaire
3. Cliquer sur la ligne `[I1] | Lead sheet trésorerie`
4. Ouvrir le menu contextuel (clic droit)
5. Naviguer vers "Papier de travail" > "📂 Ouvrir X-Ref documentaire"

**Résultat attendu :**
- ✅ Notification "🔍 Recherche de [I1]-Lead sheet trésorerie..."
- ✅ Barre latérale s'ouvre à droite
- ✅ Document PDF affiché dans un iframe
- ✅ Bouton "📂 Ouvrir dans Drive" fonctionnel
- ✅ Bouton de fermeture (×) fonctionnel

**Vérifications :**
- [ ] Le document s'affiche correctement
- [ ] Le titre dans l'en-tête est correct
- [ ] Le bouton "Ouvrir dans Drive" ouvre le document dans un nouvel onglet
- [ ] La barre latérale se ferme avec animation

### Test 2 : Ouverture d'un document Excel

**Étapes :**
1. Cliquer sur la ligne `[I150] | Balances generale`
2. Menu contextuel > "Papier de travail" > "📂 Ouvrir X-Ref documentaire"

**Résultat attendu :**
- ✅ Document Excel affiché via Google Viewer
- ✅ Possibilité de naviguer dans les onglets

### Test 3 : Document non trouvé

**Étapes :**
1. Ajouter une ligne dans la table : `[I999] | Document inexistant`
2. Sélectionner cette ligne
3. Menu contextuel > "Papier de travail" > "📂 Ouvrir X-Ref documentaire"

**Résultat attendu :**
- ✅ Notification "🔍 Recherche de [I999]-Document inexistant..."
- ✅ Alert "⚠️ Document [I999]-Document inexistant non trouvé dans Google Drive"

### Test 4 : Raccourci clavier

**Étapes :**
1. Sélectionner une ligne dans la table X-Ref
2. Appuyer sur `Ctrl+Shift+O`

**Résultat attendu :**
- ✅ Le document s'ouvre directement sans passer par le menu

### Test 5 : Table non X-Ref

**Étapes :**
1. Créer une table normale (sans colonnes Cross references et Document)
2. Sélectionner une cellule
3. Menu contextuel > "Papier de travail" > "📂 Ouvrir X-Ref documentaire"

**Résultat attendu :**
- ✅ Alert "⚠️ Cette table n'est pas une table X-Ref documentaire"

### Test 6 : Aucune cellule sélectionnée

**Étapes :**
1. Ne pas sélectionner de cellule
2. Menu contextuel > "Papier de travail" > "📂 Ouvrir X-Ref documentaire"

**Résultat attendu :**
- ✅ Alert "⚠️ Veuillez sélectionner une ligne dans la table X-Ref"

### Test 7 : Données manquantes

**Étapes :**
1. Ajouter une ligne avec une cellule vide : `[I200] | `
2. Sélectionner cette ligne
3. Menu contextuel > "Papier de travail" > "📂 Ouvrir X-Ref documentaire"

**Résultat attendu :**
- ✅ Alert "⚠️ Données manquantes dans la ligne sélectionnée"

### Test 8 : Ouverture de plusieurs documents

**Étapes :**
1. Ouvrir un premier document
2. Sans fermer la barre latérale, sélectionner une autre ligne
3. Ouvrir un deuxième document

**Résultat attendu :**
- ✅ La barre latérale existante est remplacée par la nouvelle
- ✅ Pas de duplication de barres latérales

### Test 9 : Types de fichiers différents

**Étapes :**
Tester avec différents types de fichiers :
- PDF
- Excel (.xlsx)
- Word (.docx)
- Image (.jpg, .png)
- Google Docs
- Google Sheets

**Résultat attendu :**
- ✅ Chaque type s'affiche correctement
- ✅ Les types non supportés affichent un bouton de téléchargement

### Test 10 : Workflow n8n indisponible

**Étapes :**
1. Désactiver le workflow n8n
2. Essayer d'ouvrir un document

**Résultat attendu :**
- ✅ Alert avec message d'erreur explicite
- ✅ Pas de crash de l'application

## Checklist de validation

### Fonctionnalités
- [ ] Détection correcte de la table X-Ref
- [ ] Extraction des données de la ligne active
- [ ] Construction du nom de fichier selon la nomenclature
- [ ] Appel API vers n8n fonctionnel
- [ ] Gestion des erreurs réseau
- [ ] Affichage de la barre latérale
- [ ] Affichage des documents PDF
- [ ] Affichage des documents Excel
- [ ] Affichage des documents Word
- [ ] Affichage des images
- [ ] Bouton "Ouvrir dans Drive" fonctionnel
- [ ] Bouton de fermeture fonctionnel
- [ ] Animation d'ouverture/fermeture
- [ ] Raccourci clavier Ctrl+Shift+O

### UX/UI
- [ ] Notifications claires et informatives
- [ ] Messages d'erreur explicites
- [ ] Animations fluides
- [ ] Design cohérent avec le reste de l'application
- [ ] Responsive (largeur de la barre latérale)
- [ ] Scrollbar personnalisée
- [ ] Hover effects sur les boutons

### Performance
- [ ] Pas de lag lors de l'ouverture
- [ ] Chargement rapide des documents
- [ ] Pas de fuite mémoire (fermeture propre)
- [ ] Gestion du cache (optionnel)

### Sécurité
- [ ] Validation des données d'entrée
- [ ] Gestion des erreurs sans exposer d'informations sensibles
- [ ] CORS configuré correctement
- [ ] Pas d'injection XSS possible

## Commandes de test rapide

### Test curl du workflow n8n

```bash
curl -X POST "https://hkj0631c.rpcl.app/webhook/cross_reference" \
  -H "Content-Type: application/json" \
  -d '{
    "index": "[I150]-Balances generale",
    "dossier": "Dossier CAC"
  }'
```

**Réponse attendue :**
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

### Test depuis la console du navigateur

```javascript
// Simuler l'ouverture d'un document
const menuManager = window.contextualMenuManager || 
                    document.querySelector('#contextual-table-menu-advanced')?._manager;

if (menuManager) {
  // Définir une cellule active
  menuManager.activeCellPosition = { row: 1, col: 0 };
  menuManager.targetTable = document.querySelector('table');
  
  // Appeler la méthode
  menuManager.ouvrirXRefDocumentaire();
}
```

## Résolution des problèmes courants

### Problème : "Document non trouvé"
**Solutions :**
1. Vérifier que le fichier existe dans Google Drive
2. Vérifier la nomenclature exacte du fichier
3. Vérifier que le fichier est dans le dossier "Dossier CAC"
4. Vérifier les permissions du fichier

### Problème : "Erreur lors de la recherche"
**Solutions :**
1. Vérifier que le workflow n8n est actif
2. Vérifier l'URL de l'endpoint
3. Vérifier les credentials Google Drive dans n8n
4. Vérifier les logs n8n pour plus de détails

### Problème : "Barre latérale ne s'affiche pas"
**Solutions :**
1. Vérifier la console pour les erreurs JavaScript
2. Vérifier que le z-index n'est pas masqué
3. Vérifier que les styles CSS sont appliqués
4. Rafraîchir la page

### Problème : "Document ne s'affiche pas dans l'iframe"
**Solutions :**
1. Vérifier les permissions du fichier (doit être partagé)
2. Vérifier le type MIME du fichier
3. Essayer d'ouvrir directement dans Drive
4. Vérifier les paramètres de sécurité du navigateur

## Logs de débogage

Activer les logs détaillés dans la console :

```javascript
// Dans menu.js, la méthode ouvrirXRefDocumentaire() log déjà :
// - 📂 [X-Ref] Ouverture du document
// - 📄 [X-Ref] Recherche du fichier: [nom]
// - 📦 [X-Ref] Réponse n8n: [data]
// - ✅ [X-Ref] Document affiché dans la barre latérale
// - ❌ [X-Ref] Erreur: [message]
```

## Rapport de test

Date : _______________
Testeur : _______________

| Test | Statut | Commentaires |
|------|--------|--------------|
| Test 1 : PDF | ⬜ Pass / ⬜ Fail | |
| Test 2 : Excel | ⬜ Pass / ⬜ Fail | |
| Test 3 : Non trouvé | ⬜ Pass / ⬜ Fail | |
| Test 4 : Raccourci | ⬜ Pass / ⬜ Fail | |
| Test 5 : Table non X-Ref | ⬜ Pass / ⬜ Fail | |
| Test 6 : Aucune sélection | ⬜ Pass / ⬜ Fail | |
| Test 7 : Données manquantes | ⬜ Pass / ⬜ Fail | |
| Test 8 : Plusieurs docs | ⬜ Pass / ⬜ Fail | |
| Test 9 : Types variés | ⬜ Pass / ⬜ Fail | |
| Test 10 : n8n indisponible | ⬜ Pass / ⬜ Fail | |

**Bugs identifiés :**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Améliorations suggérées :**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
