import { parameterService, type Parameter } from "@/services/parameter-service";
import { stationParameterService } from "@/services/station-parameter-service";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { TableBase } from "./TableBody";
import { Bolt } from "lucide-react";
import { LimitsForm } from "./forms/LimitsForm";

interface ParameterByStationProps {
    onClose: () => void;
    stationId: number;
    onSuccess?: () => void;
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

export function ParameterByStation({ onClose, stationId, onSuccess }: ParameterByStationProps) {
    const [stationParameters, setStationParameters] = useState<Parameter[]>([]);
    const [isLoadingParameters, setIsLoadingParameters] = useState(true);
    const [expandedParameter, setExpandedParameter] = useState<Parameter | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadStationParameters = async () => {
            setIsLoadingParameters(true);

            try {
                const [stationLinks, allParameters] = await Promise.all([
                    stationParameterService.findByStation(stationId),
                    parameterService.findAll(),
                ]);

                if (!isMounted) return;

                const stationParameterIds = new Set(stationLinks.map((link) => link.idTypeParam));
                const filteredParameters = allParameters.filter((parameter) =>
                    stationParameterIds.has(parameter.id),
                );

                setStationParameters(filteredParameters);
            } catch (error) {
                console.error("Erro ao carregar parâmetros da estação:", error);
                if (isMounted) {
                    setStationParameters([]);
                    toast.error("Não foi possível carregar os parâmetros da estação.");
                }
            } finally {
                if (isMounted) {
                    setIsLoadingParameters(false);
                }
            }
        };
        void loadStationParameters();

        return () => {
            isMounted = false;
        };
    }, [stationId]);

    return (
        <div className="w-full mx-auto flex flex-col content-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Parâmetros da estação</h2>
                <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
                    onClick={onClose}
                >
                    &times;
                </button>
            </div>

            <div className="min-h-0 flex-1 flex flex-col">
                {isLoadingParameters ? (
                    <div className="p-8 text-sm text-gray-500 flex justify-center items-center">
                        Carregando parâmetros...
                    </div>
                ) : stationParameters.length > 0 ? (
                    <>
                        <div className="min-h-0 overflow-y-auto">
                            <TableBase
                                data={stationParameters}
                                columns={columns}
                                rowClassName="hover:bg-[#e8f5e9]/50 group"
                                getRowKey={(item) => item.id.toString()}
                                renderActions={(item) => (
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            title="Configurar Limites"
                                            type="button"
                                            className="cursor-pointer"
                                            onClick={() =>
                                                setExpandedParameter((prev) =>
                                                    prev?.id === item.id ? null : item,
                                                )
                                            }
                                        >
                                            <Bolt className="text-gray-400 hover:text-tecsus-green w-4 h-4 md:w-5 md:h-5 shrink-0"></Bolt>
                                        </button>
                                    </div>
                                )}
                            />
                        </div>
                        {expandedParameter && (
                            <div className="shrink-0 border-t border-gray-100">
                                <LimitsForm
                                    onClose={() => setExpandedParameter(null)}
                                    stationId={stationId}
                                    fixedParameter={expandedParameter}
                                    inline
                                    onSuccess={() => {
                                        onSuccess?.();
                                    }}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-8 text-sm text-gray-500 flex justify-center items-center">
                        Nenhum parâmetro encontrado. Cadastre seu primeiro parâmetro!
                    </div>
                )}
            </div>
        </div>
    )
}