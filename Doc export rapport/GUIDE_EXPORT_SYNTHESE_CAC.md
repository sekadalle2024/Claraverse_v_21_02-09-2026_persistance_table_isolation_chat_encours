# Guide d'Export Synthèse CAC

## Vue d'ensemble

La fonctionnalité **Export Synthèse CAC** permet de générer automatiquement des rapports structurés au format CAC (Commissaire aux Comptes) et Expert-Comptable à partir des tables d'audit présentes dans le chat Claraverse.

## Types de points d'audit collectés

### 1. FRAP (Feuille de Révélation et d'Analyse de Problème)
Points de contrôle interne opérationnel identifiés lors de l'audit.

**Identification**: Tables contenant "Frap" dans l'en-tête ou les données

**Structure attendue**:
- Table 1: Métadonnées (Etape, Norme, Méthode, Reference)
- Table 2: Intitulé
- Table 3: Observation
- Table 4: Constat
- Table 5: Risque
- Table 6: Recommandation

### 2. Recos Révision des Comptes
Points d'ajustement comptable identifiés lors de la révision des comptes.

**Identification**: Tables contenant "Recos revision des comptes" ou "Recommendations comptables"

**Structure attendue**:
- Table 1: Métadonnées (Etape, Norme, Méthode, Reference)
- Table 2: Intitulé
- Table 3: Description
- Table 4: Observation
- Table 5: Ajustement/Reclassement
- Table 6: Régularisation comptable

### 3. Recos Contrôle Interne Comptable
Points de contrôle interne comptable nécessitant des actions correctives.

**Identification**: Tables contenant "Recos contrôle interne comptable"

**Structure attendue**:
- Table 1: Métadonnées (Etape, Norme, Méthode, Reference)
- Table 2: Intitulé
- Table 3: Observation
- Table 4: Constat
- Table 5: Risque
- Table 6: Recommandation

## Utilisation

### Via le Menu Contextuel

1. **Ouvrir le menu contextuel** sur n'importe quelle table dans le chat
2. **Naviguer vers** "Rapports CAC & Expert-Comptable" 🎓
3. **Choisir une option**:
   - **📊 Export Synthèse CAC** (Ctrl+Shift+C): Exporte tous les points d'audit
   - **📋 Export Points Révision Comptes**: Exporte uniquement les recos révision
   - **🔍 Export Points Contrôle Interne**: Exporte uniquement FRAP + Recos CI

### Raccourcis Clavier

- **Ctrl+Shift+C**: Export Synthèse CAC complète

## Structure du Rapport Généré

Le rapport Word généré suit la structure professionnelle CAC:

```
SYNTHÈSE DES TRAVAUX DE RÉVISION

Entité: [Nom de l'entité]
Exercice: [Année]
Date du rapport: [Date]

1. INTRODUCTION
   - Contexte et objectifs des travaux
   - Normes professionnelles appliquées

2. OBSERVATIONS D'AUDIT
   - Points de révision des comptes
   - Ajustements comptables proposés
   - Régularisations nécessaires

3. POINTS DE CONTRÔLE INTERNE
   - Points FRAP (contrôle interne opérationnel)
   - Points de contrôle interne comptable
   - Risques identifiés
   - Recommandations

4. CONCLUSION
   - Synthèse des points identifiés
   - Actions recommandées
```

## Exemple de Données JSON

### Point FRAP
```json
{
  "metadata": {
    "etape": "Frap",
    "norme": "14.3 Évaluation des constats",
    "methode": "Méthode des constats d'audit par les risques critiques",
    "reference": "Frap-001"
  },
  "intitule": "Perte de liasses de facturation",
  "observation": "La procédure exige une numérotation séquentielle...",
  "constat": "Inexistence d'un rapprochement formalisé...",
  "risque": "Risque de perte financière directe...",
  "recommandation": "Rendre obligatoire le rapprochement hebdomadaire..."
}
```

### Point Recos Révision
```json
{
  "metadata": {
    "etape": "Recommendations comptables",
    "norme": "Norme ISA",
    "methode": "Méthode de la régularisation des comptes",
    "reference": "Recos revision-001"
  },
  "intitule": "Dépenses de caisse non justifiées",
  "description": "Procédure de rapprochement des pièces...",
  "observation": "Écart de 600 000 FCFA au 31.12.N",
  "ajustement": "Ajustement pour sur-évaluation de charges...",
  "regularisation": "Débit du compte 571 000 — Caisse..."
}
```

