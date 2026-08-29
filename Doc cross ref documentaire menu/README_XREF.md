# X-Ref Documentaire - Claraverse

## 🎯 Vue d'Ensemble

L'intégration X-Ref documentaire permet d'uploader et de gérer des documents de test d'audit dans Google Drive avec une indexation structurée via un formulaire n8n.

## 🚀 Démarrage Rapide (3 minutes)

### Étape 1: Créer une table X-Ref
Copiez ce tableau dans le chat Claraverse:

```markdown
| No | Cross references | Document |
|----|------------------|----------|
| 1  | [I1]             | Lead sheet trésorerie |
| 2  | [I20]            | Proces verbal inventaire de caisse |
| 3  | [I150]           | Balances generle |
```

### Étape 2: Tester l'import
1. Cliquez droit sur la table
2. Menu → "Papier de travail" → "📤 Importer X-Ref documentaire"
3. OU appuyez sur **Ctrl+Shift+X**

### Étape 3: Afficher les documents
1. Cliquez droit sur la table
2. Menu → "Papier de travail" → "📋 Afficher X-Ref documentaire"

## 📚 Documentation

### Pour les Utilisateurs
- **[QUICK_START_XREF.txt](QUICK_START_XREF.txt)** - Guide de démarrage en 3 étapes
- **[test-xref-documentaire.html](test-xref-documentaire.html)** - Page de test interactive

### Pour les Développeurs
- **[INTEGRATION_XREF_DOCUMENTAIRE.md](INTEGRATION_XREF_DOCUMENTAIRE.md)** - Documentation technique complète
- **[CODE_XREF_MENU_JS.js](CODE_XREF_MENU_JS.js)** - Code source des méthodes
- **[test-xref-integration.ps1](test-xref-integration.ps1)** - Script de test PowerShell

### Pour les Administrateurs n8n
- **[WORKFLOW_N8N_XREF.json](WORKFLOW_N8N_XREF.json)** - Configuration du workflow

### Récapitulatif
- **[RECAP_FINAL_XREF_12_AVRIL_2026.md](RECAP_FINAL_XREF_12_AVRIL_2026.md)** - Récapitulatif complet
- **[SYNTHESE_VISUELLE_XREF.txt](SYNTHESE_VISUELLE_XREF.txt)** - Synthèse visuelle
- **[00_INDEX_XREF_DOCUMENTAIRE.md](00_INDEX_XREF_DOCUMENTAIRE.md)** - Index complet

## 🎯 Fonctionnalités

### 1. Importer X-Ref documentaire (Ctrl+Shift+X)
Ouvre un formulaire n8n pour uploader des documents dans Google Drive.

**Champs du formulaire:**
- Client (ex: Orange)
- Exercice (ex: 2025)
- Cycle comptable (dropdown: 10 options)
- Cross référence (ex: I20)
- Document (ex: Proces verbal inventaire de caisse)
- Fichier (upload)

**Résultat:**
```
Dossier CAC/Orange-2025/Trésorerie/[I20]-Proces verbal inventaire de caisse.pdf
```

### 2. Afficher X-Ref documentaire
Détecte et affiche la table des cross-références dans une barre latérale droite.

**Détection:**
- Colonnes: "Cross references" + "Document"
- Variantes acceptées: "X-Ref", "CrossRef", "Doc"

**Affichage:**
- Barre latérale 400px à droite
- Animation slide-in/slide-out
- Compteur de documents
- Hover effects

### 3. Rechercher document
Permet de rechercher un document par son index ou nom.

**Exemples de recherche:**
- "I20" → Trouve [I20]
- "inventaire" → Trouve tous les documents contenant "inventaire"
- "Lead" → Trouve "Lead sheet trésorerie"

## 📁 Structure Google Drive

```
Dossier CAC/
├── [Client]-[Exercice]/
│   ├── Capitaux propres/
│   ├── Charge d'exploitation/
│   ├── Client/
│   ├── Fournisseur/
│   ├── Immobilisations/
│   ├── Impôt et taxes/
│   ├── Personnel/
│   ├── Stock/
│   ├── Trésorerie/
│   └── Ventes/
```

