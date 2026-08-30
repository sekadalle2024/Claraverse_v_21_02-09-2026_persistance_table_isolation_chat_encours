# 🔔 Guide - Logs & Notifications Persistance

**Date** : 29 Août 2026  
**Fonctionnalité** : Système de logs détaillés + notifications visuelles

---

## 🎯 Ce Qui A Été Ajouté

### 1. Logs Console Détaillés
**Couleurs** pour identifier rapidement:
- ✅ Vert : Succès
- ❌ Rouge : Erreur
- ⚠️ Orange : Avertissement
- ℹ️ Bleu : Information
- 🔍 Gris : Debug

### 2. Notifications Visuelles
**En haut à droite** de l'écran:
- 🎨 Couleurs selon le type (succès/erreur/warning/info)
- ⏱️ Durée : 4 secondes
- ✖️ Bouton fermeture manuelle
- 📱 Responsive et non-intrusives

---

## 📊 Événements Loggés

### Au Démarrage
```
🚀 [INIT] Système de persistance démarré
   SessionId: clara-session-xxx...
```
**Notification** : "Système de persistance initialisé"

### SessionId Détecté
```
✅ [SESSION] SessionId depuis DOM (ISOLATION ACTIVE)
   SessionId: clara-session-xxx...
```
**Notification** : "✅ Isolation des chats ACTIVE"

**OU (problème)**
```
⚠️ [SESSION] SessionId depuis sessionStorage
   ATTENTION: Isolation des chats NON garantie!
```
**Notification** : "⚠️ Isolation compromise"

### Sauvegarde Table
```
💾 [SAVE] Sauvegarde de "Table_Consolidation" démarrée
   Type: conso
✅ [SAVE] Table "Table_Consolidation" sauvegardée
   ID: table_consolidation_xxx
   Lignes: 12
```
**Notifications** : 
- "💾 Sauvegarde Table_Consolidation..."
- "✅ Table_Consolidation sauvegardée"

### Restauration Tables
```
🔄 [RESTORE] Restauration de 2 table(s)
   Session: clara-session-xxx...
✅ [RESTORE] Table trouvée: "Table_Consolidation"
✅ [RESTORE] 2/2 table(s) restaurée(s)
```
**Notifications** : 
- "🔄 Restauration 2 table(s)..."
- "✅ 2/2 table(s) restaurée(s)"

### Changement de Chat
```
🔄 [CHAT] Changement de chat détecté
   Ancien: clara-session-ABC...
   Nouveau: clara-session-XYZ...
```
**Notification** : "🔄 Changement de chat"

### Erreurs
```
❌ [SAVE] Erreur sauvegarde "Table_Consolidation"
   Erreur: IndexedDB quota exceeded
```
**Notification** : "❌ Erreur sauvegarde"

### Doublons
```
⚠️ [DOUBLON] Table "Table_Consolidation" existe déjà
   Action: Mise à jour au lieu de duplication
```
**Notification** : "⚠️ Doublon détecté"

---

## 🛠️ Commandes Console

### Diagnostic Automatique (au démarrage +3s)
```
📊 DIAGNOSTIC AUTOMATIQUE PERSISTANCE
═══════════════════════════════════════
SessionId trouvé        ✅ clara-session-xxx...
Source SessionId        ✅ DOM (isolation active)
Tables data-keyword     3 table(s)
Processor intégré       ✅ OUI
Logger actif            ✅ OUI
Notifications           ✅ OUI
```

### Diagnostic Manuel
```javascript
checkPersistanceStatus()
```
**Affiche** :
- État du système (tableau)
- Liste des tables suivies
- Commandes disponibles

### Activer/Désactiver Logs
```javascript
// Désactiver logs console (garder notifications)
togglePersistanceLogs(false)

// Réactiver logs console
togglePersistanceLogs(true)
```

### Activer/Désactiver Notifications
```javascript
// Désactiver notifications visuelles (garder logs)
togglePersistanceNotifications(false)

// Réactiver notifications
togglePersistanceNotifications(true)
```

### Notification Personnalisée
```javascript
// Afficher notification custom
showPersistanceNotification("Message personnalisé", "success", "🎉")
// Types: success, error, warning, info, debug
```

---

## 🧪 Test des Logs

