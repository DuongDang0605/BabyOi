import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface Notification extends NotificationPayload {
  id: string;
}

interface NotificationContextValue {
  showNotification: (payload: NotificationPayload) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const typeStyles = {
  success: {
    borderColor: '#8fd3a7',
    backgroundColor: '#f1fff4',
    icon: '✅',
    titleColor: '#246b3b',
    messageColor: '#3d6f4c',
  },
  error: {
    borderColor: '#ff8fab',
    backgroundColor: '#fff3f5',
    icon: '❌',
    titleColor: '#9d1c32',
    messageColor: '#ad2b42',
  },
  warning: {
    borderColor: '#ffd166',
    backgroundColor: '#fff9e8',
    icon: '⚠️',
    titleColor: '#9c6400',
    messageColor: '#8b5900',
  },
  info: {
    borderColor: '#a7e4f5',
    backgroundColor: '#f1fbff',
    icon: 'ℹ️',
    titleColor: '#1b5f78',
    messageColor: '#2b7094',
  },
} as const;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setNotification(null);
  }, []);

  const showNotification = useCallback((payload: NotificationPayload) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification({
      ...payload,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    });

    timeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, payload.duration ?? 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notification ? (
        <Pressable style={styles.overlay} onPress={dismiss}>
          <View style={[styles.toast, typeStyles[notification.type]]}>
            <Text style={styles.icon}>{typeStyles[notification.type].icon}</Text>
            <View style={styles.toastContent}>
              <Text style={[styles.title, { color: typeStyles[notification.type].titleColor }]}>{notification.title}</Text>
              {notification.message ? (
                <Text style={[styles.message, { color: typeStyles[notification.type].messageColor }]}>{notification.message}</Text>
              ) : null}
            </View>
          </View>
        </Pressable>
      ) : null}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification phải được dùng bên trong NotificationProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  toast: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
