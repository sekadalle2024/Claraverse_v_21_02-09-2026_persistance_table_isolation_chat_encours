# 📐 Guide d'intégration - Schéma de Calcul

## Vue d'ensemble

Ce guide explique comment intégrer le système de schéma de calcul dans votre application. L'intégration est simple et ne nécessite que l'inclusion des scripts JavaScript dans le HTML.

## Prérequis

- Application web avec support JavaScript
- Accès au dossier `public/`
- (Optionnel) Menu contextuel existant dans `public/menu.js`

## Étapes d'intégration

### 1. Vérifier les fichiers

Les fichiers suivants doivent être présents dans `public/`:

```
public/
├── papier-travail-schema-calcul.js       ✅ Module principal
├── menu-papier-travail-integration.js    ✅ Intégration menu
└── menu-papier-travail-extension.js      ✅ Extensions futures
```

### 2. Inclusion automatique

Le module `papier-travail-schema-calcul.js` se charge automatiquement au démarrage de l'application. Aucune configuration supplémentaire n'est nécessaire.

**Vérification**:
```javascript
// Dans la console du navigateur
console.log(window.SchemaCalculManager);
// Devrait afficher l'objet SchemaCalculManager
```

### 3. Intégration dans le menu contextuel (optionnel)

Si vous souhaitez ajouter des actions manuelles via le menu contextuel:

#### A. Ouvrir `public/menu.js`

#### B. Localiser la section "papier-travail"

Rechercher autour de la ligne 189:

```javascript
{
  id: "papier-travail", 
  title: "Papier de travail", 
  icon: "📁",
  items: [
    // ... items existants
  ]
}
```

#### C. Ajouter les nouvelles actions

Remplacer la section par:

```javascript
{
  id: "papier-travail", 
  title: "Papier de travail", 
  icon: "📁",
  items: [
    { 
      text: "📐 Ajouter Schéma de calcul", 
      action: () => this.ajouterSchemaCalcul(), 
      shortcut: "Ctrl+Shift+S" 
    },
    { 
      text: "📐 Régénérer Schéma de calcul", 
      action: () => this.regenererSchemaCalcul() 
    },
    { 
      text: "🗑️ Supprimer Schéma de calcul", 
      action: () => this.supprimerSchemaCalcul() 
    },
    { text: "─────────────────────", action: null },
    // ... autres items existants (X-Ref, etc.)
  ]
}
```

#### D. Ajouter les méthodes dans ContextualMenuManager

Copier le contenu de `public/menu-papier-travail-integration.js` et l'ajouter dans la classe `ContextualMenuManager` avant la méthode `cleanup()`.

Les méthodes à ajouter:
- `ajouterSchemaCalcul()`
- `regenererSchemaCalcul()`
- `supprimerSchemaCalcul()`
- `extractNatureDeTest(table)`
- `isModelizedTable(table)`
- `createSchemaCalculTable(...)`
- `determinerModeleSchemaCalcul(natureDeTest)`
- Et les méthodes utilitaires

#### E. Ajouter le raccourci clavier

Dans la méthode `attachEventListeners()`, ajouter:

```javascript
// Raccourci Schéma de calcul Ctrl+Shift+S
if (e.ctrlKey && e.shiftKey && e.key === "S" && this.targetTable) { 
  e.preventDefault(); 
  this.ajouterSchemaCalcul(); 
}
```

### 4. Test de l'intégration

#### A. Test automatique

1. Ouvrir l'application
2. Créer un papier de travail via n8n avec une "Nature de test"
3. Vérifier que le schéma apparaît automatiquement au-dessus de la table principale

#### B. Test manuel (si menu intégré)

1. Clic droit sur une table modelisée
2. Menu "Papier de travail" → "📐 Ajouter Schéma de calcul"
3. Vérifier que le schéma est créé

#### C. Test du raccourci clavier

1. Cliquer sur une cellule d'une table modelisée
2. Appuyer sur `Ctrl+Shift+S`
3. Vérifier que le schéma est créé

#### D. Test de la persistance

1. Créer un schéma
2. Modifier une cellule du schéma
3. Recharger la page
4. Vérifier que les modifications sont conservées

### 5. Vérification de la console

Ouvrir la console du navigateur et vérifier les messages:

```
📐 [Schéma Calcul] Module chargé
📐 [Schéma] Initialisation du gestionnaire de schémas de calcul
✅ [Schéma] localStorage fonctionne correctement
📦 [Schéma] X schéma(s) trouvé(s) dans le stockage
✅ [Schéma] Gestionnaire initialisé avec succès
```

## Configuration avancée

### Modifier le délai de sauvegarde

Dans `papier-travail-schema-calcul.js`:

