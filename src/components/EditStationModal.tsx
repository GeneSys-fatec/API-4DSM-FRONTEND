import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useEditStationModal } from "../services/station-service";
import { stationParameterService, type StationParameter } from "../services/station-parameter-service";
import { StationBasicForm } from "./forms/StationBasicForm";
import { ParameterSelectionForm } from "./forms/ParameterSelectionForm";
import { BaseModal } from "./ui/BaseModal";

type EditStationModalState = ReturnType<typeof useEditStationModal>;

export function EditStationModal({ modal }: { modal: EditStationModalState }) {
  const [activeTab, setActiveTab] = useState<"station" | "parameters">("station");
  
  const [selectedParams, setSelectedParams] = useState<number[]>([]);
  const [initialParams, setInitialParams] = useState<{ id: number, idTypeParam: number }[]>([]);
  const [isLoadingParams, setIsLoadingParams] = useState(false);

  useEffect(() => {
    if (modal.isOpen && modal.stationId) {
      loadStationParameters(Number(modal.stationId));
    } else {
      setActiveTab("station");
      setSelectedParams([]);
      setInitialParams([]);
    }
  }, [modal.isOpen, modal.stationId]);

  const loadStationParameters = async (stationId: number) => {
    setIsLoadingParams(true);
    try {
      const paramsFromDb = await stationParameterService.findByStation(stationId);
      
      const mappedParams = paramsFromDb.map((p: StationParameter) => ({
        id: p.id,
        idTypeParam: p.idTypeParam
      }));
      
      setInitialParams(mappedParams);
      setSelectedParams(mappedParams.map(p => p.idTypeParam));
    } catch (error) {
      console.error("Erro ao buscar parâmetros da estação", error);
      toast.error("Erro ao carregar os parâmetros atrelados.");
    } finally {
      setIsLoadingParams(false);
    }
  };

  const toggleParam = (idTypeParam: number) => {
    setSelectedParams((prev) => 
      prev.includes(idTypeParam)
        ? prev.filter((id) => id !== idTypeParam)
        : [...prev, idTypeParam]
    );
  };

  const handleSubmeterEdicao = async () => {
    try {
      // Cast duplo para evitar o erro do ESLint no preventDefault simulado
      const updatedStation = await modal.submit({ preventDefault: () => {} } as unknown as React.FormEvent<HTMLFormElement>);
      
      if (updatedStation && modal.stationId) {
        const currentStationId = Number(modal.stationId);
        const initialIds = initialParams.map(p => p.idTypeParam);

        const toCreate = selectedParams.filter(id => !initialIds.includes(id));
        const toDelete = initialParams.filter(p => !selectedParams.includes(p.idTypeParam));

        for (const param of toDelete) {
          await stationParameterService.delete(param.id);
        }

        for (const idTypeParam of toCreate) {
          await stationParameterService.create({
            idStation: currentStationId,
            idTypeParam: idTypeParam,
            isActive: true
          });
        }
        
        toast.success("Estação e parâmetros atualizados com sucesso!");
        modal.close();
      }
    } catch (error) {
        console.error("Erro na edição:", error);
    }
  };

  // Estrutura das abas injetada no cabeçalho do BaseModal
  const tabsContent = (
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
  );

  return (
    <BaseModal
      isOpen={modal.isOpen}
      onClose={modal.close}
      title="Editar Estação"
      subtitle="Altere os dados e os sensores atrelados à estação."
      maxWidth="2xl"
      headerContent={tabsContent}
      onCancel={modal.close}
      confirmText={activeTab === "station" ? "Avançar para Parâmetros" : "Salvar Alterações"}
      onConfirm={() => activeTab === "station" ? setActiveTab("parameters") : handleSubmeterEdicao()}
      isLoading={modal.isSaving || isLoadingParams}
    >
      {isLoadingParams && activeTab === "parameters" && (
         <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl">
            <span className="text-sm text-gray-500 font-medium animate-pulse">Carregando parâmetros...</span>
         </div>
      )}

      {modal.errorMessage && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          {modal.errorMessage}
        </div>
      )}

      {activeTab === "station" ? (
        <StationBasicForm form={modal.form} setForm={modal.setForm} />
      ) : (
        <ParameterSelectionForm 
          selectedParams={selectedParams} 
          toggleParam={toggleParam} 
          isCreatingStation={false} 
        />
      )}
    </BaseModal>
  );
}