# Architecture du Menu Démarrer

**Date** : 27 Mars 2026  
**Fichier** : `src/components/Clara_Components/DemarrerMenu.tsx`

---

## 📋 Vue d'ensemble

Le menu Démarrer est un composant React qui permet de générer des commandes structurées pour les différentes étapes de mission dans E-audit pro et E-revision.

---

## 🏗️ Structure du composant

### 1. Constantes principales

#### MODES array
Définit tous les modes disponibles dans l'application :

```typescript
const MODES: ModeItem[] = [
  { id: 'normal', label: 'Normal', prefix: '' },
  { id: 'demo', label: 'Demo', prefix: '[Demo] = Activate\n' },
  { id: 'avance', label: 'Avancé', prefix: '[Mode] = Avancé\n' },
  { id: 'methodo', label: 'Methodo audit', prefix: '[Mode] = Avancé\n[Guide Methodo] : Activate\n' },
  { id: 'guide-commandes', label: 'Guide des commandes', prefix: '[Mode] = Avancé\n[Guide des commandes] : Activate\n' },
  { id: 'manuel', label: 'Manuel', prefix: '[Mode] = Manuel\n' }
];
```

#### SUITES array
Définit les différents logiciels (suites) disponibles :
- E-audit pro
- E-carto
- E-revision
- E-cia exam
- E-audit plan
- Etc.

Chaque suite contient :
- `id` : Identifiant unique
- `name` : Nom affiché
- `icon` : Icône associée
- `categories` : Liste des catégories d'étapes

---

## 🎯 Structure des étapes

### Format d'une étape

```typescript
{
  id: 'collecte-documentaire',
  name: 'Collecte documentaire',
  modes: [
    {
      id: 'normal',
      label: 'Normal',
      command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = Cartographie des risques
[Etape de mission] = Collecte documentaire
[Modele] : Processus, document, Direction, operationnel
[Nb de lignes] = 30`
    },
    {
      id: 'avance',
      label: 'Avancé',
      command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = Cartographie des risques
[Etape de mission] = Collecte documentaire
[Modele] : Processus, document, Direction, operationnel
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Nb de lignes] = 30`
    },
    {
      id: 'methodo',
      label: 'Methodo audit',
      command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = Cartographie des risques
[Etape de mission] = Collecte documentaire
[Modele] : Processus, document, Direction, operationnel
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide Methodo] : Activate
[Nb de lignes] = 30`
    },
    {
      id: 'guide-commandes',
      label: 'Guide des commandes',
      command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = Cartographie des risques
[Etape de mission] = Collecte documentaire
[Modele] : Processus, document, Direction, operationnel
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide des commandes] : Activate
[Nb de lignes] = 30`
    }
  ]
}
```

---

## 🔧 Fonctions principales

### getModeIcon(modeId: string)
Retourne l'icône associée à un mode :
- `normal` → `FileText`
- `demo` → `Play`
- `avance` → `Zap`
- `methodo` → `BookOpen`
- `guide-commandes` → `GraduationCap`
- `manuel` → `Edit`

### handleStepClick(step, mode)
Gère le clic sur une étape :
1. Récupère la commande du mode sélectionné
2. Insère la commande dans la zone de saisie du chat
3. Ferme le menu

### renderModeButtons(step)
Affiche les boutons de mode pour une étape :
- Affiche uniquement les modes disponibles pour l'étape
- Applique le style approprié (couleur, icône)
- Gère le clic sur chaque mode

---

## 📊 Hiérarchie des données

```
SUITES
└── Suite (E-audit pro, E-revision, etc.)
    └── Categories (Phase de préparation, Phase de conclusion, etc.)
        └── Steps (Collecte documentaire, Questionnaire, etc.)
            └── Modes (Normal, Avancé, Methodo audit, etc.)
                └── Command (Commande générée)
```

---

## 🎨 Styles et UI

### Structure visuelle
1. **Sélection de la suite** : Boutons avec icônes
2. **Sélection de la catégorie** : Liste déroulante
3. **Sélection de l'étape** : Cartes avec modes
4. **Sélection du mode** : Boutons avec icônes et labels

