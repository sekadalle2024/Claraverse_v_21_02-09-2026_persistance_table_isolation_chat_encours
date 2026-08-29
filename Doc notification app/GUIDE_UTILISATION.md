# Guide d'utilisation - Système de Notifications Toast

## 🎯 Introduction

Ce guide explique comment utiliser le système de notifications toast dans ClaraVerse.

## 📦 Import du service

```typescript
import { 
  addInfoNotification,
  addSuccessNotification,
  addErrorNotification,
  addWarningNotification,
  addCompletionNotification,
  addBackgroundCompletionNotification
} from './services/toastNotificationService';
```

## 🔔 Types de notifications

### 1. Notification d'information (Info)

**Usage**: Informations générales, routing, statuts

```typescript
addInfoNotification(
  "Titre de la notification",
  "Message détaillé",
  5000 // Durée en millisecondes (optionnel, défaut: 5000)
);
```

**Exemple concret**:
```typescript
addInfoNotification(
  "🔀 Router N8N",
  `Case 23 : recos_revision\n🌐 https://t22wtwxl.rpcld.app/webhook/recos_revision`,
  7000
);
```

**Apparence**: Bordure bleue, icône ℹ️

---

### 2. Notification de succès (Success)

**Usage**: Opérations réussies, confirmations

```typescript
addSuccessNotification(
  "Opération réussie",
  "Les données ont été sauvegardées avec succès",
  5000
);
```

**Exemple concret**:
```typescript
addSuccessNotification(
  "✅ Fichier uploadé",
  "Le fichier balance.xlsx a été importé avec succès",
  6000
);
```

**Apparence**: Bordure verte, icône ✅

---

### 3. Notification d'erreur (Error)

**Usage**: Erreurs, échecs d'opération

```typescript
addErrorNotification(
  "Erreur",
  "Impossible de se connecter au serveur",
  8000 // Durée plus longue pour les erreurs
);
```

**Exemple concret**:
```typescript
addErrorNotification(
  "❌ Erreur de connexion",
  "Le serveur n8n ne répond pas. Vérifiez votre connexion.",
  10000
);
```

**Apparence**: Bordure rouge, icône ❌

---

### 4. Notification d'avertissement (Warning)

**Usage**: Avertissements, actions à confirmer

```typescript
addWarningNotification(
  "Attention",
  "Cette action est irréversible",
  6000
);
```

**Exemple concret**:
```typescript
addWarningNotification(
  "⚠️ Données manquantes",
  "Certains champs obligatoires ne sont pas remplis",
  7000
);
```

**Apparence**: Bordure orange, icône ⚠️

---

### 5. Notification de complétion (Completion)

**Usage**: Fin de processus longs, tâches terminées

```typescript
addCompletionNotification(
  "Traitement terminé",
  "L'analyse des données est complète",
  10000 // Durée plus longue
);
```

**Exemple concret**:
```typescript
addCompletionNotification(
  "🎉 Export terminé",
  "Le rapport CAC a été généré et téléchargé",
  12000
);
```

**Apparence**: Bordure verte, icône ✅, durée plus longue

---

### 6. Notification persistante (Background Completion)

**Usage**: Notifications importantes qui ne doivent pas disparaître automatiquement

```typescript
addBackgroundCompletionNotification(
  "Clara Response Ready",
  "Clara a terminé de répondre à votre question"
  // Pas de durée - la notification reste jusqu'à fermeture manuelle
);
```

**Caractéristique**: Ne se ferme PAS automatiquement, l'utilisateur doit cliquer sur ×

---

## 🎨 Formatage du message

### Messages multi-lignes

Utilisez `\n` pour les sauts de ligne:

```typescript
addInfoNotification(
  "Informations de routing",
  `Case: 23
Route: recos_revision
URL: https://t22wtwxl.rpcld.app/webhook/recos_revision`
);
```

### Emojis

Les emojis sont supportés:

```typescript
addSuccessNotification(
  "✅ Succès",
  "🎉 Opération terminée avec succès!"
);
```

### Texte long

Les messages longs sont automatiquement wrappés:

```typescript
addInfoNotification(
  "Information détaillée",
  "Ceci est un message très long qui sera automatiquement wrappé sur plusieurs lignes pour une meilleure lisibilité dans la notification."
);
```

---

## ⏱️ Gestion de la durée

### Durées recommandées

| Type | Durée recommandée | Raison |
|------|-------------------|--------|
| Info | 5000ms (5s) | Lecture rapide |
| Success | 5000ms (5s) | Confirmation rapide |
| Error | 8000ms (8s) | Temps de lecture de l'erreur |
| Warning | 6000ms (6s) | Temps d'attention |
| Completion | 10000ms (10s) | Célébration du succès |
| Background | 0 (infini) | Notification importante |

### Durée personnalisée

```typescript
// Notification très rapide (2 secondes)
addInfoNotification("Info rapide", "Message court", 2000);

// Notification longue (15 secondes)
addErrorNotification("Erreur critique", "Message détaillé", 15000);

// Notification persistante
addInfoNotification("Important", "Cliquez pour fermer", 0);
```

---

## 🔄 Gestion avancée

### Récupérer l'ID de la notification

```typescript
const notificationId = addInfoNotification(
  "Titre",
  "Message"
);

console.log("Notification créée:", notificationId);
```

### Fermer une notification manuellement

```typescript
import { removeNotification } from './services/toastNotificationService';

