import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "react-toastify";

const DEFAULT_API_BASE_URL = "http://localhost:3333";

export interface Station {
  id: string;
  nome: string;
  codigo: string;
  cidade: string;
  latitude: string;
  longitude: string;
  status: string;
  isActive: boolean;
}

export type Estacao = Station;

export interface StationApi {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  idDatalogger: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateStationInput {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  idDatalogger: string;
  status: string;
  isActive?: boolean;
}

function getApiBaseUrl(): string {
  const fromEnv = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  const normalized = (fromEnv?.trim() || DEFAULT_API_BASE_URL).replace(
    /\/+$/,
    "",
  );
  return normalized;
}

function isAbortError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as any).name === "AbortError"
  );
}

async function fetchJson<T>(
  path: string,
  init?: RequestInit & { signal?: AbortSignal },
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, init);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export function getEmptyCreateStationInput(): CreateStationInput {
  return {
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    idDatalogger: "",
    status: "",
    isActive: true,
  };
}

export function validateCreateStationInput(
  input: CreateStationInput,
): string | null {
  if (!input.name.trim() || !input.address.trim()) {
    return "Preencha pelo menos Nome e Endereço.";
  }
  if (!input.latitude.trim() || !input.longitude.trim()) {
    return "Latitude e Longitude são obrigatórios.";
  }
  if (!input.idDatalogger.trim()) {
    return "Código (ID Datalogger) é obrigatório.";
  }
  if (!input.status.trim()) {
    return "Status é obrigatório.";
  }
  return null;
}

export function mapStationApiToEstacaoModel(station: StationApi): Station {
  return {
    id: String(station.id),
    nome: station.name || "",
    codigo: station.idDatalogger || "",
    cidade: station.address || "",
    latitude: station.latitude || "",
    longitude: station.longitude || "",
    status: station.status || "",
    isActive: station.isActive ?? true,
  };
}

export function mapStationApiToCreateStationInput(
  station: StationApi,
): CreateStationInput {
  return {
    name: station.name ?? "",
    address: station.address ?? "",
    latitude: station.latitude ?? "",
    longitude: station.longitude ?? "",
    idDatalogger: station.idDatalogger ?? "",
    status: station.status ?? "",
    isActive: station.isActive ?? true,
  };
}

export async function getStationById(
  id: string,
  options?: { signal?: AbortSignal },
): Promise<StationApi> {
  return fetchJson<StationApi>(`/stations/${id}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });
}

export async function listStations(options?: {
  signal?: AbortSignal;
}): Promise<Station[]> {
  const data = await fetchJson<StationApi[]>("/stations", {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });
  return data.map(mapStationApiToEstacaoModel);
}

export async function createStation(
  input: CreateStationInput,
): Promise<Station> {
  const payload = {
    name: input.name,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    idDatalogger: input.idDatalogger,
    status: input.status,
    ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
  };

  const created = await fetchJson<StationApi>("/stations/create", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return mapStationApiToEstacaoModel(created);
}

export async function updateStation(
  id: string,
  input: CreateStationInput,
): Promise<Station> {
  const payload = {
    name: input.name,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    idDatalogger: input.idDatalogger,
    status: input.status,
    ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
  };

  const updated = await fetchJson<StationApi>(`/stations/update/${id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return mapStationApiToEstacaoModel(updated);
}

export function useStationsList() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async (options?: { signal?: AbortSignal }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listStations(options);
      setStations(data);
    } catch (err: unknown) {
      if (isAbortError(err)) return;
      setErrorMessage("Não foi possível carregar as estações.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void reload({ signal: controller.signal });
    return () => controller.abort();
  }, [reload]);

  return {
    stations,
    isLoading,
    errorMessage,
    reload,
  };
}

export function useCreateStationModal(onCreated?: () => void | Promise<void>) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CreateStationInput>(
    getEmptyCreateStationInput(),
  );
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const open = useCallback(() => {
    setErrorMessage(null);
    setForm(getEmptyCreateStationInput());
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (isCreating) return;
    setIsOpen(false);
    setErrorMessage(null);
  }, [isCreating]);

  const submit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMessage(null);

      const validationError = validateCreateStationInput(form);
      if (validationError) return setErrorMessage(validationError);

      setIsCreating(true);
      try {
        const created = await createStation(form);
        return created;
      } catch {
        setErrorMessage("Não foi possível cadastrar a estação.");
        toast.error("Não foi possível cadastrar a estação.");
      } finally {
        setIsCreating(false);
      }
    },
    [form, onCreated],
  );

  return {
    isOpen,
    open,
    close,
    form,
    setForm,
    isCreating,
    errorMessage,
    submit,
  };
}

export function useEditStationModal(onUpdated?: () => void | Promise<void>) {
  const [isOpen, setIsOpen] = useState(false);
  const [stationId, setStationId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateStationInput>(
    getEmptyCreateStationInput(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const open = useCallback(async (id: string) => {
    setErrorMessage(null);
    setIsOpen(true);
    setStationId(id);
    setIsLoading(true);

    try {
      const station = await getStationById(id);
      setForm(mapStationApiToCreateStationInput(station));
    } catch {
      setErrorMessage("Não foi possível carregar os dados da estação.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    if (isSaving) return;
    setIsOpen(false);
    setStationId(null);
    setErrorMessage(null);
  }, [isSaving]);

  const submit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMessage(null);

      if (!stationId) {
        setErrorMessage("Estação inválida.");
        return;
      }

      const validationError = validateCreateStationInput(form);
      if (validationError) return setErrorMessage(validationError);

      setIsSaving(true);
      try {
        const updated = await updateStation(stationId, form);
        return updated;
      } catch {
        setErrorMessage("Não foi possível atualizar a estação.");
        toast.error("Não foi possível atualizar a estação.");
      } finally {
        setIsSaving(false);
      }
    },
    [form, onUpdated, stationId],
  );

  return {
    isOpen,
    open,
    close,
    stationId,
    form,
    setForm,
    isLoading,
    isSaving,
    errorMessage,
    submit,
  };
}

export function stationFilter(estacoes: Station[], termo: string): Station[] {
  const termoNormalizado = termo.trim().toLowerCase();
  if (!termoNormalizado) return estacoes;

  return estacoes.filter((estacao) => {
    const nome = estacao.nome.toLowerCase();
    const codigo = estacao.codigo.toLowerCase();
    return nome.includes(termoNormalizado) || codigo.includes(termoNormalizado);
  });
}

export async function deleteStation(
  id: string,
  options?: {
    confirm?: boolean;
    confirmMessage?: string;
    stationName?: string;
    signal?: AbortSignal;
  },
): Promise<void> {
  const confirmDelete = options?.confirm !== false;
  if (confirmDelete && typeof window !== "undefined") {
    const message =
      options?.confirmMessage ??
      (options?.stationName
        ? `Tem certeza que deseja excluir a estação "${options.stationName}"?`
        : "Tem certeza que deseja excluir esta estação?");

    if (!window.confirm(message)) return;
  }

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/stations/delete/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete station (status ${response.status})`);
  }
}