```javascript
const CONFIG = {
  storageKey: "claraverse_schema_calcul_data",
  autoSaveDelay: 500, // Modifier ici (en ms)
  debugMode: true,
};
```

### Activer/désactiver le mode debug

```javascript
const CONFIG = {
  // ...
  debugMode: false, // Désactiver les logs
};
```

### Ajouter un nouveau modèle de schéma

Dans la méthode `determinerModele()`:

```javascript
// Nouveau type de test
if (nature.includes("mon_nouveau_type")) {
  return {
    type: "Mon Nouveau Type",
    colonnes: ["(A)", "(B)", "(C) = formule personnalisée"],
  };
}
```

## Dépannage

### Le schéma ne s'affiche pas automatiquement

**Vérifications**:
1. Le module est-il chargé ? → `console.log(window.SchemaCalculManager)`
2. La table contient-elle une "Nature de test" ? → Vérifier la table 2
3. La table principale est-elle modelisée ? → Doit avoir colonnes Conclusion/Assertion/CTR

**Solution**:
```javascript
// Forcer le traitement
schemaCalculCommands.processAll()
```

### Les modifications ne sont pas sauvegardées

**Vérifications**:
1. localStorage est-il disponible ? → `schemaCalculCommands.showStorage()`
2. Le quota est-il dépassé ? → Vérifier la console pour "QuotaExceededError"

**Solution**:
```javascript
// Nettoyer le stockage
schemaCalculCommands.clearStorage()
```

### Le menu contextuel ne fonctionne pas

**Vérifications**:
1. Les méthodes sont-elles ajoutées dans `menu.js` ?
2. Le menu "papier-travail" existe-t-il ?
3. La table est-elle bien sélectionnée ?

**Solution**:
- Vérifier que `this.targetTable` n'est pas null
- Vérifier que la table est modelisée

### Erreur "Nature de test non trouvée"

**Cause**: La table 2 ne contient pas de colonne "Nature de test"

**Solution**:
- Vérifier la structure de la table 2
- S'assurer qu'une cellule contient "Nature de test" et la valeur dans la cellule suivante

## Commandes utiles

### Console du navigateur

```javascript
// Afficher le gestionnaire
window.SchemaCalculManager

// Traiter toutes les tables
schemaCalculCommands.processAll()

// Afficher le stockage
schemaCalculCommands.showStorage()

// Restaurer les schémas
schemaCalculCommands.restoreAll()

// Effacer le stockage
schemaCalculCommands.clearStorage()
```

### Debug

```javascript
// Activer le mode debug
window.SchemaCalculManager.CONFIG = { debugMode: true }

// Vérifier les tables traitées
window.SchemaCalculManager.processedTables

// Vérifier les observateurs
window.SchemaCalculManager.schemaObservers
```

## Bonnes pratiques

### 1. Ne pas modifier directement le DOM

❌ Mauvais:
```javascript
document.querySelector('.claraverse-schema-calcul').remove()
```

✅ Bon:
```javascript
// Utiliser les méthodes du menu contextuel
this.supprimerSchemaCalcul()
```

### 2. Utiliser les commandes de debug

❌ Mauvais:
```javascript
localStorage.removeItem('claraverse_schema_calcul_data')
```

✅ Bon:
```javascript
schemaCalculCommands.clearStorage()
```

### 3. Vérifier avant de créer

❌ Mauvais:
```javascript
// Créer sans vérifier
this.createSchemaCalculTable(...)
```

✅ Bon:
```javascript
// Vérifier si existe déjà
const existingSchema = this.findExistingSchemaCalcul(table);
if (!existingSchema) {
  this.createSchemaCalculTable(...);
}
```

## Maintenance

### Mise à jour du module

1. Sauvegarder les données:
```javascript
const backup = localStorage.getItem('claraverse_schema_calcul_data');
```

2. Remplacer le fichier `papier-travail-schema-calcul.js`

3. Recharger la page

4. Vérifier que les schémas sont restaurés

### Migration des données

Si le format de stockage change:

```javascript
// Charger les anciennes données
const oldData = JSON.parse(localStorage.getItem('old_key'));

// Convertir au nouveau format
const newData = convertToNewFormat(oldData);

// Sauvegarder
localStorage.setItem('claraverse_schema_calcul_data', JSON.stringify(newData));
```

## Support

En cas de problème:

1. Consulter `TROUBLESHOOTING.md`
2. Vérifier la console du navigateur
3. Utiliser les commandes de debug
4. Consulter `EXEMPLES_UTILISATION.md`

## Ressources

- `ARCHITECTURE.md` - Architecture technique
- `EXEMPLES_UTILISATION.md` - Exemples pratiques
- `TROUBLESHOOTING.md` - Dépannage
- `00_LIRE_EN_PREMIER.txt` - Guide de démarrage rapide
