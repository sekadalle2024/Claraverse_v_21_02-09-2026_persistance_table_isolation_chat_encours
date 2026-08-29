# 📊 Totalisation - Documentation

## Vue d'ensemble

La **Totalisation** est une fonctionnalité qui ajoute automatiquement une ligne de totalisation en bas des tables de test (tables modelisées). Elle détecte les colonnes numériques ou monétaires et calcule les totaux en temps réel.

## Principe de fonctionnement

### 1. Détection automatique des colonnes numériques

La totalisation analyse toutes les colonnes de la table et détecte automatiquement celles qui contiennent des valeurs numériques ou monétaires:

**Critères de détection:**
- Au moins 50% des cellules de la colonne contiennent des nombres
- Exclusion des colonnes non-numériques (Assertion, Conclusion, CTR, Description, etc.)
- Support des formats: `1234`, `1 234`, `1,234.56`, `1 234,56 €`

**Colonnes exclues automatiquement:**
- Assertion
- Conclusion
- CTR (CTR1, CTR2, etc.)
- Description
- Nature de test
- Compte
- Libellé
- Transaction
- No / N°

### 2. Calcul automatique des totaux

Pour chaque colonne numérique détectée:
- Somme de toutes les valeurs de la colonne
- Mise à jour automatique si les valeurs changent
- Format avec séparateurs de milliers (1 234,56)
- Arrondi à 2 décimales

### 3. Actualisation en temps réel

Un observateur (MutationObserver) surveille les changements dans la table:
- Modification d'une cellule → Recalcul automatique après 500ms
- Ajout/suppression de ligne → Recalcul automatique
- Édition manuelle → Recalcul automatique

## Utilisation dans le menu contextuel

### Actions disponibles

1. **📊 Ajouter Totalisation** (Ctrl+Shift+T)
   - Ajoute une ligne de totalisation en bas de la table
   - Détecte automatiquement les colonnes numériques
   - Calcule les totaux

2. **🔄 Actualiser Totalisation**
   - Recalcule tous les totaux
   - Utile si les données ont changé manuellement

3. **🗑️ Supprimer Totalisation**
   - Supprime la ligne de totalisation
   - Conserve les données dans localStorage

### Workflow typique

1. Clic droit sur la table principale (table de test)
2. Menu "Papier de travail" → "Ajouter Totalisation"
3. La ligne de totalisation apparaît en bas de la table
4. Les totaux se mettent à jour automatiquement quand vous modifiez les valeurs
5. Les modifications sont sauvegardées automatiquement

## Exemple visuel

### Avant totalisation

```
| Compte | Libellé      | Solde N-1 | Mouvement | Solde N | Écart | Conclusion |
|--------|--------------|-----------|-----------|---------|-------|------------|
| 411    | Clients      | 10 000    | 5 000     | 15 000  | 0     | OK         |
| 412    | Clients dout | 2 000     | -500      | 1 500   | 0     | OK         |
| 413    | Effets       | 3 000     | 1 000     | 4 000   | 0     | OK         |
```

### Après totalisation

```
| Compte | Libellé      | Solde N-1 | Mouvement | Solde N | Écart | Conclusion |
|--------|--------------|-----------|-----------|---------|-------|------------|
| 411    | Clients      | 10 000    | 5 000     | 15 000  | 0     | OK         |
| 412    | Clients dout | 2 000     | -500      | 1 500   | 0     | OK         |
| 413    | Effets       | 3 000     | 1 000     | 4 000   | 0     | OK         |
| **Totalisation** |    | **15 000,00** | **5 500,00** | **20 500,00** | **0,00** |  |
```

## Style visuel

### Couleurs

- **Fond de ligne:** Dégradé jaune clair (`#fff9e6` → `#fffbf0`)
- **Texte:** Noir foncé (`#1a1a1a`)
- **Label "Totalisation":** Rouge foncé (`#380101`)
- **Police:** Gras (700) pour les totaux, Extra-gras (800) pour le label

### Différence avec autres éléments

- **Schéma de calcul:** Fond jaune, une ligne, variables alphabétiques
- **Cross Référence:** Fond bleu, une ligne, références documentaires
- **Totalisation:** Fond jaune, une ligne, totaux numériques

## Sauvegarde et persistance

### localStorage

Les totalisations sont sauvegardées dans `localStorage` avec la clé:
```
claraverse_totalisation_data
```

### Format JSON

```json
{
  "table_abc123_1714000000000": {
    "timestamp": 1714000000000,
    "hasTotalisation": true
  }
}
```

### Restauration automatique

Au chargement de la page, les totalisations sont automatiquement restaurées si:
- La table principale existe dans le DOM
- Les données sont présentes dans localStorage
- La table a un `data-table-id`

## Formats numériques supportés

### Formats reconnus

1. **Nombres entiers:** `1234`, `5000`, `10000`
2. **Nombres décimaux (point):** `1234.56`, `5000.00`
3. **Nombres décimaux (virgule):** `1234,56`, `5000,00`
4. **Avec séparateurs de milliers (espace):** `1 234`, `10 000,00`
5. **Avec séparateurs de milliers (virgule):** `1,234.56`
6. **Avec symboles monétaires:** `1 234 €`, `$5,000.00`, `£10,000`

### Formats de sortie

Tous les totaux sont formatés en français:
- Séparateur de milliers: espace
- Séparateur décimal: virgule
- 2 décimales obligatoires
- Exemple: `1 234 567,89`

## Commandes de debug

Dans la console du navigateur:

```javascript
// Afficher toutes les totalisations sauvegardées
totalisationCommands.showStorage()

// Forcer le retraitement de toutes les tables
totalisationCommands.processAll()

// Restaurer toutes les totalisations
totalisationCommands.restoreAll()

// Effacer toutes les totalisations
totalisationCommands.clearStorage()
```

