# Extraction JSON du Menu Démarrer - DemarrerMenu.tsx

## 📋 Objectif

Extraire le contenu complet du composant `DemarrerMenu.tsx` en format JSON structuré selon une hiérarchie pyramidale pour:
- Documentation du logiciel E-Audit
- Guide d'onboarding client
- Référence des commandes disponibles

## 🏗️ Structure JSON Hiérarchique

```
Suite E-Audit
└── Logiciel (E-audit pro, E-revision, etc.)
    └── Phase de mission (Préparation, Réalisation, Conclusion)
        └── Étape (Collecte documentaire, Programme de travail, etc.)
            └── Mode (Normal, Avancé, Demo, Document, Database)
                └── Variables ([Command], [Processus], [Nb ligne], etc.)
```

## 📁 Fichiers du Dossier

### Scripts d'Extraction

1. **extract_menu_data.js** - Script Node.js pour extraction automatique
2. **extract_menu.py** - Script Python pour extraction robuste
3. **extract_menu_manual.js** - Extraction manuelle guidée

### Résultats

1. **suite_e_audit_structure.json** - Structure complète formatée
2. **suite_e_audit_structure_compact.json** - Version compacte
3. **suite_e_audit_complete.json** - Extraction Python complète

### Documentation

1. **README.md** - Ce fichier
2. **GUIDE_UTILISATION.md** - Guide d'utilisation des données
3. **STRUCTURE_DETAILLEE.md** - Documentation de la structure JSON

## 🚀 Utilisation

### Méthode 1: Script Node.js

```bash
cd "Extraction json DemarrerMenu.tsx"
node extract_menu_data.js
```

### Méthode 2: Script Python

```bash
cd "Extraction json DemarrerMenu.tsx"
python extract_menu.py
```

## 📊 Contenu Extrait

### Logiciels de la Suite E-Audit

1. **E-audit pro** - Audit interne professionnel
2. **E-revision** - Révision comptable et CAC
3. **E-cartographie** - Cartographie des risques
4. **E-audit plan** - Planification des missions
5. **E-CIA exam** - Préparation certification CIA
6. **Bibliothèque** - Ressources documentaires

### Phases de Mission (E-audit pro)

1. **Phase de préparation**
   - Collecte documentaire
   - Questionnaire prise de connaissance
   - Cartographie des processus
   - Cartographie des risques
   - Référentiel de contrôle interne
   - Rapport d'orientation
   - Programme de travail

2. **Phase de réalisation**
   - Feuille couverture
   - Tests de contrôle
   - Documentation des travaux

3. **Phase de conclusion**
   - FRAP (Feuille de Révélation et d'Analyse de Problème)
   - Synthèse des FRAP
   - Rapport provisoire
   - Réunion de clôture
   - Rapport final
   - Suivi des recommandations

### Phases de Mission (E-revision)

1. **Planification**
   - Design du contrôle interne
   - Implementation du contrôle interne
   - Evaluation des risques
   - Feuille de couverture implementation
   - Programme de contrôle des comptes

2. **Revue analytique**
   - Revue analytique générale
   - Analyse des variations

3. **Programme de contrôle** (Cycles comptables)
   - Trésorerie (AA040, AA145, AA160, AA200, etc.)
   - Ventes (BB040, BB145, BB160, BB300, etc.)
   - Stocks (CC020, CC025, CC030, CC035, etc.)
   - Immobilisations (DD040, DD043, DD045, DD104, etc.)
   - Clients (FE040, FE200, FE300, FE340, etc.)
   - Fournisseurs
   - Personnel
   - Capitaux propres
   - Provisions
   - Emprunts

## 🔧 Variables Extraites

Pour chaque mode, les variables suivantes sont extraites:

- **[Command]** - Type de commande
- **[Processus]** - Processus audité
- **[Etape précédente]** - Étape précédente dans le workflow
- **[Etape de mission]** - Étape actuelle
- **[Modele]** - Modèle de table/document
- **[Nb de lignes]** - Nombre de lignes à générer
- **[Variable 1]**, **[Variable 2]** - Variables personnalisées
- **[Integration]** - Type d'intégration
- **[Demo]** - Mode démonstration
- **[Directive]** - Directives spécifiques

## 📸 Captures d'Écran

Les captures d'écran M1 à M4 montrent:
- M1: Menu principal avec liste des logiciels
- M2: Phase de préparation E-audit pro
- M3: Phase de réalisation avec programme de travail
- M4: Phase de conclusion avec FRAP et rapports

## 🎯 Cas d'Usage

### 1. Documentation Produit
Utiliser le JSON pour générer automatiquement:
- Guides utilisateur
- Documentation technique
- Référence des commandes

### 2. Onboarding Client
- Présentation structurée des fonctionnalités
- Parcours guidé par logiciel
- Exemples de commandes par étape

### 3. Formation
- Support de formation structuré
- Exercices pratiques par phase
- Progression pédagogique

### 4. Développement
- Tests automatisés
- Validation des commandes
- Génération de mocks

## 📝 Format JSON

```json
{
  "suite": {
    "nom": "Suite E-Audit",
    "description": "Suite complète d'outils d'audit",
    "version": "1.0.0",
    "date_extraction": "2026-03-26",
    "logiciels": [
      {
        "id": "e-audit-pro",
        "label": "E-audit pro",
        "phases": [
          {
            "id": "phase-preparation",
            "label": "Phase de préparation",
            "etapes": [
              {
                "id": "collecte-documentaire",
                "label": "Collecte documentaire",
                "modes": [
                  {
                    "id": "normal",
                    "label": "Normal",
                    "variables": [
                      {
                        "nom": "Command",
                        "valeur": "Etape de mission"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## 🔍 Analyse des Données

### Statistiques Attendues

- **Logiciels**: 6
- **Phases**: ~15-20
- **Étapes**: ~50-70
- **Modes**: ~100-150
- **Variables**: ~500-800
- **Tests (E-revision)**: ~100+

### Cycles Comptables (E-revision)

1. **Trésorerie** - 10+ tests
2. **Ventes** - 11+ tests
3. **Stocks** - 13+ tests
4. **Immobilisations** - 13+ tests
5. **Clients** - 10+ tests
6. **Fournisseurs** - 10+ tests
7. **Personnel** - 8+ tests
8. **Capitaux propres** - 5+ tests
9. **Provisions** - 5+ tests
10. **Emprunts** - 5+ tests

## 🛠️ Maintenance

### Mise à Jour

Lorsque `DemarrerMenu.tsx` est modifié:

1. Relancer le script d'extraction
2. Vérifier les nouvelles entrées
3. Mettre à jour la documentation
4. Valider la structure JSON

### Validation

```bash
# Valider le JSON
node -e "JSON.parse(require('fs').readFileSync('suite_e_audit_structure.json'))"

# Ou avec Python
python -m json.tool suite_e_audit_complete.json
```

## 📚 Références

- **Composant source**: `src/components/Clara_Components/DemarrerMenu.tsx`
- **Normes d'audit**: ISA, IFACI
- **Référentiel comptable**: SYSCOHADA, PCG

## 👥 Auteurs

- Extraction automatique depuis DemarrerMenu.tsx
- Date: 26 mars 2026
- Projet: Claraverse / E-Audit

## 📄 Licence

Propriété de Claraverse - Usage interne uniquement
