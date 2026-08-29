# Guide de Test - Interface Style Grok

## 🧪 Procédure de Test

### Étape 1: Démarrer l'Application

```bash
npm run dev
```

### Étape 2: Naviguer vers le Chat

1. Ouvrir l'application dans le navigateur
2. Se connecter si nécessaire
3. Cliquer sur l'onglet "Clara" ou "Chat" dans la barre latérale

### Étape 3: Vérifier la Page d'Accueil

**✅ Points à vérifier:**

1. **Logo centré**
   - Le logo doit être au centre de l'écran
   - Taille: 24x24 (w-24 h-24)
   - Forme circulaire avec dégradé violet-rose-sakura

2. **Légende "E-audit"**
   - Texte "E-audit" affiché sous le logo
   - Police: text-2xl, font-semibold
   - Couleur: text-gray-900 (mode clair) / text-white (mode sombre)

3. **Absence d'éléments superflus**
   - ❌ Pas de grille de suggestions
   - ❌ Pas de badges de fonctionnalités
   - ❌ Pas de conseils rapides
   - ✅ Design épuré et minimaliste

### Étape 4: Vérifier la Zone de Saisie

**✅ Points à vérifier:**

1. **Icône de fichiers (Paperclip)**
   - Icône visible à gauche de la zone de saisie
   - Forme: bouton rond avec hover effect
   - Couleur: gris (text-gray-500)
   - Tooltip "Attach files" au survol

2. **Zone de saisie**
   - Forme ovale (rounded-[28px])
   - Placeholder: "Ask me anything..."
   - Bordure: border-2 border-gray-200

3. **Bouton d'envoi**
   - Icône Send à droite
   - Forme: bouton rond
   - Couleur: sakura-500 (rose)

### Étape 5: Tester la Sélection de Fichiers

**✅ Test de l'icône Paperclip:**

1. Cliquer sur l'icône Paperclip (📎)
2. Vérifier que le sélecteur de fichiers s'ouvre
3. Sélectionner un fichier (image, PDF, etc.)
4. Vérifier que le fichier apparaît au-dessus de la zone de saisie
5. Vérifier que le bouton "X" permet de supprimer le fichier

### Étape 6: Vérifier le Masquage des Sélecteurs LLM

**✅ Points à vérifier:**

1. **Sélecteurs invisibles**
   - ❌ Pas de dropdown pour sélectionner le provider
   - ❌ Pas de dropdown pour sélectionner le modèle
   - ❌ Pas de zone de configuration visible

2. **Vérification dans les DevTools**
   - Ouvrir les DevTools (F12)
   - Onglet "Elements"
   - Chercher les éléments avec `display: none`
   - Vérifier que les sélecteurs sont bien masqués

### Étape 7: Tester le Mode Sombre

**✅ Points à vérifier:**

1. Activer le mode sombre
2. Vérifier que:
   - Le logo reste visible
   - La légende "E-audit" est en blanc
   - La zone de saisie a un fond sombre (dark:bg-gray-800)
   - L'icône Paperclip est visible (dark:text-gray-400)

### Étape 8: Tester la Responsivité

**✅ Points à vérifier:**

1. **Desktop (> 1024px)**
   - Logo et légende centrés
   - Zone de saisie centrée avec max-width

2. **Tablet (768px - 1024px)**
   - Même disposition que desktop
   - Espacement adapté

3. **Mobile (< 768px)**
   - Logo et légende centrés
   - Zone de saisie pleine largeur avec padding

## 📸 Captures d'Écran Attendues

### Page d'Accueil (Mode Clair)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│            [Logo 24x24]             │
│              E-audit                │
│                                     │
│                                     │
│  [📎] [Ask me anything...    ] [➤] │
│                                     │
└─────────────────────────────────────┘
```

### Avec Fichier Sélectionné
```
┌─────────────────────────────────────┐
│                                     │
│            [Logo 24x24]             │
│              E-audit                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📄 document.pdf    [X]      │   │
│  └─────────────────────────────┘   │
│  [📎] [Ask me anything...    ] [➤] │
│                                     │
└─────────────────────────────────────┘
```

## 🐛 Problèmes Potentiels et Solutions

### Problème 1: L'icône Paperclip ne fonctionne pas

**Solution:**
- Vérifier que le sélecteur de fichiers existe dans le DOM
- Vérifier la console pour les erreurs JavaScript
- S'assurer que l'événement `onClick` est bien attaché

### Problème 2: Les sélecteurs LLM sont toujours visibles

**Solution:**
- Vérifier que `grok-style-overrides.css` est bien importé dans `index.css`
- Vérifier l'ordre des imports (doit être après Tailwind)
- Inspecter les éléments dans les DevTools pour voir les styles appliqués
- Ajouter des sélecteurs CSS plus spécifiques si nécessaire

### Problème 3: Le logo n'est pas centré

**Solution:**
- Vérifier les classes Tailwind: `flex items-center justify-center`
- Vérifier que le conteneur parent a `h-full`
- Ajuster les marges si nécessaire

### Problème 4: La zone de saisie n'est pas ovale

**Solution:**
- Vérifier la classe `rounded-[28px]`
- S'assurer que les styles ne sont pas écrasés
- Vérifier dans les DevTools les styles appliqués

## ✅ Checklist de Validation

- [ ] Logo centré et visible
- [ ] Légende "E-audit" affichée
- [ ] Icône Paperclip visible et fonctionnelle
- [ ] Zone de saisie avec forme ovale
- [ ] Bouton d'envoi visible
- [ ] Sélecteurs LLM masqués
- [ ] Mode sombre fonctionnel
- [ ] Responsive sur mobile
- [ ] Pas d'erreurs dans la console
- [ ] Fichiers peuvent être sélectionnés

## 📝 Notes de Test

**Date du test:** _________________

**Testeur:** _________________

**Résultat:** ☐ Réussi  ☐ Échec partiel  ☐ Échec

**Commentaires:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Bugs trouvés:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Version:** 1.0
**Dernière mise à jour:** 29 novembre 2025
