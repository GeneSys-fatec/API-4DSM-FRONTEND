import { apiFetch } from './api';

export interface AlertApi {
  id: string;
  idParameter?: {
    id: number;
    idStation?: { id: number; name: string; };
    idTypeParam?: { id: number; name: string; };
  };
  idMeasurement?: { id: number };
  titulo?: string;
  texto?: string;
  triggeredValue: number;
  violatedLimit?: number;
  triggeredAt: string;
  isRead?: boolean;
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
  isRead?: boolean;
  stationName?: string;  
  parameterName?: string; 
}

export interface AlertPayload {
  parameterId: number;
  measuredValue: number;
  occurredAt: string;
  description: string;
}

export interface PaginatedAlerts {
  data: AlertModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateAlertPayload extends Partial<AlertPayload> {
  status?: "active" | "resolved";
}

export type AlertStatus = "active" | "resolved";

export interface AlertListFilters {
  stationId?: number;
  parameterId?: number;
  idTypeParam?: number;
  status?: AlertStatus;
  user?: string;
  q?: string;
  from?: string;
  to?: string;
  isRead?: boolean;
}

export function mapAlertApiToModel(alert: AlertApi): AlertModel {
  return {
    id: String(alert.id),
    parameterId: alert.idParameter?.id ?? 0,
    measurementId: alert.idMeasurement?.id ?? 0,
    measuredValue: Number(alert.triggeredValue),
    occurredAt: alert.triggeredAt,
    description: alert.texto ?? alert.titulo ?? "",
    status: alert.status,
    isRead: alert.isRead,
    stationName: alert.idParameter?.idStation?.name ?? undefined,
    parameterName: alert.idParameter?.idTypeParam?.name ?? undefined,
  };
}

export function getEmptyAlertPayload(): AlertPayload {
  return { parameterId: 0, measuredValue: 0, occurredAt: "", description: "" };
}

export function validateAlertPayload(payload: AlertPayload): string | null {
  if (!payload.parameterId || payload.parameterId <= 0) return "Parâmetro é obrigatório.";
  if (Number.isNaN(payload.measuredValue)) return "Valor medido inválido.";
  if (!payload.occurredAt.trim()) return "Data/hora da ocorrência é obrigatória.";
  if (!payload.description.trim()) return "Descrição é obrigatória.";
  return null;
}

export async function listAlerts(filters: AlertListFilters & { limit?: number; page?: number } = {}): Promise<PaginatedAlerts> {
  const params = new URLSearchParams();
  
  if (filters.q) params.append("q", filters.q);
  if (filters.stationId) params.append("stationId", String(filters.stationId));
  if (filters.parameterId) params.append("parameterId", String(filters.parameterId));
  if (filters.idTypeParam) params.append("idTypeParam", String(filters.idTypeParam));
  if (filters.status) params.append("status", filters.status);
  if (filters.user) params.append("user", filters.user);
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.isRead !== undefined) params.append("isRead", String(filters.isRead));
  if (filters.limit !== undefined) params.append("limit", String(filters.limit));
  if (filters.page !== undefined) params.append("page", String(filters.page));

  const queryString = params.toString();
  
  const url = queryString ? `/alerts/public?${queryString}` : "/alerts/public";

  const response = await apiFetch(url, { method: "GET" });
  if (!response.ok) throw new Error("Erro ao listar alertas");
  
  const result = await response.json();
  
  const isPaginated = !Array.isArray(result) && result.data !== undefined;
  const rawData: AlertApi[] = isPaginated ? result.data : result;
  
  const mappedData = rawData.map(mapAlertApiToModel);
  return isPaginated ? { ...result, data: mappedData } : { data: mappedData, total: mappedData.length, page: 1, limit: mappedData.length, totalPages: 1 };
}

export async function createAlert(payload: AlertPayload): Promise<AlertModel> {
  const response = await apiFetch("/alerts/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Erro ao criar alerta");
  const data = await response.json() as AlertApi;
  return mapAlertApiToModel(data);
}

export async function updateAlert(id: string, payload: UpdateAlertPayload): Promise<AlertModel> {
  const response = await apiFetch(`/alerts/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Erro ao atualizar alerta");
  const data = await response.json() as AlertApi;
  return mapAlertApiToModel(data);
}

export async function deleteAlert(id: string): Promise<void> {
  const response = await apiFetch(`/alerts/delete/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Erro ao deletar alerta");
}

export async function markAlertAsRead(id: string): Promise<void> {
  const response = await apiFetch(`/alerts/${id}/read`, { method: "PATCH" });
  if (!response.ok) throw new Error("Erro ao marcar alerta como lido");
}

export async function markAllAlertsAsRead(): Promise<void> {
  const response = await apiFetch(`/alerts/read-all`, { method: "PATCH" });
  if (!response.ok) throw new Error("Erro ao marcar alertas como lidos");
}

export async function clearReadAlerts(): Promise<void> {
  const response = await apiFetch(`/alerts/clear`, { method: "DELETE" });
  if (!response.ok) throw new Error("Erro ao limpar alertas lidos");
}