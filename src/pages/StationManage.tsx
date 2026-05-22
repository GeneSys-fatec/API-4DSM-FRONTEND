import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Settings2,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { TableBase, type TableColumn } from "../components/TableBody";
import { CreateStationModal } from "../components/CreateStationModal";
import { DeleteStationModal } from "../components/DeleteStationModal";
import { EditStationModal } from "../components/EditStationModal";
import {
  deleteStation,
  type StationListFilters,
  type Station,
  useCreateStationModal,
  useEditStationModal,
  useStationsList,
} from "../services/station-service";
import { toast } from "react-toastify";
import { ParameterByStation } from "@/components/ParameterByStation";
import { loadStoredFilters, persistFilters } from "@/utils/filter-storage";

const STATION_FILTERS_STORAGE_KEY = "@ClimaSense:filters:stations";

type StationFiltersState = {
  q: string;
  status: "" | "true" | "false";
};

const DEFAULT_FILTERS: StationFiltersState = {
  q: "",
  status: "",
};

export function StationManage() {
  const [filters, setFilters] = useState<StationFiltersState>(() => {
    const stored = loadStoredFilters(STATION_FILTERS_STORAGE_KEY, DEFAULT_FILTERS as StationFiltersState & { status?: string });
    const rawStatus = String(stored.status ?? "").toLowerCase();

    let normalizedStatus: StationFiltersState["status"] = "";
    if (rawStatus === "true" || rawStatus === "ativa") {
      normalizedStatus = "true";
    }
    if (rawStatus === "false" || rawStatus === "inativa") {
      normalizedStatus = "false";
    }

    return {
      q: stored.q ?? "",
      status: normalizedStatus,
    };
  });

  const stationFilters = useMemo<StationListFilters>(() => {
    return {
      q: filters.q,
      ...(filters.status ? { isActive: filters.status === "true" } : {}),
    };
  }, [filters.q, filters.status]);

  const {
    stations: estacoes,
    isLoading,
    errorMessage,
    reload,
  } = useStationsList(stationFilters);
  const createModal = useCreateStationModal(reload);
  const editModal = useEditStationModal(reload);
  const [limitsTarget, setLimitsTarget] = useState<Station | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Station | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );

  const openDeleteModal = (station: Station) => {
    setDeleteErrorMessage(null);
    setDeleteTarget(station);
  };

  const openLimitsModal = (station: Station) => {
    setLimitsTarget(station);
  };

  const closeLimitsModal = () => {
    setLimitsTarget(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteErrorMessage(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      await deleteStation(deleteTarget.id, {
        confirm: false,
        stationName: deleteTarget.nome,
      });
      await reload();
      setDeleteTarget(null);
      toast.success("Estação excluída com sucesso!");
    } catch {
      setDeleteErrorMessage("Não foi possível excluir a estação.");
      toast.error("Não foi possível excluir a estação.");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(filters.q.trim() || filters.status);

  useEffect(() => {
    persistFilters(STATION_FILTERS_STORAGE_KEY, filters);
  }, [filters]);

  const colunasDaTabela: TableColumn<Station>[] = [
    {
      key: "nome",
      header: "NOME",
      render: (item) => (
        <span className="font-semibold text-gray-900 uppercase">
          {item.nome}
        </span>
      ),
    },
    {
      key: "cidade",
      header: "CIDADE",
      render: (item) => (
        <span className="text-gray-600">{item.cidade || "-"}</span>
      ),
    },
    {
      key: "codigo",
      header: "CÓDIGO",
      render: (item) => (
        <span className="text-gray-600">{item.codigo || "-"}</span>
      ),
    },

    {
      key: "isActive",
      header: "STATUS",
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide ${item.isActive
              ? "bg-tecsus-green/10 text-tecsus-green"
              : "bg-red-100 text-red-600"
            }`}
        >
          {item.isActive ? "ATIVO" : "INATIVO"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full flex flex-col h-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Estações Cadastradas
        </h1>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full lg:w-auto">


          <div className="relative w-full lg:w-64 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar estação"
              value={filters.q}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  q: e.target.value,
                }))
              }
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green transition-all"
            />
          </div>


          <div className="flex items-center gap-2 w-full lg:w-auto">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as StationFiltersState["status"],
                }))
              }
              className="flex-1 lg:flex-none lg:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
            >
              <option value="">Todos os status</option>
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
            </select>

            <button
              className="shrink-0 p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              title="Limpar filtros"
            >
              <X size={18} />
            </button>
          </div>


          <button
            onClick={createModal.open}
            className="bg-tecsus-green text-white font-semibold text-sm flex p-2 px-4 gap-2 opacity-90 hover:opacity-100 cursor-pointer rounded-md transition-all shadow-sm w-full lg:w-auto justify-center"
          >
            Cadastrar estação
          </button>

        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden pb-4">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-sm text-gray-500 flex justify-center items-center">
              Carregando estações...
            </div>
          ) : errorMessage ? (
            <div className="p-8 text-sm text-red-500 flex justify-center items-center">
              {errorMessage}
            </div>
          ) : estacoes.length === 0 ? (
            <div className="p-8 text-sm text-gray-500 flex justify-center items-center">
              {hasActiveFilters
                ? "Nenhuma estação encontrada para os filtros informados."
                : "Nenhuma estação encontrada. Cadastre sua primeira estação!"}
            </div>
          ) : (
            <TableBase
              data={estacoes}
              columns={colunasDaTabela}
              rowClassName="hover:bg-gray-50/50"
              renderActions={(item) => (
                <div className="flex justify-end gap-4">
                  <button
                    title="Visualizar Parâmetros"
                    className="text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openLimitsModal(item);
                    }}
                  >
                    <Settings2 size={18} />
                  </button>
                  <button
                    title="Editar Estação"
                    className="text-gray-400 hover:text-tecsus-green transition-colors focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void editModal.open(item.id);
                    }}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteModal(item);
                    }}
                    title="Excluir Estação"
                    className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            />
          )}
        </div>
      </div>

      <CreateStationModal modal={createModal} />
      <EditStationModal modal={editModal} />
      {limitsTarget && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/40 flex items-start md:items-center justify-center p-4 pt-20 md:pt-4"
          onClick={closeLimitsModal}
        >
          <div
            className="w-full max-w-[96vw] md:max-w-5xl max-h-[55vh] md:max-h-[90vh] mx-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <ParameterByStation
              onClose={closeLimitsModal}
              stationId={Number(limitsTarget.id)}
              onSuccess={closeLimitsModal}
            />
          </div>
        </div>,
        document.body
      )}
      <DeleteStationModal
        isOpen={Boolean(deleteTarget)}
        stationName={deleteTarget?.nome}
        isDeleting={isDeleting}
        errorMessage={deleteErrorMessage}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
