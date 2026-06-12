import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateStationModal } from "../services/station-service";
import { stationParameterService } from "../services/station-parameter-service";
import { StationBasicForm } from "./forms/StationBasicForm";
import { ParameterSelectionForm } from "./forms/ParameterSelectionForm";
import { BaseModal } from "./ui/BaseModal";

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

  const handleSubmeterCadastro = async () => {
    try {
      const createdStation = await modal.submit({ preventDefault: () => {} } as unknown as React.FormEvent<HTMLFormElement>);

      if (createdStation && createdStation.id) {
        for (const idTypeParam of selectedParams) {
          await stationParameterService.create({
            idStation: Number(createdStation.id),
            idTypeParam: idTypeParam,
            isActive: true,
          });
        }
        toast.success("Estação e parâmetros cadastrados com sucesso!");
        handleClose();
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Estação criada, mas houve um erro ao atrelar os sensores.");
    }
  };

  
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
      onClose={handleClose}
      title="Cadastrar Nova Estação"
      subtitle="Configure os dados e os sensores atrelados."
      maxWidth="2xl" 
      headerContent={tabsContent}
      onCancel={handleClose}
      
      confirmText={activeTab === "station" ? "Avançar para Parâmetros" : "Concluir Cadastro"}
      onConfirm={() => activeTab === "station" ? setActiveTab("parameters") : handleSubmeterCadastro()}
      isLoading={modal.isCreating}
    >
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
          isCreatingStation={true}
        />
      )}
    </BaseModal>
  );
}