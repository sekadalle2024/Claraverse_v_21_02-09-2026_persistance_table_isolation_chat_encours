/**
 * Notification Service
 * 
 * Service pour afficher des notifications toast dans l'application
 */

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration: number;
  timestamp: Date;
}

// Store pour les notifications
let notifications: Notification[] = [];
let listeners: Array<(notifications: Notification[]) => void> = [];

/**
 * Ajoute un listener pour les changements de notifications
 */
export function subscribeToNotifications(
  listener: (notifications: Notification[]) => void
): () => void {
  listeners.push(listener);
  
  // Retourne une fonction pour se désabonner
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

/**
 * Notifie tous les listeners
 */
function notifyListeners() {
  listeners.forEach(listener => listener([...notifications]));
}

/**
 * Ajoute une notification
 */
function addNotification(
  type: NotificationType,
  title: string,
  message: string,
  duration: number = 5000
): string {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const notification: Notification = {
    id,
    type,
    title,
    message,
    duration,
    timestamp: new Date(),
  };
  
  notifications.push(notification);
  notifyListeners();
  
  // Auto-suppression après la durée spécifiée
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }
  
  console.log(`📢 Notification ${type}:`, { title, message, duration });
  
  return id;
}

/**
 * Supprime une notification
 */
export function removeNotification(id: string): void {
  notifications = notifications.filter(n => n.id !== id);
  notifyListeners();
}

/**
 * Récupère toutes les notifications actives
 */
export function getNotifications(): Notification[] {
  return [...notifications];
}

/**
 * Supprime toutes les notifications
 */
export function clearAllNotifications(): void {
  notifications = [];
  notifyListeners();
}

/**
 * Ajoute une notification d'information
 */
export function addInfoNotification(
  title: string,
  message: string,
  duration: number = 5000
): string {
  return addNotification('info', title, message, duration);
}

/**
 * Ajoute une notification de succès
 */
export function addSuccessNotification(
  title: string,
  message: string,
  duration: number = 5000
): string {
  return addNotification('success', title, message, duration);
}

/**
 * Ajoute une notification d'erreur
 */
export function addErrorNotification(
  title: string,
  message: string,
  duration: number = 8000
): string {
  return addNotification('error', title, message, duration);
}

/**
 * Ajoute une notification d'avertissement
 */
export function addWarningNotification(
  title: string,
  message: string,
  duration: number = 6000
): string {
  return addNotification('warning', title, message, duration);
}

/**
 * Ajoute une notification de complétion (succès avec durée plus longue)
 */
export function addCompletionNotification(
  title: string,
  message: string,
  duration: number = 10000
): string {
  return addNotification('success', title, message, duration);
}

/**
 * Ajoute une notification de complétion en arrière-plan (persistante)
 * Cette notification ne se ferme pas automatiquement
 */
export function addBackgroundCompletionNotification(
  title: string,
  message: string
): string {
  return addNotification('success', title, message, 0); // duration = 0 = pas d'auto-fermeture
}

// Export d'un objet notificationService pour compatibilité avec certains composants
export const notificationService = {
  subscribe: subscribeToNotifications,
  getNotifications,
  clearAll: clearAllNotifications,
  addInfo: addInfoNotification,
  addSuccess: addSuccessNotification,
  addError: addErrorNotification,
  addWarning: addWarningNotification,
  addCompletion: addCompletionNotification,
  addBackgroundCompletion: addBackgroundCompletionNotification,
  remove: removeNotification,
};
