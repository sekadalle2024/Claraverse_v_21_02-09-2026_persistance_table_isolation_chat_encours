# Solution : Affichage 3 Colonnes (N, N-1, N-2)

**Date** : 04 Avril 2026  
**Objectif** : Afficher les états financiers avec 3 colonnes pour comparer N, N-1 et N-2

---

## 📋 Vue d'Ensemble

Cette solution modifie le format liasse officielle pour afficher 3 colonnes au lieu de 2 :

| REF | LIBELLÉS | NOTE | EXERCICE N | EXERCICE N-1 | EXERCICE N-2 |
|-----|----------|------|------------|--------------|--------------|
| TA  | Ventes   | 21   | 1 000 000  | 950 000      | 900 000      |

---

## 🎯 Modifications à Apporter

### 1. Modifier `py_backend/etats_financiers_v2.py`

#### 1.1 Fonction `process_balance_to_liasse_format()`

**Avant** :
```python
def process_balance_to_liasse_format(
    balance_n_df: pd.DataFrame,
    balance_n1_df: Optional[pd.DataFrame],
    correspondances: Dict
) -> Dict[str, Any]:
```

**Après** :
```python
def process_balance_to_liasse_format(
    balance_n_df: pd.DataFrame,
    balance_n1_df: Optional[pd.DataFrame],
    balance_n2_df: Optional[pd.DataFrame],  # NOUVEAU
    correspondances: Dict
) -> Dict[str, Any]:
```

#### 1.2 Ajouter le calcul des montants N-2

**Ajouter après le calcul de `montants_n1`** :
```python
# Calculer montants N-2
montants_n2 = {}
if balance_n2_df is not None:
    col_map_n2 = detect_balance_columns(balance_n2_df)
    if col_map_n2:
        montants_n2 = calculer_montants_balance(
            balance_n2_df,
            col_map_n2,
            structure_complete['compte_resultat']
        )
```

#### 1.3 Modifier la structure des postes

**Avant** :
```python
resultat_complet.append({
    'ref': ref,
    'libelle': poste['libelle'],
    'note': poste.get('note', ''),
    'montant_n': montant_n,
    'montant_n1': montant_n1
})
```

**Après** :
```python
# Si c'est un poste de totalisation, calculer avec la formule
if poste.get('type') == 'total' and 'formule' in poste:
    montant_n = calculer_poste_formule(ref, poste['formule'], montants_n)
    montant_n1 = calculer_poste_formule(ref, poste['formule'], montants_n1) if montants_n1 else 0
    montant_n2 = calculer_poste_formule(ref, poste['formule'], montants_n2) if montants_n2 else 0
    
    # Stocker pour les calculs suivants
    montants_n[ref] = montant_n
    montants_n1[ref] = montant_n1
    montants_n2[ref] = montant_n2
else:
    montant_n = montants_n.get(ref, 0)
    montant_n1 = montants_n1.get(ref, 0)
    montant_n2 = montants_n2.get(ref, 0)

resultat_complet.append({
    'ref': ref,
    'libelle': poste['libelle'],
    'note': poste.get('note', ''),
    'montant_n': montant_n,
    'montant_n1': montant_n1,
    'montant_n2': montant_n2  # NOUVEAU
})
```

#### 1.4 Modifier `generate_section_html_liasse()`

**Avant** :
```python
def generate_section_html_liasse(
    section_id: str,
    title: str,
    postes: List[Dict],
    exercice_n_label: str = "EXERCICE N",
    exercice_n1_label: str = "EXERCICE N-1"
) -> str:
```

**Après** :
```python
def generate_section_html_liasse(
    section_id: str,
    title: str,
    postes: List[Dict],
    exercice_n_label: str = "EXERCICE N",
    exercice_n1_label: str = "EXERCICE N-1",
    exercice_n2_label: str = "EXERCICE N-2"  # NOUVEAU
) -> str:
```

**Modifier le HTML du tableau** :
```python
html = f"""
<div class="etats-fin-section" data-section="{section_id}">
    <div class="section-header-ef">
        <span>{title}</span>
        <span class="arrow">›</span>
    </div>
    <div class="section-content-ef">
        <table class="liasse-table">
            <thead>
                <tr>
                    <th style="width: 60px;">REF</th>
                    <th style="width: auto;">LIBELLÉS</th>
                    <th style="width: 60px;">NOTE</th>
                    <th style="width: 150px; text-align: right;">{exercice_n_label}</th>
                    <th style="width: 150px; text-align: right;">{exercice_n1_label}</th>
                    <th style="width: 150px; text-align: right;">{exercice_n2_label}</th>
                </tr>
            </thead>
            <tbody>
"""

for poste in postes:
    ref = poste['ref']
    libelle = poste['libelle']
    note = poste.get('note', '')
    montant_n = poste.get('montant_n', 0)
    montant_n1 = poste.get('montant_n1', 0)
    montant_n2 = poste.get('montant_n2', 0)  # NOUVEAU
    
    # Déterminer si c'est un poste de totalisation
    is_total = ref.startswith('X') or libelle.isupper() or 'TOTAL' in libelle.upper()
    row_class = 'total-row' if is_total else ''
    
    html += f"""
                <tr class="{row_class}">
                    <td class="ref-cell">{ref}</td>
                    <td class="libelle-cell">{libelle}</td>
                    <td class="note-cell">{note}</td>
                    <td class="montant-cell">{format_montant_liasse(montant_n)}</td>
                    <td class="montant-cell">{format_montant_liasse(montant_n1)}</td>
                    <td class="montant-cell">{format_montant_liasse(montant_n2)}</td>
                </tr>
    """
```

