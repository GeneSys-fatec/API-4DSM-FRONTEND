/**
 * Testes de toast para LimitsForm.tsx
 *
 * Cobre o handleSubmit verificando:
 * - toast.success para criação e atualização de limites com sucesso
 * - toast.error para validações e falhas de API
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { toast } from "react-toastify";
import { LimitsForm } from "../../src/components/forms/LimitsForm";
import * as limitsServiceModule from "../../src/services/limits-service";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../src/services/limits-service", () => ({
  limitsService: {
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../../src/services/parameter-service", () => ({
  parameterService: { findAll: vi.fn(() => Promise.resolve([])) },
}));

const fixedParameter = { id: 3, name: "Temperatura", json_key: "temperature" };

const mockLimit = {
  id: 10,
  idTypeParam: 3,
  minExpected: 0,
  maxExpected: 100,
};

describe("LimitsForm — toasts de feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  function renderForm(limit?: typeof mockLimit) {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    return render(
      createElement(LimitsForm, {
        onClose,
        stationId: 1,
        fixedParameter,
        ...(limit ? { limit } : {}),
        onSuccess,
        inline: true,
      }),
    );
  }

  describe("Modo criar (sem limite existente)", () => {
    it("deve disparar toast.success ao cadastrar limite com sucesso", async () => {
      vi.mocked(limitsServiceModule.limitsService.findAll).mockResolvedValue([]);
      vi.mocked(limitsServiceModule.limitsService.create).mockResolvedValue(mockLimit);

      const { container } = renderForm();

      const minInput = container.querySelector<HTMLInputElement>("[name='minExpected']");
      const maxInput = container.querySelector<HTMLInputElement>("[name='maxExpected']");
      if (minInput) fireEvent.change(minInput, { target: { value: "10" } });
      if (maxInput) fireEvent.change(maxInput, { target: { value: "50" } });

      const submitBtn = container.querySelector<HTMLButtonElement>("button[type='submit']");
      if (submitBtn) fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Limite cadastrado com sucesso!");
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("deve disparar toast.error quando a criação do limite retornar null", async () => {
      vi.mocked(limitsServiceModule.limitsService.findAll).mockResolvedValue([]);
      vi.mocked(limitsServiceModule.limitsService.create).mockResolvedValue(null);

      const { container } = renderForm();

      const minInput = container.querySelector<HTMLInputElement>("[name='minExpected']");
      const maxInput = container.querySelector<HTMLInputElement>("[name='maxExpected']");
      if (minInput) fireEvent.change(minInput, { target: { value: "5" } });
      if (maxInput) fireEvent.change(maxInput, { target: { value: "95" } });

      const submitBtn = container.querySelector<HTMLButtonElement>("button[type='submit']");
      if (submitBtn) fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Não foi possível cadastrar o limite.");
      });
    });

    it("deve disparar toast.error quando a criação do limite lançar exceção", async () => {
      vi.mocked(limitsServiceModule.limitsService.findAll).mockResolvedValue([]);
      vi.mocked(limitsServiceModule.limitsService.create).mockRejectedValue(
        new Error("Falha de conexão"),
      );

      const { container } = renderForm();

      const minInput = container.querySelector<HTMLInputElement>("[name='minExpected']");
      const maxInput = container.querySelector<HTMLInputElement>("[name='maxExpected']");
      if (minInput) fireEvent.change(minInput, { target: { value: "5" } });
      if (maxInput) fireEvent.change(maxInput, { target: { value: "95" } });

      const submitBtn = container.querySelector<HTMLButtonElement>("button[type='submit']");
      if (submitBtn) fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erro ao cadastrar o limite.");
      });
    });
  });

  describe("Modo editar (com limite existente)", () => {
    it("deve disparar toast.success ao atualizar limite com sucesso", async () => {
      vi.mocked(limitsServiceModule.limitsService.update).mockResolvedValue({
        ...mockLimit,
        minExpected: 5,
        maxExpected: 80,
      });

      const { container } = renderForm(mockLimit);

      const submitBtn = container.querySelector<HTMLButtonElement>("button[type='submit']");
      if (submitBtn) fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Limite atualizado com sucesso!");
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("deve disparar toast.error quando a atualização retornar null", async () => {
      vi.mocked(limitsServiceModule.limitsService.update).mockResolvedValue(null);

      const { container } = renderForm(mockLimit);

      const submitBtn = container.querySelector<HTMLButtonElement>("button[type='submit']");
      if (submitBtn) fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Não foi possível cadastrar o limite.");
      });
    });
  });

  describe("Validações (sem chamada à API)", () => {
    it("deve disparar toast.error quando idTypeParam não estiver definido", async () => {
      // Renderiza o formulário sem fixedParameter para que idTypeParam = 0
      const { LimitsForm: LimitsFormNoParam } = await import("../../src/components/forms/LimitsForm");
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const { container } = render(
        createElement(LimitsFormNoParam, {
          onClose,
          stationId: 1,
          // sem fixedParameter — idTypeParam permanece 0
          onSuccess,
          inline: true,
        }),
      );

      const submitBtn = container.querySelector<HTMLButtonElement>("button[type='submit']");
      if (submitBtn) fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Selecione um parâmetro para configurar o limite.",
        );
      });
      expect(limitsServiceModule.limitsService.create).not.toHaveBeenCalled();
    });
  });
});
