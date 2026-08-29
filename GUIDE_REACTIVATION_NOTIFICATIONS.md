# Guide de Réactivation des Notifications

📅 **Date de désactivation**: 06 Mai 2026  
🎯 **Méthode utilisée**: Masquage CSS  
📁 **Fichier modifié**: `src/components/NotificationContainer.css`

---

## 🚀 Réactivation Rapide (2 minutes)

### Étape 1: Ouvrir le fichier CSS

```bash
# Ouvrir dans votre éditeur
src/components/NotificationContainer.css
```

### Étape 2: Supprimer les lignes de désactivation

Supprimer ces 4 lignes **au début du fichier**:

```css
/* DÉSACTIVATION TEMPORAIRE - 06 MAI 2026 */
.notification-container {
  display: none !important;
}
```

### Étape 3: Sauvegarder

Sauvegarder le fichier. Les notifications réapparaîtront immédiatement.

---

## 📋 Méthode Détaillée

### Option 1: Suppression Complète (Recommandé)

1. **Ouvrir le fichier**
   ```
   src/components/NotificationContainer.css
   ```

2. **Localiser les lignes**
   - Elles se trouvent au tout début du fichier
   - Rechercher: "DÉSACTIVATION TEMPORAIRE"

3. **Supprimer les 4 lignes**
   ```css
   /* DÉSACTIVATION TEMPORAIRE - 06 MAI 2026 */
   .notification-container {
     display: none !important;
   }
   ```

4. **Vérifier**
   - Le fichier doit maintenant commencer par:
   ```css
   /* Notification Container Styles */
   
   .notification-container {
     position: fixed;
     top: 20px;
     right: 20px;
     ...
   ```

5. **Sauvegarder**
   - Ctrl+S (Windows/Linux)
   - Cmd+S (Mac)

### Option 2: Commentaire (Alternative)

Si vous voulez garder une trace:

```css
/*
DÉSACTIVÉ LE 06 MAI 2026 - RÉACTIVÉ LE [DATE]
.notification-container {
  display: none !important;
}
*/
```

---

## ✅ Vérification de la Réactivation

### Test 1: Vérification Visuelle

1. Ouvrir l'application E-audit
2. Envoyer un message dans le chat
3. **Vous devriez voir** une notification en haut à droite avec:
   - 🔀 Router N8N
   - Le numéro de case (ex: Case 23)
   - La route utilisée
   - L'URL de l'endpoint N8N

### Test 2: Vérification Console

1. Ouvrir la console du navigateur (F12)
2. Envoyer un message dans le chat
3. Vérifier les logs:
   ```
   📢 Notification info: { title: "🔀 Router N8N", message: "...", duration: 7000 }
   ```

### Test 3: Vérification Fonctionnelle

- ✅ La notification apparaît en haut à droite
- ✅ Elle affiche le bon case et la bonne route
- ✅ Elle se ferme automatiquement après 7 secondes
- ✅ Le bouton × permet de la fermer manuellement
- ✅ Plusieurs notifications peuvent s'empiler

---

## 🔧 Dépannage

### Problème: Les notifications n'apparaissent pas

**Solution 1: Vérifier le fichier CSS**
```bash
# Ouvrir et vérifier qu'il n'y a pas de display: none
src/components/NotificationContainer.css
```

**Solution 2: Vider le cache du navigateur**
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

**Solution 3: Redémarrer le serveur de développement**
```bash
# Arrêter le serveur (Ctrl+C)
# Relancer
npm run dev
```

### Problème: Les notifications apparaissent mais sont mal positionnées

**Vérifier le CSS**
```css
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  /* ... */
}
```

### Problème: Les notifications ne se ferment pas automatiquement

**Vérifier le service**
```typescript
// Dans toastNotificationService.ts
// La durée par défaut est 7000ms (7 secondes)
addInfoNotification(title, message, 7000);
```

---

## 📊 État du Système

### Avant Réactivation
```
┌─────────────────────────────────────┐
│  Notifications: MASQUÉES            │
│  Service: ACTIF (en arrière-plan)   │
│  Logs console: ACTIFS               │
│  Affichage: INVISIBLE               │
└─────────────────────────────────────┘
```

### Après Réactivation
```
┌─────────────────────────────────────┐
│  Notifications: VISIBLES            │
│  Service: ACTIF                     │
│  Logs console: ACTIFS               │
│  Affichage: VISIBLE (haut droite)   │
└─────────────────────────────────────┘
```

---

## 📁 Fichiers Concernés

### Fichier Principal à Modifier
```
src/components/NotificationContainer.css
```

### Fichiers du Système (Ne pas modifier)
```
src/services/toastNotificationService.ts
src/components/NotificationContainer.tsx
src/services/claraApiService.ts
```

### Documentation
```
Doc notification app/
├── README.md
├── ARCHITECTURE.md
├── GUIDE_UTILISATION.md
└── EXEMPLES.md
```

---

## 🎯 Cas d'Usage des Notifications

Les notifications affichent:

1. **Router N8N** - Titre de la notification
2. **Case détecté** - Ex: "Case 23 : recos_revision"
3. **Endpoint N8N** - URL complète du webhook

### Exemple de Notification

```
┌─────────────────────────────────────────┐
│ ℹ️ 🔀 Router N8N                    × │
├─────────────────────────────────────────┤
│ Case 23 : recos_revision                │
│ 🌐 https://n8n.example.com/webhook/...  │
└─────────────────────────────────────────┘
```

---

## 📞 Support

### En cas de problème

1. **Consulter la documentation**
   - `Doc notification app/README.md`
   - `Doc notification app/ARCHITECTURE.md`

2. **Vérifier les logs**
   - Console du navigateur (F12)
   - Rechercher: "📢 Notification"

3. **Tester avec un exemple simple**
   ```javascript
   // Dans la console du navigateur
   import { addInfoNotification } from './services/toastNotificationService';
   addInfoNotification("Test", "Ceci est un test", 5000);
   ```

---

## 📝 Checklist de Réactivation

- [ ] Ouvrir `src/components/NotificationContainer.css`
- [ ] Supprimer les 4 lignes de désactivation
- [ ] Sauvegarder le fichier
- [ ] Vider le cache du navigateur (Ctrl+Shift+R)
- [ ] Tester en envoyant un message dans le chat
- [ ] Vérifier que la notification apparaît en haut à droite
- [ ] Vérifier que la notification se ferme après 7 secondes
- [ ] Vérifier que le bouton × fonctionne
- [ ] Documenter la date de réactivation

---

## 🏆 Résultat Attendu

Après réactivation, vous devriez voir:

✅ Notifications visibles en haut à droite  
✅ Animation d'entrée fluide  
✅ Fermeture automatique après 7 secondes  
✅ Bouton × fonctionnel  
✅ Empilage de plusieurs notifications  
✅ Responsive sur mobile  

---

## 📅 Historique

| Date | Action | Auteur |
|------|--------|--------|
| 06 Mai 2026 | Désactivation via CSS | Équipe Dev |
| [À compléter] | Réactivation | [À compléter] |

---

## 🔗 Liens Utiles

- [Documentation complète](./Doc%20notification%20app/README.md)
- [Architecture](./Doc%20notification%20app/ARCHITECTURE.md)
- [Guide d'utilisation](./Doc%20notification%20app/GUIDE_UTILISATION.md)
- [Exemples](./Doc%20notification%20app/EXEMPLES.md)

---

**Dernière mise à jour**: 06 Mai 2026  
**Version**: 1.0  
**Statut**: Notifications désactivées
