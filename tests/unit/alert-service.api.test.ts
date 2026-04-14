import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAlert,
  deleteAlert,
  listAlerts,
  updateAlert,
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
    expect(String(url)).toContain("/alerts?");
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
});
