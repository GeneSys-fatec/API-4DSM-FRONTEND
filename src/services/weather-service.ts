import { apiFetch } from './api';

export interface GeneratedAlertApi {
  id: number;
  parameterId: number;
  measurementId: number;
  measuredValue: number;
  occurredAt: string;
  description: string;
  status: "active" | "resolved";
}

export interface WeatherHourlyData {
  time: string[];
  [key: string]: number[] | string[] | undefined;
}

export interface WeatherData {
  current: Record<string, number | string | null | undefined>;
  hourly: WeatherHourlyData;
  units?: Record<string, string>;
  generatedAlerts: GeneratedAlertApi[];
  generatedCount: number;
}

export type WeatherResponse = WeatherData;


function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeGeneratedAlerts(value: unknown): GeneratedAlertApi[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is GeneratedAlertApi => {
    if (!isRecord(item)) return false;
    return (
      typeof item.id === "number" &&
      typeof item.parameterId === "number" &&
      typeof item.measurementId === "number" &&
      typeof item.measuredValue === "number" &&
      typeof item.occurredAt === "string" &&
      typeof item.description === "string" &&
      (item.status === "active" || item.status === "resolved")
    );
  });
}

function normalizeHourly(value: unknown): WeatherHourlyData {
  if (!isRecord(value)) {
    return { time: [] };
  }

  const normalized: WeatherHourlyData = {
    time: Array.isArray(value.time)
      ? value.time.filter((item): item is string => typeof item === "string")
      : [],
  };

  Object.entries(value).forEach(([key, entry]) => {
    if (Array.isArray(entry)) {
      const onlyNumbers = entry.filter(
        (item): item is number => typeof item === "number",
      );
      const onlyStrings = entry.filter(
        (item): item is string => typeof item === "string",
      );

      if (onlyNumbers.length === entry.length) {
        normalized[key] = onlyNumbers;
      } else if (onlyStrings.length === entry.length) {
        normalized[key] = onlyStrings;
      }
    }
  });

  return normalized;
}

function normalizeWeatherResponse(payload: unknown): WeatherData {
  const data = isRecord(payload) ? payload : {};
  const generatedAlerts = normalizeGeneratedAlerts(data.generatedAlerts);

  const generatedCount =
    typeof data.generatedCount === "number" && Number.isFinite(data.generatedCount)
      ? data.generatedCount
      : generatedAlerts.length;

  return {
    current: isRecord(data.current)
      ? (data.current as Record<string, number | string | null | undefined>)
      : {},
    hourly: normalizeHourly(data.hourly),
    units: isRecord(data.units)
      ? Object.fromEntries(
        Object.entries(data.units).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      )
      : undefined,
    generatedAlerts,
    generatedCount,
  };
}

export const fetchWeatherForStation = async (
  stationId: number,
): Promise<WeatherData | null> => {
  try {
    const response = await apiFetch(`/weather/public/${stationId}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar clima da estação");
    }

    const json = await response.json();
    return normalizeWeatherResponse(json);
  } catch (error: unknown) {
    console.error("Erro na integração:", error instanceof Error ? error.message : error);
    return null;
  }
};