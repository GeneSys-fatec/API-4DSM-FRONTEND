/**
 * Testes de toast para CreateAdminModal.tsx
 *
 * Verifica que:
 * - toast.success é disparado quando o administrador é cadastrado com sucesso
 * - toast.error é disparado quando a criação falha (com mensagem do erro)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { createElement } from "react";
import { toast } from "react-toastify";
import { CreateAdminModal } from "../../src/components/CreateAdminModal";
import * as adminServiceModule from "../../src/services/administrator-services";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../src/services/administrator-services", () => ({
  administratorService: {
    create: vi.fn(),
  },
}));

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

vi.mock("../../src/components/forms/AdminForm", () => ({
  AdminForm: ({
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
  }: {
    name: string;
    setName: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
  }) =>
    createElement(
      "div",
      null,
      createElement("input", {
        "data-testid": "name-input",
        value: name,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
      }),
      createElement("input", {
        "data-testid": "email-input",
        type: "email",
        value: email,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
      }),
      createElement("input", {
        "data-testid": "password-input",
        type: "password",
        value: password,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
      }),
    ),
}));

const mockAdmin = { id: 1, name: "Novo Admin", email: "novo@teste.com" };

describe("CreateAdminModal — toasts de feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  function renderModal() {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const { getByTestId, getByText } = render(
      createElement(CreateAdminModal, { isOpen: true, onClose, onSuccess }),
    );
    return { getByTestId, getByText, onClose, onSuccess };
  }

  it("deve disparar toast.success ao criar administrador com sucesso", async () => {
    vi.mocked(adminServiceModule.administratorService.create).mockResolvedValue(mockAdmin);

    const { getByTestId, getByText } = renderModal();

    fireEvent.change(getByTestId("name-input"), { target: { value: "Novo Admin" } });
    fireEvent.change(getByTestId("email-input"), { target: { value: "novo@teste.com" } });
    fireEvent.change(getByTestId("password-input"), { target: { value: "senha123" } });

    fireEvent.click(getByText("Enviar"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Administrador cadastrado com sucesso!");
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("deve disparar toast.error ao falhar na criação de administrador", async () => {
    vi.mocked(adminServiceModule.administratorService.create).mockRejectedValue(
      new Error("Email já cadastrado"),
    );

    const { getByTestId, getByText } = renderModal();

    fireEvent.change(getByTestId("name-input"), { target: { value: "Admin Duplicado" } });
    fireEvent.change(getByTestId("email-input"), { target: { value: "existente@teste.com" } });
    fireEvent.change(getByTestId("password-input"), { target: { value: "senha123" } });

    fireEvent.click(getByText("Enviar"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email já cadastrado");
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("deve disparar toast.error genérico quando o erro não for um objeto Error", async () => {
    vi.mocked(adminServiceModule.administratorService.create).mockRejectedValue(
      "falha inesperada",
    );

    const { getByTestId, getByText } = renderModal();

    fireEvent.change(getByTestId("name-input"), { target: { value: "Admin X" } });
    fireEvent.change(getByTestId("email-input"), { target: { value: "x@teste.com" } });
    fireEvent.change(getByTestId("password-input"), { target: { value: "senha123" } });

    fireEvent.click(getByText("Enviar"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Ocorreu um erro inesperado");
    });
  });
});
