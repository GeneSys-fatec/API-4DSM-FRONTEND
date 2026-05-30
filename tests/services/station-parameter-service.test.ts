import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { stationParameterService } from "../../src/services/station-parameter-service";
import { toast } from "react-toastify";
import * as api from "../../src/services/api";

// Mock da API isolado
vi.mock("../../src/services/api", () => ({
  apiFetch: vi.fn(),
  buildQueryString: vi.fn(() => "?mock=true"),
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("Station Parameter Service (Frontend)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Silencia os console.error no terminal durante os testes de falha
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Função auxiliar de Mock para respostas da API
  function mockApiResponse(ok: boolean, data: unknown = {}, status = 200, textValue = "") {
    vi.mocked(api.apiFetch).mockResolvedValueOnce({
      ok,
      status,
      json: async () => data,
      text: async () => textValue,
    } as unknown as Response);
  }

  describe("findByStation", () => {
    it("deve buscar os parâmetros vinculados de uma estação", async () => {
      const mockLinks = [{ id: 1, idStation: 5, idTypeParam: 2, isActive: true }];
      mockApiResponse(true, mockLinks);

      const result = await stationParameterService.findByStation(5, { q: "teste" });

      expect(api.apiFetch).toHaveBeenCalledWith("/parameters/public/station/5?mock=true");
      expect(result).toEqual(mockLinks);
    });

    it("deve retornar array vazio se a resposta não for ok (Linhas 36-37)", async () => {
      mockApiResponse(false, null, 400, "Erro na API");

      const result = await stationParameterService.findByStation(5);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith("Erro no GET findByStation:", "Erro na API");
    });

    it("deve retornar array vazio em caso de erro de rede (catch)", async () => {
      vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Network Error"));

      const result = await stationParameterService.findByStation(5);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith("Erro na integração:", expect.any(Error));
    });
  });

  describe("create", () => {
    const payload = { idStation: 5, idTypeParam: 2, isActive: true };

    it("deve criar um vínculo enviando apenas idStation e idTypeParam", async () => {
      mockApiResponse(true, { id: 10, ...payload });

      const result = await stationParameterService.create(payload);

      expect(api.apiFetch).toHaveBeenCalledWith("/parameters/create", {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result?.id).toBe(10);
    });

    it("deve lançar erro e disparar um toast se o backend recusar o vínculo", async () => {
      mockApiResponse(false, null, 400, "Erro de validação do banco");

      await expect(stationParameterService.create(payload)).rejects.toThrow("Erro de validação do banco");
      expect(toast.error).toHaveBeenCalled();
    });

    it("deve repassar o erro em caso de falha crítica na rede (Linhas 41-42)", async () => {
      vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Network Fail"));

      await expect(stationParameterService.create(payload)).rejects.toThrow("Network Fail");
      expect(console.error).toHaveBeenCalledWith("Erro crítico no fetch de criar parâmetro:", expect.any(Error));
    });
  });

  describe("update (Linhas 68-78)", () => {
    const payload = { idStation: 5, idTypeParam: 2, isActive: false };

    it("deve atualizar um vínculo com sucesso", async () => {
      mockApiResponse(true, { id: 1, ...payload });

      const result = await stationParameterService.update(1, payload);

      expect(api.apiFetch).toHaveBeenCalledWith("/parameters/update/1", {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      expect(result?.isActive).toBe(false);
    });

    it("deve lançar erro se a atualização falhar na API", async () => {
      mockApiResponse(false);

      await expect(stationParameterService.update(1, payload)).rejects.toThrow("Erro ao atualizar vínculo");
    });

    it("deve repassar erro se houver falha de rede no update", async () => {
      vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Net Error"));

      await expect(stationParameterService.update(1, payload)).rejects.toThrow("Net Error");
    });
  });

  describe("delete (Linhas 80-90)", () => {
    it("deve deletar um vínculo com sucesso", async () => {
      mockApiResponse(true);

      const result = await stationParameterService.delete(1);

      expect(api.apiFetch).toHaveBeenCalledWith("/parameters/delete/1", { method: 'DELETE' });
      expect(result).toBe(true);
    });

    it("deve lançar erro se a exclusão falhar na API", async () => {
      mockApiResponse(false);

      await expect(stationParameterService.delete(1)).rejects.toThrow("Erro ao deletar vínculo");
    });

    it("deve repassar erro se houver falha de rede no delete", async () => {
      vi.mocked(api.apiFetch).mockRejectedValueOnce(new Error("Net Error"));

      await expect(stationParameterService.delete(1)).rejects.toThrow("Net Error");
    });
  });
});