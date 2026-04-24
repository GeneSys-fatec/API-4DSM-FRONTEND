import type { StationMapApi } from "../services/station-service";

export interface StationMapPoint {
  id: string;
  nome: string;
  cidade: string;
  codigo: string;
  lat: number;
  lng: number;
  isActive: boolean;
}

export function parseMapApiToMapPoints(stations: StationMapApi[]): StationMapPoint[] {
  return stations.reduce<StationMapPoint[]>((acc, station) => {
    const lat = parseFloat(station.latitude);
    const lng = parseFloat(station.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      acc.push({
        id: String(station.id),
        nome: station.name,
        cidade: station.address,
        codigo: station.idDatalogger,
        lat,
        lng,
        isActive: station.isActive,
      });
    }

    return acc;
  }, []);
}

export function countInvalidCoords(stations: StationMapApi[]): number {
  return stations.filter((s) => {
    const lat = parseFloat(s.latitude);
    const lng = parseFloat(s.longitude);
    return isNaN(lat) || isNaN(lng);
  }).length;
}
