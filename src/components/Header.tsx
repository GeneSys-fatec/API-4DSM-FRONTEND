import { useState, useRef, useEffect } from "react";
import { Bell, CircleUser, Menu, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export function Header({ toggleMobileMenu }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        Tecsus Admin
      </h1>

      <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-0">
        <button
          className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Perfil do Usuário"
          >
            <CircleUser className="w-6 h-6" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Deslogar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}