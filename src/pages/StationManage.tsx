import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Settings2,
  Edit2,
  Trash2,
  ArrowUpDown,
  Filter,
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
import { loadStoredFilters, persistFilters } from "@/services/filter-storage";

const STATION_FILTERS_STORAGE_KEY = "@ClimaSense:filters:stations";
const STATION_COLUMNS_STORAGE_KEY = "@ClimaSense:columns:stations";

type StationColumnKey = "nome" | "cidade" | "codigo" | "isActive";

type StationFiltersState = {
  q: string;
  status: "" | "true" | "false";
};

const DEFAULT_FILTERS: StationFiltersState = {
  q: "",
  status: "",
};

const DEFAULT_VISIBLE_COLUMNS: Record<StationColumnKey, boolean> = {
  nome: true,
  cidade: true,
  codigo: true,
  isActive: true,
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
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<StationColumnKey, boolean>>(() =>
    loadStoredFilters(STATION_COLUMNS_STORAGE_KEY, DEFAULT_VISIBLE_COLUMNS),
  );
  const columnMenuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    persistFilters(STATION_COLUMNS_STORAGE_KEY, visibleColumns);
  }, [visibleColumns]);

  useEffect(() => {
    if (!isColumnMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!columnMenuRef.current?.contains(event.target as Node)) {
        setIsColumnMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isColumnMenuOpen]);

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

  const colunasVisiveis = useMemo(() => {
    return colunasDaTabela.filter((column) => visibleColumns[column.key as StationColumnKey]);
  }, [colunasDaTabela, visibleColumns]);

  const toggleColumnVisibility = (columnKey: StationColumnKey) => {
    setVisibleColumns((prev) => {
      const visibleCount = Object.values(prev).filter(Boolean).length;
      if (prev[columnKey] && visibleCount === 1) {
        return prev;
      }

      return {
        ...prev,
        [columnKey]: !prev[columnKey],
      };
    });
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full flex flex-col h-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Estações Cadastradas
        </h1>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative" ref={columnMenuRef}>
            <button
              onClick={() => setIsColumnMenuOpen((prev) => !prev)}
              className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Select column
              <ArrowUpDown size={14} className="text-gray-400" />
            </button>

            {isColumnMenuOpen ? (
              <div className="absolute right-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg z-20 p-2">
                {[
                  { key: "nome", label: "Nome" },
                  { key: "cidade", label: "Cidade" },
                  { key: "codigo", label: "Código" },
                  { key: "isActive", label: "Status" },
                ].map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[option.key as StationColumnKey]}
                      onChange={() => toggleColumnVisibility(option.key as StationColumnKey)}
                      className="accent-tecsus-green"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Procurar Estação"
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

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as StationFiltersState["status"],
              }))
            }
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
          >
            <option value="">Todos os status</option>
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </select>

          <button
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            title="Limpar filtros"
          >
            <Filter size={18} />
          </button>

          <button
            onClick={createModal.open}
            className="flex items-center gap-2 bg-tecsus-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm"
          >
            Add new
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
              columns={colunasVisiveis}
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
      {limitsTarget && (
        <div
          className="fixed inset-0 z-80 bg-black/40 flex items-center justify-center p-4"
          onClick={closeLimitsModal}
        >
          <div
            className="w-full max-w-[96vw] md:max-w-5xl max-h-[90vh] mx-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <ParameterByStation
              onClose={closeLimitsModal}
              stationId={Number(limitsTarget.id)}
              onSuccess={closeLimitsModal}
            />
          </div>
        </div>
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
