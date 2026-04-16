import Chart from "react-apexcharts";
import type { ApexAxisChartSeries, ApexOptions } from "apexcharts";
import { Loader2 } from "lucide-react";
import type { Parameter } from "../services/parameter-service";
import type { WeatherHourlyData } from "../services/weather-service";

export type PeriodoTempo = "24h" | "7d" | "30d" | "custom";

interface DashboardChartProps {
  parametro: Parameter | null;
  periodo: PeriodoTempo;
  dadosHistoricos: WeatherHourlyData | null;
  customRange?: {
    from?: string;
    to?: string;
  };
}

type ChartData = {
  categories: string[];
  data: Array<number | null>;
  customRangeNotice?: string;
};

export function DashboardChart({
  parametro,
  periodo,
  dadosHistoricos,
  customRange,
}: DashboardChartProps) {
  const formatDateTimeLabel = (date: Date): string =>
    date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatNoticeRange = (from: Date, to: Date): string =>
    `${formatDateTimeLabel(from)} até ${formatDateTimeLabel(to)}`;

  const getCustomTickAmount = (pointCount: number): number => {
    if (pointCount <= 24) return 6;
    if (pointCount <= 24 * 3) return 8;
    if (pointCount <= 24 * 10) return 10;
    return 12;
  };

  const getHourKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");

    return `${year}-${month}-${day}-${hour}`;
  };

  const processarDadosDaAPI = (): ChartData => {
    if (!dadosHistoricos || !dadosHistoricos.time || !parametro) {
      return { categories: [], data: [] };
    }
    const targetKey = parametro.json_key;
    const rawSeries = Array.isArray(dadosHistoricos[targetKey])
      ? (dadosHistoricos[targetKey] as Array<number | string>)
      : [];

    const allPoints = dadosHistoricos.time.map((isoString: string, index: number) => ({
      date: new Date(isoString),
      value: Number(rawSeries[index]),
    }));

    const validPoints = allPoints.filter(
      (point) => Number.isFinite(point.date.getTime()) && Number.isFinite(point.value),
    );

    let selectedPoints: Array<{ date: Date; value: number | null }> = validPoints;
    let customRangeNotice: string | undefined;

    const availableMinDate = validPoints.length > 0
      ? new Date(Math.min(...validPoints.map((point) => point.date.getTime())))
      : null;
    const availableMaxDate = validPoints.length > 0
      ? new Date(Math.max(...validPoints.map((point) => point.date.getTime())))
      : null;

    if (periodo === "custom") {
      const fromDate = customRange?.from ? new Date(`${customRange.from}T00:00:00`) : null;
      const toDate = customRange?.to ? new Date(`${customRange.to}T23:00:00`) : null;

      if (fromDate && toDate && Number.isFinite(fromDate.getTime()) && Number.isFinite(toDate.getTime()) && fromDate <= toDate) {
        if (!availableMinDate || !availableMaxDate) {
          return {
            categories: [],
            data: [],
              customRangeNotice: "Nao encontramos dados para esse período. Tente selecionar datas mais recentes.",
          };
        }

        const effectiveFrom = fromDate < availableMinDate ? availableMinDate : fromDate;
        const effectiveTo = toDate > availableMaxDate ? availableMaxDate : toDate;

        if (effectiveFrom > effectiveTo) {
          return {
            categories: [],
            data: [],
              customRangeNotice: `Nao ha dados dentro do intervalo informado. Faixa disponivel: ${formatNoticeRange(availableMinDate, availableMaxDate)}.`,
          };
        }

        if (fromDate < availableMinDate || toDate > availableMaxDate) {
            customRangeNotice = `Ajustamos o grafico para a faixa com dados disponiveis: ${formatNoticeRange(availableMinDate, availableMaxDate)}.`;
        }

        const valueByHour = new Map<string, number>();
        for (const point of validPoints) {
          valueByHour.set(getHourKey(point.date), point.value);
        }

        selectedPoints = [];
        const cursor = new Date(effectiveFrom);
        while (cursor <= effectiveTo) {
          const key = getHourKey(cursor);
          selectedPoints.push({
            date: new Date(cursor),
            value: valueByHour.get(key) ?? null,
          });
          cursor.setHours(cursor.getHours() + 1);
        }
      } else {
        selectedPoints = validPoints;
      }
    } else {
      let horasParaPegar = 24;
      if (periodo === "7d") horasParaPegar = 24 * 7;
      if (periodo === "30d") horasParaPegar = 24 * 30;

      selectedPoints = validPoints.slice(-horasParaPegar);
    }

    const isSingleDayCustomRange =
      periodo === "custom" &&
      customRange?.from &&
      customRange?.to &&
      customRange.from === customRange.to;

    const categories = selectedPoints.map((point) => {
      const date = point.date;
      if (periodo === "24h" || isSingleDayCustomRange) {
        return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      }

      if (periodo === "custom") {
        if (selectedPoints.length <= 48) {
          return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        if (selectedPoints.length <= 24 * 10) {
          return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
          });
        }

        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      } else {
        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      }
    });

    const data = selectedPoints.map((point) => point.value);

    return { categories, data, customRangeNotice };
  };

  const getChartConfig = (currentData: ChartData) => {
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
        tickAmount:
          periodo === "24h"
            ? 6
            : periodo === "7d"
              ? 7
              : periodo === "30d"
                ? 10
                : getCustomTickAmount(currentData.categories.length),
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

    const series: ApexAxisChartSeries = [
      { name: parametro?.name || "Valor", data: currentData.data },
    ];

    return { options, series };
  };

  if (!dadosHistoricos || !parametro) {
    return (
      <div className="w-full h-full min-h-[300px] flex justify-center items-center text-gray-400 flex-col gap-2">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm">Carregando gráfico...</span>
      </div>
    );
  }

  const currentData = processarDadosDaAPI();
  const { options, series } = getChartConfig(currentData);

  
  const hasAnyNumericPoint = series[0].data.some(
    (value) => typeof value === "number" && Number.isFinite(value),
  );

  if (series[0].data.length === 0 || !hasAnyNumericPoint) {
      return (
        <div className="w-full h-full min-h-[300px] flex justify-center items-center text-gray-400">
           <span className="text-sm">Sem dados históricos para este parâmetro.</span>
        </div>
      )
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      {periodo === "custom" && currentData.customRangeNotice ? (
        <p className="mb-2 text-xs text-amber-600">{currentData.customRangeNotice}</p>
      ) : null}
      <Chart options={options} series={series} type="area" height="100%" />
    </div>
  );
}