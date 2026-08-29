# Guide de Mise à Jour - Menu Contextuel

## Vue d'Ensemble

Ce guide détaille la procédure complète pour ajouter de nouvelles fonctionnalités au menu contextuel ClaraVerse.

## Prérequis

- PowerShell 5.1 ou supérieur
- Éditeur de code (VS Code recommandé)
- Navigateur moderne (Chrome/Edge/Firefox)
- Git (pour versioning)

---

## Étape 1: Planification (15 min)

### 1.1 Définir la Fonctionnalité

Répondre aux questions:
- Quel est l'objectif?
- Quelles méthodes sont nécessaires?
- Où s'intègre-t-elle dans le menu?
- Quels sont les cas d'usage?

### 1.2 Créer un Document de Spécification

```markdown
# Spécification: [Nom Fonctionnalité]

## Objectif
[Description]

## Méthodes à Ajouter
1. `methode1()` - [Description]
2. `methode2()` - [Description]

## Intégration Menu
- Section: [Nom section]
- Position: [Après quelle section]
- Icône: [Emoji]

## Cas d'Usage
1. [Cas 1]
2. [Cas 2]

## Tests Requis
- [ ] Test unitaire méthode 1
- [ ] Test unitaire méthode 2
- [ ] Test intégration
```

---

## Étape 2: Développement (30-60 min)

### 2.1 Créer le Fichier d'Extension

```bash
# Créer le fichier
New-Item -Path "public/menu_[nom]_extension.js" -ItemType File
```

**Template**:

```javascript
// Extension pour [Nom Fonctionnalité] - Menu contextuel ClaraVerse
// À intégrer dans menu.js dans la classe ContextualMenuManager

// ============================================================================
// [NOM SECTION]
// ============================================================================

/**
 * [Description méthode 1]
 */
methode1() {
  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.");
    return;
  }
  
  try {
    // Logique
    console.log("🔄 Exécution méthode1...");
    
    // Traitement
    const result = this.processData();
    
    // Notification
    this.showQuickNotification(`✅ Succès: ${result}`);
    this.notifyTableStructureChange("methode1_executed", { result });
    this.syncWithDev();
    
  } catch (error) {
    console.error("❌ Erreur méthode1:", error);
    this.showAlert(`❌ Erreur: ${error.message}`);
  }
}

/**
 * [Description méthode 2]
 */
methode2() {
  // Implémentation
}

// ============================================================================
// FIN DU FICHIER D'EXTENSION
// ============================================================================
```

### 2.2 Créer la Page de Test

```bash
# Créer le fichier
New-Item -Path "test-[nom].html" -ItemType File
```

**Template**:

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Test [Nom Fonctionnalité]</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background: #f0f0f0; }
        .test-section { margin: 30px 0; padding: 20px; border: 1px solid #ccc; }
    </style>
    <script src="public/menu.js"></script>
</head>
<body>
    <h1>Test [Nom Fonctionnalité]</h1>
    
    <div class="test-section">
        <h2>Scénario 1: [Description]</h2>
        <table id="test1">
            <tr>
                <th>Colonne 1</th>
                <th>Colonne 2</th>
            </tr>
            <tr>
                <td>Valeur 1</td>
                <td>Valeur 2</td>
            </tr>
        </table>
        <p><strong>Test</strong>: Clic droit → [Nom Section] → [Action]</p>
        <p><strong>Résultat attendu</strong>: [Description]</p>
    </div>
    
    <div class="test-section">
        <h2>Scénario 2: [Description]</h2>
        <!-- Autre table de test -->
    </div>
    
    <script>
        // Initialiser le menu
        const menuManager = new ContextualMenuManager();
        menuManager.init();
        
        // Tests automatiques (optionnel)
        console.log("✅ Menu initialisé");
    </script>
</body>
</html>
```

---

## Étape 3: Intégration (10-15 min)

### 3.1 Créer le Script d'Insertion

```bash
# Copier le template
Copy-Item "Doc menu contextuel issues/Scripts/template-insertion.ps1" "insert-[nom].ps1"
```

**Personnaliser le script**:

```powershell
# Configuration
$sourceFile = "public/menu_[nom]_extension.js"
$targetFile = "public/menu.js"
$startLine = 10  # Première ligne à copier
$endLine = 100   # Dernière ligne à copier
$insertionMarker = "// === CALCULS ARITHM"  # Marqueur d'insertion

# Exécuter l'insertion
# ... (voir template)
```

### 3.2 Exécuter l'Insertion

```powershell
# Créer un backup
Copy-Item "public/menu.js" "public/menu.js.backup" -Force

# Exécuter le script
.\insert-[nom].ps1

# Vérifier le résultat
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Insertion réussie"
} else {
    Write-Host "❌ Erreur - Restauration du backup"
    Copy-Item "public/menu.js.backup" "public/menu.js" -Force
}
```

### 3.3 Mettre à Jour le Menu

Ajouter la section dans `getMenuSections()`:

```javascript
{
  id: "[nom-section]",
  title: "[Titre Section]",
  icon: "🎯",
  items: [
    { text: "Action 1", action: () => this.methode1(), shortcut: "Ctrl+X" },
    { text: "Action 2", action: () => this.methode2() }
  ]
}
```

---

## Étape 4: Tests (15-30 min)

### 4.1 Tests Manuels

1. Ouvrir `test-[nom].html` dans le navigateur
2. Ouvrir la console (F12)
3. Pour chaque scénario:
   - Clic droit sur la table
   - Sélectionner l'action
   - Vérifier le résultat
   - Vérifier les logs console

### 4.2 Tests Automatisés (Optionnel)

```javascript
// Dans test-[nom].html
function runTests() {
  const menu = window.contextualMenuManager;
  
  // Test 1
  console.log("Test 1: methode1()");
  try {
    menu.methode1();
    console.log("✅ Test 1 passé");
  } catch (error) {
    console.error("❌ Test 1 échoué:", error);
  }
  
  // Test 2
  console.log("Test 2: methode2()");
  try {
    menu.methode2();
    console.log("✅ Test 2 passé");
  } catch (error) {
    console.error("❌ Test 2 échoué:", error);
  }
}

