import { describe, it, expect, vi, beforeEach } from "vitest";
import { stationParameterService } from "../../src/services/station-parameter-service";
import { toast } from "react-toastify";

type FetchMock = {
  mockResolvedValueOnce(value: unknown): FetchMock;
  mock: {
    calls: Array<[RequestInfo | URL, RequestInit?]>;
  };
};

function getFetchMock(): FetchMock {
  return globalThis.fetch as unknown as FetchMock;
}

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("Station Parameter Service (Frontend)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("deve buscar os parâmetros vinculados de uma estação", async () => {
    const mockLinks = [{ id: 1, idStation: 5, idTypeParam: 2, isActive: true }];
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => mockLinks,
    });

    const result = await stationParameterService.findByStation(5);

    const [url] = getFetchMock().mock.calls[0];
    expect(String(url)).toContain("/parameters/public/station/5");
    expect(result).toEqual(mockLinks);
  });

  it("deve criar um vínculo enviando apenas idStation e idTypeParam", async () => {
    const payload = { idStation: 5, idTypeParam: 2, isActive: true };
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 10, ...payload }),
    });

    const result = await stationParameterService.create(payload);

    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain("/parameters/create");
    expect(init?.method).toBe("POST");

    expect(JSON.parse(String(init?.body))).not.toHaveProperty("key");
    expect(result?.id).toBe(10);
  });

  it("deve lançar erro e disparar um toast se o backend recusar o vínculo", async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Erro de validação do banco",
    });

    await expect(
      stationParameterService.create({ idStation: 1, idTypeParam: 1 }),
    ).rejects.toThrow("Erro de validação do banco");

    expect(toast.error).toHaveBeenCalled();
  });
});
