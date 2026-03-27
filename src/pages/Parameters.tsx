import { ConfirmDelete } from "@/components/ConfirmDelete";
import { ParameterForm } from "@/components/forms/ParameterForm";
import { TableBase } from "@/components/TableBody";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { parameterService } from "@/services/parameter-service";
import { toast } from "react-toastify";

export interface Parameter {
    id: number;
    key: string;
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
        render: (item: Parameter) => item.key,
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
    const [modalOpen, setModalOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [parameterToDelete, setParameterToDelete] = useState<Parameter | null>(null);

    useEffect(() => {
        loadParameters();
    }, []);

    const loadParameters = async () => {
        const data = await parameterService.findAll();
        setParameters(data);
    };

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
            await loadParameters();
        } else {
            toast.error("Não foi possível excluir o parâmetro.");
        }
        closeModal();
    };

    const handleFormSuccess = async () => {
        await loadParameters();
        closeModal();
    };

    const closeModal = () => {
        setModalOpen(false);
        setConfirmDeleteOpen(false);
        setEditingParameter(null);
        setParameterToDelete(null);
    };

    return (
        <div className="max-w-8xl mx-auto w-full p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    Parâmetros cadastrados
                </h1>
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
                        Nenhum parâmetro encontrado. Cadastre seu primeiro parâmetro!
                    </div>
                )}
            </div>
            {modalOpen && (
                <div
                    className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4"
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
                    className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4"
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