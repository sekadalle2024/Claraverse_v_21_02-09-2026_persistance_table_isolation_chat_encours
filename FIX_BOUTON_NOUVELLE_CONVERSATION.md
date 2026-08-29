# Fix Bouton "Nouvelle conversation"

## 🎯 Problème identifié

Le bouton "Nouvelle conversation" (New Chat) dans la barre latérale gauche n'apparaît pas ou semble masqué.

### Causes du problème

1. **Visibilité conditionnelle** : Le bouton n'est visible que lorsque la sidebar est **étendue** (`isExpanded = true`)
2. **Comportement auto-rétractable** : La sidebar se rétracte automatiquement quand la souris sort (`onMouseLeave`)
3. **Script de masquage** : Le script `design_chat.js` pourrait masquer certains boutons par erreur

## ✅ Solution appliquée

### 1. Modification de `design_chat.js`

Ajout d'une exception pour ne jamais masquer le bouton "New Chat" :

```javascript
// Ne jamais masquer le bouton "New Chat"
if (text.includes('new chat') || text.includes('nouvelle conversation')) {
    console.log('🔓 [MASQUAGE] Bouton "New Chat" préservé');
    return;
}
```

### 2. Nouveau script `fix-new-chat-button.js`

Créé un script dédié qui :
- Force l'affichage du bouton "New Chat"
- Injecte des styles CSS pour garantir la visibilité
- Observe le DOM pour réappliquer le fix automatiquement
- Réapplique le fix toutes les secondes

### 3. Intégration dans `index.html`

Le script est chargé juste après `design_chat.js` :

```html
<!-- Combine: masquage sélecteurs LLM + espacement ultra-compact -->
<script src="/design_chat.js"></script>

<!-- Fix pour le bouton "Nouvelle conversation" -->
<script src="/fix-new-chat-button.js"></script>
```

## 🧪 Comment tester

1. **Ouvrir l'application** dans le navigateur
2. **Vérifier la console** pour voir les messages :
   - `🔧 [FIX NEW CHAT] Initialisation du correctif`
   - `✅ [FIX NEW CHAT] Bouton "New Chat" forcé visible`
3. **Survoler la sidebar gauche** - le bouton doit apparaître
4. **Tester le clic** sur le bouton pour créer une nouvelle conversation

## 🔍 Diagnostic

Si le bouton n'apparaît toujours pas, ouvrir la console et taper :

```javascript
// Réappliquer le fix manuellement
window.fixNewChatButton.reapply()

// Vérifier si le bouton existe dans le DOM
document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.includes('New Chat')) {
        console.log('Bouton trouvé:', btn);
        console.log('Style display:', btn.style.display);
        console.log('Style visibility:', btn.style.visibility);
    }
});
```

## 📝 Fichiers modifiés

1. `public/design_chat.js` - Ajout exception pour "New Chat"
2. `public/fix-new-chat-button.js` - Nouveau script de correction
3. `index.html` - Intégration du nouveau script

## 🎨 Comportement attendu

- Le bouton "Nouvelle conversation" doit être visible quand la sidebar est étendue
- Le bouton doit rester accessible même si d'autres scripts tentent de le masquer
- Le fix doit se réappliquer automatiquement en cas de changement du DOM

## 🚀 Prochaines étapes

Si le problème persiste, envisager :

1. **Modifier le composant React** `ClaraSidebar.tsx` pour rendre le bouton toujours visible
2. **Ajouter un bouton flottant** en dehors de la sidebar
3. **Utiliser un raccourci clavier** pour créer une nouvelle conversation
