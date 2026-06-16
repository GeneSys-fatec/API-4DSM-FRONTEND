import { API_URL } from "../services/api";
import { useAlertsSSE } from "../services/useAlertsSSE";

export function AlertsSSEListener() {
  useAlertsSSE(API_URL);

  return null;
}