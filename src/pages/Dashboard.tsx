import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  ArrowLeft,
  Activity,
  Loader2,
} from "lucide-react";
import { WeatherCard } from "../components/WeatherCard";
import { DashboardChart, type PeriodoTempo } from "../components/DashboardChart";
import { fetchWeatherForStation } from "../services/weather-service";
import { parameterService, type Parameter } from "../services/parameter-service";
import { stationParameterService } from "../services/station-parameter-service";


const getIconForParameter = (jsonKey: string) => {
  if (jsonKey.includes('temp')) return <Thermometer className="w-5 h-5" />;
  if (jsonKey.includes('humid')) return <Droplets className="w-5 h-5" />;
  if (jsonKey.includes('precip') || jsonKey.includes('rain')) return <CloudRain className="w-5 h-5" />;
  if (jsonKey.includes('wind')) return <Wind className="w-5 h-5" />;
  return <Activity className="w-5 h-5" />; 
};

export function Dashboard() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [stationParams, setStationParams] = useState<Parameter[]>([]);
  const [parametroAtivo, setParametroAtivo] = useState<Parameter | null>(null);
  const [periodoAtivo, setPeriodoAtivo] = useState<PeriodoTempo>("24h");
  
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      const stationId = id ? parseInt(id) : 1;

      try {
        const [wData, allParams, stationLinks] = await Promise.all([
          fetchWeatherForStation(stationId),
          parameterService.findAll(),
          stationParameterService.findByStation(stationId)
        ]);

        const activeParams = stationLinks
          .map(link => allParams.find(p => p.id === link.idTypeParam))
          .filter((p): p is Parameter => p !== undefined);

        setStationParams(activeParams);
        setWeatherData(wData);

        
        if (activeParams.length > 0) {
          setParametroAtivo(activeParams[0]);
        }

        if (!wData) {
            setError("Não foi possível carregar os dados climáticos desta estação no OpenMeteo.");
        }

      } catch (err) {
        console.error(err);
        setError("Erro ao carregar a estrutura do Dashboard.");
      }
      setIsLoading(false);
    };

    loadDashboardData();
  }, [id]);

  const getPeriodButtonClass = (periodo: PeriodoTempo) => {
    const baseClass = "px-4 py-1.5 rounded-md font-medium transition-colors ";
    return periodoAtivo === periodo
      ? baseClass + "bg-tecsus-green text-white shadow-sm"
      : baseClass + "text-gray-500 hover:text-gray-900 hover:bg-gray-100";
  };

  return (
    <div className="min-h-full flex flex-col bg-bg-dashboard">
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/selecionar-estacao")}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all focus:outline-none shrink-0"
              aria-label="Voltar para seleção de estações"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
              Dashboard: {id ? `Estação ${id}` : "Visão Geral"}
            </h2>
          </div>

          <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Atualizando...
              </>
            ) : (
              `Atualizado: ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            )}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        {!isLoading && stationParams.length === 0 ? (
           <div className="bg-white p-8 text-center text-gray-500 rounded-xl border border-dashed border-gray-300 mb-8">
              Esta estação não possui nenhum parâmetro (sensor) atrelado a ela. Edite a estação para adicionar medições.
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8 py-2">
            {stationParams.map((param) => {
              
              const rawValue = weatherData?.current?.[param.json_key];
              const displayValue = rawValue !== undefined && rawValue !== null 
                                    ? `${rawValue} ${param.unit}` 
                                    : "--";

              return (
                <WeatherCard
                  key={param.id}
                  title={param.name}
                  icon={getIconForParameter(param.json_key)}
                  value={displayValue}
                  subtitle="Atual"
                  isActive={parametroAtivo?.id === param.id}
                  onClick={() => setParametroAtivo(param)}
                />
              );
            })}
          </div>
        )}

        {/* GRÁFICO */}
        {parametroAtivo && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[400px] md:h-[450px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">
                Gráfico de {parametroAtivo.name}
              </h3>

              <div className="flex flex-wrap gap-1 text-sm bg-gray-50 p-1 rounded-lg border border-gray-100 w-full sm:w-auto">
                {(["24h", "7d", "30d"] as PeriodoTempo[]).map((periodo) => (
                  <button
                    key={periodo}
                    onClick={() => setPeriodoAtivo(periodo)}
                    className={`flex-1 sm:flex-none ${getPeriodButtonClass(periodo)}`}
                  >
                    {periodo === "24h"
                      ? "Últimas 24h"
                      : periodo === "7d"
                        ? "7 dias"
                        : "30 dias"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full min-h-0 pb-4">
              <DashboardChart 
                parametro={parametroAtivo} 
                periodo={periodoAtivo} 
                dadosHistoricos={weatherData ? weatherData.hourly : null}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}