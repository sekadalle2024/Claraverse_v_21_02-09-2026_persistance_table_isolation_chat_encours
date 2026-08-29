# Tâche : Composant React Screen Mode (Wide / Normal)

## Date : 29 Mai 2026

## Contexte

Les fonctionnalités **Wide screen** et **Normal screen** étaient auparavant gérées via un menu contextuel dans une extension Chrome (`background.js`).  
Cette tâche migre cette fonctionnalité directement dans l'application React Claraverse sous forme de composant natif premium.

## Fichiers créés / modifiés

### Nouveaux fichiers

| Fichier | Description |
|---------|-------------|
| `src/utils/screenManager.ts` | Utilitaire central : gestion du mode écran, détection des tables modélisées, `MutationObserver` réactif, sauvegarde/restauration des styles |
| `src/components/ScreenSelector.tsx` | Composant React dropdown avec icône Monitor, options Wide/Normal, indicateur vert actif |

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/components/Topbar.tsx` | Ajout de `<ScreenSelector />` à gauche de `<ThemeSelector />` dans la barre d'en-tête |
| `src/main.tsx` | Appel de `initializeScreenMode()` au démarrage pour restaurer automatiquement le mode précédemment sélectionné |

## Fonctionnement

1. **Détection automatique** : `isModelizedTable()` identifie les tables contenant des colonnes d'audit (Conclusion, Assertion, Ecart/Écart, Resultat/Résultat, CTR).
2. **Mode Wide screen** : Élargit les conteneurs parents des tables modélisées à leur largeur naturelle de contenu + 160px de marge, minimum 1200px. Les tables non-modélisées sont limitées à 800px.
3. **Mode Normal screen** : Restaure tous les styles originaux sauvegardés dans les attributs `data-orig-style` et `data-orig-class`.
4. **MutationObserver** : Observe les changements DOM (nouveaux messages, streaming) et réapplique automatiquement le mode widescreen avec un debounce de 50ms.
5. **Persistance** : Le choix de l'utilisateur est sauvegardé dans `localStorage` sous la clé `clara-screen-mode`.

## Migration réussie

✅ Les options du menu contextuel de l'extension Chrome sont maintenant intégrées nativement dans le composant React.  
✅ L'icône Monitor apparaît dans la topbar à côté de l'icône Palette (thème).  
✅ Le composant respecte le design system existant (même style que ThemeSelector).  
✅ Aucune dépendance externe ajoutée.
