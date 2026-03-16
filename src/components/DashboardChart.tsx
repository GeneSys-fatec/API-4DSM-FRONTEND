import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { chartMockData, type ParametroClima, type PeriodoTempo } from "../mocks/DashboardData";

interface DashboardChartProps {
  parametro: ParametroClima;
  periodo: PeriodoTempo;
}

export function DashboardChart({ parametro, periodo }: DashboardChartProps) {
  const getChartConfig = () => {
    
    const currentData = chartMockData[parametro][periodo];

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
          dynamicAnimation: { speed: 350 }
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
        tickAmount: periodo === "30d" ? 6 : undefined,
        labels: {
          hideOverlappingLabels: true,
          style: { colors: "#9ca3af", fontSize: "12px", fontWeight: 500 },
        },
      },
      yaxis: {
        labels: {
          style: { colors: "#9ca3af", fontSize: "12px", fontWeight: 500 },
          formatter: (value) => `${value} ${yAxisFormat}`,
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

    return { 
      options, 
      series: [{ name: parametro, data: currentData.data }] 
    };
  };

  const { options, series } = getChartConfig();

  return (
    <div className="w-full h-full min-h-75">
      <Chart options={options} series={series} type="area" height="100%" />
    </div>
  );
}