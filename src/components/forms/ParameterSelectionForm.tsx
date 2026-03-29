import { useState, useEffect } from "react";
import { Search, Plus, Check, ArrowLeft } from "lucide-react";
import { parameterService, type Parameter } from "../../services/parameter-service";
import { ParameterForm } from "./ParameterForm";

interface ParameterSelectionFormProps {
  selectedParams: number[];
  toggleParam: (idTypeParam: number) => void;
  isCreatingStation?: boolean;
}

export function ParameterSelectionForm({
  selectedParams,
  toggleParam,
  isCreatingStation = false,
}: ParameterSelectionFormProps) {
  const [buscaParam, setBuscaParam] = useState("");
  const [isAddingNewParam, setIsAddingNewParam] = useState(false);
  const [parametrosDisponiveis, setParametrosDisponiveis] = useState<Parameter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadParameters = async () => {
    setIsLoading(true);
    const data = await parameterService.findAll();
    setParametrosDisponiveis(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadParameters();
  }, []);

  const parametrosFiltrados = parametrosDisponiveis.filter((p) =>
    p.name.toLowerCase().includes(buscaParam.toLowerCase()),
  );

  if (isAddingNewParam) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center py-4">
        {isCreatingStation && (
          <div className="w-full flex justify-start mb-4">
            <button
              type="button"
              onClick={() => setIsAddingNewParam(false)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-tecsus-green transition-colors"
            >
              <ArrowLeft size={18} />
              Voltar para seleção de parâmetros
            </button>
          </div>
        )}
        <ParameterForm
          mode="create"
          onClose={() => setIsAddingNewParam(false)}
          onSuccess={() => {
            setIsAddingNewParam(false);
            loadParameters();
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300 flex flex-col h-full">
      <div className="relative mb-4 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar parâmetros..."
          value={buscaParam}
          onChange={(e) => setBuscaParam(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green transition-all"
        />
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar mb-4 pr-1 max-h-[350px]">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Carregando parâmetros...</div>
        ) : parametrosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Nenhum parâmetro encontrado.
          </div>
        ) : (
          parametrosFiltrados.map((param) => {
            const isSelected = selectedParams.includes(param.id);
            return (
              <div
                key={param.id}
                className={`flex flex-col p-4 rounded-xl border-2 transition-all duration-200 ${isSelected ? "border-tecsus-green bg-tecsus-green/5 shadow-sm" : "border-gray-100 bg-white hover:border-gray-300"}`}
              >
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleParam(param.id)}
                      className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-tecsus-green checked:border-tecsus-green transition-all cursor-pointer"
                    />
                    <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold transition-colors ${isSelected ? "text-tecsus-green" : "text-gray-900"}`}>
                      {param.name}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                      <span><span className="font-medium text-gray-600">JSON Key:</span> {param.json_key || "Não definida"}</span>
                      <span className="text-gray-300">•</span>
                      <span><span className="font-medium text-gray-600">Unid:</span> {param.unit}</span>
                    </div>
                  </div>
                </label>
              </div>
            );
          })
        )}
      </div>

      <div className="shrink-0 pt-2 border-t border-gray-100 mt-auto">
        <button type="button" onClick={() => setIsAddingNewParam(true)} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:text-tecsus-green hover:border-tecsus-green hover:bg-tecsus-green/5 transition-all flex items-center justify-center gap-2 group">
          <Plus size={18} className="text-gray-400 group-hover:text-tecsus-green transition-colors" />
          Criar novo parâmetro
        </button>
      </div>
    </div>
  );
}