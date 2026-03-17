import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { WeatherCard } from "../components/WeatherCard";
import { DashboardChart } from "../components/DashboardChart";
import type { ParametroClima, PeriodoTempo } from "../mocks/DashboardData";

const iconMap: Record<string, React.ReactNode> = {
  Temperatura: <Thermometer className="w-5 h-5" />,
  Umidade: <Droplets className="w-5 h-5" />,
  Chuva: <CloudRain className="w-5 h-5" />,
  Ventos: <Wind className="w-5 h-5" />,
};

export function Dashboard() {
  const navigate = useNavigate();
  const { id } = useParams();

  const parametrosDaEstacao = [
    { nome: "Temperatura", valor: "36°C", minMax: "Min: 28°C | Max: 34°C" },
    { nome: "Umidade", valor: "62%", minMax: "Min: 55% | Max: 70%" },
    { nome: "Chuva", valor: "8.2 mm", minMax: "Últimas 24h" },
    { nome: "Ventos", valor: "15 km/h", minMax: "Direção: SE" },
  ] as const;

  const [parametroAtivo, setParametroAtivo] =
    useState<ParametroClima>("Temperatura");
  const [periodoAtivo, setPeriodoAtivo] = useState<PeriodoTempo>("24h");

  const getPeriodButtonClass = (periodo: PeriodoTempo) => {
    const baseClass = "px-4 py-1.5 rounded-md font-medium transition-colors ";
    return periodoAtivo === periodo
      ? baseClass + "bg-[#2A2A48] text-white shadow-sm"
      : baseClass + "text-gray-500 hover:text-gray-900 hover:bg-gray-100";
  };

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
          <span className="text-sm text-gray-500 font-medium">
            Atualizado: 11:13 AM
          </span>
        </div>

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
              <button
                onClick={() => setPeriodoAtivo("24h")}
                className={`flex-1 sm:flex-none ${getPeriodButtonClass("24h")}`}
              >
                Últimas 24h
              </button>
              <button
                onClick={() => setPeriodoAtivo("7d")}
                className={`flex-1 sm:flex-none ${getPeriodButtonClass("7d")}`}
              >
                7 dias
              </button>
              <button
                onClick={() => setPeriodoAtivo("30d")}
                className={`flex-1 sm:flex-none ${getPeriodButtonClass("30d")}`}
              >
                30 dias
              </button>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 pb-4">
            <DashboardChart parametro={parametroAtivo} periodo={periodoAtivo} />
          </div>
        </div>
      </main>
    </div>
  );
}
