import { useEffect, useMemo, useState } from "react";
import { Edit2, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmDelete } from "../components/ConfirmDelete";
import { AlertForm } from "../components/forms/AlertForm";
import { TableBase, type TableColumn } from "../components/TableBody";
import {
  alertFilter,
  createAlert,
  deleteAlert,
  listAlerts,
  updateAlert,
  type AlertModel,
  type AlertPayload,
  type UpdateAlertPayload,
} from "../services/alert-service";

function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Alerts() {
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alertToDelete, setAlertToDelete] = useState<AlertModel | null>(null);

  const loadAlerts = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listAlerts();
      setAlerts(data);
    } catch {
      setErrorMessage("Não foi possível carregar os alertas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAlerts();
  }, []);

  const filteredAlerts = useMemo(() => alertFilter(alerts, searchTerm), [alerts, searchTerm]);

  const columns: TableColumn<AlertModel>[] = [
    {
      key: "parameterId",
      header: "Parâmetro",
      render: (item) => <span className="font-semibold text-gray-900">#{item.parameterId}</span>,
    },
    {
      key: "measuredValue",
      header: "Valor medido",
      render: (item) => item.measuredValue.toString(),
    },
    {
      key: "occurredAt",
      header: "Ocorrência",
      render: (item) => formatDateTime(item.occurredAt),
    },
    {
      key: "description",
      header: "Descrição",
      render: (item) => item.description,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide ${
            item.status === "active"
              ? "bg-red-100 text-red-700"
              : "bg-tecsus-green/10 text-tecsus-green"
          }`}
        >
          {item.status === "active" ? "ATIVO" : "RESOLVIDO"}
        </span>
      ),
    },
  ];

  const closeForm = () => {
    if (isSubmitting) return;
    setIsFormOpen(false);
    setEditingAlert(null);
  };

  const handleCreate = () => {
    setEditingAlert(null);
    setIsFormOpen(true);
  };

  const handleEdit = (alert: AlertModel) => {
    setEditingAlert(alert);
    setIsFormOpen(true);
  };

  const handleSubmit = async (payload: AlertPayload | UpdateAlertPayload) => {
    setIsSubmitting(true);

    try {
      if (editingAlert) {
        await updateAlert(editingAlert.id, payload as UpdateAlertPayload);
        toast.success("Alerta atualizado com sucesso!");
      } else {
        await createAlert(payload as AlertPayload);
        toast.success("Alerta cadastrado com sucesso!");
      }

      await loadAlerts();
      closeForm();
    } catch {
      toast.error(editingAlert ? "Não foi possível atualizar o alerta." : "Não foi possível cadastrar o alerta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!alertToDelete) return;

    try {
      await deleteAlert(alertToDelete.id);
      toast.success("Alerta excluído com sucesso!");
      await loadAlerts();
      setAlertToDelete(null);
    } catch {
      toast.error("Não foi possível excluir o alerta.");
    }
  };

  return (
    <div className="max-w-8xl mx-auto w-full p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Alertas registrados</h1>

        <div className="flex gap-3 items-center w-full md:w-auto">
          <div className="relative w-full md:w-72 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar alerta"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="bg-tecsus-green text-white font-semibold text-sm p-2 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md whitespace-nowrap"
          >
            Cadastrar alerta
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-sm text-gray-500 flex justify-center items-center">Carregando alertas...</div>
        ) : errorMessage ? (
          <div className="p-8 text-sm text-red-500 flex justify-center items-center">{errorMessage}</div>
        ) : filteredAlerts.length > 0 ? (
          <TableBase
            data={filteredAlerts}
            columns={columns}
            rowClassName="hover:bg-[#e8f5e9]/50 group"
            getRowKey={(item) => item.id}
            renderActions={(item) => (
              <div className="flex items-center justify-end gap-3">
                <button type="button" className="cursor-pointer" onClick={() => handleEdit(item)}>
                  <Edit2 className="text-gray-400 hover:text-tecsus-green w-4 h-4 md:w-5 md:h-5 shrink-0" />
                </button>
                <button type="button" className="cursor-pointer" onClick={() => setAlertToDelete(item)}>
                  <Trash2 className="text-gray-400 hover:text-red-600 w-4 h-4 md:w-5 md:h-5 shrink-0" />
                </button>
              </div>
            )}
          />
        ) : (
          <div className="p-8 text-sm text-gray-500 flex justify-center items-center">
            Nenhum alerta encontrado.
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-80 bg-black/40 flex items-center justify-center p-4" onClick={closeForm}>
          <div onClick={(event) => event.stopPropagation()}>
            <AlertForm
              mode={editingAlert ? "edit" : "create"}
              initialAlert={editingAlert ?? undefined}
              isSubmitting={isSubmitting}
              onCancel={closeForm}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}

      {alertToDelete && (
        <div className="fixed inset-0 z-80 bg-black/40 flex items-center justify-center p-4" onClick={() => setAlertToDelete(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <ConfirmDelete onClose={() => setAlertToDelete(null)} onConfirm={handleDelete} />
          </div>
        </div>
      )}
    </div>
  );
}
