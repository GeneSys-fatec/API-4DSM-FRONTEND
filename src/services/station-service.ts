import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "react-toastify";
import { apiFetch, buildQueryString } from './api';

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

export interface StationListFilters {
  q?: string;
  status?: string;
  isActive?: boolean;
  user?: string;
  idDatalogger?: string;
  from?: string;
  to?: string;
}

function isAbortError(err: unknown): err is { name: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name?: string }).name === "AbortError"
  );
}

async function fetchJson<T>(
  path: string,
  init?: RequestInit & { signal?: AbortSignal },
): Promise<T> {
  const response = await apiFetch(path, init);

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
    signal: options?.signal,
  });
}

export async function listStations(options?: {
  signal?: AbortSignal;
  filters?: StationListFilters;
}): Promise<Station[]> {
  const queryString = buildQueryString({
    q: options?.filters?.q,
    status: options?.filters?.status,
    isActive: options?.filters?.isActive,
    user: options?.filters?.user,
    idDatalogger: options?.filters?.idDatalogger,
    from: options?.filters?.from,
    to: options?.filters?.to,
  });

  const data = await fetchJson<StationApi[]>(`/stations${queryString}`, {
    method: "GET",
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
    body: JSON.stringify(payload),
  });

  return mapStationApiToEstacaoModel(updated);
}

export function useStationsList(filters?: StationListFilters) {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async (options?: { signal?: AbortSignal; filters?: StationListFilters }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listStations({
        signal: options?.signal,
        filters: options?.filters ?? filters,
      });
      setStations(data);
    } catch (err: unknown) {
      if (isAbortError(err)) return;
      setErrorMessage("Não foi possível carregar as estações.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    void reload({ signal: controller.signal, filters });
    return () => controller.abort();
  }, [reload, filters]);

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
        await onCreated?.();
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
        await onUpdated?.();
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

function normalizeString(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase();
}


export function stationFilter(estacoes: Station[], termo: string): Station[] {
  if (!termo.trim()) return estacoes;
  const termoNormalizado = normalizeString(termo.trim());

  return estacoes.filter((estacao) => {    
    const nome = normalizeString(estacao.nome);
    const cidade = normalizeString(estacao.cidade);
    const codigo = normalizeString(estacao.codigo);

    return (
      nome.includes(termoNormalizado) ||
      cidade.includes(termoNormalizado) ||
      codigo.includes(termoNormalizado)
    );
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

  const response = await apiFetch(`/stations/delete/${id}`, {
    method: "DELETE",
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete station (status ${response.status})`);
  }
}

export async function listPublicStations(options?: { signal?: AbortSignal }): Promise<Station[]> {
  const data = await fetchJson<StationApi[]>("/stations/public", {
    method: "GET",
    signal: options?.signal,
  });
  return data.map(mapStationApiToEstacaoModel);
}

export interface StationMapApi {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
  idDatalogger: string;
}

export async function listMapStations(
  options?: { signal?: AbortSignal },
): Promise<StationMapApi[]> {
  return fetchJson<StationMapApi[]>("/map/stations", {
    method: "GET",
    signal: options?.signal,
  });
}

export function useMapStationsList() {
  const [stations, setStations] = useState<StationMapApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async (options?: { signal?: AbortSignal }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listMapStations(options);
      setStations(data);
    } catch (err: unknown) {
      if (isAbortError(err)) return;
      setErrorMessage("Não foi possível carregar as estações para o mapa.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void reload({ signal: controller.signal });
    return () => controller.abort();
  }, [reload]);

  return { stations, isLoading, errorMessage, reload };
}


export function usePublicStationsList() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async (options?: { signal?: AbortSignal }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listPublicStations(options);
      setStations(data);
    } catch (err: unknown) {
      if (isAbortError(err)) return;
      setErrorMessage("Não foi possível carregar as estações públicas.");
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