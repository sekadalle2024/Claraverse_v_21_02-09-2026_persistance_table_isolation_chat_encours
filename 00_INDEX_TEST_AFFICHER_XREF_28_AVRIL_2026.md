# Index - Test Workflow "Afficher X-Ref documentaire"

**Date**: 28 avril 2026  
**Objectif**: Tester et valider le workflow de recherche et affichage de documents Google Drive

---

## 📚 Documentation créée

### 1. Fichiers principaux

| Fichier | Description | Usage |
|---------|-------------|-------|
| **00_RECAP_FINAL_TEST_AFFICHER_XREF_28_AVRIL_2026.txt** | Récapitulatif complet | ⭐ Commencer ici |
| **QUICK_START_TEST_AFFICHER_XREF.txt** | Guide de démarrage rapide | Test en 3 étapes |
| **00_GUIDE_TEST_WORKFLOW_AFFICHER_XREF_28_AVRIL_2026.md** | Guide de test complet | Documentation détaillée |
| **00_ANALYSE_WORKFLOW_AFFICHER_XREF_28_AVRIL_2026.md** | Analyse technique | Compréhension approfondie |
| **COMMANDES_COPIER_COLLER_TEST_XREF.txt** | Commandes prêtes à l'emploi | Copier-coller direct |
| **test-workflow-afficher-xref.ps1** | Script de test automatique | Exécution PowerShell |
| **00_INDEX_TEST_AFFICHER_XREF_28_AVRIL_2026.md** | Ce fichier | Navigation |

---

## 🎯 Par où commencer?

### Pour un test rapide (5 minutes)

1. Lire: **QUICK_START_TEST_AFFICHER_XREF.txt**
2. Exécuter: `.\test-workflow-afficher-xref.ps1`
3. Vérifier le résultat

### Pour une compréhension complète (30 minutes)

1. Lire: **00_RECAP_FINAL_TEST_AFFICHER_XREF_28_AVRIL_2026.txt**
2. Lire: **00_ANALYSE_WORKFLOW_AFFICHER_XREF_28_AVRIL_2026.md**
3. Suivre: **00_GUIDE_TEST_WORKFLOW_AFFICHER_XREF_28_AVRIL_2026.md**
4. Exécuter tous les tests

### Pour un test manuel

1. Ouvrir: **COMMANDES_COPIER_COLLER_TEST_XREF.txt**
2. Copier-coller les commandes
3. Analyser les résultats

---

## 📋 Checklist de test

### Préparation

- [ ] Lire le récapitulatif final
- [ ] Vérifier que n8n est accessible
- [ ] Vérifier les credentials Google Drive
- [ ] Créer le document de test [I30]-AFRILAND dans Google Drive

### Tests automatiques

- [ ] Exécuter `test-workflow-afficher-xref.ps1`
- [ ] Vérifier la connectivité
- [ ] Vérifier la recherche du document
- [ ] Analyser la réponse JSON

### Tests manuels

- [ ] Test curl avec [I30]-AFRILAND
- [ ] Test avec document inexistant
- [ ] Test avec caractères spéciaux
- [ ] Test avec différents types de fichiers

### Tests dans Claraverse

- [ ] Créer une table X-Ref
- [ ] Cliquer sur une ligne
- [ ] Ouvrir le menu contextuel
- [ ] Tester "Ouvrir X-Ref documentaire"
- [ ] Vérifier l'affichage dans la barre latérale
- [ ] Tester le bouton "Ouvrir dans Drive"

### Validation

- [ ] Le workflow retourne `success: true`
- [ ] Les informations du fichier sont complètes
- [ ] La barre latérale s'affiche correctement
- [ ] Le document est visible
- [ ] Le bouton "Ouvrir dans Drive" fonctionne

---

## 🔍 Structure des fichiers

```
Racine du projet/
├── 00_INDEX_TEST_AFFICHER_XREF_28_AVRIL_2026.md (ce fichier)
├── 00_RECAP_FINAL_TEST_AFFICHER_XREF_28_AVRIL_2026.txt
├── QUICK_START_TEST_AFFICHER_XREF.txt
├── 00_GUIDE_TEST_WORKFLOW_AFFICHER_XREF_28_AVRIL_2026.md
├── 00_ANALYSE_WORKFLOW_AFFICHER_XREF_28_AVRIL_2026.md
├── COMMANDES_COPIER_COLLER_TEST_XREF.txt
├── test-workflow-afficher-xref.ps1
└── Doc cross ref documentaire menu/
    ├── README.md
    ├── IMPLEMENTATION_OUVRIR_XREF.md
    ├── WORKFLOW_N8N_XREF_CORRIGE_FINAL.json
    └── ...
```

---

