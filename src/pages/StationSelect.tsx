import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, MapPin } from "lucide-react";
import { TableBase } from "../components/TableBody";
import { listStations, stationFilter, type Estacao } from "../services/station-service";

export function StationSelect() {
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState("");
  const [estacoes, setEstacoes] = useState<Estacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);

    listStations({ signal: controller.signal })
      .then((data) => {
        setEstacoes(data);
      })
      .catch((err: unknown) => {
        if ((err as any)?.name === "AbortError") return;
        setErrorMessage("Não foi possível carregar as estações.");
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const estacoesFiltradas = useMemo(() => {
    return stationFilter(estacoes, termoBusca);
  }, [estacoes, termoBusca]);

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <MapPin className="text-tecsus-green w-6 h-6 md:w-8 md:h-8 shrink-0" />
            Monitoramento Climático
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2 font-medium max-w-2xl">
            Selecione uma estação na lista abaixo para visualizar as métricas de
            temperatura, umidade, chuvas e ventos em tempo real.
          </p>
        </div>

        <div className="relative w-full md:w-80 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 md:p-12 text-sm text-gray-500">Carregando estações...</div>
        ) : errorMessage ? (
          <div className="p-8 md:p-12 text-sm text-red-500">{errorMessage}</div>
        ) : estacoesFiltradas.length > 0 ? (
          <TableBase
            data={estacoesFiltradas}
            rowClassName="cursor-pointer hover:bg-[#e8f5e9]/50 group"
            onRowClick={(item) => navigate(`/admin/dashboard/${item.id}`)}
            renderActions={(_item) => (
              <span className="text-tecsus-green font-bold text-sm flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                Acessar Dashboard <ArrowRight size={16} />
              </span>
            )}
          />
        ) : (
          <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">
              Nenhuma estação encontrada
            </h3>
            <p className="text-gray-500 mt-1">
              Não encontramos resultados para "{termoBusca}".
            </p>
            <button
              onClick={() => setTermoBusca("")}
              className="mt-4 text-tecsus-green font-medium hover:underline focus:outline-none"
            >
              Limpar busca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
