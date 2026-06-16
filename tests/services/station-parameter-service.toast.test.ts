/**
 * Testes de toast para station-parameter-service.ts
 *
 * Foco: Verifica que a mensagem do toast.error após a padronização
 * é a mensagem amigável ("Não foi possível vincular o parâmetro à estação.")
 * e não a mensagem técnica anterior ("Erro ${status} ao vincular parâmetro. Olhe o F12!").
 *
 * Os demais cenários do serviço já estão cobertos em station-parameter-service.test.ts.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { stationParameterService } from "../../src/services/station-parameter-service";
import { toast } from "react-toastify";
import * as api from "../../src/services/api";

vi.mock("../../src/services/api", () => ({
  apiFetch: vi.fn(),
  buildQueryString: vi.fn(() => ""),
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("station-parameter-service — toast de mensagem amigável", () => {
  function mockApiResponse(ok: boolean, textValue = "") {
    vi.mocked(api.apiFetch).mockResolvedValueOnce({
      ok,
      status: ok ? 200 : 400,
      json: async () => ({}),
      text: async () => textValue,
    } as unknown as Response);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve exibir mensagem amigável (não técnica) no toast.error ao falhar na criação do vínculo", async () => {
    mockApiResponse(false, "Erro 400: duplicate key value violates unique constraint");

    const payload = { idStation: 5, idTypeParam: 2, isActive: true };

    await expect(
      stationParameterService.create(payload)
    ).rejects.toThrow();

    // Verifica a MENSAGEM AMIGÁVEL — não a mensagem técnica do backend
    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível vincular o parâmetro à estação."
    );

    // Garante que a mensagem técnica NÃO aparece no toast
    expect(toast.error).not.toHaveBeenCalledWith(
      expect.stringContaining("Olhe o F12")
    );
    expect(toast.error).not.toHaveBeenCalledWith(
      expect.stringContaining("Erro 400")
    );
  });

  it("deve exibir mensagem amigável quando backend retornar 500", async () => {
    vi.mocked(api.apiFetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => "Internal Server Error",
    } as unknown as Response);

    const payload = { idStation: 1, idTypeParam: 3, isActive: true };

    await expect(stationParameterService.create(payload)).rejects.toThrow();

    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível vincular o parâmetro à estação."
    );
  });

  it("NÃO deve disparar toast.error quando a criação for bem-sucedida", async () => {
    mockApiResponse(true);
    vi.mocked(api.apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 99, idStation: 5, idTypeParam: 2, isActive: true }),
      text: async () => "",
    } as unknown as Response);

    const payload = { idStation: 5, idTypeParam: 2, isActive: true };
    await stationParameterService.create(payload);

    expect(toast.error).not.toHaveBeenCalled();
  });
});