## 🎯 Objectifs du test

### Objectif principal

Valider que le workflow "Afficher X-Ref documentaire" permet de retrouver efficacement les documents dans Google Drive.

### Objectifs secondaires

1. ✅ Vérifier la recherche dans l'arborescence complète
2. ✅ Valider l'utilisation des colonnes Client et Exercice
3. ✅ Tester le partage des documents
4. ✅ Valider l'affichage dans le frontend

### Document de test

**[I30]-AFRILAND**

---

## 📊 Résultats attendus

### Réponse du workflow

```json
{
  "success": true,
  "file": {
    "id": "1abc...",
    "name": "[I30]-AFRILAND.pdf",
    "webViewLink": "https://drive.google.com/file/d/...",
    "webContentLink": "https://...",
    "thumbnailLink": "https://...",
    "mimeType": "application/pdf",
    "size": "1234567",
    "createdTime": "2026-04-28T10:00:00.000Z",
    "modifiedTime": "2026-04-28T10:00:00.000Z"
  },
  "searchTerm": "[I30]-AFRILAND",
  "dossier": "Dossier CAC"
}
```

### Affichage dans Claraverse

- Barre latérale à droite
- Titre: [I30]-AFRILAND
- Document visible (PDF, Excel, Word, etc.)
- Bouton "Ouvrir dans Drive" fonctionnel

---

## 🔗 Liens utiles

### Endpoints

- **Workflow n8n**: https://n8nsqlite.zeabur.app/webhook/cross_reference
- **Interface n8n**: https://n8nsqlite.zeabur.app
- **Google Drive**: https://drive.google.com

### Documentation existante

- [README X-Ref](Doc cross ref documentaire menu/README.md)
- [Implémentation technique](Doc cross ref documentaire menu/IMPLEMENTATION_OUVRIR_XREF.md)
- [Workflow n8n](Doc cross ref documentaire menu/WORKFLOW_N8N_XREF_CORRIGE_FINAL.json)

---

## 🐛 Dépannage

### Problèmes courants

| Problème | Solution | Fichier de référence |
|----------|----------|---------------------|
| Document non trouvé | Vérifier la nomenclature | QUICK_START |
| Erreur de connexion | Vérifier n8n actif | GUIDE_TEST |
| Barre latérale ne s'affiche pas | Vérifier console (F12) | ANALYSE |
| Permissions insuffisantes | Vérifier credentials | GUIDE_TEST |

### Logs et diagnostics

1. **Console navigateur**: F12 → Console
2. **Logs n8n**: Interface n8n → Executions
3. **Script PowerShell**: Affiche les erreurs détaillées

---

## 📝 Notes importantes

### Nomenclature des fichiers

Format strict: `[Cross ref]-[Document]`

Exemples valides:
- ✅ `[I30]-AFRILAND.pdf`
- ✅ `[I1]-Lead sheet trésorerie.xlsx`
- ✅ `[I20]-Proces verbal inventaire de caisse.docx`

Exemples invalides:
- ❌ `I30-AFRILAND.pdf` (manque les crochets)
- ❌ `[I30] - AFRILAND.pdf` (espaces supplémentaires)
- ❌ `[I30]AFRILAND.pdf` (manque le tiret)

### Structure Google Drive

```
Dossier CAC/
  └── Client-Exercice/
      └── Cycle comptable/
          └── [Cross ref]-[Document].ext
```

Exemple:
```
Dossier CAC/
  └── ORANGE-2025/
      └── Trésorerie/
          └── [I30]-AFRILAND.pdf
```

---

## ✅ Validation finale

### Critères de succès

- [ ] Le script PowerShell s'exécute sans erreur
- [ ] La réponse contient `"success": true`
- [ ] Les informations du fichier sont complètes
- [ ] L'affichage dans Claraverse fonctionne
- [ ] Le bouton "Ouvrir dans Drive" fonctionne
- [ ] Les différents types de fichiers sont supportés

### Rapport de test

Documenter les résultats dans le tableau du guide de test:
- **00_GUIDE_TEST_WORKFLOW_AFFICHER_XREF_28_AVRIL_2026.md** (section "Rapport de test")

---

## 🎉 Conclusion

Cette documentation complète vous permet de:

1. ✅ Comprendre le fonctionnement du workflow
2. ✅ Tester rapidement avec le script automatique
3. ✅ Effectuer des tests manuels détaillés
4. ✅ Valider l'intégration dans Claraverse
5. ✅ Dépanner les problèmes éventuels

**Prochaine étape**: Exécuter `.\test-workflow-afficher-xref.ps1`

---

**Auteur**: Équipe Claraverse  
**Version**: 1.0.0  
**Date**: 28 avril 2026
