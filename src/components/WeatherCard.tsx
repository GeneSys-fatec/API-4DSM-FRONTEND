import { useEffect, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';

interface WeatherCardTooltipInfo {
  unit: string;
  description: string;
  importance: string;
}

interface WeatherCardProps {
  title: string;
  icon: ReactNode;
  value: string;
  subtitle: string;
  isActive?: boolean;
  onClick?: () => void;
  tooltipInfo?: WeatherCardTooltipInfo;
}

export function WeatherCard({ title, icon, value, subtitle, isActive = false, onClick, tooltipInfo }: WeatherCardProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsInfoOpen(false);
      }
    };

    if (isInfoOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInfoOpen]);

  return (
    <div
      onClick={onClick}
      onMouseLeave={() => setIsInfoOpen(false)}
      className={`group relative bg-white p-5 rounded-xl border cursor-pointer transition-all duration-300 ease-in-out overflow-visible ${
        isInfoOpen ? 'z-50' : 'z-0'
      } ${
        isActive 
          ? 'border-gray-200 shadow-md transform scale-[1.02]' 
          : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-1 opacity-80 hover:opacity-100'
      }`}
    >
      <div className="relative">
        <div className="flex justify-between items-center mb-4 mt-1">
          <div className={`flex items-center gap-2 text-sm font-bold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
            <span className={isActive ? 'text-tecsus-green' : 'text-gray-400'}>{icon}</span>
            <span>{title}</span>
          </div>
          <div className="group/info">
            <button
              type="button"
              aria-label={`Ver detalhes do parâmetro ${title}`}
              onClick={(event) => {
                event.stopPropagation();
                setIsInfoOpen((current) => !current);
              }}
              onMouseEnter={() => setIsInfoOpen(true)}
              onFocus={() => setIsInfoOpen(true)}
              className="flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-tecsus-green/40"
            >
              <Info className="w-4 h-4 transition-colors" />
            </button>
          </div>
        </div>
        
        <div>
          <h3 className={`text-4xl font-bold tracking-tight ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{value}</h3>
          <p className="text-xs font-medium text-gray-500 mt-2">{subtitle}</p>
        </div>
      </div>

      {tooltipInfo ? (
        <div
          onClick={(event) => event.stopPropagation()}
          className={`absolute left-0 top-0 z-50 w-[min(100vw-2rem,20rem)] transition-all duration-200 md:left-full md:top-0 md:ml-4 ${
            isInfoOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-1 opacity-0"
          }`}
        >
          <div className="overflow-hidden rounded-2xl border border-[#dbe9dd] bg-white shadow-[0_14px_34px_rgba(0,0,0,0.12)]">
            <div className="flex items-start gap-3 bg-gradient-to-r from-[#f0fdf0] to-[#dcfce7] px-4 py-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-tecsus-green shadow-sm ring-1 ring-inset ring-green-600/10">
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tecsus-green">Detalhes do parâmetro</p>
                <h3 className="mt-1 truncate text-sm font-bold text-gray-900">{title}</h3>
              </div>
            </div>

            <div className="px-4 py-4">
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Unidade de medida</p>
                  <p className="mt-1 font-medium text-gray-700">{tooltipInfo.unit}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Descrição</p>
                  <p className="mt-1 leading-relaxed text-gray-700">{tooltipInfo.description}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Importância para monitoramento climático e gestão de riscos</p>
                  <p className="mt-1 leading-relaxed text-gray-700">{tooltipInfo.importance}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}