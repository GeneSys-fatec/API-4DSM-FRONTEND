import { useEffect } from "react";
import { toast } from "react-toastify";

export interface AlertPayload {
  id: string | number;
  parameterId?: number;
  triggeredValue?: number | string;
  status?: string;
  titulo?: string;
  texto?: string;
  description?: string;
  isRead?: boolean;
  occurredAt?: string;
}

const displayedNotifications = new Set<string>();

export function useAlertsSSE(apiUrl: string) {
  useEffect(() => {
    const eventSource = new EventSource(`${apiUrl}/alerts/stream`);

    eventSource.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        
        const alerts: AlertPayload[] = Array.isArray(rawData) ? rawData : [rawData];

        alerts.forEach((alertData) => {
          if (alertData.isRead) return;

          const notificationKey = `@ClimaSense:alert_notified_${alertData.id}_${alertData.occurredAt}_${alertData.triggeredValue}`;
          
          if (!displayedNotifications.has(notificationKey)) {
            displayedNotifications.add(notificationKey);

            const titulo = alertData.titulo || "Alerta Climático";
            const descricao = alertData.description || alertData.texto || "Valores medidos fora do limite.";

            toast.warning(`${titulo}: ${descricao}`, {
              autoClose: 10000,
              onClose: () => {
                fetch(`${apiUrl}/alerts/${alertData.id}/read`, { method: 'PATCH' }).catch(console.error);
              }
            });

          }
        });
      } catch (error) {
        console.error("Erro ao fazer parse dos dados do alerta SSE:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Erro na conexão com os alertas em tempo real (SSE). Tentando reconectar...", error);
    };

    return () => {
      eventSource.close();
    };
  }, [apiUrl]);
}
