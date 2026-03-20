import { X } from "lucide-react";
import { useEditStationModal } from "../services/station-service";

type EditStationModalState = ReturnType<typeof useEditStationModal>;

export function EditStationModal({ modal }: { modal: EditStationModalState }) {
  if (!modal.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Editar estação"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={modal.close}
        aria-label="Fechar"
        disabled={modal.isSaving}
      />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Editar Estação</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Altere os dados e salve as mudanças.
            </p>
          </div>
          <button
            type="button"
            onClick={modal.close}
            disabled={modal.isSaving}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={modal.submit} className="px-6 py-5">
          {modal.isLoading && (
            <div className="mb-4 text-sm text-gray-500">Carregando dados da estação...</div>
          )}

          {modal.errorMessage && (
            <div className="mb-4 text-sm text-red-500">{modal.errorMessage}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Nome da Estação</span>
              <input
                value={modal.form.name}
                onChange={(e) => modal.setForm((s) => ({ ...s, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                autoFocus
                disabled={modal.isLoading || modal.isSaving}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Código (ID Datalogger)</span>
              <input
                value={modal.form.idDatalogger}
                onChange={(e) => modal.setForm((s) => ({ ...s, idDatalogger: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                disabled={modal.isLoading || modal.isSaving}
              />
            </label>

            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Endereço</span>
              <input
                value={modal.form.address}
                onChange={(e) => modal.setForm((s) => ({ ...s, address: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                disabled={modal.isLoading || modal.isSaving}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Latitude</span>
              <input
                value={modal.form.latitude}
                onChange={(e) => modal.setForm((s) => ({ ...s, latitude: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                disabled={modal.isLoading || modal.isSaving}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Longitude</span>
              <input
                value={modal.form.longitude}
                onChange={(e) => modal.setForm((s) => ({ ...s, longitude: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                disabled={modal.isLoading || modal.isSaving}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
              <input
                value={modal.form.status}
                onChange={(e) => modal.setForm((s) => ({ ...s, status: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
                disabled={modal.isLoading || modal.isSaving}
              />
            </label>

            <label className="flex items-center gap-2 sm:items-end sm:pb-1">
              <input
                type="checkbox"
                checked={modal.form.isActive}
                onChange={(e) =>
                  modal.setForm((s) => ({ ...s, isActive: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
                disabled={modal.isLoading || modal.isSaving}
              />
              <span className="text-sm text-gray-600">Ativa</span>
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3"> 
            <button
              type="button"
              onClick={modal.close}
              disabled={modal.isSaving}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={modal.isLoading || modal.isSaving}
              className="px-4 py-2 bg-tecsus-green text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              {modal.isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
