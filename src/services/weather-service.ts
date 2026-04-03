
const DEFAULT_API_URL = "http://localhost:3333";

export interface GeneratedAlertApi {
  id: number;
  parameterId: number;
  measurementId: number;
  measuredValue: number;
  occurredAt: string;
  description: string;
  status: "active" | "resolved";
}

export interface WeatherData {
  current: Record<string, number | string>;
  hourly: Record<string, unknown>;
  units?: Record<string, string>;
  generatedAlerts: GeneratedAlertApi[];
  generatedCount: number;
}

function getApiBaseUrl(): string {
  const fromEnv = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  return (fromEnv?.trim() || DEFAULT_API_URL).replace(/\/+$/, "");
}

function getAuthHeaders(): Record<string, string> {
  const token =
    (typeof window !== "undefined" &&
      (window.localStorage.getItem("authToken") ||
        window.localStorage.getItem("token"))) ||
    "";

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeWeatherResponse(payload: any): WeatherData {
  const generatedAlerts = Array.isArray(payload?.generatedAlerts)
    ? payload.generatedAlerts
    : [];

  const generatedCount = Number.isFinite(payload?.generatedCount)
    ? Number(payload.generatedCount)
    : generatedAlerts.length;

  return {
    current: payload?.current ?? {},
    hourly: payload?.hourly ?? {},
    units: payload?.units ?? {},
    generatedAlerts,
    generatedCount,
  };
}

export const fetchWeatherForStation = async (
  stationId: number,
): Promise<WeatherData | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/weather/${stationId}`, {
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar clima da estação");
    }

    return normalizeWeatherResponse(await response.json());
  } catch (error) {
    console.error("Erro na integração:", error);
    return null;
  }
};