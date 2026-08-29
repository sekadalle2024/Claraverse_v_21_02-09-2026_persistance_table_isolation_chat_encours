# 📁 Guide Visuel - Menu Dossier

## 🎯 Vue d'Ensemble Rapide

Le **Menu Dossier** est une barre latérale coulissante qui organise toutes les tables des messages LLM dans un menu accordéon intuitif.

---

## 🖼️ Interface Visuelle

### 1. Sidebar avec Icône Dossier

```
┌─────────────────────────────────────────────┐
│  SIDEBAR (Gauche)                           │
│                                             │
│  ┌─────┐                                    │
│  │ 🏠  │  Dashboard (inactif)               │
│  └─────┘                                    │
│                                             │
│  ┌─────┐                                    │
│  │ 💬  │  Chat (actif)                      │
│  └─────┘                                    │
│                                             │
│  ┌─────┐                                    │
│  │ 📁  │  Dossier (actif) ← NOUVEAU         │
│  └─────┘                                    │
│                                             │
│  ┌─────┐                                    │
│  │ 🤖  │  Agents (inactif)                  │
│  └─────┘                                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 2. Menu Dossier Fermé

```
┌─────────────────────────────────────────────┐
│                                             │
│  [Contenu du Chat]                          │
│                                             │
│  Message 1 avec tables...                   │
│  Message 2 avec tables...                   │
│  Message 3 avec tables...                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 3. Menu Dossier Ouvert (50% de l'écran)

```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│  [Contenu du Chat]   │  ╔════════════════╗  │
│                      │  ║ 📁 Dossier     ✕║  │
│  Message 1...        │  ╠════════════════╣  │
│  Message 2...        │  ║                ║  │
│  Message 3...        │  ║ ▼ Message 1    ║  │
│                      │  ║   📊 Table 1   ║  │
│                      │  ║   📊 Table 2   ║  │
│                      │  ║                ║  │
│                      │  ║ ▼ Message 2    ║  │
│                      │  ║   📊 Table 1   ║  │
│                      │  ║                ║  │
│                      │  ║ ▼ Message 3    ║  │
│                      │  ║   📊 Table 1   ║  │
│                      │  ║   📊 Table 2   ║  │
│                      │  ║   📊 Table 3   ║  │
│                      │  ╚════════════════╝  │
└──────────────────────┴──────────────────────┘
```

---

### 4. Rubrique d'Accordéon Fermée

```
╔═══════════════════════════════════════════╗
║ 📊 Analyse Financière                  ▼ ║
║ 5 tables                                  ║
╚═══════════════════════════════════════════╝
```

**Éléments** :
- 📊 Icône de table
- "Analyse Financière" : Titre extrait de la 1ère table
- "5 tables" : Nombre de tables dans ce message
- ▼ : Indicateur d'état (fermé)

---

### 5. Rubrique d'Accordéon Ouverte

```
╔═══════════════════════════════════════════╗
║ 📊 Analyse Financière                  ▲ ║
║ 5 tables                                  ║
╠═══════════════════════════════════════════╣
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ Table 1                             │ ║
║  │ 10 lignes × 5 colonnes              │ ║
║  │ Cliquez pour faire défiler...       │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ Table 2                             │ ║
║  │ 8 lignes × 4 colonnes               │ ║
║  │ Cliquez pour faire défiler...       │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ Table 3                             │ ║
║  │ 15 lignes × 6 colonnes              │ ║
║  │ Cliquez pour faire défiler...       │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
╚═══════════════════════════════════════════╝
```

**Éléments** :
- ▲ : Indicateur d'état (ouvert)
- Miniatures de tables avec :
  - Numéro de la table
  - Dimensions (lignes × colonnes)
  - Texte d'action

---

### 6. Miniature de Table (Hover)

```
┌─────────────────────────────────────────┐
│ Table 1                                 │
│ 10 lignes × 5 colonnes                  │
│ Cliquez pour faire défiler...           │
└─────────────────────────────────────────┘
     ↓ (hover)
┌─────────────────────────────────────────┐
│ Table 1                              → │
│ 10 lignes × 5 colonnes                  │
│ Cliquez pour faire défiler...           │
└─────────────────────────────────────────┘
```

**Effets Hover** :
- Fond change de blanc à gris clair
- Bordure change de gris à bleu
- Translation de 4px vers la droite
- Curseur devient pointer

---

### 7. Navigation vers Table

```
ÉTAPE 1 : Clic sur miniature
┌─────────────────────────────────────────┐
│ Table 3                              ✓ │
│ 15 lignes × 6 colonnes                  │
└─────────────────────────────────────────┘

ÉTAPE 2 : Menu se ferme (animation 300ms)
[Menu slide vers la droite]

ÉTAPE 3 : Page défile vers la table
[Scroll fluide vers la table]

ÉTAPE 4 : Table surlignée (2 secondes)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ TABLE 3 (surlignée en bleu)          ┃
┃ ┌─────────┬─────────┬─────────┐      ┃
┃ │ Col 1   │ Col 2   │ Col 3   │      ┃
┃ ├─────────┼─────────┼─────────┤      ┃
┃ │ Data 1  │ Data 2  │ Data 3  │      ┃
┃ └─────────┴─────────┴─────────┘      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🎨 Palette de Couleurs

### En-tête du Menu
```
┌─────────────────────────────────────────┐
│ Dégradé Violet                          │
│ #667eea → #764ba2                       │
│ Texte : Blanc (#ffffff)                 │
└─────────────────────────────────────────┘
```

### Fond du Menu
```
┌─────────────────────────────────────────┐
│ Blanc (#ffffff)                         │
│ Ombre : rgba(0, 0, 0, 0.15)            │
└─────────────────────────────────────────┘
```

### Accordéon
```
┌─────────────────────────────────────────┐
│ Fermé : Gris clair (#f9fafb)            │
│ Ouvert : Gris très clair (#fafafa)      │
│ Hover : Gris moyen (#f3f4f6)            │
└─────────────────────────────────────────┘
```

### Miniatures
```
┌─────────────────────────────────────────┐
│ Normal : Blanc (#ffffff)                │
│ Bordure : Gris (#e5e7eb)                │
│ Hover : Gris clair (#f9fafb)            │
│ Hover Bordure : Bleu (#667eea)          │
└─────────────────────────────────────────┘
```

### Texte
```
┌─────────────────────────────────────────┐
│ Titre : Gris foncé (#374151)            │
│ Sous-titre : Gris moyen (#6b7280)       │
│ Détails : Gris clair (#9ca3af)          │
└─────────────────────────────────────────┘
```

---

## 🎬 Animations

### 1. Ouverture du Menu

```
État Initial (Fermé)
┌────────────────────────────────┐
│                                │
│  [Contenu du Chat]             │
│                                │
└────────────────────────────────┘
                                  [Menu hors écran →]

     ↓ Clic sur 📁

Animation (300ms)
┌────────────────────────────────┐
│                                │
│  [Contenu du Chat]             │
│                                │
└────────────────────────────────┘
                          [Menu slide ←]

État Final (Ouvert)
┌──────────────┬─────────────────┐
│              │                 │
│  [Chat]      │  [Menu Dossier] │
│              │                 │
└──────────────┴─────────────────┘
```

**Propriétés** :
- Transform : translateX(100%) → translateX(0)
- Durée : 300ms
- Easing : cubic-bezier(0.175, 0.885, 0.32, 1.275)

---

### 2. Expansion de l'Accordéon

```
État Initial (Fermé)
╔═══════════════════════════════╗
║ 📊 Message 1               ▼ ║
║ 3 tables                      ║
╚═══════════════════════════════╝

     ↓ Clic

Animation (300ms)
╔═══════════════════════════════╗
║ 📊 Message 1               ▲ ║
║ 3 tables                      ║
╠═══════════════════════════════╣
║ [Contenu en expansion...]     ║
╚═══════════════════════════════╝

État Final (Ouvert)
╔═══════════════════════════════╗
║ 📊 Message 1               ▲ ║
║ 3 tables                      ║
╠═══════════════════════════════╣
║ Table 1                       ║
║ Table 2                       ║
║ Table 3                       ║
╚═══════════════════════════════╝
```

**Propriétés** :
- Max-height : 0 → scrollHeight
- Durée : 300ms
- Easing : ease

---

### 3. Hover sur Miniature

```
État Normal
┌─────────────────────────────┐
│ Table 1                     │
│ 10 lignes × 5 colonnes      │
└─────────────────────────────┘

     ↓ Hover

Animation (200ms)
┌─────────────────────────────┐
│ Table 1                  → │
│ 10 lignes × 5 colonnes      │
└─────────────────────────────┘
```

**Propriétés** :
- Background : #ffffff → #f9fafb
- Border-color : #e5e7eb → #667eea
- Transform : translateX(0) → translateX(4px)
- Durée : 200ms
- Easing : ease

---

## 📐 Dimensions

### Menu
```
┌─────────────────────────────────────────┐
│ Largeur : 50% de l'écran                │
│ Hauteur : 100vh (plein écran)           │
│ Position : Fixed, Right: 0, Top: 0      │
│ Z-index : 20000                         │
└─────────────────────────────────────────┘
```

### En-tête
```
┌─────────────────────────────────────────┐
│ Padding : 20px                          │
│ Height : Auto                           │
│ Display : Flex                          │
└─────────────────────────────────────────┘
```

### Rubrique d'Accordéon
```
┌─────────────────────────────────────────┐
│ Margin-bottom : 12px                    │
│ Border-radius : 8px                     │
│ Padding (header) : 16px                 │
└─────────────────────────────────────────┘
```

### Miniature de Table
```
┌─────────────────────────────────────────┐
│ Margin-bottom : 12px                    │
│ Padding : 12px                          │
│ Border-radius : 6px                     │
└─────────────────────────────────────────┘
```

---

## 🔄 États Visuels

### Menu

| État | Transform | Opacity | Display |
|------|-----------|---------|---------|
| Fermé | translateX(100%) | 0 | none |
| Ouvert | translateX(0) | 1 | flex |
| Transition | Animation 300ms | - | - |

### Accordéon

| État | Max-height | Icon | Shadow |
|------|------------|------|--------|
| Fermé | 0 | ▼ | none |
| Ouvert | scrollHeight | ▲ | 0 4px 12px |
| Transition | Animation 300ms | Rotate 180° | - |

### Miniature

| État | Background | Border | Transform |
|------|------------|--------|-----------|
| Normal | #ffffff | #e5e7eb | translateX(0) |
| Hover | #f9fafb | #667eea | translateX(4px) |
| Active | #f3f4f6 | #667eea | translateX(4px) |

---

## 🎯 Points d'Interaction

### 1. Icône Dossier (Sidebar)
```
┌─────┐
│ 📁  │ ← Clic : Ouvre/Ferme le menu
└─────┘
```

### 2. Bouton Fermer (Menu)
```
╔════════════════════════════╗
║ 📁 Dossier            [✕] ║ ← Clic : Ferme le menu
╚════════════════════════════╝
```

### 3. En-tête Accordéon
```
╔═══════════════════════════╗
║ 📊 Message 1           ▼ ║ ← Clic : Ouvre/Ferme
╚═══════════════════════════╝
```

### 4. Miniature de Table
```
┌───────────────────────────┐
│ Table 1                   │ ← Clic : Va vers la table
│ 10 lignes × 5 colonnes    │
└───────────────────────────┘
```

### 5. Touche Clavier
```
[Escape] ← Appui : Ferme le menu
```

---

## 📱 Responsive (Futur)

### Desktop (> 1024px)
```
┌──────────────┬─────────────────┐
│              │                 │
│  Chat (50%)  │  Menu (50%)     │
│              │                 │
└──────────────┴─────────────────┘
```

### Tablet (768px - 1024px)
```
┌────────┬────────────────────────┐
│        │                        │
│ Chat   │  Menu (60%)            │
│ (40%)  │                        │
└────────┴────────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────────────────────┐
│                                │
│  Menu (100%)                   │
│  [Plein écran]                 │
│                                │
└────────────────────────────────┘
```

---

## 🎨 Thème Sombre (Futur)

### Couleurs Adaptées

```
┌─────────────────────────────────────────┐
│ En-tête : #1f2937 → #111827            │
│ Fond : #1f2937                          │
│ Accordéon : #374151                     │
│ Miniatures : #4b5563                    │
│ Texte : #f9fafb                         │
│ Bordures : #6b7280                      │
└─────────────────────────────────────────┘
```

---

## ✨ Effets Spéciaux

### 1. Surbrillance de Table (2 secondes)

```
État Normal
┌─────────────────────────────┐
│ Table                       │
│ Border : 1px solid #d1d5db  │
└─────────────────────────────┘

     ↓ Navigation

État Surligné (2s)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Table                       ┃
┃ Border : 3px solid #667eea  ┃
┃ Shadow : 0 0 20px rgba(...) ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

     ↓ Après 2s

État Normal
┌─────────────────────────────┐
│ Table                       │
│ Border : 1px solid #d1d5db  │
└─────────────────────────────┘
```

### 2. Scroll Fluide

```
Position Actuelle
[Viewport]
    ↓
    ↓ Scroll fluide (behavior: smooth)
    ↓
[Table Cible]
```

---

## 🎯 Hiérarchie Visuelle

```
Niveau 1 : En-tête du Menu
┌─────────────────────────────────────────┐
│ 📁 Dossier - Tables                  ✕ │
└─────────────────────────────────────────┘

Niveau 2 : Rubriques d'Accordéon
  ┌───────────────────────────────────────┐
  │ 📊 Message 1 - 5 tables            ▼ │
  └───────────────────────────────────────┘

Niveau 3 : Miniatures de Tables
    ┌─────────────────────────────────────┐
    │ Table 1 - 10 lignes × 5 colonnes    │
    └─────────────────────────────────────┘
```

---

**Version** : 1.0  
**Date** : Décembre 2025  
**Type** : Guide Visuel  
**Auteur** : Équipe E-audit
