# Export Rapport d'Audit Structuré

## Description

Nouvelle fonctionnalité permettant d'exporter les tables d'audit (Synthèse FRAP, Rapport Provisoire, Rapport Final, FRAP Individuelle) sous forme de rapport Word structuré.

## Fonctionnalités

### Menu Contextuel
Une nouvelle section **"Rapports d'Audit"** (📝) a été ajoutée au menu contextuel avec les options :

- **Export Rapport Structuré** (Ctrl+Shift+R) - Détecte automatiquement l'étape de mission
- **Export Synthèse FRAP** - Force l'export en format Synthèse FRAP
- **Export Rapport Provisoire** - Force l'export en format Rapport Provisoire  
- **Export Rapport Final** - Force l'export en format Rapport Final
- **Export FRAP Individuelle** (Ctrl+Shift+F) - Pour les FRAP multi-tables à une colonne

### Colonnes Supportées par Étape

| Colonne | Synthèse FRAP | Rapport Provisoire | Rapport Final |
|---------|---------------|-------------------|---------------|
| No | ✅ | ✅ | ✅ |
| Intitulé | ✅ | ✅ | ✅ |
| Observation | ✅ | ✅ | ✅ |
| Constat | ✅ | ✅ | ✅ |
| Risque | ✅ | ✅ | ✅ |
| Recommandation | ✅ | ✅ | ✅ |
| Commentaire audité | ❌ | ✅ | ✅ |
| Commentaire auditeur | ❌ | ❌ | ✅ |
| Plan d'action | ❌ | ❌ | ✅ |
| Responsable | ❌ | ❌ | ✅ |
| Délai | ❌ | ❌ | ✅ |

### FRAP Individuelle (Multi-tables)

Structure supportée pour les FRAP individuelles :
- Table métadonnées (2 colonnes: Rubrique | Description)
  - Étape de mission
  - Norme
  - Méthode
  - Référence
- Tables de contenu (1 colonne chacune) :
  - Intitulé
  - Observation
  - Constat
  - Risque
  - Recommandation

### Format du Rapport Généré

**Couleur des sections : Bleu professionnel (#1E3A8A)**

Le rapport Word généré contient pour chaque constatation :

1. **Titre numéroté** (ex: "1. Écarts de caisse non justifiés")
2. **Observation/Analyse** - Contexte et procédures
3. **Constat** - Anomalies détectées
4. **Risque(s) / Incidence(s)** - Liste des risques (format bullet points)
5. **Recommandation** - Actions préconisées (format bullet points)
6. **Commentaire de l'audité** (si présent)
7. **Commentaire de l'auditeur** (si présent)
8. **Plan d'action** (si présent)
9. **Tableau Actions/Responsables/Délai** (si présent)

## Utilisation

### Via Menu Contextuel
1. Cliquez sur une cellule de la table d'audit
2. Clic droit ou survolez pour afficher le menu
3. Ouvrez la section "Rapports d'Audit" (📝)
4. Sélectionnez le type d'export souhaité

### Via Raccourcis Clavier
- **Ctrl+Shift+R** : Export rapport avec détection automatique de l'étape
- **Ctrl+Shift+F** : Export FRAP individuelle (multi-tables)

## Architecture Technique

### Frontend (menu.js)
- `exportAuditReport(etape)` - Export rapport structuré
- `exportFrapIndividuelle()` - Export FRAP multi-tables
- `detectAuditStage(headers)` - Détection automatique de l'étape
- `mapAuditColumns(headers)` - Mapping des colonnes
- Fallback JavaScript si backend indisponible

### Backend (py_backend/word_export.py)
- `POST /api/word/export-rapport` - Export rapport structuré
- `POST /api/word/export-frap` - Export FRAP individuelle
- Utilise python-docx pour la génération Word
- Détection automatique des colonnes avec normalisation

## Fichiers Modifiés

- `public/menu.js` - Ajout section menu + fonctions export
- `py_backend/word_export.py` - Endpoints export-rapport et export-frap

## Test

```javascript
// Dans la console du navigateur, après avoir cliqué sur une table d'audit
claraverseMenu.exportAuditReport();  // Détection auto
claraverseMenu.exportAuditReport('rapport_final');  // Forcer rapport final
claraverseMenu.exportFrapIndividuelle();  // Export FRAP multi-tables
```