## Architecture Technique

### Frontend (menu.js)

**Fonctions principales**:
- `exportSyntheseCAC()`: Collecte tous les points et génère le rapport
- `collectFrapPoints()`: Identifie et extrait les points FRAP
- `collectRecosRevisionPoints()`: Identifie et extrait les recos révision
- `collectRecosControleInternePoints()`: Identifie et extrait les recos CI
- `exportSyntheseCAC_JS()`: Fallback JavaScript si backend indisponible

### Backend (export_synthese_cac.py)

**Endpoint**: `POST /api/word/export-synthese-cac`

**Modèles Pydantic**:
- `FrapPoint`: Structure d'un point FRAP
- `RecosRevisionPoint`: Structure d'un point révision
- `RecosControleInternePoint`: Structure d'un point contrôle interne
- `SyntheseCAC_Request`: Requête complète

**Fonction principale**:
- `create_synthese_cac_document()`: Génère le document Word structuré

## Détection Automatique

### Sélecteur CSS (Correction 26 Mars 2026)

Le système utilise le sélecteur CSS `div.prose table` pour détecter toutes les tables Claraverse dans le chat.

**Problème résolu**: Les tables sont dans des divs avec classes complètes `prose prose-base dark:prose-invert max-w-none`, mais le sélecteur `div.prose table` fonctionne correctement pour les détecter toutes.

**Code de détection**:
```javascript
const allTables = Array.from(document.querySelectorAll('div.prose table'));
```

### Identification des Types de Tables

Le système détecte automatiquement les types de tables en analysant:

1. **Contenu de la première table** dans chaque div
2. **Mots-clés spécifiques**:
   - FRAP: "frap"
   - Recos Révision: "recos" + "revision" ou "recommendations" + "comptable"
   - Recos CI: "recos" + "controle" + "interne" + "comptable"

## Gestion des Erreurs

### Backend non disponible
Si le backend Python n'est pas accessible, le système bascule automatiquement sur un fallback JavaScript qui génère un rapport simplifié.

### Tables non détectées
Si aucune table n'est détectée, vérifier:
1. Les tables sont bien dans des divs avec classe `prose`
2. Le sélecteur `div.prose table` trouve bien les tables (voir console F12)
3. Les logs de diagnostic affichent le nombre de tables détectées

**Correction 26 Mars 2026**: Le problème de détection était dû à la recherche dans un conteneur spécifique au lieu d'utiliser directement le sélecteur global `div.prose table`.

### Données incomplètes
Les champs manquants sont simplement omis du rapport final.

## Tests

### Test Manuel
```powershell
# Lancer le test PowerShell
.\test-export-synthese-cac.ps1
```

### Test via l'Interface
1. Générer des tables FRAP, Recos Révision, et Recos CI dans le chat
2. Ouvrir le menu contextuel
3. Sélectionner "Export Synthèse CAC"
4. Vérifier le fichier Word généré

## Personnalisation

### Modifier le Format du Rapport

Éditer `py_backend/export_synthese_cac.py`:
- Fonction `create_synthese_cac_document()`: Structure du document
- Fonction `add_heading_with_numbering()`: Style des titres
- Fonction `add_section_content()`: Format des sections

### Ajouter de Nouveaux Types de Points

1. Créer un nouveau modèle Pydantic
2. Ajouter une fonction de collecte dans `menu.js`
3. Intégrer dans `create_synthese_cac_document()`

## Bonnes Pratiques

1. **Structurer les tables** selon les formats attendus
2. **Utiliser des références** claires (Frap-001, Recos-001, etc.)
3. **Remplir tous les champs** pour un rapport complet
4. **Vérifier le rapport généré** avant diffusion

## Dépannage

### Le menu ne s'affiche pas
- Vérifier que `menu.js` est chargé
- Rafraîchir la page (F5)

### L'export échoue
- Vérifier que le backend est démarré
- Consulter la console JavaScript (F12)
- Vérifier les logs Python

### Tables non détectées
- Vérifier la structure des tables
- Vérifier les mots-clés dans les en-têtes
- Consulter la console pour les logs de détection

## Support

Pour toute question ou problème:
1. Consulter les logs de la console (F12)
2. Vérifier les logs du backend Python
3. Tester avec le script PowerShell de test
