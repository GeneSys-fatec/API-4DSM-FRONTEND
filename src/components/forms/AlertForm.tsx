import { useMemo, useState } from "react";
import type { AlertModel, AlertPayload, UpdateAlertPayload } from "../../services/alert-service";
import { getEmptyAlertPayload, validateAlertPayload } from "../../services/alert-service";
import { BaseModal } from "../ui/BaseModal"; // Ajuste o path para o componente correto

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

  const handleFormSubmit = async () => {
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
    <BaseModal
      isOpen={true}
      onClose={onCancel}
      title={isEditMode ? "Editar alerta" : "Novo alerta"}
      onCancel={onCancel}
      confirmText={isEditMode ? "Salvar" : "Cadastrar"}
      onConfirm={handleFormSubmit}
      isLoading={isSubmitting}
      maxWidth="xl"
    >
      <div className="flex flex-col gap-5">
        {errorMessage && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            {errorMessage}
          </div>
        )}

        <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
          <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
            ID do parâmetro <span className="text-gray-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={formData.parameterId || ""}
            onChange={(e) => setFormData((state) => ({ ...state, parameterId: Number(e.target.value) }))}
            className="w-full outline-none text-sm bg-transparent"
            required
          />
        </div>

        <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
          <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
            Valor medido <span className="text-gray-500">*</span>
          </label>
          <input
            type="number"
            step="0.0001"
            value={formData.measuredValue}
            onChange={(e) => setFormData((state) => ({ ...state, measuredValue: Number(e.target.value) }))}
            className="w-full outline-none text-sm bg-transparent"
            required
          />
        </div>

        <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
          <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
            Data/hora da ocorrência <span className="text-gray-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.occurredAt}
            onChange={(e) => setFormData((state) => ({ ...state, occurredAt: e.target.value }))}
            className="w-full outline-none text-sm bg-transparent"
            required
          />
        </div>

        <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
          <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
            Descrição <span className="text-gray-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((state) => ({ ...state, description: e.target.value }))}
            className="w-full outline-none text-sm bg-transparent"
            rows={3}
            required
          />
        </div>

        {isEditMode && (
          <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
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
      </div>
    </BaseModal>
  );
}