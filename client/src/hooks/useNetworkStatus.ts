import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  reconnectAttempts: number;
}

/**
 * Hook to monitor network connectivity status
 * Detects online/offline transitions and tracks reconnection attempts
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    wasOffline: false,
    reconnectAttempts: 0,
  });

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Connection restored');
      setStatus(prev => ({
        isOnline: true,
        wasOffline: prev.wasOffline || !prev.isOnline,
        reconnectAttempts: prev.reconnectAttempts,
      }));
    };

    const handleOffline = () => {
      console.log('[Network] Connection lost');
      setStatus(prev => ({
        isOnline: false,
        wasOffline: true,
        reconnectAttempts: prev.reconnectAttempts,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const incrementReconnectAttempts = () => {
    setStatus(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1,
    }));
  };

  const resetReconnectAttempts = () => {
    setStatus(prev => ({
      ...prev,
      reconnectAttempts: 0,
      wasOffline: false,
    }));
  };

  return {
    ...status,
    incrementReconnectAttempts,
    resetReconnectAttempts,
  };
}
