# Bonnes Pratiques - Menu Contextuel

## 1. Préparation Avant Modification

### ✅ Créer un Fichier d'Extension Séparé

**Pourquoi**: Facilite le développement, les tests et l'intégration.

```javascript
// public/menu_nouvelle_feature_extension.js

// Extension pour [Nom de la fonctionnalité]
// À intégrer dans menu.js dans la classe ContextualMenuManager

// === SECTION NOUVELLE FONCTIONNALITÉ ===

nouvelleMethode1() {
  // Implémentation
}

nouvelleMethode2() {
  // Implémentation
}

// === FIN DU FICHIER D'EXTENSION ===
```

### ✅ Créer une Page de Test

**Pourquoi**: Permet de tester la fonctionnalité isolément.

```html
<!-- test-nouvelle-feature.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Test Nouvelle Fonctionnalité</title>
    <script src="menu.js"></script>
</head>
<body>
    <h1>Test Nouvelle Fonctionnalité</h1>
    
    <table id="test-table">
        <tr>
            <th>Colonne 1</th>
            <th>Colonne 2</th>
        </tr>
        <tr>
            <td>Valeur 1</td>
            <td>Valeur 2</td>
        </tr>
    </table>
    
    <script>
        // Initialiser le menu
        const menuManager = new ContextualMenuManager();
        menuManager.init();
    </script>
</body>
</html>
```

### ✅ Documenter la Fonctionnalité

Créer un fichier README pour la nouvelle fonctionnalité:

```markdown
# Nouvelle Fonctionnalité

## Description
[Description détaillée]

## Méthodes Ajoutées
- `nouvelleMethode1()` - [Description]
- `nouvelleMethode2()` - [Description]

## Utilisation
[Exemples d'utilisation]

## Tests
[Procédure de test]
```

---

## 2. Développement

### ✅ Respecter les Conventions de Nommage

```javascript
// ✅ CORRECT
getMatrixAlpha3()        // Getter
convertToMatrixNum5()    // Action
normalizeToAlpha4()      // Transformation
executeRiskEvaluation()  // Exécution

// ❌ INCORRECT
get_matrix()             // Snake case
ConvertMatrix()          // PascalCase
NORMALIZE()              // Majuscules
```

### ✅ Ajouter des Commentaires JSDoc

```javascript
/**
 * Convertit la matrice actuelle vers Matrice Alphabétique 3 niveaux
 * 
 * Détecte automatiquement les colonnes Probabilité, Impact et Criticité,
 * normalise les valeurs et applique les couleurs appropriées.
 * 
 * @returns {void}
 * @fires tableStructureChanged
 */
convertToMatrixAlpha3() {
  // Implémentation
}
```

### ✅ Gérer les Erreurs

```javascript
nouvelleMethode() {
  // Validation
  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.");
    return;
  }
  
  try {
    // Logique principale
    const result = this.processData();
    
    // Notification succès
    this.showQuickNotification(`✅ Opération réussie: ${result}`);
    
  } catch (error) {
    // Gestion erreur
    console.error("Erreur:", error);
    this.showAlert(`❌ Erreur: ${error.message}`);
  }
}
```

### ✅ Utiliser les Méthodes Utilitaires Existantes

```javascript
// ✅ CORRECT - Utiliser les utilitaires
const value = this.parseMonetaryValue(cell.textContent);
const formatted = this.formatMonetary(value);
this.showQuickNotification("✅ Succès");

// ❌ INCORRECT - Réinventer la roue
const value = parseFloat(cell.textContent.replace(/[^\d.-]/g, ''));
const formatted = value.toFixed(2);
alert("Succès");
```

---

## 3. Intégration

### ✅ Utiliser un Script PowerShell

**Pourquoi**: Fiable, reproductible, automatisable.

```powershell
# Créer un script d'insertion dédié
.\insert-nouvelle-feature.ps1
```

### ✅ Créer un Backup Automatique

```powershell
# Toujours créer un backup avant modification
$backupFile = "public/menu.js.backup"
Copy-Item "public/menu.js" $backupFile -Force
```

### ✅ Vérifier l'Insertion

```powershell
# Vérifier que les méthodes sont présentes
$content = Get-Content "public/menu.js" -Raw

if ($content -match "nouvelleMethode1") {
    Write-Host "✅ Insertion réussie"
} else {
    Write-Host "❌ Erreur d'insertion"
    # Restaurer le backup
    Copy-Item $backupFile "public/menu.js" -Force
}
```

---

## 4. Tests

### ✅ Tester Chaque Méthode Individuellement

```javascript
// Dans la console du navigateur
const menu = window.contextualMenuManager;

// Tester une méthode
menu.nouvelleMethode1();

// Vérifier le résultat
console.log("Résultat:", menu.targetTable);
```

### ✅ Tester les Cas Limites

```javascript
// Test avec table vide
// Test avec table très grande (1000+ lignes)
// Test avec valeurs nulles/undefined
// Test avec caractères spéciaux
// Test avec différents formats de données
```

