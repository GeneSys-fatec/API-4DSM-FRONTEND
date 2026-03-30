import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Loader2 } from "lucide-react";
import type { Parameter } from "../services/parameter-service";

export type PeriodoTempo = "24h" | "7d" | "30d";

interface DashboardChartProps {
  parametro: Parameter | null;
  periodo: PeriodoTempo;
  dadosHistoricos: any | null; 
}

export function DashboardChart({
  parametro,
  periodo,
  dadosHistoricos,
}: DashboardChartProps) {
  const processarDadosDaAPI = () => {
    if (!dadosHistoricos || !dadosHistoricos.time || !parametro) {
      return { categories: [], data: [] };
    }
    const targetKey = parametro.json_key; 
    
    let horasParaPegar = 24;
    if (periodo === "7d") horasParaPegar = 24 * 7;
    if (periodo === "30d") horasParaPegar = 24 * 30;

    const rawTimes = dadosHistoricos.time.slice(-horasParaPegar);
    
    const rawData = dadosHistoricos[targetKey] ? dadosHistoricos[targetKey].slice(-horasParaPegar) : [];

    const categories = rawTimes.map((isoString: string) => {
      const date = new Date(isoString);
      if (periodo === "24h") {
        return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      } else {
        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      }
    });

    return { categories, data: rawData };
  };

  const getChartConfig = () => {
    const currentData = processarDadosDaAPI();
    const jsonKey = parametro?.json_key || "";
    const yAxisFormat = parametro?.unit || "";

    
    let lineColor = "#f59e0b"; 
    if (jsonKey.includes('temp')) lineColor = "#4f46e5"; 
    else if (jsonKey.includes('humid')) lineColor = "#0ea5e9"; 
    else if (jsonKey.includes('precip') || jsonKey.includes('rain')) lineColor = "#64748b"; 
    else if (jsonKey.includes('wind')) lineColor = "#10b981"; 

    const options: ApexOptions = {
      chart: {
        type: "area",
        fontFamily: "Inter, system-ui, sans-serif",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, speed: 800, dynamicAnimation: { speed: 350 } },
      },
      colors: [lineColor],
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      xaxis: {
        categories: currentData.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        tickAmount: periodo === "24h" ? 6 : periodo === "7d" ? 7 : 10,
        labels: { hideOverlappingLabels: true, style: { colors: "#9ca3af", fontSize: "12px", fontWeight: 500 } },
      },
      yaxis: {
        labels: {
          style: { colors: "#9ca3af", fontSize: "12px", fontWeight: 500 },
          formatter: (value) => value !== undefined ? `${value.toFixed(1)} ${yAxisFormat}` : "",
        },
      },
      grid: {
        borderColor: "#f3f4f6",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        theme: "light",
        y: { formatter: (value) => `${value} ${yAxisFormat}` },
      },
    };

    return { options, series: [{ name: parametro?.name || "Valor", data: currentData.data }] };
  };

  if (!dadosHistoricos || !parametro) {
    return (
      <div className="w-full h-full min-h-[300px] flex justify-center items-center text-gray-400 flex-col gap-2">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm">Carregando gráfico...</span>
      </div>
    );
  }

  const { options, series } = getChartConfig();

  
  if (series[0].data.length === 0) {
      return (
        <div className="w-full h-full min-h-[300px] flex justify-center items-center text-gray-400">
           <span className="text-sm">Sem dados históricos para este parâmetro.</span>
        </div>
      )
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <Chart options={options} series={series} type="area" height="100%" />
    </div>
  );
}