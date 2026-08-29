# Structure du Tableau des Flux de Trésorerie (TFT) SYSCOHADA

## Vue d'ensemble

Le Tableau des Flux de Trésorerie (TFT) présente les flux de trésorerie de l'exercice classés en trois catégories :
1. Activités opérationnelles
2. Activités d'investissement
3. Activités de financement

## Structure Complète

### A. TRÉSORERIE D'OUVERTURE

| Réf | Libellé | Calcul |
|-----|---------|--------|
| ZA | Trésorerie nette au 1er janvier | Trésorerie actif N-1 - Trésorerie passif N-1 |

### B. FLUX DE TRÉSORERIE PROVENANT DES ACTIVITÉS OPÉRATIONNELLES

| Réf | Libellé | Source |
|-----|---------|--------|
| FA | Capacité d'Autofinancement Globale (CAFG) | Calculé depuis le compte de résultat |
| FB | - Variation d'actif circulant HAO | Variation des comptes HAO |
| FC | - Variation des stocks | Variation classe 3 |
| FD | - Variation des créances | Variation classe 4 (créances) |
| FE | + Variation du passif circulant | Variation classe 4 (dettes) |
| ZB | **Flux de trésorerie opérationnels** | **FA + FB + FC + FD + FE** |

### C. FLUX DE TRÉSORERIE PROVENANT DES ACTIVITÉS D'INVESTISSEMENT

| Réf | Libellé | Source |
|-----|---------|--------|
| FF | - Décaissements acquisitions immobilisations incorporelles | Variation classe 21 |
| FG | - Décaissements acquisitions immobilisations corporelles | Variation classe 22-24 |
| FH | - Décaissements acquisitions immobilisations financières | Variation classe 26-27 |
| FI | + Encaissements cessions immobilisations incorporelles/corporelles | Compte 82 |
| FJ | + Encaissements cessions immobilisations financières | Compte 826 |
| ZC | **Flux de trésorerie d'investissement** | **FF + FG + FH + FI + FJ** |

### D. FLUX DE TRÉSORERIE PROVENANT DU FINANCEMENT PAR CAPITAUX PROPRES

| Réf | Libellé | Source |
|-----|---------|--------|
| FK | + Augmentations de capital par apports nouveaux | Variation compte 101 |
| FL | + Subventions d'investissement reçues | Variation compte 14 |
| FM | - Prélèvements sur le capital | Diminution compte 101 |
| FN | - Dividendes versés | Compte 46 ou variation 12 |
| ZD | **Flux de trésorerie capitaux propres** | **FK + FL + FM + FN** |

### E. FLUX DE TRÉSORERIE PROVENANT DU FINANCEMENT PAR CAPITAUX ÉTRANGERS

| Réf | Libellé | Source |
|-----|---------|--------|
| FO | + Emprunts | Variation comptes 161, 162, 1661, 1662 |
| FP | + Autres dettes financières diverses | Variation compte 16 (sauf ci-dessus) et 18 |
| FQ | - Remboursements emprunts et autres dettes financières | Diminution comptes 16 et 18 |
| ZE | **Flux de trésorerie capitaux étrangers** | **FO + FP + FQ** |

### F. TOTAL FLUX DE FINANCEMENT

| Réf | Libellé | Calcul |
|-----|---------|--------|
| ZF | Flux de trésorerie activités de financement | ZD + ZE |

### G. VARIATION ET TRÉSORERIE FINALE

| Réf | Libellé | Calcul |
|-----|---------|--------|
| ZG | Variation de la trésorerie nette de la période | ZB + ZC + ZF |
| ZH | Trésorerie nette au 31 décembre | ZG + ZA |

### CONTRÔLE

Trésorerie actif N - Trésorerie passif N = ZH

## Calcul de la CAFG (Capacité d'Autofinancement Globale)

### Méthode Additive (à partir du résultat net)

```
CAFG = Résultat net
     + Dotations aux amortissements et provisions (681, 691, 697, 851)
     - Reprises sur amortissements et provisions (781, 791, 797, 861)
     + Valeur comptable des cessions d'immobilisations (81)
     - Produits de cessions d'immobilisations (82)
     - Subventions d'investissement virées au résultat (865)
```

### Méthode Soustractive (à partir de l'EBE)

```
CAFG = EBE
     + Autres produits d'exploitation (75)
     - Autres charges d'exploitation (65)
     + Produits financiers (77)
     - Charges financières (67)
     + Gains de change (776)
     - Pertes de change (676)
     + Produits HAO (sauf 82, 865)
     - Charges HAO (sauf 81)
     - Participation des travailleurs (87)
     - Impôts sur le résultat (89)
```

## Variations à Calculer

### Variations d'Actif (signe -)
- **Stocks** : Stock N - Stock N-1 (classe 3)
- **Créances** : Créances N - Créances N-1 (comptes 40, 41, 42, 43, 44, 45, 46, 47, 48)
- **Actif circulant HAO** : Variation des comptes HAO à l'actif

### Variations de Passif (signe +)
- **Dettes** : Dettes N - Dettes N-1 (comptes 40, 42, 43, 44, 45, 46, 47, 48)

### Variations d'Immobilisations (signe -)
- **Immobilisations incorporelles** : Variation brute classe 21
- **Immobilisations corporelles** : Variation brute classe 22-24
- **Immobilisations financières** : Variation brute classe 26-27

### Variations de Financement
- **Capital** : Variation compte 101
- **Subventions** : Variation compte 14
- **Emprunts** : Variation comptes 161, 162, 1661, 1662
- **Autres dettes financières** : Variation autres comptes 16 et 18

## Contrôles Spécifiques TFT

### 1. Cohérence Trésorerie
```
Trésorerie finale calculée (ZH) = Trésorerie bilan N (Actif - Passif)
```

### 2. Cohérence Variation
```
Variation calculée (ZG) = Trésorerie N - Trésorerie N-1
```

### 3. Cohérence CAFG
La CAFG doit être cohérente avec le résultat net et les retraitements

### 4. Équilibre des Flux
```
ZB + ZC + ZF = ZG
```

### 5. Sens des Variations
- Augmentation d'actif = flux négatif (emploi)
- Augmentation de passif = flux positif (ressource)
- Diminution d'actif = flux positif (ressource)
- Diminution de passif = flux négatif (emploi)

## Notes Importantes

1. **Exclusions** : Les variations de créances et dettes liées aux investissements et financements sont exclues des activités opérationnelles

2. **Emprunts** : Comptes 161, 162, 1661, 1662 uniquement

3. **Autres dettes financières** : Compte 16 (sauf emprunts ci-dessus) et compte 18

4. **Méthode** : Méthode indirecte (à partir du résultat net)

## Besoin de Données

Pour calculer le TFT, il faut :
- Balance N (exercice en cours)
- Balance N-1 (exercice précédent)
- Compte de résultat N
- Bilan N et N-1

## Date de Création
22 mars 2026
