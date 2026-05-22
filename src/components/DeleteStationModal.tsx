import { X } from "lucide-react";
import { createPortal } from "react-dom";

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
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Excluir estação"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-label="Fechar"
        disabled={isDeleting}
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Excluir Estação</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Essa ação não pode ser desfeita.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {errorMessage && <div className="mb-4 text-sm text-red-500">{errorMessage}</div>}

          <p className="text-sm text-gray-700">
            Tem certeza que deseja excluir{stationName ? ` a estação "${stationName}"` : " esta estação"}?
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
