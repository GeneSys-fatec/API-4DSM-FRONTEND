import { ConfirmDelete } from "@/components/ConfirmDelete";
import { ParameterForm } from "@/components/forms/ParameterForm";
import { TableBase } from "@/components/TableBody";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export interface Parameter {
    id: string;
    name: string;
    unit: string;
    factor: number;
    offset: number;
}

const mockParameters: Parameter[] = [
    {
        id: "01",
        name: "Temperatura",
        unit: "Celsius (°C)",
        factor: 1,
        offset: 0
    },
    {
        id: "02",
        name: "Umidade do ar",
        unit: "Porcentagem (%)",
        factor: 1,
        offset: 0
    },
    {
        id: "03",
        name: "Pluviosidade",
        unit: "Milímetro (mm)",
        factor: 0.20,
        offset: 0
    },
    {
        id: "04",
        name: "Pressão atmosférica",
        unit: "Hectopascal (hPa)",
        factor: 1,
        offset: 1013.25
    },
];

const columns = [
    {
        key: "name",
        header: "Parâmetro",
        tdClassName: "font-semibold text-gray-900",
        render: (item: Parameter) => item.name,
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
    const [modalOpen, setModalOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
    const [confirmDelectionOpen, setConfirmDelectionOpen] = useState(false);

    const openCreateModal = () => {
        setEditingParameter(null);
        setModalOpen(true);
    };

    const openEditModal = (parameter: Parameter) => {
        setEditingParameter(parameter);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setConfirmDelectionOpen(false);
        setEditingParameter(null);
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
                {mockParameters.length > 0 ? (
                    <>
                        <TableBase
                            data={mockParameters}
                            columns={columns}
                            rowClassName="hover:bg-[#e8f5e9]/50 group"
                            getRowKey={(item) => item.id}
                            renderActions={(item) => (
                                <div className="flex items-center justify-end gap-3">
                                    <button type="button" className="cursor-pointer" onClick={() => openEditModal(item)}>
                                        <Pencil className="text-gray-400 hover:text-tecsus-green w-4 h-4 md:w-5 md:h-5 shrink-0"></Pencil>
                                    </button>
                                    <button type="button" className="cursor-pointer" onClick={() => setConfirmDelectionOpen(true)}>
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
                    <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">
                            Nenhum parâmetro encontrado
                        </h3>
                        <p className="text-gray-500 mt-1">Cadastre parâmetros para começar.</p>
                    </div>
                )}
            </div>
            {modalOpen && (
                <div
                    className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div onClick={(event) => event.stopPropagation()}>
                        <ParameterForm onClose={closeModal} mode={editingParameter ? "edit" : "create"} />
                    </div>
                </div>
            )}
            {confirmDelectionOpen && (
                <div
                    className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div onClick={(event) => event.stopPropagation()}>
                        <ConfirmDelete onClose={closeModal} />
                    </div>
                </div>
            )
            }
        </div>
    )
}