# ARBORESCENCE DÉTAILLÉE - LOGICIEL E-REVISION

## 📋 STRUCTURE HIÉRARCHIQUE COMPLÈTE

```
E-REVISION
├── 📊 REVUE ANALYTIQUE
│   ├── 📈 Revue analytique générale
│   │   └── Command: Revue analytique
│   └── 📊 Analyse des variations
│       └── Command: Analyse des variations
│
├── 🔍 PROGRAMME DE CONTRÔLE
│   ├── 💰 TRÉSORERIE (8 tests)
│   │   ├── AA040 - Rapprochements
│   │   ├── AA145 - Test sur les décaissements après la clôture
│   │   ├── AA160 - Test sur les décaissements avant la clôture
│   │   ├── AA200 - Caisse
│   │   ├── AA400 - Suspens Banque
│   │   ├── AA465 - Note de synthèse rapprochement
│   │   ├── AA02 - Feuilles maîtresses-TRESORERIE
│   │   └── AA02 - Travaux analytiques caisse
│   │
│   ├── 📈 VENTES (9 tests)
│   │   ├── BB040 - Rapprochement CA
│   │   ├── BB145 - Test de séparation des exercices ventes
│   │   ├── BB160 - Test de séparation des exercices avoir
│   │   ├── BB300 - Test de validation analytique
│   │   ├── BB545 - Note de synthèse Test de séparation des exercices
│   │   ├── BB30 - CA-TSE-TVA
│   │   ├── BB20 - Rapprochement de solde CA TVA_TSE
│   │   ├── BB02 - Feuilles maîtresses-CHIFFRE D'AFFAIRES
│   │   └── BB02 - Travaux analytiques CA
│   │
│   ├── 📦 STOCKS (6 tests)
│   │   ├── CC20 - Test sur la centralisation
│   │   ├── CC30 - Test Stock Physique Inventorié
│   │   ├── CC104 - Test la variation stock
│   │   ├── CC145 - Valorisation en CUMP
│   │   └── CC300 - Provisions Dépréciation
│   │
│   ├── 🏢 IMMOBILISATIONS (5 tests)
│   │   ├── DD040 - Tableau Mouvement immobilisations
│   │   ├── DD104 - Test acquisitions
│   │   ├── DD120 - Test sur les cessions
│   │   ├── DD145 - Test dotation aux amortissements
│   │   └── DD180 - Test entretien charges
│   │
│   ├── 👤 CLIENTS (5 tests)
│   │   ├── FE040 - Circularisation client
│   │   ├── FE200 - Procédure alternative
│   │   ├── FE300 - Test de séparation des exercices Client
│   │   ├── FE345 - Créances provisionnées
│   │   └── FE360 - Revue Balance agée
│   │
│   ├── 🏭 FOURNISSEURS (3 tests)
│   │   ├── GG040 - Circularisation fournisseur
│   │   ├── GG200 - Procédure alternative
│   │   └── GG300 - Test de séparation des exercices Fournisseur
│   │
│   ├── 👥 PERSONNEL (4 tests)
│   │   ├── FP040 - Test Cotisations Fiscales
│   │   ├── FP104 - Test Cotisations sociales
│   │   ├── FP130 - Validation base imposable
│   │   └── FP145 - Travaux analytiques salaire
│   │
│   ├── 💼 CAPITAUX PROPRES (3 tests)
│   │   ├── MM040 - Test Tableau mouvement capitaux propres
│   │   ├── MM104 - Test Augmentation capital
│   │   └── MM120 - Test Réduction capital
│   │
│   ├── 💸 CHARGES D'EXPLOITATION (3 tests)
│   │   ├── LL040 - Test Charges externes
│   │   ├── LL104 - Test Autres charges
│   │   └── LL300 - Test Provisions pour risques
│   │
│   └── 🏛️ IMPÔTS ET TAXES (3 tests)
│       ├── NN040 - Test IS
│       ├── NN104 - Test TVA
│       └── NN300 - Test IRVM
│
└── 📋 SYNTHÈSE DE MISSION
    ├── 📄 Synthèse des travaux
    │   └── Command: Synthèse des travaux
    ├── ⚠️ Points d'attention
    │   └── Command: Points d'attention
    └── 📊 Rapport de synthèse
        └── Command: Rapport de synthèse
```

