import type { GeneratedAlertApi } from "./weather-service";

export const DEFAULT_ALERT_DEDUP_WINDOW_MS = 5 * 60 * 1000;

export interface NotificationAlertInput extends GeneratedAlertApi {
  stationId: number;
}

export type AlertSeenMap = Record<string, number>;

export function buildNotificationSignature(alert: NotificationAlertInput): string {
  const normalizedDescription = alert.description
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return `${alert.stationId}:${alert.parameterId}:${alert.status}:${normalizedDescription}`;
}

interface DedupeInput {
  alerts: NotificationAlertInput[];
  seenMap: AlertSeenMap;
  nowMs?: number;
  dedupeWindowMs?: number;
}

interface DedupeOutput {
  acceptedAlerts: NotificationAlertInput[];
  seenMap: AlertSeenMap;
}

export function dedupeGeneratedAlerts({
  alerts,
  seenMap,
  nowMs = Date.now(),
  dedupeWindowMs = DEFAULT_ALERT_DEDUP_WINDOW_MS,
}: DedupeInput): DedupeOutput {
  const acceptedAlerts: NotificationAlertInput[] = [];
  const nextSeenMap: AlertSeenMap = {};

  for (const [signature, timestamp] of Object.entries(seenMap)) {
    if (nowMs - timestamp < dedupeWindowMs) {
      nextSeenMap[signature] = timestamp;
    }
  }

  for (const alert of alerts) {
    const signature = buildNotificationSignature(alert);
    const lastSeenAt = nextSeenMap[signature];

    if (lastSeenAt !== undefined && nowMs - lastSeenAt < dedupeWindowMs) {
      continue;
    }

    nextSeenMap[signature] = nowMs;
    acceptedAlerts.push(alert);
  }

  return {
    acceptedAlerts,
    seenMap: nextSeenMap,
  };
}