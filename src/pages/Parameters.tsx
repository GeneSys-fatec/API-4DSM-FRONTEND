import { ConfirmDelete } from "@/components/ConfirmDelete";
import { ParameterForm } from "@/components/forms/ParameterForm";
import { TableBase } from "@/components/TableBody";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { parameterService } from "@/services/parameter-service";
import { toast } from "react-toastify";
import { loadStoredFilters, persistFilters } from "@/services/filter-storage";

const PARAMETER_FILTERS_STORAGE_KEY = "@ClimaSense:filters:parameter-types";

type ParameterFiltersState = {
    q: string;
    from: string;
    to: string;
};

const DEFAULT_FILTERS: ParameterFiltersState = {
    q: "",
    from: "",
    to: "",
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
                from: filters.from,
                to: filters.to,
            });

            if (isMounted) {
                setParameters(data);
            }
        };

        void fetchParams();

        return () => {
            isMounted = false;
        };
    }, [filters.from, filters.q, filters.to, reloadKey]);

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

    const hasActiveFilters = Boolean(filters.q.trim() || filters.from || filters.to);

    return (
        <div className="max-w-8xl mx-auto w-full p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    Parâmetros cadastrados
                </h1>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar parâmetro"
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
                    <input
                        type="date"
                        value={filters.from}
                        onChange={(event) =>
                            setFilters((prev) => ({
                                ...prev,
                                from: event.target.value,
                            }))
                        }
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                    />
                    <input
                        type="date"
                        value={filters.to}
                        onChange={(event) =>
                            setFilters((prev) => ({
                                ...prev,
                                to: event.target.value,
                            }))
                        }
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                    />
                    <button
                        type="button"
                        className="bg-gray-100 text-gray-700 font-semibold text-sm hidden md:flex self-end p-2 px-3 gap-2 hover:bg-gray-200 cursor-pointer rounded-md"
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                    >
                        Limpar filtros
                    </button>
                </div>
                <button type="button" className="bg-tecsus-green text-white font-semibold text-sm hidden md:flex self-end p-2 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md"
                    onClick={openCreateModal}>
                    Cadastrar parâmetro
                </button>
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
                        <button type="button" className="md:hidden w-full py-1 overflow-x-auto bg-tecsus-green text-white font-bold text-sm opacity-80 hover:opacity-100 cursor-pointer"
                            onClick={openCreateModal}>
                            +
                        </button>
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