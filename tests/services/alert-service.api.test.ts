import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAlert,
  deleteAlert,
  listAlerts,
  updateAlert,
  clearReadAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  type AlertApi,
} from "../../src/services/alert-service";

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

describe("alert-service (api)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("deve listar alertas registrados", async () => {
    const apiAlerts: AlertApi[] = [
      {
        id: 1,
        idParameter: { id: 2 },
        idMeasurement: { id: 10 },
        triggeredValue: 45.5,
        triggeredAt: "2026-03-31T12:00:00.000Z",
        texto: "Valor acima do limite",
        status: "active",
      },
    ];
    mockFetchJsonOnce(apiAlerts);

    const result = await listAlerts();

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/alerts");
    expect(init?.method).toBe("GET");
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: "1",
      parameterId: 2,
      measuredValue: 45.5,
      status: "active",
    });
  });

  it("deve listar alertas registrados retornando estrutura paginada", async () => {
    const paginatedResponse = {
      data: [
        {
          id: 2,
          idParameter: { id: 3 },
          idMeasurement: { id: 11 },
          triggeredValue: 15.5,
          triggeredAt: "2026-03-31T12:00:00.000Z",
          texto: "Teste",
          status: "active",
        }
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    };
    mockFetchJsonOnce(paginatedResponse);

    const result = await listAlerts();

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.data[0]).toMatchObject({
      id: "2",
      parameterId: 3,
      measuredValue: 15.5,
    });
  });

  it("deve repassar filtros na listagem de alertas", async () => {
    mockFetchJsonOnce([]);

    await listAlerts({ q: "temperatura", status: "active" });

    const [url] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/alerts/public?");
    expect(String(url)).toContain("q=temperatura");
    expect(String(url)).toContain("status=active");
  });

  it("deve criar alerta enviando payload válido", async () => {
    mockFetchJsonOnce({
      id: 3,
      parameterId: 1,
      measurementId: 50,
      measuredValue: 21.1,
      occurredAt: "2026-03-31T15:00:00.000Z",
      description: "Registro manual",
      status: "active",
    });

    const created = await createAlert({
      parameterId: 1,
      measuredValue: 21.1,
      occurredAt: "2026-03-31T15:00:00.000Z",
      description: "Registro manual",
    });

    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/alerts/create");
    expect(init?.method).toBe("POST");
    expect(created.id).toBe("3");
  });

  it("deve atualizar alerta existente", async () => {
    mockFetchJsonOnce({
      id: 7,
      parameterId: 2,
      measurementId: 77,
      measuredValue: 19,
      occurredAt: "2026-03-31T15:10:00.000Z",
      description: "Alerta ajustado",
      status: "resolved",
    });

    const updated = await updateAlert("7", {
      description: "Alerta ajustado",
      status: "resolved",
    });

    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/alerts/update/7");
    expect(init?.method).toBe("PUT");
    expect(updated.status).toBe("resolved");
  });

  it("deve remover alerta existente", async () => {
    mockFetchJsonOnce({}, { status: 204 });

    await deleteAlert("9");

    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/alerts/delete/9");
    expect(init?.method).toBe("DELETE");
  });

  it("deve repassar todos os filtros na listagem de alertas", async () => {
    mockFetchJsonOnce([]);

    await listAlerts({
      q: "temperatura",
      stationId: 1,
      parameterId: 5,
      idTypeParam: 3,
      status: "active",
      user: "admin",
      from: "2026-01-01",
      to: "2026-12-31",
      isRead: false,
      limit: 10,
      page: 2,
    });

    const [url] = getFetchMock().mock.calls[0]!;
    const urlStr = String(url);
    expect(urlStr).toContain("q=temperatura");
    expect(urlStr).toContain("stationId=1");
    expect(urlStr).toContain("parameterId=5");
    expect(urlStr).toContain("idTypeParam=3");
    expect(urlStr).toContain("status=active");
    expect(urlStr).toContain("user=admin");
    expect(urlStr).toContain("from=2026-01-01");
    expect(urlStr).toContain("to=2026-12-31");
    expect(urlStr).toContain("isRead=false");
    expect(urlStr).toContain("limit=10");
    expect(urlStr).toContain("page=2");
  });

  it("deve lançar erro quando listAlerts recebe resposta não-ok", async () => {
    mockFetchJsonOnce({}, { ok: false, status: 500 });

    await expect(listAlerts()).rejects.toThrow("Erro ao listar alertas");
  });

  it("deve lançar erro quando createAlert recebe resposta não-ok", async () => {
    mockFetchJsonOnce({}, { ok: false, status: 400 });

    await expect(
      createAlert({
        parameterId: 1,
        measuredValue: 10,
        occurredAt: "2026-03-31T12:00:00.000Z",
        description: "Teste",
      }),
    ).rejects.toThrow("Erro ao criar alerta");
  });

  it("deve lançar erro quando updateAlert recebe resposta não-ok", async () => {
    mockFetchJsonOnce({}, { ok: false, status: 404 });

    await expect(
      updateAlert("7", { description: "Atualizado" }),
    ).rejects.toThrow("Erro ao atualizar alerta");
  });

  it("deve lançar erro quando deleteAlert recebe resposta não-ok", async () => {
    mockFetchJsonOnce({}, { ok: false, status: 404 });

    await expect(deleteAlert("99")).rejects.toThrow("Erro ao deletar alerta");
  });

  it("deve limpar alertas lidos", async () => {
    mockFetchJsonOnce({});
    await clearReadAlerts();
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/alerts/clear");
    expect(init?.method).toBe("DELETE");
  });

  it("deve lançar erro ao limpar alertas lidos com falha", async () => {
    mockFetchJsonOnce({}, { ok: false, status: 500 });
    await expect(clearReadAlerts()).rejects.toThrow();
  });

  it("deve marcar alerta como lido", async () => {
    mockFetchJsonOnce({});
    await markAlertAsRead("1");
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/alerts/1/read");
    expect(init?.method).toBe("PATCH");
  });

  it("deve lançar erro ao marcar alerta como lido com falha", async () => {
    mockFetchJsonOnce({}, { ok: false, status: 500 });
    await expect(markAlertAsRead("1")).rejects.toThrow("Erro ao marcar alerta como lido");
  });

  it("deve marcar todos os alertas como lidos", async () => {
    mockFetchJsonOnce({});
    await markAllAlertsAsRead();
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/alerts/read-all");
    expect(init?.method).toBe("PATCH");
  });

  it("deve lançar erro ao marcar todos os alertas como lidos com falha", async () => {
    mockFetchJsonOnce({}, { ok: false, status: 500 });
    await expect(markAllAlertsAsRead()).rejects.toThrow("Erro ao marcar alertas como lidos");
  });
});
