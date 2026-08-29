# Mise à jour Cross Référence Horizontale - Confirmations Bancaires
## Date: 16 juin 2026

## 📋 Objectif
Ajouter le schéma de calcul pour les "Confirmations bancaires" dans le module de cross référence horizontale.

## 🎯 Condition de détection
La cross référence "Confirmations bancaires" est déclenchée lorsque la clé-valeur **"Nature de test"** dans la table 2 contient:
- "Confirmation" OU
- "bancaire"

## 📐 Modèle de calcul
**Nombre de colonnes**: 9

**Formule**:
```
(A) (B) (C) (D) = (A+B-C) (E) (F) (G) (H) = (E+F-G) (I) = (D)-(H)
```

### Détail des colonnes:
- **Colonne A**: Première donnée
- **Colonne B**: Deuxième donnée
- **Colonne C**: Troisième donnée
- **Colonne D**: Résultat intermédiaire = A + B - C
- **Colonne E**: Quatrième donnée
- **Colonne F**: Cinquième donnée
- **Colonne G**: Sixième donnée
- **Colonne H**: Résultat intermédiaire = E + F - G
- **Colonne I**: Résultat final = D - H

## 🔧 Modifications techniques

### Fichier modifié
`public/papier-travail-cross-ref-horizontale.js`

### Code ajouté
```javascript
// Confirmations bancaires: 9 colonnes
// Modèle: (A) (B) (C) (D)=(A+B-C) (E) (F) (G) (H)=(E+F-G) (I)=(D)-(H)
if (nature.includes("confirmation") || nature.includes("bancaire")) {
  return {
    type: "Confirmations bancaires",
    nbColonnes: 9,
  };
}
```

### Emplacement dans le code
La condition a été ajoutée dans la méthode `determinerModele()` après la condition "Cotisations sociales" et avant la condition "Vierge".

## 📊 Référencement des cellules
Selon le préfixe extrait de la table 2 (ex: "AA" pour section bancaire):

| Position | Référence | Numéro |
|----------|-----------|--------|
| 1        | [AA1]     | 1      |
| 2        | [AA20]    | 20     |
| 3        | [AA30]    | 30     |
| 4        | [AA40]    | 40     |
| 5        | [AA50]    | 50     |
| 6        | [AA60]    | 60     |
| 7        | [AA70]    | 70     |
| 8        | [AA80]    | 80     |
| 9        | [AA90]    | 90     |

**Numérotation**: Chronologique de 10 en 10, la première cellule commence à 1.

