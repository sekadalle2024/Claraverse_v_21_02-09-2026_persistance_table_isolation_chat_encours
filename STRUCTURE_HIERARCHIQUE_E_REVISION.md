# Structure Hiérarchique E-revision

## 🏗️ Architecture du Menu

La structure du menu E-revision a été réorganisée de manière hiérarchique pour une meilleure navigation :

```
E-revision
├── 📊 Revue analytique
│   ├── Revue analytique générale
│   │   ├── Normal
│   │   ├── Avancé
│   │   ├── Intelligent
│   │   └── Manuel
│   └── Analyse des variations
│       ├── Normal
│       ├── Avancé
│       ├── Intelligent
│       └── Manuel
├── 🔍 Contrôle des comptes
│   ├── 💰 Trésorerie
│   │   ├── AA040 - test sur la validation du compte caisse
│   │   │   ├── Normal
│   │   │   └── Demo
│   │   ├── AA145 - Test sur les décaissements après la clôture
│   │   │   ├── Normal
│   │   │   └── Demo
│   │   ├── AA160 - Test sur les décaissements avant la clôture
│   │   │   ├── Normal
│   │   │   └── Demo
│   │   ├── AA200 - Caisse
│   │   │   ├── Normal
│   │   │   └── Demo
│   │   └── AA400 - Suspens Banque
│   │       ├── Normal
│   │       └── Demo
│   ├── 📈 Ventes
│   │   ├── BB040 - Rapprochement CA
│   │   ├── BB145 - Test de séparation des exercices ventes
│   │   ├── BB160 - Test de séparation des exercices avoir
│   │   └── BB300 - Test de validation analytique
│   ├── 📦 Stocks
│   │   ├── CC20 - Test sur la centralisation
│   │   ├── CC30 - Test Stock Physique Inventorié
│   │   ├── CC104 - Test la variation stock
│   │   ├── CC145 - Valorisation en CUMP
│   │   └── CC300 - Provisions Dépréciation
│   ├── 🏢 Immobilisations
│   │   ├── DD040 - Tableau Mouvement immobilisations
│   │   ├── DD104 - Test acquisitions
│   │   ├── DD120 - Test sur les cessions
│   │   ├── DD145 - Test dotation aux amortissements
│   │   └── DD180 - Test entretien charges
│   ├── 👥 Clients
│   │   ├── FE040 - Circularisation client
│   │   ├── FE200 - Procédure alternative
│   │   ├── FE300 - Test de séparation des exercices Client
│   │   ├── FE345 - Créances provisionnées
│   │   └── FE360 - Revue Balance agée
│   ├── 🏪 Fournisseurs
│   │   ├── FF040 - Circularisation fournisseurs
│   │   ├── FF200 - Procédure alternative FRS
│   │   ├── FF300 - Test de séparation des exercices Fournisseurs
│   │   ├── FF400 - Test PCA CCA
│   │   └── FF445 - Test charges récurrentes
│   ├── 👨‍💼 Personnel
│   │   ├── FP040 - Test Cotisations Fiscales
│   │   ├── FP45 - Rapprochement de solde BG-livre de paie
│   │   ├── FP104 - Test Cotisations sociales
│   │   ├── FP130 - Validation base imposable
│   │   └── FP145 - Travaux analytiques salaire
│   ├── 💼 Capitaux propres
│   │   ├── FQ200 - Emprunts et dettes
│   │   ├── FQ300 - Tableau provision RC
│   │   └── FQ400 - Subventions
│   ├── 💸 Charges d'exploitation
│   │   ├── MM042 - TEST DETAIL PUB
│   │   ├── MM200 - Test sur les charges prestations
│   │   ├── MM245 - Test TSE
│   │   ├── MM300 - Test patentes
│   │   └── MM400 - Test impôt Foncier
│   └── 🏛️ Impôts et taxes
│       ├── NN040 - Rapprochement de solde TVA - CA
│       ├── NN200 - Test CN
│       ├── NN220 - Test IGR
│       ├── NN245 - Test IRC
│       └── NN300 - Test IRVM
└── 📋 Synthèse de mission
    ├── Synthèse des travaux
    │   ├── Normal
    │   ├── Avancé
    │   ├── Intelligent
    │   └── Manuel
    ├── Points d'attention
    │   ├── Normal
    │   ├── Avancé
    │   ├── Intelligent
    │   └── Manuel
    └── Rapport de synthèse
        ├── Normal
        ├── Avancé
        ├── Intelligent
        └── Manuel
```

