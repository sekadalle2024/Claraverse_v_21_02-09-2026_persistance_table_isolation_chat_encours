# Analyse des Problèmes Restants - Export Liasse (06 Avril 2026)

## 📋 Vue d'Ensemble

Malgré les corrections du 05 avril 2026, certains problèmes persistent dans l'export de la liasse officielle. Ce document analyse en détail ces problèmes et propose des solutions.

---

## 🎯 Problèmes Identifiés

### Problème 1: Bilan ACTIF - Colonnes Brut et Amortissement Manquantes

#### 📸 Capture d'écran: BILAN ACTIF BRUT ET AMORTISSEMENT
**Symptômes:**
- Le template Excel `Liasse_officielle_revise.xlsx` contient 3 colonnes pour l'exercice N:
  - Colonne BRUT (Valeurs brutes)
  - Colonne AMORTISSEMENT (Amortissements et dépréciations)
  - Colonne NET (Valeurs nettes)
- Actuellement, seule la colonne NET est renseignée
- Les colonnes BRUT et AMORTISSEMENT restent vides

**Impact:**
- Export incomplet et non conforme au SYSCOHADA Révisé
- Impossibilité de vérifier la cohérence entre brut, amortissement et net
- Liasse non exploitable pour l'administration fiscale

**Cause racine:**
- Le code actuel ne calcule que les valeurs nettes (montant_n)
- Les valeurs brutes et amortissements ne sont pas extraites de la balance
- Le mapping ne prévoit pas ces colonnes supplémentaires

#### 📸 Capture d'écran: ACTIF MENU ACCORDEON
**Symptômes:**
- Le menu accordéon frontend affiche seulement:
  - Colonne NET pour N
  - Colonne NET pour N-1
- Les colonnes BRUT et AMORTISSEMENT ne sont pas affichées

**Impact:**
- Incohérence entre l'affichage frontend et l'export Excel
- L'utilisateur ne peut pas vérifier les valeurs brutes avant export
- Risque d'erreurs non détectées

---

### Problème 2: Bilan ACTIF - Totalisation Manquante

#### 📸 Capture d'écran: bilan actif totalisation
**Symptômes:**
- Les lignes de totalisation ne sont pas renseignées:
  - AZ: TOTAL ACTIF IMMOBILISÉ
  - BQ: TOTAL ACTIF CIRCULANT
  - BZ: TOTAL TRÉSORERIE-ACTIF
  - CZ: TOTAL ÉCARTS DE CONVERSION-ACTIF
  - DZ: TOTAL GÉNÉRAL ACTIF

**Impact:**
- Export incomplet
- Impossibilité de vérifier la cohérence des totaux
- Non-conformité avec le format SYSCOHADA

**Cause racine:**
- Le code actuel remplit uniquement les postes détaillés
- Les lignes de totalisation ne sont pas calculées
- Le mapping ne distingue pas les postes de totalisation

---

### Problème 3: TFT (Tableau des Flux de Trésorerie) Vierge

#### 📸 Capture d'écran: TFT vierge
**Symptômes:**
- L'onglet TFT reste complètement vide après export
- Aucune valeur n'est renseignée

**Impact:**
- État financier majeur manquant
- Export incomplet et non conforme
- Impossibilité d'analyser les flux de trésorerie

**Cause racine:**
- Le TFT est généré au format dict: `{'ZA_tresorerie_ouverture': 1800000, ...}`
- Le code de conversion dict → liste de postes fonctionne
- Mais le scanner de REF ne trouve pas les références dans l'onglet TFT
- Possible problème de mapping des colonnes (I et K au lieu de H et I)

---

## 🔍 Analyse Technique Détaillée

### Structure des Données

#### Format actuel des données (etats_financiers_v2.py)
```python
bilan_actif = [
    {
        'ref': 'AD',
        'libelle': 'Charges immobilisées',
        'montant_n': 1500000,      # Valeur NETTE
        'montant_n1': 1200000      # Valeur NETTE N-1
    },
    # ...
]
```

#### Format requis pour l'export complet
```python
bilan_actif = [
    {
        'ref': 'AD',
        'libelle': 'Charges immobilisées',
        'brut_n': 2000000,         # NOUVEAU: Valeur brute
        'amort_n': 500000,         # NOUVEAU: Amortissement
        'montant_n': 1500000,      # Valeur nette (brut - amort)
        'brut_n1': 1800000,        # NOUVEAU: Valeur brute N-1
        'amort_n1': 600000,        # NOUVEAU: Amortissement N-1
        'montant_n1': 1200000      # Valeur nette N-1
    },
    # ...
]
```

### Extraction des Valeurs Brutes et Amortissements

