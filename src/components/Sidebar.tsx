import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wifi,
  AlertCircle,
  Users,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  closeMenu: () => void;
}

export function Sidebar({ isOpen, closeMenu }: SidebarProps) {
  const menuItems = [
    {
      to: "/admin/selecionar-estacao",
      icon: LayoutDashboard,
      label: "Monitoramento",
    },
    { to: "/admin/gerenciar-estacoes", icon: Wifi, label: "Gerenciar Estações" },
    { to: "/admin/limites", icon: AlertCircle, label: "Limites" },
    { to: "/admin/cadastrar", icon: Users, label: "Cadastrar Administrador" },
  ];

  const bottomItems = [
    { to: "/admin/help", icon: HelpCircle, label: "Help" },
    { to: "/logout", icon: LogOut, label: "Log out" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 h-full bg-white border-r border-gray-100 overflow-hidden shrink-0 py-6
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          transition-all duration-300 ease-in-out group flex flex-col
          w-[85%] md:w-20 md:hover:w-72
        `}
      >
        <button
          onClick={closeMenu}
          className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center mx-2 px-3 mb-8 shrink-0 mt-8 md:mt-0">
          <div className="w-10 flex justify-center shrink-0">
            <div className="w-10 h-10 rounded-xl bg-tecsus-green text-white flex items-center justify-center font-bold shadow-sm">
              A
            </div>
          </div>

          <div className="flex flex-col pl-3 whitespace-nowrap opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-bold text-gray-900">
              Nome Administrador
            </span>
            <span className="text-xs text-gray-500">adm@email.com</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center py-3 mx-2 px-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#e8f5e9] text-tecsus-green font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <div className="w-10 flex justify-center shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="whitespace-nowrap pl-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

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
              <span className="whitespace-nowrap pl-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}
