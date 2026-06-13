import { TriangleAlert } from "lucide-react";
import { BaseModal } from "./ui/BaseModal";

type DeleteStationModalProps = {
  isOpen: boolean;
  stationName?: string;
  isDeleting: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function DeleteStationModal({
  isOpen,
  stationName,
  isDeleting,
  errorMessage,
  onCancel,
  onConfirm,
}: DeleteStationModalProps) {
  
  const customFooter = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onCancel}
        disabled={isDeleting}
        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isDeleting}
        className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50"
      >
        {isDeleting ? "Excluindo..." : "Excluir"}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onCancel}
      title="Confirmar Exclusão"
      onCancel={onCancel}
      maxWidth="md"
      customFooter={customFooter}
    >
      <div className="flex flex-col items-center justify-center py-2 gap-4 text-center">
        {errorMessage && (
          <div className="w-full mb-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            {errorMessage}
          </div>
        )}
        <div className="p-4 bg-red-50 rounded-full">
          <TriangleAlert className="text-red-600 w-8 h-8" />
        </div>
        <div>
          <p className="text-gray-900 font-medium text-base">
            Tem certeza que deseja excluir{stationName ? ` a estação "${stationName}"` : " esta estação"}?
          </p>
          <p className="text-sm text-red-500 mt-1">
            Essa ação não pode ser desfeita.
          </p>
        </div>
      </div>
    </BaseModal>
  );
}