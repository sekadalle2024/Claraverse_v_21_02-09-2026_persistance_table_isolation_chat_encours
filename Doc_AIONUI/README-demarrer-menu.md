# Guide d'utilisation - Styles CSS du Menu Démarrer

## Description

Ce fichier CSS (`demarrer-menu.css`) contient tous les styles nécessaires pour reproduire l'apparence du composant **DemarrerMenu.tsx** de Claraverse dans un autre projet.

Le menu est inspiré du design Claude/ChatGPT avec une interface hiérarchique à plusieurs niveaux et une couleur principale rouge bordeaux (#6b1102).

## Structure du Menu

Le menu est organisé en 4 niveaux hiérarchiques :

1. **Niveau 1 - Logiciels** : E-audit pro, E-revision, E-cartographie, etc.
2. **Niveau 2 - Phases** : Phase de préparation, Phase de réalisation, etc.
3. **Niveau 3 - Étapes/Cycles** : Collecte documentaire, Trésorerie, Ventes, etc.
4. **Niveau 4 - Tests** : AA040, BB040, CC020, etc.

Un sous-menu (portail) s'affiche pour sélectionner les modes : Normal, Demo, Avancé, Manuel.

## Installation

### 1. Importer le fichier CSS

```html
<link rel="stylesheet" href="path/to/demarrer-menu.css">
```

### 2. Structure HTML de base

```html
<div class="demarrer-relative">
  <!-- Bouton principal -->
  <button class="demarrer-button">
    <svg class="demarrer-button-icon"><!-- Icône Play --></svg>
    <span>Démarrer</span>
  </button>

  <!-- Menu dropdown -->
  <div class="demarrer-menu">
    <!-- En-tête -->
    <div class="demarrer-menu-header">
      <div class="demarrer-menu-title">
        <svg class="demarrer-menu-title-icon"><!-- Icône Play --></svg>
        <span class="demarrer-menu-title-text">Menu Démarrer</span>
      </div>
      <button class="demarrer-menu-close">
        <svg class="demarrer-menu-close-icon"><!-- Icône X --></svg>
      </button>
    </div>

    <!-- Contenu -->
    <div class="demarrer-menu-content">
      <!-- Bouton Logiciel (Niveau 1) -->
      <button class="demarrer-logiciel-button">
        <span class="demarrer-logiciel-icon"><!-- Icône --></span>
        <span class="demarrer-logiciel-label">E-audit pro</span>
        <svg class="demarrer-logiciel-chevron"><!-- Chevron --></svg>
      </button>

      <!-- Contenu des phases -->
      <div class="demarrer-phases-container">
        <!-- En-tête de phase -->
        <div class="demarrer-phase-header">Phase de préparation</div>

        <!-- Bouton Étape (Niveau 3) -->
        <button class="demarrer-etape-button">
          <span class="demarrer-etape-icon"><!-- Icône --></span>
          <span class="demarrer-etape-label">Collecte documentaire</span>
          <svg class="demarrer-etape-chevron"><!-- Chevron --></svg>
        </button>

        <!-- Bouton Cycle (Niveau 3 - Alternative) -->
        <button class="demarrer-cycle-button">
          <span class="demarrer-cycle-icon"><!-- Icône --></span>
          <span class="demarrer-cycle-label">Trésorerie</span>
          <svg class="demarrer-cycle-chevron"><!-- Chevron --></svg>
        </button>

        <!-- Contenu des tests -->
        <div class="demarrer-tests-container">
          <!-- Bouton Test (Niveau 4) -->
          <button class="demarrer-test-button">
            <span class="demarrer-test-reference">AA040</span>
            <span class="demarrer-test-label">Rapprochements</span>
            <svg class="demarrer-test-chevron"><!-- Chevron --></svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Sous-menu (Portail) -->
  <div class="demarrer-submenu" style="top: 100px; left: 300px;">
    <div class="demarrer-submenu-header">
      <div class="demarrer-submenu-title">Collecte documentaire</div>
      <div class="demarrer-submenu-norme">Norme 14.6 Documentation relative à la mission</div>
    </div>
    
    <!-- Boutons Mode -->
    <button class="demarrer-mode-button">
      <span class="demarrer-mode-icon"><!-- Icône --></span>
      <span>Normal</span>
    </button>
    <button class="demarrer-mode-button">
      <span class="demarrer-mode-icon"><!-- Icône --></span>
      <span>Demo</span>
    </button>
    <button class="demarrer-mode-button">
      <span class="demarrer-mode-icon"><!-- Icône --></span>
      <span>Avancé</span>
    </button>
  </div>
</div>
```

## Classes CSS disponibles

### Bouton principal
- `.demarrer-button` : Bouton principal "Démarrer"
- `.demarrer-button.active` : État actif du bouton
- `.demarrer-button-icon` : Icône du bouton

### Menu principal
- `.demarrer-menu` : Conteneur du menu dropdown
- `.demarrer-menu-header` : En-tête du menu
- `.demarrer-menu-content` : Zone de contenu scrollable

### Niveaux hiérarchiques
- `.demarrer-logiciel-button` : Bouton de niveau 1 (Logiciel)
- `.demarrer-phase-header` : En-tête de phase (Niveau 2)
- `.demarrer-etape-button` : Bouton d'étape (Niveau 3)
- `.demarrer-cycle-button` : Bouton de cycle (Niveau 3 - Alternative)
- `.demarrer-test-button` : Bouton de test (Niveau 4)

### Sous-menu
- `.demarrer-submenu` : Conteneur du sous-menu (portail)
- `.demarrer-mode-button` : Bouton de mode dans le sous-menu

### États
- `.active` : État actif pour tous les boutons
- `:hover` : État de survol (géré automatiquement)
- `:focus-visible` : État de focus pour l'accessibilité

## Mode sombre

Le CSS inclut le support du mode sombre. Pour l'activer, ajoutez la classe `dark` à l'élément parent ou à `<html>` :

```html
<html class="dark">
  <!-- Votre contenu -->
</html>
```

## Variables CSS personnalisables

Vous pouvez personnaliser les couleurs en modifiant les variables CSS dans `:root` :

```css
:root {
  --demarrer-primary: #6b1102;        /* Couleur principale */
  --demarrer-primary-light: #8b2112;  /* Couleur principale claire */
  --demarrer-accent: #ff6b5b;         /* Couleur d'accentuation (mode sombre) */
  /* ... autres variables ... */
}
```

## Icônes

Le composant original utilise la bibliothèque **Lucide React**. Pour reproduire les icônes, vous pouvez :

1. Utiliser Lucide Icons : https://lucide.dev/
2. Utiliser Font Awesome
3. Utiliser des SVG personnalisés

### Icônes utilisées
- `Play` : Bouton principal et en-tête
- `X` : Bouton de fermeture
- `ChevronRight` : Indicateurs de navigation
- `FileText`, `Shield`, `Map`, `Calculator`, etc. : Icônes de catégories

## Exemple complet avec JavaScript

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menu Démarrer</title>
  <link rel="stylesheet" href="demarrer-menu.css">
</head>
<body>
  <div class="demarrer-relative">
    <button id="demarrer-btn" class="demarrer-button">
      <svg class="demarrer-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>Démarrer</span>
    </button>

    <div id="demarrer-menu" class="demarrer-menu demarrer-hidden">
      <!-- Contenu du menu -->
    </div>
  </div>

  <script>
    const btn = document.getElementById('demarrer-btn');
    const menu = document.getElementById('demarrer-menu');

    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      menu.classList.toggle('demarrer-hidden');
    });

    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        btn.classList.remove('active');
        menu.classList.add('demarrer-hidden');
      }
    });
  </script>
</body>
</html>
```

## Fonctionnalités

### ✅ Inclus dans le CSS
- Design hiérarchique à 4 niveaux
- Mode sombre complet
- Animations et transitions
- Scrollbar personnalisée
- États hover, active, focus
- Responsive design
- Accessibilité (focus-visible)

### ⚠️ À implémenter en JavaScript
- Gestion de l'ouverture/fermeture du menu
- Navigation entre les niveaux
- Positionnement du sous-menu (portail)
- Gestion des clics sur les boutons
- Insertion des commandes

## Compatibilité

- ✅ Chrome, Edge, Firefox, Safari (versions récentes)
- ✅ Responsive (mobile, tablette, desktop)
- ✅ Mode sombre
- ✅ Accessibilité WCAG 2.1

## Support

Pour toute question ou problème, référez-vous au composant original `DemarrerMenu.tsx` dans le projet Claraverse.

## Licence

Ce fichier CSS est dérivé du projet open source Claraverse. Consultez la licence du projet original pour plus d'informations.
