import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  dedupeGeneratedAlerts,
  type AlertSeenMap,
  type NotificationAlertInput,
} from "../services/alert-notification-utils";
import type { GeneratedAlertApi } from "../services/weather-service";

const MAX_NOTIFICATIONS = 30;

export interface AlertNotificationItem extends NotificationAlertInput {
  receivedAt: string;
}

interface AlertNotificationsContextValue {
  notifications: AlertNotificationItem[];
  unseenCount: number;
  registerGeneratedAlerts: (
    stationId: number,
    alerts: GeneratedAlertApi[],
  ) => AlertNotificationItem[];
  markAllAsSeen: () => void;
  clearNotifications: () => void;
}

const AlertNotificationsContext =
  createContext<AlertNotificationsContextValue | null>(null);

export function AlertNotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AlertNotificationItem[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const seenMapRef = useRef<AlertSeenMap>({});

  const registerGeneratedAlerts = useCallback((
    stationId: number,
    alerts: GeneratedAlertApi[],
  ): AlertNotificationItem[] => {
    if (alerts.length === 0) return [];

    const rawNotifications: NotificationAlertInput[] = alerts.map((alert) => ({
      ...alert,
      stationId,
    }));

    const { acceptedAlerts, seenMap: nextSeenMap } = dedupeGeneratedAlerts({
      alerts: rawNotifications,
      seenMap: seenMapRef.current,
    });

    if (acceptedAlerts.length === 0) {
      return [];
    }

    seenMapRef.current = nextSeenMap;

    const timestamp = new Date().toISOString();
    const received = acceptedAlerts.map((alert) => ({
      ...alert,
      receivedAt: timestamp,
    }));

    setNotifications((current) => [...received, ...current].slice(0, MAX_NOTIFICATIONS));
    setUnseenCount((current) => Math.min(current + received.length, MAX_NOTIFICATIONS));

    return received;
  }, []);

  const markAllAsSeen = () => {
    setUnseenCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnseenCount(0);
    seenMapRef.current = {};
  };

  const value = useMemo(
    () => ({
      notifications,
      unseenCount,
      registerGeneratedAlerts,
      markAllAsSeen,
      clearNotifications,
    }),
    [notifications, unseenCount, registerGeneratedAlerts],
  );

  return (
    <AlertNotificationsContext.Provider value={value}>
      {children}
    </AlertNotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAlertNotifications() {
  const context = useContext(AlertNotificationsContext);

  if (!context) {
    throw new Error("useAlertNotifications must be used within AlertNotificationsProvider");
  }

  return context;
}