#### Principe SYSCOHADA
- Les comptes de classe 2 (Immobilisations) ont:
  - Comptes 2xxx: Valeurs brutes (ex: 211 Terrains)
  - Comptes 28xx: Amortissements (ex: 2811 Amortissements terrains)
  - Valeur nette = Brut - Amortissement

#### Algorithme d'extraction
```python
def extraire_brut_et_amortissement(balance_n, compte_principal):
    """
    Extrait les valeurs brutes et amortissements pour un compte
    
    Args:
        balance_n: DataFrame de la balance
        compte_principal: Numéro de compte (ex: '21' pour immobilisations corporelles)
    
    Returns:
        tuple: (brut, amortissement, net)
    """
    # Valeur brute: solde des comptes 2xxx
    brut = balance_n[
        balance_n['Numéro'].astype(str).str.startswith(compte_principal)
    ]['Solde Débit'].sum()
    
    # Amortissement: solde des comptes 28xx correspondants
    compte_amort = '28' + compte_principal[1:]
    amortissement = balance_n[
        balance_n['Numéro'].astype(str).str.startswith(compte_amort)
    ]['Solde Crédit'].sum()
    
    # Net = Brut - Amortissement
    net = brut - amortissement
    
    return brut, amortissement, net
```

### Mapping des Colonnes Excel

#### Onglet BILAN ACTIF (selon captures d'écran)
```python
# Pour l'exercice N
COLONNES_ACTIF_N = {
    'brut': 'E',           # Colonne E: Valeurs brutes N
    'amortissement': 'F',  # Colonne F: Amortissements N
    'net': 'G'             # Colonne G: Valeurs nettes N (actuellement H?)
}

# Pour l'exercice N-1
COLONNES_ACTIF_N1 = {
    'net': 'H'             # Colonne H: Valeurs nettes N-1 (actuellement I?)
}
```

**⚠️ ATTENTION:** Les colonnes actuelles (H et I) semblent décalées. Il faut vérifier le template exact.

---

## 💡 Solutions Proposées

### Solution 1: Ajouter Brut et Amortissement

#### Étape 1.1: Modifier etats_financiers_v2.py
```python
def calculer_bilan_actif_complet(balance_n, balance_n1, balance_n2):
    """
    Calcule le bilan actif avec valeurs brutes et amortissements
    """
    postes = []
    
    # Mapping des postes vers les comptes
    mapping_actif = {
        'AD': {'comptes': ['20'], 'libelle': 'Charges immobilisées'},
        'AI': {'comptes': ['21'], 'libelle': 'Terrains'},
        'AJ': {'comptes': ['22'], 'libelle': 'Bâtiments'},
        # ...
    }
    
    for ref, config in mapping_actif.items():
        # Calculer pour N
        brut_n, amort_n, net_n = extraire_brut_et_amortissement(
            balance_n, config['comptes'][0]
        )
        
        # Calculer pour N-1
        brut_n1, amort_n1, net_n1 = extraire_brut_et_amortissement(
            balance_n1, config['comptes'][0]
        )
        
        postes.append({
            'ref': ref,
            'libelle': config['libelle'],
            'brut_n': brut_n,
            'amort_n': amort_n,
            'montant_n': net_n,
            'brut_n1': brut_n1,
            'amort_n1': amort_n1,
            'montant_n1': net_n1
        })
    
    return postes
```

#### Étape 1.2: Modifier export_liasse.py
```python
def remplir_onglet_actif_complet(ws, bilan_actif_dict):
    """
    Remplit l'onglet ACTIF avec brut, amortissement et net
    """
    for row in ws.iter_rows(min_col=1, max_col=1, min_row=5):
        cell = row[0]
        ref_val = str(cell.value or '').strip()
        
        if len(ref_val) == 2 and ref_val in bilan_actif_dict:
            row_num = cell.row
            poste = bilan_actif_dict[ref_val]
            
            # Écrire les valeurs pour N
            write_to_cell(ws, f'E{row_num}', poste.get('brut_n', 0))
            write_to_cell(ws, f'F{row_num}', poste.get('amort_n', 0))
            write_to_cell(ws, f'G{row_num}', poste.get('montant_n', 0))
            
            # Écrire les valeurs pour N-1
            write_to_cell(ws, f'H{row_num}', poste.get('montant_n1', 0))
```

#### Étape 1.3: Modifier le menu accordéon frontend
```typescript
// Dans EtatsControleAccordionRenderer.tsx ou composant similaire
const colonnesActif = [
    { key: 'brut_n', label: 'Brut N' },
    { key: 'amort_n', label: 'Amort. N' },
    { key: 'montant_n', label: 'Net N' },
    { key: 'montant_n1', label: 'Net N-1' }
];
```

---

### Solution 2: Ajouter les Totalisations