---

### 2. Modifier `py_backend/etats_financiers.py`

#### 2.1 Passer `balance_n2` à `process_balance_to_liasse_format()`

**Ligne 1518** :

**Avant** :
```python
results_liasse = process_balance_to_liasse_format(balance_df, balance_n1_df, correspondances)
```

**Après** :
```python
# Chercher Balance N-2 si disponible
balance_n2_df = None
balance_n2_patterns = ["Balance N-2", "balance n-2", "BALANCE N-2", "Balance N-2 (", "balance_n2"]

for sheet in sheet_names:
    if any(pattern in sheet for pattern in balance_n2_patterns):
        balance_n2_df = pd.read_excel(excel_data, sheet_name=sheet)
        logger.info(f"✅ Balance N-2 trouvée dans l'onglet '{sheet}': {len(balance_n2_df)} lignes")
        break

if balance_n2_df is None:
    logger.info("📋 Balance N-2 non trouvée, colonne N-2 sera vide")

# Traiter les balances au format liasse avec N-2
results_liasse = process_balance_to_liasse_format(balance_df, balance_n1_df, balance_n2_df, correspondances)
```

#### 2.2 Modifier l'appel à `generate_section_html_liasse()`

**Dans `generer_etats_liasse.py`** (ligne 127-128) :

**Avant** :
```python
html += generate_section_html_liasse("bilan_actif", "🏢 ACTIF", results['bilan_actif'], "EXERCICE N (2024)", "EXERCICE N-1 (2023)")
html += generate_section_html_liasse("bilan_passif", "🏛️ PASSIF", results['bilan_passif'], "EXERCICE N (2024)", "EXERCICE N-1 (2023)")
```

**Après** :
```python
html += generate_section_html_liasse("bilan_actif", "🏢 ACTIF", results['bilan_actif'], "EXERCICE N (2024)", "EXERCICE N-1 (2023)", "EXERCICE N-2 (2022)")
html += generate_section_html_liasse("bilan_passif", "🏛️ PASSIF", results['bilan_passif'], "EXERCICE N (2024)", "EXERCICE N-1 (2023)", "EXERCICE N-2 (2022)")
```

---

### 3. Ajouter les Totaux Généraux (DZ)

#### 3.1 Ajouter dans `structure_liasse_complete.json`

**Ajouter à la fin du Bilan Actif** :
```json
{
    "ref": "DZ",
    "libelle": "TOTAL GÉNÉRAL ACTIF",
    "type": "total",
    "formule": "somme de tous les postes actif"
}
```

**Ajouter à la fin du Bilan Passif** :
```json
{
    "ref": "DZ",
    "libelle": "TOTAL GÉNÉRAL PASSIF",
    "type": "total",
    "formule": "somme de tous les postes passif"
}
```

#### 3.2 Calculer les totaux dans `process_balance_to_liasse_format()`

**Ajouter après la construction des listes** :
```python
# Calculer les totaux généraux
total_actif_n = sum(p['montant_n'] for p in bilan_actif_complet)
total_actif_n1 = sum(p['montant_n1'] for p in bilan_actif_complet)
total_actif_n2 = sum(p['montant_n2'] for p in bilan_actif_complet)

bilan_actif_complet.append({
    'ref': 'DZ',
    'libelle': 'TOTAL GÉNÉRAL ACTIF',
    'note': '',
    'montant_n': total_actif_n,
    'montant_n1': total_actif_n1,
    'montant_n2': total_actif_n2
})

# Idem pour le passif
total_passif_n = sum(p['montant_n'] for p in bilan_passif_complet)
total_passif_n1 = sum(p['montant_n1'] for p in bilan_passif_complet)
total_passif_n2 = sum(p['montant_n2'] for p in bilan_passif_complet)

bilan_passif_complet.append({
    'ref': 'DZ',
    'libelle': 'TOTAL GÉNÉRAL PASSIF',
    'note': '',
    'montant_n': total_passif_n,
    'montant_n1': total_passif_n1,
    'montant_n2': total_passif_n2
})
```

---

### 4. Intégrer le TFT dans le Menu Accordéon

#### 4.1 Modifier `calculer_tft_liasse()` dans `tableau_flux_tresorerie_v2.py`

**Ajouter le calcul pour N-1 vs N-2** :

