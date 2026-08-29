# Calculs Arithmétiques - Menu Contextuel ClaraVerse

## Modifications apportées à `public/menu.js`

### Nouvelles fonctions de calcul dans la section "Arithmétique" 🔢

Les 5 actions de calcul suivantes ont été implémentées et sont accessibles via le menu contextuel des tables :

---

## 1. Validation (Ctrl+1)
**Formule** : `C = A + B`, `Écart = C - D`

**Colonnes utilisées** : 3 dernières colonnes avant "Écart"
- **A** = colonne Écart-3
- **B** = colonne Écart-2  
- **D** = colonne Écart-1 (valeur de référence)
- **C** = A + B (calculé)
- **Écart** = C - D

**Type de données** : Valeurs monétaires

---

## 2. Mouvement (Ctrl+2)
**Formule** : `D = A + B - C`, `Écart = D - E`

**Colonnes utilisées** : 5 dernières colonnes avant "Écart"
- **A** = colonne Écart-5
- **B** = colonne Écart-4
- **C** = colonne Écart-3
- **D** = colonne Écart-2 (calculé et mis à jour)
- **E** = colonne Écart-1
- **Écart** = D - E

**Type de données** : Valeurs monétaires

---

## 3. Rapprochement (Ctrl+3)
**Formule** : `C = A - B`, `Écart = C`

**Colonnes utilisées** : 3 dernières colonnes avant "Écart"
- **A** = colonne Écart-3
- **B** = colonne Écart-2
- **C** = colonne Écart-1 (calculé et mis à jour)
- **Écart** = C

**Type de données** : Valeurs monétaires

---

## 4. Séparation (Ctrl+4)
**Formule** : `C = A - B` (différence en jours), `Écart = C`

**Colonnes utilisées** : 3 dernières colonnes avant "Écart"
- **A** = colonne Écart-3 (date)
- **B** = colonne Écart-2 (date)
- **C** = colonne Écart-1 (calculé en jours)
- **Écart** = nombre de jours

**Type de données** : Dates
- Formats supportés : `2024` (année), `23/12/2024` (JJ/MM/AAAA), `2024-12-23` (ISO)

---

## 5. Estimation (Ctrl+5)
**Formule** : `C = A × B`, `Écart = C - D`

**Colonnes utilisées** : 4 dernières colonnes avant "Écart"
- **A** = colonne Écart-4 (montant)
- **B** = colonne Écart-3 (taux en % ou décimal)
- **C** = colonne Écart-2 (calculé et mis à jour)
- **D** = colonne Écart-1 (valeur de référence)
- **Écart** = C - D

**Type de données** : A, C, D = monétaires, B = taux (%)

---

## Fonctions utilitaires ajoutées

| Fonction | Description |
|----------|-------------|
| `parseMonetaryValue(value)` | Parse une valeur monétaire (ex: "1 234,56" → 1234.56) |
| `parseDateValue(value)` | Parse une date (formats: année, JJ/MM/AAAA, AAAA-MM-JJ) |
| `dateDiffInDays(date1, date2)` | Calcule la différence en jours entre deux dates |
| `formatMonetary(value)` | Formate un nombre en format monétaire français |
| `findEcartColumnIndex(headers)` | Trouve l'index de la colonne "Ecart" ou "Écart" |
| `getTableHeaders()` | Récupère les en-têtes de la table active |
| `getDataRows()` | Récupère les lignes de données (tbody) |

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+1` | Validation |
| `Ctrl+2` | Mouvement |
| `Ctrl+3` | Rapprochement |
| `Ctrl+4` | Séparation |
| `Ctrl+5` | Estimation |

---

## Comportement visuel

- Les valeurs calculées sont affichées en **gras**
- La colonne "Écart" est colorée :
  - 🟢 **Vert** si écart ≥ 0
  - 🔴 **Rouge** si écart < 0

---

## Prérequis

Pour utiliser ces calculs :
1. La table doit contenir une colonne nommée "Ecart" ou "Écart"
2. Les colonnes nécessaires doivent être présentes avant la colonne Écart
3. Cliquer sur une cellule de la table pour la sélectionner
4. Accéder au menu contextuel (survol ou clic droit) → Section "Arithmétique"

---

## Test rapide

1. Créer une table avec les colonnes : `Libellé | A | B | D | Ecart`
2. Remplir avec des valeurs numériques
3. Cliquer sur la table
4. Menu → Arithmétique → Validation
5. La colonne Écart sera calculée automatiquement
