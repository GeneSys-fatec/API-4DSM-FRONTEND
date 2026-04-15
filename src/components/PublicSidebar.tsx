import { useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { usePublicStationsList, stationFilter } from "../services/station-service";

interface PublicSidebarProps {
  isOpen: boolean;
  closeMenu: () => void;
}

export function PublicSidebar({ isOpen, closeMenu }: PublicSidebarProps) {
  const { stations, isLoading } = usePublicStationsList(); 
  const [termoBusca, setTermoBusca] = useState("");
  const { id: currentStationId } = useParams();

  const estacoesFiltradas = useMemo(() => {
    return stationFilter(stations.filter(s => s.isActive), termoBusca);
  }, [stations, termoBusca]);

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-tecsus-green flex items-center gap-2 mb-4">
            <MapPin size={20} />
            Estações
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-tecsus-green focus:ring-1 focus:ring-tecsus-green transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <p className="text-sm text-center text-gray-500 mt-4">Carregando...</p>
          ) : (
            <ul className="space-y-1">
              {estacoesFiltradas.map((estacao) => (
                <li key={estacao.id}>
                  <Link
                    to={`/weather-datas/${estacao.id}`}
                    onClick={closeMenu}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      currentStationId === estacao.id
                        ? "bg-tecsus-green text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{estacao.nome}</span>
                      <span className={`text-xs mt-0.5 ${currentStationId === estacao.id ? "text-green-100" : "text-gray-500"}`}>
                        {estacao.cidade}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}