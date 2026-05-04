import { apiFetch } from './api';

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
  return { parameterId: 0, measuredValue: 0, occurredAt: "", description: "" };
}

export function validateAlertPayload(payload: AlertPayload): string | null {
  if (!payload.parameterId || payload.parameterId <= 0) return "Parâmetro é obrigatório.";
  if (Number.isNaN(payload.measuredValue)) return "Valor medido inválido.";
  if (!payload.occurredAt.trim()) return "Data/hora da ocorrência é obrigatória.";
  if (!payload.description.trim()) return "Descrição é obrigatória.";
  return null;
}

export async function listAlerts(filters: AlertListFilters = {}): Promise<AlertModel[]> {
  const params = new URLSearchParams();
  
  if (filters.q) params.append("q", filters.q);
  if (filters.stationId) params.append("stationId", String(filters.stationId));
  if (filters.parameterId) params.append("parameterId", String(filters.parameterId));
  if (filters.idTypeParam) params.append("idTypeParam", String(filters.idTypeParam));
  if (filters.status) params.append("status", filters.status);
  if (filters.user) params.append("user", filters.user);
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);

  const queryString = params.toString();
  
  const url = queryString ? `/alerts/public?${queryString}` : "/alerts/public";

  const response = await apiFetch(url, { method: "GET" });
  if (!response.ok) throw new Error("Erro ao listar alertas");
  const data = await response.json() as AlertApi[];
  
  return data.map(mapAlertApiToModel);
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