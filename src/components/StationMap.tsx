import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { StationMapPoint } from "../utils/stationMapUtils";

const TECSUS_GREEN = "#006400";

const markerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
  <defs>
    <filter id="shadow" x="-30%" y="-10%" width="160%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>
  <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 32 12 32S28 21 28 12C28 5.373 22.627 0 16 0z"
        fill="${TECSUS_GREEN}" filter="url(#shadow)"/>
  <circle cx="16" cy="12" r="5" fill="white" opacity="0.95"/>
</svg>`;

const greenIcon = L.divIcon({
  html: markerSvg,
  className: "",
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -46],
});

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    
    resizeObserver.observe(map.getContainer());
    
    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
}

const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253];
const DEFAULT_ZOOM = 4;

interface StationMapProps {
  stations: StationMapPoint[];
  mode?: "public" | "admin";
}

export function StationMap({ stations, mode = "public" }: StationMapProps) {
  const navigate = useNavigate();

  const getStationPath = (id: string) =>
    mode === "admin" ? `/admin/weather-datas/${id}` : `/weather-datas/${id}`;

  return (
    <MapContainer
      center={BRAZIL_CENTER}
      zoom={DEFAULT_ZOOM}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom
      zoomControl
    >
      <MapResizer />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />

      {stations.map((station) => (
        <Marker key={station.id} position={[station.lat, station.lng]} icon={greenIcon}>
          <Popup
            minWidth={220}
            maxWidth={260}
            className="station-popup"
          >
            <div className="station-popup-inner">
              <div className="station-popup-header">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="station-popup-pin"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.583 19.583 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="station-popup-name">{station.nome}</span>
                {station.isActive ? (
                  <span className="ml-auto inline-flex items-center rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Ativa
                  </span>
                ) : (
                  <span className="ml-auto inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-500/20">
                    Inativa
                  </span>
                )}
              </div>

              <div className="station-popup-divider" />

              <div className="station-popup-body">
                <p className="station-popup-city">{station.cidade}</p>
                <p className="station-popup-code">Código: {station.codigo}</p>
              </div>

              <button
                id={`map-station-btn-${station.id}`}
                onClick={() => navigate(getStationPath(station.id))}
                className="station-popup-btn"
              >
                Ver painel da estação
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
