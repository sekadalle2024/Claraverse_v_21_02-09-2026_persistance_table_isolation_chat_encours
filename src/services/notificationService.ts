/**
 * Clara Notification Service (Legacy)
 * 
 * Service de notifications pour NotificationPanel.tsx
 * Système différent de toastNotificationService.ts
 */

export interface ClaraNotification {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'test' | 'activity';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

class NotificationService {
  private notifications: ClaraNotification[] = [];
  private listeners: Array<(notifications: ClaraNotification[]) => void> = [];
  private soundEnabled: boolean = true;

  subscribe(listener: (notifications: ClaraNotification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  getNotifications(): ClaraNotification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  addNotification(notification: Omit<ClaraNotification, 'id' | 'timestamp' | 'read'>): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: ClaraNotification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };
    
    this.notifications.unshift(newNotification);
    this.notifyListeners();
    
    return id;
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }
}

export const notificationService = new NotificationService();
