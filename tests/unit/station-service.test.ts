import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import * as api from "../../src/services/api";
import { toast } from "react-toastify";
import { FormEvent } from "react";
import {
  stationFilter,
  mapStationApiToEstacaoModel,
  getEmptyCreateStationInput,
  validateCreateStationInput,
  mapStationApiToCreateStationInput,
  getStationById,
  listStations,
  createStation,
  updateStation,
  deleteStation,
  listPublicStations,
  listMapStations,
  useMapStationsList,
  usePublicStationsList,
  useStationsList,
  useCreateStationModal,
  useEditStationModal,
  type Estacao,
  type StationApi
} from "../../src/services/station-service";

// Mocks Globais
vi.mock("../../src/services/api", () => ({
  apiFetch: vi.fn(),
  buildQueryString: vi.fn(() => "?mock=true"),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("Station Service - Filtro e Mapper (Existentes)", () => {
  const mockEstacoes: Estacao[] = [
    {
      id: "1", nome: "Estação SJC - Centro", codigo: "#123-ABC", cidade: "São José dos Campos",
      latitude: "-23.1791", longitude: "-45.8872", status: "Operante", isActive: true,
    },
    { 
      id: "2", nome: "Estação Jacareí", codigo: "#456-DEF", cidade: "Jacareí",
      latitude: "-23.3053", longitude: "-45.9658", status: "Operante", isActive: true, 
    },
  ];

  it("deve retornar todas as estações quando o termo for vazio ou apenas espaços", () => {
    const resultadoVazio = stationFilter(mockEstacoes, "");
    expect(resultadoVazio).toHaveLength(2);
  });

  it("deve filtrar as estações pelo nome ignorando maiúsculas e minúsculas", () => {
    const resultado = stationFilter(mockEstacoes, "sjc");
    expect(resultado[0].nome).toBe("Estação SJC - Centro");
  });

  it("deve mapear corretamente os dados do StationApi para o modelo Estacao", () => {
    const mockStationApi: StationApi = {
      id: 99, name: "Estação SJC", address: "Rua A", latitude: "0", longitude: "0",
      idDatalogger: "DL-99", status: "Operante", isActive: true,
      createdAt: "", updatedAt: "", createdBy: "", updatedBy: ""
    };
    const resultado = mapStationApiToEstacaoModel(mockStationApi);
    expect(resultado.id).toBe("99");
    expect(resultado.cidade).toBe("Rua A");
  });

  it("deve lidar com estações que possuem campos vazios no filtro (normalizeString vazio)", () => {
    const mockComVazio: Estacao[] = [
      {
        id: "99", nome: "", codigo: "", cidade: "", // Campos propositalmente vazios
        latitude: "0", longitude: "0", status: "", isActive: true,
      }
    ];
    // Ao filtrar, ele vai chamar o normalizeString com valores vazios
    const resultado = stationFilter(mockComVazio, "busca");
    expect(resultado).toHaveLength(0);
  });
});

describe("Station Service - Validações e Utilitários", () => {
  it("validateCreateStationInput: deve validar e retornar mensagens de erro para campos vazios", () => {
    const form = getEmptyCreateStationInput();
    
    expect(validateCreateStationInput(form)).toBe("Preencha pelo menos Nome e Endereço.");
    form.name = "Nome"; form.address = "Endereço";
    
    expect(validateCreateStationInput(form)).toBe("Latitude e Longitude são obrigatórios.");
    form.latitude = "0"; form.longitude = "0";
    
    expect(validateCreateStationInput(form)).toBe("Código (ID Datalogger) é obrigatório.");
    form.idDatalogger = "DL-1";
    
    expect(validateCreateStationInput(form)).toBe("Status é obrigatório.");
    form.status = "Operante";
    
    expect(validateCreateStationInput(form)).toBeNull();
  });

  it("mapStationApiToCreateStationInput: deve mapear lidando com nulos da API", () => {
    const mockApi = {} as unknown as StationApi;
    const result = mapStationApiToCreateStationInput(mockApi);
    expect(result.name).toBe("");
    expect(result.isActive).toBe(true);
  });
});

describe("Station Service - API Fetchers (Caminho Feliz e Triste)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockApiResponse(ok: boolean, data: unknown = {}, status = 200) {
    vi.mocked(api.apiFetch).mockResolvedValueOnce({
      ok, status, json: async () => data,
    } as unknown as Response);
  }

  it("fetchJson: Deve lançar erro genérico se response.ok for falso", async () => {
    mockApiResponse(false, {}, 500);
    await expect(getStationById("1")).rejects.toThrow("Request failed (500)");
  });

  it("Métodos GET e POST: devem processar o JSON retornado", async () => {
    mockApiResponse(true, { id: 1, name: "Teste" });
    const station = await getStationById("1");
    expect(station.name).toBe("Teste");

    mockApiResponse(true, [{ id: 1 }]);
    const list = await listStations();
    expect(list).toHaveLength(1);

    mockApiResponse(true, { id: 2, name: "Nova" });
    const created = await createStation(getEmptyCreateStationInput());
    expect(created.id).toBe("2");

    mockApiResponse(true, { id: 1, name: "Editada" });
    const updated = await updateStation("1", getEmptyCreateStationInput());
    expect(updated.nome).toBe("Editada");
  });

  it("Listagens Públicas: devem acessar as rotas corretas", async () => {
    mockApiResponse(true, []);
    await listPublicStations();
    expect(api.apiFetch).toHaveBeenCalledWith("/stations/public", expect.anything());

    mockApiResponse(true, []);
    await listMapStations();
    expect(api.apiFetch).toHaveBeenCalledWith("/stations/public", expect.anything());
  });

  it("deve criar e atualizar estação omitindo o campo isActive se ele for undefined", async () => {
    mockApiResponse(true, { id: 3, name: "Sem isActive" });
    const inputSemIsActive = getEmptyCreateStationInput();
    inputSemIsActive.isActive = undefined;

    await createStation(inputSemIsActive);
    expect(api.apiFetch).toHaveBeenCalled();

    mockApiResponse(true, { id: 3, name: "Sem isActive" });
    await updateStation("1", inputSemIsActive);
    expect(api.apiFetch).toHaveBeenCalled();
  });
});

describe("Station Service - React Custom Hooks & Modais", () => {
  const fakeEvent = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;
  const validForm = { name: "A", address: "B", latitude: "0", longitude: "0", idDatalogger: "1", status: "A", isActive: true };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- useStationsList ---
  it("useStationsList: deve ignorar erro de aborto de requisição", async () => {
    vi.mocked(api.apiFetch).mockRejectedValueOnce({ name: "AbortError" });
    const { result } = renderHook(() => useStationsList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorMessage).toBeNull();
  });

  // --- useCreateStationModal ---
  it("useCreateStationModal: deve fechar o modal normalmente", () => {
    const { result } = renderHook(() => useCreateStationModal());
    act(() => { result.current.open(); });
    expect(result.current.isOpen).toBe(true);
    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it("useCreateStationModal: deve impedir o fechamento se estiver criando", async () => {
    const { result } = renderHook(() => useCreateStationModal());
    act(() => { result.current.open(); result.current.setForm(validForm); });

    let resolveApi: (val: Response) => void;
    vi.mocked(api.apiFetch).mockImplementationOnce(() => new Promise<Response>((res) => { resolveApi = res; }));

    act(() => { void result.current.submit(fakeEvent); });
    expect(result.current.isCreating).toBe(true);

    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(true); 

    await act(async () => {
        resolveApi!({ ok: true, json: async () => ({ id: 1 }) } as unknown as Response);
    });
  });

  it("useCreateStationModal: deve exibir toast e erro se falhar no cadastro", async () => {
    const { result } = renderHook(() => useCreateStationModal());
    act(() => { result.current.setForm(validForm); });
    
    vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Erro Rede"));
    
    await act(async () => { await result.current.submit(fakeEvent); });
    
    expect(result.current.errorMessage).toBe("Não foi possível cadastrar a estação.");
    expect(toast.error).toHaveBeenCalled();
  });

  // --- useEditStationModal ---
  it("useEditStationModal: deve fechar o modal normalmente", async () => {
    const { result } = renderHook(() => useEditStationModal());
    vi.mocked(api.apiFetch).mockResolvedValueOnce({ ok: true, json: async () => validForm } as unknown as Response);
    
    await act(async () => { await result.current.open("1"); });
    expect(result.current.isOpen).toBe(true);
    
    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.stationId).toBeNull();
    expect(result.current.errorMessage).toBeNull();
  });

  it("useEditStationModal: deve exibir erro se falhar ao carregar estação no open", async () => {
    const { result } = renderHook(() => useEditStationModal());
    vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Fail"));
    
    await act(async () => { await result.current.open("1"); });
    expect(result.current.errorMessage).toBe("Não foi possível carregar os dados da estação.");
  });

  it("useEditStationModal: deve impedir o fechamento se estiver salvando", async () => {
    const { result } = renderHook(() => useEditStationModal());
    
    vi.mocked(api.apiFetch).mockResolvedValueOnce({ ok: true, json: async () => validForm } as unknown as Response);
    await act(async () => { await result.current.open("1"); });

    let resolveApi: (val: Response) => void;
    vi.mocked(api.apiFetch).mockImplementationOnce(() => new Promise<Response>((res) => { resolveApi = res; }));

    act(() => { void result.current.submit(fakeEvent); });
    expect(result.current.isSaving).toBe(true);

    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(true); 

    await act(async () => {
      resolveApi!({ ok: true, json: async () => ({ id: 1 }) } as unknown as Response);
    });
  });

  it("useEditStationModal: deve validar stationId vazio no submit", async () => {
    const { result } = renderHook(() => useEditStationModal());
    await act(async () => { await result.current.submit(fakeEvent); });
    expect(result.current.errorMessage).toBe("Estação inválida.");
  });

  it("useEditStationModal: deve exibir toast e erro se falhar no update", async () => {
    const { result } = renderHook(() => useEditStationModal());
    vi.mocked(api.apiFetch).mockResolvedValueOnce({ ok: true, json: async () => validForm } as unknown as Response);
    await act(async () => { await result.current.open("1"); });

    vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Fail PUT"));
    
    await act(async () => { await result.current.submit(fakeEvent); });
    expect(result.current.errorMessage).toBe("Não foi possível atualizar a estação.");
  });

  it("useEditStationModal: deve barrar o submit se o formulário for inválido", async () => {
    const { result } = renderHook(() => useEditStationModal());

    // Simula a abertura bem-sucedida do modal
    vi.mocked(api.apiFetch).mockResolvedValueOnce({ ok: true, json: async () => validForm } as unknown as Response);
    await act(async () => { await result.current.open("1"); });

    // Forçamos o formulário a ficar inválido (nome vazio)
    act(() => {
      result.current.setForm({ ...validForm, name: "" });
    });

    // Tentamos fazer o submit
    await act(async () => { await result.current.submit(fakeEvent); });

    // Verificamos se o erro de validação foi disparado e o salvamento foi bloqueado
    expect(result.current.errorMessage).toBe("Preencha pelo menos Nome e Endereço.");
    expect(result.current.isSaving).toBe(false);
  });

  // --- Hooks Menores ---
  it("useMapStationsList: deve carregar dados com sucesso", async () => {
    vi.mocked(api.apiFetch).mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }] } as unknown as Response);
    const { result } = renderHook(() => useMapStationsList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stations).toHaveLength(1);
  });

  it("useMapStationsList: deve preencher errorMessage em caso de falha genérica", async () => {
    vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Network Error"));
    const { result } = renderHook(() => useMapStationsList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorMessage).toBe("Não foi possível carregar as estações para o mapa.");
  });

  it("usePublicStationsList: deve carregar dados com sucesso", async () => {
    vi.mocked(api.apiFetch).mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }] } as unknown as Response);
    const { result } = renderHook(() => usePublicStationsList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stations).toHaveLength(1);
  });

  it("usePublicStationsList: deve preencher errorMessage em caso de falha genérica", async () => {
    vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Network Error"));
    const { result } = renderHook(() => usePublicStationsList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorMessage).toBe("Não foi possível carregar as estações públicas.");
  });

  it("useMapStationsList & usePublicStationsList: devem ignorar erro de aborto", async () => {
    vi.mocked(api.apiFetch).mockRejectedValue({ name: "AbortError" });
    const { result: mapResult } = renderHook(() => useMapStationsList());
    const { result: pubResult } = renderHook(() => usePublicStationsList());
    
    await waitFor(() => {
        expect(mapResult.current.isLoading).toBe(false);
        expect(pubResult.current.isLoading).toBe(false);
    });
    
    expect(mapResult.current.errorMessage).toBeNull();
    expect(pubResult.current.errorMessage).toBeNull();
  });
});

describe("Station Service - Delete Station com Window Confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn()); 
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve abortar a requisição se o usuário clicar em Cancelar no confirm", async () => {
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    await deleteStation("1");
    expect(api.apiFetch).not.toHaveBeenCalled();
  });

  it("deve realizar o delete se o usuário confirmar", async () => {
    vi.mocked(window.confirm).mockReturnValueOnce(true);
    vi.mocked(api.apiFetch).mockResolvedValueOnce({ ok: true } as unknown as Response);
    await deleteStation("1", { stationName: "Teste SJC" });
    expect(api.apiFetch).toHaveBeenCalledWith("/stations/delete/1", expect.anything());
  });

  it("deve lançar erro se o delete falhar no backend", async () => {
    vi.mocked(window.confirm).mockReturnValueOnce(true);
    vi.mocked(api.apiFetch).mockResolvedValueOnce({ ok: false, status: 403 } as unknown as Response);
    await expect(deleteStation("1")).rejects.toThrow("Failed to delete station (status 403)");
  });
});