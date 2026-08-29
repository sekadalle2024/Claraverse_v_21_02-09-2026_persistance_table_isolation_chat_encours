# Contrôles du Tableau des Flux de Trésorerie (TFT)

## Vue d'ensemble

Le Tableau des Flux de Trésorerie nécessite des contrôles spécifiques pour garantir la cohérence des flux calculés et leur concordance avec les états financiers.

## Liste des Contrôles TFT

### 1. Cohérence Trésorerie 💰

#### Objectif
Vérifier que la trésorerie finale calculée par le TFT correspond à la trésorerie du bilan.

#### Formule
```
Trésorerie calculée (ZH) = Trésorerie bilan N (Actif - Passif)
```

#### Détails
- **Trésorerie calculée** : ZA (ouverture) + ZG (variation)
- **Trésorerie bilan** : Comptes 50, 51, 52, 53, 54, 57, 58 (actif) - Compte 56 (passif)

#### Seuil de Tolérance
- **< 0,01** : ✅ Cohérent
- **≥ 0,01** : ❌ Incohérent

#### Causes Possibles d'Incohérence
1. Erreur dans le calcul des flux
2. Comptes de trésorerie mal identifiés
3. Variation de trésorerie incomplète
4. Erreur dans la balance N ou N-1

#### Actions Correctives
- Vérifier les comptes de trésorerie (50-58)
- Contrôler les variations calculées
- Vérifier la cohérence des balances N et N-1

---

### 2. Équilibre des Flux ⚖️

#### Objectif
Vérifier que la somme des trois catégories de flux correspond à la variation de trésorerie.

#### Formule
```
ZB (flux opérationnels) + ZC (flux investissement) + ZF (flux financement) = ZG (variation trésorerie)
```

#### Interprétation
- **Différence < 0,01** : ✅ Équilibré
- **Différence ≥ 0,01** : ❌ Déséquilibré

#### Causes Possibles de Déséquilibre
1. Erreur de calcul dans une catégorie de flux
2. Flux oublié ou compté deux fois
3. Erreur de signe (+ au lieu de -)

#### Actions Correctives
- Vérifier chaque catégorie de flux
- Contrôler les signes des variations
- Recalculer les totaux

---

### 3. Cohérence CAFG 📊

#### Objectif
Vérifier que la Capacité d'Autofinancement Globale est correctement calculée à partir du résultat net.

#### Formule (Méthode Additive)
```
CAFG = Résultat net
     + Dotations aux amortissements et provisions (681, 691, 697, 851)
     - Reprises sur amortissements et provisions (781, 791, 797, 861)
     + Valeur comptable des cessions d'immobilisations (81)
     - Produits de cessions d'immobilisations (82)
     - Subventions d'investissement virées au résultat (865)
```

#### Éléments Contrôlés
| Élément | Comptes | Signe | Nature |
|---------|---------|-------|--------|
| Résultat net | CR | Base | Produits - Charges |
| Dotations | 681, 691, 697, 851 | + | Charges non décaissables |
| Reprises | 781, 791, 797, 861 | - | Produits non encaissables |
| Valeur compt. cessions | 81 | + | Charges HAO |
| Produits cessions | 82 | - | Produits HAO |
| Subventions virées | 865 | - | Produits HAO |

#### Interprétation
- **CAFG positive** : L'entreprise génère de la trésorerie par son activité
- **CAFG négative** : L'entreprise consomme de la trésorerie

#### Actions si CAFG Négative
1. Analyser la rentabilité de l'entreprise
2. Vérifier les charges non décaissables
3. Contrôler les produits non encaissables

---

### 4. Cohérence Variation Trésorerie 🔄

#### Objectif
Vérifier que la variation calculée correspond à la différence entre trésorerie N et N-1.

#### Formule
```
ZG (variation calculée) = Trésorerie N - Trésorerie N-1
```

#### Détails
- **Trésorerie N** : Calculée depuis la balance N
- **Trésorerie N-1** : Calculée depuis la balance N-1
- **Variation** : Différence entre les deux

#### Seuil de Tolérance
- **< 0,01** : ✅ Cohérent
- **≥ 0,01** : ❌ Incohérent

---

### 5. Sens des Variations 🔀

#### Objectif
Vérifier que les variations ont le bon signe selon leur nature.

#### Règles de Sens

##### Variations d'Actif (signe -)
- **Augmentation d'actif** = Emploi de trésorerie (flux négatif)
- **Diminution d'actif** = Ressource de trésorerie (flux positif)

Exemples :
- Augmentation des stocks → Flux négatif (achat de stocks)
- Augmentation des créances → Flux négatif (ventes non encaissées)
- Diminution des immobilisations → Flux positif (cessions)

##### Variations de Passif (signe +)
- **Augmentation de passif** = Ressource de trésorerie (flux positif)
- **Diminution de passif** = Emploi de trésorerie (flux négatif)

Exemples :
- Augmentation des dettes → Flux positif (achats à crédit)
- Augmentation des emprunts → Flux positif (nouveaux financements)
- Remboursement d'emprunts → Flux négatif (sortie de trésorerie)

#### Contrôles Spécifiques

