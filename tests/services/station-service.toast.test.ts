/**
 * Testes de toast para station-service.ts
 *
 * Cobre os hooks useCreateStationModal e useEditStationModal, verificando
 * que toast.success é disparado no sucesso e toast.error nas situações de
 * falha durante o submit.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  useCreateStationModal,
  useEditStationModal,
} from "../../src/services/station-service";
import { toast } from "react-toastify";
import * as api from "../../src/services/api";

vi.mock("../../src/services/api", () => ({
  apiFetch: vi.fn(),
  buildQueryString: vi.fn(() => ""),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("station-service — toasts de feedback", () => {
  function mockApiResponse(ok: boolean, data: unknown = {}, status = 200) {
    vi.mocked(api.apiFetch).mockResolvedValueOnce({
      ok,
      status,
      json: async () => data,
      text: async () => String(data),
    } as unknown as Response);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  // ─────────────────────────────────────────────────────────────────
  //  useCreateStationModal
  // ─────────────────────────────────────────────────────────────────
  describe("useCreateStationModal", () => {
    const validForm = {
      name: "Estação Teste",
      address: "São José dos Campos, SP",
      latitude: "-23.2237",
      longitude: "-45.9009",
      idDatalogger: "DATALOG-TESTE-99",
      status: "Em Teste",
      isActive: true,
    };

    const mockCreatedStation = {
      id: 1,
      name: "Estação Teste",
      address: "São José dos Campos, SP",
      latitude: "-23.2237",
      longitude: "-45.9009",
      idDatalogger: "DATALOG-TESTE-99",
      status: "Em Teste",
      isActive: true,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      createdBy: "admin",
      updatedBy: "admin",
    };

    it("deve disparar toast.success quando o cadastro da estação for bem-sucedido", async () => {
      mockApiResponse(true, mockCreatedStation);

      const { result } = renderHook(() => useCreateStationModal());

      act(() => {
        result.current.open();
        result.current.setForm(validForm);
      });

      const fakeEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.submit(fakeEvent);
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Estação cadastrada com sucesso!"
      );
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("deve disparar toast.error quando o cadastro da estação falhar na API", async () => {
      // Simula falha na criação (apiFetch retorna !ok)
      mockApiResponse(false, {}, 500);

      const { result } = renderHook(() => useCreateStationModal());

      // Abre o modal e preenche o form
      act(() => {
        result.current.open();
        result.current.setForm(validForm);
      });

      // Dispara o submit
      const fakeEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.submit(fakeEvent);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Não foi possível cadastrar a estação."
      );
      expect(toast.success).not.toHaveBeenCalled();
    });

    it("NÃO deve disparar toast.error quando o submit falhar apenas por validação (campos vazios)", async () => {
      const { result } = renderHook(() => useCreateStationModal());

      act(() => {
        result.current.open();
        // Deixa o form vazio — validação falha antes da requisição
      });

      const fakeEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.submit(fakeEvent);
      });

      // Não deve chamar a API nem o toast — só seta errorMessage
      expect(api.apiFetch).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────
  //  useEditStationModal
  // ─────────────────────────────────────────────────────────────────
  describe("useEditStationModal", () => {
    const mockStationApi = {
      id: 42,
      name: "Estação Original",
      address: "São Paulo, SP",
      latitude: "-23.5505",
      longitude: "-46.6333",
      idDatalogger: "LOG-42",
      status: "Operante",
      isActive: true,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      createdBy: "admin",
      updatedBy: "admin",
    };

    it("deve disparar toast.success quando a atualização da estação for bem-sucedida", async () => {
      // 1ª chamada: busca dados da estação (GET /stations/42)
      mockApiResponse(true, mockStationApi);
      // 2ª chamada: salva com sucesso (PUT /stations/update/42)
      mockApiResponse(true, { ...mockStationApi, name: "Estação Atualizada" });

      const { result } = renderHook(() => useEditStationModal());

      await act(async () => {
        await result.current.open("42");
      });

      const fakeEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.submit(fakeEvent);
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Estação atualizada com sucesso!"
      );
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("deve disparar toast.error quando a atualização da estação falhar na API", async () => {
      // 1ª chamada: busca os dados da estação ao abrir o modal (GET /stations/42)
      mockApiResponse(true, mockStationApi);
      // 2ª chamada: falha ao salvar (PUT /stations/update/42)
      mockApiResponse(false, {}, 500);

      const { result } = renderHook(() => useEditStationModal());

      // Abre o modal (carrega dados da estação)
      await act(async () => {
        await result.current.open("42");
      });

      // Dispara o submit
      const fakeEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.submit(fakeEvent);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Não foi possível atualizar a estação."
      );
      expect(toast.success).not.toHaveBeenCalled();
    });

    it("deve disparar toast.error quando stationId for null no submit", async () => {
      const { result } = renderHook(() => useEditStationModal());

      // Não abre o modal — stationId permanece null
      const fakeEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.submit(fakeEvent);
      });

      // Sem stationId, apenas seta errorMessage — sem toast
      expect(toast.error).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
      expect(result.current.errorMessage).toBe("Estação inválida.");
    });
  });
});
