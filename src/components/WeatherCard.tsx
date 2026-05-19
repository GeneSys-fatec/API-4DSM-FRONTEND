import type { ReactNode } from 'react';
import { Info } from 'lucide-react';

interface WeatherCardProps {
  title: string;
  icon: ReactNode;
  value: string;
  subtitle: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function WeatherCard({ title, icon, value, subtitle, isActive = false, onClick }: WeatherCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`relative bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl border cursor-pointer transition-all duration-300 ease-in-out overflow-hidden ${
        isActive 
          ? 'border-gray-200 shadow-md transform scale-[1.02]' 
          : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-1 opacity-80 hover:opacity-100'
      }`}
    >
      {/* Linha de destaque sutil no topo quando ativo */}
      {isActive && <div className="absolute top-0 left-0 right-0 h-1 bg-tecsus-green"></div>}

      <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4 mt-1">
        <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
          <span className={`flex-shrink-0 ${isActive ? 'text-tecsus-green' : 'text-gray-400'}`}>{icon}</span>
          <span className="line-clamp-1">{title}</span>
        </div>
        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0" />
      </div>
      
      <div>
        <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{value}</h3>
        <p className="text-xs font-medium text-gray-500 mt-2">{subtitle}</p>
      </div>
    </div>
  );
}