### ✅ Tester les Raccourcis Clavier

```javascript
// Simuler Ctrl+N
const event = new KeyboardEvent('keydown', {
  key: 'n',
  ctrlKey: true
});
document.dispatchEvent(event);
```

---

## 5. Documentation

### ✅ Mettre à Jour le Menu

Ajouter la nouvelle section dans `getMenuSections()`:

```javascript
{
  id: "nouvelle-section",
  title: "Nouvelle Section",
  icon: "🎯",
  items: [
    { text: "Action 1", action: () => this.nouvelleMethode1(), shortcut: "Ctrl+N" },
    { text: "Action 2", action: () => this.nouvelleMethode2() }
  ]
}
```

### ✅ Documenter les Changements

Créer un fichier de synthèse:

```markdown
# Ajout Nouvelle Fonctionnalité - [Date]

## Méthodes Ajoutées
- `nouvelleMethode1()` (ligne X)
- `nouvelleMethode2()` (ligne Y)

## Modifications Menu
- Nouvelle section "Nouvelle Section"
- 2 nouvelles options

## Tests Effectués
- ✅ Test unitaire méthode 1
- ✅ Test unitaire méthode 2
- ✅ Test intégration
- ✅ Test raccourcis clavier

## Fichiers Modifiés
- `public/menu.js` (+150 lignes)
- `public/menu_nouvelle_feature_extension.js` (nouveau)
- `test-nouvelle-feature.html` (nouveau)
```

---

## 6. Performance

### ✅ Optimiser les Boucles

```javascript
// ✅ CORRECT - Cache la longueur
const rows = table.querySelectorAll('tr');
const rowCount = rows.length;
for (let i = 0; i < rowCount; i++) {
  // Traitement
}

// ❌ INCORRECT - Recalcule à chaque itération
for (let i = 0; i < table.querySelectorAll('tr').length; i++) {
  // Traitement
}
```

### ✅ Utiliser le Cache

```javascript
// Utiliser le WeakMap existant
if (this.tableCache.has(table)) {
  return this.tableCache.get(table);
}

const result = this.calculateExpensiveOperation(table);
this.tableCache.set(table, result);
return result;
```

### ✅ Debouncing pour Événements Fréquents

```javascript
// Pour les événements hover, scroll, etc.
let timeout;
element.addEventListener('mousemove', (e) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    this.handleMouseMove(e);
  }, 100);
});
```

---

## 7. Sécurité

### ✅ Valider les Entrées

```javascript
nouvelleMethode(input) {
  // Validation du type
  if (typeof input !== 'string') {
    throw new TypeError('Input doit être une chaîne');
  }
  
  // Validation du format
  if (!/^[a-zA-Z0-9]+$/.test(input)) {
    throw new Error('Input contient des caractères invalides');
  }
  
  // Validation de la longueur
  if (input.length > 100) {
    throw new Error('Input trop long (max 100 caractères)');
  }
}
```

### ✅ Sanitizer les Données

```javascript
// Nettoyer les données avant insertion dans le DOM
const sanitized = input
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;');
```

---

## 8. Maintenance

### ✅ Versionner les Changements

```javascript
// En-tête du fichier
// Menu contextuel (Core) pour les tables ClaraVerse
// Version 9.4 - Ajout Nouvelle Fonctionnalité
// Date: [Date]
```

### ✅ Garder un Changelog

```markdown
# Changelog - menu.js

## Version 9.4 - [Date]
- Ajout: Nouvelle fonctionnalité X
- Ajout: 2 nouvelles méthodes
- Modification: Optimisation performance

## Version 9.3 - 2 Avril 2026
- Ajout: 22 méthodes évaluation des risques
- Ajout: 6 types de matrices de criticité
```

### ✅ Nettoyer le Code Obsolète

```javascript
// Marquer le code obsolète
/**
 * @deprecated Utiliser nouvelleMethode() à la place
 */
ancienneMethode() {
  console.warn('ancienneMethode() est obsolète');
  return this.nouvelleMethode();
}
```

---

## Checklist Complète

Avant de considérer une modification comme terminée:

- [ ] Fichier d'extension créé
- [ ] Page de test créée
- [ ] Documentation rédigée
- [ ] Script d'insertion créé
- [ ] Backup créé
- [ ] Insertion effectuée
- [ ] Vérification post-insertion
- [ ] Tests unitaires passés
- [ ] Tests intégration passés
- [ ] Performance vérifiée
- [ ] Sécurité vérifiée
- [ ] Documentation mise à jour
- [ ] Changelog mis à jour
- [ ] Commit Git effectué

---

## Ressources Utiles

- Architecture: `Doc menu contextuel issues/ARCHITECTURE.md`
- Problèmes: `Doc menu contextuel issues/PROBLEMES_RENCONTRES.md`
- Solutions: `Doc menu contextuel issues/SOLUTIONS_APPLIQUEES.md`
- Scripts: `Doc menu contextuel issues/Scripts/`
