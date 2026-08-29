# Guide Visuel - Zone de Saisie Style Grok 🎨

## 🎯 Vue d'Ensemble

La zone de saisie a été complètement redessinée pour adopter le style épuré et moderne de Grok.

## 📐 Structure Visuelle

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [Espace vide - Aéré]                     │
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │                                               │      │
│     │  Tapez votre message ici...            [📤]  │      │ ← Zone ovale principale
│     │                                               │      │   (Hauteur adaptative)
│     └───────────────────────────────────────────────┘      │
│                                                             │
│              [📎📄🎨] [🎤] [⚡Mode] [🤖Model] [⚙️]          │ ← Options centrées
│                                                             │
│                    [Espace vide - Aéré]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Éléments Clés

### 1. Zone de Saisie Principale (Ovale)
```
┌─────────────────────────────────────────────────┐
│  Votre message...                        [📤]  │
└─────────────────────────────────────────────────┘
```
- **Forme:** Ovale parfait avec `rounded-[28px]`
- **Couleurs:** Blanc/Gris foncé selon le thème
- **Bordure:** 2px gris clair
- **Ombre:** Subtile avec effet hover
- **Hauteur:** 
  - Vide: 56px fixe
  - Avec texte: S'adapte jusqu'à 200px max

### 2. Bouton Send (Circulaire)
```
  [📤]
```
- **Taille:** 40x40px
- **Forme:** Cercle parfait
- **Couleur:** Rose sakura (#FF69B4)
- **Position:** Intégré à droite dans la zone ovale

### 3. Options (Mini Zones Ovales)
```
[📎📄🎨]  [🎤]  [⚡Mode]  [🤖Model]  [⚙️]
```

#### Groupe Upload Files
```
┌──────────────┐
│ 📎  📄  🎨  │
└──────────────┘
```
- 3 icônes groupées
- Fond gris clair semi-transparent
- Forme ovale

#### Voice Input
```
┌────┐
│ 🎤 │
└────┘
```
- Icône seule
- Fond gris ou violet si actif
- Forme circulaire

#### Mode Toggle
```
┌──────────────┐
│ ⚡ Streaming │
└──────────────┘
```
- Badge avec texte
- Bleu (Streaming) ou Vert (Tools)
- Forme ovale

#### Model Selection
```
┌─────────────────┐
│ 🤖 Model Name  │
└─────────────────┘
```
- Sélecteur de modèle
- Fond blanc/gris
- Forme ovale

#### Settings
```
┌────┐
│ ⚙️ │
└────┘
```
- Icône seule
- Fond gris ou rose si actif
- Forme circulaire

## 🎭 États Visuels

### État Normal (Vide)
```
┌─────────────────────────────────────────────────┐
│  Ask me anything...                      [📤]  │ ← 56px hauteur
└─────────────────────────────────────────────────┘
```

### État Avec Texte (Une Ligne)
```
┌─────────────────────────────────────────────────┐
│  Quelle est la capitale de la France?   [📤]  │ ← 56px+ hauteur
└─────────────────────────────────────────────────┘
```

### État Avec Texte (Plusieurs Lignes)
```
┌─────────────────────────────────────────────────┐
│  Peux-tu m'expliquer en détail comment         │
│  fonctionne le système de persistance des      │ ← Hauteur adaptative
│  données dans cette application?        [📤]  │   (max 200px)
└─────────────────────────────────────────────────┘
```

### État Hover
```
┌─────────────────────────────────────────────────┐
│  Votre message...                        [📤]  │ ← Ombre plus prononcée
└─────────────────────────────────────────────────┘
    ↑ shadow-md au lieu de shadow-sm
```

### État Loading (Stop)
```
┌─────────────────────────────────────────────────┐
│  Génération en cours...                  [⏹️]  │ ← Bouton Stop rouge
└─────────────────────────────────────────────────┘
```

## 🎨 Palette de Couleurs

### Mode Clair
- **Zone de saisie:** `bg-white` avec `border-gray-200`
- **Options:** `bg-gray-100/80`
- **Texte:** `text-gray-700`
- **Placeholder:** `text-gray-400`
- **Bouton Send:** `bg-sakura-500` (#FF69B4)

### Mode Sombre
- **Zone de saisie:** `bg-gray-800` avec `border-gray-700`
- **Options:** `bg-gray-800/80`
- **Texte:** `text-gray-300`
- **Placeholder:** `text-gray-500`
- **Bouton Send:** `bg-sakura-500` (#FF69B4)

## 📏 Espacements

```
Conteneur principal:
├─ Padding top: 16px (pt-4)
├─ Padding bottom: 32px (pb-8)
└─ Max width: 768px (max-w-3xl)

Zone de saisie:
├─ Padding horizontal: 20px (px-5)
├─ Padding vertical: 12px (py-3)
├─ Gap avec bouton: 12px (gap-3)
└─ Hauteur min: 56px

Options:
├─ Margin top: 16px (mt-4)
├─ Gap entre éléments: 8px (gap-2)
└─ Alignement: Centré (justify-center)
```

## 🚀 Comparaison avec Grok

### Similitudes ✅
- ✅ Zone de saisie ovale séparée
- ✅ Bouton Send circulaire intégré
- ✅ Options en mini zones ovales en dessous
- ✅ Design épuré sans cadre
- ✅ Hauteur adaptative
- ✅ Options centrées

### Différences Mineures
- 🎨 Couleurs adaptées au thème E-audit (rose sakura)
- 📐 Espacements légèrement ajustés
- 🎭 Animations et transitions personnalisées

## 📱 Responsive

### Desktop (> 768px)
```
        ┌─────────────────────────────────────┐
        │  Message...                  [📤]  │
        └─────────────────────────────────────┘
           [📎📄🎨] [🎤] [Mode] [Model] [⚙️]
```

### Mobile (< 768px)
```
┌─────────────────────────────┐
│  Message...          [📤]  │
└─────────────────────────────┘
  [📎📄🎨] [🎤]
  [Mode] [Model] [⚙️]
```
- Options se répartissent sur plusieurs lignes
- `flex-wrap` activé

## ✨ Animations

### Hover sur Zone de Saisie
```css
transition: shadow 200ms ease
shadow-sm → shadow-md
```

### Hover sur Boutons
```css
transition: background-color 200ms ease
bg-gray-100 → bg-gray-200
```

### Hauteur Adaptative
```css
transition: height auto
min-h-[56px] → max-h-[200px]
```

## 🎯 Points Clés du Design

1. **Minimalisme:** Pas de cadre superflu
2. **Clarté:** Zone de saisie bien visible
3. **Accessibilité:** Boutons bien espacés
4. **Fluidité:** Animations douces
5. **Cohérence:** Style uniforme
6. **Modernité:** Formes ovales élégantes
7. **Aération:** Espaces généreux
8. **Centrage:** Symétrie parfaite

---

**Design inspiré de Grok, adapté pour E-audit** 🎨✨
