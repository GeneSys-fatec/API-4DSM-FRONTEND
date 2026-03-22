
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  ArrowLeft,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { WeatherCard } from "../components/WeatherCard";
import { DashboardChart, type WeatherResponse, type ParametroClima, type PeriodoTempo } from "../components/DashboardChart";
import { fetchWeatherForStation } from "../services/weather-service";


const iconMap: Record<string, React.ReactNode> = {
  Temperatura: <Thermometer className="w-5 h-5" />,
  Umidade: <Droplets className="w-5 h-5" />,
  Chuva: <CloudRain className="w-5 h-5" />,
  Ventos: <Wind className="w-5 h-5" />,
};

export function Dashboard() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [parametroAtivo, setParametroAtivo] = useState<ParametroClima>("Temperatura");
  const [periodoAtivo, setPeriodoAtivo] = useState<PeriodoTempo>("24h");

  
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      setIsLoading(true);
      setError(null);

      const stationId = id ? parseInt(id) : 1;

      const data = await fetchWeatherForStation(stationId);

      if (data) {
        setWeatherData(data);
      } else {
        setError("Não foi possível carregar os dados climáticos desta estação.");
      }
      setIsLoading(false);
    };

    loadWeather();
  }, [id]);

  const getPeriodButtonClass = (periodo: PeriodoTempo) => {
    const baseClass = "px-4 py-1.5 rounded-md font-medium transition-colors ";
    return periodoAtivo === periodo
      ? baseClass + "bg-tecsus-green text-white shadow-sm"
      : baseClass + "text-gray-500 hover:text-gray-900 hover:bg-gray-100";
  };

  
  const parametrosDaEstacao = [
    {
      nome: "Temperatura",
      valor: weatherData ? `${weatherData.current.temperature_2m}°C` : "--",
      minMax: "Atual",
    },
    {
      nome: "Umidade",
      valor: weatherData ? `${weatherData.current.relative_humidity_2m}%` : "--",
      minMax: "Atual",
    },
    {
      nome: "Chuva",
      valor: weatherData?.current.precipitation
        ? `${weatherData.current.precipitation} mm`
        : "0.0 mm",
      minMax: "Última hora",
    },
    {
      nome: "Ventos",
      valor: weatherData ? `${weatherData.current.wind_speed_10m} km/h` : "--",
      minMax: "Atual",
    },
  ] as const;

  return (
    <div className="min-h-full flex flex-col bg-bg-dashboard">
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/selecionar-estacao")}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all focus:outline-none"
              aria-label="Voltar para seleção de estações"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Dashboard: {id ? `Estação ${id}` : "São José dos Campos - Centro"}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 py-2">
          {parametrosDaEstacao.map((param) => (
            <WeatherCard
              key={param.nome}
              title={param.nome}
              icon={iconMap[param.nome] || <HelpCircle className="w-5 h-5" />}
              value={param.valor}
              subtitle={param.minMax}
              isActive={parametroAtivo === param.nome}
              onClick={() => setParametroAtivo(param.nome as ParametroClima)}
            />
          ))}
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[350px] md:h-[450px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">
              Gráfico de {parametroAtivo}
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
      </main>
    </div>
  );
}