import { beforeEach, describe, expect, it, vi } from "vitest";
import { limitsService } from "../../src/services/limits-service";

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

describe("limits-service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  describe("findAll", () => {
    it("deve retornar todos os limites com sucesso", async () => {
      const mockLimits = [{ id: 1, idTypeParam: 2, minExpected: 10, maxExpected: 30 }];
      mockFetchJsonOnce(mockLimits);

      const result = await limitsService.findAll();

      expect(globalThis.fetch).toHaveBeenCalledOnce();
      const [url, init] = getFetchMock().mock.calls[0]!;
      expect(String(url)).toContain("/parameter-limits");
      expect(init?.method).toBeUndefined(); // GET is default
      expect(result).toEqual(mockLimits);
    });

    it("deve retornar array vazio se a resposta não for ok", async () => {
      mockFetchJsonOnce(null, { ok: false });
      const result = await limitsService.findAll();
      expect(result).toEqual([]);
    });

    it("deve retornar array vazio se der erro na requisição", async () => {
      getFetchMock().mockRejectedValueOnce(new Error("Network Error"));
      const result = await limitsService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("deve retornar um limite pelo id com sucesso", async () => {
      const mockLimit = { id: 5, idTypeParam: 2, minExpected: 10, maxExpected: 30 };
      mockFetchJsonOnce(mockLimit);

      const result = await limitsService.findById(5);

      expect(globalThis.fetch).toHaveBeenCalledOnce();
      const [url] = getFetchMock().mock.calls[0]!;
      expect(String(url)).toContain("/parameter-limits/5");
      expect(result).toEqual(mockLimit);
    });

    it("deve retornar null se a resposta não for ok", async () => {
      mockFetchJsonOnce(null, { ok: false });
      const result = await limitsService.findById(5);
      expect(result).toBeNull();
    });

    it("deve retornar null se der erro na requisição", async () => {
      getFetchMock().mockRejectedValueOnce(new Error("Network error"));
      const result = await limitsService.findById(5);
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("deve criar um limite com sucesso", async () => {
      const mockPayload = { idTypeParam: 2, minExpected: 10, maxExpected: 30 };
      const mockLimit = { id: 1, ...mockPayload };
      mockFetchJsonOnce(mockLimit);

      const result = await limitsService.create(mockPayload);

      expect(globalThis.fetch).toHaveBeenCalledOnce();
      const [url, init] = getFetchMock().mock.calls[0]!;
      expect(String(url)).toContain("/parameter-limits/create");
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify(mockPayload));
      expect(result).toEqual(mockLimit);
    });

    it("deve retornar null se a resposta não for ok", async () => {
      mockFetchJsonOnce(null, { ok: false });
      const result = await limitsService.create({ idTypeParam: 1, minExpected: 0, maxExpected: 10 });
      expect(result).toBeNull();
    });

    it("deve retornar null se der erro na requisição", async () => {
      getFetchMock().mockRejectedValueOnce(new Error("Network error"));
      const result = await limitsService.create({ idTypeParam: 1, minExpected: 0, maxExpected: 10 });
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("deve atualizar um limite com sucesso", async () => {
      const mockPayload = { idTypeParam: 2, minExpected: 12, maxExpected: 32 };
      const mockLimit = { id: 1, ...mockPayload };
      mockFetchJsonOnce(mockLimit);

      const result = await limitsService.update(1, mockPayload);

      expect(globalThis.fetch).toHaveBeenCalledOnce();
      const [url, init] = getFetchMock().mock.calls[0]!;
      expect(String(url)).toContain("/parameter-limits/update/1");
      expect(init?.method).toBe("PUT");
      expect(init?.body).toBe(JSON.stringify(mockPayload));
      expect(result).toEqual(mockLimit);
    });

    it("deve retornar null se a resposta não for ok", async () => {
      mockFetchJsonOnce(null, { ok: false });
      const result = await limitsService.update(1, { idTypeParam: 1, minExpected: 0, maxExpected: 10 });
      expect(result).toBeNull();
    });

    it("deve retornar null se der erro na requisição", async () => {
      getFetchMock().mockRejectedValueOnce(new Error("Network error"));
      const result = await limitsService.update(1, { idTypeParam: 1, minExpected: 0, maxExpected: 10 });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deve deletar um limite com sucesso", async () => {
      mockFetchJsonOnce({});

      const result = await limitsService.delete(1);

      expect(globalThis.fetch).toHaveBeenCalledOnce();
      const [url, init] = getFetchMock().mock.calls[0]!;
      expect(String(url)).toContain("/parameter-limits/delete/1");
      expect(init?.method).toBe("DELETE");
      expect(result).toBe(true);
    });

    it("deve retornar false se a resposta não for ok", async () => {
      mockFetchJsonOnce(null, { ok: false });
      const result = await limitsService.delete(1);
      expect(result).toBe(false);
    });

    it("deve retornar false se der erro na requisição", async () => {
      getFetchMock().mockRejectedValueOnce(new Error("Network error"));
      const result = await limitsService.delete(1);
      expect(result).toBe(false);
    });
  });
});