## 📊 Niveaux hiérarchiques

### Niveau 1 : Logiciel
- **E-revision**

### Niveau 2 : Phases principales
- **Revue analytique** : Analyses préliminaires et revues globales
- **Contrôle des comptes** : Tests détaillés par cycles comptables
- **Synthèse de mission** : Conclusions et rapports finaux

### Niveau 3 : Sous-catégories
- **Pour Revue analytique** : Types d'analyses
- **Pour Contrôle des comptes** : Cycles comptables (10 cycles)
- **Pour Synthèse de mission** : Types de synthèses

### Niveau 4 : Tests/Actions spécifiques
- **Pour Revue analytique** : Actions d'analyse
- **Pour Contrôle des comptes** : Feuilles de test (47 tests)
- **Pour Synthèse de mission** : Actions de synthèse

### Niveau 5 : Modes d'exécution
- **Pour Revue analytique et Synthèse** : Normal, Avancé, Intelligent, Manuel
- **Pour Contrôle des comptes** : Normal, Demo

## 🎯 Navigation utilisateur

### Chemin d'accès typique
1. Clic sur **[Démarrer]**
2. Sélection **E-revision**
3. Choix de la phase :
   - **Revue analytique** (pour analyses préliminaires)
   - **Contrôle des comptes** (pour tests détaillés)
   - **Synthèse de mission** (pour conclusions)
4. Sélection du sous-élément
5. Choix du mode d'exécution

### Exemple : Test de trésorerie
```
[Démarrer] → E-revision → Contrôle des comptes → Trésorerie → AA040 → Demo
```

## 📝 Types de commandes générées

### Revue analytique
```
[Command] = Revue analytique
[Processus] = 
[Période] = 
[Objectif] = 
```

### Contrôle des comptes (Mode Normal)
```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = test sur la validation du compte caisse
[Nb de lignes] = 10
```

### Contrôle des comptes (Mode Demo)
```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = test sur la validation du compte caisse
[Nb de lignes] = 10
[Demo] = Activate
```

### Synthèse de mission
```
[Command] = Synthèse des travaux
[Mission] = 
[Période] = 
[Conclusions] = 
```

## 📊 Statistiques

- **Phases principales** : 3
- **Cycles comptables** : 10
- **Feuilles de test** : 47
- **Actions de revue analytique** : 2
- **Actions de synthèse** : 3
- **Total d'éléments** : 62
- **Modes disponibles** : 6 (Normal, Demo, Avancé, Intelligent, Manuel)

## 🎨 Avantages de cette structure

### Pour les utilisateurs
- **Navigation intuitive** : Structure logique par phases de mission
- **Recherche facilitée** : Organisation par cycles comptables
- **Flexibilité** : Différents modes selon le contexte

### Pour la maintenance
- **Extensibilité** : Facile d'ajouter de nouveaux tests
- **Cohérence** : Structure uniforme pour tous les éléments
- **Documentation** : Hiérarchie claire et documentée

## 🔧 Implémentation technique

La structure est implémentée dans `public/demarrer-menu.js` avec :
- Configuration hiérarchique dans `MENU_CONFIG`
- Gestion des modes spécifiques (Demo pour contrôles, autres modes pour revue/synthèse)
- Interface utilisateur adaptée à la profondeur de navigation

---

**Version** : 2.0 (Structure hiérarchique)  
**Date** : 2 mars 2026  
**Auteur** : Équipe E-audit