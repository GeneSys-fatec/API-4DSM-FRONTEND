import { useState, useRef, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAlertNotifications } from "../contexts/alert-notifications-context";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export function Header({ toggleMobileMenu }: HeaderProps) {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);
  
  const { isAuthenticated } = useAuth(); 
  
  const {
    notifications,
    unseenCount,
    markAllAsSeen,
    clearNotifications,
  } = useAlertNotifications();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!notificationPanelRef.current) return;
      if (notificationPanelRef.current.contains(event.target as Node)) return;
      setIsNotificationPanelOpen(false);
    };

    if (isNotificationPanelOpen) {
      window.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isNotificationPanelOpen]);

  const handleToggleNotificationPanel = () => {
    setIsNotificationPanelOpen((current) => {
      const next = !current;
      if (next) {
        markAllAsSeen();
      }
      return next;
    });
  };

  const formatDateTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="bg-tecsus-green text-white h-16 px-4 md:px-8 flex items-center justify-between shadow-md shrink-0 relative">
      <div className="flex items-center md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <h1 className="text-xl font-kodchasan font-bold tracking-tighter subpixel-antialiased absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:left-auto">
        {isAuthenticated ? "Tecsus Admin" : "Tecsus"}
      </h1>

      <div className="flex items-center gap-3 md:gap-5 ml-auto md:ml-0" ref={notificationPanelRef}>
        
        {/* Botão Dinâmico de Navegação */}
        {isAuthenticated ? (
          <Link
            to="/admin/selecionar-estacao"
            className="text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors hidden md:block"
          >
            Painel Admin
          </Link>
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium bg-white text-tecsus-green hover:bg-gray-100 px-3 py-1 rounded-full transition-colors shadow-sm"
          >
            Login
          </Link>
        )}

        {/* Notificações (Visível Apenas para Admin) */}
        {isAuthenticated && (
          <>
            <button
              onClick={handleToggleNotificationPanel}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unseenCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {unseenCount > 99 ? "99+" : unseenCount}
                </span>
              )}
            </button>

            {isNotificationPanelOpen && (
              <div className="absolute top-[68px] right-4 md:right-8 w-[min(92vw,24rem)] rounded-xl bg-white text-gray-800 shadow-xl border border-gray-200 z-[60]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-bold">Notificações</h2>
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      onClick={markAllAsSeen}
                      className="text-tecsus-green hover:underline"
                      type="button"
                    >
                      Marcar lidas
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="text-gray-500 hover:text-gray-700 hover:underline"
                      type="button"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-500 text-center">
                      Nenhuma notificação no momento.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={`${notification.stationId}-${notification.id}-${notification.receivedAt}`}
                        className="px-4 py-3 border-b last:border-b-0 border-gray-100"
                      >
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Estação {notification.stationId} • Parâmetro #{notification.parameterId} • {formatDateTime(notification.occurredAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}