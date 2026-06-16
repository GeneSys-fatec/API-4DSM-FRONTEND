import type { Parameter } from "@/services/parameter-service";
import { parameterService } from "@/services/parameter-service";
import { useState } from "react";
import { toast } from "react-toastify";
import { BaseModal } from "../ui/BaseModal";

interface ParameterFormProps {
    onClose: () => void;
    mode: "create" | "edit";
    parameter?: Parameter;
    onSuccess?: () => void;
    inline?: boolean; 
}

const KEY_MAX_LENGTH = 30;
const KEY_REGEX = /^[A-Za-z0-9_]+$/;

export function ParameterForm({ onClose, mode, parameter, onSuccess, inline = false }: ParameterFormProps) {
    const isEditMode = mode === "edit";
    const [keyError, setKeyError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); 
    const [formData, setFormData] = useState({
        json_key: parameter?.json_key || "",
        name: parameter?.name || "",
        unit: parameter?.unit || "",
        factor: parameter?.factor || 0,
        offset: parameter?.offset || 0,
        description: parameter?.description || "",
    });

    const getKeyValidationError = (keyValue: string) => {
        const trimmedKey = keyValue.trim();
        if (!trimmedKey) return "A json_key do parâmetro é obrigatória.";
        if (trimmedKey.length > KEY_MAX_LENGTH) return `A json_key deve ter no máximo ${KEY_MAX_LENGTH} caracteres.`;
        if (!KEY_REGEX.test(trimmedKey)) return "A json_key deve conter apenas letras, números e underline (_).";
        return null;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name === "json_key") {
            setKeyError(getKeyValidationError(value));
        }
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) : value,
        }));
    };

    
    const handleSave = async () => {
        const keyValidationError = getKeyValidationError(formData.json_key);
        if (keyValidationError) {
            setKeyError(keyValidationError);
            toast.error(keyValidationError);
            return;
        }

        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    
    const formFields = (
        <div className="flex flex-col gap-5">
            <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                    Nome <span className="text-gray-500">*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    className="w-full outline-none text-sm bg-transparent"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                />
            </div>
            <div className="flex flex-col gap-1">
                <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                        JSON Key <span className="text-gray-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="json_key"
                        className="w-full outline-none text-xs bg-transparent"
                        required
                        maxLength={KEY_MAX_LENGTH}
                        title="Use apenas letras, números e _"
                        value={formData.json_key}
                        onChange={handleInputChange}
                        onBlur={(event) => setKeyError(getKeyValidationError(event.target.value))}
                    />
                </div>
                {keyError && <p className="text-xs text-red-600 font-medium">{keyError}</p>}
                <p className="text-xs text-gray-500">Identificador exato no JSON (ex: temperature_2m).</p>
            </div>
            <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                    Unidade de medida <span className="text-gray-500">*</span>
                </label>
                <input
                    type="text"
                    name="unit"
                    className="w-full outline-none text-sm bg-transparent"
                    required
                    value={formData.unit}
                    onChange={handleInputChange}
                />
            </div>
            <div className="flex justify-between gap-4">
                <div className="flex-1 relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                        Fator <span className="text-gray-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="factor"
                        className="w-full outline-none text-sm bg-transparent"
                        required
                        value={formData.factor}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex-1 relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                        Desvio (offset) <span className="text-gray-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="offset"
                        className="w-full outline-none text-sm bg-transparent"
                        required
                        value={formData.offset}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
            <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                    Observações <span className="text-gray-500">(opcional)</span>
                </label>
                <textarea
                    name="description"
                    className="w-full outline-none text-sm bg-transparent"
                    value={formData.description}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );

    
    if (!inline) {
        return (
            <BaseModal
                isOpen={true}
                onClose={onClose}
                title={isEditMode ? "Editar parâmetro" : "Novo parâmetro"}
                onCancel={onClose}
                confirmText={isEditMode ? "Salvar" : "Enviar"}
                onConfirm={handleSave}
                isLoading={isLoading}
                maxWidth="xl"
            >
                {formFields}
            </BaseModal>
        );
    }

    
    return (
        <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }} className="flex flex-col gap-5 w-full">
            {formFields}
            <div className="flex self-end gap-2 mt-2">
                <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-tecsus-green text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50"
                >
                    {isLoading ? "Processando..." : (isEditMode ? "Salvar" : "Enviar")}
                </button>
            </div>
        </form>
    );
}