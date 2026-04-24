import { useEffect, useState, useCallback } from "react";
import { Trash2, Pencil, Search, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { type Administrator, administratorService } from "../services/administrator-services";
import { CreateAdminModal } from "../components/CreateAdminModal";
import { EditAdminModal } from "../components/EditAdminModal";
import { TableBase } from "@/components/TableBody";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { loadStoredFilters, persistFilters } from "@/utils/filter-storage";

const ADMIN_FILTERS_STORAGE_KEY = "@ClimaSense:filters:administrators";

type AdminFiltersState = {
    q: string;
    status: "" | "true" | "false";
};

const DEFAULT_FILTERS: AdminFiltersState = {
    q: "",
    status: "",
};

const columns = [
    {
        key: "name",
        header: "Nome",
        tdClassName: "font-semibold text-gray-900",
        render: (item: Administrator) => item.name,
    },
    {
        key: "email",
        header: "E-mail",
        tdClassName: "text-gray-600",
        render: (item: Administrator) => item.email,
    },
];

export function Admin() {
    const [admins, setAdmins] = useState<Administrator[]>([]);
    const [filters, setFilters] = useState<AdminFiltersState>(() => {
        const stored = loadStoredFilters(ADMIN_FILTERS_STORAGE_KEY, DEFAULT_FILTERS as AdminFiltersState & { status?: string });
        const rawStatus = String(stored.status ?? "").toLowerCase();

        let normalizedStatus: AdminFiltersState["status"] = "";
        if (rawStatus === "true" || rawStatus === "ativo" || rawStatus === "ativa") {
            normalizedStatus = "true";
        }
        if (rawStatus === "false" || rawStatus === "inativo" || rawStatus === "inativa") {
            normalizedStatus = "false";
        }

        return {
            q: stored.q ?? "",
            status: normalizedStatus,
        };
    });
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    
    const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
    const [adminToDelete, setAdminToDelete] = useState<Administrator | null>(null);

    const loadAdmins = useCallback(async () => {
        return administratorService.findAll({
            q: filters.q,
            status: filters.status,
        });
    }, [filters.q, filters.status]);

    useEffect(() => {
        let isMounted = true;

        void loadAdmins().then((data) => {
            if (isMounted) {
                setAdmins(data);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [loadAdmins]);

    useEffect(() => {
        persistFilters(ADMIN_FILTERS_STORAGE_KEY, filters);
    }, [filters]);

    const openCreateModal = () => setIsCreateModalOpen(true);
    
    const openEditModal = (admin: Administrator) => {
        setSelectedAdminId(admin.id);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (admin: Administrator) => {
        setAdminToDelete(admin);
        setIsConfirmDeleteOpen(true);
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsConfirmDeleteOpen(false);
        setSelectedAdminId(null);
        setAdminToDelete(null);
    };

    const handleFormSuccess = async () => {
        setAdmins(await loadAdmins());
        closeModal();
    };

    const handleDeleteConfirm = async () => {
        if (!adminToDelete) return;
        try {
            await administratorService.delete(adminToDelete.id);
            toast.success("Administrador excluído com sucesso!");
            setAdmins(await loadAdmins());
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Não foi possível excluir o administrador.";
            toast.error(message);
        }
        closeModal();
    };

    const hasActiveFilters = Boolean(filters.q.trim() || filters.status);

    return (
        <div className="max-w-8xl mx-auto w-full p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                    Administradores cadastrados
                </h1>

                <div className="flex flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64 shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar administrador"
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

                    <select
                        value={filters.status}
                        onChange={(event) =>
                            setFilters((prev) => ({
                                ...prev,
                                status: event.target.value as AdminFiltersState["status"],
                            }))
                        }
                        className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                    >
                        <option value="">Todos os status</option>
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </select>

                    <button
                        type="button"
                        className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto flex items-center justify-center"
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        title="Limpar filtros"
                    >
                        <X size={18} />
                    </button>

                    <button
                        type="button"
                        className="bg-tecsus-green text-white font-semibold text-sm hidden md:flex p-2 px-4 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md transition-all shadow-sm"
                        onClick={openCreateModal}
                    >
                        Cadastrar administrador
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {admins.length > 0 ? (
                    <>
                        <TableBase
                            data={admins}
                            columns={columns}
                            rowClassName="hover:bg-[#e8f5e9]/50 group transition-colors"
                            getRowKey={(item) => item.id.toString()}
                            renderActions={(item) => (
                                <div className="flex items-center justify-end gap-3 px-2">
                                    <button
                                        type="button"
                                        className="cursor-pointer"
                                        onClick={() => openEditModal(item)}
                                        title="Editar"
                                    >
                                        <Pencil className="text-gray-400 hover:text-tecsus-green w-4 h-4 md:w-5 md:h-5 shrink-0 transition-colors" />
                                    </button>

                                    <button
                                        type="button"
                                        className="cursor-pointer"
                                        onClick={() => openDeleteModal(item)}
                                        title="Excluir"
                                    >
                                        <Trash2 className="text-gray-400 hover:text-red-500 w-4 h-4 md:w-5 md:h-5 shrink-0 transition-colors" />
                                    </button>
                                </div>
                            )}
                        />
                        <button
                            type="button"
                            className="md:hidden w-full py-3 bg-tecsus-green text-white font-bold text-sm opacity-90 hover:opacity-100 cursor-pointer transition-opacity"
                            onClick={openCreateModal}
                        >
                            + Cadastrar administrador
                        </button>
                    </>
                ) : (
                    <div className="p-8 text-sm text-gray-500 flex justify-center items-center">
                        {hasActiveFilters
                            ? "Nenhum administrador encontrado para os filtros aplicados."
                            : "Nenhum administrador encontrado."}
                    </div>
                )}
            </div>

            <CreateAdminModal
                isOpen={isCreateModalOpen}
                onClose={closeModal}
                onSuccess={handleFormSuccess}
            />

            <EditAdminModal
                isOpen={isEditModalOpen}
                adminId={selectedAdminId}
                onClose={closeModal}
                onSuccess={handleFormSuccess}
            />

            {isConfirmDeleteOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div onClick={(event) => event.stopPropagation()}>
                        <ConfirmDelete
                            onClose={closeModal}
                            onConfirm={handleDeleteConfirm}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}