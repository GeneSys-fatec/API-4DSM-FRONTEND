import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Loader2 } from "lucide-react";
export type ParametroClima = "Temperatura" | "Umidade" | "Chuva" | "Ventos";
export type PeriodoTempo = "24h" | "7d" | "30d";

export interface OpenMeteoHourlyData {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation: number[];
  wind_speed_10m: number[];
}

export interface WeatherResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
  };
  hourly: OpenMeteoHourlyData;
}

interface DashboardChartProps {
  parametro: ParametroClima;
  periodo: PeriodoTempo;
  dadosHistoricos: OpenMeteoHourlyData | null;
}

export function DashboardChart({
  parametro,
  periodo,
  dadosHistoricos,
}: DashboardChartProps) {
  const processarDadosDaAPI = () => {
    if (!dadosHistoricos || !dadosHistoricos.time) {
      return { categories: [], data: [] };
    }

    const apiKeys: Record<
      ParametroClima,
      keyof Omit<OpenMeteoHourlyData, "time">
    > = {
      Temperatura: "temperature_2m",
      Umidade: "relative_humidity_2m",
      Chuva: "precipitation",
      Ventos: "wind_speed_10m",
    };
    const targetKey = apiKeys[parametro];

    let horasParaPegar = 24;
    if (periodo === "7d") horasParaPegar = 24 * 7;
    if (periodo === "30d") horasParaPegar = 24 * 30;

    const rawTimes = dadosHistoricos.time.slice(-horasParaPegar);
    const rawData = dadosHistoricos[targetKey].slice(-horasParaPegar);

    const categories = rawTimes.map((isoString: string) => {
      const date = new Date(isoString);
      if (periodo === "24h") {
        return date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
      }
    });

    return { categories, data: rawData };
  };

  const getChartConfig = () => {
    const currentData = processarDadosDaAPI();

    let lineColor = "";
    let yAxisFormat = "";

    switch (parametro) {
      case "Temperatura":
        lineColor = "#4f46e5";
        yAxisFormat = "°C";
        break;
      case "Umidade":
        lineColor = "#0ea5e9";
        yAxisFormat = "%";
        break;
      case "Chuva":
        lineColor = "#64748b";
        yAxisFormat = "mm";
        break;
      case "Ventos":
        lineColor = "#10b981";
        yAxisFormat = "km/h";
        break;
    }

    const options: ApexOptions = {
      chart: {
        type: "area",
        fontFamily: "Inter, system-ui, sans-serif",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          speed: 800,
          dynamicAnimation: { speed: 350 },
        },
      },
      colors: [lineColor],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      xaxis: {
        categories: currentData.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },

        tickAmount: periodo === "24h" ? 6 : periodo === "7d" ? 7 : 10,
        labels: {
          hideOverlappingLabels: true,
          style: { colors: "#9ca3af", fontSize: "12px", fontWeight: 500 },
        },
      },
      yaxis: {
        labels: {
          style: { colors: "#9ca3af", fontSize: "12px", fontWeight: 500 },
          formatter: (value) =>
            value !== undefined ? `${value.toFixed(1)} ${yAxisFormat}` : "",
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

    return { options, series: [{ name: parametro, data: currentData.data }] };
  };

  if (!dadosHistoricos) {
    return (
      <div className="w-full h-full min-h-[300px] flex justify-center items-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { options, series } = getChartConfig();

  return (
    <div className="w-full h-full min-h-[300px]">
      <Chart options={options} series={series} type="area" height="100%" />
    </div>
  );
}