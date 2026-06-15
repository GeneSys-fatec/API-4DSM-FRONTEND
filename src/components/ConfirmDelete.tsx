import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { BaseModal } from "./ui/BaseModal";

interface ConfirmDeleteProps {
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDelete({ onClose, onConfirm }: ConfirmDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  const customFooter = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onClose}
        disabled={isDeleting}
        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isDeleting}
        className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50"
      >
        {isDeleting ? "Excluindo..." : "Excluir"}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Confirmar Exclusão"
      onCancel={onClose}
      maxWidth="md"
      customFooter={customFooter}
    >
      <div className="flex flex-col items-center justify-center py-2 gap-4 text-center">
        <div className="p-4 bg-red-50 rounded-full">
          <TriangleAlert className="text-red-600 w-8 h-8" />
        </div>
        <div>
          <p className="text-gray-900 font-medium text-base">
            Tem certeza que deseja excluir esse item?
          </p>
          <p className="text-sm text-red-500 mt-1">
            Essa ação não pode ser revertida.
          </p>
        </div>
      </div>
    </BaseModal>
  );
}