### 1. Tester au Démarrage
```
npm run dev
→ Ouvrir console (F12)
→ Voir: 🚀 [INIT] Système de persistance démarré
→ Voir notification: "Système de persistance initialisé"
```

### 2. Tester Sauvegarde
```
1. Générer une table
2. Modifier une cellule
3. Console doit afficher:
   💾 [SAVE] Sauvegarde de "xxx" démarrée
   ✅ [SAVE] Table "xxx" sauvegardée
4. Notification visible en haut à droite
```

### 3. Tester Restauration
```
1. Modifier table
2. F5 (actualisation)
3. Console doit afficher:
   🔄 [RESTORE] Restauration de X table(s)
   ✅ [RESTORE] X/X table(s) restaurée(s)
4. Notification: "✅ X/X table(s) restaurée(s)"
```

### 4. Tester Changement Chat
```
1. Chat1 actif
2. Basculer vers Chat2
3. Console doit afficher:
   🔄 [CHAT] Changement de chat détecté
4. Notification: "🔄 Changement de chat"
```

---

## 🐛 Débogage

### Problème : Pas de Logs
```javascript
// Vérifier que logger est chargé
window.PersistanceLogger
// Doit retourner: {logInit: ƒ, logSessionIdSource: ƒ, ...}

// Vérifier que logs sont activés
togglePersistanceLogs(true)
```

### Problème : Pas de Notifications
```javascript
// Vérifier conteneur
document.getElementById('persistance-notifications')
// Doit exister

// Réactiver notifications
togglePersistanceNotifications(true)

// Test manuel
showPersistanceNotification("Test", "success", "✅")
```

### Problème : Logs Trop Verbeux
```javascript
// Désactiver logs console, garder notifications importantes
togglePersistanceLogs(false)
```

---

## 📋 Checklist Validation

- [ ] **Démarrage** : Notification "Système initialisé" visible
- [ ] **SessionId** : Log "depuis DOM" (pas sessionStorage)
- [ ] **Sauvegarde** : Notification après modification table
- [ ] **Restauration** : Notification après F5
- [ ] **Diagnostic** : `checkPersistanceStatus()` fonctionne
- [ ] **Notifications** : Visibles en haut à droite, se ferment après 4s
- [ ] **Console** : Logs colorés et structurés

---

## 🎨 Personnalisation

### Durée Notifications
**Fichier** : `public/persistance-logger.js`  
**Ligne 18** :
```javascript
NOTIFICATION_DURATION: 4000,  // Changer ici (en millisecondes)
```

### Couleurs
**Fichier** : `public/persistance-logger.js`  
**Lignes 19-25** :
```javascript
LOG_COLORS: {
  success: '#10b981',  // vert
  error: '#ef4444',    // rouge
  warning: '#f59e0b',  // orange
  info: '#3b82f6',     // bleu
  debug: '#6b7280'     // gris
}
```

---

## 🚀 Prochaines Étapes

### 1. **TESTER MAINTENANT**
```bash
npm run dev
→ F12 (console)
→ Observer logs et notifications
```

### 2. **Vérifier Isolation**
```javascript
checkPersistanceStatus()
→ Regarder "Source SessionId": doit être "✅ DOM"
```

### 3. **Partager Résultats**
Si problème détecté:
- Faire capture écran console
- Noter quelle notification apparaît (ou pas)
- Exécuter `checkPersistanceStatus()` et partager sortie

---

## 📞 Support

**Si notifications ne fonctionnent pas** :
1. Vérifier console pour erreurs JavaScript
2. Exécuter : `window.PersistanceLogger`
3. Tester manuellement : `showPersistanceNotification("Test", "success", "✅")`

**Si logs manquants** :
1. Vérifier : `window.claraverseProcessor?.__integrated`
2. Attendre 20 secondes après chargement
3. Recharger page : Ctrl+Shift+R

**Si problème persiste** :
- Exécuter `checkPersistanceStatus()`
- Partager sortie complète

---

**Fichiers créés** :
- `public/persistance-logger.js` (système notifications)
- `public/persistance-logger-integration.js` (hooks automatiques)
- `00_LOGS_NOTIFICATIONS_GUIDE.md` (ce fichier)

**Dernière mise à jour** : 29 Août 2026
