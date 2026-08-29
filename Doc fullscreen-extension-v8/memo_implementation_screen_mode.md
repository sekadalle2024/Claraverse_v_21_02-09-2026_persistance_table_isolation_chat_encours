# MÉMO D'IMPLÉMENTATION — Screen Mode (Wide / Middle / Normal) — Composant React Natif

> **Date initiale** : 29 Mai 2026  
> **Mise à jour** : 27 Août 2026 — Ajout du mode Middle screen (v1.1)  
> **Auteur** : Agent de code (Antigravity / Claude Sonnet 4.6)  
> **Statut** : ✅ Implémenté et vérifié (build TypeScript : 0 erreurs)  
> **Version** : 1.1

---

## Table des matières

1. [Contexte et objectif](#1-contexte-et-objectif)
2. [Plan d'implémentation original](#2-plan-dimplémentation-original)
3. [Architecture technique](#3-architecture-technique)
4. [Inventaire complet des fichiers](#4-inventaire-complet-des-fichiers)
5. [Détail de chaque fichier](#5-détail-de-chaque-fichier)
6. [Flux de données et événements](#6-flux-de-données-et-événements)
7. [Algorithme de détection des tables modélisées](#7-algorithme-de-détection-des-tables-modélisées)
8. [Algorithme d'ajustement widescreen](#8-algorithme-dajustement-widescreen)
9. [Mécanisme MutationObserver](#9-mécanisme-mutationobserver)
10. [Persistance et initialisation](#10-persistance-et-initialisation)
11. [Design UI du composant](#11-design-ui-du-composant)
12. [Correspondance avec l'extension Chrome](#12-correspondance-avec-lextension-chrome)
13. [Points d'attention pour évolution](#13-points-dattention-pour-évolution)
14. [Scénarios de test](#14-scénarios-de-test)
15. [Pistes d'évolution future](#15-pistes-dévolution-future)

---

## 1. Contexte et objectif

### Problème initial
Les fonctionnalités **Wide screen** et **Normal screen** étaient gérées via une **extension Chrome** (`FullScreen Pro v8`), accessible uniquement par un **menu contextuel** (clic droit → FullScreen Pro → Ajuster largeur / Largeur normale).

Cette approche présentait plusieurs limites :
- Nécessitait l'installation d'une extension Chrome séparée
- Non accessible aux utilisateurs d'autres navigateurs (Firefox, Edge natif, Electron)
- UX peu intuitive (clic droit → sous-menu)
- Pas de persistance automatique du choix entre sessions
- Pas de réactivité sur les nouveaux messages streamés

### Objectif
Migrer ces fonctionnalités en **composant React natif** directement dans la **topbar** de l'application Claraverse/E-audit :
- Icône **Monitor** cliquable avec dropdown
- Persistance du choix dans `localStorage`
- Réactivité automatique via `MutationObserver` sur le DOM
- Aucune dépendance externe ajoutée

### Fichier source d'origine
Le code de référence provient de :
```
Doc fullscreen-extension-v8/background.js
```
Spécifiquement les fonctions `adjustToWideScreen()` (lignes 324-437) et `restoreNormalScreen()` (lignes 441-461).

---

## 2. Plan d'implémentation original

### Résumé
Un nouveau composant `ScreenSelector` est ajouté dans la Topbar (à gauche du `ThemeSelector`). Ce sélecteur permet de basculer entre **Wide screen** et **Normal screen**, en persistant le choix dans `localStorage`.

Le mode widescreen ajuste automatiquement les largeurs des conteneurs parents de toutes les **"Tables Modélisées"** (tables contenant des colonnes d'audit comme Conclusion, Assertion, Ecart, etc.), en les rendant à pleine largeur de contenu sans barres de défilement horizontales, tout en gardant les tables non-modélisées à leur largeur standard.

### Approche technique retenue
- **MutationObserver dynamique** : Un `MutationObserver` sur `document.body` est activé **uniquement** quand le mode Wide screen est sélectionné. Il intercepte les insertions DOM et applique les ajustements avec un debounce de 50ms.
- **Sauvegarde/Restauration** : Les styles originaux sont sauvegardés dans des attributs `data-orig-style` et `data-orig-class` pour permettre une restauration parfaite.

### Fichiers impactés

| Action | Fichier | Rôle |
|--------|---------|------|
| **CRÉÉ** | `src/utils/screenManager.ts` | Logique métier : détection, ajustement DOM, observer |
| **CRÉÉ** | `src/components/ScreenSelector.tsx` | Composant UI : dropdown avec icône Monitor |
| **MODIFIÉ** | `src/components/Topbar.tsx` | Intégration du ScreenSelector dans la barre d'en-tête |
| **MODIFIÉ** | `src/main.tsx` | Appel `initializeScreenMode()` au démarrage |
| **CRÉÉ** | `Doc fullscreen-extension-v8/tache_screen_component.md` | Documentation de la tâche |

---

## 3. Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                    main.tsx (démarrage)                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │  setTimeout(500ms) → initializeScreenMode()     │    │
│  └────────────────────────┬────────────────────────┘    │
└───────────────────────────┼─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              screenManager.ts (CŒUR LOGIQUE)            │
│                                                         │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │ getCurrentScreen │  │ isModelizedTable(table)      │  │
│  │ Mode()          │  │ → vérifie headers d'audit    │  │
│  └────────┬────────┘  └──────────────────────────────┘  │
│           │                                             │
│  ┌────────▼────────┐  ┌──────────────────────────────┐  │
│  │ setScreenMode() │──│ adjustToWideScreen()         │  │
│  │ → localStorage  │  │ → traverse DOM, élargit      │  │
│  │ → observer      │  │   conteneurs parents         │  │
│  │ → CustomEvent   │  └──────────────────────────────┘  │
│  └────────┬────────┘                                    │
│           │           ┌──────────────────────────────┐  │
│           │           │ restoreNormalScreen()         │  │
│           │           │ → restaure data-orig-style   │  │
│           │           └──────────────────────────────┘  │
│           │                                             │
│  ┌────────▼────────────────────────────────────────┐    │
│  │ MutationObserver (actif en mode 'wide' seul)    │    │
│  │ → observe document.body { childList, subtree }  │    │
│  │ → debouncedAdjust() (50ms)                      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            │ CustomEvent:
                            │ 'clara-screen-mode-changed'
                            ▼
┌─────────────────────────────────────────────────────────┐
│              ScreenSelector.tsx (UI REACT)               │
│                                                         │
│  ┌─────────────┐  ┌──────────────────────────────────┐  │
│  │ Monitor icon │  │ Dropdown menu                    │  │
│  │ (bouton)    │  │ ├─ 🖥️ Wide screen    [●]         │  │
│  │ bleu=wide   │  │ └─ 🖥️ Normal screen  [ ]         │  │
│  │ gris=normal │  │   (pastille verte = actif)       │  │
│  └─────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Topbar.tsx                            │
│  [Logo] ........... [titre] ........... [🖥️][🎨][☀️]   │
│                                         ↑    ↑    ↑     │
│                                    Screen Theme Dark    │
│                                    Selector Selector    │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Inventaire complet des fichiers

### Fichiers créés

| Chemin complet | Taille | Langage |
|----------------|--------|---------|
| `src/utils/screenManager.ts` | ~8.5 KB (245 lignes) | TypeScript |
| `src/components/ScreenSelector.tsx` | ~4.6 KB (136 lignes) | TSX / React |
| `Doc fullscreen-extension-v8/tache_screen_component.md` | ~2.3 KB | Markdown |

### Fichiers modifiés

| Chemin complet | Modifications |
|----------------|---------------|
| `src/components/Topbar.tsx` | +1 import (`ScreenSelector`), +3 lignes JSX (`<ScreenSelector showLabel={false} />`) |
| `src/main.tsx` | +1 import (`initializeScreenMode`), +5 lignes (`setTimeout` + appel) |

### Fichiers de référence (non modifiés, source de l'algorithme)

| Chemin complet | Rôle |
|----------------|------|
| `Doc fullscreen-extension-v8/background.js` | Code source original de l'extension Chrome (fonctions `adjustToWideScreen` et `restoreNormalScreen`) |
| `src/components/ThemeSelector.tsx` | Modèle de design UI pour le dropdown (mêmes conventions visuelles) |
| `src/utils/themeManager.ts` | Modèle d'architecture pour le manager (mêmes patterns) |

---

## 5. Détail de chaque fichier

### 5.1. `src/utils/screenManager.ts` — Cœur logique

Ce fichier est le **moteur** de la fonctionnalité. Il ne contient **aucune dépendance React** — c'est du TypeScript pur manipulant le DOM directement.

#### Variables module-level (privées)

```typescript
let widescreenObserver: MutationObserver | null = null;  // Instance unique de l'observer
let adjustTimeout: any = null;                           // Timer de debounce
```

#### Fonctions exportées

| Fonction | Signature | Description |
|----------|-----------|-------------|
| `getCurrentScreenMode` | `() => 'wide' \| 'normal'` | Lit `localStorage` clé `clara-screen-mode`. Retourne `'normal'` par défaut. |
| `isModelizedTable` | `(table: HTMLTableElement) => boolean` | Analyse les 5 premières lignes d'une table pour détecter des mots-clés d'audit. |
| `adjustToWideScreen` | `() => void` | Parcourt toutes les `<table>` du DOM, identifie les modélisées, élargit leurs conteneurs. |
| `restoreNormalScreen` | `() => void` | Restaure tous les styles originaux depuis `data-orig-style` et `data-orig-class`. |
| `debouncedAdjust` | `() => void` | Wrapper debounced (50ms) autour de `adjustToWideScreen`. Déconnecte temporairement l'observer. |
| `setScreenMode` | `(mode: 'wide' \| 'normal') => void` | Point d'entrée principal : sauvegarde, ajuste/restaure, gère l'observer, dispatche l'événement. |
| `initializeScreenMode` | `() => void` | Appelé au démarrage : restaure le mode sauvegardé si `'wide'`. |

#### Clé localStorage

```
clara-screen-mode = 'wide' | 'normal'
```

#### Événement personnalisé

```typescript
window.dispatchEvent(new CustomEvent('clara-screen-mode-changed', { detail: { mode } }));
```

---

### 5.2. `src/components/ScreenSelector.tsx` — Composant UI React

Composant React fonctionnel avec hooks. Suit exactement le **même pattern visuel** que `ThemeSelector.tsx`.

#### Props

```typescript
interface ScreenSelectorProps {
  className?: string;     // Classe CSS additionnelle (défaut: '')
  showLabel?: boolean;    // Afficher le nom du mode à côté de l'icône (défaut: false)
}
```

#### État interne

```typescript
const [currentMode, setCurrentMode] = useState<ScreenMode>(getCurrentScreenMode());
const [isOpen, setIsOpen] = useState(false);
```

#### Synchronisation inter-composants

Le composant écoute l'événement `clara-screen-mode-changed` sur `window` pour se synchroniser si le mode est changé depuis un autre endroit (ex: futur raccourci clavier, API).

```typescript
useEffect(() => {
  const handleScreenModeChange = (event: CustomEvent) => {
    setCurrentMode(event.detail.mode);
  };
  window.addEventListener('clara-screen-mode-changed', handleScreenModeChange as EventListener);
  return () => {
    window.removeEventListener('clara-screen-mode-changed', handleScreenModeChange as EventListener);
  };
}, []);
```

#### Indicateur visuel

- **Icône Monitor** : bleue (`text-blue-500`) en mode wide, grise (`text-gray-700`) en mode normal
- **Pastille verte** : `<div className="w-2 h-2 rounded-full bg-green-500" />` à côté de l'option active dans le dropdown

#### Structure du dropdown

```
┌─────────────────────────────┐
│ Mode d'affichage            │  ← En-tête
├─────────────────────────────┤
│ 🖥️  Wide screen    [●vert] │  ← Option 1
│ 🖥️  Normal screen  [     ] │  ← Option 2
└─────────────────────────────┘
```

---

### 5.3. `src/components/Topbar.tsx` — Modifications

#### Import ajouté (ligne 7)

```typescript
import ScreenSelector from './ScreenSelector';
```

#### JSX ajouté (lignes 134-135)

```tsx
{/* Sélecteur de mode écran (Wide / Normal) */}
<ScreenSelector showLabel={false} />
```

Placé **immédiatement avant** `<ThemeSelector showLabel={false} />` dans le bloc `<div className="flex items-center gap-6">`.

#### Ordre des éléments dans la topbar (droite)

```
[ScreenSelector] → [ThemeSelector] → [DarkModeToggle] → [NotificationPanel] → [UserProfile] → [Logout]
```

---

### 5.4. `src/main.tsx` — Modifications

#### Import ajouté (ligne 12)

```typescript
import { initializeScreenMode } from './utils/screenManager';
```

#### Appel ajouté (lignes 40-44)

```typescript
// Initialize screen mode (wide/normal) from saved preferences
// Delayed to ensure DOM is ready and tables have been rendered
setTimeout(() => {
  initializeScreenMode();
}, 500);
```

**Pourquoi 500ms ?** Au démarrage, le DOM n'est pas encore peuplé par React. Le délai de 500ms laisse le temps à `createRoot().render()` de monter les composants et au chat de charger ses messages. Si des tables modélisées sont présentes, elles seront traitées. Le `MutationObserver` prendra ensuite le relais pour tout nouveau contenu.

---

## 6. Flux de données et événements

### Scénario 1 : L'utilisateur clique sur "Wide screen"

```
1. ScreenSelector.handleModeChange('wide')
2.   → setScreenMode('wide')                     // screenManager.ts
3.     → localStorage.setItem('clara-screen-mode', 'wide')
4.     → adjustToWideScreen()                     // traite toutes les tables existantes
5.     → new MutationObserver() + observe(body)   // surveille les futures mutations
6.     → window.dispatchEvent('clara-screen-mode-changed', { mode: 'wide' })
7.   → setCurrentMode('wide')                     // mise à jour état React local
8.   → setIsOpen(false)                           // ferme le dropdown
```

### Scénario 2 : Un nouveau message arrive (streaming)

```
1. React ajoute un nouveau <div> dans le chat DOM
2. MutationObserver détecte la mutation (childList + subtree)
3.   → debouncedAdjust()                          // attend 50ms
4.     → widescreenObserver.disconnect()           // pause observation
5.     → adjustToWideScreen()                      // traite les nouvelles tables
6.     → widescreenObserver.observe(body)           // reprend observation
```

### Scénario 3 : L'utilisateur clique sur "Normal screen"

```
1. ScreenSelector.handleModeChange('normal')
2.   → setScreenMode('normal')
3.     → localStorage.setItem('clara-screen-mode', 'normal')
4.     → widescreenObserver.disconnect()           // arrête l'observation
5.     → restoreNormalScreen()                     // restaure TOUS les styles originaux
6.     → window.dispatchEvent('clara-screen-mode-changed', { mode: 'normal' })
```

### Scénario 4 : Rechargement de la page

```
1. main.tsx charge
2. setTimeout(500ms) → initializeScreenMode()
3.   → getCurrentScreenMode() → lit localStorage
4.   → si 'wide' :
5.     → adjustToWideScreen()
6.     → new MutationObserver() + observe(body)
```

---

## 7. Algorithme de détection des tables modélisées

### Fonction `isModelizedTable(table)`

**Entrée** : Un élément `<table>` HTML  
**Sortie** : `boolean`

**Logique** :
1. Récupérer les **5 premières lignes** (`<tr>`) de la table
2. Pour chaque ligne, extraire le contenu texte de chaque cellule (`<th>` ou `<td>`)
3. Convertir en minuscules et supprimer les espaces
4. Vérifier si au moins un en-tête correspond à un **mot-clé d'audit** :

| Mot-clé | Match exact | Regex |
|---------|-------------|-------|
| `conclusion` | ✅ | — |
| `assertion` | ✅ | — |
| `ecart` | ✅ | — |
| `écart` | ✅ (avec accent) | — |
| `resultat` | ✅ | — |
| `résultat` | ✅ (avec accent) | — |
| `ctr`, `ctr1`, `ctr 2`, etc. | — | `/^ctr\s*\d*$/i` |

**Important** : La détection se fait sur les 5 premières lignes car certaines tables modélisées utilisent des sous-en-têtes (ligne 1 = titre fusionné, ligne 2 = colonnes réelles).

### Pour ajouter de nouveaux mots-clés

Dans `screenManager.ts`, fonction `isModelizedTable`, ajouter une ligne dans le bloc `headers.some(h => { ... })` :

```typescript
if (h === 'nouveau_mot_cle') return true;
```

Ou pour un pattern regex :

```typescript
if (/^pattern$/i.test(h)) return true;
```

---

## 8. Algorithme d'ajustement widescreen

### Fonction `adjustToWideScreen()`

Pour **chaque table modélisée** trouvée dans le DOM :

#### Étape 1 : Mesurer la largeur réelle du contenu

```typescript
// Temporairement forcer la table en max-content pour mesurer sa vraie largeur
table.style.setProperty('width', 'max-content', 'important');
table.style.setProperty('max-width', 'none', 'important');
table.style.setProperty('table-layout', 'auto', 'important');
const tableScrollWidth = table.scrollWidth;
// Restaurer les styles temporaires
```

#### Étape 2 : Calculer la largeur cible

```typescript
const neededWidth = tableScrollWidth + 160;            // +160px de marge pour ombres/padding
const targetWidth = Math.max(neededWidth, 1200);       // minimum 1200px
```

#### Étape 3 : Traverser les ancêtres DOM

Remonter l'arbre DOM depuis la table jusqu'à `document.body`. Collecter les éléments qui **contraignent la largeur** :

| Critère | Détail |
|---------|--------|
| `max-width` CSS calculé | `getComputedStyle(el).maxWidth !== 'none'` |
| Classe TailwindCSS `max-w-*` | `classList.some(cls => cls.includes('max-w-'))` |
| Centrage `mx-auto` | `classList.contains('mx-auto')` |
| Conteneur de chat | Classes contenant `chat`, `message`, `bubble`, `window` |
| Attribut data | `data-clara-container` |

#### Étape 4 : Appliquer les styles aux ancêtres

Pour chaque ancêtre identifié :
1. **Sauvegarder** le style original dans `data-orig-style`
2. **Sauvegarder** les classes originales dans `data-orig-class`
3. **Appliquer** `max-width: {targetWidth}px !important; width: 95% !important;`

#### Étape 5 : Traiter le wrapper immédiat de la table

```typescript
wrapper.style.setProperty('max-width', 'none', 'important');
wrapper.style.setProperty('width', '100%', 'important');
wrapper.style.setProperty('overflow-x', 'auto', 'important');
```

#### Étape 6 : Restreindre les tables non-modélisées

Dans le même bloc `.prose`, les divs contenant des tables **non-modélisées** sont limitées à `max-width: 800px` pour éviter qu'elles ne s'étirent inutilement.

---

## 9. Mécanisme MutationObserver

### Pourquoi un MutationObserver ?

Dans Claraverse, les messages de chat sont **streamés** (affichés progressivement) ou **chargés dynamiquement** (changement de session). Un simple appel à `adjustToWideScreen()` ne suffit pas — il faut réagir à chaque nouvelle insertion DOM.

### Configuration

```typescript
widescreenObserver = new MutationObserver(() => {
  debouncedAdjust();
});
widescreenObserver.observe(document.body, {
  childList: true,    // Détecter l'ajout/suppression de nœuds enfants
  subtree: true       // Dans tout l'arbre DOM sous <body>
});
```

### Protection contre les boucles infinies

Le `debouncedAdjust()` utilise une double protection :

1. **Debounce 50ms** : Accumule les mutations rapides (streaming) en un seul ajustement
2. **Disconnect/Reconnect** : L'observer est **déconnecté** pendant l'application des styles, puis **reconnecté** après, pour éviter que ses propres modifications ne déclenchent une nouvelle itération

```typescript
export function debouncedAdjust(): void {
  if (adjustTimeout) clearTimeout(adjustTimeout);
  adjustTimeout = setTimeout(() => {
    if (getCurrentScreenMode() !== 'wide') return;      // Double vérification
    if (widescreenObserver) widescreenObserver.disconnect(); // PAUSE
    adjustToWideScreen();                                 // TRAITEMENT
    if (widescreenObserver && getCurrentScreenMode() === 'wide') {
      widescreenObserver.observe(document.body, { childList: true, subtree: true }); // REPRISE
    }
  }, 50);
}
```

### Impact performance

- L'observer ne s'active qu'en mode `'wide'`
- Le debounce de 50ms limite les recalculs à ~20/seconde maximum
- La déconnexion pendant l'ajustement évite tout effet cascade
- En mode `'normal'`, l'observer est complètement déconnecté (zéro overhead)

---

## 10. Persistance et initialisation

### Stockage

| Clé localStorage | Valeurs possibles | Défaut |
|-------------------|-------------------|--------|
| `clara-screen-mode` | `'wide'`, `'normal'` | `'normal'` (si absent) |

### Séquence de démarrage

```
main.tsx
  ↓
  setTimeout(500ms)
  ↓
  initializeScreenMode()
  ↓
  getCurrentScreenMode() → lit localStorage
  ↓
  si 'wide' → adjustToWideScreen() + démarrer MutationObserver
  si 'normal' → ne rien faire (état par défaut)
```

### Pourquoi le délai de 500ms ?

- `main.tsx` s'exécute **avant** le rendu React
- Les composants de chat et leurs tables ne sont pas encore dans le DOM
- 500ms laisse le temps à React de monter le composant `App` et charger la session
- Le `MutationObserver` prendra le relais pour tout contenu chargé après

---

## 11. Design UI du composant

### Conventions visuelles

Le `ScreenSelector` suit **exactement** les mêmes conventions que `ThemeSelector` :

| Propriété | ThemeSelector | ScreenSelector |
|-----------|---------------|----------------|
| Icône | `Palette` (lucide-react) | `Monitor` (lucide-react) |
| Bouton | `bg-white/50 dark:bg-gray-800/50` | Identique |
| Dropdown | `w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border` | Identique |
| En-tête | `"Choisir un thème"` | `"Mode d'affichage"` |
| Indicateur actif | `w-2 h-2 rounded-full bg-green-500` | Identique |
| Overlay fermeture | `fixed inset-0 z-40` | Identique |
| Menu z-index | `z-50` | Identique |

### Feedback visuel de l'icône Monitor

```typescript
<Monitor className={`w-5 h-5 ${currentMode === 'wide' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`} />
```

- **Mode wide actif** → Icône bleue (signal visuel immédiat sans ouvrir le dropdown)
- **Mode normal** → Icône grise (état standard)

---

## 12. Correspondance avec l'extension Chrome

### Mapping des fonctions

| Extension Chrome (`background.js`) | Composant React (`screenManager.ts`) |
|-------------------------------------|---------------------------------------|
| `adjustToWideScreen()` (L324-437) | `adjustToWideScreen()` (L42-138) |
| `restoreNormalScreen()` (L441-461) | `restoreNormalScreen()` (L144-164) |
| `isModelizedTable()` (L327-344, locale à `adjustToWideScreen`) | `isModelizedTable()` (L20-37, exportée séparément) |
| Menu contextuel `fsp-widescreen` | `ScreenSelector` → clic "Wide screen" |
| Menu contextuel `fsp-normalscreen` | `ScreenSelector` → clic "Normal screen" |
| `chrome.scripting.executeScript()` | Appel direct de la fonction (même contexte JS) |
| Pas de persistance | `localStorage` + `initializeScreenMode()` |
| Pas de réactivité DOM | `MutationObserver` + `debouncedAdjust()` |

### Algorithme identique

L'algorithme de `adjustToWideScreen` dans `screenManager.ts` est une **copie fidèle** de celui de l'extension Chrome, adapté en TypeScript avec l'ajout de :
- Types TypeScript (`HTMLTableElement`, `HTMLElement`)
- Opérateur optionnel (`?.`) pour les accès `textContent`
- Export des fonctions pour usage modulaire
- Protection `data-orig-style` anti-doublon (vérifie avant d'écraser)

---

## 13. Points d'attention pour évolution

### ⚠️ Points critiques

1. **Ne pas supprimer les attributs `data-orig-style` / `data-orig-class`** : Ils sont essentiels pour la restauration. Tout composant qui manipule le DOM des tables doit les préserver.

2. **Le MutationObserver surveille `document.body`** : C'est large. Si des performances sont dégradées (ex: animations lourdes dans d'autres parties de l'app), envisager de restreindre à un conteneur plus spécifique (ex: le conteneur du chat uniquement).

3. **Le debounce de 50ms est un compromis** : Trop court → boucles possibles. Trop long → lag perceptible. 50ms fonctionne bien pour le streaming de tokens.

4. **Les styles sont appliqués avec `!important`** : C'est nécessaire pour surcharger les classes TailwindCSS. Mais cela rend les styles difficiles à surcharger à leur tour.

5. **La largeur minimale de 1200px** peut être insuffisante pour des tables très larges (20+ colonnes). La largeur réelle est calculée dynamiquement (`scrollWidth + 160px`).

### 🔧 Dépendances

| Dépendance | Version | Usage |
|------------|---------|-------|
| `lucide-react` | (déjà dans le projet) | Icône `Monitor` |
| `react` | (déjà dans le projet) | Composant fonctionnel + hooks |
| Aucune nouvelle dépendance | — | — |

### 📁 Fichiers connexes à connaître

| Fichier | Pourquoi |
|---------|----------|
| `src/components/ThemeSelector.tsx` | Modèle de design UI à suivre pour toute modification visuelle |
| `src/utils/themeManager.ts` | Modèle d'architecture pour le manager |
| `src/hooks/useTheme.tsx` | Si on veut créer un `useScreenMode()` hook à l'avenir |
| `src/components/clara_assistant_chat_window.tsx` | Conteneur principal des messages chat — les tables modélisées s'y trouvent |
| `src/components/ClaraAssistant.tsx` | Composant assistant contenant la logique de chat |

---

## 14. Scénarios de test

### Test 1 : Présence de l'icône
- **Action** : Lancer l'application
- **Attendu** : Icône Monitor visible dans la topbar, à gauche de l'icône Palette
- **Vérifie** : Intégration dans `Topbar.tsx`

### Test 2 : Ouverture du dropdown
- **Action** : Cliquer sur l'icône Monitor
- **Attendu** : Dropdown avec "Wide screen" et "Normal screen", pastille verte sur "Normal screen" (défaut)
- **Vérifie** : `ScreenSelector.tsx` rendu correct

### Test 3 : Activation Wide screen
- **Action** : Cliquer sur "Wide screen"
- **Attendu** : Tables modélisées s'élargissent, icône Monitor devient bleue
- **Vérifie** : `setScreenMode('wide')`, `adjustToWideScreen()`

### Test 4 : Retour Normal screen
- **Action** : Cliquer sur "Normal screen"
- **Attendu** : Toutes les tables retrouvent leur largeur initiale, icône redevient grise
- **Vérifie** : `restoreNormalScreen()`

### Test 5 : Persistance
- **Action** : Activer Wide screen → Recharger la page
- **Attendu** : Le mode Wide screen est automatiquement réappliqué
- **Vérifie** : `localStorage` + `initializeScreenMode()`

### Test 6 : Streaming de nouveaux messages
- **Action** : En mode Wide screen, envoyer un message qui génère une table modélisée
- **Attendu** : La nouvelle table est automatiquement élargie sans action de l'utilisateur
- **Vérifie** : `MutationObserver` + `debouncedAdjust()`

### Test 7 : Tables non-modélisées
- **Action** : En mode Wide screen, vérifier une table sans colonnes d'audit
- **Attendu** : La table reste à sa largeur standard (max 800px)
- **Vérifie** : Logique de discrimination dans `adjustToWideScreen()`

### Test 8 : Changement de session
- **Action** : En mode Wide screen, changer de session de chat
- **Attendu** : Les tables de la nouvelle session sont aussi ajustées
- **Vérifie** : `MutationObserver` détecte le remplacement du contenu

---

## 15. Pistes d'évolution future

### 15.1. Hook React `useScreenMode()`

Créer un hook dédié pour accéder au mode écran depuis n'importe quel composant :

```typescript
// src/hooks/useScreenMode.ts
import { useState, useEffect } from 'react';
import { getCurrentScreenMode, setScreenMode } from '../utils/screenManager';

export function useScreenMode() {
  const [mode, setMode] = useState(getCurrentScreenMode());

  useEffect(() => {
    const handler = (e: CustomEvent) => setMode(e.detail.mode);
    window.addEventListener('clara-screen-mode-changed', handler as EventListener);
    return () => window.removeEventListener('clara-screen-mode-changed', handler as EventListener);
  }, []);

  return { mode, setMode: setScreenMode };
}
```

### 15.2. Raccourci clavier

Ajouter un raccourci (ex: `Ctrl+Shift+W`) pour basculer le mode sans ouvrir le dropdown :

```typescript
// Dans ScreenSelector.tsx ou un useEffect global
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'W') {
      e.preventDefault();
      const newMode = getCurrentScreenMode() === 'wide' ? 'normal' : 'wide';
      setScreenMode(newMode);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

### 15.3. Mode "Auto-wide"

Un troisième mode qui active le widescreen **uniquement** quand une table modélisée est détectée, sans élargir les sessions qui n'en contiennent pas.

### 15.4. Personnalisation de la largeur cible

Permettre à l'utilisateur de configurer la largeur minimum (actuellement 1200px) ou le padding (actuellement 160px) via les paramètres utilisateur.

### 15.5. Animation de transition

Ajouter une transition CSS fluide lors du passage wide → normal :

```css
[data-orig-style] {
  transition: max-width 0.3s ease, width 0.3s ease;
}
```

### 15.6. Intégration avec le thème

Synchroniser le mode écran avec le profil utilisateur (comme le thème), pour le persister en base de données plutôt qu'en `localStorage` uniquement.

### 15.7. Restreindre le MutationObserver

Si des problèmes de performance apparaissent, restreindre l'observation à un conteneur spécifique :

```typescript
// Au lieu de document.body, observer le conteneur de chat uniquement
const chatContainer = document.querySelector('[data-clara-chat-container]');
if (chatContainer) {
  widescreenObserver.observe(chatContainer, { childList: true, subtree: true });
}
```

---

## 16. Mises à jour v1.3 (27 Août 2026) — Optimisation Maximale Bord à Bord (Marges 6px)

### Analyse des marges initiales
Auparavant, le cumul des espacements par défaut réduisait l'espace utile :
* Retrait gauche : `24px` (padding chat `p-6`) + `20px` (marge conteneur `96%`) + `48px` (avatar + gap) + `20px` (padding bulle `px-5`) = **112px**.
* Retrait droit : `24px` (padding chat `p-6`) + `20px` (marge conteneur `96%`) + `20px` (padding bulle `px-5`) = **64px**.
* **Perte totale de largeur** : **176px**.

### Optimisations bord à bord (v1.3)
1. **Distance bord d'écran minimale (6px)** :
   * `maxSafeViewportWidth = Math.max(800, window.innerWidth - 12);` (6px à gauche, 6px à droite).
   * `[data-widescreen-target="container"]` : `width: calc(100% - 12px) !important;`.
2. **Réduction du padding du chat en mode Wide/Middle** :
   * `.flex-1.overflow-y-auto` passe à `padding: 6px !important;`.
3. **Optimisation du retrait gauche avec l'avatar** :
   * `gap: 8px !important;` au lieu de `16px`.
   * Padding intérieur de bulle `[data-widescreen-target="bubble-inner"]` à `8px !important;`.
4. **Gain total obtenu** :
   * **Plus de 130px de largeur horizontale supplémentaire** immédiatement disponible à l'écran pour les tables très larges.
   * La première colonne (*N°*, *Compte*) et la dernière colonne (*Conclusion*, *Description*) sont visibles en pleine largeur avec seulement quelques pixels d'écart aux bords de l'écran.

---

> **Note pour les agents futurs** : Ce mémo est auto-suffisant. Tous les détails nécessaires pour comprendre, maintenir, déboguer ou faire évoluer la fonctionnalité sont documentés ici. En cas de doute, les fichiers sources de référence sont `src/utils/screenManager.ts` (logique) et `src/components/ScreenSelector.tsx` (UI). Le fichier `Doc fullscreen-extension-v8/background.js` contient l'algorithme Chrome d'origine (lignes 324-461).


