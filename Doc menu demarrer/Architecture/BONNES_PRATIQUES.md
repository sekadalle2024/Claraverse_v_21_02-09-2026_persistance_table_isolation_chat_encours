# Bonnes Pratiques - Menu Démarrer

**Date** : 27 Mars 2026  
**Contexte** : Développement et maintenance du menu Démarrer

---

## 📋 Vue d'ensemble

Ce document présente les bonnes pratiques à suivre lors du développement et de la maintenance du menu Démarrer dans E-audit.

---

## 🎯 Principes généraux

### 1. Cohérence
- Maintenir une structure cohérente entre toutes les étapes
- Utiliser les mêmes conventions de nommage partout
- Respecter l'ordre des variables dans les commandes

### 2. Clarté
- Nommer les variables de manière explicite
- Commenter les sections complexes du code
- Documenter les modifications importantes

### 3. Maintenabilité
- Éviter la duplication de code
- Utiliser des constantes pour les valeurs répétées
- Organiser le code de manière logique

---

## 🔧 Développement

### Ajouter un nouveau mode

#### ✅ Bonne pratique
```typescript
// 1. Ajouter le mode dans MODES array
const MODES: ModeItem[] = [
  // ... modes existants
  { 
    id: 'nouveau-mode', 
    label: 'Nouveau Mode', 
    prefix: '[Mode] = Avancé\n[Nouvelle Variable] : Activate\n' 
  }
];

// 2. Ajouter l'icône dans getModeIcon()
const getModeIcon = (modeId: string) => {
  switch (modeId) {
    // ... cas existants
    case 'nouveau-mode':
      return NewIcon;
    default:
      return FileText;
  }
};

// 3. Ajouter le mode aux étapes concernées
{
  id: 'etape-exemple',
  name: 'Étape Exemple',
  modes: [
    // ... modes existants
    {
      id: 'nouveau-mode',
      label: 'Nouveau Mode',
      command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape de mission] = Étape Exemple
[Nouvelle Variable] : Activate
[Nb de lignes] = 30`
    }
  ]
}
```

#### ❌ Mauvaise pratique
```typescript
// Ne pas dupliquer la définition du mode
// Ne pas oublier l'icône
// Ne pas modifier l'ordre des variables existantes
```

---

### Ajouter une nouvelle étape

#### ✅ Bonne pratique
```typescript
{
  id: 'nouvelle-etape',  // ID unique en kebab-case
  name: 'Nouvelle Étape',  // Nom clair en français
  modes: [
    {
      id: 'normal',
      label: 'Normal',
      command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = Étape précédente
[Etape de mission] = Nouvelle Étape
[Modele] : Description du modèle
[Nb de lignes] = 30`
    },
    {
      id: 'avance',
      label: 'Avancé',
      command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = Étape précédente
[Etape de mission] = Nouvelle Étape
[Modele] : Description du modèle
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Nb de lignes] = 30`
    },
    // Ajouter les autres modes (methodo, guide-commandes)
  ]
}
```

#### ❌ Mauvaise pratique
```typescript
// Ne pas utiliser d'espaces dans les IDs
// Ne pas oublier les modes methodo et guide-commandes
// Ne pas modifier la structure des commandes existantes
```

---

### Modifier une commande existante

#### ✅ Bonne pratique
```typescript
// 1. Identifier tous les modes de l'étape
// 2. Modifier la commande dans TOUS les modes
// 3. Respecter l'ordre des variables
// 4. Tester la génération de commande

// Exemple : Ajouter une variable
{
  id: 'methodo',
  label: 'Methodo audit',
  command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape de mission] = Collecte documentaire
[Modele] : Processus, document
[Variable 1] = Contenu
[Variable 2] = Contenu
[Nouvelle Variable] = Valeur  // ← Ajout AVANT [Nb de lignes]
[Guide Methodo] : Activate
[Nb de lignes] = 30`
}
```

#### ❌ Mauvaise pratique
```typescript
// Ne pas modifier un seul mode (incohérence)
// Ne pas ajouter la variable après [Nb de lignes]
// Ne pas oublier de tester
```

---

## 📝 Conventions de code

### Nommage

#### IDs
```typescript
// ✅ Bon
id: 'collecte-documentaire'
id: 'methodo'
id: 'guide-commandes'

// ❌ Mauvais
id: 'Collecte Documentaire'
id: 'methodo_audit'
id: 'guideCommandes'
```

#### Labels
```typescript
// ✅ Bon
label: 'Collecte documentaire'
label: 'Methodo audit'
label: 'Guide des commandes'

// ❌ Mauvais
label: 'collecte-documentaire'
label: 'METHODO AUDIT'
label: 'guide_commandes'
```

#### Variables dans les commandes
```typescript
// ✅ Bon
[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Guide Methodo] : Activate

// ❌ Mauvais
[command] = Etape de mission
[processus]=rapprochements bancaires
[Guide Methodo]:Activate
```

---

### Structure du code

#### Organisation des modes
```typescript
// ✅ Bon : Ordre logique
modes: [
  { id: 'normal', ... },
  { id: 'demo', ... },
  { id: 'avance', ... },
  { id: 'methodo', ... },
  { id: 'guide-commandes', ... },
  { id: 'manuel', ... }
]

// ❌ Mauvais : Ordre aléatoire
modes: [
  { id: 'methodo', ... },
  { id: 'normal', ... },
  { id: 'guide-commandes', ... },
  { id: 'avance', ... }
]
```

