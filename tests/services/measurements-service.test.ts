import { beforeEach, describe, expect, it, vi } from "vitest";
import { measurementsService } from "../../src/services/measurements-service";

type FetchMock = {
  mockResolvedValueOnce(value: unknown): FetchMock;
  mockRejectedValueOnce(value: unknown): FetchMock;
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

describe("measurements-service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  describe("getMeasurements", () => {
    it("deve buscar medições com apenas stationId com sucesso", async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
      };
      mockFetchJsonOnce(mockResult);

      const result = await measurementsService.getMeasurements(1);

      expect(globalThis.fetch).toHaveBeenCalledOnce();
      const [url] = getFetchMock().mock.calls[0]!;
      expect(String(url)).toContain("/measurements?stationId=1&limit=1000");
      expect(result).toEqual(mockResult);
    });

    it("deve buscar medições com period e parameterId opcionais", async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
      };
      mockFetchJsonOnce(mockResult);

      await measurementsService.getMeasurements(1, "24h", 5);

      const [url] = getFetchMock().mock.calls[0]!;
      const urlStr = String(url);
      expect(urlStr).toContain("/measurements?stationId=1&limit=1000");
      expect(urlStr).toContain("period=24h");
      expect(urlStr).toContain("parameterId=5");
    });

    it("deve retornar estrutura padrão e logar erro se a resposta não for ok", async () => {
      mockFetchJsonOnce(null, { ok: false });
      const result = await measurementsService.getMeasurements(1);
      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });
    });

    it("deve retornar estrutura padrão se der erro na requisição", async () => {
      getFetchMock().mockRejectedValueOnce(new Error("Network error"));
      const result = await measurementsService.getMeasurements(1);
      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });
    });
  });
});