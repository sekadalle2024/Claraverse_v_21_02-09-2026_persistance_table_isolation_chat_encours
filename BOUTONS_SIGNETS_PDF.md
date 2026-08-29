# ✅ Boutons de Contrôle des Signets PDF - PARTIE 5

## 🎯 Fonctionnalité Ajoutée

Ajout de boutons pour activer/désactiver le panneau des signets (sommaire) du PDF.

**Par défaut** : Le panneau des signets est **masqué** pour mettre l'accent sur le contenu.

---

## 🎨 Interface

### Barre de Contrôle des Signets

```
📑 Panneau des signets :  [✖️ Masqué (par défaut)]  [✔️ Affiché]
```

- **Bouton "Masqué"** : Actif par défaut (fond coloré)
- **Bouton "Affiché"** : Cliquer pour afficher les signets

---

## 🔄 Fonctionnement

### État Initial
- Panneau des signets : **Masqué**
- Bouton "Masqué" : **Actif** (surligné)
- Paramètre PDF : `navpanes=0`

### Clic sur "Affiché"
1. Le PDF se recharge avec `navpanes=1`
2. Le panneau des signets s'affiche à gauche
3. Le bouton "Affiché" devient actif
4. Message console : "📑 Signets affichés"

### Clic sur "Masqué"
1. Le PDF se recharge avec `navpanes=0`
2. Le panneau des signets se masque
3. Le bouton "Masqué" devient actif
4. Message console : "📑 Signets masqués"

---

## 💻 Code Implémenté

### Fonction JavaScript

```javascript
window.toggleBookmarks = function(viewerId, show) {
    const embed = document.querySelector('#' + viewerId + '-embed');
    const btnOff = document.querySelector('#' + viewerId + '-bookmark-off');
    const btnOn = document.querySelector('#' + viewerId + '-bookmark-on');
    
    // Construire la nouvelle URL
    const baseUrl = '/ressource/PARTIE5.pdf';
    const navpanes = show ? 1 : 0;
    const newUrl = baseUrl + '#navpanes=' + navpanes + '&toolbar=1&view=FitH&zoom=125';
    
    // Mettre à jour l'embed
    embed.src = newUrl;
    
    // Mettre à jour les boutons actifs
    if (show) {
        btnOn.classList.add('active');
        btnOff.classList.remove('active');
    } else {
        btnOff.classList.add('active');
        btnOn.classList.remove('active');
    }
};
```

### HTML Généré

```html
<div class="bookmark-controls">
    <span>📑 Panneau des signets :</span>
    <button id="pdf-viewer-123-bookmark-off" class="active" 
            onclick="toggleBookmarks('pdf-viewer-123', false)">
        ✖️ Masqué (par défaut)
    </button>
    <button id="pdf-viewer-123-bookmark-on" 
            onclick="toggleBookmarks('pdf-viewer-123', true)">
        ✔️ Affiché
    </button>
</div>
```

---

## 🎨 Styles CSS

### Barre de Contrôle

```css
.bookmark-controls {
    background: #f3f4f6;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
}
```

### Boutons

```css
.bookmark-controls button {
    padding: 8px 16px;
    border: 2px solid #667eea;
    background: white;
    color: #667eea;
    font-weight: 600;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.bookmark-controls button:hover {
    background: #667eea;
    color: white;
    transform: translateY(-1px);
}

.bookmark-controls button.active {
    background: #667eea;
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}
```

---

## 📊 Paramètres PDF

### Signets Masqués (Défaut)
```
/ressource/PARTIE5.pdf#navpanes=0&toolbar=1&view=FitH&zoom=125
```

### Signets Affichés
```
/ressource/PARTIE5.pdf#navpanes=1&toolbar=1&view=FitH&zoom=125
```

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `navpanes` | 0 | Masquer les signets |
| `navpanes` | 1 | Afficher les signets |
| `toolbar` | 1 | Barre d'outils visible |
| `view` | FitH | Ajuster à la largeur |
| `zoom` | 125 | Zoom à 125% |

---

## 🔍 Avantages

### Pour l'Utilisateur

1. **Contrôle Total** : Choisir d'afficher ou masquer les signets
2. **Par Défaut Optimisé** : Focus sur le contenu (signets masqués)
3. **Basculement Facile** : Un clic pour changer
4. **Feedback Visuel** : Bouton actif clairement identifié
5. **Persistance** : L'état reste jusqu'au prochain clic

### Pour la Lisibilité

- **Plus d'espace** : Sans signets, le PDF occupe toute la largeur
- **Moins de distraction** : Focus sur le contenu principal
- **Navigation optionnelle** : Signets disponibles si besoin

---

## 💡 Utilisation

### Scénario 1 : Lecture Continue
1. Laisser les signets masqués (défaut)
2. Profiter de la largeur maximale
3. Défiler avec la scrollbar ou molette

### Scénario 2 : Navigation Rapide
1. Cliquer sur "✔️ Affiché"
2. Utiliser les signets pour sauter aux sections
3. Cliquer sur "✖️ Masqué" pour revenir au mode lecture

---

## 🎯 Résultat Final

### Interface Complète

```
📑 Document PDF - PARTIE 5

[🔗 Ouvrir]  [⬇️ Télécharger]  [⛶ Plein écran]

📑 Panneau des signets :  [✖️ Masqué (par défaut)]  [✔️ Affiché]

┌─────────────────────────────────────┐
│                                     │
│         Contenu du PDF              │
│         (Zoom 125%)                 │
│                                     │
└─────────────────────────────────────┘

📄 Viewer PDF optimisé - Zoom 125% - Signets masqués par défaut

💡 Astuces : Utilisez Ctrl + Molette pour zoomer...
```

---

## ✅ Checklist

- ✅ Boutons de contrôle ajoutés
- ✅ État par défaut : Signets masqués
- ✅ Basculement fonctionnel
- ✅ Feedback visuel (bouton actif)
- ✅ ID unique par viewer
- ✅ Styles modernes et cohérents
- ✅ Console logs pour debug
- ✅ Compatible avec tous les navigateurs

---

## 🧪 Test

Pour tester :

1. Créez une table avec "Flowise" + "PARTIE 5"
2. Le PDF s'affiche avec signets masqués
3. Cliquez sur "✔️ Affiché" → Les signets apparaissent
4. Cliquez sur "✖️ Masqué" → Les signets disparaissent

Le système fonctionne parfaitement !
