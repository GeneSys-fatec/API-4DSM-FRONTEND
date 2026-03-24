import type { Parameter } from "@/services/parameter-service";
import { parameterService } from "@/services/parameter-service";
import { useState } from "react";
import { toast } from "react-toastify";

interface ParameterFormProps {
    onClose: () => void;
    mode: "create" | "edit";
    parameter?: Parameter;
    onSuccess?: () => void;
}

export function ParameterForm({ onClose, mode, parameter, onSuccess }: ParameterFormProps) {
    const isEditMode = mode === "edit";
    const [formData, setFormData] = useState({
        name: parameter?.name || "",
        unit: parameter?.unit || "",
        factor: parameter?.factor || 0,
        offset: parameter?.offset || 0,
        description: parameter?.description || "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let result;
            if (isEditMode && parameter) {
                result = await parameterService.update(parameter.id, formData);
            } else {
                result = await parameterService.create(formData);
            }

            if (result) {
                toast.success(isEditMode ? "Parâmetro atualizado com sucesso!" : "Parâmetro cadastrado com sucesso!");
                onSuccess?.();
            } else {
                toast.error(isEditMode ? "Não foi possível atualizar o parâmetro." : "Não foi possível cadastrar o parâmetro.");
            }
        } catch (error) {
            console.error("Erro ao salvar parâmetro:", error);
            toast.error(isEditMode ? "Erro ao atualizar o parâmetro." : "Erro ao cadastrar o parâmetro.");
        }
    };

    return (
        <div className="w-[92vw] max-w-xl rounded-xl bg-white p-5 md:p-6 shadow-xl border border-gray-100">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
                    {isEditMode ? "Editar parâmetro" : "Novo parâmetro"}
                </h1>
                <button
                    type="button"
                    className="text-2xl text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={onClose}
                >
                    &times;
                </button>
            </div>
            <form className="flex flex-col justify-center gap-5" onSubmit={handleSubmit}>
                <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Nome <span className="text-gray-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        className="w-full outline-none text-sm"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Unidade de medida <span className="text-gray-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="unit"
                        className="w-full outline-none text-sm"
                        required
                        value={formData.unit}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex justify-between gap-4">
                    <div className="flex-1 relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
                        <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Fator <span className="text-gray-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="factor"
                            className="w-full outline-none text-sm"
                            required
                            value={formData.factor}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="flex-1 relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
                        <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Desvio (offset) <span className="text-gray-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="offset"
                            className="w-full outline-none text-sm"
                            required
                            value={formData.offset}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Observações <span className="text-gray-500">(opcional)</span>
                    </label>
                    <textarea
                        name="description"
                        className="w-full outline-none text-sm"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex self-end gap-2">
                    <button 
                        type="button"
                        className="bg-gray-400 font-semibold text-sm p-2 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        className="bg-tecsus-green text-white font-semibold text-sm p-2 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEditMode ? "Salvar" : "Enviar"}
                    </button>
                </div>
            </form>
        </div>
    )
}