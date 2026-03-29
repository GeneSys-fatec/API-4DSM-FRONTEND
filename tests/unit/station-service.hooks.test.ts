import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getEmptyCreateStationInput,
  useCreateStationModal,
  useEditStationModal,
  useStationsList,
} from "../../src/services/station-service";

function makeFakeFormEvent() {
  return { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;
}

function mockFetchJsonOnce(data: unknown, init?: { ok?: boolean; status?: number }) {
  const ok = init?.ok ?? true;
  const status = init?.status ?? 200;

  (globalThis.fetch as any as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    json: async () => data,
  });
}

describe("station-service (hooks) - Fluxo Completo: Cadastro, Edição, Listagem e Remoção", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("Fluxo 1: Administrador abre modal de cadastro com formulário vazio", () => {
    const { result } = renderHook(() => useCreateStationModal());
    act(() => result.current.open());

    expect(result.current.isOpen).toBe(true);
    expect(result.current.form).toEqual(getEmptyCreateStationInput());
    expect(result.current.errorMessage).toBeNull();
  });

  it("Fluxo 1: Modal de cadastro valida campos obrigatórios antes de enviar", async () => {
    const { result } = renderHook(() => useCreateStationModal());
    act(() => result.current.open());

    await act(async () => {
      await result.current.submit(makeFakeFormEvent());
    });

    expect(result.current.errorMessage).toMatch(/Preencha pelo menos/);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("Fluxo 1: Administrador cadastra estação e o hook devolve a entidade", async () => {
    mockFetchJsonOnce({
      id: 1,
      name: "Estação Meteorológica Sul",
      address: "São Paulo, SP",
      latitude: "-23.5",
      longitude: "-46.6",
      idDatalogger: "DL-001",
      status: "Ativa",
      isActive: true,
      createdAt: "",
      updatedAt: "",
      createdBy: "",
      updatedBy: "",
    });

    const { result } = renderHook(() => useCreateStationModal());
    act(() => result.current.open());

    act(() => {
      result.current.setForm({
        name: "Estação Meteorológica Sul",
        address: "São Paulo, SP",
        latitude: "-23.5",
        longitude: "-46.6",
        idDatalogger: "DL-001",
        status: "Ativa",
        isActive: true,
      });
    });

    let createdStation;
    await act(async () => {
      createdStation = await result.current.submit(makeFakeFormEvent());
    });

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    expect(createdStation).toBeDefined();
    expect(createdStation?.nome).toBe("Estação Meteorológica Sul");
    expect(result.current.errorMessage).toBeNull();
  });

  it("Fluxo 2: Administrador lista todas as estações cadastradas ao abrir página", async () => {
    mockFetchJsonOnce([
      {
        id: 1,
        name: "Estação Meteorológica Sul",
        address: "São Paulo, SP",
        latitude: "-23.5",
        longitude: "-46.6",
        idDatalogger: "DL-001",
        status: "Ativa",
        isActive: true,
        createdAt: "",
        updatedAt: "",
        createdBy: "",
        updatedBy: "",
      },
    ]);

    const { result } = renderHook(() => useStationsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.stations).toHaveLength(1);
    expect(result.current.stations[0].nome).toBe("Estação Meteorológica Sul");
  });

  it("Fluxo 2: Sistema exibe mensagem de erro se carregamento de estações falhar", async () => {
    mockFetchJsonOnce({ message: "Erro no servidor" }, { ok: false, status: 500 });

    const { result } = renderHook(() => useStationsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.errorMessage).toBe("Não foi possível carregar as estações.");
  });

  it("Fluxo 3: Administrador abre modal de edição e carrega dados da estação", async () => {
    mockFetchJsonOnce({
      id: 9,
      name: "Estação Nordeste",
      address: "Recife, PE",
      latitude: "-8.0",
      longitude: "-34.8",
      idDatalogger: "DL-009",
      status: "Ativa",
      isActive: true,
      createdAt: "",
      updatedAt: "",
      createdBy: "",
      updatedBy: "",
    });

    const { result } = renderHook(() => useEditStationModal());

    await act(async () => {
      await result.current.open("9");
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.stationId).toBe("9");
    await waitFor(() => {
      expect(result.current.form.name).toBe("Estação Nordeste");
      expect(result.current.form.idDatalogger).toBe("DL-009");
      expect(result.current.form.isActive).toBe(true);
    });
  });

  it("Fluxo 3: Administrador edita estação e salva alterações com sucesso", async () => {
    mockFetchJsonOnce({
      id: 9,
      name: "Estação Nordeste",
      address: "Recife, PE",
      latitude: "-8.0",
      longitude: "-34.8",
      idDatalogger: "DL-009",
      status: "Ativa",
      isActive: true,
    });

    mockFetchJsonOnce({
      id: 9,
      name: "Estação Nordeste Atualizada",
      address: "Recife, PE",
      latitude: "-8.0",
      longitude: "-34.8",
      idDatalogger: "DL-009",
      status: "Ativa",
      isActive: true,
    });

    const { result } = renderHook(() => useEditStationModal());

    await act(async () => {
      await result.current.open("9");
    });

    act(() => {
      result.current.setForm({
        ...result.current.form,
        name: "Estação Nordeste Atualizada",
      });
    });

    let updatedStation;
    await act(async () => {
      updatedStation = await result.current.submit(makeFakeFormEvent());
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(updatedStation).toBeDefined();
    expect(updatedStation?.nome).toBe("Estação Nordeste Atualizada");
    expect(result.current.errorMessage).toBeNull();
  });
});