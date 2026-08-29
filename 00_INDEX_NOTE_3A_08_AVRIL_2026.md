# Index - Calcul Note 3A (Immobilisations incorporelles)

**Date** : 08 Avril 2026  
**Statut** : ✓ Terminé

## Démarrage rapide

```bash
# Méthode 1 : Script Python direct
cd py_backend
python calculer_note_3a.py

# Méthode 2 : Script PowerShell
./test-note-3a.ps1
```

## Fichiers principaux

### Scripts
- `py_backend/calculer_note_3a.py` - Script de calcul principal
- `test-note-3a.ps1` - Script de test PowerShell

### Documentation
- `00_COMMENCER_ICI_NOTE_3A_08_AVRIL_2026.txt` - Point d'entrée
- `SYNTHESE_NOTE_3A_08_AVRIL_2026.md` - Synthèse complète
- `py_backend/Doc calcul notes annexes/README.md` - Documentation du dossier
- `py_backend/Doc calcul notes annexes/00_CALCUL_NOTE_3A_REUSSI_08_AVRIL_2026.txt` - Doc détaillée
- `py_backend/Doc calcul notes annexes/QUICK_START_NOTE_3A.txt` - Guide rapide

### Résultats
- `py_backend/test_note_3a.html` - Tableau HTML généré

### Utilitaires
- `py_backend/test_onglets.py` - Vérification des onglets Excel

## Données sources

- **Balance demo** : `py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls`
- **Modèle Note 3A** : `py_backend/Doc calcul notes annexes/NOTE 3A.xlsx`
- **Exemple rempli** : `py_backend/Doc calcul notes annexes/NOTE 3A renseignee.png`
- **Plan de comptes** : `py_backend/Doc calcul notes annexes/Syscohada revise plan compte.pdf`

## Ce qui est calculé

### Lignes
1. Frais de recherche et de développement (211)
2. Brevets, licences, logiciels (212, 213, 214)
3. Fonds commercial (215, 216)
4. Autres immobilisations incorporelles (217, 218)
5. TOTAL

### Colonnes
- Valeur brute : ouverture, augmentations, diminutions, clôture
- Amortissements : ouverture, dotations, reprises, clôture
- VNC : ouverture, clôture

## Comptes utilisés

### Comptes de brut (classe 21)
- 211 : Frais de recherche et de développement
- 212 : Brevets
- 213 : Licences
- 214 : Logiciels
- 215 : Fonds commercial
- 216 : Droit au bail
- 217 : Autres immobilisations incorporelles
- 218 : Immobilisations incorporelles en cours

### Comptes d'amortissement (classes 28 et 29)
- 2811, 2919 : Amortissements frais R&D
- 2812-2814, 2912-2914 : Amortissements brevets, licences, logiciels
- 2815, 2816, 2915, 2916 : Amortissements fonds commercial
- 2817, 2818, 2917, 2918 : Amortissements autres immobilisations

## Problèmes résolus

✓ Espaces dans les noms d'onglets Excel  
✓ Conversion string → float  
✓ Mapping des comptes syscohada révisé  

## Résultat avec balance demo

```
Brevets, licences, logiciels:
- Brut : 23 125 988 FCFA
- Amortissements : 23 125 987 FCFA
- VNC : 1 FCFA

TOTAL : 1 FCFA
```

## Prochaines notes à développer

- [ ] Note 3B : Immobilisations corporelles
- [ ] Note 3C : Immobilisations financières
- [ ] Note 4 : Stocks
- [ ] Note 5 : Créances
- [ ] Note 6 : Trésorerie
- [ ] Note 7 : Capitaux propres
- [ ] Note 8 : Dettes

## Architecture technique

```
CalculateurNote3A
├── __init__() : Initialisation
├── charger_balances() : Lecture Excel
├── extraire_solde_compte() : Extraction données
├── calculer_ligne_note_3a() : Calcul ligne
├── generer_note_3a() : Génération DataFrame
└── generer_html() : Export HTML
```

## Commandes utiles

```bash
# Tester le script
cd py_backend
python calculer_note_3a.py

# Ouvrir le résultat
start test_note_3a.html

# Vérifier les onglets
python test_onglets.py

# Test complet avec PowerShell
./test-note-3a.ps1
```

## Intégration future

1. Backend API
   - Endpoint `/api/note_3a`
   - Intégration dans `etats_financiers.py`

2. Frontend
   - Composant React `Note3ARenderer`
   - Menu accordéon
   - Export Excel

3. Export liasse
   - Ajout dans `export_liasse.py`
   - Remplissage automatique du template

---

**Mission accomplie** ✓  
**Prêt pour les prochaines notes annexes**
