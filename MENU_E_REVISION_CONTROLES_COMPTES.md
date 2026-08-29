# Menu E-revision - Contrôles des Comptes

## 📋 Vue d'ensemble

Le menu E-revision a été mis à jour pour inclure une structure complète des contrôles des comptes organisée par cycles comptables. Cette structure est basée sur le fichier Excel "Programme controle.xlsx" situé à la racine du projet.

## 🏗️ Structure du Menu

```
E-revision
└── Contrôle des comptes
    ├── Trésorerie (5 tests)
    ├── Ventes (4 tests)
    ├── Stocks (5 tests)
    ├── Immobilisations (5 tests)
    ├── Clients (5 tests)
    ├── Fournisseurs (5 tests)
    ├── Personnel (5 tests)
    ├── Capitaux propres (3 tests)
    ├── Charges d'exploitation (5 tests)
    └── Impôts et taxes (5 tests)
```

## 📊 Cycles Comptables

### 1. Trésorerie
- **AA040** - Test sur la validation du compte caisse
- **AA145** - Test sur les décaissements après la clôture
- **AA160** - Test sur les décaissements avant la clôture
- **AA200** - Caisse
- **AA400** - Suspens Banque

### 2. Ventes
- **BB040** - Rapprochement CA
- **BB145** - Test de séparation des exercices ventes
- **BB160** - Test de séparation des exercices avoir
- **BB300** - Test de validation analytique

### 3. Stocks
- **CC20** - Test sur la centralisation
- **CC30** - Test Stock Physique Inventorié
- **CC104** - Test la variation stock
- **CC145** - Valorisation en CUMP
- **CC300** - Provisions Dépréciation

### 4. Immobilisations
- **DD040** - Tableau Mouvement immobilisations
- **DD104** - Test acquisitions
- **DD120** - Test sur les cessions
- **DD145** - Test dotation aux amortissements
- **DD180** - Test entretien charges

### 5. Clients
- **FE040** - Circularisation client
- **FE200** - Procédure alternative
- **FE300** - Test de séparation des exercices Client
- **FE345** - Créances provisionnées
- **FE360** - Revue Balance agée

### 6. Fournisseurs
- **FF040** - Circularisation fournisseurs
- **FF200** - Procédure alternative FRS
- **FF300** - Test de séparation des exercices Fournisseurs
- **FF400** - Test PCA CCA
- **FF445** - Test charges récurrentes

### 7. Personnel
- **FP040** - Test Cotisations Fiscales
- **FP45** - Rapprochement de solde BG-livre de paie
- **FP104** - Test Cotisations sociales
- **FP130** - Validation base imposable
- **FP145** - Travaux analytiques salaire

### 8. Capitaux propres
- **FQ200** - Emprunts et dettes
- **FQ300** - Tableau provision RC
- **FQ400** - Subventions

### 9. Charges d'exploitation
- **MM042** - TEST DETAIL PUB
- **MM200** - Test sur les charges prestations
- **MM245** - Test TSE
- **MM300** - Test patentes
- **MM400** - Test impôt Foncier

### 10. Impôts et taxes
- **NN040** - Rapprochement de solde TVA - CA
- **NN200** - Test CN
- **NN220** - Test IGR
- **NN245** - Test IRC
- **NN300** - Test IRVM

## 🎯 Modes d'utilisation

Chaque feuille de test dispose de 2 modes :

### Mode Normal
Génère une commande standard avec les paramètres suivants :
```
[Command] = /feuille couverture
[Processus] = [nom du processus]
[test] = [référence du test]
[reference] = [nom complet du test]
[Nb de lignes] = 10
```

### Mode Demo
Génère la même commande que le mode Normal avec l'ajout de :
```
[Demo] = Activate
```

## 💡 Utilisation

1. Cliquez sur le bouton **[Démarrer]** dans l'interface du chat
2. Sélectionnez **E-revision**
3. Naviguez vers **Contrôle des comptes**
4. Choisissez un cycle comptable (ex: Trésorerie)
5. Sélectionnez une feuille de test
6. Choisissez le mode (Normal ou Demo)
7. La commande est automatiquement insérée dans la zone de saisie

## 📝 Exemple de commande générée

### Mode Normal
```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = test sur la validation du compte caisse
[Nb de lignes] = 10
```

### Mode Demo
```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = test sur la validation du compte caisse
[Nb de lignes] = 10
[Demo] = Activate
```

## 🔧 Fichiers modifiés

- **public/demarrer-menu.js** : Ajout de la structure complète du menu E-revision avec tous les cycles comptables et leurs tests

## 📊 Statistiques

- **Total de cycles comptables** : 10
- **Total de feuilles de test** : 47
- **Modes disponibles** : 2 (Normal, Demo)
- **Total de commandes possibles** : 94 (47 tests × 2 modes)

## 🎨 Interface

Le menu conserve le même design que les autres sections :
- Navigation hiérarchique à 4 niveaux
- Icônes pour chaque section
- Animation fluide
- Design responsive
- Thème clair/sombre

## ✅ Validation

Pour tester la nouvelle structure :
1. Ouvrez l'application E-audit
2. Cliquez sur **[Démarrer]**
3. Vérifiez que **E-revision** apparaît dans le menu
4. Naviguez dans les différents cycles comptables
5. Testez la génération de commandes en mode Normal et Demo

---

**Date de mise à jour** : 2 mars 2026  
**Version** : 1.0  
**Auteur** : Équipe E-audit
