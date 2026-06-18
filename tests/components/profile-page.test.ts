import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { Profile } from "../../src/pages/Profile";
import * as adminServiceModule from "../../src/services/administrator-services";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../src/services/administrator-services", () => ({
  administratorService: {
    getMe: vi.fn(),
    update: vi.fn(),
  },
}));

const mockProfile = { id: 1, name: "Admin Teste", email: "admin@teste.com" };

describe("Profile Page Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(adminServiceModule.administratorService.getMe).mockResolvedValue(mockProfile);
  });

  afterEach(() => {
    cleanup();
  });

  it("deve carregar e renderizar os dados do administrador logado", async () => {
    const { getByPlaceholderText } = render(createElement(MemoryRouter, null, createElement(Profile)));

    await waitFor(() => {
      expect(adminServiceModule.administratorService.getMe).toHaveBeenCalled();
    });

    const nameInput = getByPlaceholderText("Seu nome completo") as HTMLInputElement;
    const emailInput = getByPlaceholderText("seu.email@tecsus.com.br") as HTMLInputElement;

    expect(nameInput.value).toBe("Admin Teste");
    expect(emailInput.value).toBe("admin@teste.com");
  });

  it("deve exibir erro se o nome estiver vazio", async () => {
    const { getByPlaceholderText, container } = render(createElement(MemoryRouter, null, createElement(Profile)));

    await waitFor(() => {
      expect(adminServiceModule.administratorService.getMe).toHaveBeenCalled();
    });

    const nameInput = getByPlaceholderText("Seu nome completo") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("O nome é obrigatório.");
    });
  });

  it("deve exibir erro se o email for inválido", async () => {
    const { getByPlaceholderText, container } = render(createElement(MemoryRouter, null, createElement(Profile)));

    await waitFor(() => {
      expect(adminServiceModule.administratorService.getMe).toHaveBeenCalled();
    });

    const emailInput = getByPlaceholderText("seu.email@tecsus.com.br") as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Por favor, insira um e-mail válido.");
    });
  });

  it("deve exigir senha atual para alteração de senha", async () => {
    const { getByPlaceholderText, container } = render(createElement(MemoryRouter, null, createElement(Profile)));

    await waitFor(() => {
      expect(adminServiceModule.administratorService.getMe).toHaveBeenCalled();
    });

    const newPasswordInput = getByPlaceholderText("Mínimo 6 caracteres") as HTMLInputElement;
    fireEvent.change(newPasswordInput, { target: { value: "123456" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("A senha atual é obrigatória para alteração de senha.");
    });
  });

  it("deve exibir erro se a nova senha for menor que 6 caracteres", async () => {
    const { getByPlaceholderText, container } = render(createElement(MemoryRouter, null, createElement(Profile)));

    await waitFor(() => {
      expect(adminServiceModule.administratorService.getMe).toHaveBeenCalled();
    });

    const currentPasswordInput = getByPlaceholderText("Sua senha atual") as HTMLInputElement;
    const newPasswordInput = getByPlaceholderText("Mínimo 6 caracteres") as HTMLInputElement;

    fireEvent.change(currentPasswordInput, { target: { value: "senhaatual" } });
    fireEvent.change(newPasswordInput, { target: { value: "123" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("A nova senha deve ter pelo menos 6 caracteres.");
    });
  });

  it("deve exibir erro se as senhas não coincidirem", async () => {
    const { getByPlaceholderText, container } = render(createElement(MemoryRouter, null, createElement(Profile)));

    await waitFor(() => {
      expect(adminServiceModule.administratorService.getMe).toHaveBeenCalled();
    });

    const currentPasswordInput = getByPlaceholderText("Sua senha atual") as HTMLInputElement;
    const newPasswordInput = getByPlaceholderText("Mínimo 6 caracteres") as HTMLInputElement;
    const confirmPasswordInput = getByPlaceholderText("Repita a nova senha") as HTMLInputElement;

    fireEvent.change(currentPasswordInput, { target: { value: "senhaatual" } });
    fireEvent.change(newPasswordInput, { target: { value: "123456" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "1234567" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("A nova senha e a confirmação não coincidem.");
    });
  });

  it("deve atualizar com sucesso ao enviar dados corretos", async () => {
    vi.mocked(adminServiceModule.administratorService.update).mockResolvedValue(mockProfile);

    const { getByPlaceholderText, container } = render(createElement(MemoryRouter, null, createElement(Profile)));

    await waitFor(() => {
      expect(adminServiceModule.administratorService.getMe).toHaveBeenCalled();
    });

    const nameInput = getByPlaceholderText("Seu nome completo") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Novo Nome" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(adminServiceModule.administratorService.update).toHaveBeenCalledWith(1, {
        name: "Novo Nome",
        email: "admin@teste.com",
      });
      expect(toast.success).toHaveBeenCalledWith("Perfil atualizado com sucesso!");
    });
  });
});
