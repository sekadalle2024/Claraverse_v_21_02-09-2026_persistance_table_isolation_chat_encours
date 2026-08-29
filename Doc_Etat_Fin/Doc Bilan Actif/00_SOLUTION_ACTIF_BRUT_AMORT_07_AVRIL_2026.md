# Solution: Calcul et Affichage ACTIF avec BRUT, AMORT ET DEPREC, NET

**Date**: 07 Avril 2026  
**Statut**: ✅ Solution complète  
**Objectif**: Résoudre le problème d'affichage des colonnes BRUT et AMORT ET DEPREC dans la section ACTIF du bilan

---

## 🎯 Problème Identifié

### Contexte
Dans le menu accordéon des états financiers, la section ACTIF du bilan affiche uniquement la colonne NET pour l'exercice N, alors que le format liasse SYSCOHADA Révisé exige l'affichage de 3 colonnes:
- **BRUT**: Valeur brute des immobilisations
- **AMORT ET DEPREC**: Amortissements et dépréciations cumulés
- **NET**: Valeur nette (BRUT - AMORT ET DEPREC)

### Captures d'écran
- **Problème actuel**: Voir "ACTIF MENU ACCORDEON" - seule la colonne NET est affichée
- **Format attendu**: Voir "ACTIF SYSCOHADA REVISE" - 3 colonnes (BRUT, AMORT ET DEPREC, NET)

---

## 📊 Principe de Calcul SYSCOHADA

### Règles Comptables

#### 1. Valeur BRUTE
- **Comptes concernés**: Classe 2 (immobilisations) HORS 28 et 29
- **Exemples**: 
  - 211: Frais de recherche et développement
  - 22: Terrains
  - 23: Bâtiments
  - 24: Matériel
- **Sens normal**: Débiteur (solde positif)
- **Calcul**: Somme des soldes débiteurs des comptes d'immobilisation

#### 2. Amortissements et Dépréciations
- **Comptes concernés**: 
  - Classe 28: Amortissements des immobilisations
  - Classe 29: Provisions pour dépréciation des immobilisations
- **Exemples**:
  - 2811: Amortissements des frais de recherche
  - 282: Amortissements des terrains
  - 283: Amortissements des bâtiments
  - 284: Amortissements du matériel
  - 29: Provisions pour dépréciation
- **Sens normal**: Créditeur (solde négatif)
- **Calcul**: Valeur absolue de la somme des soldes créditeurs

#### 3. Valeur NETTE
- **Formule**: NET = BRUT - AMORT ET DEPREC
- **Interprétation**: Valeur comptable nette des immobilisations

### Correspondance avec correspondances_syscohada.json

Le fichier `correspondances_syscohada.json` contient les racines de comptes pour chaque poste:

```json
{
  "ref": "AE",
  "libelle": "Frais de recherche et de développement",
  "racines": ["211", "2191", "2811", "2919"]
}
```

