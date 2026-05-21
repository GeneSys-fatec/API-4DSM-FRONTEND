import { ConfirmDelete } from "@/components/ConfirmDelete";
import { ParameterForm } from "@/components/forms/ParameterForm";
import { TableBase } from "@/components/TableBody";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { parameterService } from "@/services/parameter-service";
import { toast } from "react-toastify";
import { loadStoredFilters, persistFilters } from "@/utils/filter-storage";

const PARAMETER_FILTERS_STORAGE_KEY = "@ClimaSense:filters:parameter-types";

type ParameterFiltersState = {
    q: string;
};

const DEFAULT_FILTERS: ParameterFiltersState = {
    q: "",
};

export interface Parameter {
    id: number;
    json_key: string;
    name: string;
    unit: string;
    factor: number;
    offset: number;
    description?: string;
}

const columns = [
    {
        key: "name",
        header: "Parâmetro",
        tdClassName: "font-semibold text-gray-900",
        render: (item: Parameter) => item.name,
    },
    {
        key: "key",
        header: "Key",
        render: (item: Parameter) => item.json_key,
    },

    {
        key: "unit",
        header: "Unidade",
        render: (item: Parameter) => item.unit,
    },
    {
        key: "factor",
        header: "Fator",
        tdClassName: "font-mono",
        render: (item: Parameter) => item.factor,
    },
    {
        key: "offset",
        header: "Desvio (Offset)",
        tdClassName: "font-mono",
        render: (item: Parameter) => item.offset,
    },

];

export function Parameters() {
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [filters, setFilters] = useState<ParameterFiltersState>(() =>
        loadStoredFilters(PARAMETER_FILTERS_STORAGE_KEY, DEFAULT_FILTERS),
    );
    const [reloadKey, setReloadKey] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [parameterToDelete, setParameterToDelete] = useState<Parameter | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchParams = async () => {
            const data = await parameterService.findAll({
                q: filters.q,
            });

            if (isMounted) {
                setParameters(data);
            }
        };

        void fetchParams();

        return () => {
            isMounted = false;
        };
    }, [filters.q, reloadKey]);

    useEffect(() => {
        persistFilters(PARAMETER_FILTERS_STORAGE_KEY, filters);
    }, [filters]);

    const openCreateModal = () => {
        setEditingParameter(null);
        setModalOpen(true);
    };

    const openEditModal = (parameter: Parameter) => {
        setEditingParameter(parameter);
        setModalOpen(true);
    };

    const openDeleteModal = (parameter: Parameter) => {
        setParameterToDelete(parameter);
        setConfirmDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!parameterToDelete) return;

        const success = await parameterService.delete(parameterToDelete.id);
        if (success) {
            toast.success("Parâmetro excluído com sucesso!");
            setReloadKey((current) => current + 1);
        } else {
            toast.error("Não foi possível excluir o parâmetro.");
        }
        closeModal();
    };

    const handleFormSuccess = async () => {
        setReloadKey((current) => current + 1);
        closeModal();
    };

    const closeModal = () => {
        setModalOpen(false);
        setConfirmDeleteOpen(false);
        setEditingParameter(null);
        setParameterToDelete(null);
    };

    const hasActiveFilters = Boolean(filters.q.trim());

    return (
        <div className="max-w-8xl mx-auto w-full p-4 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-8">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    Parâmetros Cadastrados
                </h1>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-3 w-full lg:w-auto lg:ml-auto">
                    <div className="relative w-full lg:w-[320px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por parâmetro, key ou unidade"
                            value={filters.q}
                            onChange={(event) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    q: event.target.value,
                                }))
                            }
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                        />
                    </div>
                    <button
                        type="button"
                        className="bg-tecsus-green text-white font-semibold text-sm flex p-2 px-4 gap-2 opacity-90 hover:opacity-100 cursor-pointer rounded-md transition-all shadow-sm w-full lg:w-auto justify-center"
                        onClick={openCreateModal}
                    >
                        Cadastrar parâmetro
                    </button>

                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {parameters.length > 0 ? (
                    <>
                        <TableBase
                            data={parameters}
                            columns={columns}
                            rowClassName="hover:bg-[#e8f5e9]/50 group"
                            getRowKey={(item) => item.id.toString()}
                            renderActions={(item) => (
                                <div className="flex items-center justify-end gap-3">
                                    <button type="button" className="cursor-pointer" onClick={() => openEditModal(item)}>
                                        <Pencil className="text-gray-400 hover:text-tecsus-green w-4 h-4 md:w-5 md:h-5 shrink-0"></Pencil>
                                    </button>
                                    <button type="button" className="cursor-pointer" onClick={() => openDeleteModal(item)}>
                                        <Trash2 className="text-gray-400 hover:text-tecsus-green w-4 h-4 md:w-5 md:h-5 shrink-0"></Trash2>
                                    </button>
                                </div>
                            )}
                        />

                    </>
                ) : (
                    <div className="p-8 text-sm text-gray-500 flex justify-center items-center">
                        {hasActiveFilters
                            ? "Nenhum parâmetro encontrado para os filtros aplicados."
                            : "Nenhum parâmetro encontrado. Cadastre seu primeiro parâmetro!"}
                    </div>
                )}
            </div>
            {modalOpen && (
                <div

                    className="fixed inset-0 z-80 bg-black/40 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div onClick={(event) => event.stopPropagation()}>
                        <ParameterForm
                            onClose={closeModal}
                            mode={editingParameter ? "edit" : "create"}
                            parameter={editingParameter || undefined}
                            onSuccess={handleFormSuccess}
                        />
                    </div>
                </div>
            )}
            {confirmDeleteOpen && (
                <div

                    className="fixed inset-0 z-80 bg-black/40 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div onClick={(event) => event.stopPropagation()}>
                        <ConfirmDelete onClose={closeModal} onConfirm={handleDeleteConfirm} />
                    </div>
                </div>
            )
            }
        </div>
    )
}