| Poste | Variation | Signe Attendu | Impact Trésorerie |
|-------|-----------|---------------|-------------------|
| Stocks ↑ | Positive | - | Emploi |
| Stocks ↓ | Négative | + | Ressource |
| Créances ↑ | Positive | - | Emploi |
| Créances ↓ | Négative | + | Ressource |
| Dettes ↑ | Positive | + | Ressource |
| Dettes ↓ | Négative | - | Emploi |
| Immobilisations ↑ | Positive | - | Emploi |
| Immobilisations ↓ | Négative | + | Ressource |
| Emprunts ↑ | Positive | + | Ressource |
| Emprunts ↓ | Négative | - | Emploi |

---

### 6. Exclusions des Activités Opérationnelles ⚠️

#### Objectif
Vérifier que les variations de créances et dettes liées aux investissements et financements sont exclues des activités opérationnelles.

#### Éléments à Exclure

##### Créances sur Cessions d'Immobilisations
- Compte 485 : Créances sur cessions d'immobilisations
- À exclure des variations de créances opérationnelles
- À inclure dans les flux d'investissement

##### Dettes sur Acquisitions d'Immobilisations
- Compte 404 : Fournisseurs d'immobilisations
- À exclure des variations de dettes opérationnelles
- À inclure dans les flux d'investissement

##### Créances sur Subventions d'Investissement
- Compte 451 : Créances sur subventions d'investissement
- À exclure des variations de créances opérationnelles
- À inclure dans les flux de financement

#### Contrôle
Vérifier que ces comptes ne sont pas inclus dans :
- FB : Variation d'actif circulant HAO
- FD : Variation des créances
- FE : Variation du passif circulant

---

### 7. Cohérence avec le Compte de Résultat 📈

#### Objectif
Vérifier que les éléments du TFT sont cohérents avec le compte de résultat.

#### Contrôles Croisés

| Élément TFT | Source CR | Contrôle |
|-------------|-----------|----------|
| Résultat net | Total Produits - Total Charges | Égalité stricte |
| Dotations | Comptes 681, 691, 697, 851 | Cohérence montants |
| Reprises | Comptes 781, 791, 797, 861 | Cohérence montants |
| Produits cessions | Compte 82 | Égalité stricte |
| Valeur compt. cessions | Compte 81 | Égalité stricte |

---

### 8. Cohérence avec le Bilan 🏛️

#### Objectif
Vérifier que les variations calculées correspondent aux variations du bilan.

#### Contrôles Croisés

| Élément TFT | Source Bilan | Contrôle |
|-------------|--------------|----------|
| Variation stocks | Stocks N - Stocks N-1 | Égalité |
| Variation créances | Créances N - Créances N-1 | Égalité |
| Variation dettes | Dettes N - Dettes N-1 | Égalité |
| Variation immobilisations | Immob. N - Immob. N-1 | Égalité |
| Variation capital | Capital N - Capital N-1 | Égalité |
| Variation emprunts | Emprunts N - Emprunts N-1 | Égalité |

---

## Workflow de Contrôle

### 1. Contrôles Préalables
- Vérifier la cohérence des balances N et N-1
- Contrôler l'équilibre du bilan N et N-1
- Vérifier le compte de résultat N

### 2. Contrôles de Calcul
- Cohérence CAFG
- Équilibre des flux
- Sens des variations

### 3. Contrôles de Cohérence
- Cohérence trésorerie
- Cohérence variation trésorerie
- Cohérence avec CR et bilan

### 4. Contrôles d'Exclusion
- Vérifier les exclusions des activités opérationnelles
- Contrôler les reclassements

---

## Seuils de Qualité

| Indicateur | Excellent | Acceptable | Insuffisant |
|------------|-----------|------------|-------------|
| Cohérence trésorerie | < 0,01 | 0,01-0,1 | > 0,1 |
| Équilibre flux | < 0,01 | 0,01-0,1 | > 0,1 |
| Cohérence variation | < 0,01 | 0,01-0,1 | > 0,1 |
| CAFG / Résultat net | Cohérent | Vérifiable | Incohérent |

---

## Exemples de Corrections

### Exemple 1 : Trésorerie Incohérente

**Problème** : Trésorerie calculée ≠ Trésorerie bilan

**Analyse** :
- Vérifier les comptes de trésorerie (50-58, 56)
- Contrôler les variations de BFR
- Vérifier les flux d'investissement et financement

**Solution** :
1. Identifier les comptes de trésorerie manquants
2. Recalculer les variations
3. Vérifier les balances N et N-1

### Exemple 2 : CAFG Négative

**Problème** : CAFG = -141 285 351 (entreprise en perte)

**Analyse** :
- Résultat net : -189 540 500 (perte)
- Dotations : +113 145 202
- Reprises : -61 740 053
- Produits cessions : -3 150 000

**Interprétation** :
- L'entreprise est en perte
- Les dotations ne compensent pas la perte
- Les reprises réduisent encore la CAFG
- Situation préoccupante pour la trésorerie

**Actions** :
1. Analyser la rentabilité
2. Réduire les charges
3. Augmenter les produits
4. Chercher des financements externes

---

## Fichiers Concernés

- `py_backend/tableau_flux_tresorerie.py` : Calcul du TFT
- `py_backend/test_tft_standalone.py` : Tests du TFT
- `Doc_Etat_Fin/STRUCTURE_TFT.md` : Structure du TFT

## Date de Création
22 mars 2026