#### Organisation des variables
```typescript
// ✅ Bon : Variables groupées logiquement
[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = ...
[Etape de mission] = ...
[Modele] : ...
[Variable 1] = ...
[Variable 2] = ...
[Guide Methodo] : Activate  // Variables spécifiques au mode
[Nb de lignes] = 30  // Toujours en dernier

// ❌ Mauvais : Variables désordonnées
[Nb de lignes] = 30
[Command] = Etape de mission
[Guide Methodo] : Activate
[Processus] = rapprochements bancaires
```

---

## 🧪 Tests

### Avant de commiter

#### Checklist
- [ ] Vérifier la compilation : `npm run build`
- [ ] Tester l'affichage du menu
- [ ] Tester la génération de commandes pour chaque mode
- [ ] Vérifier que les icônes s'affichent correctement
- [ ] Tester l'insertion dans le chat
- [ ] Vérifier qu'il n'y a pas de régression sur les autres étapes

#### Tests manuels
```powershell
# 1. Démarrer l'application
npm run dev

# 2. Ouvrir le menu Démarrer
# 3. Sélectionner E-audit pro
# 4. Sélectionner une étape modifiée
# 5. Tester chaque mode
# 6. Vérifier la commande générée
```

---

## 📚 Documentation

### Documenter les modifications

#### ✅ Bonne pratique
```markdown
## Modification du 27 Mars 2026

### Objectif
Ajouter les modes "Methodo audit" et "Guide des commandes"

### Fichiers modifiés
- src/components/Clara_Components/DemarrerMenu.tsx

### Étapes modifiées
- E-audit pro : 12 étapes
- E-revision : 8 étapes

### Tests effectués
- ✅ Compilation sans erreur
- ✅ Affichage correct des modes
- ✅ Génération correcte des commandes
```

#### ❌ Mauvaise pratique
```markdown
// Modification du menu
// Ajout de modes
```

---

## 🔄 Maintenance

### Mise à jour des modes existants

#### Processus recommandé
1. **Identifier** : Lister toutes les étapes concernées
2. **Planifier** : Créer un plan de modification
3. **Modifier** : Appliquer les modifications de manière systématique
4. **Tester** : Vérifier chaque étape modifiée
5. **Documenter** : Créer la documentation complète

#### Outils utiles
```python
# Script Python pour automatiser les modifications
# Voir : Doc menu demarrer/Scripts/
```

---

### Gestion des erreurs

#### Erreurs courantes

**Erreur de compilation**
```
Cause : Syntaxe TypeScript incorrecte
Solution : Vérifier les accolades, virgules, guillemets
```

**Mode non affiché**
```
Cause : ID du mode incorrect ou manquant
Solution : Vérifier que l'ID correspond à MODES array
```

**Commande incorrecte**
```
Cause : Variables mal formatées
Solution : Respecter le format [Variable] = Valeur
```

---

## 🚀 Performance

### Optimisations

#### ✅ Bonnes pratiques
- Utiliser des constantes pour les données statiques
- Éviter les calculs dans le render
- Utiliser React.memo pour les composants lourds

#### ❌ À éviter
- Recalculer les SUITES à chaque render
- Dupliquer les données en mémoire
- Créer des fonctions dans le render

---

## 🔐 Sécurité

### Validation des données

#### ✅ Bonne pratique
```typescript
const handleStepClick = (step, mode) => {
  // Valider que le mode existe
  const command = step.modes.find(m => m.id === mode.id)?.command;
  if (!command) {
    console.error('Mode non trouvé');
    return;
  }
  insertCommandIntoChat(command);
};
```

#### ❌ Mauvaise pratique
```typescript
const handleStepClick = (step, mode) => {
  // Pas de validation
  const command = step.modes[0].command;
  insertCommandIntoChat(command);
};
```

---

## 📊 Métriques de qualité

### Indicateurs

| Métrique | Objectif | Actuel |
|----------|----------|--------|
| Erreurs de compilation | 0 | ✅ 0 |
| Couverture de tests | 80%+ | ⏳ À mesurer |
| Temps de chargement | <1s | ✅ <1s |
| Cohérence des modes | 100% | ✅ 100% |

---

## 🔗 Ressources

### Documentation
- Architecture : `Architecture/ARCHITECTURE_MENU_DEMARRER.md`
- Problèmes et solutions : `Architecture/PROBLEMES_ET_SOLUTIONS.md`
- Scripts : `Scripts/README_SCRIPTS.md`

### Outils
- TypeScript : https://www.typescriptlang.org/
- React : https://react.dev/
- Tailwind CSS : https://tailwindcss.com/

---

## ✅ Checklist finale

Avant de considérer une modification comme terminée :

- [ ] Code modifié et testé
- [ ] Aucune erreur de compilation
- [ ] Tests manuels effectués
- [ ] Documentation mise à jour
- [ ] Commit avec message clair
- [ ] Revue de code effectuée (si applicable)

---

**Suivre ces bonnes pratiques garantit la qualité et la maintenabilité du code** ✅

---

*Dernière mise à jour : 27 Mars 2026*