**Interprétation**:
- `211` et `2191`: Comptes bruts (valeur d'acquisition)
- `2811` et `2919`: Comptes d'amortissement/provision

---

## 🛠️ Solution Technique

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NOUVEAU MODULE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  py_backend/calculer_actif_brut_amort.py                    │
│                                                              │
│  Fonctions principales:                                      │
│  1. calculer_actif_avec_brut_amort()                        │
│     └─> Parcourt la balance                                 │
│     └─> Identifie comptes bruts (2x hors 28/29)            │
│     └─> Identifie comptes amort/prov (28x, 29x)            │
│     └─> Calcule NET = BRUT - AMORT                          │
│                                                              │
│  2. calculer_totalisations_actif()                          │
│     └─> AZ: TOTAL ACTIF IMMOBILISÉ                         │
│     └─> BP: TOTAL ACTIF CIRCULANT                          │
│     └─> BT: TOTAL TRÉSORERIE-ACTIF                         │
│     └─> BZ: TOTAL GÉNÉRAL                                   │
│                                                              │
│  3. generer_html_actif_detaille()                           │
│     └─> Génère tableau HTML avec 7 colonnes                │
│     └─> Format conforme liasse SYSCOHADA                   │
│                                                              │
│  4. enrichir_actif_avec_brut_amort()                        │
│     └─> Fonction d'intégration principale                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Algorithme de Calcul

```python
Pour chaque poste d'actif:
    brut = 0
    amort_deprec = 0
    
    Pour chaque racine du poste:
        Pour chaque compte de la balance:
            Si compte commence par racine:
                Si compte commence par '28' ou '29':
                    # Compte d'amortissement/provision
                    amort_deprec += abs(solde_net)
                Sinon:
                    # Compte brut
                    brut += solde_net
    
    net = brut - amort_deprec
```

### Structure de Données

```python
actif_detaille = {
    'AE': {
        'ref': 'AE',
        'libelle': 'Frais de recherche et de développement',
        'brut': 1000000.0,
        'amort_deprec': 200000.0,
        'net': 800000.0,
        'comptes_brut': [
            {'numero': '211000', 'intitule': 'Frais de R&D', 'montant': 1000000.0}
        ],
        'comptes_amort': [
            {'numero': '281100', 'intitule': 'Amort frais R&D', 'montant': 200000.0}
        ]
    },
    ...
}
```

---

## 📁 Fichiers Créés

### 1. Module Principal
**Fichier**: `py_backend/calculer_actif_brut_amort.py`  
**Lignes**: ~400  
**Fonctions**: 6

#### Fonctions Principales

##### `calculer_actif_avec_brut_amort(balance_df, correspondances, col_map)`
- **Entrée**: DataFrame balance, correspondances, mapping colonnes
- **Sortie**: Dictionnaire avec postes enrichis (brut, amort, net)
- **Rôle**: Calcule les 3 colonnes pour chaque poste d'actif

##### `calculer_totalisations_actif(actif_detaille)`
- **Entrée**: Dictionnaire des postes
- **Sortie**: Dictionnaire enrichi avec totaux
- **Rôle**: Calcule AZ, BP, BT, BZ

##### `generer_html_actif_detaille(actif_detaille)`
- **Entrée**: Dictionnaire des postes
- **Sortie**: HTML formaté
- **Rôle**: Génère le tableau HTML conforme SYSCOHADA

##### `enrichir_actif_avec_brut_amort(balance_df, correspondances, col_map)`
- **Entrée**: Balance, correspondances, colonnes
- **Sortie**: Dict avec actif_detaille et html
- **Rôle**: Fonction d'intégration principale

### 2. Script de Test
**Fichier**: `test_actif_brut_amort.py`  
**Lignes**: ~250  
**Rôle**: Test complet du module

#### Fonctionnalités
- Charge la balance de démonstration
- Charge les correspondances
- Exécute le calcul
- Affiche les résultats dans la console
- Génère un fichier HTML
- Ouvre le HTML dans le navigateur

### 3. Script PowerShell
**Fichier**: `test-actif-brut-amort.ps1`  
**Rôle**: Automatisation du test

#### Fonctionnalités
- Vérifie les fichiers requis
- Active l'environnement conda
- Exécute le test Python
- Affiche le statut

### 4. Documentation
**Fichier**: `Doc_Etat_Fin/Documentation/00_SOLUTION_ACTIF_BRUT_AMORT_07_AVRIL_2026.md`  
**Rôle**: Documentation complète de la solution

---

## 🧪 Tests

### Prérequis
1. Fichier balance: `P000 -BALANCE DEMO N_N-1_N-2.xls`
2. Fichier correspondances: `py_backend/correspondances_syscohada.json`
3. Environnement conda: `claraverse_backend`

### Exécution du Test

#### Méthode 1: PowerShell (Recommandé)
```powershell
.\test-actif-brut-amort.ps1
```

#### Méthode 2: Python Direct
```bash
conda activate claraverse_backend
python test_actif_brut_amort.py
```

### Résultats Attendus

#### Console
```
============================================
📊 RÉSULTATS DU CALCUL - ACTIF AVEC BRUT, AMORT, NET
============================================

✅ X postes avec des valeurs

AE - Frais de recherche et de développement
   BRUT:           1,000,000
   AMORT ET DEPREC:   200,000
   NET:              800,000
   Comptes bruts (1):
      - 211000: 1,000,000
   Comptes amort/prov (1):
      - 281100: 200,000

...

============================================
📈 TOTAUX
============================================

AZ - TOTAL ACTIF IMMOBILISÉ
   BRUT:          50,000,000
   AMORT ET DEPREC: 10,000,000
   NET:           40,000,000
```

#### Fichier HTML
- Tableau avec 7 colonnes
- Format conforme liasse SYSCOHADA
- Toutes les valeurs affichées
- Totalisations correctes

---

## 🔄 Intégration dans le Workflow Principal

### Étape 1: Modifier `etats_financiers.py`

Ajouter l'import:
```python
from calculer_actif_brut_amort import enrichir_actif_avec_brut_amort
```

### Étape 2: Enrichir les Résultats

Dans la fonction `process_balance_to_etats_financiers()`:

```python
# Après le calcul des états financiers classiques
results = {
    'bilan_actif': ...,
    'bilan_passif': ...,
    ...
}

# Enrichir l'actif avec BRUT, AMORT, NET
actif_enrichi = enrichir_actif_avec_brut_amort(balance_df, correspondances, col_map)
results['actif_detaille'] = actif_enrichi['actif_detaille']
results['actif_html'] = actif_enrichi['html']
```

### Étape 3: Modifier le HTML

Dans la fonction `generate_etats_financiers_html()`:

```python
# Remplacer la section BILAN ACTIF par:
if 'actif_html' in results:
    html += results['actif_html']
else:
    # Fallback sur l'ancien format
    html += generate_section_html("bilan_actif", ...)
```

### Étape 4: Modifier le Frontend

Dans `EtatFinAutoTrigger.js` ou le composant React correspondant:

```javascript
// Détecter la présence de l'actif détaillé
if (results.actif_html) {
    // Insérer le HTML de l'actif détaillé
    accordeonContainer.innerHTML = results.actif_html + accordeonContainer.innerHTML;
}
```

---

## 📊 Format de Sortie HTML

### Structure du Tableau

```html
<table class="actif-table">
    <thead>
        <tr>
            <th>REF</th>
            <th>ACTIF</th>
            <th>NOTE</th>
            <th>BRUT</th>
            <th>AMORT ET DEPREC</th>
            <th>NET</th>
            <th>NET N-1</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>AE</td>
            <td>Frais de recherche et de développement</td>
            <td>-</td>
            <td>1 000 000</td>
            <td>200 000</td>
            <td>800 000</td>
            <td>-</td>
        </tr>
        ...
    </tbody>
</table>
```

### Styles CSS

- **En-têtes**: Fond gris clair, texte centré
- **Lignes normales**: Fond blanc, hover gris très clair
- **Lignes de totalisation**: Fond bleu clair, bordures bleues
- **Sections**: Fond bleu très clair, texte bleu foncé
- **Montants**: Police monospace, alignés à droite
- **Format**: Séparateurs de milliers, "-" pour valeurs nulles

---

## ✅ Validation

### Contrôles à Effectuer

#### 1. Cohérence des Calculs
```python
# Pour chaque poste:
assert net == brut - amort_deprec

# Pour les totaux:
assert AZ.net == sum(postes_immobilises.net)
assert BZ.net == AZ.net + BP.net + BT.net + BU.net
```

#### 2. Cohérence avec l'Ancien Format
```python
# Le NET calculé doit correspondre au montant de l'ancien format
assert actif_detaille['AE']['net'] == results['bilan_actif']['AE']['montant']
```

#### 3. Sens des Comptes
- Comptes bruts (2x hors 28/29): Solde débiteur (positif)
- Comptes amort/prov (28x, 29x): Solde créditeur (négatif → valeur absolue)

#### 4. Format d'Affichage
- Valeurs nulles affichées comme "-"
- Séparateurs de milliers
- Pas de décimales
- Alignement correct

---

## 🎯 Avantages de la Solution

### 1. Conformité SYSCOHADA
- ✅ Format liasse officielle respecté
- ✅ 3 colonnes obligatoires affichées
- ✅ Calculs conformes aux normes comptables

### 2. Modularité
- ✅ Module indépendant réutilisable
- ✅ Pas de modification du code existant
- ✅ Intégration facile

### 3. Maintenabilité
- ✅ Code documenté
- ✅ Tests complets
- ✅ Logs détaillés

### 4. Performance
- ✅ Calcul en une seule passe
- ✅ Pas de requêtes supplémentaires
- ✅ Génération HTML optimisée

---

## 📝 Prochaines Étapes

### Phase 1: Tests (Actuelle)
- [x] Créer le module de calcul
- [x] Créer le script de test
- [x] Valider les calculs
- [x] Valider le HTML

### Phase 2: Intégration Backend
- [ ] Modifier `etats_financiers.py`
- [ ] Ajouter l'enrichissement de l'actif
- [ ] Tester l'endpoint API
- [ ] Valider les résultats

### Phase 3: Intégration Frontend
- [ ] Modifier le composant React
- [ ] Remplacer l'affichage de l'actif
- [ ] Tester dans le menu accordéon
- [ ] Valider l'affichage

### Phase 4: Export Excel
- [ ] Modifier `export_liasse.py`
- [ ] Ajouter les colonnes BRUT et AMORT
- [ ] Tester l'export
- [ ] Valider le template Excel

### Phase 5: Documentation
- [ ] Mettre à jour l'architecture
- [ ] Mettre à jour les guides utilisateur
- [ ] Créer des exemples
- [ ] Mettre à jour le README

---

## 🐛 Points d'Attention

### 1. Détection des Comptes d'Amortissement
**Problème**: Certains comptes 28/29 peuvent ne pas être dans les racines  
**Solution**: Vérifier systématiquement si le compte commence par '28' ou '29'

### 2. Comptes Mixtes
**Problème**: Certaines racines contiennent à la fois des comptes bruts et d'amortissement  
**Exemple**: `["211", "2811"]` dans le poste AE  
**Solution**: Distinguer par le préfixe du compte (28/29 vs autres)

### 3. Actif Circulant
**Problème**: L'actif circulant n'a généralement pas d'amortissement  
**Solution**: Pour BP, BT, BU: `brut = net` et `amort_deprec = 0`

### 4. Format d'Affichage
**Problème**: Valeurs nulles vs tirets  
**Solution**: Afficher "-" pour les valeurs < 0.01

### 5. Exercice N-1
**Problème**: Colonne NET N-1 non calculée dans cette version  
**Solution**: Afficher "-" en attendant l'intégration de la balance N-1

---

## 📚 Références

### Fichiers Clés
- `py_backend/correspondances_syscohada.json`: Mapping postes/comptes
- `P000 -BALANCE DEMO N_N-1_N-2.xls`: Balance de démonstration
- `Doc_Etat_Fin/00_ARCHITECTURE_ETATS_FINANCIERS.md`: Architecture globale

### Normes SYSCOHADA
- Plan comptable SYSCOHADA Révisé
- Format liasse officielle
- Règles d'amortissement et de dépréciation

---

**Date de création**: 07 Avril 2026  
**Version**: 1.0  
**Auteur**: Kiro AI Assistant  
**Statut**: ✅ Solution complète prête pour intégration
