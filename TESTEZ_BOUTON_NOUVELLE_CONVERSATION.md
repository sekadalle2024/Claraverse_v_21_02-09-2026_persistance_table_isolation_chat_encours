# 🧪 Testez le bouton "Nouvelle conversation"

## 🚀 Démarrage rapide

### 1. Ouvrir l'application

```bash
npm run dev
```

### 2. Ouvrir dans le navigateur

```
http://localhost:5173
```

### 3. Vérifier la console

Ouvrez les DevTools (F12) et vérifiez les messages :

```
🔧 [FIX NEW CHAT] Initialisation du correctif
✅ [FIX NEW CHAT] Styles CSS injectés
✅ [FIX NEW CHAT] Bouton "New Chat" forcé visible
✅ [FIX NEW CHAT] Observateur DOM activé
✅ [FIX NEW CHAT] Système actif
```

### 4. Tester la sidebar

1. **Survoler la sidebar gauche** (barre avec le logo)
2. La sidebar doit s'étendre
3. Le bouton **"New Chat"** doit être visible en haut
4. Cliquer sur le bouton pour créer une nouvelle conversation

## 🔍 Page de test dédiée

Ouvrir la page de test :

```
http://localhost:5173/test-new-chat-button.html
```

Cette page permet de :
- Vérifier que le script est chargé
- Rechercher le bouton dans le DOM
- Vérifier les styles CSS appliqués
- Réappliquer le fix manuellement
- Simuler une sidebar

## 🐛 Diagnostic en cas de problème

### Le bouton n'apparaît toujours pas

1. **Ouvrir la console** (F12)
2. **Taper ces commandes** :

```javascript
// Vérifier si l'API est disponible
console.log(window.fixNewChatButton);

// Réappliquer le fix manuellement
window.fixNewChatButton.reapply();

// Rechercher tous les boutons
document.querySelectorAll('button').forEach(btn => {
    console.log('Bouton:', btn.textContent.substring(0, 30));
});

// Rechercher spécifiquement "New Chat"
document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.includes('New Chat')) {
        console.log('Bouton New Chat trouvé:', btn);
        console.log('Display:', btn.style.display);
        console.log('Visibility:', btn.style.visibility);
        console.log('Opacity:', btn.style.opacity);
    }
});
```

### Le script ne se charge pas

Vérifier dans `index.html` que la ligne suivante est présente :

```html
<script src="/fix-new-chat-button.js"></script>
```

### Le bouton est masqué par un autre script

Vérifier dans la console s'il y a des messages de `design_chat.js` qui masquent le bouton :

```
✅ [MASQUAGE] Bouton masqué: ...
```

Si oui, le script `design_chat.js` a été modifié pour préserver le bouton "New Chat".

## 📊 Résultats attendus

### ✅ Succès

- Le bouton "New Chat" est visible quand la sidebar est étendue
- Le bouton reste accessible même après actualisation
- Le bouton fonctionne et crée une nouvelle conversation

### ❌ Échec

- Le bouton n'apparaît jamais
- Le bouton disparaît après quelques secondes
- Le bouton est grisé ou non cliquable

## 🔧 Solutions alternatives

Si le fix ne fonctionne toujours pas :

### Solution 1: Modifier le composant React

Éditer `src/components/Clara_Components/ClaraSidebar.tsx` :

```tsx
// Ligne 163-170
<div className="px-2 pb-4">
  <button 
    onClick={onNewChat}
    className="w-full flex items-center rounded-lg transition-colors bg-sakura-500 hover:bg-sakura-600 text-white px-4 py-2 justify-start gap-2"
    style={{ display: 'flex !important', visibility: 'visible !important' }}
  >
    <Plus className="w-5 h-5" />
    <span>New Chat</span>
  </button>
</div>
```

### Solution 2: Ajouter un bouton flottant

Créer un bouton flottant en dehors de la sidebar :

```html
<button 
  onclick="document.querySelector('[onclick*=onNewChat]').click()"
  style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;"
>
  + Nouvelle conversation
</button>
```

### Solution 3: Raccourci clavier

Ajouter un raccourci clavier (Ctrl+N) pour créer une nouvelle conversation.

## 📝 Rapport de bug

Si le problème persiste, créer un rapport avec :

1. **Navigateur utilisé** (Chrome, Firefox, Safari, etc.)
2. **Version du navigateur**
3. **Messages de la console** (copier-coller)
4. **Capture d'écran** de la sidebar
5. **Résultat des commandes de diagnostic**

## 🎯 Prochaines étapes

Une fois le bouton visible et fonctionnel :

1. Tester la création de plusieurs conversations
2. Vérifier que l'historique se met à jour
3. Tester le changement entre conversations
4. Vérifier la persistance après actualisation
