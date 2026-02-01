import { useNotification } from '@/contexts/NotificationContext';

export function useNotificationHelper() {
  const { addNotification } = useNotification();

  return {
    success: (title: string, message?: string) =>
      addNotification({
        type: 'success',
        title,
        message,
        duration: 5000,
      }),
    error: (title: string, message?: string) =>
      addNotification({
        type: 'error',
        title,
        message,
        duration: 5000,
      }),
    warning: (title: string, message?: string) =>
      addNotification({
        type: 'warning',
        title,
        message,
        duration: 5000,
      }),
    info: (title: string, message?: string) =>
      addNotification({
        type: 'info',
        title,
        message,
        duration: 5000,
      }),
    // Persistent notification (no auto-dismiss)
    persistent: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) =>
      addNotification({
        type,
        title,
        message,
        duration: 0,
      }),
  };
}
