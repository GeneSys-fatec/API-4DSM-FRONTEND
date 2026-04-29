import { apiFetch, buildQueryString } from "./api";

export interface AlertApi {
  id: number;
  parameterId: number;
  measurementId: number;
  measuredValue: number;
  occurredAt: string;
  description: string;
  status: "active" | "resolved";
}

export interface AlertModel {
  id: string;
  parameterId: number;
  measurementId: number;
  measuredValue: number;
  occurredAt: string;
  description: string;
  status: "active" | "resolved";
}

export interface AlertPayload {
  parameterId: number;
  measuredValue: number;
  occurredAt: string;
  description: string;
}

export interface UpdateAlertPayload extends Partial<AlertPayload> {
  status?: "active" | "resolved";
}

export interface AlertListFilters {
  q?: string;
  stationId?: number;
  parameterId?: number;
  idTypeParam?: number;
  status?: "active" | "resolved";
  user?: string;
  from?: string;
  to?: string;
}

async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await apiFetch(path, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function mapAlertApiToModel(alert: AlertApi): AlertModel {
  return {
    id: String(alert.id),
    parameterId: alert.parameterId,
    measurementId: alert.measurementId,
    measuredValue: Number(alert.measuredValue),
    occurredAt: alert.occurredAt,
    description: alert.description,
    status: alert.status,
  };
}

export function getEmptyAlertPayload(): AlertPayload {
  return {
    parameterId: 0,
    measuredValue: 0,
    occurredAt: "",
    description: "",
  };
}

export function validateAlertPayload(payload: AlertPayload): string | null {
  if (!payload.parameterId || payload.parameterId <= 0) {
    return "Parâmetro é obrigatório.";
  }

  if (Number.isNaN(payload.measuredValue)) {
    return "Valor medido inválido.";
  }

  if (!payload.occurredAt.trim()) {
    return "Data/hora da ocorrência é obrigatória.";
  }

  if (!payload.description.trim()) {
    return "Descrição é obrigatória.";
  }

  return null;
}

export function alertFilter(alerts: AlertModel[], term: string): AlertModel[] {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return alerts;

  return alerts.filter((alert) => {
    const byDescription = alert.description.toLowerCase().includes(normalized);
    const byParam = String(alert.parameterId).includes(normalized);
    const byStatus = alert.status.toLowerCase().includes(normalized);
    return byDescription || byParam || byStatus;
  });
}

export async function listAlerts(filters?: AlertListFilters): Promise<AlertModel[]> {
  const queryString = buildQueryString({
    q: filters?.q,
    stationId: filters?.stationId,
    parameterId: filters?.parameterId,
    idTypeParam: filters?.idTypeParam,
    status: filters?.status,
    user: filters?.user,
    from: filters?.from,
    to: filters?.to,
  });

  const data = await fetchJson<AlertApi[]>(`/alerts${queryString}`, {
    method: "GET",
  });

  return data.map(mapAlertApiToModel);
}

export async function createAlert(payload: AlertPayload): Promise<AlertModel> {
  const data = await fetchJson<AlertApi>("/alerts/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return mapAlertApiToModel(data);
}

export async function updateAlert(id: string, payload: UpdateAlertPayload): Promise<AlertModel> {
  const data = await fetchJson<AlertApi>(`/alerts/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return mapAlertApiToModel(data);
}

export async function deleteAlert(id: string): Promise<void> {
  await fetchJson<void>(`/alerts/delete/${id}`, {
    method: "DELETE",
  });
}