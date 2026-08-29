# 🎯 Identification du Script qui Active le Menu Contextuel

## ✅ RÉPONSE : C'est le fichier `menu.js`

---

## 📍 Localisation

**Fichier principal :** `h:\ClaraVerse\public\menu.js`

**Référencé dans :** `h:\ClaraVerse\index.html` (ligne ~143)

---

## 🔍 Comment le Menu Contextuel est Activé

### 1. **Chargement dans index.html**

```html
<!-- Scripts utilisant le système de persistance -->
<script src="/menu.js"></script>
<script src="/conso.js"></script>
```

### 2. **Initialisation dans menu.js**

Le menu contextuel est géré par la classe `ContextualMenuManager` qui :

#### A. Crée une instance globale (ligne ~12300)
```javascript
const contextualMenuManager = new ContextualMenuManager();
```

#### B. Expose des méthodes globales (lignes ~12302-12305)
```javascript
window.initContextualMenu = () => contextualMenuManager.init();
window.forceContextualMenu = () => contextualMenuManager.forceInit();
window.cleanupContextualMenu = () => contextualMenuManager.cleanup();
```

#### C. Lance l'initialisation automatique (lignes ~12306-12310)
```javascript
const initializeMenu = () => { 
  try { 
    contextualMenuManager.init(); 
  } catch (e) { 
    console.error("❌ Erreur init menu:", e); 
  } 
};

// Si le DOM n'est pas encore chargé, attendre
if (document.readyState === "loading") 
  document.addEventListener("DOMContentLoaded", () => setTimeout(initializeMenu, 2000));
// Sinon initialiser immédiatement avec délai
else 
  setTimeout(initializeMenu, 2000);
```

---

## ⚙️ Écoute du Clic Droit (contextmenu)

### Code qui capture le clic droit (ligne ~393)

```javascript
this.addEventListenerWithCleanup(document, "contextmenu", (e) => {
  const table = e.target.closest("table");
  if (table && this.isTableInChat(table)) {
    e.preventDefault();  // Empêche le menu natif du navigateur
    this.clearHoverTimeout();
    
    const cell = e.target.closest("td, th");
    if (cell) this.handleCellClick(e, cell, table);
    else this.targetTable = table;

    this.showMenu(e.pageX, e.pageY, table);  // Affiche le menu personnalisé
  }
});
```

---

## 🎨 Caractéristiques du Menu

### Déclenchement
- **Événement :** Clic droit (`contextmenu`)
- **Cible :** Tables dans le chat ClaraVerse
- **Délai d'initialisation :** 2 secondes après le chargement du DOM

### Fonctionnalités principales
- ✏️ **Édition des cellules**
- 📋 **Gestion des lignes**
- 📊 **Gestion des colonnes**
- 🔢 **Opérations arithmétiques**
- ⚠️ **Évaluation des risques**
- 🗃️ **Opérations sur les tables**
- 📁 **Import/Export Excel et Word**
- 🐼 **Modélisation Pandas**
- 📈 **États Financiers SYSCOHADA**

---

## 🔑 Raccourcis Clavier Définis

Le script définit aussi de nombreux raccourcis clavier (lignes ~415-445) :

| Raccourci | Action |
|-----------|--------|
| `Ctrl+E` | Activer édition |
| `Ctrl+Shift+↓` | Insérer ligne |
| `Ctrl+Shift+→` | Insérer colonne |
| `Ctrl+P` | Pandas Agent |
| `Ctrl+M` | Modélisation N8N |
| `Ctrl+L` | Lead Balance |
| `Ctrl+F` | États Financiers |
| `Ctrl+N` | Notes Annexes |
| `Ctrl+1` à `Ctrl+6` | Opérations arithmétiques |
| `Ctrl+R` | Évaluation des risques |
| `Ctrl+Shift+V` | Remplacer table depuis Excel |
| `Ctrl+Shift+P` | Coller table copiée |

---

## 📝 Conclusion

**Le fichier `public/menu.js` est le SEUL fichier qui active le menu contextuel dans votre projet ClaraVerse.**

### Points clés :
1. ✅ **Un seul fichier responsable** : `menu.js`
2. ✅ **Classe principale** : `ContextualMenuManager`
3. ✅ **Initialisation automatique** : 2 secondes après le chargement du DOM
4. ✅ **Événement écouté** : `contextmenu` (clic droit)
5. ✅ **Référencé dans** : `index.html` ligne ~143

---

## 🚀 Pour Déboguer ou Modifier

### Désactiver temporairement le menu :
Commentez la ligne dans `index.html` :
```html
<!-- <script src="/menu.js"></script> -->
```

### Tester l'initialisation :
Ouvrez la console et tapez :
```javascript
window.initContextualMenu();  // Forcer l'initialisation
window.cleanupContextualMenu(); // Nettoyer le menu
```

### Voir les logs :
Le script affiche des logs dans la console :
```
🎯 Initialisation du menu contextuel ClaraVerse v9 - Accordéon
✅ Menu contextuel initialisé avec succès
```

---

**Date d'analyse :** 27 août 2026  
**Version du script :** 9.3 - Export Word via backend Python + fallback JS
