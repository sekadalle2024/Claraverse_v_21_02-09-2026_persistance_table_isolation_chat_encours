# 📊 Guide Lead par Section Comptable - SYSCOHADA Révisé

## Vue d'ensemble

Ce module génère des **leads analytiques** par section comptable selon le plan SYSCOHADA révisé, permettant une analyse comparative entre deux exercices (N et N-1).

## Structure des Sections

### 🏛️ COMPTES DE BILAN

#### ACTIF
| Section | Préfixes | Description |
|---------|----------|-------------|
| Actif Immobilisé | 20-27 | Charges immobilisées, immobilisations incorporelles, corporelles, financières |
| Actif Circulant | 31-48 | Stocks, créances clients, autres créances |
| Trésorerie Actif | 50-58 | Titres de placement, banques, caisse |

#### PASSIF
| Section | Préfixes | Description |
|---------|----------|-------------|
| Capitaux Propres | 10-15 | Capital, réserves, report à nouveau, résultat |
| Dettes Financières | 16-19 | Emprunts, dettes de crédit-bail |
| Dettes Fournisseurs | 40 | Fournisseurs et comptes rattachés |
| Dettes Fiscales/Sociales | 42-45 | Personnel, organismes sociaux, État |
| Autres Dettes | 46-48 | Associés, débiteurs/créditeurs divers |
| Trésorerie Passif | 56 | Crédits de trésorerie |

### 📈 COMPTE DE RÉSULTAT

#### CHARGES (Classe 6)
| Section | Préfixes | Description |
|---------|----------|-------------|
| Achats et Variations | 60 | Achats marchandises, matières, variations stocks |
| Transports | 61 | Transports sur achats, ventes, personnel |
| Services Extérieurs A | 62 | Sous-traitance, locations, entretien, assurances |
| Services Extérieurs B | 63 | Publicité, télécommunications, honoraires |
| Impôts et Taxes | 64 | Impôts, taxes et versements assimilés |
| Autres Charges | 65 | Pertes sur créances, charges diverses |
| Charges de Personnel | 66 | Salaires, charges sociales |
| Charges Financières | 67 | Intérêts, pertes de change |
| Dotations Amortissements | 68 | Dotations aux amortissements |
| Dotations Provisions | 69 | Dotations aux provisions |

#### PRODUITS (Classe 7)
| Section | Préfixes | Description |
|---------|----------|-------------|
| Ventes | 70 | Ventes de marchandises, produits, services |
| Subventions Exploitation | 71 | Subventions d'exploitation reçues |
| Production Immobilisée | 72 | Travaux faits par l'entreprise pour elle-même |
| Variations Stocks Produits | 73 | Variations des stocks de produits |
| Produits Accessoires | 74 | Revenus des immeubles, redevances |
| Autres Produits | 75 | Quotes-parts de subventions virées |
| Produits Financiers | 76-77 | Revenus financiers, gains de change |
| Transferts de Charges | 78 | Transferts de charges d'exploitation |
| Reprises Provisions | 79 | Reprises sur provisions |

#### HAO (Classe 8)
| Section | Préfixes | Description |
|---------|----------|-------------|
| Charges HAO | 81,83,85,87,89 | Valeurs comptables cessions, charges exceptionnelles |
| Produits HAO | 82,84,86,88 | Produits des cessions, produits exceptionnels |

## Utilisation

### Via le Menu
1. Sélectionnez une table dans le chat
2. Ouvrez le menu contextuel (clic droit ou survol)
3. Section **Modélisation Pandas** → **Lead Balance** (Ctrl+L)
4. Sélectionnez votre fichier Excel avec 2 onglets (Balance N et Balance N-1)

### Format Excel Attendu
Le fichier Excel doit contenir :
- **Onglet 1** : Balance de l'exercice N (actuel)
- **Onglet 2** : Balance de l'exercice N-1 (précédent)

Colonnes requises :
- Numéro de compte
- Intitulé
- Solde Débit
- Solde Crédit

## Calculs Effectués

Pour chaque compte :
- **Solde Net** = Solde Débit - Solde Crédit
- **Écart** = Solde N - Solde N-1
- **Variation %** = (Écart / |Solde N-1|) × 100

## Fichiers Concernés

- `public/lead-syscohada.js` - Module JavaScript frontend
- `py_backend/pandas_lead.py` - API backend Python
- `public/menu.js` - Intégration menu contextuel

---
*Expert-comptable diplômé et CAC - 30 ans d'expérience Afrique de l'Ouest*
