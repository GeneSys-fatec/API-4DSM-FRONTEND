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
  type StationApi,
} from "../../src/services/station-service";

vi.mock("../../src/services/api", () => ({
  apiFetch: vi.fn(),
  buildQueryString: vi.fn((params) => {
    if (!params || Object.keys(params).length === 0) return "";
    return "?mock=true";
  }),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

function mockApiResponse(ok: boolean, data: unknown = {}, status = 200) {
  vi.mocked(api.apiFetch).mockResolvedValueOnce({
    ok,
    status,
    json: async () => data,
  } as unknown as Response);
}

const fakeEvent = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;

describe("station-service (utils) - Validações, Mapeadores e Filtros", () => {
  const mockEstacoes: Estacao[] = [
    { id: "1", nome: "Estação SJC - Centro", codigo: "#123-ABC", cidade: "São José dos Campos", latitude: "-23.1791", longitude: "-45.8872", status: "Operante", isActive: true },
    { id: "2", nome: "Estação Jacareí", codigo: "#456-DEF", cidade: "Jacareí", latitude: "-23.3053", longitude: "-45.9658", status: "Operante", isActive: true },
  ];

  it("deve retornar todas as estações quando o termo for vazio ou apenas espaços", () => {
    expect(stationFilter(mockEstacoes, "")).toHaveLength(2);
  });

  it("deve filtrar as estações pelo nome ignorando maiúsculas e minúsculas", () => {
    expect(stationFilter(mockEstacoes, "sjc")[0].nome).toBe("Estação SJC - Centro");
  });

  it("deve filtrar estações pela busca (nome ou código), facilitando gerenciamento", () => {
    expect(stationFilter(mockEstacoes, "#456-DEF")).toEqual([mockEstacoes[1]]);
  });

  it("deve lidar com estações que possuem campos vazios no filtro (normalizeString vazio)", () => {
    const mockComVazio: Estacao[] = [
      { id: "99", nome: "", codigo: "", cidade: "", latitude: "0", longitude: "0", status: "", isActive: true }
    ];
    expect(stationFilter(mockComVazio, "busca")).toHaveLength(0);
  });

  it("Critério: O cadastro deve conter pelo menos nome e localização da estação", () => {
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

  it("deve mapear corretamente os dados do StationApi para o modelo Estacao", () => {
    const mockApi: StationApi = { id: 99, name: "Estação SJC", address: "Rua A", latitude: "0", longitude: "0", idDatalogger: "DL-99", status: "Operante", isActive: true, createdAt: "", updatedAt: "", createdBy: "", updatedBy: "" };
    const result = mapStationApiToEstacaoModel(mockApi);
    expect(result.id).toBe("99");
    expect(result.cidade).toBe("Rua A");
  });

  it("deve mapear dados da API para formulário de edição lidando com nulos", () => {
    const mockApi = {} as unknown as StationApi;
    const result = mapStationApiToCreateStationInput(mockApi);
    expect(result.name).toBe("");
    expect(result.isActive).toBe(true);
  });
});

describe("station-service (api) - Critérios de Aceitação: Cadastro, Edição, Remoção e Listagem", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("Hub de Tratamento de Erro - deve lançar erro genérico se response.ok for falso", async () => {
    mockApiResponse(false, { message: "Erro no servidor" }, 500);
    await expect(getStationById("1")).rejects.toThrow("Request failed (500)");
  });

  it("Critério: Todas as estações cadastradas devem ser listadas", async () => {
    mockApiResponse(true, [{ id: 1, name: "Estação Meteorológica Sul" }]);
    const data = await listStations();
    expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining("/stations"), expect.anything());
    expect(data).toHaveLength(1);
  });

  it("Critério: A listagem deve aceitar filtros e repassar query params", async () => {
    mockApiResponse(true, []);
    await listStations({ filters: { q: "sul", status: "ativa" } });
    expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining("/stations?mock=true"), expect.anything());
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação (POST)", async () => {
    mockApiResponse(true, { id: 1, name: "Estação Sul" });
    const created = await createStation(getEmptyCreateStationInput());
    expect(api.apiFetch).toHaveBeenCalledWith("/stations/create", expect.objectContaining({ method: "POST" }));
    expect(created.id).toBe("1");
  });

  it("Critério: O sistema deve permitir editar estações (GET e PUT)", async () => {
    mockApiResponse(true, { id: 7, name: "Estação Nordeste" });
    const station = await getStationById("7");
    expect(api.apiFetch).toHaveBeenCalledWith("/stations/7", expect.anything());
    expect(station.name).toBe("Estação Nordeste");

    mockApiResponse(true, { id: 7, name: "Atualizada" });
    await updateStation("7", getEmptyCreateStationInput());
    expect(api.apiFetch).toHaveBeenCalledWith("/stations/update/7", expect.objectContaining({ method: "PUT" }));
  });

  it("Critério: O sistema deve permitir remover estações (DELETE com window.confirm)", async () => {
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    mockApiResponse(true);
    await deleteStation("3", { stationName: "Estação Sul" });
    expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir a estação "Estação Sul"?');
    expect(api.apiFetch).toHaveBeenCalledWith("/stations/delete/3", expect.objectContaining({ method: "DELETE" }));
  });

  it("deve abortar a exclusão se o usuário cancelar o confirm", async () => {
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(false));
    await deleteStation("3", { stationName: "Sul" });
    expect(api.apiFetch).not.toHaveBeenCalled();
  });

  it("deve lançar erro se o delete falhar no backend", async () => {
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    mockApiResponse(false, {}, 403);
    await expect(deleteStation("1")).rejects.toThrow("Failed to delete station (status 403)");
  });

  it("Critério de Acesso: Deve buscar a lista de estações públicas usando o endpoint /public", async () => {
    mockApiResponse(true, [{ id: 99, name: "Pública" }]);
    const data = await listPublicStations();
    expect(api.apiFetch).toHaveBeenCalledWith("/stations/public", expect.anything());
    expect(data).toHaveLength(1);
  });

  it("Deve buscar a lista de estações para o mapa usando o endpoint /public", async () => {
    mockApiResponse(true, []);
    await listMapStations();
    expect(api.apiFetch).toHaveBeenCalledWith("/stations/public", expect.anything());
  });

  it("deve criar e atualizar estação omitindo o campo isActive se ele for undefined", async () => {
    const inputSemIsActive = getEmptyCreateStationInput();
    inputSemIsActive.isActive = undefined;

    mockApiResponse(true, { id: 3 });
    await createStation(inputSemIsActive);
    expect(api.apiFetch).toHaveBeenCalled();

    mockApiResponse(true, { id: 3 });
    await updateStation("1", inputSemIsActive);
    expect(api.apiFetch).toHaveBeenCalled();
  });
});

describe("station-service (hooks) - Fluxos de UI e Modais", () => {
  const validForm = { name: "A", address: "B", latitude: "0", longitude: "0", idDatalogger: "1", status: "A", isActive: true };

  beforeEach(() => { vi.clearAllMocks(); });


  it("useStationsList: deve listar estações e lidar com erro de servidor", async () => {
    mockApiResponse(true, [{ id: 1, name: "Estação Sul" }]);
    const { result } = renderHook(() => useStationsList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stations).toHaveLength(1);

    vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Erro 500"));
    const { result: errorResult } = renderHook(() => useStationsList());
    await waitFor(() => expect(errorResult.current.isLoading).toBe(false));
    expect(errorResult.current.errorMessage).toBe("Não foi possível carregar as estações.");
  });

  it("useStationsList: deve ignorar erro de aborto de requisição", async () => {
    vi.mocked(api.apiFetch).mockRejectedValueOnce({ name: "AbortError" });
    const { result } = renderHook(() => useStationsList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorMessage).toBeNull();
  });


  it("useCreateStationModal: deve abrir, fechar e validar campos antes de enviar", async () => {
    const { result } = renderHook(() => useCreateStationModal());
    act(() => { result.current.open(); });
    expect(result.current.isOpen).toBe(true);

  
    await act(async () => { await result.current.submit(fakeEvent); });
    expect(result.current.errorMessage).toMatch(/Preencha pelo menos/);
    expect(api.apiFetch).not.toHaveBeenCalled();

  
    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(false);
  });

  it("useCreateStationModal: deve impedir o fechamento se estiver criando e concluir com sucesso", async () => {
    const { result } = renderHook(() => useCreateStationModal());
    act(() => { result.current.open(); result.current.setForm(validForm); });

    let resolveApi: (val: Response) => void;
    vi.mocked(api.apiFetch).mockImplementationOnce(() => new Promise<Response>((res) => { resolveApi = res; }));

    act(() => { void result.current.submit(fakeEvent); });
    expect(result.current.isCreating).toBe(true);

    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(true);

    await act(async () => {
      resolveApi({ ok: true, json: async () => ({ id: 1 }) } as unknown as Response);
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


  it("useEditStationModal: deve carregar dados, fechar normalmente e lidar com erro de abertura", async () => {
    const { result } = renderHook(() => useEditStationModal());
    
  
    vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Fail"));
    await act(async () => { await result.current.open("1"); });
    expect(result.current.errorMessage).toBe("Não foi possível carregar os dados da estação.");

  
    mockApiResponse(true, validForm);
    await act(async () => { await result.current.open("1"); });
    expect(result.current.isOpen).toBe(true);
    
    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.stationId).toBeNull();
  });

  it("useEditStationModal: deve validar formulario e bloquear salvamento", async () => {
    const { result } = renderHook(() => useEditStationModal());
    mockApiResponse(true, validForm);
    await act(async () => { await result.current.open("1"); });

    act(() => { result.current.setForm({ ...validForm, name: "" }); });
    await act(async () => { await result.current.submit(fakeEvent); });
    expect(result.current.errorMessage).toBe("Preencha pelo menos Nome e Endereço.");
    expect(result.current.isSaving).toBe(false);

  
    act(() => { result.current.close(); });
    await act(async () => { await result.current.submit(fakeEvent); });
    expect(result.current.errorMessage).toBe("Estação inválida.");
  });

  it("useEditStationModal: deve exibir toast e erro se falhar no update", async () => {
    const { result } = renderHook(() => useEditStationModal());
    mockApiResponse(true, validForm);
    await act(async () => { await result.current.open("1"); });

    vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Fail PUT"));
    await act(async () => { await result.current.submit(fakeEvent); });
    expect(result.current.errorMessage).toBe("Não foi possível atualizar a estação.");
  });

  it("useEditStationModal: deve impedir o fechamento se estiver salvando", async () => {
    const { result } = renderHook(() => useEditStationModal());
    mockApiResponse(true, validForm);
    await act(async () => { await result.current.open("1"); });

    let resolveApi: (val: Response) => void;
    vi.mocked(api.apiFetch).mockImplementationOnce(() => new Promise<Response>((res) => { resolveApi = res; }));

    act(() => { void result.current.submit(fakeEvent); });
    expect(result.current.isSaving).toBe(true);

    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(true); 

    await act(async () => {
      resolveApi({ ok: true, json: async () => ({ id: 1 }) } as unknown as Response);
    });
  });


  it("useMapStationsList & usePublicStationsList: devem carregar dados e tratar erros genéricos", async () => {
  
    vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Network Error"));
    const { result: mapError } = renderHook(() => useMapStationsList());
    await waitFor(() => expect(mapError.current.isLoading).toBe(false));
    expect(mapError.current.errorMessage).toBe("Não foi possível carregar as estações para o mapa.");

  
    vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Network Error"));
    const { result: pubError } = renderHook(() => usePublicStationsList());
    await waitFor(() => expect(pubError.current.isLoading).toBe(false));
    expect(pubError.current.errorMessage).toBe("Não foi possível carregar as estações públicas.");

  
    mockApiResponse(true, [{ id: 1 }]);
    const { result: mapSuccess } = renderHook(() => useMapStationsList());
    await waitFor(() => expect(mapSuccess.current.isLoading).toBe(false));
    expect(mapSuccess.current.stations).toHaveLength(1);
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

  it("usePublicStationsList: deve carregar dados com sucesso", async () => {
    mockApiResponse(true, [{ id: 99, name: "Estação Pública Teste" }]);
    const { result } = renderHook(() => usePublicStationsList());
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.stations).toHaveLength(1);
    expect(result.current.errorMessage).toBeNull();
  });

  it("Critério: O sistema deve permitir remover estações sem exibir confirmação se options.confirm for false", async () => {
    const confirmSpy = vi.fn();
    vi.stubGlobal("confirm", confirmSpy);
    mockApiResponse(true);
    
    await deleteStation("3", { confirm: false });
  
    expect(confirmSpy).not.toHaveBeenCalled();
    
    expect(api.apiFetch).toHaveBeenCalledWith("/stations/delete/3", expect.objectContaining({ method: "DELETE" }));
  });
});