/**
 * Notification Container Component
 * 
 * Affiche les notifications toast en haut à droite de l'écran
 */

import React, { useEffect, useState } from 'react';
import {
  subscribeToNotifications,
  removeNotification,
  type Notification,
} from '../services/toastNotificationService';
import './NotificationContainer.css';

export const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // S'abonner aux changements de notifications
    const unsubscribe = subscribeToNotifications((newNotifications) => {
      setNotifications(newNotifications);
    });

    // Se désabonner au démontage
    return unsubscribe;
  }, []);

  const handleClose = (id: string) => {
    removeNotification(id);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          role="alert"
        >
          <div className="notification-header">
            <span className="notification-icon">
              {notification.type === 'info' && 'ℹ️'}
              {notification.type === 'success' && '✅'}
              {notification.type === 'error' && '❌'}
              {notification.type === 'warning' && '⚠️'}
            </span>
            <span className="notification-title">{notification.title}</span>
            <button
              className="notification-close"
              onClick={() => handleClose(notification.id)}
              aria-label="Fermer la notification"
            >
              ×
            </button>
          </div>
          <div className="notification-message">
            {notification.message.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < notification.message.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
