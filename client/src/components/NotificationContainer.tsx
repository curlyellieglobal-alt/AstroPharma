import { useNotification, NotificationType } from '@/contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const typeConfig: Record<NotificationType, { bg: string; border: string; icon: React.ReactNode; title: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    title: 'Success',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    title: 'Error',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    title: 'Warning',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Info className="h-5 w-5 text-blue-600" />,
    title: 'Info',
  },
};

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => {
        const config = typeConfig[notification.type];
        return (
          <div
            key={notification.id}
            className={`${config.bg} border ${config.border} rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900">
                  {notification.title}
                </h3>
                {notification.message && (
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close notification"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
