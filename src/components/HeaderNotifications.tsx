import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Bell, Check, Trash2, X } from "lucide-react";
import {
  listAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  clearReadAlerts,
  type AlertModel
} from "../services/alert-service";
import { API_URL } from "../services/api";

function formatLocalTime(isoDate?: string) {
  if (!isoDate) return "Data indisponível";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Data inválida";
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function HeaderNotifications() {
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await listAlerts({ limit: 50 }); 
        setAlerts(result.data || []);
      } catch (error) {
        console.error("Erro ao carregar histórico de alertas", error);
      }
    };
    void fetchHistory();

    const eventSource = new EventSource(`${API_URL}/alerts/stream`);

    eventSource.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        const incomingAlerts = Array.isArray(rawData) ? rawData : [rawData];

        setAlerts((currentAlerts) => {
          let hasNew = false;
          const newAlerts = [...currentAlerts];

          incomingAlerts.forEach((incoming) => {
            const exists = newAlerts.some((a) => a.id === String(incoming.id));
            
            if (!exists && !incoming.isRead) {
              hasNew = true;
              
              const station = incoming.stationName || "Estação Desconhecida";
              const title = incoming.titulo || "Alerta Climático";
              const desc = incoming.description || `Medição de ${incoming.measuredValue} fora do limite.`;
              
              toast.error(`${station} - ${title}: ${desc}`, { autoClose: 8000 });

              newAlerts.unshift({
                id: String(incoming.id),
                parameterId: incoming.parameterId || 0,
                measurementId: incoming.measurementId || 0,
                measuredValue: incoming.measuredValue || incoming.triggeredValue || 0,
                occurredAt: incoming.timestamp || incoming.occurredAt || incoming.triggeredAt || new Date().toISOString(),
                description: desc,
                status: incoming.status || "active",
                isRead: false,
                stationName: incoming.idParameter?.idStation?.name ?? "Estação Desconhecida",
                parameterName: incoming.idParameter?.idTypeParam?.name ?? "Parâmetro Desconhecido",
              });
            }
          });

          return hasNew ? newAlerts : currentAlerts;
        });
      } catch (error) {
        console.error("Erro ao processar SSE", error);
      }
    };

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAlertAsRead(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error("Erro ao marcar alerta como lido", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-tecsus-green transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Notificações</h3>
            <div className="flex gap-3">
              <button onClick={async () => { await markAllAlertsAsRead(); setAlerts(alerts.map(a => ({ ...a, isRead: true }))); }} title="Marcar todas como lidas" className="text-gray-500 hover:text-tecsus-green">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={async () => { await clearReadAlerts(); setAlerts(alerts.filter(a => !a.isRead)); }} title="Limpar lidas" className="text-gray-500 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Nenhuma notificação no momento.</div>
            ) : (
              <div className="flex flex-col">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 border-b border-gray-50 flex gap-3 transition-colors ${alert.isRead ? 'bg-white opacity-70' : 'bg-red-50/60'}`}>
                    <div className="flex-1">
                      <p className={`text-sm ${alert.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>{alert.description}</p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {alert.stationName ?? "Estação desconhecida"} • {alert.parameterName ?? "Parâmetro desconhecido"} • {formatLocalTime(alert.occurredAt)}
                      </span>
                    </div>
                    {!alert.isRead && ( <button onClick={() => handleMarkAsRead(alert.id)} className="text-gray-400 hover:text-tecsus-green shrink-0 self-start mt-1" title="Marcar como lida"><X className="w-4 h-4" /></button> )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}