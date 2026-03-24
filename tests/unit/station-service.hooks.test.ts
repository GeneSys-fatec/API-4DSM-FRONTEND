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
    // Arrange - Critério: "O administrador deve conseguir cadastrar uma estação"
    const { result } = renderHook(() => useCreateStationModal());

    // Act
    act(() => result.current.open());

    // Assert
    expect(result.current.isOpen).toBe(true);
    expect(result.current.form).toEqual(getEmptyCreateStationInput());
    expect(result.current.errorMessage).toBeNull();
  });

  it("Fluxo 1: Modal de cadastro valida campos obrigatórios antes de enviar", async () => {
    // Arrange - Critério: "Implementar validação de campos obrigatórios no formulário"
    const { result } = renderHook(() => useCreateStationModal());
    act(() => result.current.open());

    // Act
    await act(async () => {
      await result.current.submit(makeFakeFormEvent());
    });

    // Assert
    expect(result.current.errorMessage).toMatch(/Preencha pelo menos/);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("Fluxo 1: Administrador cadastra estação com sucesso e modal fecha", async () => {
    // Arrange - Critério: "O administrador deve conseguir cadastrar uma estação"
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

    const onCreated = vi.fn();
    const { result } = renderHook(() => useCreateStationModal(onCreated));
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

    // Act
    await act(async () => {
      await result.current.submit(makeFakeFormEvent());
    });

    // Assert
    expect(globalThis.fetch).toHaveBeenCalledOnce();
    expect(onCreated).toHaveBeenCalledOnce();
    expect(result.current.isOpen).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it("Fluxo 2: Administrador lista todas as estações cadastradas ao abrir página", async () => {
    // Arrange - Critério: "Todas as estações cadastradas devem ser listadas"
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

    // Act
    const { result } = renderHook(() => useStationsList());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.stations).toHaveLength(1);
    expect(result.current.stations[0].nome).toBe("Estação Meteorológica Sul");
  });

  it("Fluxo 2: Sistema exibe mensagem de erro se carregamento de estações falhar", async () => {
    // Arrange - Critério: "Hub de Tratamento de Erro"
    mockFetchJsonOnce({ message: "Erro no servidor" }, { ok: false, status: 500 });

    // Act
    const { result } = renderHook(() => useStationsList());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.errorMessage).toBe("Não foi possível carregar as estações.");
  });

  it("Fluxo 3: Administrador abre modal de edição e carrega dados da estação", async () => {
    // Arrange - Critério: "O sistema deve permitir editar e remover estações"
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

    // Act
    await act(async () => {
      await result.current.open("9");
    });

    // Assert
    expect(result.current.isOpen).toBe(true);
    expect(result.current.stationId).toBe("9");
    await waitFor(() => {
      expect(result.current.form.name).toBe("Estação Nordeste");
      expect(result.current.form.idDatalogger).toBe("DL-009");
      expect(result.current.form.isActive).toBe(true);
    });
  });

  it("Fluxo 3: Administrador edita estação e salva alterações com sucesso", async () => {
    // Arrange - Critério: "O sistema deve permitir editar e remover estações"
    // 1) GET /stations/:id
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

    // 2) PUT /stations/update/:id
    mockFetchJsonOnce({
      id: 9,
      name: "Estação Nordeste Atualizada",
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

    const onUpdated = vi.fn();
    const { result } = renderHook(() => useEditStationModal(onUpdated));

    await act(async () => {
      await result.current.open("9");
    });

    act(() => {
      result.current.setForm({
        ...result.current.form,
        name: "Estação Nordeste Atualizada",
      });
    });

    // Act
    await act(async () => {
      await result.current.submit(makeFakeFormEvent());
    });

    // Assert
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(onUpdated).toHaveBeenCalledOnce();
    expect(result.current.isOpen).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });
});
