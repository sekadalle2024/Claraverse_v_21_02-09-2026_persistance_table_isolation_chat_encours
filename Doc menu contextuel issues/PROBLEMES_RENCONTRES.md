# Problèmes Rencontrés - Menu Contextuel

## Session du 2 Avril 2026 - Intégration Évaluation des Risques

### Contexte

Intégration de 22 nouvelles méthodes pour gérer 6 types de matrices de criticité dans le menu contextuel.

---

## Problème #1: Erreurs Répétées avec `strReplace`

### Description

Lors de l'utilisation de l'outil `strReplace` pour insérer les 22 méthodes dans `public/menu.js`, l'outil échouait systématiquement sans fournir de résultat.

### Symptômes

```
Replaced text in public/menu.js
```

Mais aucun changement n'était effectué dans le fichier.

### Cause Racine

**Paramètre manquant**: Le paramètre `newStr` n'était pas fourni dans les appels `strReplace`.

```javascript
// ❌ INCORRECT - newStr manquant
<invoke name="strReplace">
<parameter name="oldStr">...</parameter>
<parameter name="path">public/menu.js</parameter>
</invoke>

// ✅ CORRECT - newStr fourni
<invoke name="strReplace">
<parameter name="oldStr">...</parameter>
<parameter name="newStr">...</parameter>
<parameter name="path">public/menu.js</parameter>
</invoke>
```

### Impact

- Temps perdu: ~25 minutes
- Tentatives infructueuses: 8+
- Frustration utilisateur élevée

### Leçon Apprise

Toujours vérifier que TOUS les paramètres requis sont fournis avant d'invoquer un outil.

---

## Problème #2: Recherche de Marqueur avec Accents

### Description

Le script PowerShell ne trouvait pas le point d'insertion car le marqueur contenait un caractère accentué.

### Symptômes

```powershell
Point d'insertion non trouve!
Exit Code: 1
```

### Cause Racine

Recherche exacte du texte `"// === CALCULS ARITHMÉTIQUES ==="` alors que le script cherchait `"// === CALCULS ARITHMETIQUES ==="` (sans accent).

### Solution

Utiliser une recherche partielle sans les caractères accentués:

```powershell
# ❌ INCORRECT
$insertionMarker = "// === CALCULS ARITHMÉTIQUES ==="

# ✅ CORRECT
$insertionMarker = "// === CALCULS ARITHM"
```

### Impact

- Temps perdu: ~3 minutes
- Tentatives: 2

---

## Problème #3: Encodage des Emojis dans PowerShell

### Description

Les emojis dans les scripts PowerShell causaient des erreurs de parsing.

### Symptômes

```powershell
Le terminateur ' est manquant dans la chaîne.
ParserError
```

### Cause Racine

Problème d'encodage UTF-8 avec les emojis dans les chaînes PowerShell.

### Solution

Remplacer les emojis par du texte simple:

```powershell
# ❌ INCORRECT
Write-Host "🔄 Insertion des méthodes..." -ForegroundColor Cyan

# ✅ CORRECT
Write-Host "Insertion des methodes..." -ForegroundColor Cyan
```

### Impact

- Temps perdu: ~2 minutes
- Tentatives: 1

---

## Problème #4: Extraction Incomplète du Contenu

### Description

La première version du script extrayait le contenu du fichier d'extension mais sans les déclarations de méthodes.

### Symptômes

Le fichier `menu.js` contenait:

```javascript
// === EVALUATION DES RISQUES - MATRICES ===

return {
  'Faible': { 'Faible': 'Faible', ... }
};
```

Au lieu de:

```javascript
// === EVALUATION DES RISQUES - MATRICES ===

getMatrixAlpha3() {
  return {
    'Faible': { 'Faible': 'Faible', ... }
  };
}
```

### Cause Racine

Le script extrayait les lignes en utilisant des index fixes qui ne capturaient pas les déclarations de méthodes.

### Solution

Utiliser une plage de lignes plus large:

```powershell
# ❌ INCORRECT
$methodLines = $lines[11..($lines.Length - 5)]

# ✅ CORRECT
$methodLines = $lines[10..848]
```

### Impact

- Temps perdu: ~5 minutes
- Nécessité de restaurer le backup

---

## Problème #5: Approche Initiale Inefficace

### Description

Tentative d'utiliser `strReplace` de manière répétée au lieu d'adopter une approche script dès le début.

### Symptômes

- Multiples tentatives infructueuses
- Erreurs répétées
- Perte de temps

### Cause Racine

Manque d'adaptation rapide face aux échecs répétés de `strReplace`.

### Solution Appliquée

Passer à une approche script PowerShell après 3-4 échecs au lieu de persister avec `strReplace`.

### Impact

- Temps perdu: ~15 minutes
- Frustration utilisateur

### Leçon Apprise

**Règle des 3 échecs**: Si un outil échoue 3 fois de suite, changer d'approche immédiatement.

---

## Résumé des Problèmes

| # | Problème | Temps Perdu | Gravité | Solution |
|---|----------|-------------|---------|----------|
| 1 | strReplace sans newStr | 25 min | Haute | Script PowerShell |
| 2 | Marqueur avec accent | 3 min | Moyenne | Recherche partielle |
| 3 | Encodage emojis | 2 min | Faible | Texte simple |
| 4 | Extraction incomplète | 5 min | Moyenne | Plage lignes correcte |
| 5 | Approche inefficace | 15 min | Haute | Changement stratégie |

**Temps total perdu**: ~50 minutes  
**Temps effectif travail**: ~30 minutes  
**Efficacité**: 60%

---

## Recommandations pour Éviter ces Problèmes

1. **Vérifier les paramètres requis** avant d'invoquer un outil
2. **Utiliser des scripts PowerShell** pour les insertions de code volumineuses
3. **Éviter les caractères spéciaux** (emojis, accents) dans les scripts
4. **Tester l'extraction** avant l'insertion complète
5. **Changer d'approche rapidement** après 3 échecs consécutifs
6. **Créer des backups** avant toute modification
7. **Documenter les problèmes** pour référence future
