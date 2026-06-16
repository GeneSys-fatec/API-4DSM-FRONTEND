/**
 * Testes de toast para ParameterForm.tsx
 *
 * Usa React Testing Library com `render` + `act` para testar os toasts
 * disparados na submissão do formulário (create e edit).
 *
 * A estratégia é: renderizar o componente via JSX factory diretamente,
 * simular o preenchimento de campos e o clique de submit, e verificar
 * que o toast correto foi chamado.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import { createElement } from "react";
import { ParameterForm } from "../../src/components/forms/ParameterForm";
import { toast } from "react-toastify";
import * as parameterServiceModule from "../../src/services/parameter-service";

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../src/services/parameter-service", () => ({
  parameterService: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const existingParameter = {
  id: 5,
  name: "Temperatura",
  json_key: "temperature",
  unit: "°C",
  factor: 1,
  offset: 0,
  description: "Parâmetro existente",
};

describe("ParameterForm — toasts de feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  function renderForm(mode: "create" | "edit") {
    const props = {
      onClose: vi.fn(),
      mode,
      onSuccess: vi.fn(),
      inline: true,
      ...(mode === "edit" ? { parameter: existingParameter } : {}),
    };

    return render(createElement(ParameterForm, props));
  }

  function fillField(container: HTMLElement, name: string, value: string) {
    const el = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[name="${name}"]`
    );
    if (el) {
      fireEvent.change(el, { target: { value } });
    }
  }

  function fillValidForm(container: HTMLElement, overrides: Record<string, string> = {}) {
    fillField(container, "name", overrides.name ?? "Temperatura do Solo");
    fillField(container, "json_key", overrides.json_key ?? "soil_temperature");
    fillField(container, "unit", overrides.unit ?? "°C");
    fillField(container, "factor", overrides.factor ?? "1");
    fillField(container, "offset", overrides.offset ?? "0");
  }

  function clickSubmit(container: HTMLElement) {
    const btn = container.querySelector<HTMLButtonElement>("button[type='submit']");
    if (btn) act(() => fireEvent.click(btn));
  }

  // ─────────────────────────────────────────────────────────────────
  //  Modo CREATE
  // ─────────────────────────────────────────────────────────────────
  describe("mode='create'", () => {
    it("deve disparar toast.success ao criar parâmetro com sucesso", async () => {
      vi.mocked(parameterServiceModule.parameterService.create).mockResolvedValueOnce({
        id: 1, name: "Temperatura do Solo", json_key: "soil_temperature",
        unit: "°C", factor: 1, offset: 0, description: "",
      });

      const { container } = renderForm("create");
      fillValidForm(container);
      clickSubmit(container);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Parâmetro cadastrado com sucesso!");
      });
    });

    it("deve disparar toast.error quando o serviço retornar null", async () => {
      vi.mocked(parameterServiceModule.parameterService.create).mockResolvedValueOnce(null);

      const { container } = renderForm("create");
      fillValidForm(container);
      clickSubmit(container);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Não foi possível cadastrar o parâmetro.");
      });
    });

    it("deve disparar toast.error quando o serviço lançar uma exceção", async () => {
      vi.mocked(parameterServiceModule.parameterService.create).mockRejectedValueOnce(
        new Error("Network Error")
      );

      const { container } = renderForm("create");
      fillValidForm(container);
      clickSubmit(container);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erro ao cadastrar o parâmetro.");
      });
    });

    it("deve disparar toast.error com mensagem de validação quando json_key for inválida", async () => {
      const { container } = renderForm("create");
      fillValidForm(container, { json_key: "chave inválida!" });
      clickSubmit(container);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "A json_key deve conter apenas letras, números e underline (_)."
        );
      });
      // Não deve ter chamado o serviço
      expect(parameterServiceModule.parameterService.create).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────
  //  Modo EDIT
  // ─────────────────────────────────────────────────────────────────
  describe("mode='edit'", () => {
    it("deve disparar toast.success ao atualizar parâmetro com sucesso", async () => {
      vi.mocked(parameterServiceModule.parameterService.update).mockResolvedValueOnce({
        ...existingParameter, name: "Temperatura Atualizada",
      });

      const { container } = renderForm("edit");
      clickSubmit(container);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Parâmetro atualizado com sucesso!");
      });
    });

    it("deve disparar toast.error quando a atualização retornar null", async () => {
      vi.mocked(parameterServiceModule.parameterService.update).mockResolvedValueOnce(null);

      const { container } = renderForm("edit");
      clickSubmit(container);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Não foi possível atualizar o parâmetro.");
      });
    });

    it("deve disparar toast.error quando a atualização lançar exceção", async () => {
      vi.mocked(parameterServiceModule.parameterService.update).mockRejectedValueOnce(
        new Error("Timeout")
      );

      const { container } = renderForm("edit");
      clickSubmit(container);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erro ao atualizar o parâmetro.");
      });
    });
  });
});