## 🔄 FLUX D'INTERACTION

### Niveau 1 : Menu Principal
```
Menu Démarrer → E-revision
```

### Niveau 2 : Sections Principales
```
E-revision → [Revue analytique | Programme de contrôle | Synthèse de mission]
```

### Niveau 3 : Cycles Comptables (Programme de contrôle uniquement)
```
Programme de contrôle → [Trésorerie | Ventes | Stocks | ... | Impôts et taxes]
```

### Niveau 4 : Tests Spécifiques
```
Cycle → [Test 1 | Test 2 | Test 3 | ...]
```

### Niveau 5 : Modes d'Exécution
```
Test → [Normal | Demo | Avancé | Intelligent | Manuel]
```

## 📊 STATISTIQUES PAR CYCLE

| Cycle Comptable | Nombre de Tests | Codes de Référence |
|-----------------|-----------------|-------------------|
| Trésorerie | 8 | AA040, AA145, AA160, AA200, AA400, AA465, AA02 |
| Ventes | 9 | BB040, BB145, BB160, BB300, BB545, BB30, BB20, BB02 |
| Stocks | 6 | CC20, CC30, CC104, CC145, CC300 |
| Immobilisations | 5 | DD040, DD104, DD120, DD145, DD180 |
| Clients | 5 | FE040, FE200, FE300, FE345, FE360 |
| Fournisseurs | 3 | GG040, GG200, GG300 |
| Personnel | 4 | FP040, FP104, FP130, FP145 |
| Capitaux propres | 3 | MM040, MM104, MM120 |
| Charges d'exploitation | 3 | LL040, LL104, LL300 |
| Impôts et taxes | 3 | NN040, NN104, NN300 |

**TOTAL : 49 tests répartis sur 10 cycles comptables**

## 🎯 MODES D'EXÉCUTION DISPONIBLES

Pour chaque test, 5 modes sont disponibles :

1. **Normal** - Exécution standard
2. **Demo** - Mode démonstration avec préfixe `[Demo] = Activate`
3. **Avancé** - Mode avancé avec préfixe `[Mode] = Avancé`
4. **Intelligent** - Mode intelligent avec préfixe `[Mode] = Intelligent`
5. **Manuel** - Mode manuel avec préfixe `[Mode] = Manuel`

## 🔧 STRUCTURE TECHNIQUE

### Types TypeScript
```typescript
interface TestItem {
  id: string;
  reference: string;
  label: string;
  processus: string;
  command: string;
}

interface CycleComptable {
  id: string;
  label: string;
  icon: React.ReactNode;
  tests: TestItem[];
}

interface PhaseItem {
  id: string;
  label: string;
  etapes?: EtapeItem[];
  cycles?: CycleComptable[];
}
```

### Navigation
- **Expansion/Contraction** des cycles
- **Sélection visuelle** des éléments actifs
- **Menu contextuel** pour les modes
- **Génération automatique** des commandes

## 📝 COMMANDES GÉNÉRÉES

Chaque test génère une commande au format :
```
[Command] = /feuille couverture
[Processus] = [NOM_DU_PROCESSUS]
[test] = [CODE_REFERENCE]
[reference] = [DESCRIPTION_TEST]
[Nb de lignes] = 10
```

Exemple pour le test AA040 :
```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = Rapprochements
[Nb de lignes] = 10
```

## 🎨 INTERFACE UTILISATEUR

- **Icônes spécifiques** par cycle comptable
- **Codes de couleur** pour la navigation
- **Animation d'expansion** pour les sous-menus
- **Indicateurs visuels** pour les éléments actifs
- **Menu flottant** pour les modes d'exécution

Cette arborescence représente la structure complète et fonctionnelle du logiciel E-revision intégrée dans le menu Démarrer de ClaraVerse.