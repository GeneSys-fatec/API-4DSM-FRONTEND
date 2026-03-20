
const API_URL = 'http://localhost:3333'; 

export const fetchWeatherForStation = async (stationId: number) => {
  try {
    const response = await fetch(`${API_URL}/weather/${stationId}`);
    
    if (!response.ok) {
        throw new Error("Erro ao buscar clima da estação");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro na integração:", error);
    return null;
  }
};