#### Étape 2.1: Identifier les postes de totalisation
```python
POSTES_TOTALISATION_ACTIF = {
    'AZ': {
        'libelle': 'TOTAL ACTIF IMMOBILISÉ',
        'postes_inclus': ['AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AP', 'AQ']
    },
    'BQ': {
        'libelle': 'TOTAL ACTIF CIRCULANT',
        'postes_inclus': ['BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK']
    },
    'BZ': {
        'libelle': 'TOTAL TRÉSORERIE-ACTIF',
        'postes_inclus': ['BT', 'BU', 'BV']
    },
    'CZ': {
        'libelle': 'TOTAL ÉCARTS DE CONVERSION-ACTIF',
        'postes_inclus': ['CA', 'CB']
    },
    'DZ': {
        'libelle': 'TOTAL GÉNÉRAL ACTIF',
        'postes_inclus': ['AZ', 'BQ', 'BZ', 'CZ']
    }
}
```

#### Étape 2.2: Calculer les totalisations
```python
def calculer_totalisations_actif(postes_actif):
    """
    Calcule les lignes de totalisation du bilan actif
    """
    # Convertir en dict pour accès rapide
    postes_dict = {p['ref']: p for p in postes_actif}
    
    totalisations = []
    
    for ref, config in POSTES_TOTALISATION_ACTIF.items():
        # Calculer les totaux
        brut_n = sum(postes_dict.get(r, {}).get('brut_n', 0) for r in config['postes_inclus'])
        amort_n = sum(postes_dict.get(r, {}).get('amort_n', 0) for r in config['postes_inclus'])
        net_n = sum(postes_dict.get(r, {}).get('montant_n', 0) for r in config['postes_inclus'])
        net_n1 = sum(postes_dict.get(r, {}).get('montant_n1', 0) for r in config['postes_inclus'])
        
        totalisations.append({
            'ref': ref,
            'libelle': config['libelle'],
            'brut_n': brut_n,
            'amort_n': amort_n,
            'montant_n': net_n,
            'montant_n1': net_n1,
            'est_totalisation': True
        })
    
    return totalisations
```

---

### Solution 3: Corriger le TFT

#### Étape 3.1: Vérifier le mapping des colonnes TFT
```python
# Dans export_liasse.py, fonction remplir_onglet_par_scan

# TFT: Vérifier les colonnes exactes dans le template
# Selon la capture d'écran TFT 1:
# - Colonne A: REF
# - Colonne I: Exercice N
# - Colonne K: Exercice N-1 (avec colonne J vide comme séparateur)

onglet_tft = next((name for name in wb.sheetnames if 'TFT' in name.upper()), None)
if onglet_tft and tft_dict:
    logger.info(f"📝 Remplissage {onglet_tft}...")
    # TFT: N en I, N-1 en K
    compteur, erreurs = remplir_onglet_par_scan(onglet_tft, tft_dict, 'I', 'K')
    total_cellules += compteur
    erreurs_total += erreurs
```

#### Étape 3.2: Améliorer la conversion dict → liste
```python
def convertir_tft_dict_vers_liste(tft_dict):
    """
    Convertit le dict TFT en liste de postes avec REF
    """
    # Mapping complet des clés vers REF
    mapping_tft = {
        'ZA_tresorerie_ouverture': 'ZA',
        'ZB_flux_operationnels': 'ZB',
        'ZC_flux_investissement': 'ZC',
        'ZD_flux_capitaux_propres': 'ZD',
        'ZE_flux_capitaux_etrangers': 'ZE',
        'ZF_flux_financement': 'ZF',
        'ZG_variation_tresorerie': 'ZG',
        'ZH_tresorerie_cloture': 'ZH',
        'FA_cafg': 'FA',
        'FB_variation_actif_hao': 'FB',
        'FC_variation_stocks': 'FC',
        'FD_variation_creances': 'FD',
        'FE_variation_dettes': 'FE',
        'FF_decaissements_investissement': 'FF',
        'FG_encaissements_investissement': 'FG',
        'FH_augmentation_capital': 'FH',
        'FI_dividendes_verses': 'FI',
        'FJ_emprunts_nouveaux': 'FJ',
        'FK_remboursements_emprunts': 'FK',
    }
    
    tft_liste = []
    for cle, ref in mapping_tft.items():
        if cle in tft_dict:
            tft_liste.append({
                'ref': ref,
                'montant_n': float(tft_dict.get(cle, 0) or 0),
                'montant_n1': 0  # À calculer depuis balance N-1
            })
    
    return tft_liste
```

---

## 📊 Plan d'Action

### Phase 1: Diagnostic (FAIT)
- [x] Créer script de diagnostic complet
- [x] Analyser le template Excel
- [x] Identifier les problèmes précis

