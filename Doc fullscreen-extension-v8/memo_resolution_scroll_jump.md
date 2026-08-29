# MÉMO TECHNIQUE — Résolution de l'anomalie de défilement (Scroll Jump)
## Stabilisation des modes Wide Screen & Middle Screen

> **Date** : 27 Août 2026  
> **Auteur** : Développeur UI Front-End Senior  
> **Dossier** : `Doc fullscreen-extension-v8`  
> **Statut** : ✅ Résolu, testé & validé sans erreurs de build TypeScript  
> **Version** : 1.4

---

## 1. Contexte & Problématique

Après la migration de l'extension Chrome vers le composant React natif `ScreenSelector` (introduisant les modes `Wide screen`, `Middle screen` et `Normal screen`), une anomalie de comportement de défilement a été identifiée :

* **Mode Normal screen** : Le défilement vers le bas reste stable au niveau de la dernière table.
* **Modes Wide / Middle screen** : Lorsque l'utilisateur scrolle manuellement vers le bas au niveau de la dernière table, l'écran remonte de manière intempestive et automatique de quelques dizaines de pixels vers le haut.

## 2. Cause Racine (Scroll Anchoring)

L'anomalie est causée par le mécanisme de **Scroll Anchoring** (ancrage de défilement) natif du navigateur :

1. En mode Wide/Middle, un `MutationObserver` surveille le DOM pour adapter dynamiquement la largeur des conteneurs via la variable CSS `--clara-target-width` appliquée sur `<body>`.
2. À chaque ajustement de largeur, le navigateur recalcule les layouts.
3. Le navigateur cherche alors à maintenir la position visuelle d'un élément ancré (souvent une bulle de message parente) en ajustant automatiquement la propriété `scrollTop`.
4. Ce calcul réajuste le scroll et provoque le saut vers le haut.
5. La transition CSS (`transition: max-width 0.25s ease-out`) sur les conteneurs amplifiait ce comportement en provoquant des re-layouts successifs pendant la durée de l'animation.

---

## 3. Solutions Implémentées

Les modifications suivantes ont été apportées dans le fichier [`screenManager.ts`](file:///H:/ClaraVerse/src/utils/screenManager.ts) :

### A. Désactivation complète du Scroll Anchoring
La propriété `overflow-anchor: none` a été propagée à l'ensemble des enfants et descendants du conteneur de défilement pour empêcher le navigateur de choisir un point d'ancrage.
```css
/* Désactive l'ancrage sur le conteneur principal */
body[data-clara-screen-mode="wide"] .flex-1.overflow-y-auto {
  padding-left: 6px !important;
  padding-right: 6px !important;
  overflow-anchor: none !important;
}

/* Désactive l'ancrage sur TOUS les descendants */
body[data-clara-screen-mode="wide"] .flex-1.overflow-y-auto * {
  overflow-anchor: none !important;
}
```

### B. Suppression de la Transition de Largeur
La transition animée sur le `max-width` du conteneur de message a été retirée pour éliminer les recalculs de layout à répétition.
```css
body[data-clara-screen-mode="wide"] [data-widescreen-target="container"] {
  max-width: var(--clara-target-width) !important;
  width: calc(100% - 12px) !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
  /* transition retirée pour éviter d'activer le scroll anchoring */
}
```

### C. Ajout d'une Garde Anti-Scroll Utilisateur (User-Scroll Guard)
Une garde de **800ms** a été intégrée pour bloquer temporairement l'exécution des réajustements de largeur par le `MutationObserver` lorsque l'utilisateur manipule manuellement la barre de défilement.
```typescript
const USER_SCROLL_PAUSE_MS = 800;
let userScrollPauseUntil = 0;
let userScrollListenerAttached = false;

function attachUserScrollGuard(): void {
  if (userScrollListenerAttached) return;
  userScrollListenerAttached = true;
  
  // Utilisation de la phase de capture pour intercepter le scroll du conteneur
  document.addEventListener(
    'scroll',
    () => {
      userScrollPauseUntil = Date.now() + USER_SCROLL_PAUSE_MS;
    },
    { passive: true, capture: true }
  );
}
```
Dans `debouncedAdjust()` :
```typescript
export function debouncedAdjust(): void {
  if (adjustTimeout) clearTimeout(adjustTimeout);
  adjustTimeout = setTimeout(() => {
    const mode = getCurrentScreenMode();
    if (mode === 'normal') return;

    // Si l'utilisateur est en train de scroller, on ignore ce cycle d'ajustement
    if (Date.now() < userScrollPauseUntil) return;

    if (mode === 'wide') {
      adjustToWideScreen();
    } else if (mode === 'middle') {
      adjustToMiddleScreen();
    }
  }, 50);
}
```

---

## 4. Vérification et Rendu

* **Compilation TypeScript** : validée à 100% avec `exit code 0` (aucune erreur).
* **Comportement dynamique** : Le défilement est désormais fluide et s'arrête exactement là où l'utilisateur le souhaite, sans subir de saut ou de recentrage involontaire.