## Architecture technique

### Fichiers

- **Module:** `public/papier-travail-totalisation.js`
- **Intégration menu:** `public/menu.js` (méthodes ajouterTotalisation, etc.)
- **Chargement:** `index.html` (script tag)

### Classes CSS

- `.claraverse-totalisation-row` - Ligne de totalisation

### Attributs data

- `data-totalisation-row="true"` - Identifie la ligne de totalisation
- `data-totalisation-observer="true"` - Indique qu'un observateur est installé
- `data-total` - Valeur numérique du total (non formatée)
- `data-column-index` - Index de la colonne

## Cas d'usage

### 1. Test de validation (Solde N = Solde N-1 + Mouvement)

**Colonnes numériques détectées:**
- Solde N-1
- Mouvement
- Solde N
- Écart

**Totalisation:**
```
| Totalisation | 15 000,00 | 5 500,00 | 20 500,00 | 0,00 |
```

### 2. Test de mouvement (Solde N = Solde N-1 + Augmentation - Diminution)

**Colonnes numériques détectées:**
- Solde N-1
- Augmentation
- Diminution
- Solde N
- Écart

**Totalisation:**
```
| Totalisation | 100 000,00 | 25 000,00 | 10 000,00 | 115 000,00 | 0,00 |
```

### 3. Test de rapprochement (Écart = Source 1 - Source 2)

**Colonnes numériques détectées:**
- Source 1
- Source 2
- Écart

**Totalisation:**
```
| Totalisation | 50 000,00 | 49 500,00 | 500,00 |
```

## Bonnes pratiques

### 1. Vérifier les totaux

- Toujours vérifier que les totaux sont cohérents
- Comparer avec les totaux attendus (balance, lead, etc.)
- Utiliser les totaux pour valider l'exhaustivité

### 2. Actualiser si nécessaire

- Si vous modifiez manuellement plusieurs cellules rapidement
- Si vous collez des données depuis Excel
- Si les totaux semblent incorrects

### 3. Colonnes mixtes

- Si une colonne contient à la fois du texte et des nombres
- La totalisation ne sera ajoutée que si au moins 50% des cellules sont numériques
- Exemple: Colonne "Montant" avec quelques cellules "N/A"

### 4. Synchronisation avec autres fonctionnalités

- La totalisation fonctionne avec le Schéma de calcul
- La totalisation fonctionne avec la Cross référence horizontale
- Les trois peuvent coexister sur la même table

## Dépannage

### La totalisation n'apparaît pas

**Vérifications:**
1. La table est-elle une table modelisée? (Conclusion, Assertion, CTR, Ecart)
2. Y a-t-il au moins une colonne numérique?
3. Le module `papier-travail-totalisation.js` est-il chargé?

**Solution:** Vérifier dans la console les messages de debug `📊 [Totalisation]`

### Les totaux sont incorrects

**Causes possibles:**
- Format de nombre non reconnu
- Cellules contenant du texte mélangé avec des nombres
- Symboles monétaires non standard

**Solution:**
1. Vérifier le format des nombres dans les cellules
2. Utiliser "Actualiser Totalisation" pour recalculer
3. Vérifier dans la console les valeurs parsées

### Les totaux ne se mettent pas à jour

**Cause:** L'observateur n'est pas installé

**Solution:**
1. Utiliser "Actualiser Totalisation"
2. Recharger la page
3. Vérifier dans la console si l'observateur est installé

### La totalisation disparaît après actualisation

**Cause:** localStorage plein ou désactivé

**Solution:**
1. Vérifier l'espace disponible dans localStorage
2. Effacer les anciennes données avec `totalisationCommands.clearStorage()`
3. Vérifier que localStorage est activé dans le navigateur

## Évolutions futures

### Fonctionnalités potentielles

1. **Totaux partiels**
   - Totaliser uniquement certaines lignes sélectionnées
   - Totaux par groupe (par compte, par nature, etc.)

2. **Statistiques avancées**
   - Moyenne, médiane, écart-type
   - Min, max
   - Nombre de valeurs

3. **Formules personnalisées**
   - Permettre à l'utilisateur de définir des formules
   - Exemple: Total HT, TVA, Total TTC

4. **Export vers Excel**
   - Inclure la ligne de totalisation dans l'export
   - Format Excel natif avec formules

5. **Validation des totaux**
   - Comparer avec des totaux de référence
   - Alerter si écart significatif

## Intégration avec autres modules

### Avec Schéma de calcul

Le Schéma de calcul et la Totalisation peuvent coexister:
- Schéma de calcul: Au-dessus de la table (variables alphabétiques)
- Table principale: Au milieu (données de test)
- Totalisation: En bas de la table (totaux numériques)

### Avec Cross référence horizontale

La Cross référence et la Totalisation peuvent coexister:
- Cross référence: Au-dessus de la table (références documentaires)
- Table principale: Au milieu (données de test)
- Totalisation: En bas de la table (totaux numériques)

### Avec conso.js

La Totalisation utilise le même système de persistance que conso.js:
- Sauvegarde automatique dans localStorage
- Restauration au chargement de la page
- Synchronisation avec les modifications

## Conclusion

La Totalisation est une fonctionnalité essentielle pour les papiers de travail d'audit. Elle permet de:
- ✅ Valider l'exhaustivité des données
- ✅ Vérifier la cohérence des calculs
- ✅ Gagner du temps (calcul automatique)
- ✅ Réduire les erreurs (pas de calcul manuel)
- ✅ Améliorer la traçabilité (totaux sauvegardés)

**Raccourci clavier:** Ctrl+Shift+T pour ajouter rapidement une totalisation !