## 📝 Format d'Indexation

```
[Cross Reference]-[Nom Document]
```

**Exemples:**
- `[I1]-Lead sheet trésorerie.xlsx`
- `[I20]-Proces verbal inventaire de caisse.pdf`
- `[I150]-Balances generle.xlsx`

## 🧪 Tests

### Test Automatique
```powershell
.\test-xref-integration.ps1
```

### Test Manuel
1. Ouvrir `test-xref-documentaire.html` dans le navigateur
2. Cliquer sur les boutons de test
3. Vérifier les résultats

### Test dans Claraverse
1. Créer une table X-Ref dans le chat
2. Cliquer droit sur la table
3. Tester les 3 actions du menu "Papier de travail"

## 🔧 Configuration n8n

### Importer le Workflow
1. Ouvrir n8n
2. Importer `WORKFLOW_N8N_XREF.json`
3. Configurer la connexion Google Drive
4. Activer le workflow

### Tester l'Upload
1. Ouvrir l'URL du formulaire
2. Remplir les champs
3. Uploader un fichier
4. Vérifier dans Google Drive

## 📊 Statistiques

- **Lignes de code:** ~450
- **Méthodes créées:** 5
- **Fichiers de documentation:** 9
- **Tests créés:** 3
- **Temps d'implémentation:** ~2 heures

## ✅ Checklist

- [x] Code implémenté dans menu.js
- [x] Documentation complète
- [x] Guide de démarrage rapide
- [x] Workflow n8n configuré
- [x] Page de test HTML
- [x] Script de test PowerShell
- [ ] Tests unitaires (à faire)
- [ ] Configuration n8n en production (à faire)
- [ ] Connexion Google Drive (à faire)

## 🚀 Prochaines Étapes

### Phase 1: Tests (Immédiat)
1. Exécuter `test-xref-integration.ps1`
2. Ouvrir `test-xref-documentaire.html`
3. Tester les 3 actions

### Phase 2: Configuration n8n (1-2 jours)
1. Importer le workflow
2. Connecter Google Drive
3. Tester l'upload complet

### Phase 3: Intégration (1 semaine)
1. Récupérer l'ID des documents
2. Implémenter l'ouverture au clic
3. Ajouter la prévisualisation

### Phase 4: Améliorations (2-3 semaines)
1. Synchronisation bidirectionnelle
2. Recherche avancée
3. Export de la table X-Ref
4. Gestion des versions

## 📞 Support

### En cas de problème
1. Consulter [INTEGRATION_XREF_DOCUMENTAIRE.md](INTEGRATION_XREF_DOCUMENTAIRE.md) (section Dépannage)
2. Vérifier [QUICK_START_XREF.txt](QUICK_START_XREF.txt) (section Dépannage)
3. Exécuter `test-xref-integration.ps1`
4. Consulter les logs dans la console (F12)

### Questions Fréquentes

**Q: Le formulaire ne s'ouvre pas?**  
R: Vérifiez que les popups ne sont pas bloquées.

**Q: La table X-Ref n'est pas détectée?**  
R: Vérifiez les colonnes "Cross references" et "Document".

**Q: La recherche ne trouve rien?**  
R: Vérifiez l'orthographe et essayez une recherche partielle.

## 🎓 Ressources

### Documentation
- [Documentation n8n](https://docs.n8n.io/)
- [Google Drive API](https://developers.google.com/drive)

### Fichiers Modifiés
- `public/menu.js` (ligne ~9422)

### URLs
- Formulaire n8n: https://hkj0631c.rpcl.app/form/20bcf9fd-b7bb-49de-9707-590a794c4763

## 🎉 Conclusion

L'intégration X-Ref documentaire est maintenant complète et prête à être testée. Cette fonctionnalité améliore significativement la gestion des papiers de travail dans Claraverse.

---

**Date:** 12 Avril 2026  
**Version:** 1.0.0  
**Statut:** ✅ PRÊT POUR TESTS
