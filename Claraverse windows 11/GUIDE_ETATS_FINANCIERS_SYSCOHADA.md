# 📈 Guide États Financiers SYSCOHADA Révisé

## Vue d'ensemble

Cette fonctionnalité permet de calculer automatiquement les **États Financiers SYSCOHADA Révisé** (Bilan et Compte de Résultat) à partir d'une Balance comptable.

## Fichiers créés

| Fichier | Description |
|---------|-------------|
| `py_backend/etats_financiers.py` | Script Python backend pour le calcul |
| `public/menu.js` | Menu contextuel avec nouvelle section "États Financiers" |
| `public/test-etats-financiers.html` | Page de test |

## Utilisation

### 1. Via le Menu Contextuel

1. Cliquez sur une table contenant une **Balance** dans le chat
2. Faites un **clic droit** pour ouvrir le menu contextuel
3. Ouvrez la section **📈 États Financiers SYSCOHADA**
4. Cliquez sur **📊 Calculer États Financiers** (ou `Ctrl+F`)

### 2. Format de la Balance attendu

La table Balance doit contenir les colonnes suivantes :

| Colonne | Description |
|---------|-------------|
| Numéro | Numéro de compte (ex: 101, 411, 601) |
| Intitulé | Libellé du compte |
| Débit Ant / Crédit Ant | Mouvements N-1 |
| Solde Débit / Solde Crédit | Soldes N |

### 3. Résultats

Les états financiers s'affichent en **accordéons** sous la table :

- 🏦 **BILAN ACTIF** - Immobilisations, Stocks, Créances, Trésorerie
- 💰 **BILAN PASSIF** - Capitaux propres, Dettes
- 📊 **COMPTE DE RÉSULTAT** - Produits, Charges, Résultat Net

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+F` | Calculer États Financiers |

## Test

1. Démarrez le backend : `start-backend.bat`
2. Ouvrez : `http://localhost:5173/test-etats-financiers.html`
3. Cliquez sur "Calculer États Financiers"

## API Backend

### Endpoint principal
```
POST http://127.0.0.1:5000/etats-financiers/calculate
```

### Corps de la requête
```json
{
  "balance": {
    "headers": ["Numéro", "Intitulé", "Débit Ant", "Crédit Ant", "Solde Débit", "Solde Crédit"],
    "rows": [
      ["101", "Capital social", "0", "50000000", "0", "50000000"],
      ["411", "Clients", "12000000", "0", "15000000", "0"]
    ]
  },
  "exercice_n": "2024",
  "exercice_n1": "2023"
}
```

### Réponse
```json
{
  "success": true,
  "bilan_actif": { "titre": "BILAN ACTIF", "rubriques": [...], "total": {...} },
  "bilan_passif": { "titre": "BILAN PASSIF", "rubriques": [...], "total": {...} },
  "compte_resultat": { "produits": {...}, "charges": {...}, "resultat": {...} }
}
```

## Tableau de correspondance SYSCOHADA

Le fichier `py_backend/Tableau correspondance.xlsx` contient le mapping entre :
- Les **numéros de comptes** (classe 1-7)
- Les **rubriques** des états financiers (AA, AB, CA, TA, RA, etc.)

Si le fichier n'existe pas, un tableau par défaut est utilisé.
