/**
 * Testes de toast para EditAdminModal.tsx
 *
 * Verifica que:
 * - toast.success é disparado quando o administrador é atualizado com sucesso
 * - toast.error é disparado quando a atualização falha (com mensagem do erro)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { createElement } from "react";
import { toast } from "react-toastify";
import { EditAdminModal } from "../../src/components/EditAdminModal";
import * as adminServiceModule from "../../src/services/administrator-services";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../src/services/administrator-services", () => ({
  administratorService: {
    findById: vi.fn(),
    update: vi.fn(),
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

const mockAdmin = { id: 5, name: "Admin Existente", email: "existente@teste.com" };

describe("EditAdminModal — toasts de feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(adminServiceModule.administratorService.findById).mockResolvedValue(mockAdmin);
  });

  afterEach(() => {
    cleanup();
  });

  function renderModal() {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const { getAllByText } = render(
      createElement(EditAdminModal, { isOpen: true, adminId: 5, onClose, onSuccess }),
    );
    return { getAllByText, onClose, onSuccess };
  }

  it("deve disparar toast.success ao atualizar administrador com sucesso", async () => {
    vi.mocked(adminServiceModule.administratorService.update).mockResolvedValue({
      ...mockAdmin,
      name: "Admin Editado",
    });

    const { getAllByText } = renderModal();

    // Aguarda o preenchimento do modal com os dados do admin (via useEffect)
    await waitFor(() => {
      expect(adminServiceModule.administratorService.findById).toHaveBeenCalledWith(5);
    });

    fireEvent.click(getAllByText("Salvar")[0]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Administrador atualizado com sucesso!");
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("deve disparar toast.error ao falhar na atualização de administrador", async () => {
    vi.mocked(adminServiceModule.administratorService.update).mockRejectedValue(
      new Error("Administrador não encontrado"),
    );

    const { getAllByText } = renderModal();

    await waitFor(() => {
      expect(adminServiceModule.administratorService.findById).toHaveBeenCalledWith(5);
    });

    fireEvent.click(getAllByText("Salvar")[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Administrador não encontrado");
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("deve disparar toast.error genérico quando o erro não for um objeto Error", async () => {
    vi.mocked(adminServiceModule.administratorService.update).mockRejectedValue("erro de rede");

    const { getAllByText } = renderModal();

    await waitFor(() => {
      expect(adminServiceModule.administratorService.findById).toHaveBeenCalledWith(5);
    });

    fireEvent.click(getAllByText("Salvar")[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Ocorreu um erro inesperado");
    });
  });
});