const id = addInfoNotification("Titre", "Message");

// Fermer après 3 secondes
setTimeout(() => {
  removeNotification(id);
}, 3000);
```

### Fermer toutes les notifications

```typescript
import { clearAllNotifications } from './services/toastNotificationService';

// Fermer toutes les notifications actives
clearAllNotifications();
```

### S'abonner aux changements

```typescript
import { subscribeToNotifications } from './services/toastNotificationService';

const unsubscribe = subscribeToNotifications((notifications) => {
  console.log("Notifications actives:", notifications.length);
  notifications.forEach(n => {
    console.log(`- ${n.title}: ${n.message}`);
  });
});

// Se désabonner plus tard
unsubscribe();
```

---

## 📍 Cas d'usage courants

### 1. Notification de routing n8n

```typescript
const routingInfo = this.getN8nEndpointWithInfo(message);

addInfoNotification(
  "🔀 Router N8N",
  `${routingInfo.caseName} : ${routingInfo.routeKey}\n🌐 ${resolvedEndpoint}`,
  7000
);
```

### 2. Confirmation d'upload

```typescript
try {
  await uploadFile(file);
  addSuccessNotification(
    "✅ Fichier uploadé",
    `${file.name} a été importé avec succès`
  );
} catch (error) {
  addErrorNotification(
    "❌ Erreur d'upload",
    `Impossible d'importer ${file.name}: ${error.message}`
  );
}
```

### 3. Progression de traitement

```typescript
// Début
addInfoNotification(
  "⏳ Traitement en cours",
  "Analyse des données..."
);

// Fin
addCompletionNotification(
  "✅ Traitement terminé",
  "L'analyse est complète. 150 lignes traitées."
);
```

### 4. Avertissement avant action

```typescript
function deleteData() {
  addWarningNotification(
    "⚠️ Confirmation requise",
    "Êtes-vous sûr de vouloir supprimer ces données?",
    8000
  );
}
```

### 5. Notification de Clara en arrière-plan

```typescript
// Quand Clara termine une réponse en arrière-plan
addBackgroundCompletionNotification(
  "Clara Response Ready",
  `Clara a terminé de répondre à: "${userMessage.slice(0, 40)}..."`
);
```

---

## 🎨 Personnalisation CSS

### Modifier les couleurs

Éditez `src/components/NotificationContainer.css`:

```css
.notification-info {
  border-left-color: #3b82f6; /* Bleu */
}

.notification-success {
  border-left-color: #10b981; /* Vert */
}

.notification-error {
  border-left-color: #ef4444; /* Rouge */
}

.notification-warning {
  border-left-color: #f59e0b; /* Orange */
}
```

### Modifier la position

```css
.notification-container {
  position: fixed;
  top: 20px;      /* Changer pour bottom: 20px */
  right: 20px;    /* Changer pour left: 20px */
  z-index: 9999;
}
```

### Modifier l'animation

```css
@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## ⚠️ Bonnes pratiques

### ✅ À faire

1. **Utiliser le bon type de notification**
   ```typescript
   // Bon
   addSuccessNotification("Succès", "Opération réussie");
   
   // Mauvais
   addInfoNotification("Succès", "Opération réussie");
   ```

2. **Messages clairs et concis**
   ```typescript
   // Bon
   addErrorNotification("Erreur de connexion", "Le serveur ne répond pas");
   
   // Mauvais
   addErrorNotification("Erreur", "Une erreur s'est produite");
   ```

3. **Durées appropriées**
   ```typescript
   // Bon - Erreur avec durée longue
   addErrorNotification("Erreur", "Message d'erreur détaillé", 8000);
   
   // Mauvais - Erreur avec durée trop courte
   addErrorNotification("Erreur", "Message d'erreur détaillé", 2000);
   ```

### ❌ À éviter

1. **Trop de notifications simultanées**
   ```typescript
   // Mauvais - Spam de notifications
   for (let i = 0; i < 10; i++) {
     addInfoNotification("Info", `Message ${i}`);
   }
   ```

2. **Messages trop longs**
   ```typescript
   // Mauvais - Message trop long
   addInfoNotification(
     "Titre",
     "Ceci est un message extrêmement long qui contient beaucoup trop d'informations..."
   );
   ```

3. **Notifications pour chaque action**
   ```typescript
   // Mauvais - Trop de notifications
   onClick() {
     addInfoNotification("Clic", "Vous avez cliqué");
   }
   ```

---

## 🐛 Débogage

### Vérifier si les notifications s'affichent

```typescript
// Ajouter dans la console du navigateur
import { getNotifications } from './services/toastNotificationService';

console.log("Notifications actives:", getNotifications());
```

### Tester une notification

```typescript
// Dans la console du navigateur
window.testNotification = () => {
  addInfoNotification("Test", "Ceci est un test");
};

// Puis exécuter
testNotification();
```

### Vérifier les listeners

```typescript
// Compter les listeners actifs
console.log("Listeners:", listeners.length);
```

---

## 📚 Ressources

- **Architecture**: Voir `ARCHITECTURE.md`
- **Problèmes**: Voir `PROBLEMES_ET_SOLUTIONS.md`
- **Exemples**: Voir `EXEMPLES.md`
- **Code source**: 
  - `src/services/toastNotificationService.ts`
  - `src/components/NotificationContainer.tsx`
  - `src/components/NotificationContainer.css`
