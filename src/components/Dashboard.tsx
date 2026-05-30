import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  ArrowLeft,
  Activity,
  Loader2,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import { WeatherCard } from "./WeatherCard";
import { DashboardChart, type PeriodoTempo } from "./DashboardChart";

import {
  parameterService,
  type Parameter,
} from "../services/parameter-service";
import { stationParameterService } from "../services/station-parameter-service";
import { listPublicStations } from "../services/station-service";
import { measurementsService } from "../services/measurements-service";
import { useAlertNotifications } from "../contexts/alert-notifications-context";
import { listAlerts } from "../services/alert-service";
import { loadStoredFilters, persistFilters } from "@/utils/filter-storage";
import { parameterTooltipByKey, type ParameterTooltipContent } from "../utils/parameter-guide";

interface ActiveParameter extends Parameter {
  linkId: number;
}

function getTooltipContent(param: Parameter): ParameterTooltipContent {
  return (
    parameterTooltipByKey[param.json_key] ?? {
      unit: param.unit,
      description: param.description ?? "Este parâmetro ajuda a monitorar as condições ambientais da estação.",
      importance: "É importante para acompanhar mudanças climáticas, apoiar alertas e orientar decisões operacionais.",
    }
  );
}

const getIconForParameter = (jsonKey: string) => {
  if (jsonKey.includes("temp")) return <Thermometer className="w-5 h-5" />;
  if (jsonKey.includes("humid")) return <Droplets className="w-5 h-5" />;
  if (jsonKey.includes("precip") || jsonKey.includes("rain"))
    return <CloudRain className="w-5 h-5" />;
  if (jsonKey.includes("wind")) return <Wind className="w-5 h-5" />;
  return <Activity className="w-5 h-5" />;
};

