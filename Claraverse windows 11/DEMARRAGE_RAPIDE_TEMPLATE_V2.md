# 🚀 Démarrage Rapide - Modelisation Template V2

## ✅ Modifications Appliquées

Le fichier `Modelisation_template_v2.js` a été mis à jour avec succès :

1. ✅ Critère de détection changé : **"Flowise" → "Template"**
2. ✅ Case 8 ajouté : Support **Google Drive** (n8n_doc)
3. ✅ Case 4 amélioré : Workflow **n8n programme de travail**
4. ✅ Script **activé** dans `index.html`

---

## 🎯 Comment Ça Marche

### Détection Automatique

Le script cherche les tables avec une colonne **"Template"** (ou "TEMPLATE", "template") et identifie le type de contenu :

| Contenu de la Cellule | Case Exécuté | Résultat |
|------------------------|--------------|----------|
| `PARTIE 1` | Case 1 | Document Word (.docx) |
| `PARTIE 2` | Case 2 | JSON statique (accordéon) |
| `PARTIE 3` | Case 3 | JSON dynamique (n8n) |
| `PARTIE 4` | Case 4 | Workflow n8n (programme) |
| `PARTIE 5` | Case 5 | Viewer PDF |
| `n8n_doc` ou `n8n doc` | Case 8 | Document Google Drive |

---

## 📝 Exemple de Table Valide

```html
<table>
  <thead>
    <tr>
      <th>Template</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>PARTIE 1</td>
      <td>Mon document Word</td>
    </tr>
  </tbody>
</table>
```

---

## 🧪 Tester Maintenant

### Option 1 : Page de Test Dédiée

Ouvrez dans votre navigateur :
```
http://localhost:5173/test-modelisation-template-v2.html
```

Cette page contient 8 tests complets avec tous les cas de figure.

### Option 2 : Console du Navigateur

```javascript
// Exécuter manuellement
window.ModelisationTemplateV2.execute();

// Voir la configuration
console.log(window.ModelisationTemplateV2.config);
```

---

## 📊 Cas d'Usage Spécifiques

### Case 8 - Google Drive (NOUVEAU)

Pour afficher un document Google Drive :

```html
<table>
  <thead>
    <tr>
      <th>Template</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>n8n_doc</td>
      <td>Document partagé</td>
    </tr>
  </tbody>
</table>
```

**Important** : Le document doit être accessible publiquement ou avec le lien de partage.

### Case 4 - Programme de Travail

```html
<table>
  <thead>
    <tr>
      <th>Template</th>
      <th>Processus</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>PARTIE 4</td>
      <td>Facturation des ventes</td>
    </tr>
  </tbody>
</table>
```

---

## 🔍 Vérification

### Dans la Console (F12)

Vous devriez voir :
```
✅ Modelisation_template_v2.js chargé
💡 Test: window.ModelisationTemplateV2.execute()
🚀 Modelisation_template_v2.js - Génération séparée (Critère: Template)
   Table 1 (Template): PARTIE 1...
   ✅ PARTIE1 détectée
📊 1 document(s) à générer
✅ Template 1 injecté
✅ Génération terminée
```

### Sur la Page

Après chaque table "Template", vous devriez voir un document généré avec :
- 📖 Page de couverture
- 📄 Contenu formaté
- 🎨 Design selon le template (Alpha ou Beta)

---

## ⚠️ Dépannage

### Aucun Document Généré

**Vérifiez :**
1. La table contient-elle une colonne **"Template"** ?
2. La cellule contient-elle un mot-clé valide (PARTIE 1, PARTIE 2, etc.) ?
3. Le script est-il chargé ? → `console.log(window.ModelisationTemplateV2)`

### Case 1 (Word) Ne Fonctionne Pas

**Vérifiez :**
1. Le fichier `PARTIE1.docx` existe dans `public/ressource/`
2. Le script `mammoth-loader-fix.js` est chargé avant

### Case 8 (Google Drive) Affiche une Erreur

**Vérifiez :**
1. Le document est accessible publiquement
2. L'URL de partage est correcte
3. Les paramètres de partage permettent l'export HTML

### Case 3 ou 4 (n8n) Ne Fonctionne Pas

**Vérifiez :**
1. L'endpoint n8n est accessible
2. Vous avez une connexion internet
3. Le format de réponse correspond à celui attendu

---

## 📁 Fichiers Modifiés

```
✅ public/Modelisation_template_v2.js    (mis à jour)
✅ index.html                             (script activé)
✅ MISE_A_JOUR_MODELISATION_V2_TEMPLATE.md (documentation)
✅ public/test-modelisation-template-v2.html (page de test)
✅ DEMARRAGE_RAPIDE_TEMPLATE_V2.md       (ce fichier)
```

---

## 🎨 Personnalisation

### Changer les Mots-Clés

Dans `Modelisation_template_v2.js` :

```javascript
keywords: {
    template: ['Template', 'TEMPLATE', 'template'],
    partie1: ['PARTIE 1', 'partie 1', 'Partie 1'],
    // Ajoutez vos propres variations
}
```

### Changer l'URL Google Drive

Dans la fonction `handleCase8()` :

```javascript
const driveUrl = 'https://docs.google.com/document/d/VOTRE_ID/edit?usp=sharing';
```

### Désactiver le Debug

```javascript
const CONFIG = {
    // ...
    debug: false  // Mettre à false
};
```

---

## 📞 Commandes Utiles

```javascript
// Exécuter manuellement
window.ModelisationTemplateV2.execute();

// Voir la config
console.log(window.ModelisationTemplateV2.config);

// Activer le debug
window.ModelisationTemplateV2.config.debug = true;

// Voir les keywords
console.log(window.ModelisationTemplateV2.config.keywords);

// Tester la détection
const tables = document.querySelectorAll('table');
console.log(`${tables.length} tables trouvées`);
```

---

## ✅ Checklist Finale

- [x] Script mis à jour avec critère "Template"
- [x] Case 8 (Google Drive) ajouté
- [x] Case 4 (workflow n8n) amélioré
- [x] Script activé dans index.html
- [x] Page de test créée
- [x] Documentation complète

---

## 🎉 C'est Prêt !

Le système est maintenant opérationnel. Créez une table avec une colonne "Template" et le contenu approprié (PARTIE 1, PARTIE 2, etc. ou n8n_doc) pour voir la magie opérer !

**Prochaines étapes :**
1. Ouvrir `test-modelisation-template-v2.html` pour tester
2. Créer vos propres tables dans l'application
3. Vérifier les logs dans la console

---

**Date** : 13 décembre 2025  
**Version** : 2.1  
**Statut** : ✅ OPÉRATIONNEL
