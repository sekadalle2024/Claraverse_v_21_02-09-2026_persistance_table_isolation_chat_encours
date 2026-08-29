# Guide d'Utilisation - Interface Style Grok

## 🎯 Concept Principal

L'interface E-audit adopte maintenant le design de Grok avec **une seule barre latérale à gauche** qui change de contenu selon vos besoins.

## 📍 Positionnement

```
┌─────────────┬──────────────────────────────┐
│             │                              │
│   BARRE     │                              │
│  LATÉRALE   │      ZONE DE CHAT            │
│   GAUCHE    │                              │
│             │                              │
└─────────────┴──────────────────────────────┘
```

**Pas de barre à droite !** Tout se passe à gauche.

## 🔄 Deux Modes de la Barre Latérale

### Mode 1 : Menu Principal (Par défaut)

```
┌─────────────┬──────────────────────────────┐
│  🏠 E-audit │                              │
│             │                              │
│  🏠 Dashboard                             │
│  💬 Chat    │      Bienvenue !             │
│  🤖 Agents  │                              │
│  📚 Notebooks                             │
│  ⚙️  Settings                              │
│  ❓ Help    │                              │
│             │                              │
└─────────────┴──────────────────────────────┘
```

**Fonctionnalités :**
- Navigation vers toutes les pages
- Clic sur "Chat" pour voir l'historique
- Clic sur autre chose pour changer de page

### Mode 2 : Historique des Chats

```
┌─────────────┬──────────────────────────────┐
│ Chat History│                              │
│         [X] │                              │
│             │                              │
│ 🔍 Search   │      Conversation active     │
│             │                              │
│ ➕ New Chat │                              │
│             │                              │
│ 💬 Chat 1   │                              │
│ 💬 Chat 2   │                              │
│ 💬 Chat 3   │                              │
│             │                              │
└─────────────┴──────────────────────────────┘
```

**Fonctionnalités :**
- Liste de tous vos chats
- Recherche dans l'historique
- Création de nouveau chat
- Bouton X pour revenir au menu

## 🎮 Comment Naviguer

### Pour Ouvrir l'Historique des Chats

**Option 1 : Via le Menu Principal**
1. Vous êtes sur le menu principal
2. Cliquez sur "💬 Chat"
3. Le menu disparaît
4. L'historique des chats apparaît à sa place

**Option 2 : Via le Bouton Flottant**
1. Si vous êtes sur le menu principal
2. Un bouton flottant (☰) apparaît en haut à gauche
3. Cliquez dessus
4. L'historique des chats apparaît

### Pour Revenir au Menu Principal

**Option 1 : Bouton de Fermeture**
1. Vous êtes sur l'historique des chats
2. Cliquez sur le bouton [X] en haut à droite
3. L'historique disparaît
4. Le menu principal réapparaît

**Option 2 : Navigation**
1. Sélectionnez un chat dans l'historique
2. Continuez votre conversation
3. Cliquez sur [X] quand vous voulez revenir au menu

## 🎨 Animations

### Transition Menu → Chat History
```
Menu Principal  →  [Slide Out Left]  →  [Slide In Left]  →  Chat History
```

### Transition Chat History → Menu
```
Chat History  →  [Slide Out Left]  →  [Slide In Left]  →  Menu Principal
```

**Durée :** 300ms avec easing fluide

## 💡 Astuces

### 1. Expansion au Survol
Les deux barres (menu et chat history) s'expandent quand vous passez la souris dessus :
- **Rétractée** : 4rem (64px) - Icônes seulement
- **Expandée** : 20rem (320px) - Icônes + Texte

### 2. Bouton Flottant
Le bouton flottant (☰) n'apparaît que quand :
- Vous êtes sur le menu principal
- Vous voulez un accès rapide à l'historique

### 3. Indicateur Visuel
Un point bleu apparaît sur "Chat" dans le menu quand l'historique est ouvert (même si vous ne le voyez pas).

## 🔧 Raccourcis Clavier (À venir)

- `Ctrl + H` : Toggle Chat History
- `Ctrl + N` : Nouveau Chat
- `Esc` : Fermer Chat History

## 📱 Responsive

Sur mobile, le comportement reste le même :
- Une seule barre à gauche
- Swipe pour ouvrir/fermer (à venir)
- Bouton flottant toujours accessible

## ❓ FAQ

**Q : Pourquoi une seule barre à gauche ?**
R : C'est le design de Grok ! Plus épuré, plus d'espace pour le chat.

**Q : Comment accéder aux autres pages depuis l'historique ?**
R : Cliquez sur [X] pour revenir au menu principal, puis naviguez.

**Q : L'historique reste-t-il ouvert si je change de page ?**
R : Non, si vous cliquez sur une autre page, le menu principal réapparaît.

**Q : Puis-je garder les deux barres visibles ?**
R : Non, c'est le principe du design Grok : une seule barre qui change de contenu.

## 🎯 Avantages du Design

1. **Plus d'espace** : Pas de barre à droite = plus de place pour le chat
2. **Interface épurée** : Moins de distractions visuelles
3. **Navigation intuitive** : Un seul endroit pour tout
4. **Moderne** : Suit les tendances des meilleurs chatbots (Grok, Claude)
5. **Flexible** : Facile d'ajouter de nouvelles fonctionnalités

## 🚀 Prochaines Étapes

- [ ] Mémoriser l'état dans localStorage
- [ ] Ajouter des raccourcis clavier
- [ ] Améliorer les animations
- [ ] Ajouter un breadcrumb
- [ ] Support du swipe sur mobile