interface ChartHistoricalData {
  time: string[];
  [key: string]: number[] | string[];
}

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { registerGeneratedAlerts } = useAlertNotifications();
  const stationId = id ? Number.parseInt(id, 10) : 1;
  const dashboardFiltersStorageKey = `@ClimaSense:filters:dashboard:${stationId}`;

  const [stationName, setStationName] = useState<string>("");
  const [stationParams, setStationParams] = useState<ActiveParameter[]>([]);
  const [parametroAtivo, setParametroAtivo] = useState<ActiveParameter | null>(null);

  const [periodoAtivo, setPeriodoAtivo] = useState<PeriodoTempo>("24h");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [latestValues, setLatestValues] = useState<Record<string, number>>({});
  const [chartHistoricalData, setChartHistoricalData] =
    useState<ChartHistoricalData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdminRoute = location.pathname.includes("/admin");

  const isCustomRangeInvalid = Boolean(
    periodoAtivo === "custom" &&
    customFrom &&
    customTo &&
    customFrom > customTo,
  );

  const parseStoredPeriodo = (value: unknown): PeriodoTempo => {
    if (
      value === "24h" ||
      value === "7d" ||
      value === "30d" ||
      value === "custom"
    ) {
      return value;
    }
    return "24h";
  };

  useEffect(() => {
    const stored = loadStoredFilters(dashboardFiltersStorageKey, {
      periodoAtivo: "24h" as PeriodoTempo,
      customFrom: "",
      customTo: "",
    });

    setPeriodoAtivo(parseStoredPeriodo(stored.periodoAtivo));
    setCustomFrom(stored.customFrom ?? "");
    setCustomTo(stored.customTo ?? "");
  }, [dashboardFiltersStorageKey]);

  useEffect(() => {
    persistFilters(dashboardFiltersStorageKey, {
      periodoAtivo,
      customFrom,
      customTo,
    });
  }, [dashboardFiltersStorageKey, periodoAtivo, customFrom, customTo]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardBaseData = async (backgroundRefresh = false) => {
      if (!backgroundRefresh) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const [measurementsResult, allParams, stationLinks, publicStations] =
          await Promise.all([
            measurementsService.getMeasurements(stationId, "24h"),
            parameterService.findAll(),
            stationParameterService.findByStation(stationId),
            listPublicStations(),
          ]);

        if (!isMounted) return;

        const currentStation = publicStations.find(
          (s) => Number(s.id) === stationId,
        );
        if (currentStation) {
          setStationName(currentStation.nome);
        }

        const activeParams = stationLinks
          .map((link) => {
            const p = allParams.find((param) => param.id === link.idTypeParam);
            if (!p) return undefined;
            return { ...p, linkId: link.id };
          })
          .filter((p): p is ActiveParameter => p !== undefined);

        setStationParams(activeParams);

        const currentValues: Record<string, number> = {};
        measurementsResult.data.forEach((m) => {
          const paramId = String(m.idParameter.id);
          if (currentValues[paramId] === undefined) {
            currentValues[paramId] = m.value;
          }
        });
        setLatestValues(currentValues);

        if (activeParams.length > 0) {
          setParametroAtivo((current) => {
            if (!current) return activeParams[0];
            const found = activeParams.find((item) => item.linkId === current.linkId);
            return found ?? activeParams[0];
          });
        }
      } catch (err) {
        console.error(err);
        if (!backgroundRefresh)
          setError("Erro ao carregar a estrutura do Dashboard.");
      } finally {
        if (!backgroundRefresh && isMounted) setIsLoading(false);
      }
    };

    void loadDashboardBaseData();
    const intervalId = window.setInterval(
      () => void loadDashboardBaseData(true),
      60_000,
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [stationId]);

  useEffect(() => {
    const loadChartData = async () => {
      if (!parametroAtivo) return;
      if (isCustomRangeInvalid) return;

      const periodParam = periodoAtivo === "custom" ? undefined : periodoAtivo;
      let urlSuffix = `&limit=1000`;
      if (periodoAtivo === "custom" && customFrom && customTo) {
        urlSuffix += `&startDate=${customFrom}T00:00:00Z&endDate=${customTo}T23:59:59Z`;
      }

      // Agora passamos a LinkID correta, e não a ID do Tipo!
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3333"}/measurements?stationId=${stationId}&parameterId=${parametroAtivo.linkId}${periodParam ? `&period=${periodParam}` : ""}${urlSuffix}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("@ClimaSense:token")}`,
          },
        },
      );

      const responseData = await response.json();

      const dataAsc = [...(responseData.data || [])].reverse();
      const simulatedHourlyData: ChartHistoricalData = { time: [] };
      const valuesArray: number[] = [];

      dataAsc.forEach((m) => {
        simulatedHourlyData.time.push(m.collectedAt);
        valuesArray.push(m.value);
      });
      simulatedHourlyData[parametroAtivo.json_key] = valuesArray;

      setChartHistoricalData(simulatedHourlyData);
    };

    void loadChartData();
  }, [
    parametroAtivo,
    periodoAtivo,
    stationId,
    customFrom,
    customTo,
    isCustomRangeInvalid,
  ]);

  useEffect(() => {
    if (stationParams.length === 0) return;

    const stationParamIds = stationParams.map((p) => p.linkId);

    const fetchAndNotifyAlerts = async () => {
      try {
        const result = await listAlerts();
        const allAlerts = result.data;

        const activeStationAlerts = allAlerts
          .filter(alert => alert.status === "active" && stationParamIds.includes(alert.parameterId))
          .map(alert => {
            const param = stationParams.find(p => p.linkId === alert.parameterId);
            return {
              ...alert,
              parameterName: param?.name ?? alert.parameterName,
            };
          });

        if (activeStationAlerts.length > 0) {
          const newAlerts = registerGeneratedAlerts(
            stationId,
            activeStationAlerts as Parameters<typeof registerGeneratedAlerts>[1],
            stationName,
          );

          if (newAlerts.length === 1) {
            toast.warn(newAlerts[0].description, {
              toastId: `alert-${stationId}-${newAlerts[0].id}-${newAlerts[0].occurredAt}`,
            });
          } else if (newAlerts.length > 1) {
            toast.warn(
              `${newAlerts.length} novos alertas automáticos para a estação ${stationId}.`,
              {
                toastId: `alert-batch-${stationId}-${Date.now()}`,
              },
            );
          }
        }
      } catch (error) {
        console.error("Erro ao verificar alertas em background:", error);
      }
    };

    void fetchAndNotifyAlerts();
    const intervalId = window.setInterval(fetchAndNotifyAlerts, 30_000);

    return () => window.clearInterval(intervalId);
  }, [stationId, stationParams, stationName, registerGeneratedAlerts]);

  const getPeriodButtonClass = (periodo: PeriodoTempo) => {
    const baseClass = "px-4 py-1.5 rounded-md font-medium transition-colors ";
    return periodoAtivo === periodo
      ? baseClass + "bg-tecsus-green text-white shadow-sm"
      : baseClass + "text-gray-500 hover:text-gray-900 hover:bg-gray-100";
  };

  const clearPeriodFilters = () => {
    setPeriodoAtivo("24h");
    setCustomFrom("");
    setCustomTo("");
  };

  return (
    <div className="min-h-full flex flex-col bg-bg-dashboard">
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto">
            {isAdminRoute && (
              <button
                onClick={() => navigate("/admin/selecionar-estacao")}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all focus:outline-none shrink-0"
                aria-label="Voltar"
              >
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
            )}
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight truncate">
              {stationName
                ? stationName
                : id
                  ? `Dashboard: Estação ${id}`
                  : "Visão Geral"}
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

        <div className="relative overflow-visible">
          {!isLoading && stationParams.length === 0 ? (
            <div className="bg-white p-8 text-center text-gray-500 rounded-xl border border-dashed border-gray-300 mb-8">
              Esta estação não possui nenhum parâmetro (sensor) atrelado a ela.
              Edite a estação para adicionar medições.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8 py-2 overflow-visible">
              {stationParams.map((param) => {
                const rawValue = latestValues[String(param.linkId)];
                const displayValue =
                  rawValue !== undefined && rawValue !== null
                    ? `${Number(rawValue).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${param.unit}`
                    : "--";

                return (
                  <WeatherCard
                    key={param.linkId}
                    title={param.name}
                    icon={getIconForParameter(param.json_key)}
                    value={displayValue}
                    subtitle="Atual"
                    isActive={parametroAtivo?.linkId === param.linkId}
                    onClick={() => setParametroAtivo(param)}
                    tooltipInfo={getTooltipContent(param)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {parametroAtivo && (
          <div className="bg-white p-3 pb-10 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 flex flex-col h-auto md:h-[500px] lg:h-[600px]">



            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] items-start mb-6 shrink-0 gap-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight leading-tight min-w-0 col-span-1 lg:col-span-auto">
                Gráfico de {parametroAtivo.name}
              </h3>

              <div className="flex flex-col xl:flex-row flex-wrap items-start xl:items-center gap-3 w-full lg:w-auto lg:justify-end lg:ml-auto">
                <div className="flex flex-wrap gap-1 text-sm bg-gray-50 p-1 rounded-lg border border-gray-100 w-full sm:w-auto">

                  {(["24h", "7d", "30d", "custom"] as PeriodoTempo[]).map(
                    (periodo) => (
                      <button
                        key={periodo}
                        onClick={() => setPeriodoAtivo(periodo)}
                        className={`sm:flex-none ${getPeriodButtonClass(periodo)}`}
                      >
                        {periodo === "24h"
                          ? "Últimas 24h"
                          : periodo === "7d"
                            ? "7 dias"
                            : periodo === "30d"
                              ? "30 dias"
                              : "Personalizado"}
                      </button>
                    ),
                  )}
                </div>

                {periodoAtivo === "custom" ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm bg-gray-50 p-2 sm:p-1 rounded-lg border border-gray-100 w-full lg:w-auto">

                    <button
                      className="sm:hidden p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0 self-end -mt-1 -mr-1"
                      onClick={clearPeriodFilters}
                      title="Limpar filtros"
                    >
                      <X size={18} />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-none sm:flex sm:items-center gap-2 w-full sm:w-auto">

                      <label className="flex items-center gap-1 text-gray-600 px-2 py-1">
                        De:
                        <input
                          type="date"
                          value={customFrom}
                          max={customTo || undefined}
                          onChange={(event) => setCustomFrom(event.target.value)}
                          className="px-2 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                        />
                      </label>
                      <label className="flex items-center gap-1 text-gray-600 px-2 py-1">
                        Até:
                        <input
                          type="date"
                          value={customTo}
                          min={customFrom || undefined}
                          onChange={(event) => setCustomTo(event.target.value)}
                          className="px-2 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                        />
                      </label>
                    </div>


                    {(customFrom || customTo) && (
                      <button
                        type="button"
                        onClick={clearPeriodFilters}
                        title="Limpar filtros"
                        aria-label="Limpar filtros"
                        className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {isCustomRangeInvalid ? (
              <p className="text-xs text-red-500 mt-1">
                O período personalizado está inválido. A data final deve ser
                maior ou igual à inicial.
              </p>
            ) : null}

            <div className="flex-1 w-full min-h-0 pb-2 sm:pb-3 md:pb-4">
              <DashboardChart
                parametro={parametroAtivo}
                periodo={periodoAtivo}
                dadosHistoricos={chartHistoricalData}
                customRange={{
                  from: customFrom,
                  to: customTo,
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}