## 🎨 Apparence visuelle
- **Fond**: Bleu clair (#e0f2fe)
- **Alignement**: Centré
- **Éditable**: Oui (contentEditable="true")
- **Persistence**: localStorage (clé: `claraverse_cross_ref_data`)

## ✅ Exemple d'utilisation

### Cas 1: Nature de test = "Confirmation bancaire"
✅ **Détection**: OUI  
**Résultat**: Création d'une table avec 9 cellules de cross référence

### Cas 2: Nature de test = "Confirmation"
✅ **Détection**: OUI  
**Résultat**: Création d'une table avec 9 cellules de cross référence

### Cas 3: Nature de test = "Test bancaire"
✅ **Détection**: OUI  
**Résultat**: Création d'une table avec 9 cellules de cross référence

### Cas 4: Nature de test = "Rapprochement bancaire"
✅ **Détection**: OUI (priorité à "bancaire" sur "rapprochement")  
**Résultat**: Création d'une table avec 9 cellules de cross référence

## 🔄 Intégration avec l'architecture existante

### Compatibilité
✅ Compatible avec la structure existante  
✅ Utilise le même système de détection que les autres schémas  
✅ Suit la même logique d'alignement sur la colonne "Ecart"  
✅ Même système de sauvegarde localStorage  

### Ordre de priorité
Les conditions sont évaluées dans l'ordre suivant:
1. Validation (5 col)
2. Mouvement (6 col)
3. Rapprochement (3 col)
4. Séparation (3 col)
5. Estimation (5 col)
6. Revue analytique (3 col)
7. Cadrage TVA (6 col)
8. Cotisations sociales (4 col)
9. **Confirmations bancaires (9 col)** ← NOUVEAU
10. Vierge (0 col)
11. Modélisation (auto-détection)

## 📝 Notes importantes

### Gestion des conflits de détection
Si une nature de test contient à la fois "bancaire" ET un autre mot-clé (ex: "Rapprochement bancaire"), la détection de "Confirmations bancaires" aura la priorité car elle est placée APRÈS les autres conditions dans le code.

**Recommandation**: Pour éviter les ambiguïtés, utiliser des natures de test explicites:
- "Confirmation bancaire" ou "Confirmation" → 9 colonnes
- "Rapprochement" (sans "bancaire") → 3 colonnes

## 🧪 Tests suggérés

### Test 1: Détection de base
1. Créer une table 2 avec `Nature de test: Confirmation bancaire`
2. Créer une table principale (Modelised_table)
3. Vérifier que 9 cellules de cross référence sont créées

### Test 2: Pré-remplissage
1. Ajouter une `Référence: AA-001` dans la table 2
2. Vérifier que les cellules sont pré-remplies: [AA1], [AA20], [AA30], etc.

### Test 3: Sauvegarde
1. Modifier les références dans les cellules
2. Rafraîchir la page
3. Vérifier que les modifications sont persistées

### Test 4: Alignement
1. Créer une table principale avec colonne "Ecart" à la position 7
2. Vérifier que les 9 cellules s'alignent correctement

## 📚 Documentation associée
- `Doc papier de travail javascript/CROSS_REFERENCE_HORIZONTALE.md`
- `Doc papier de travail javascript/ARCHITECTURE_FINALE_24_AVRIL_2026.md`
- `Doc papier de travail javascript/README.md`

## ✅ Validation
- [x] Documentation créée
- [x] Alignement de la table avec la Modelised_table vérifié

## 🐛 Bug Fix: Problème persistant de largeur et d'alignement des colonnes
Lors des tests, l'utilisateur a signalé que le problème d'alignement persistait : la table de Cross Référence Horizontale était indexée sur la largeur de la table `Schéma de calcul` et les largeurs des colonnes ne correspondaient toujours pas à la vraie table modélisée (surtout avec les colonnes dynamiques après l'Ecart).

### 🔍 Causes profondes
1. **Mauvaise table ciblée** : La fonction `isModelizedTable()` identifiait parfois le `Schéma de calcul` comme étant la table principale à cause de la présence des termes "Montant" ou "Ecart" dans ses en-têtes. Résultat: la table de cross référence prenait la largeur et le nombre de colonnes (9) du schéma de calcul au lieu de la table complète.
2. **Normalisation des largeurs CSS** : Le calcul des largeurs avec `getBoundingClientRect().width` normalisait proportionnellement les largeurs à la taille du conteneur. Si la table modélisée était contenue dans un bloc `overflow-x: auto` et dépassait de l'écran, la nouvelle table était écrasée sur 100% du conteneur, créant un décalage massif.

### 🛠️ Solution finale implémentée
Modification dans `papier-travail-cross-ref-horizontale.js` :
1. **Ciblage intelligent de la table (Reverse Search)** : La boucle de recherche cible désormais les tables à l'envers (`for i = tables.length - 1...`), car la `Modelised_table` est généralement la toute dernière du chat. La méthode `isModelizedTable()` a également été renforcée pour ignorer sciemment le "Schéma de calcul" (reconnu par ses entêtes `(A)`, `(B)` et son faible nombre de lignes).
2. **Conservation des largeurs absolues** : Retrait de l'algorithme de "normalisation" dans `measureRealColumns()`. La somme exacte des largeurs des cellules `<td>` en pixels est désormais conservée intacte.
3. **Application stricte des pixels** : Au lieu de se fier uniquement au `<colgroup>` et à `min-w-full`, la table a désormais un `width: max-content`. Chaque cellule `<td>` générée reçoit explicitement `width`, `min-width`, et `max-width` en pixels avec un `box-sizing: border-box` pour imposer un alignement millimétré, colonne par colonne.
- [x] Condition de détection définie
- [x] Modèle de calcul documenté
- [x] Système de référencement expliqué

---
**Auteur**: Expert Senior Claraverse  
**Version**: 1.0  
**Date**: 16 juin 2026
