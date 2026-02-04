import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock notification types
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

// Simple in-memory notification store for testing
class NotificationStore {
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  addNotification(notification: Omit<Notification, 'id'>): string {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    this.notifications.set(id, fullNotification);
    this.notifyListeners();
    return id;
  }

  removeNotification(id: string): void {
    this.notifications.delete(id);
    this.notifyListeners();
  }

  getNotifications(): Notification[] {
    return Array.from(this.notifications.values());
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const notifications = this.getNotifications();
    this.listeners.forEach((listener) => listener(notifications));
  }

  clear(): void {
    this.notifications.clear();
    this.notifyListeners();
  }
}

describe('Notification System', () => {
  let store: NotificationStore;

  beforeEach(() => {
    store = new NotificationStore();
  });

  it('should add a success notification', () => {
    const id = store.addNotification({
      type: 'success',
      title: 'Success',
      message: 'Operation completed',
    });

    const notifications = store.getNotifications();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].title).toBe('Success');
    expect(notifications[0].id).toBe(id);
  });

  it('should add an error notification', () => {
    const id = store.addNotification({
      type: 'error',
      title: 'Error',
      message: 'Something went wrong',
    });

    const notifications = store.getNotifications();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('error');
  });

  it('should add a warning notification', () => {
    const id = store.addNotification({
      type: 'warning',
      title: 'Warning',
      message: 'Please be careful',
    });

    const notifications = store.getNotifications();
    expect(notifications[0].type).toBe('warning');
  });

  it('should add an info notification', () => {
    const id = store.addNotification({
      type: 'info',
      title: 'Info',
      message: 'Here is some information',
    });

    const notifications = store.getNotifications();
    expect(notifications[0].type).toBe('info');
  });

  it('should set default duration to 5000ms', () => {
    store.addNotification({
      type: 'success',
      title: 'Test',
    });

    const notifications = store.getNotifications();
    expect(notifications[0].duration).toBe(5000);
  });

  it('should allow custom duration', () => {
    store.addNotification({
      type: 'success',
      title: 'Test',
      duration: 10000,
    });

    const notifications = store.getNotifications();
    expect(notifications[0].duration).toBe(10000);
  });

  it('should allow no auto-dismiss with duration 0', () => {
    store.addNotification({
      type: 'success',
      title: 'Test',
      duration: 0,
    });

    const notifications = store.getNotifications();
    expect(notifications[0].duration).toBe(0);
  });

  it('should remove a notification', () => {
    const id = store.addNotification({
      type: 'success',
      title: 'Test',
    });

    expect(store.getNotifications()).toHaveLength(1);
    store.removeNotification(id);
    expect(store.getNotifications()).toHaveLength(0);
  });

  it('should handle multiple notifications', () => {
    const id1 = store.addNotification({
      type: 'success',
      title: 'First',
    });
    const id2 = store.addNotification({
      type: 'error',
      title: 'Second',
    });
    const id3 = store.addNotification({
      type: 'warning',
      title: 'Third',
    });

    expect(store.getNotifications()).toHaveLength(3);

    store.removeNotification(id2);
    expect(store.getNotifications()).toHaveLength(2);
    expect(store.getNotifications().some((n) => n.id === id2)).toBe(false);
  });

  it('should clear all notifications', () => {
    store.addNotification({ type: 'success', title: 'First' });
    store.addNotification({ type: 'error', title: 'Second' });
    store.addNotification({ type: 'warning', title: 'Third' });

    expect(store.getNotifications()).toHaveLength(3);
    store.clear();
    expect(store.getNotifications()).toHaveLength(0);
  });

  it('should notify subscribers when notification is added', () => {
    const listener = vi.fn();
    store.subscribe(listener);

    store.addNotification({ type: 'success', title: 'Test' });

    expect(listener).toHaveBeenCalled();
    expect(listener).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        type: 'success',
        title: 'Test',
      }),
    ]));
  });

  it('should notify subscribers when notification is removed', () => {
    const listener = vi.fn();
    const id = store.addNotification({ type: 'success', title: 'Test' });
    
    listener.mockClear();
    store.subscribe(listener);
    store.removeNotification(id);

    expect(listener).toHaveBeenCalled();
    expect(listener).toHaveBeenCalledWith([]);
  });

  it('should allow unsubscribing from notifications', () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.addNotification({ type: 'success', title: 'Test' });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.addNotification({ type: 'success', title: 'Test 2' });
    expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it('should generate unique IDs for each notification', () => {
    const id1 = store.addNotification({ type: 'success', title: 'First' });
    const id2 = store.addNotification({ type: 'success', title: 'Second' });

    expect(id1).not.toBe(id2);
    expect(store.getNotifications()).toHaveLength(2);
  });

  it('should support optional message field', () => {
    store.addNotification({
      type: 'success',
      title: 'No Message',
    });

    const notifications = store.getNotifications();
    expect(notifications[0].message).toBeUndefined();
  });

  it('should handle notification with long message', () => {
    const longMessage = 'a'.repeat(500);
    store.addNotification({
      type: 'success',
      title: 'Long Message',
      message: longMessage,
    });

    const notifications = store.getNotifications();
    expect(notifications[0].message).toBe(longMessage);
    expect(notifications[0].message?.length).toBe(500);
  });
});
