# 📊 Guide Lead Balance - Import Excel

## Description

La fonctionnalité **Lead Balance** permet d'importer un fichier Excel contenant deux balances comptables (N et N-1) et de générer automatiquement une analyse comparative :

1. **Comptes communs** : Comptes présents dans les deux périodes avec calcul des écarts
2. **Comptes nouveaux (N)** : Comptes apparus en période N
3. **Comptes supprimés (N-1)** : Comptes disparus en période N

## Format du fichier Excel

### Structure requise

Le fichier Excel doit contenir **2 onglets** :
- **Onglet 1** : Balance N (période actuelle)
- **Onglet 2** : Balance N-1 (période précédente)

### Colonnes attendues

| Colonne | Description |
|---------|-------------|
| Numéro | Numéro du compte comptable |
| Intitulé | Libellé du compte |
| Ant Débit | Antérieur Débit (optionnel) |
| Ant Crédit | Antérieur Crédit (optionnel) |
| Débit | Mouvements Débit (optionnel) |
| Crédit | Mouvements Crédit (optionnel) |
| **Solde Débit** | Solde débiteur final |
| **Solde Crédit** | Solde créditeur final |

### Calcul du solde net

```
Solde Net = Solde Débit - Solde Crédit
```

## Utilisation

### Via le Menu Contextuel

1. Cliquez sur une table dans le chat (pour définir où afficher les résultats)
2. Ouvrez le menu contextuel (clic droit ou survol)
3. Section **Modélisation Pandas** → **📊 Lead Balance**
4. Sélectionnez votre fichier Excel
5. Les résultats s'affichent en accordéons sous la table

### Via Raccourci Clavier

- **Ctrl+L** : Ouvre le sélecteur de fichier Excel

## Résultats

Les résultats sont affichés sous forme d'**accordéons** :

### 1. Comptes Communs
- Tous les comptes présents dans N et N-1
- Colonnes : Compte, Intitulé N, Intitulé N-1, Solde Débit/Crédit N, Solde Net N, Solde Débit/Crédit N-1, Solde Net N-1, Écart, Variation %
- Total des soldes et écart global

### 2. Comptes Nouveaux (N)
- Comptes apparus en période N
- Colonnes : Compte, Intitulé, Solde Débit, Solde Crédit, Solde Net

### 3. Comptes Supprimés (N-1)
- Comptes disparus en période N
- Colonnes : Compte, Intitulé, Solde Débit, Solde Crédit, Solde Net

## Architecture Technique

### Frontend (menu.js)
- `executeLeadBalance()` : Ouvre le sélecteur de fichier et envoie à l'API
- `openFileDialogForLeadBalance()` : Dialogue de sélection Excel
- `readFileAsBase64()` : Encode le fichier en base64
- `insertLeadBalanceResults()` : Insère les accordéons HTML

### Backend (pandas_lead.py)
- Endpoint POST `/lead-balance/process-excel`
- `create_lead_balance_from_excel()` : Traite le fichier Excel
- `process_balance_sheet()` : Traite un onglet de balance
- `detect_balance_columns()` : Détecte automatiquement les colonnes
- `generate_accordion_html()` : Génère le HTML des accordéons

## Test

### Page de test
Ouvrir : `public/test-lead-balance.html`

### Démarrer le backend
```bash
cd py_backend
python main.py --host 127.0.0.1 --port 5000
```

## Dépendances Python

```
pandas
numpy
fastapi
pydantic
openpyxl  # Pour lire les fichiers .xlsx
```
