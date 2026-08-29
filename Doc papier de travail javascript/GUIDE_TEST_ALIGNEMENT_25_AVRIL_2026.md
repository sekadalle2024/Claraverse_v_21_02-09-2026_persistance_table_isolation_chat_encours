# Guide de Test - Alignement des Colonnes
**Date:** 25 avril 2026

## 🎯 Objectif du test

Vérifier que les tables [Schéma de calcul] et [Cross référence horizontale] s'alignent correctement avec la table principale de test, avec les variables se terminant sur la colonne "Ecart".

---

## 📋 Prérequis

1. Avoir une div contenant au moins 2 tables:
   - Une table avec "Nature de test"
   - Une table principale avec colonnes (Conclusion/Assertion/CTR/Ecart)

2. Ouvrir la console du navigateur (F12) pour voir les logs

---

## 🧪 Cas de test

### Test 1: Rapprochement (3 variables)

**Table principale attendue:**
```
| Compte | Libellé | Solde BG | Solde PV | Ecart | Conclusion |
```

**Schéma de calcul attendu (6 colonnes alignées):**
```
|        |         |          | (A)      | (B)   | (C) = (A) - (B) |
```

**Cross référence attendue (6 colonnes alignées):**
```
|        |         |          | [  ]     | [  ]  | [  ]            |
```

**Vérifications:**
- ✅ Le schéma a 6 colonnes (comme la table principale)
- ✅ Les 3 premières colonnes sont vides
- ✅ Les variables (A), (B), (C) sont alignées avec Solde BG, Solde PV, Ecart
- ✅ La dernière variable (C) est sur la colonne Ecart

---

### Test 2: Mouvement (6 variables)

**Table principale attendue:**
```
| Compte | Libellé | Solde N-1 | Augmentation | Diminution | Solde N | Ecart | Conclusion |
```

**Schéma de calcul attendu (8 colonnes alignées):**
```
|        |         | (A)       | (B)          | (C)        | (D)=(A)+(B)-(C) | (E) | (F)=(D)-(E) |
```

**Vérifications:**
- ✅ Le schéma a 8 colonnes (comme la table principale)
- ✅ Les 2 premières colonnes sont vides
- ✅ Les variables sont alignées avec les colonnes de données
- ✅ La variable (E) est sur la colonne Ecart

---

### Test 3: Validation (5 variables)

**Table principale attendue:**
```
| Compte | Libellé | Solde A | Solde B | Total | Ecart | Conclusion |
```

**Schéma de calcul attendu (7 colonnes alignées):**
```
|        |         | (A)     | (B)     | (C)=(A)+(B) | (D) | (E)=(C)-(D) |
```

**Vérifications:**
- ✅ Le schéma a 7 colonnes
- ✅ Les 2 premières colonnes sont vides
- ✅ La variable (D) est sur la colonne Ecart

---

## 🔍 Comment tester

### Étape 1: Préparer la table de test

1. Créer une div avec 2 tables:

