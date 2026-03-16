import { Bell, CircleUser, Menu } from "lucide-react";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export function Header({ toggleMobileMenu }: HeaderProps) {
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

        <button
          className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Perfil do Usuário"
        >
          <CircleUser className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
