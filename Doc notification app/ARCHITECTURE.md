# Architecture - Système de Notifications Toast

## 📐 Vue d'ensemble

Le système de notifications toast est composé de deux services distincts pour gérer différents types de notifications dans l'application.

## 🏗️ Architecture des services

```
┌─────────────────────────────────────────────────────────────┐
│                      Application React                       │
│                         (App.tsx)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─────────────────────────────────────┐
                         │                                     │
                         ▼                                     ▼
         ┌───────────────────────────┐         ┌──────────────────────────┐
         │  NotificationContainer    │         │   NotificationPanel      │
         │      (Toast UI)           │         │    (Legacy UI)           │
         └───────────┬───────────────┘         └──────────┬───────────────┘
                     │                                    │
                     ▼                                    ▼
    ┌────────────────────────────┐         ┌─────────────────────────────┐
    │ toastNotificationService   │         │   notificationService       │
    │   (Nouveau système)        │         │   (Système legacy)          │
    └────────────────────────────┘         └─────────────────────────────┘
```

## 📦 Composants principaux

### 1. toastNotificationService.ts

**Rôle**: Service de notifications toast pour les informations de routing n8n

**Exports**:
```typescript
// Types
export type NotificationType = 'info' | 'success' | 'error' | 'warning';
export interface Notification { ... }

// Fonctions principales
export function addInfoNotification(title, message, duration)
export function addSuccessNotification(title, message, duration)
export function addErrorNotification(title, message, duration)
export function addWarningNotification(title, message, duration)
export function addCompletionNotification(title, message, duration)
export function addBackgroundCompletionNotification(title, message)

// Gestion
export function subscribeToNotifications(listener)
export function removeNotification(id)
export function clearAllNotifications()

// Objet pour compatibilité
export const notificationService = { ... }
```

**Caractéristiques**:
- Notifications éphémères (auto-fermeture)
- Système d'abonnement pour les mises à jour
- Support de durées personnalisées
- Notifications persistantes (duration = 0)

### 2. notificationService.ts

**Rôle**: Service legacy pour NotificationPanel (système existant)

**Exports**:
```typescript
// Types
export interface ClaraNotification { ... }

// Classe singleton
export const notificationService = new NotificationService()
```

**Caractéristiques**:
- Système de lecture/non-lu
- Compteur de notifications non lues
- Support du son
- Actions personnalisées

### 3. NotificationContainer.tsx

**Rôle**: Composant React pour afficher les notifications toast

**Props**: Aucune (utilise le contexte global)

**Fonctionnalités**:
- Affichage en haut à droite
- Animation d'entrée/sortie
- Bouton de fermeture
- Support multi-lignes
- Icônes par type

**Structure**:
```tsx
<div className="notification-container">
  {notifications.map(notification => (
    <div className={`notification notification-${type}`}>
      <div className="notification-header">
        <span className="notification-icon">{icon}</span>
        <span className="notification-title">{title}</span>
        <button className="notification-close">×</button>
      </div>
      <div className="notification-message">{message}</div>
    </div>
  ))}
</div>
```

## 🔄 Flux de données

### Affichage d'une notification

```
1. claraApiService.ts
   └─> addInfoNotification("Router N8N", "Case 23 : recos_revision\n🌐 https://...")
       │
2. toastNotificationService.ts
   ├─> Crée un objet Notification avec ID unique
   ├─> Ajoute à la liste des notifications
   ├─> Notifie tous les listeners
   └─> Programme l'auto-suppression (setTimeout)
       │
3. NotificationContainer.tsx
   ├─> Reçoit la mise à jour via subscribeToNotifications
   ├─> Met à jour le state React
   └─> Affiche la notification
       │
4. Après 7 secondes (ou clic sur ×)
   └─> removeNotification(id)
       └─> Notification disparaît
```

## 🎨 Styles CSS

### Structure des classes

```css
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.notification {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-bottom: 10px;
  animation: slideIn 0.3s ease-out;
}

.notification-info { border-left: 4px solid #3b82f6; }
.notification-success { border-left: 4px solid #10b981; }
.notification-error { border-left: 4px solid #ef4444; }
.notification-warning { border-left: 4px solid #f59e0b; }
```

## 🔌 Intégration dans App.tsx

```tsx
import NotificationContainer from './components/NotificationContainer';

function App() {
  return (
    <ProvidersProvider>
      <div className="min-h-screen">
        {/* Contenu de l'application */}
        
        {/* Notification Container - toujours rendu */}
        <NotificationContainer />
      </div>
    </ProvidersProvider>
  );
}
```

## 📊 Utilisation dans claraApiService.ts

```typescript
import { addInfoNotification } from "./toastNotificationService";

// Dans la méthode sendMessage
const routingInfo = this.getN8nEndpointWithInfo(message);
const resolvedEndpoint = routingInfo.endpoint;

// Affichage de la notification
addInfoNotification(
  "🔀 Router N8N",
  `${routingInfo.caseName} : ${routingInfo.routeKey}\n🌐 ${resolvedEndpoint}`,
  7000
);
```

## 🔒 Séparation des préoccupations

### Pourquoi deux services ?

1. **toastNotificationService** (nouveau)
   - Notifications éphémères
   - Informations de routing
   - Système simple et léger

2. **notificationService** (legacy)
   - Notifications persistantes
   - Système de lecture/non-lu
   - Intégration avec NotificationPanel existant

Cette séparation évite les conflits et permet:
- Compatibilité avec le code existant
- Évolution indépendante des deux systèmes
- Pas de régression sur les fonctionnalités existantes

## 🚀 Performance

### Optimisations

1. **Listeners**: Système d'abonnement efficace
2. **Auto-nettoyage**: setTimeout pour supprimer automatiquement
3. **React memo**: Pas de re-render inutile
4. **CSS animations**: Utilisation de transform pour de meilleures performances

### Limites

- Pas de limite sur le nombre de notifications simultanées
- Pas de file d'attente (toutes affichées immédiatement)
- Pas de persistance (disparaissent au rechargement)

## 🔮 Évolutions possibles

1. **File d'attente**: Limiter le nombre de notifications visibles
2. **Persistance**: Sauvegarder dans localStorage
3. **Positions**: Permettre différentes positions (top-left, bottom-right, etc.)
4. **Animations**: Plus d'options d'animation
5. **Sons**: Support optionnel de sons de notification
6. **Actions**: Boutons d'action dans les notifications
