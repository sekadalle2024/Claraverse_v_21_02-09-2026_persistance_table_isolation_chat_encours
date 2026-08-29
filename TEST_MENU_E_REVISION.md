# Test du Menu E-revision - Contrôles des Comptes

## 🎯 Objectif

Vérifier que le menu E-revision fonctionne correctement avec la nouvelle structure des contrôles des comptes organisée par cycles comptables.

## ✅ Checklist de test

### 1. Vérification de l'affichage du menu

- [ ] Le bouton **[Démarrer]** est visible dans l'interface
- [ ] Le menu s'ouvre au clic sur **[Démarrer]**
- [ ] La section **E-revision** est présente dans le menu
- [ ] La sous-section **Contrôle des comptes** est visible

### 2. Vérification des cycles comptables

Vérifier que tous les cycles sont présents :

- [ ] Trésorerie (5 tests)
- [ ] Ventes (4 tests)
- [ ] Stocks (5 tests)
- [ ] Immobilisations (5 tests)
- [ ] Clients (5 tests)
- [ ] Fournisseurs (5 tests)
- [ ] Personnel (5 tests)
- [ ] Capitaux propres (3 tests)
- [ ] Charges d'exploitation (5 tests)
- [ ] Impôts et taxes (5 tests)

### 3. Test du cycle Trésorerie

#### Test AA040 - Mode Normal
1. Cliquez sur **[Démarrer]**
2. Sélectionnez **E-revision** > **Contrôle des comptes** > **Trésorerie**
3. Cliquez sur **AA040 - test sur la validation du compte caisse**
4. Sélectionnez **Normal**

**Résultat attendu dans la zone de saisie :**
```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = test sur la validation du compte caisse
[Nb de lignes] = 10
```

- [ ] La commande est correctement insérée
- [ ] Tous les paramètres sont présents
- [ ] Le format est correct

#### Test AA040 - Mode Demo
1. Répétez les étapes 1-3 ci-dessus
2. Sélectionnez **Demo**

**Résultat attendu dans la zone de saisie :**
```
[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = test sur la validation du compte caisse
[Nb de lignes] = 10
[Demo] = Activate
```

- [ ] La commande est correctement insérée
- [ ] Le paramètre `[Demo] = Activate` est ajouté
- [ ] Le format est correct

### 4. Test du cycle Ventes

#### Test BB040 - Mode Normal
1. Sélectionnez **E-revision** > **Contrôle des comptes** > **Ventes**
2. Cliquez sur **BB040 - Rapprochement CA**
3. Sélectionnez **Normal**

**Résultat attendu :**
```
[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB040
[reference] = Rapprochement CA
[Nb de lignes] = 10
```

- [ ] La commande est correctement générée
- [ ] Le processus est "VENTES" (en majuscules)

### 5. Test du cycle Stocks

#### Test CC145 - Mode Demo
1. Sélectionnez **E-revision** > **Contrôle des comptes** > **Stocks**
2. Cliquez sur **CC145 - Valorisation en CUMP**
3. Sélectionnez **Demo**

**Résultat attendu :**
```
[Command] = /feuille couverture
[Processus] = Stock
[test] = CC145
[reference] = Valorisation en CUMP
[Nb de lignes] = 10
[Demo] = Activate
```

- [ ] La commande inclut le mode Demo

### 6. Test du cycle Immobilisations

#### Test DD145 - Mode Normal
1. Sélectionnez **E-revision** > **Contrôle des comptes** > **Immobilisations**
2. Cliquez sur **DD145 - Test dotation aux amortissements**
3. Sélectionnez **Normal**

**Résultat attendu :**
```
[Command] = /feuille couverture
[Processus] = IMMOBILISATIONS
[test] = DD145
[reference] = Test dotation aux amortissements
[Nb de lignes] = 10
```

- [ ] La commande est correctement générée

### 7. Test du cycle Clients

#### Test FE360 - Mode Demo
1. Sélectionnez **E-revision** > **Contrôle des comptes** > **Clients**
2. Cliquez sur **FE360 - Revue Balance agée**
3. Sélectionnez **Demo**

- [ ] La commande est correctement générée avec `[Demo] = Activate`

### 8. Test du cycle Fournisseurs

#### Test FF300 - Mode Normal
1. Sélectionnez **E-revision** > **Contrôle des comptes** > **Fournisseurs**
2. Cliquez sur **FF300 - Test de séparation des exercices Fournisseurs**
3. Sélectionnez **Normal**

- [ ] La commande est correctement générée

### 9. Test du cycle Personnel

#### Test FP145 - Mode Demo
1. Sélectionnez **E-revision** > **Contrôle des comptes** > **Personnel**
2. Cliquez sur **FP145 - Travaux analytiques salaire**
3. Sélectionnez **Demo**

- [ ] La commande est correctement générée avec le mode Demo

### 10. Test du cycle Capitaux propres

#### Test FQ300 - Mode Normal
1. Sélectionnez **E-revision** > **Contrôle des comptes** > **Capitaux propres**
2. Cliquez sur **FQ300 - Tableau provision RC**
3. Sélectionnez **Normal**

- [ ] La commande est correctement générée

### 11. Test du cycle Charges d'exploitation

#### Test MM400 - Mode Demo
1. Sélectionnez **E-revision** > **Contrôle des comptes** > **Charges d'exploitation**
2. Cliquez sur **MM400 - Test impôt Foncier**
3. Sélectionnez **Demo**

- [ ] La commande est correctement générée

### 12. Test du cycle Impôts et taxes

#### Test NN300 - Mode Normal
1. Sélectionnez **E-revision** > **Contrôle des comptes** > **Impôts et taxes**
2. Cliquez sur **NN300 - Test IRVM**
3. Sélectionnez **Normal**

- [ ] La commande est correctement générée

### 13. Tests d'interface

- [ ] Le menu se ferme après la sélection d'un mode
- [ ] Le bouton **[Démarrer]** change d'état (actif/inactif)
- [ ] Les animations sont fluides
- [ ] Le menu est responsive
- [ ] Le thème sombre/clair fonctionne correctement
- [ ] Le scroll fonctionne dans le menu si nécessaire

### 14. Tests de navigation

- [ ] On peut naviguer entre les différents cycles
- [ ] On peut revenir en arrière dans le menu
- [ ] Le menu se ferme en cliquant en dehors
- [ ] Le menu se ferme en cliquant sur le bouton **[Démarrer]** à nouveau

### 15. Tests de copier-coller

- [ ] La commande générée peut être copiée depuis la zone de saisie
- [ ] La commande peut être modifiée manuellement
- [ ] Le format reste correct après modification

## 🐛 Problèmes identifiés

| # | Description | Gravité | Statut |
|---|-------------|---------|--------|
| 1 |             |         |        |
| 2 |             |         |        |
| 3 |             |         |        |

## 📊 Résultats des tests

- **Tests réussis** : __ / 15
- **Tests échoués** : __ / 15
- **Taux de réussite** : __%

## 💡 Recommandations

1. Tester avec différents navigateurs (Chrome, Firefox, Edge)
2. Tester sur différentes résolutions d'écran
3. Vérifier la performance avec un grand nombre de tests
4. Tester l'accessibilité (navigation au clavier)

## 📝 Notes

_Ajoutez ici vos observations pendant les tests_

---

**Date du test** : ___________  
**Testeur** : ___________  
**Version** : 1.0  
**Environnement** : ___________
