# Guide du Thème Gris Uniforme (Grok-Style)

## 📋 Vue d'ensemble

Le nouveau thème gris uniforme a été créé pour E-audit, inspiré du design épuré et moderne de Grok. Ce thème offre une interface sobre et professionnelle avec un fond gris uniforme sur toute l'application.

## 🎨 Caractéristiques du Thème Gris

### Couleurs Principales

#### Mode Clair
- **Fond principal** : `#f3f4f6` (grok-100)
- **Fond secondaire** : `#e5e7eb` (grok-200)
- **Fond du chat** : `#f9fafb` (grok-50)
- **Texte principal** : `#111827` (grok-900)
- **Texte secondaire** : `#6b7280` (grok-500)
- **Bordures** : `#d1d5db` (grok-300)

#### Mode Sombre
- **Fond principal** : `#1f2937` (grok-800)
- **Fond secondaire** : `#111827` (grok-900)
- **Fond du chat** : `#1f2937` (grok-800)
- **Texte principal** : `#f9fafb` (grok-50)
- **Texte secondaire** : `#9ca3af` (grok-400)
- **Bordures** : `#374151` (grok-700)

## 🚀 Utilisation

### 1. Changer de Thème via l'Interface

Le composant `ThemeSelector` permet de basculer facilement entre les thèmes :

```tsx
import ThemeSelector from './components/ThemeSelector';

// Dans votre composant
<ThemeSelector showLabel={true} />
```

### 2. Changer de Thème par Code

```typescript
import { applyTheme } from './utils/themeManager';

// Appliquer le thème gris en mode clair
applyTheme('gray', false);

// Appliquer le thème gris en mode sombre
applyTheme('gray', true);
```

### 3. Obtenir le Thème Actuel

```typescript
import { getCurrentTheme, getDarkMode } from './utils/themeManager';

const currentTheme = getCurrentTheme(); // 'gray' | 'sakura' | 'dark'
const isDarkMode = getDarkMode(); // true | false
```

## 🎯 Composants Affectés

### Chat Window
- Fond gris uniforme : `bg-grok-50` (clair) / `bg-grok-900` (sombre)
- Messages utilisateur : `bg-grok-200` (clair) / `bg-grok-700` (sombre)
- Messages assistant : `bg-grok-100` (clair) / `bg-grok-800` (sombre)

### Sidebar
- Fond : `bg-grok-100` (clair) / `bg-grok-800` (sombre)
- Bordure droite : `border-grok-200` (clair) / `border-grok-700` (sombre)

### Topbar
- Fond : `bg-grok-100` (clair) / `bg-grok-900` (sombre)
- Bordure inférieure : `border-grok-200` (clair) / `border-grok-700` (sombre)

### Input Area
- Fond : `bg-grok-100` (clair) / `bg-grok-800` (sombre)
- Bordure supérieure : `border-grok-200` (clair) / `border-grok-700` (sombre)

### Boutons
- **Primaire** : `bg-grok-600` (clair) / `bg-grok-500` (sombre)
- **Secondaire** : `bg-grok-200` (clair) / `bg-grok-700` (sombre)

## 📦 Classes CSS Disponibles

### Classes de Thème
```css
.theme-gray              /* Active le thème gris */
.theme-gray .glassmorphic    /* Effet glassmorphique gris */
.theme-gray .chat-window     /* Fenêtre de chat grise */
.theme-gray .sidebar-grok    /* Sidebar grise */
.theme-gray .message-bubble-user      /* Bulle message utilisateur */
.theme-gray .message-bubble-assistant /* Bulle message assistant */
.theme-gray .input-area      /* Zone de saisie */
.theme-gray .btn-primary     /* Bouton primaire */
.theme-gray .btn-secondary   /* Bouton secondaire */
```

### Classes Tailwind Grok
```css
bg-grok-50   /* Fond très clair */
bg-grok-100  /* Fond clair */
bg-grok-200  /* Fond moyen clair */
bg-grok-300  /* Fond moyen */
bg-grok-400  /* Fond moyen foncé */
bg-grok-500  /* Fond foncé */
bg-grok-600  /* Fond très foncé */
bg-grok-700  /* Fond sombre */
bg-grok-800  /* Fond très sombre */
bg-grok-900  /* Fond noir */

text-grok-50 à text-grok-900  /* Couleurs de texte */
border-grok-50 à border-grok-900  /* Couleurs de bordure */
```

## 🔧 Personnalisation

### Modifier les Couleurs du Thème

Éditez `tailwind.config.js` :

```javascript
grok: {
  50: '#f9fafb',   // Personnalisez ces valeurs
  100: '#f3f4f6',
  // ... autres couleurs
}
```

### Ajouter des Styles Personnalisés

Éditez `src/index.css` :

```css
.theme-gray .mon-composant {
  @apply bg-grok-100 dark:bg-grok-800;
}
```

## 🎨 Comparaison des Thèmes

| Caractéristique | Thème Rose (Sakura) | Thème Gris (Grok) | Thème Noir |
|----------------|---------------------|-------------------|------------|
| **Style** | Coloré, chaleureux | Sobre, professionnel | Minimaliste |
| **Fond principal** | Rose clair | Gris clair | Noir |
| **Accent** | Rose vif | Gris moyen | Gris foncé |
| **Lisibilité** | Bonne | Excellente | Bonne |
| **Fatigue visuelle** | Faible | Très faible | Moyenne |

## 📱 Responsive Design

Le thème gris est entièrement responsive et s'adapte à toutes les tailles d'écran :

- **Mobile** : Interface simplifiée avec fond gris uniforme
- **Tablette** : Layout optimisé avec sidebar rétractable
- **Desktop** : Expérience complète avec tous les éléments visibles

## ♿ Accessibilité

Le thème gris respecte les normes d'accessibilité :

- **Contraste** : Ratio de contraste WCAG AA (4.5:1 minimum)
- **Lisibilité** : Tailles de police adaptées
- **Navigation** : Support complet du clavier
- **Screen readers** : Compatibilité totale

## 🐛 Dépannage

### Le thème ne s'applique pas
1. Vérifiez que `initializeTheme()` est appelé au démarrage de l'app
2. Vérifiez le localStorage : `localStorage.getItem('e-audit-theme')`
3. Effacez le cache du navigateur

### Les couleurs sont incorrectes
1. Vérifiez que Tailwind CSS est correctement configuré
2. Reconstruisez le projet : `npm run build`
3. Vérifiez les classes CSS dans l'inspecteur

### Le mode sombre ne fonctionne pas
1. Vérifiez que la classe `dark` est appliquée à `<html>`
2. Vérifiez `localStorage.getItem('e-audit-dark-mode')`
3. Utilisez `toggleDarkMode()` pour basculer

## 📚 Ressources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Design System Grok](https://grok.x.ai)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🎉 Conclusion

Le thème gris uniforme apporte une expérience utilisateur moderne et professionnelle à E-audit, inspirée du design épuré de Grok. Il offre une excellente lisibilité et réduit la fatigue visuelle, tout en restant élégant et sobre.

Pour toute question ou suggestion, n'hésitez pas à consulter la documentation ou à contacter l'équipe de développement.
