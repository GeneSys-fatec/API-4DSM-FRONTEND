import { Bell, CircleUser } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-tecsus-green text-white h-16 px-8 flex justify-between items-center shadow-md shrink-0">
      <h1 className="text-xl font-bold tracking-tight">Tecsus Admin</h1>
      
      <div className="flex items-center gap-4">
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