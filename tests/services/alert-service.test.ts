import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAlert,
  deleteAlert,
  listAlerts,
  updateAlert,
  getEmptyAlertPayload,
  mapAlertApiToModel,
  validateAlertPayload,
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

describe("alert-service (utils)", () => {
  it("deve criar payload inicial vazio", () => {
    expect(getEmptyAlertPayload()).toEqual({
      parameterId: 0,
      measuredValue: 0,
      occurredAt: "",
      description: "",
    });
  });

  it("deve validar campos obrigatórios", () => {
    expect(
      validateAlertPayload({
        parameterId: 0,
        measuredValue: 10,
        occurredAt: "2026-03-31T12:00",
        description: "Teste",
      }),
    ).toBe("Parâmetro é obrigatório.");

    expect(
      validateAlertPayload({
        parameterId: 1,
        measuredValue: Number.NaN,
        occurredAt: "2026-03-31T12:00",
        description: "Teste",
      }),
    ).toBe("Valor medido inválido.");

    expect(
      validateAlertPayload({
        parameterId: 1,
        measuredValue: 10,
        occurredAt: "",
        description: "Teste",
      }),
    ).toBe("Data/hora da ocorrência é obrigatória.");

    expect(
      validateAlertPayload({
        parameterId: 1,
        measuredValue: 10,
        occurredAt: "2026-03-31T12:00",
        description: "",
      }),
    ).toBe("Descrição é obrigatória.");

    expect(
      validateAlertPayload({
        parameterId: 1,
        measuredValue: 10,
        occurredAt: "2026-03-31T12:00",
        description: "Tudo certo",
      }),
    ).toBeNull();
  });

  it("deve mapear resposta da API para o modelo da UI", () => {
    const mapped = mapAlertApiToModel({
      id: 5,
      parameterId: 3,
      measurementId: 90,
      measuredValue: 17.25,
      occurredAt: "2026-03-31T12:00:00.000Z",
      description: "Fora da faixa",
      status: "active",
    });

    expect(mapped).toEqual({
      id: "5",
      parameterId: 3,
      measurementId: 90,
      measuredValue: 17.25,
      occurredAt: "2026-03-31T12:00:00.000Z",
      description: "Fora da faixa",
      status: "active",
    });
  });
});

// ==========================================
// 2. INTEGRAÇÃO COM A API
// ==========================================
describe("alert-service (api)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("deve listar alertas registrados", async () => {
    const apiAlerts: AlertApi[] = [
      {
        id: 1,
        parameterId: 2,
        measurementId: 10,
        measuredValue: 45.5,
        occurredAt: "2026-03-31T12:00:00.000Z",
        description: "Valor acima do limite",
        status: "active",
      },
    ];
    mockFetchJsonOnce(apiAlerts);

    const result = await listAlerts();

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/alerts");
    expect(init?.method).toBe("GET");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "1",
      parameterId: 2,
      measuredValue: 45.5,
      status: "active",
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
});