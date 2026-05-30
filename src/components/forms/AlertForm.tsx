import { useMemo, useState } from "react";
import type { AlertModel, AlertPayload, UpdateAlertPayload } from "../../services/alert-service";
import { getEmptyAlertPayload, validateAlertPayload } from "../../services/alert-service";

interface AlertFormProps {
  mode: "create" | "edit";
  initialAlert?: AlertModel;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: AlertPayload | UpdateAlertPayload) => Promise<void>;
}

function toDatetimeLocalString(isoDate: string): string {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AlertForm({ mode, initialAlert, isSubmitting, onCancel, onSubmit }: AlertFormProps) {
  const isEditMode = mode === "edit";

  const initialPayload = useMemo(() => {
    if (!initialAlert) return getEmptyAlertPayload();

    return {
      parameterId: initialAlert.parameterId,
      measuredValue: initialAlert.measuredValue,
      occurredAt: toDatetimeLocalString(initialAlert.occurredAt),
      description: initialAlert.description,
    } satisfies AlertPayload;
  }, [initialAlert]);

  const [formData, setFormData] = useState<AlertPayload>(initialPayload);
  const [status, setStatus] = useState<"active" | "resolved">(initialAlert?.status ?? "active");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const validationError = validateAlertPayload(formData);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload: AlertPayload | UpdateAlertPayload = {
      ...formData,
      occurredAt: new Date(formData.occurredAt).toISOString(),
      ...(isEditMode ? { status } : {}),
    };

    await onSubmit(payload);
  };

  return (
    <div className="w-[92vw] max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl bg-white p-5 md:p-6 shadow-xl border border-gray-100">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
          {isEditMode ? "Editar alerta" : "Novo alerta"}
        </h1>
        <button
          type="button"
          className="text-2xl text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          &times;
        </button>
      </div>

      <form className="flex flex-col justify-center gap-5" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            {errorMessage}
          </div>
        )}

        <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
          <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
            ID do parâmetro <span className="text-gray-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={formData.parameterId || ""}
            onChange={(e) => setFormData((state) => ({ ...state, parameterId: Number(e.target.value) }))}
            className="w-full outline-none text-sm"
            required
          />
        </div>

        <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
          <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
            Valor medido <span className="text-gray-500">*</span>
          </label>
          <input
            type="number"
            step="0.0001"
            value={formData.measuredValue}
            onChange={(e) => setFormData((state) => ({ ...state, measuredValue: Number(e.target.value) }))}
            className="w-full outline-none text-sm"
            required
          />
        </div>

        <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
          <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
            Data/hora da ocorrência <span className="text-gray-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.occurredAt}
            onChange={(e) => setFormData((state) => ({ ...state, occurredAt: e.target.value }))}
            className="w-full outline-none text-sm"
            required
          />
        </div>

        <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
          <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
            Descrição <span className="text-gray-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((state) => ({ ...state, description: e.target.value }))}
            className="w-full outline-none text-sm"
            rows={3}
            required
          />
        </div>

        {isEditMode && (
          <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "resolved")}
              className="w-full outline-none text-sm bg-transparent"
            >
              <option value="active">Ativo</option>
              <option value="resolved">Resolvido</option>
            </select>
          </div>
        )}

        <div className="flex self-end gap-2">
          <button
            type="button"
            className="bg-gray-400 font-semibold text-sm p-2 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-tecsus-green text-white font-semibold text-sm p-2 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : isEditMode ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
