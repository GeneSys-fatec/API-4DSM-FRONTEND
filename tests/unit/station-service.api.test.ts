import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createStation,
  deleteStation,
  getStationById,
  listStations,
  updateStation,
  type StationApi,
} from "../../src/services/station-service";

type FetchMock = {
  mockResolvedValueOnce(value: unknown): FetchMock;
  mock: {
    calls: Array<[RequestInfo | URL, RequestInit?]>;
  };
};

function getFetchMock(): FetchMock {
  return globalThis.fetch as unknown as FetchMock;
}

function mockFetchJsonOnce(data: unknown, init?: { ok?: boolean; status?: number }) {
  const ok = init?.ok ?? true;
  const status = init?.status ?? 200;

  getFetchMock().mockResolvedValueOnce({
    ok,
    status,
    json: async () => data,
  });
}

describe("station-service (api) - Critérios de Aceitação: Cadastro, Edição, Remoção e Listagem", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("Critério: Todas as estações cadastradas devem ser listadas - deve recuperar lista de estações", async () => {
    // Arrange
    const apiStations: StationApi[] = [
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
    ];
    mockFetchJsonOnce(apiStations);

    // Act
    const data = await listStations();

    // Assert
    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/stations");
    expect(init?.method).toBe("GET");
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      id: "1",
      nome: "Estação Meteorológica Sul",
      codigo: "DL-001",
      cidade: "São Paulo, SP",
    });
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - deve enviar POST com dados válidos", async () => {
    // Arrange
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

    // Act
    const created = await createStation({
      name: "Estação Meteorológica Sul",
      address: "São Paulo, SP",
      latitude: "-23.5",
      longitude: "-46.6",
      idDatalogger: "DL-001",
      status: "Ativa",
      isActive: true,
    });

    // Assert
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/stations/create");
    expect(init?.method).toBe("POST");
    expect(created).toMatchObject({
      id: "1",
      nome: "Estação Meteorológica Sul",
      codigo: "DL-001",
    });
  });

  it("Critério: O sistema deve permitir editar estações - deve buscar estação existente antes de editar", async () => {
    // Arrange
    mockFetchJsonOnce({
      id: 7,
      name: "Estação Meteorológica Nordeste",
      address: "Recife, PE",
      latitude: "-8.0",
      longitude: "-34.8",
      idDatalogger: "DL-007",
      status: "Ativa",
      isActive: true,
      createdAt: "",
      updatedAt: "",
      createdBy: "",
      updatedBy: "",
    });

    // Act
    const station = await getStationById("7");

    // Assert
    expect(station.id).toBe(7);
    expect(station.name).toBe("Estação Meteorológica Nordeste");
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/stations/7");
    expect(init?.method).toBe("GET");
  });

  it("Critério: O sistema deve permitir editar estações - deve atualizar estação via PUT", async () => {
    // Arrange
    mockFetchJsonOnce({
      id: 7,
      name: "Estação Meteorológica Nordeste Atualizada",
      address: "Recife, PE",
      latitude: "-8.0",
      longitude: "-34.8",
      idDatalogger: "DL-007",
      status: "Ativa",
      isActive: true,
      createdAt: "",
      updatedAt: "",
      createdBy: "",
      updatedBy: "",
    });

    // Act
    const updated = await updateStation("7", {
      name: "Estação Meteorológica Nordeste Atualizada",
      address: "Recife, PE",
      latitude: "-8.0",
      longitude: "-34.8",
      idDatalogger: "DL-007",
      status: "Ativa",
      isActive: true,
    });

    // Assert
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/stations/update/7");
    expect(init?.method).toBe("PUT");
    expect(updated.nome).toBe("Estação Meteorológica Nordeste Atualizada");
  });

  it("Critério: O sistema deve permitir remover estações - deve executar DELETE quando confirmado", async () => {
    // Arrange
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    });

    // Act
    await deleteStation("3", { confirm: false });

    // Assert
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/stations/delete/3");
    expect(init?.method).toBe("DELETE");
  });

  it("Critério: O sistema deve permitir remover estações - deve solicitar confirmação do usuário", async () => {
    // Arrange
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    // Act
    await deleteStation("3", { stationName: "Estação Meteorológica Sul" });

    // Assert
    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(confirmSpy).toHaveBeenCalledWith(
      'Tem certeza que deseja excluir a estação "Estação Meteorológica Sul"?'
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("Hub de Tratamento de Erro - deve lançar erro quando requisição falha", async () => {
    // Arrange
    mockFetchJsonOnce({ message: "Erro no servidor" }, { ok: false, status: 500 });

    // Act + Assert
    await expect(listStations()).rejects.toThrow(/Request failed/);
  });
});