```html
<div class="prose">
  <!-- Table 2: Nature de test -->
  <table>
    <tr>
      <th>Nature de test</th>
      <td>Rapprochement</td>
    </tr>
  </table>

  <!-- Table principale -->
  <table>
    <thead>
      <tr>
        <th>Compte</th>
        <th>Libellé</th>
        <th>Solde BG</th>
        <th>Solde PV</th>
        <th>Ecart</th>
        <th>Conclusion</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>571100</td>
        <td>Caisse</td>
        <td>1500000</td>
        <td>1500000</td>
        <td>0</td>
        <td>OK</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Étape 2: Ajouter le schéma de calcul

1. Cliquer sur une cellule de la table principale
2. Clic droit → Menu contextuel
3. Section "Papier de travail" → "📐 Ajouter Schéma de calcul"
4. Ou utiliser le raccourci: `Ctrl+Shift+K`

### Étape 3: Vérifier l'alignement

**Dans la console, vous devriez voir:**
```
📐 [Schéma Calcul] Table principale: 6 colonnes
📐 [Alignement] Total colonnes table: 6
📐 [Alignement] Index colonne Ecart: 4
📐 [Alignement] Nombre de variables: 3
📐 [Alignement] Alignement sur Ecart: 3 colonnes vides
📐 [Schéma Calcul] Colonnes vides avant variables: 3
📐 [Schéma Calcul] Colonnes vides après variables: 0
📐 [Schéma Calcul] ✅ Alignement: 3 vides + 3 variables + 0 vides = 6 colonnes
```

**Visuellement:**
- Le schéma doit avoir le même nombre de colonnes que la table principale
- Les variables doivent être alignées avec les colonnes de données
- La dernière variable doit être sur la colonne "Ecart"

### Étape 4: Ajouter la cross référence

1. Cliquer sur une cellule de la table principale
2. Clic droit → Menu contextuel
3. Section "Papier de travail" → "📎 Ajouter Cross référence horizontale"
4. Ou utiliser le raccourci: `Ctrl+Shift+H`

### Étape 5: Vérifier l'alignement de la cross référence

**Dans la console, vous devriez voir:**
```
📎 [Cross Ref] Table principale: 6 colonnes
📎 [Cross Ref] Colonnes vides avant références: 3
📎 [Cross Ref] Colonnes vides après références: 0
📎 [Cross Ref] ✅ Alignement: 3 vides + 3 références + 0 vides = 6 colonnes
```

---

## ✅ Critères de succès

### Alignement visuel
- [ ] Les 3 tables ont le même nombre de colonnes
- [ ] Les colonnes sont parfaitement alignées verticalement
- [ ] Les variables du schéma sont sur les bonnes colonnes de données
- [ ] La dernière variable est sur la colonne "Ecart"
- [ ] Les références de la cross ref sont alignées avec les variables du schéma

### Logs console
- [ ] Pas d'erreur JavaScript
- [ ] Les logs montrent le bon calcul des colonnes vides
- [ ] Le total des colonnes correspond

### Édition
- [ ] Les cellules du schéma sont éditables
- [ ] Les cellules de la cross référence sont éditables
- [ ] Les colonnes vides ne sont pas éditables

---

## 🐛 Problèmes connus et solutions

### Problème 1: Les colonnes ne s'alignent pas

**Cause possible:** La colonne "Ecart" n'est pas détectée

**Solution:**
1. Vérifier que la table principale a bien une colonne "Ecart" (ou "Écart" ou "Montant")
2. Vérifier les logs console pour voir l'index détecté
3. Si l'index est -1, la colonne n'est pas détectée

### Problème 2: Trop de colonnes vides

**Cause possible:** Mauvais calcul du nombre de colonnes

**Solution:**
1. Vérifier les logs console:
   - Total colonnes table
   - Index colonne Ecart
   - Nombre de variables
2. Vérifier la formule: `emptyColumns = ecartIndex - variablesCount + 1`

### Problème 3: Les variables débordent

**Cause possible:** Pas assez de colonnes dans la table principale

**Solution:**
1. Ajouter des colonnes à la table principale
2. Ou réduire le nombre de variables dans le modèle

---

## 📊 Tableau récapitulatif des tests

| Nature de test | Variables | Colonnes table | Colonnes vides avant | Colonnes vides après | Statut |
|----------------|-----------|----------------|----------------------|----------------------|--------|
| Rapprochement  | 3         | 6              | 3                    | 0                    | ✅     |
| Mouvement      | 6         | 8              | 2                    | 0                    | ✅     |
| Validation     | 5         | 7              | 2                    | 0                    | ✅     |
| Estimation     | 5         | 7              | 2                    | 0                    | ✅     |
| Séparation     | 3         | 6              | 3                    | 0                    | ✅     |

---

## 🎨 Capture d'écran attendue

```
┌─────────────────────────────────────────────────────────────────┐
│ Table Schéma de calcul (fond jaune clair)                      │
├────────┬─────────┬──────────┬──────────┬───────┬───────────────┤
│        │         │          │   (A)    │  (B)  │ (C) = (A)-(B) │
├────────┴─────────┴──────────┴──────────┴───────┴───────────────┤
│ Table Cross référence (fond bleu clair)                        │
├────────┬─────────┬──────────┬──────────┬───────┬───────────────┤
│        │         │          │  [AA10]  │[AA20] │    [AA30]     │
├────────┴─────────┴──────────┴──────────┴───────┴───────────────┤
│ Table principale de test                                        │
├────────┬─────────┬──────────┬──────────┬───────┬───────────────┤
│ Compte │ Libellé │ Solde BG │ Solde PV │ Ecart │  Conclusion   │
├────────┼─────────┼──────────┼──────────┼───────┼───────────────┤
│ 571100 │ Caisse  │ 1500000  │ 1500000  │   0   │      OK       │
└────────┴─────────┴──────────┴──────────┴───────┴───────────────┘
         ↑         ↑          ↑          ↑       ↑
         └─────────┴──────────┴──────────┴───────┴─ Alignement parfait
```

---

## 📝 Notes importantes

1. **Position des tables:**
   - Schéma de calcul: AU-DESSUS de la table principale
   - Cross référence: AU-DESSUS de la table principale (donc entre schéma et table)
   - Table principale: EN BAS

2. **Ordre d'insertion:**
   - Si vous ajoutez d'abord le schéma, puis la cross ref, l'ordre sera:
     - Schéma
     - Cross ref
     - Table principale

3. **Couleurs:**
   - Schéma: Fond jaune clair (#fffbf0 et #fff9e6)
   - Cross ref: Fond bleu clair (#f0f9ff et #e0f2fe)
   - Table principale: Fond blanc

---

## 🚀 Commandes rapides

```javascript
// Dans la console du navigateur

// Afficher les en-têtes de la table active
const table = document.querySelector('table');
const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
console.log('En-têtes:', headers);

// Trouver l'index de la colonne Ecart
const ecartIndex = headers.findIndex(h => h.toLowerCase().includes('ecart'));
console.log('Index Ecart:', ecartIndex);

// Compter les colonnes
console.log('Nombre de colonnes:', headers.length);
```

---

## ✅ Checklist finale

Avant de valider les modifications:

- [ ] Tous les cas de test passent
- [ ] L'alignement est correct visuellement
- [ ] Les logs console sont clairs
- [ ] Pas d'erreur JavaScript
- [ ] Les cellules sont éditables
- [ ] La documentation est à jour
- [ ] Les modules standalone sont synchronisés

