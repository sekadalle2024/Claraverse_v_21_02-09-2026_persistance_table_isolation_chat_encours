# Guide de Remplacement du Logo E-audit

## 📋 Résumé des modifications effectuées

J'ai modifié le code pour utiliser votre nouveau logo dans tous les composants de l'application :

### ✅ Modifications du code terminées :

1. **Chat Window** (`src/components/Clara_Components/clara_assistant_chat_window.tsx`)
   - ✅ Écran de bienvenue : Remplacé l'icône Bot par l'image `/logo.png`
   - ✅ Écran de chargement : Remplacé l'icône Bot par l'image `/logo.png`

2. **Onboarding** (`src/components/Onboarding.tsx`)
   - ✅ Déjà configuré pour utiliser `/logo.png`

3. **Sidebar** (`src/components/Sidebar.tsx`)
   - ✅ Déjà configuré pour utiliser le logo depuis `src/assets/logo.png`

## 🎯 Actions à effectuer manuellement

Pour que votre nouveau logo (l'image Ubuntu que vous avez fournie) soit affiché, vous devez remplacer les fichiers suivants :

### 1. Logo principal de l'application

Remplacez ces fichiers par votre nouvelle image :

```
public/logo.png          → Utilisé dans Onboarding et Chat Window
src/assets/logo.png      → Utilisé dans Sidebar
```

### 2. Favicon (icône du navigateur)

Pour une expérience complète, remplacez aussi les favicons :

```
public/favicon.ico
public/favicon-16x16.png
public/favicon-32x32.png
```

## 📝 Instructions détaillées

### Étape 1 : Préparer votre image

1. Sauvegardez l'image Ubuntu que vous avez fournie
2. Renommez-la en `logo.png`
3. Assurez-vous qu'elle a un fond transparent (format PNG recommandé)
4. Taille recommandée : 512x512 pixels ou plus

### Étape 2 : Remplacer les fichiers

**Option A : Via l'explorateur de fichiers**
1. Ouvrez le dossier de votre projet
2. Naviguez vers `public/`
3. Remplacez `logo.png` par votre nouvelle image
4. Naviguez vers `src/assets/`
5. Remplacez `logo.png` par votre nouvelle image

**Option B : Via la ligne de commande**
```bash
# Depuis la racine du projet
# Remplacez /chemin/vers/votre/logo.png par le chemin réel de votre image

# Pour Windows PowerShell:
Copy-Item "C:\chemin\vers\votre\logo.png" -Destination "public\logo.png" -Force
Copy-Item "C:\chemin\vers\votre\logo.png" -Destination "src\assets\logo.png" -Force
```

### Étape 3 : Créer les favicons (optionnel mais recommandé)

Vous pouvez utiliser un outil en ligne comme :
- https://favicon.io/
- https://realfavicongenerator.net/

Téléchargez votre logo et générez les favicons, puis remplacez les fichiers dans `public/`.

### Étape 4 : Vérifier les changements

1. Redémarrez votre serveur de développement si nécessaire
2. Rafraîchissez votre navigateur (Ctrl+F5 pour vider le cache)
3. Vérifiez que le nouveau logo apparaît dans :
   - La sidebar (menu latéral)
   - L'écran de connexion/onboarding
   - L'écran de bienvenue du chat
   - L'écran de chargement

## 🎨 Personnalisation supplémentaire

Si vous souhaitez ajuster l'apparence du logo, vous pouvez modifier les classes CSS dans les composants :

### Taille du logo dans la Sidebar
```tsx
// src/components/Sidebar.tsx, ligne ~340
<img src={logo} alt="E-audit Logo" className="w-8 h-8 flex-shrink-0" />
// Changez w-8 h-8 pour ajuster la taille (w-10 h-10, w-12 h-12, etc.)
```

### Taille du logo dans l'Onboarding
```tsx
// src/components/Onboarding.tsx, ligne ~203
className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
// Ajustez selon vos besoins
```

### Taille du logo dans le Chat
```tsx
// src/components/Clara_Components/clara_assistant_chat_window.tsx
<div className="w-20 h-20 ... p-3">
// Changez w-20 h-20 pour ajuster la taille du conteneur
```

## ✨ Résultat attendu

Après avoir remplacé les fichiers logo, vous devriez voir votre nouveau logo Ubuntu :
- ✅ Dans le menu latéral (sidebar)
- ✅ Sur l'écran de connexion
- ✅ Dans l'écran de bienvenue du chat
- ✅ Pendant le chargement de l'application
- ✅ Dans l'onglet du navigateur (si vous avez remplacé les favicons)

## 🔧 Dépannage

**Le logo ne s'affiche pas ?**
1. Vérifiez que les fichiers sont bien nommés `logo.png` (en minuscules)
2. Videz le cache du navigateur (Ctrl+Shift+Delete)
3. Redémarrez le serveur de développement
4. Vérifiez que l'image est au format PNG avec fond transparent

**Le logo est déformé ?**
1. Assurez-vous que votre image est carrée (même largeur et hauteur)
2. Utilisez `object-contain` dans les classes CSS pour préserver les proportions

**Le logo est trop grand/petit ?**
1. Modifiez les classes `w-X h-X` dans les composants (voir section Personnalisation)
2. Ou redimensionnez votre image source avant de la copier

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Les chemins des fichiers sont corrects
2. Les permissions de fichiers permettent la lecture
3. Le format de l'image est compatible (PNG, JPG, SVG)

---

**Note** : Les modifications du code ont déjà été appliquées. Vous devez seulement remplacer les fichiers image physiques.