```python
# Calculer les postes pour N (vs N-1)
postes_n = []
for ligne in tft_structure:
    if ligne['type'] == 'total':
        # Calculer avec formule
        montant_n = calculer_formule(ligne['formule'], postes_n)
    else:
        montant_n = calculer_poste(ligne['type'], balance_n, col_map_n, balance_n1, col_map_n1)
    
    postes_n.append({
        'ref': ligne['ref'],
        'libelle': ligne['libelle'],
        'montant_n': montant_n
    })

# Calculer les postes pour N-1 (vs N-2)
postes_n1 = []
if balance_n2 is not None:
    for ligne in tft_structure:
        if ligne['type'] == 'total':
            montant_n1 = calculer_formule(ligne['formule'], postes_n1)
        else:
            montant_n1 = calculer_poste(ligne['type'], balance_n1, col_map_n1, balance_n2, col_map_n2)
        
        postes_n1.append({
            'ref': ligne['ref'],
            'libelle': ligne['libelle'],
            'montant_n1': montant_n1
        })

# Fusionner les résultats
tft_complet = []
for i, ligne in enumerate(tft_structure):
    tft_complet.append({
        'ref': ligne['ref'],
        'libelle': ligne['libelle'],
        'montant_n': postes_n[i]['montant_n'],
        'montant_n1': postes_n1[i]['montant_n1'] if i < len(postes_n1) else 0,
        'montant_n2': 0  # Placeholder pour cohérence
    })

return {
    'tft': tft_complet,
    'controles': {...}
}
```

#### 4.2 Ajouter le TFT dans le HTML

**Dans `generate_etats_financiers_html()`** :

```python
# 4. TABLEAU DES FLUX DE TRÉSORERIE
if 'tft' in results and results['tft']:
    html += generate_section_html_liasse(
        "tft",
        "💰 TABLEAU DES FLUX DE TRÉSORERIE",
        results['tft']['tft'],
        "EXERCICE N (2024)",
        "EXERCICE N-1 (2023)",
        "EXERCICE N-2 (2022)"
    )
```

---

## 🧪 Tests

### Test 1 : Fichier avec 3 onglets

**Fichier** : `P000 -BALANCE DEMO N_N-1_N-2.xls`

**Commande** :
```bash
cd py_backend
conda run -n claraverse_backend python generer_etats_liasse.py
```

**Résultat attendu** :
- Menu accordéon avec 3 colonnes : N, N-1, N-2
- Toutes les valeurs affichées correctement
- Totaux généraux (DZ) affichés
- TFT affiché avec 3 colonnes

### Test 2 : Fichier avec 2 onglets seulement

**Fichier** : Balance avec seulement N et N-1

**Résultat attendu** :
- Colonne N-2 affiche "-" (vide)
- Pas d'erreur

### Test 3 : Fichier avec 1 onglet seulement

**Fichier** : Balance avec seulement N

**Résultat attendu** :
- Colonnes N-1 et N-2 affichent "-" (vide)
- Pas d'erreur

---

## 📊 Résultat Final

### Avant (2 colonnes)

| REF | LIBELLÉS | NOTE | EXERCICE N | EXERCICE N-1 |
|-----|----------|------|------------|--------------|
| TA  | Ventes   | 21   | 1 000 000  | 950 000      |

### Après (3 colonnes)

| REF | LIBELLÉS | NOTE | EXERCICE N | EXERCICE N-1 | EXERCICE N-2 |
|-----|----------|------|------------|--------------|--------------|
| TA  | Ventes   | 21   | 1 000 000  | 950 000      | 900 000      |
| ... | ...      | ...  | ...        | ...          | ...          |
| DZ  | TOTAL GÉNÉRAL | | 5 000 000  | 4 750 000    | 4 500 000    |

---

## ✅ Checklist

- [ ] Modifier `etats_financiers_v2.py`
  - [ ] Ajouter `balance_n2_df` dans `process_balance_to_liasse_format()`
  - [ ] Calculer `montants_n2`
  - [ ] Ajouter `montant_n2` dans la structure des postes
  - [ ] Modifier `generate_section_html_liasse()` pour 3 colonnes

- [ ] Modifier `etats_financiers.py`
  - [ ] Détecter Balance N-2
  - [ ] Passer `balance_n2_df` à `process_balance_to_liasse_format()`

- [ ] Ajouter les totaux généraux (DZ)
  - [ ] Calculer les totaux pour Actif et Passif
  - [ ] Afficher dans le menu accordéon

- [ ] Intégrer le TFT
  - [ ] Modifier `calculer_tft_liasse()` pour N-1 vs N-2
  - [ ] Ajouter le TFT dans le menu accordéon

- [ ] Tests
  - [ ] Test avec 3 onglets
  - [ ] Test avec 2 onglets
  - [ ] Test avec 1 onglet
  - [ ] Vérifier l'export Excel

---

## 📝 Notes

- Cette solution s'écarte du format liasse officielle (2 colonnes) mais répond à la demande utilisateur
- L'export Excel continuera de fonctionner normalement
- Les contrôles exhaustifs ne sont pas impactés

---

**Date de création** : 04 Avril 2026  
**Auteur** : Kiro AI Assistant  
**Statut** : 📋 Prêt pour implémentation
