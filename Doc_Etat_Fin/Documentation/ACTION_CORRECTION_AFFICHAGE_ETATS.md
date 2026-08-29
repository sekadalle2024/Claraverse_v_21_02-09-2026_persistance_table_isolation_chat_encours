# Action Correction Affichage États Financiers

**Date** : 22 mars 2026  
**Priorité** : CRITIQUE

---

## Problèmes Identifiés

### 1. Colonnes Manquantes
❌ **Actuel** : Une seule colonne de montants  
✅ **Attendu** : Deux colonnes "Exercice N" et "Exercice N-1"

### 2. Rubriques Incomplètes
❌ **Actuel** : Seuls les postes avec montants sont affichés  
✅ **Attendu** : TOUS les postes de la liasse officielle, même vides (avec "-")

### 3. Incohérence avec Export Excel
❌ **Actuel** : Menu accordéon différent de l'export Excel  
✅ **Attendu** : Menu accordéon identique à la liasse officielle

---

## Exemple Liasse Officielle (Capture L2)

```
REF | LIBELLES                                    | NOTE | EXERCICE N | EXERCICE N-1
----|---------------------------------------------|------|------------|-------------
TA  | Ventes de marchandises                      | 21   |     -      |      -
RA  | Achats de marchandises                      | 22   |     -      |      -
RB  | Variation de stocks de marchandises         | 6    |     -      |      -
XA  | MARGE COMMERCIALE (Somme TA à RB)          |      |     -      |      -
TB  | Ventes de produits fabriqués                | 21   |     -      |      -
...
XI  | RESULTAT NET (XG+XH+RQ+RS)                 |      |175 700 725 |-189 540 500
```

---

## Solution à Implémenter

### 1. Charger Structure Complète
- Lire TOUS les postes de `correspondances_syscohada.json`
- Inclure les postes de totalisation (XA, XB, XI, etc.)
- Ordre exact de la liasse officielle

### 2. Traiter 2 Exercices
- Balance N → Exercice N
- Balance N-1 → Exercice N-1
- Afficher "-" si montant = 0 ou poste absent

### 3. Format Tableau HTML
```html
<table>
  <thead>
    <tr>
      <th>REF</th>
      <th>LIBELLES</th>
      <th>NOTE</th>
      <th>EXERCICE N</th>
      <th>EXERCICE N-1</th>
    </tr>
  </thead>
  <tbody>
    <!-- Tous les postes, même vides -->
  </tbody>
</table>
```

---

## Fichiers à Modifier

### Backend
1. **`py_backend/etats_financiers.py`**
   - Fonction `process_balance_to_etats_financiers()` : traiter N et N-1
   - Fonction `generate_section_html()` : format tableau 2 colonnes
   - Charger structure complète de la liasse

2. **`py_backend/correspondances_syscohada.json`**
   - Vérifier que TOUS les postes sont présents
   - Ajouter les postes de totalisation si manquants

### Structure de Données
```python
results = {
    'bilan_actif': {
        'AD': {
            'ref': 'AD',
            'libelle': 'Immobilisations incorporelles',
            'note': '3',
            'montant_n': 50000,
            'montant_n1': 45000
        },
        'AE': {
            'ref': 'AE',
            'libelle': 'Frais de développement',
            'note': '3A',
            'montant_n': 0,  # Afficher "-"
            'montant_n1': 0  # Afficher "-"
        },
        # ... TOUS les postes
    }
}
```

---

## Ordre de la Liasse Officielle

### Bilan Actif
```
AD - Immobilisations incorporelles
AE - Frais de développement et de prospection
AF - Brevets, licences, logiciels
AG - Fonds commercial
AH - Autres immobilisations incorporelles
AI - Immobilisations corporelles
AJ - Terrains
AK - Bâtiments
...
AZ - TOTAL ACTIF IMMOBILISE
BB - Actif circulant HAO
...
BZ - TOTAL ACTIF
```

### Compte de Résultat
```
TA - Ventes de marchandises
RA - Achats de marchandises
RB - Variation de stocks de marchandises
XA - MARGE COMMERCIALE
TB - Ventes de produits fabriqués
TC - Travaux, services vendus
...
XI - RESULTAT NET
```

---

## Prochaines Étapes

1. ✅ Créer ce document d'analyse
2. ⏳ Extraire la structure complète de la liasse officielle
3. ⏳ Modifier `process_balance_to_etats_financiers()` pour traiter N et N-1
4. ⏳ Modifier `generate_section_html()` pour format 2 colonnes
5. ⏳ Tester avec BALANCES_N_N1_N2.xlsx
6. ⏳ Vérifier cohérence avec export Excel

---

## Références

- Liasse Officielle : `py_backend/Liasse officielle.xlsm`
- Correspondances : `py_backend/correspondances_syscohada.json`
- Captures : L1, L2 (fournies par l'utilisateur)

---

**Statut** : EN ATTENTE D'IMPLÉMENTATION  
**Priorité** : CRITIQUE - Affichage incorrect
