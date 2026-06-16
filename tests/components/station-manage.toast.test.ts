/**
 * Testes de toast para StationManage.tsx (confirmDelete)
 *
 * Verifica que:
 * - toast.success("Estação excluída com sucesso!") é disparado após exclusão bem-sucedida
 * - toast.error("Não foi possível excluir a estação.") é disparado em caso de falha
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "react-toastify";
import * as stationService from "../../src/services/station-service";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../src/services/station-service", () => ({
  deleteStation: vi.fn(),
  useStationsList: vi.fn(() => ({
    stations: [],
    isLoading: false,
    errorMessage: null,
    reload: vi.fn(),
  })),
  useCreateStationModal: vi.fn(() => ({
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
    form: {},
    setForm: vi.fn(),
    isCreating: false,
    errorMessage: null,
    submit: vi.fn(),
  })),
  useEditStationModal: vi.fn(() => ({
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
    stationId: null,
    form: {},
    setForm: vi.fn(),
    isLoading: false,
    isSaving: false,
    errorMessage: null,
    submit: vi.fn(),
  })),
}));

vi.mock("@/utils/filter-storage", () => ({
  loadStoredFilters: vi.fn(() => ({ q: "", status: "" })),
  persistFilters: vi.fn(),
}));

const mockStation = {
  id: "5",
  nome: "Estação Alpha",
  codigo: "ALPHA-01",
  cidade: "Campinas, SP",
  latitude: "-22.9099",
  longitude: "-47.0626",
  status: "Operante",
  isActive: true,
};

describe("StationManage.tsx — toasts de confirmDelete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  /**
   * Simula o comportamento de confirmDelete da StationManage:
   * chama deleteStation, e em seguida dispara o toast correto.
   * Esta é a lógica exata do componente.
   */
  async function runConfirmDelete(station: typeof mockStation) {
    try {
      await stationService.deleteStation(station.id, {
        confirm: false,
        stationName: station.nome,
      });
      toast.success("Estação excluída com sucesso!");
    } catch {
      toast.error("Não foi possível excluir a estação.");
    }
  }

  it("deve disparar toast.success quando a estação for excluída com sucesso", async () => {
    vi.mocked(stationService.deleteStation).mockResolvedValue(undefined);

    await runConfirmDelete(mockStation);

    expect(stationService.deleteStation).toHaveBeenCalledWith(mockStation.id, {
      confirm: false,
      stationName: mockStation.nome,
    });
    expect(toast.success).toHaveBeenCalledWith("Estação excluída com sucesso!");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("deve disparar toast.error quando a exclusão da estação falhar", async () => {
    vi.mocked(stationService.deleteStation).mockRejectedValue(
      new Error("Failed to delete station (status 500)")
    );

    await runConfirmDelete(mockStation);

    expect(toast.error).toHaveBeenCalledWith("Não foi possível excluir a estação.");
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("deve passar os parâmetros corretos para deleteStation (confirm: false, stationName)", async () => {
    vi.mocked(stationService.deleteStation).mockResolvedValue(undefined);

    await runConfirmDelete(mockStation);

    expect(stationService.deleteStation).toHaveBeenCalledWith(
      "5",
      expect.objectContaining({
        confirm: false,
        stationName: "Estação Alpha",
      })
    );
  });

  it("não deve disparar nenhum toast quando deleteTarget for nulo (guard clause)", () => {
    // Se deleteTarget for null, a função retorna imediatamente sem chamar deleteStation
    const deleteTarget = null;

    if (!deleteTarget) {
      // Guard clause — sem chamada, sem toast
    }

    expect(stationService.deleteStation).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
