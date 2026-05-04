import { useMemo } from "react";
import { Map, MapPinOff, AlertTriangle, Loader2 } from "lucide-react";
import { StationMap } from "../components/StationMap";
import { useMapStationsList } from "../services/station-service";
import { parseMapApiToMapPoints } from "../utils/stationMapUtils";

interface MapViewProps {
  mode?: "public" | "admin";
}

export function MapView({ mode = "public" }: MapViewProps) {
  const { stations, isLoading, errorMessage } = useMapStationsList();

  const mapPoints = useMemo(
    () => parseMapApiToMapPoints(stations),
    [stations],
  );

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-tecsus-green bg-bg-dashboard">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Carregando estações...</h2>
        <p className="mt-2 text-sm text-gray-500">
          Buscando localização das estações meteorológicas
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-red-500 bg-bg-dashboard p-4 text-center">
        <AlertTriangle className="w-16 h-16 mb-4 text-red-300" />
        <h2 className="text-xl font-bold">Falha na Comunicação</h2>
        <p className="mt-2 text-sm text-gray-600">
          Não foi possível carregar os dados. Tente atualizar a página.
        </p>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 bg-bg-dashboard p-4 text-center">
        <MapPinOff className="w-16 h-16 mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">
          Nenhuma estação disponível
        </h2>
        <p className="mt-2 text-sm">
          No momento não há estações climáticas ativas com coordenadas cadastradas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Page header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100 shadow-sm shrink-0">
        <Map className="text-tecsus-green w-5 h-5 shrink-0" />
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            Mapa de Estações
          </h1>
          <p className="text-xs text-gray-500">
            {mapPoints.length} estaç{mapPoints.length !== 1 ? "ões" : "ão"}{" "}
            exibida{mapPoints.length !== 1 ? "s" : ""} no mapa — clique em um
            marcador para mais informações
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" style={{ width: "100%", minHeight: 0 }}>
        <StationMap stations={mapPoints} mode={mode} />
      </div>
    </div>
  );
}