### Classes CSS principales
- `.demarrer-menu` : Conteneur principal
- `.suite-selector` : Sélecteur de suite
- `.category-selector` : Sélecteur de catégorie
- `.steps-grid` : Grille des étapes
- `.step-card` : Carte d'une étape
- `.mode-buttons` : Boutons de mode

---

## 🔄 Flux de données

### 1. Initialisation
```
Chargement du composant
    ↓
Définition des MODES
    ↓
Définition des SUITES
    ↓
Affichage de la sélection de suite
```

### 2. Sélection d'une étape
```
Utilisateur clique sur une suite
    ↓
Affichage des catégories
    ↓
Utilisateur sélectionne une catégorie
    ↓
Affichage des étapes
    ↓
Utilisateur clique sur un mode
    ↓
Génération de la commande
    ↓
Insertion dans le chat
```

---

## 🧩 Intégration avec le chat

### Insertion de la commande
```typescript
const handleStepClick = (step, mode) => {
  const command = step.modes.find(m => m.id === mode.id)?.command;
  if (command) {
    // Insertion dans la zone de saisie du chat
    insertCommandIntoChat(command);
  }
};
```

### Format de la commande
Les commandes sont formatées avec des variables structurées :
```
[Variable] = Valeur
[Variable] = Valeur
...
```

---

## 📝 Conventions de nommage

### IDs
- Kebab-case : `collecte-documentaire`, `methodo`, `guide-commandes`
- Descriptif et unique

### Labels
- Français : "Collecte documentaire", "Methodo audit"
- Clair et concis

### Variables dans les commandes
- Format : `[Variable] = Valeur` ou `[Variable] : Valeur`
- Majuscules pour les noms de variables
- Espaces autour du `=` ou `:`

---

## 🔐 Règles de cohérence

### 1. Structure des modes
- Chaque mode doit avoir un `id`, `label`, et `command`
- Les commandes doivent suivre le même format de variables
- Les variables spécifiques au mode sont ajoutées AVANT `[Nb de lignes]`

### 2. Hiérarchie des données
- Suite → Catégorie → Étape → Mode
- Chaque niveau doit avoir un `id` et un `name`/`label`

### 3. Icônes
- Chaque mode doit avoir une icône associée
- Les icônes doivent être cohérentes avec la fonction du mode

---

## 🚀 Extensibilité

### Ajouter un nouveau mode
1. Ajouter le mode dans `MODES` array
2. Ajouter l'icône dans `getModeIcon()`
3. Ajouter le mode aux étapes concernées
4. Tester la génération de commande

### Ajouter une nouvelle étape
1. Définir l'étape avec ses modes
2. Ajouter l'étape dans la catégorie appropriée
3. Tester l'affichage et la génération de commande

### Ajouter une nouvelle suite
1. Définir la suite avec ses catégories et étapes
2. Ajouter l'icône de la suite
3. Tester l'intégration complète

---

## ⚠️ Points d'attention

### 1. Performance
- Les SUITES sont définies en constante (pas de recalcul)
- Les modes sont filtrés à l'affichage (pas de duplication)

### 2. Maintenance
- Les commandes sont dupliquées pour chaque mode (facilite la maintenance)
- Les variables sont explicites (pas de génération dynamique)

### 3. Cohérence
- Les variables doivent être cohérentes entre les modes
- L'ordre des variables doit être respecté

---

## 📈 Métriques

| Métrique | Valeur |
|----------|--------|
| Nombre de suites | 6+ |
| Nombre d'étapes (E-audit pro) | 15+ |
| Nombre d'étapes (E-revision) | 12+ |
| Nombre de modes | 6 |
| Lignes de code | ~3000 |

---

## 🔗 Dépendances

### Composants React
- `useState` : Gestion de l'état
- `useEffect` : Effets de bord

### Bibliothèques externes
- `lucide-react` : Icônes
- Tailwind CSS : Styles

### Composants internes
- Chat component : Insertion des commandes

---

**Architecture stable et extensible** ✅

---

*Dernière mise à jour : 27 Mars 2026*
