import { describe, it, expect, vi, beforeEach } from "vitest";
import { stationParameterService } from "../../src/services/station-parameter-service";
import { toast } from "react-toastify";

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
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLinks,
    });

    const result = await stationParameterService.findByStation(5);

    const [url] = (globalThis.fetch as any).mock.calls[0];
    expect(String(url)).toContain("/parameters/station/5");
    expect(result).toEqual(mockLinks);
  });

  it("deve criar um vínculo enviando apenas idStation e idTypeParam", async () => {
    const payload = { idStation: 5, idTypeParam: 2, isActive: true };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 10, ...payload }),
    });

    const result = await stationParameterService.create(payload);

    const [url, init] = (globalThis.fetch as any).mock.calls[0];
    expect(String(url)).toContain("/parameters/create");
    expect(init.method).toBe("POST");

    expect(JSON.parse(init.body)).not.toHaveProperty("key");
    expect(result?.id).toBe(10);
  });

  it("deve lançar erro e disparar um toast se o backend recusar o vínculo", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
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
