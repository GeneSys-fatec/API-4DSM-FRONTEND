import { apiFetch } from './api';

export interface MeasurementApi {
  id: number;
  rawValue: number;
  value: number;
  collectedAt: string;
  idParameter: {
    id: number;
    idTypeParam: {
      id: number;
      json_key: string;
      name: string;
      unit: string;
    };
  };
}

export interface PaginatedMeasurements {
  data: MeasurementApi[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const measurementsService = {
  getMeasurements: async (stationId: number, period?: string, parameterId?: number): Promise<PaginatedMeasurements> => {
    let url = `/measurements?stationId=${stationId}&limit=1000`;
    
    if (period) url += `&period=${period}`;
    if (parameterId) url += `&parameterId=${parameterId}`;
    
    try {
      const response = await apiFetch(url);
      if (!response.ok) throw new Error("Erro ao buscar medições");
      return await response.json();
    } catch (error) {
      console.error("Erro na integração (measurements):", error);
      return { data: [], total: 0, page: 1, limit: 1000, totalPages: 0 };
    }
  }
};