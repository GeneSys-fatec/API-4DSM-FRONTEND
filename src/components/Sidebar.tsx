import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wifi,
  AlertCircle,
  Users,
  HelpCircle,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const menuItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/estacoes", icon: Wifi, label: "Estações" },
    { to: "/admin/limites", icon: AlertCircle, label: "Limites" },
    { to: "/admin/cadastrar", icon: Users, label: "Cadastrar Administrador" },
  ];

  const bottomItems = [
    { to: "/admin/help", icon: HelpCircle, label: "Help" },
    { to: "/logout", icon: LogOut, label: "Log out" },
  ];

  return (
    <aside className="group flex flex-col w-20 hover:w-72 transition-all duration-300 ease-in-out bg-white border-r border-gray-100 z-20 h-full overflow-hidden shrink-0 py-6">
      
      {/* Área do Logo - Arquitetura de Canal (w-10 centralizado) */}
      <div className="flex items-center mx-2 px-3 mb-8 shrink-0">
        <div className="w-10 flex justify-center shrink-0">
          {/* Pode mudar o tamanho do Avatar livremente (w-8, w-10, w-12), ele sempre ficará no centro */}
          <div className="w-10 h-10 rounded-xl bg-tecsus-green text-white flex items-center justify-center font-bold shadow-sm">
            A
          </div>
        </div>
        <div className="flex flex-col pl-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-sm font-bold text-gray-900">
            Nome Administrador
          </span>
          <span className="text-xs text-gray-500">adm@email.com</span>
        </div>
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center py-3 mx-2 px-3 rounded-xl transition-all ${
                isActive
                  ? "bg-[#e8f5e9] text-tecsus-green font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {/* O mesmo Canal (w-10 centralizado) garante que o ícone fique na exata mesma linha reta do Avatar */}
            <div className="w-10 flex justify-center shrink-0">
              <item.icon className="w-5 h-5" />
            </div>
            <span className="whitespace-nowrap pl-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Menu Inferior */}
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 pb-2">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center py-3 mx-2 px-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <div className="w-10 flex justify-center shrink-0">
              <item.icon className="w-5 h-5" />
            </div>
            <span className="whitespace-nowrap pl-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}