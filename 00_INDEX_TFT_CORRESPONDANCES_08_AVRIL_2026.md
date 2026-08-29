# Index Complet - Mise à Jour TFT Correspondances SYSCOHADA

**Date**: 08 Avril 2026  
**Expert**: Joël Mabudu - Expert Comptable Diplômé, Commissaire aux Comptes  
**Mission**: Ajout des correspondances TFT dans correspondances_syscohada.json

---

## 🎯 Démarrage Rapide

| Fichier | Description | Priorité |
|---------|-------------|----------|
| [QUICK_START_TFT.txt](QUICK_START_TFT.txt) | Guide ultra-rapide | ⭐⭐⭐ |
| [00_COMMENCER_ICI_TFT_08_AVRIL_2026.txt](00_COMMENCER_ICI_TFT_08_AVRIL_2026.txt) | Guide complet de démarrage | ⭐⭐⭐ |

---

## 📁 Fichier Principal Modifié

| Fichier | Modification | Statut |
|---------|--------------|--------|
| `py_backend/correspondances_syscohada.json` | Ajout section "tft" (25 rubriques) | ✅ MODIFIÉ |

---

## 📚 Documentation

### Documentation Principale

| Fichier | Contenu | Type |
|---------|---------|------|
| [00_MISE_A_JOUR_TFT_CORRESPONDANCES_08_AVRIL_2026.txt](00_MISE_A_JOUR_TFT_CORRESPONDANCES_08_AVRIL_2026.txt) | Récapitulatif technique complet | Texte |
| [GUIDE_VISUEL_TFT_CORRESPONDANCES.md](GUIDE_VISUEL_TFT_CORRESPONDANCES.md) | Guide visuel avec tous les comptes | Markdown |
| [00_INDEX_TFT_CORRESPONDANCES_08_AVRIL_2026.md](00_INDEX_TFT_CORRESPONDANCES_08_AVRIL_2026.md) | Ce fichier - Index complet | Markdown |

### Documentation Technique

| Fichier | Contenu |
|---------|---------|
| `py_backend/tableau_flux_tresorerie.py` | Module de calcul du TFT |
| `py_backend/etats_financiers.py` | Module de génération des états |
| `py_backend/correspondances_syscohada.json` | Fichier de correspondances |

---

## 🧪 Scripts de Test

### Tests PowerShell

| Script | Description | Commande |
|--------|-------------|----------|
| `test-integration-tft-simple.ps1` | Test complet simplifié | `./test-integration-tft-simple.ps1` |
| `test-integration-tft-correspondances.ps1` | Test complet détaillé | `./test-integration-tft-correspondances.ps1` |

### Tests Python

| Script | Description | Commande |
|--------|-------------|----------|
| `test-tft-final.py` | Test sans emojis (recommandé) | `python test-tft-final.py` |
| `test-correspondances-tft.py` | Test détaillé avec emojis | `python test-correspondances-tft.py` |
| `test-load-tft-correspondances.py` | Test de chargement JSON | `python test-load-tft-correspondances.py` |

---

## 📊 Résultats

### Statistiques du Fichier

```
correspondances_syscohada.json
├── bilan_actif:   36 rubriques
├── bilan_passif:  28 rubriques
├── charges:       30 rubriques
├── produits:      25 rubriques
└── tft:           25 rubriques ⭐ NOUVEAU
    ─────────────────────────────
    TOTAL:        144 rubriques
```

### Structure TFT (25 rubriques)

#### A. Trésorerie d'ouverture (1)
- `ZA` - Trésorerie nette au 1er janvier

#### B. Flux opérationnels (6)
- `FA` - Capacité d'Autofinancement Globale (CAFG)
- `FB` - Variation d'actif circulant HAO
- `FC` - Variation des stocks
- `FD` - Variation des créances
- `FE` - Variation du passif circulant
- `ZB` - Total flux opérationnels

#### C. Flux d'investissement (6)
- `FF` - Décaissements immobilisations incorporelles
- `FG` - Décaissements immobilisations corporelles
- `FH` - Décaissements immobilisations financières
- `FI` - Encaissements cessions immobilisations
- `FJ` - Encaissements cessions immobilisations financières
- `ZC` - Total flux investissement

#### D. Flux capitaux propres (5)
- `FK` - Augmentations de capital
- `FL` - Subventions d'investissement reçues
- `FM` - Prélèvements sur le capital
- `FN` - Dividendes versés
- `ZD` - Total flux capitaux propres

#### E. Flux capitaux étrangers (4)
- `FO` - Nouveaux emprunts
- `FP` - Autres dettes financières
- `FQ` - Remboursements
- `ZE` - Total flux capitaux étrangers

#### F-H. Totaux et clôture (3)
- `ZF` - Total flux financement
- `ZG` - Variation trésorerie
- `ZH` - Trésorerie nette au 31 décembre

