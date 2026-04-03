import { apiFetch } from './api';

export const fetchWeatherForStation = async (stationId: number) => {
  try {
    const response = await apiFetch(`/weather/${stationId}`);
    
    if (!response.ok) {
        throw new Error("Erro ao buscar clima da estação");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro na integração:", error);
    return null;
  }
};