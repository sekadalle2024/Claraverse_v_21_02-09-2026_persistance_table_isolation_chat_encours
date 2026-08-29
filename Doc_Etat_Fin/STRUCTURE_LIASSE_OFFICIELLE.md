# Structure de la Liasse Officielle SYSCOHADA

## Fichier Créé
`py_backend/BALANCES_N_N1_N2.xlsx` avec 3 onglets :
- Balance N (2024) - 405 comptes
- Balance N-1 (2023) - 405 comptes  
- Balance N-2 (2022) - 405 comptes

## Onglets Principaux de la Liasse Officielle

### 1. BILAN (Onglet combiné)
- **Dimensions** : 42 lignes x 29 colonnes
- **Structure** :
  - Ligne 8 : En-têtes (REF | ACTIF | NOTE | EXERCICE N | EXERCICE N-1)
  - Ligne 10 : Sous-en-têtes (BRUT | AMORT et DEPREC. | NET | NET)
  - Lignes 11-41 : Postes du bilan

### 2. ACTIF (Page 1/2 du Bilan)
- **Dimensions** : 41 lignes x 13 colonnes
- **Colonnes** :
  - [1] REF (AA, AB, AC, etc.)
  - [2] ACTIF (Libellé)
  - [5] NOTE (Renvoi aux notes annexes)
  - [6] BRUT (Exercice N)
  - [7] AMORT et DEPREC. (Exercice N)
  - [8] NET (Exercice N)
  - [9] NET (Exercice N-1)

**Postes principaux** :
- AD : IMMOBILISATIONS INCORPORELLES
- AE : Frais de développement et de prospection
- AF : Brevets, licences, logiciels
- AG : Fonds commercial
- AH : Autres immobilisations incorporelles
- AI : IMMOBILISATIONS CORPORELLES
- AJ : Terrains
- AK : Bâtiments
- AL : Aménagements, agencements
- AM : Matériel, mobilier

### 3. PASSIF (Page 2/2 du Bilan)
- **Dimensions** : 41 lignes x 13 colonnes
- **Colonnes** :
  - [1] REF (CA, CB, CC, etc.)
  - [2] PASSIF (Libellé)
  - [7] NOTE
  - [8] NET (Exercice N)
  - [9] NET (Exercice N-1)

**Postes principaux** :
- CA : Capital
- CB : Apporteurs capital non appelé (-)
- CD : Primes liées au capital social
- CE : Écarts de réévaluation
- CF : Réserves indisponibles
- CG : Réserves libres
- CH : Report à nouveau
- CJ : Résultat net de l'exercice
- CL : Subventions d'investissement
- CM : Provisions réglementées

### 4. RESULTAT (Compte de Résultat)
- **Dimensions** : 56 lignes x 14 colonnes
- **Colonnes** :
  - [1] REF (TA, RA, XA, etc.)
  - [2] LIBELLES
  - [7] Signe (+, -, -/+)
  - [8] NOTE
  - [9] NET (Exercice N)
  - [10] NET (Exercice N-1) - probablement

**Postes principaux** :
- TA : Ventes de marchandises (+)
- RA : Achats de marchandises (-)
- RB : Variation de stocks de marchandises (-/+)
- XA : MARGE COMMERCIALE
- TB : Ventes de produits fabriqués (+)
- TC : Travaux, services vendus (+)
- TD : Produits accessoires (+)
- XB : CHIFFRE D'AFFAIRES
- TE : Production stockée (-/+)
- TF : Production immobilisée (+)

## Format des Tableaux Officiels

### Structure Commune
1. **En-tête** : Informations de l'entité
   - Dénomination sociale
   - Adresse
   - N° de compte contribuable (NCC)
   - N° de télédéclarant (NTD)
   - Exercice clos le
   - Durée (en mois)

2. **Colonnes de données** :
   - Exercice N (année en cours)
   - Exercice N-1 (année précédente)
   - Pour l'actif : BRUT, AMORT/DEPREC, NET

3. **Références** : Codes alphabétiques (AA, AB, AC... pour Actif ; CA, CB, CC... pour Passif ; TA, RA, XA... pour Résultat)

4. **Notes** : Renvois aux notes annexes (3, 13, 14, 15, 21, 22, etc.)

## Prochaines Étapes

1. ✅ Créer fichier Excel multi-exercices (FAIT)
2. ⏳ Adapter `etats_financiers.py` pour :
   - Accepter 3 onglets de balances
   - Générer les tableaux au format officiel
   - Afficher BRUT, AMORT/DEPREC, NET pour l'actif
   - Afficher NET N et NET N-1 pour tous les états
3. ⏳ Créer les templates HTML des tableaux officiels
4. ⏳ Ajouter les états de contrôle

## Date
22 mars 2026
