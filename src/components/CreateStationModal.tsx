import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useCreateStationModal } from "../services/station-service";
import { stationParameterService } from "../services/station-parameter-service";
import { StationBasicForm } from "./forms/StationBasicForm";
import { ParameterSelectionForm } from "./forms/ParameterSelectionForm";

type CreateStationModalState = ReturnType<typeof useCreateStationModal>;

export function CreateStationModal({ modal }: { modal: CreateStationModalState }) {
  const [activeTab, setActiveTab] = useState<"station" | "parameters">("station");
  
  
  const [selectedParams, setSelectedParams] = useState<number[]>([]);

  const handleClose = () => {
    modal.close();
    setActiveTab("station");
    setSelectedParams([]);
  };

  const toggleParam = (idTypeParam: number) => {
    setSelectedParams((prev) => 
      prev.includes(idTypeParam)
        ? prev.filter((id) => id !== idTypeParam)
        : [...prev, idTypeParam]
    );
  };
  const handleSubmeterCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const createdStation = await modal.submit(e as unknown as React.FormEvent<HTMLFormElement>);
      
      if (createdStation && createdStation.id) {
        for (const idTypeParam of selectedParams) {
          await stationParameterService.create({
            idStation: Number(createdStation.id),
            idTypeParam: idTypeParam, 
            isActive: true
          });
        }

        console.log("Estação criada com sucesso:", createdStation);
        
        toast.success("Estação e parâmetros cadastrados com sucesso!");
        handleClose();
      }
    } catch (error) {
        console.error("A estação foi criada, mas os parâmetros falharam:", error);
        toast.error("Estação criada, mas houve um erro ao atrelar os sensores.");
    }
  };

  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Cadastrar Nova Estação</h2>
              <p className="text-sm text-gray-500 mt-0.5">Configure os dados e os sensores atrelados.</p>
            </div>
            <button
              onClick={handleClose}
              disabled={modal.isCreating}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex p-1 bg-gray-100/80 rounded-lg">
            <button
              onClick={() => setActiveTab("station")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === "station" ? "bg-tecsus-green text-white shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              1. Dados da Estação
            </button>
            <button
              onClick={() => setActiveTab("parameters")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "parameters" ? "bg-tecsus-green text-white shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              2. Parâmetros Medidos
              {selectedParams.length > 0 && (
                <span className="bg-tecsus-green text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {selectedParams.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto custom-scrollbar flex-1">
          {modal.errorMessage && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {modal.errorMessage}
            </div>
          )}

          <div id="station-form" className="flex flex-col">
            {activeTab === "station" && (
              <StationBasicForm form={modal.form} setForm={modal.setForm} />
            )}
            {activeTab === "parameters" && (
              <ParameterSelectionForm 
                selectedParams={selectedParams} 
                toggleParam={toggleParam}
                isCreatingStation={true}
              />
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={modal.isCreating}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          {activeTab === "station" ? (
            <button
              type="button"
              onClick={() => setActiveTab("parameters")}
              className="px-6 py-2 bg-tecsus-green text-white rounded-lg text-sm font-medium hover:bg-tecsus-green/90 transition-all shadow-sm"
            >
              Avançar para Parâmetros
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmeterCadastro}
              disabled={modal.isCreating}
              className="px-6 py-2 bg-tecsus-green text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {modal.isCreating ? "Salvando..." : "Concluir Cadastro"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}