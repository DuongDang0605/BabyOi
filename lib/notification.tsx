import { Ionicons } from '@expo/vector-icons';
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
    borderColor: '#B8EFCF',
    backgroundColor: '#F4FFF8',
    iconName: 'checkmark-circle-outline',
    iconColor: '#5ABF7A',
    bubbleColor: '#E8F9ED',
    titleColor: '#2F6F46',
    messageColor: '#4F7A5C',
  },
  error: {
    borderColor: '#FFD8E5',
    backgroundColor: '#FFF6F8',
    iconName: 'close-circle-outline',
    iconColor: '#F05F78',
    bubbleColor: '#FFF1F4',
    titleColor: '#9D2A42',
    messageColor: '#A74A5C',
  },
  warning: {
    borderColor: '#FFE6BA',
    backgroundColor: '#FFF9EC',
    iconName: 'warning-outline',
    iconColor: '#D46B08',
    bubbleColor: '#FFF1C9',
    titleColor: '#8A5200',
    messageColor: '#9A5A00',
  },
  info: {
    borderColor: '#DDF5FB',
    backgroundColor: '#F2FCFF',
    iconName: 'sparkles-outline',
    iconColor: '#5EC9E8',
    bubbleColor: '#EFFBFF',
    titleColor: '#286A7D',
    messageColor: '#3F7D91',
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
  const currentStyle = notification ? typeStyles[notification.type] : null;

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notification && currentStyle ? (
        <Pressable style={styles.overlay} onPress={dismiss}>
          <View style={[styles.toast, { borderColor: currentStyle.borderColor, backgroundColor: currentStyle.backgroundColor }]}>
            <View style={[styles.iconBubble, { backgroundColor: currentStyle.bubbleColor }]}>
              <Ionicons name={currentStyle.iconName} size={22} color={currentStyle.iconColor} />
            </View>
            <View style={styles.toastContent}>
              <Text style={[styles.title, { color: currentStyle.titleColor }]}>{notification.title}</Text>
              {notification.message ? (
                <Text style={[styles.message, { color: currentStyle.messageColor }]}>{notification.message}</Text>
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
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  toastContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
  },
  message: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
});
