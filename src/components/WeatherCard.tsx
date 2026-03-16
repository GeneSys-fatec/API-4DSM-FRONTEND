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
      className={`relative bg-white p-5 rounded-xl border cursor-pointer transition-all duration-300 ease-in-out overflow-hidden ${
        isActive 
          ? 'border-gray-200 shadow-md transform scale-[1.02]' 
          : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-1 opacity-80 hover:opacity-100'
      }`}
    >
      {/* Linha de destaque sutil no topo quando ativo */}
      {isActive && <div className="absolute top-0 left-0 right-0 h-1 bg-tecsus-green"></div>}

      <div className="flex justify-between items-center mb-4 mt-1">
        <div className={`flex items-center gap-2 text-sm font-bold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
          <span className={isActive ? 'text-tecsus-green' : 'text-gray-400'}>{icon}</span>
          <span>{title}</span>
        </div>
        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
      </div>
      
      <div>
        <h3 className={`text-4xl font-bold tracking-tight ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{value}</h3>
        <p className="text-xs font-medium text-gray-500 mt-2">{subtitle}</p>
      </div>
    </div>
  );
}