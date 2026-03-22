import { useState } from "react";
import { Search, Plus, Check, ArrowLeft } from "lucide-react";

const MOCK_PARAMETROS = [
  { id: 1, nome: "Temperatura", unidade: "Celsius (°C)", fator: 1, offset: 0 },
  { id: 2, nome: "Umidade do ar", unidade: "Porcentagem (%)", fator: 1, offset: 0 },
  { id: 3, nome: "Pluviosidade", unidade: "Milímetro (mm)", fator: 0.2, offset: 0 },
  { id: 4, nome: "Pressão atmosférica", unidade: "Hectopascal (hPa)", fator: 1, offset: 1013.25 },
];

interface ParameterSelectionFormProps {
  selectedParams: number[];
  toggleParam: (id: number) => void;
}

export function ParameterSelectionForm({ selectedParams, toggleParam }: ParameterSelectionFormProps) {
  const [buscaParam, setBuscaParam] = useState("");
  const [isAddingNewParam, setIsAddingNewParam] = useState(false);

  const parametrosFiltrados = MOCK_PARAMETROS.filter((p) =>
    p.nome.toLowerCase().includes(buscaParam.toLowerCase())
  );

  // ==========================================
  // ESTADO 2: MODO "CRIAR NOVO PARÂMETRO"
  // ==========================================
  if (isAddingNewParam) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <button 
            type="button" 
            onClick={() => setIsAddingNewParam(false)} 
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Voltar para a lista"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 className="text-base font-bold text-gray-800">Novo parâmetro</h4>
            <p className="text-xs text-gray-500 mt-0.5">Cadastre e selecione automaticamente.</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mb-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Nome <span className="text-red-500">*</span></span>
            <input className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green shadow-sm transition-all" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Unidade de medida <span className="text-red-500">*</span></span>
            <input className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green shadow-sm transition-all" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-700">Fator <span className="text-red-500">*</span></span>
              <input className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green shadow-sm transition-all" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-700">Desvio (offset) <span className="text-red-500">*</span></span>
              <input className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green shadow-sm transition-all" />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Observações <span className="font-normal text-gray-400">(opcional)</span></span>
            <textarea rows={2} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green shadow-sm transition-all resize-none" />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={() => setIsAddingNewParam(false)} className="px-5 py-2 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={() => setIsAddingNewParam(false)} className="px-5 py-2 text-sm font-semibold bg-tecsus-green text-white hover:bg-tecsus-green/90 rounded-lg transition-colors shadow-sm">
            Enviar
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // ESTADO 1: MODO "LISTAGEM/SELEÇÃO"
  // ==========================================
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

      <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar mb-4 pr-1 max-h-[300px]">
        {parametrosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Nenhum parâmetro encontrado com esse nome.
          </div>
        ) : (
          parametrosFiltrados.map((param) => {
            const isSelected = selectedParams.includes(param.id);
            return (
              <label
                key={param.id}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-tecsus-green bg-tecsus-green/5 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
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
                    {param.nome}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><span className="font-medium text-gray-600">Unid:</span> {param.unidade}</span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1"><span className="font-medium text-gray-600">Fator:</span> {param.fator}</span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1"><span className="font-medium text-gray-600">Offset:</span> {param.offset}</span>
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>

      <div className="shrink-0 pt-2 border-t border-gray-100 mt-auto">
        <button
          type="button"
          onClick={() => setIsAddingNewParam(true)}
          className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:text-tecsus-green hover:border-tecsus-green hover:bg-tecsus-green/5 transition-all flex items-center justify-center gap-2 group"
        >
          <Plus size={18} className="text-gray-400 group-hover:text-tecsus-green transition-colors" />
          Criar novo parâmetro
        </button>
      </div>
    </div>
  );
}