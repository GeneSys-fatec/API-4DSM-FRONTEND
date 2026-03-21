import { useMemo, useState } from "react";
import {Search, Settings2,
  Edit2, Trash2,
  ArrowUpDown, Filter,
  ChevronLeft, ChevronRight,} from "lucide-react";
import { TableBase } from "../components/TableBody";
import { CreateStationModal } from "../components/CreateStationModal";
import { DeleteStationModal } from "../components/DeleteStationModal";
import { EditStationModal } from "../components/EditStationModal";
import {deleteStation, stationFilter,
  type Estacao, useCreateStationModal,
  useEditStationModal, useStationsList,
} from "../services/station-service";

export function StationManage() {
  const [termoBusca, setTermoBusca] = useState("");
  const { stations: estacoes, isLoading, errorMessage, reload } = useStationsList();
  const createModal = useCreateStationModal(reload);
  const editModal = useEditStationModal(reload);

  const [deleteTarget, setDeleteTarget] = useState<Estacao | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const openDeleteModal = (station: Estacao) => {
    setDeleteErrorMessage(null);
    setDeleteTarget(station);
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
    } catch {
      setDeleteErrorMessage("Não foi possível excluir a estação.");
    } finally {
      setIsDeleting(false);
    }
  };

  const estacoesFiltradas = useMemo(() => {
    return stationFilter(estacoes, termoBusca);
  }, [estacoes, termoBusca]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full flex flex-col h-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Estações Cadastradas
        </h1>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Select column
            <ArrowUpDown size={14} className="text-gray-400" />
          </button>

          <div className="relative w-full sm:w-64 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Procurar Estação"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green transition-all"
            />
          </div>

          <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-sm text-gray-500">Carregando estações...</div>
          ) : errorMessage ? (
            <div className="p-8 text-sm text-red-500">{errorMessage}</div>
          ) : (
            <TableBase
                  data={estacoesFiltradas}
                  rowClassName="hover:bg-gray-50/50"
                  renderActions={(item) => (
                    <div className="flex justify-end gap-4">
                      <button
                        title="Configurar Limites"
                        className="text-gray-500 hover:text-blue-600 transition-colors focus:outline-none"
                      >
                        <Settings2 size={18} />
                      </button>
                      <button
                        title="Editar Estação"
                        className="text-gray-500 hover:text-tecsus-green transition-colors focus:outline-none"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void editModal.open(item.id);
                        } }
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openDeleteModal(item);
                        } }
                        title="Excluir Estação"
                        className="text-gray-500 hover:text-red-500 transition-colors focus:outline-none"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )} columns={[]}/>
          )}
        </div>
          
          {/* remover essa paginação mockada  */}
        <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="w-full sm:w-auto invisible hidden sm:block"></div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button className="p-1 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 cursor-pointer hover:text-gray-900">1</span>
            <span className="px-2 w-6 h-6 flex items-center justify-center bg-tecsus-green text-white rounded-full font-medium">
              2
            </span>
            <span className="px-2 cursor-pointer hover:text-gray-900">3</span>
            <span className="px-2 cursor-pointer hover:text-gray-900">4</span>
            <span className="px-1">...</span>
            <span className="px-2 cursor-pointer hover:text-gray-900">10</span>
            <button className="p-1 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="w-full sm:w-auto flex justify-end">
            <button className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              Display 10 items
              <ChevronRight size={14} className="text-gray-400 rotate-90" />
            </button>
          </div>
        </div>
      </div>

      <CreateStationModal modal={createModal} />

      <EditStationModal modal={editModal} />

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
