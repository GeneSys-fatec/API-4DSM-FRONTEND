import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPublicStations } from "../services/station-service";
import { Loader2, MapPinOff, AlertTriangle } from "lucide-react";


function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export function PublicHome() {
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"loading" | "empty" | "error">("loading");

  useEffect(() => {
    let isMounted = true; 

    const initLocation = async () => {
      try {
        const stations = await listPublicStations();
        
        if (!isMounted) return;

        
        if (!stations || stations.length === 0) {
          setStatus("empty");
          return;
        }

        
        const fallbackStation = stations.find(s => s.cidade.includes("São José dos Campos")) || stations[0];

        if (!navigator.geolocation) {
          navigate(`/dashboard/${fallbackStation.id}`, { replace: true });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!isMounted) return;
            const { latitude, longitude } = position.coords;
            
            let closestStation = stations[0];
            let minDistance = Infinity;

            stations.forEach(station => {
              
              const lat = parseFloat(station.latitude);
              const lon = parseFloat(station.longitude);
              
              if (!isNaN(lat) && !isNaN(lon)) {
                 const distance = getDistanceFromLatLonInKm(latitude, longitude, lat, lon);
                 if (distance < minDistance) {
                   minDistance = distance;
                   closestStation = station;
                 }
              }
            });

            navigate(`/dashboard/${closestStation.id}`, { replace: true });
          },
          (error) => {
            
            console.warn("Geolocalização negada/falhou, usando fallback:", error);
            if (isMounted) {
                navigate(`/dashboard/${fallbackStation.id}`, { replace: true });
            }
          },
          
          { timeout: 5000, maximumAge: 0 } 
        );
      } catch (error) {
        console.error("Erro ao buscar estações", error);
        if (isMounted) setStatus("error");
      }
    };

    initLocation();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  
  if (status === "empty") {
     return (
       <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 bg-bg-dashboard p-4 text-center">
         <MapPinOff className="w-16 h-16 mb-4 text-gray-300" />
         <h2 className="text-xl font-bold text-gray-700">Nenhuma estação disponível</h2>
         <p className="mt-2 text-sm">No momento não há estações climáticas ativas cadastradas no sistema.</p>
       </div>
     );
  }

  if (status === "error") {
     return (
       <div className="h-full w-full flex flex-col items-center justify-center text-red-500 bg-bg-dashboard p-4 text-center">
         <AlertTriangle className="w-16 h-16 mb-4 text-red-300" />
         <h2 className="text-xl font-bold">Falha na Comunicação</h2>
         <p className="mt-2 text-sm text-gray-600">Não foi possível carregar os dados. Tente atualizar a página.</p>
       </div>
     );
  }

  
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-tecsus-green bg-bg-dashboard">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <h2 className="text-xl font-bold">Localizando estação mais próxima...</h2>
      <p className="mt-2 text-sm text-gray-500">Aguardando permissão de localização do navegador</p>
    </div>
  );
}