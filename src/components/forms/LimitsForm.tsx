import { limitsService, type Limits } from "@/services/limits-service";
import { type Parameter } from "@/services/parameter-service";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface LimitsFormProps {
    onClose: () => void;
    stationId: number;
    limit?: Limits;
    onSuccess?: () => void;
    fixedParameter?: Pick<Parameter, "id" | "name" | "json_key">;
    inline?: boolean;
}

export function LimitsForm({ onClose, limit, onSuccess, fixedParameter, inline = false }: LimitsFormProps) {
    const [resolvedLimit, setResolvedLimit] = useState<Limits | null>(limit ?? null);
    const [formData, setFormData] = useState({
        idTypeParam: fixedParameter?.id ?? limit?.idTypeParam ?? 0,
        minExpected: String(limit?.minExpected ?? 0),
        maxExpected: String(limit?.maxExpected ?? 0),
    });

    useEffect(() => {
        if (limit) {
            setResolvedLimit(limit);
            setFormData({
                idTypeParam: limit.idTypeParam,
                minExpected: String(limit.minExpected),
                maxExpected: String(limit.maxExpected),
            });
            return;
        }

        if (fixedParameter) {
            setResolvedLimit(null);
            setFormData({
                idTypeParam: fixedParameter.id,
                minExpected: "0",
                maxExpected: "0",
            });
        }
    }, [limit, fixedParameter?.id]);

    useEffect(() => {
        if (limit) return;

        if (!formData.idTypeParam) {
            setResolvedLimit(null);
            return;
        }

        let isMounted = true;

        const loadExistingLimit = async () => {
            const limits = await limitsService.findAll();
            if (!isMounted) return;

            const existingLimit = limits.find((item) => item.idTypeParam === formData.idTypeParam) ?? null;
            setResolvedLimit(existingLimit);

            if (existingLimit) {
                setFormData((prev) => ({
                    ...prev,
                    minExpected: String(existingLimit.minExpected),
                    maxExpected: String(existingLimit.maxExpected),
                }));
            }
        };

        void loadExistingLimit();

        return () => {
            isMounted = false;
        };
    }, [limit, formData.idTypeParam]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.idTypeParam) {
            toast.error("Selecione um parâmetro para configurar o limite.");
            return;
        }

        const minExpected = Number(formData.minExpected);
        const maxExpected = Number(formData.maxExpected);

        if (formData.minExpected.trim() === "" || formData.maxExpected.trim() === "") {
            toast.error("Preencha os valores mínimo e máximo.");
            return;
        }

        if (Number.isNaN(minExpected) || Number.isNaN(maxExpected)) {
            toast.error("Os valores de limite devem ser numéricos.");
            return;
        }

        const payload = {
            idTypeParam: formData.idTypeParam,
            minExpected,
            maxExpected,
        };

        try {
            let result;
            let targetLimit = resolvedLimit;

            if (!targetLimit) {
                const limits = await limitsService.findAll();
                targetLimit = limits.find((item) => item.idTypeParam === formData.idTypeParam) ?? null;
            }

            if (targetLimit) {
                result = await limitsService.update(targetLimit.id, payload);
            } else {
                result = await limitsService.create(payload);
            }

            if (result) {
                toast.success(targetLimit ? "Limite atualizado com sucesso!" : "Limite cadastrado com sucesso!");
                onSuccess?.();
                if (inline) {
                    onClose();
                }
            } else {
                toast.error("Não foi possível cadastrar o limite.");
            }
        } catch (error) {
            console.error("Erro ao salvar limite:", error);
            toast.error("Erro ao cadastrar o limite.");
        }
    };

    return (
        <div className={inline ? "w-full rounded-xl bg-white p-4 md:p-5 border border-gray-200" : "w-[92vw] max-w-xl rounded-xl bg-white p-5 md:p-6 shadow-xl border border-gray-100"}>
            <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-semibold text-gray-800">
                        Configurar limite de
                        {fixedParameter
                            ? ` ${fixedParameter.name.toLowerCase()} (${fixedParameter.json_key})`
                            : "Configure os valores limite para gerar alertas quando um parâmetro ultrapassar a faixa definida."}
                    </h1>
                </div>
                {!inline && (
                    <button
                        type="button"
                        className="text-2xl text-gray-500 hover:text-gray-700 cursor-pointer"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                )}
            </div>
            <form className="flex flex-col justify-center gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green w-full sm:flex-1">
                        <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Mínimo <span className="text-gray-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="minExpected"
                            className="w-full outline-none text-sm"
                            required
                            value={formData.minExpected}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green w-full sm:flex-1">
                        <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Máximo <span className="text-gray-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="maxExpected"
                            className="w-full outline-none text-sm"
                            required
                            value={formData.maxExpected}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="flex self-end gap-2 flex-wrap justify-end">
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
                        Enviar
                    </button>
                </div>
            </form>
        </div>
    )
}