// Exécuter après initialisation
setTimeout(runTests, 1000);
```

### 4.3 Vérification Post-Insertion

```powershell
# Script de vérification
.\Doc menu contextuel issues\Scripts\verify-integration.ps1 -MethodNames "methode1","methode2"
```

---

## Étape 5: Documentation (15-20 min)

### 5.1 Créer le Fichier de Synthèse

```markdown
# Ajout [Nom Fonctionnalité] - [Date]

## Résumé

[Description courte]

## Méthodes Ajoutées

1. `methode1()` (ligne X) - [Description]
2. `methode2()` (ligne Y) - [Description]

## Modifications Menu

- Nouvelle section "[Titre Section]"
- X nouvelles options
- Raccourcis: Ctrl+X

## Tests Effectués

- ✅ Test unitaire méthode 1
- ✅ Test unitaire méthode 2
- ✅ Test intégration
- ✅ Test raccourcis clavier
- ✅ Test cas limites

## Fichiers Créés/Modifiés

- `public/menu.js` (+X lignes)
- `public/menu_[nom]_extension.js` (nouveau, X lignes)
- `test-[nom].html` (nouveau)
- `insert-[nom].ps1` (nouveau)
- `SYNTHESE_[NOM]_[DATE].md` (ce fichier)

## Performance

- Temps d'exécution: < Xms
- Impact mémoire: Négligeable
- Compatibilité: Tous navigateurs modernes

## Problèmes Rencontrés

[Si applicable]

## Notes

[Remarques additionnelles]
```

### 5.2 Mettre à Jour le Changelog

```markdown
# Changelog - menu.js

## Version 9.X - [Date]
- Ajout: [Nom Fonctionnalité]
- Ajout: X nouvelles méthodes
- Modification: [Si applicable]
- Correction: [Si applicable]
```

---

## Étape 6: Versioning (5 min)

### 6.1 Commit Git

```bash
# Ajouter les fichiers
git add public/menu.js
git add public/menu_[nom]_extension.js
git add test-[nom].html
git add insert-[nom].ps1
git add SYNTHESE_[NOM]_[DATE].md

# Commit
git commit -m "feat: Ajout [Nom Fonctionnalité]

- Ajout X nouvelles méthodes
- Nouvelle section menu
- Tests inclus
"

# Push
git push origin main
```

---

## Checklist Complète

### Planification
- [ ] Spécification rédigée
- [ ] Objectifs clairs
- [ ] Cas d'usage définis

### Développement
- [ ] Fichier d'extension créé
- [ ] Méthodes implémentées
- [ ] Gestion d'erreurs ajoutée
- [ ] Commentaires JSDoc ajoutés
- [ ] Page de test créée

### Intégration
- [ ] Script d'insertion créé
- [ ] Backup créé
- [ ] Insertion effectuée
- [ ] Menu mis à jour
- [ ] Vérification post-insertion

### Tests
- [ ] Tests manuels passés
- [ ] Tests automatisés (si applicable)
- [ ] Cas limites testés
- [ ] Performance vérifiée

### Documentation
- [ ] Synthèse créée
- [ ] Changelog mis à jour
- [ ] README mis à jour (si nécessaire)
- [ ] Commentaires code à jour

### Versioning
- [ ] Fichiers ajoutés à Git
- [ ] Commit effectué
- [ ] Push effectué

---

## Temps Estimés

| Étape | Temps Min | Temps Max |
|-------|-----------|-----------|
| Planification | 10 min | 20 min |
| Développement | 30 min | 90 min |
| Intégration | 10 min | 20 min |
| Tests | 15 min | 45 min |
| Documentation | 15 min | 30 min |
| Versioning | 5 min | 10 min |
| **TOTAL** | **85 min** | **215 min** |

---

## Ressources

- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Bonnes pratiques: [BONNES_PRATIQUES.md](BONNES_PRATIQUES.md)
- Erreurs à éviter: [ERREURS_A_EVITER.md](ERREURS_A_EVITER.md)
- Scripts: `Doc menu contextuel issues/Scripts/`