---

## 🔍 Comptes SYSCOHADA Mappés

### Trésorerie (ZA, ZH)
```
50  - Titres de placement
51  - Valeurs à encaisser
52  - Banques
53  - Établissements financiers
54  - Chèques postaux
57  - Caisse
58  - Régies d'avances
56  - Crédits de trésorerie (PASSIF)
```

### CAFG (FA)
```
13   - Résultat net
681  - Dotations amortissements exploitation
691  - Dotations provisions exploitation
697  - Dotations provisions financières
851  - Dotations HAO
781  - Reprises amortissements exploitation
791  - Reprises provisions exploitation
797  - Reprises provisions financières
861  - Reprises HAO
81   - Valeur comptable cessions
82   - Produits cessions
865  - Subventions virées résultat
```

### Stocks (FC)
```
31-38 - Toutes les classes de stocks
```

### Immobilisations (FF, FG, FH)
```
21    - Immobilisations incorporelles
22-24 - Immobilisations corporelles
26-27 - Immobilisations financières
```

### Financement (FK-FQ)
```
101        - Capital social
14         - Subventions d'investissement
46         - Associés - Opérations capital
161, 162   - Emprunts obligataires et bancaires
1661, 1662 - Emprunts groupe et hors groupe
16, 18     - Autres dettes financières
```

---

## ✅ Validation

### Tests Réussis

- ✅ JSON valide
- ✅ Section TFT présente (25 rubriques)
- ✅ Toutes les rubriques essentielles présentes
- ✅ Tous les comptes de trésorerie présents
- ✅ Validation Python réussie
- ✅ Chargement JSON réussi
- ✅ Compatible avec modules Python existants

### Commandes de Test

```powershell
# Test PowerShell (recommandé)
./test-integration-tft-simple.ps1

# Test Python
python test-tft-final.py
```

---

## 💡 Utilisation

### Modules Python Compatibles

1. **`py_backend/tableau_flux_tresorerie.py`**
   - Calcul du TFT à partir de balances N et N-1
   - Fonction: `calculer_tft(balance_n, balance_n1, resultat_net)`

2. **`py_backend/etats_financiers.py`**
   - Génération des états financiers complets
   - Fonction: `process_balance_to_etats_financiers(balance_df, correspondances)`

3. **`py_backend/generer_etats_liasse.py`**
   - Export de la liasse fiscale complète
   - Inclut maintenant le TFT

### Exemple d'Utilisation

```python
import json
from tableau_flux_tresorerie import calculer_tft

# Charger les correspondances
with open('py_backend/correspondances_syscohada.json', 'r') as f:
    corresp = json.load(f)

# Les correspondances TFT sont dans corresp['tft']
tft_rubriques = corresp['tft']

# Calculer le TFT
tft_data = calculer_tft(balance_n, balance_n1, resultat_net)
```

---

## 🎓 Références

### Normes et Standards
- **SYSCOHADA Révisé** - Acte uniforme relatif au droit comptable
- **Tableau des Flux de Trésorerie** - Méthode indirecte

### Fichiers Sources
- Images TFT fournies (3 captures d'écran)
- `py_backend/etats_financiers.py` (code existant)
- `py_backend/tableau_flux_tresorerie.py` (code existant)

---

## 📞 Support

### En cas de question sur:

- **Structure du TFT**: Voir [GUIDE_VISUEL_TFT_CORRESPONDANCES.md](GUIDE_VISUEL_TFT_CORRESPONDANCES.md)
- **Calculs**: Voir `py_backend/tableau_flux_tresorerie.py`
- **Intégration**: Voir `py_backend/etats_financiers.py`
- **Tests**: Exécuter `./test-integration-tft-simple.ps1`

---

## 🚀 Prochaines Étapes

Le fichier `correspondances_syscohada.json` est maintenant **COMPLET** avec:

✅ Bilan Actif (36 rubriques)  
✅ Bilan Passif (28 rubriques)  
✅ Compte de Résultat - Charges (30 rubriques)  
✅ Compte de Résultat - Produits (25 rubriques)  
✅ Tableau des Flux de Trésorerie (25 rubriques) ⭐ NOUVEAU

### Capacités Disponibles

1. Génération automatique du TFT à partir de balances
2. Calcul de tous les flux de trésorerie
3. Contrôles de cohérence automatiques
4. Export de la liasse fiscale SYSCOHADA Révisé complète
5. Génération HTML des états financiers

---

## 📝 Commit

Message de commit préparé dans:
- [COMMIT_MESSAGE_TFT_08_AVRIL_2026.txt](COMMIT_MESSAGE_TFT_08_AVRIL_2026.txt)

---

**Fin de la documentation**  
**Date**: 08 Avril 2026  
**Expert**: Joël Mabudu
