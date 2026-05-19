import { useCallback, useEffect, useState } from "react";
import { Edit2, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmDelete } from "../components/ConfirmDelete";
import { AlertForm } from "../components/forms/AlertForm";
import { TableBase, type TableColumn } from "../components/TableBody";
import {
  createAlert,
  deleteAlert,
  listAlerts,
  updateAlert,
  type AlertListFilters,
  type AlertModel,
  type AlertPayload,
  type UpdateAlertPayload,
} from "../services/alert-service";
import { loadStoredFilters, persistFilters } from "@/utils/filter-storage";

const ALERT_FILTERS_STORAGE_KEY = "@ClimaSense:filters:alerts";

type AlertsFiltersState = {
  q: string;
  status: "" | "active" | "resolved";
  stationId: string;
  parameterId: string;
  user: string;
  from: string;
  to: string;
};

const DEFAULT_FILTERS: AlertsFiltersState = {
  q: "",
  status: "",
  stationId: "",
  parameterId: "",
  user: "",
  from: "",
  to: "",
};

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
  const [filters, setFilters] = useState<AlertsFiltersState>(() =>
    loadStoredFilters(ALERT_FILTERS_STORAGE_KEY, DEFAULT_FILTERS),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alertToDelete, setAlertToDelete] = useState<AlertModel | null>(null);

  const loadAlerts = useCallback(async () => {
    const parsedFilters: AlertListFilters = {
      q: filters.q,
      status: filters.status || undefined,
      stationId: filters.stationId ? Number(filters.stationId) : undefined,
      parameterId: filters.parameterId ? Number(filters.parameterId) : undefined,
      user: filters.user,
      from: filters.from,
      to: filters.to,
    };

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listAlerts(parsedFilters);
      setAlerts(data);
    } catch {
      setErrorMessage("Não foi possível carregar os alertas.");
    } finally {
      setIsLoading(false);
    }
  }, [filters.from, filters.parameterId, filters.q, filters.stationId, filters.status, filters.to, filters.user]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    persistFilters(ALERT_FILTERS_STORAGE_KEY, filters);
  }, [filters]);

  const hasActiveFilters = Boolean(
    filters.q.trim() ||
    filters.status ||
    filters.stationId ||
    filters.parameterId ||
    filters.user ||
    filters.from ||
    filters.to,
  );

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
          className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide ${item.status === "active"
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

        <div className="flex flex-wrap gap-3 items-stretch sm:items-center w-full md:w-auto">
          <div className="relative w-full md:w-72 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar alerta"
              value={filters.q}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  q: e.target.value,
                }))
              }
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green transition-all"
            />
          </div>

          <input
            type="number"
            min="1"
            placeholder="ID Estação"
            value={filters.stationId}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                stationId: e.target.value,
              }))
            }
            className="w-[calc(50%-0.375rem)] sm:w-32 md:w-28 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
          />

          <input
            type="number"
            min="1"
            placeholder="ID Parâmetro"
            value={filters.parameterId}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                parameterId: e.target.value,
              }))
            }
            className="w-[calc(50%-0.375rem)] sm:w-36 md:w-32 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
          />

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as AlertsFiltersState["status"],
              }))
            }
            className="w-[calc(50%-0.375rem)] sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="resolved">Resolvido</option>
          </select>

          <input
            type="text"
            placeholder="Usuário"
            value={filters.user}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                user: e.target.value,
              }))
            }
            className="w-[calc(50%-0.375rem)] sm:w-36 md:w-32 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
          />

          <input
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                from: e.target.value,
              }))
            }
            className="w-[calc(50%-0.375rem)] sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
          />

          <input
            type="date"
            value={filters.to}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                to: e.target.value,
              }))
            }
            className="w-[calc(50%-0.375rem)] sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-tecsus-green focus:border-tecsus-green"
          />

          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="bg-gray-100 text-gray-700 font-semibold text-sm p-2 px-3 hover:bg-gray-200 cursor-pointer rounded-md whitespace-nowrap w-full sm:w-auto min-h-10"
          >
            Limpar
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="bg-tecsus-green text-white font-semibold text-sm p-2 px-3 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md whitespace-nowrap w-full sm:w-auto min-h-10"
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
        ) : alerts.length > 0 ? (
          <TableBase
            data={alerts}
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
            {hasActiveFilters
              ? "Nenhum alerta encontrado para os filtros aplicados."
              : "Nenhum alerta encontrado."}
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
