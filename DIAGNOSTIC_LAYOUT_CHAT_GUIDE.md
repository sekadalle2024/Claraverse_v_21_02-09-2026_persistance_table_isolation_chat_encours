# 🔍 Guide - Diagnostic Layout Chat

## 🎯 Problème

Les chats apparaissent en dehors de la zone de chat habituelle après avoir activé le bouton "Nouvelle conversation".

## 🧪 Utiliser le diagnostic

### 1. Ouvrir l'application

```bash
npm run dev
```

### 2. Ouvrir la console (F12)

Le diagnostic s'exécute automatiquement au chargement. Vous verrez :

```
🔍 [DIAGNOSTIC LAYOUT] Démarrage...
✅ Sidebar trouvée: {...}
✅ Chat window trouvée: {...}
📝 Message 0: {...}
...
📊 RÉSUMÉ DU DIAGNOSTIC:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sidebar: ✅ Trouvée
Chat Window: ✅ Trouvée
Messages: X trouvé(s)
Éléments fixed: X
Éléments absolute: X
Problèmes z-index: X
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Commandes disponibles

```javascript
// Relancer le diagnostic
window.diagnosticLayout.run()

// Obtenir les résultats
window.diagnosticLayoutResults

// Mettre en évidence les zones visuellement
window.diagnosticLayout.highlightZones()
// Sidebar = rouge
// Chat window = bleu
// Messages = vert

// Retirer les mises en évidence
window.diagnosticLayout.removeHighlights()
```

## 🔍 Interpréter les résultats

### Sidebar

```javascript
{
  found: true,
  position: "fixed" | "absolute" | "relative" | "static",
  width: "280px",
  height: "100vh",
  zIndex: "10",
  display: "flex",
  visibility: "visible"
}
```

**Problèmes possibles:**
- `position: fixed` avec `zIndex` très élevé → peut masquer le chat
- `width` trop grande → peut pousser le chat hors de l'écran
- `display: none` → sidebar invisible

### Chat Window

```javascript
{
  found: true,
  position: "relative" | "absolute",
  width: "calc(100% - 280px)",
  height: "100vh",
  zIndex: "1",
  top: "0",
  left: "280px"
}
```

**Problèmes possibles:**
- `position: fixed` → peut sortir du flux normal
- `left` ou `top` négatifs → hors de l'écran
- `zIndex` trop bas → masqué par d'autres éléments
- `width` incorrecte → déborde de l'écran

### Messages

**Problèmes possibles:**
- `position: absolute` sans parent positionné → positionnement erratique
- `zIndex` très élevé → messages au-dessus de tout
- `top` ou `left` négatifs → hors de la zone de chat

## 🐛 Solutions selon le problème

### Problème 1: Sidebar trop large

```javascript
// Dans la console
const sidebar = document.querySelector('[class*="sidebar"]');
sidebar.style.width = '280px';
sidebar.style.maxWidth = '280px';
```

### Problème 2: Chat window mal positionnée

```javascript
// Dans la console
const chatWindow = document.querySelector('[data-clara-container]');
chatWindow.style.position = 'relative';
chatWindow.style.marginLeft = '280px';
chatWindow.style.width = 'calc(100% - 280px)';
```

### Problème 3: Messages en position fixed

```javascript
// Dans la console
document.querySelectorAll('[class*="message"]').forEach(msg => {
    const styles = window.getComputedStyle(msg);
    if (styles.position === 'fixed') {
        console.log('Message en fixed trouvé:', msg);
        msg.style.position = 'relative';
    }
});
```

### Problème 4: z-index trop élevé

```javascript
// Dans la console
const results = window.diagnosticLayoutResults;
results.zIndexIssues.forEach(issue => {
    console.log('Problème z-index:', issue);
});
```

## 📸 Capture d'écran

Après avoir exécuté `window.diagnosticLayout.highlightZones()`, prenez une capture d'écran pour voir :
- **Rouge** = Sidebar
- **Bleu** = Chat window
- **Vert** = Messages

Cela permet de visualiser où sont réellement les éléments.

## 🔧 Désactiver le diagnostic

Une fois le problème identifié, retirer la ligne dans `index.html` :

```html
<!-- Diagnostic layout chat -->
<script src="/diagnostic-layout-chat.js"></script>
```

## 📝 Rapport de bug

Si le problème persiste, créer un rapport avec :

1. **Résultats du diagnostic** (copier-coller de la console)
2. **Capture d'écran** avec les zones mises en évidence
3. **Description** de où apparaissent les chats
4. **Navigateur** utilisé

---

**Prochaine étape:** Exécuter le diagnostic et partager les résultats