### Phase 2: Corrections Backend (À FAIRE)
- [ ] Modifier `etats_financiers_v2.py` pour calculer brut et amortissement
- [ ] Ajouter fonction de calcul des totalisations
- [ ] Améliorer la conversion TFT dict → liste
- [ ] Tester les calculs avec la balance démo

### Phase 3: Corrections Export (À FAIRE)
- [ ] Vérifier les colonnes exactes dans le template
- [ ] Modifier `export_liasse.py` pour remplir brut et amortissement
- [ ] Ajouter le remplissage des totalisations
- [ ] Corriger le mapping TFT (colonnes I et K)
- [ ] Tester l'export complet

### Phase 4: Corrections Frontend (À FAIRE)
- [ ] Modifier le menu accordéon pour afficher brut et amortissement
- [ ] Ajouter les colonnes dans le composant React
- [ ] Tester l'affichage

### Phase 5: Tests et Validation (À FAIRE)
- [ ] Tester avec la balance démo complète
- [ ] Vérifier tous les onglets (BILAN, ACTIF, PASSIF, RESULTAT, TFT)
- [ ] Valider les totalisations
- [ ] Comparer avec le menu accordéon

---

## 🔧 Scripts de Test

### Script 1: Test des calculs brut/amortissement
```python
# test_brut_amortissement.py
from etats_financiers_v2 import calculer_bilan_actif_complet
import pandas as pd

balance_n = pd.read_excel("P000 -BALANCE DEMO N_N-1_N-2.xls", sheet_name="BALANCE N")
balance_n1 = pd.read_excel("P000 -BALANCE DEMO N_N-1_N-2.xls", sheet_name="BALANCE N-1")
balance_n2 = pd.read_excel("P000 -BALANCE DEMO N_N-1_N-2.xls", sheet_name="BALANCE N-2")

bilan_actif = calculer_bilan_actif_complet(balance_n, balance_n1, balance_n2)

print("Bilan Actif avec Brut et Amortissement:")
for poste in bilan_actif[:5]:
    print(f"{poste['ref']}: Brut={poste['brut_n']:,.0f}, Amort={poste['amort_n']:,.0f}, Net={poste['montant_n']:,.0f}")
```

### Script 2: Test de l'export complet
```python
# test_export_complet.py
from export_liasse import remplir_liasse_officielle
from etats_financiers_v2 import generer_etats_financiers
import pandas as pd

# Charger les balances
balance_n = pd.read_excel("P000 -BALANCE DEMO N_N-1_N-2.xls", sheet_name="BALANCE N")
balance_n1 = pd.read_excel("P000 -BALANCE DEMO N_N-1_N-2.xls", sheet_name="BALANCE N-1")
balance_n2 = pd.read_excel("P000 -BALANCE DEMO N_N-1_N-2.xls", sheet_name="BALANCE N-2")

# Générer les états
results = generer_etats_financiers(balance_n, balance_n1, balance_n2)

# Exporter
file_content = remplir_liasse_officielle(results, "TEST ENTREPRISE", "2024")

# Sauvegarder
with open("test_liasse_complete.xlsx", "wb") as f:
    f.write(file_content)

print("✅ Export terminé: test_liasse_complete.xlsx")
```

---

## 📝 Checklist de Validation

Après corrections:
- [ ] Bilan ACTIF: Colonnes BRUT, AMORTISSEMENT et NET renseignées pour N
- [ ] Bilan ACTIF: Colonne NET renseignée pour N-1
- [ ] Bilan ACTIF: Totalisations (AZ, BQ, BZ, CZ, DZ) renseignées
- [ ] Bilan PASSIF: Toutes les valeurs renseignées
- [ ] Compte de RÉSULTAT: Toutes les valeurs renseignées
- [ ] TFT: Toutes les valeurs renseignées (colonnes I et K)
- [ ] Menu accordéon: Affiche BRUT, AMORTISSEMENT et NET
- [ ] Cohérence: Frontend = Export Excel
- [ ] 16 états de contrôle présents et corrects

---

## 📞 Support

### Fichiers de référence
- Template: `py_backend/Liasse_officielle_revise.xlsx`
- Balance démo: `py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls`
- Code export: `py_backend/export_liasse.py`
- Code calculs: `py_backend/etats_financiers_v2.py`

### Documentation
- Architecture: `Doc_Etat_Fin/00_ARCHITECTURE_ETATS_FINANCIERS.md`
- Index complet: `Doc_Etat_Fin/00_INDEX_COMPLET_V2.md`
- Solutions précédentes: `Doc_Etat_Fin/Documentation/Double_Probleme_Export_Liasse/01_SOLUTIONS_IMPLEMENTEES_06_AVRIL_2026.md`

---

**Dernière mise à jour:** 06 AVRIL 2026  
**Version:** 2.0  
**Statut:** Analyse complète - En attente de corrections
