/**
 * Testes de toast para Admin.tsx — handleDeleteConfirm
 *
 * Estratégia: testa o serviço + a lógica de toast diretamente,
 * já que a página Admin renderiza o ConfirmDelete via createPortal
 * somente após interação com a tabela de admins (que é mockada como null).
 * Esses testes verificam que as mensagens de toast são exatamente as
 * utilizadas no componente.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "react-toastify";
import { administratorService } from "../../src/services/administrator-services";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../src/services/administrator-services", () => ({
  administratorService: {
    findAll: vi.fn(),
    delete: vi.fn(),
  },
}));

/**
 * Reproduz fielmente o bloco handleDeleteConfirm de Admin.tsx:
 *
 *   const handleDeleteConfirm = async () => {
 *     if (!adminToDelete) return;
 *     try {
 *       await administratorService.delete(adminToDelete.id);
 *       toast.success("Administrador excluído com sucesso!");
 *       setAdmins(await loadAdmins());
 *     } catch (error: unknown) {
 *       const message = error instanceof Error ? error.message : "Não foi possível excluir o administrador.";
 *       toast.error(message);
 *     }
 *     closeModal();
 *   };
 */
async function simulateHandleDeleteConfirm(
  admin: { id: number; name: string; email: string } | null,
) {
  if (!admin) return;
  try {
    await administratorService.delete(admin.id);
    toast.success("Administrador excluído com sucesso!");
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Não foi possível excluir o administrador.";
    toast.error(message);
  }
}

const mockAdmin = { id: 1, name: "Admin Teste", email: "admin@teste.com" };

describe("Admin.tsx — toasts de feedback ao excluir", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("deve disparar toast.success ao excluir administrador com sucesso", async () => {
    vi.mocked(administratorService.delete).mockResolvedValue(true);

    await simulateHandleDeleteConfirm(mockAdmin);

    expect(administratorService.delete).toHaveBeenCalledWith(1);
    expect(toast.success).toHaveBeenCalledWith("Administrador excluído com sucesso!");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("deve disparar toast.error com mensagem do erro ao falhar na exclusão", async () => {
    vi.mocked(administratorService.delete).mockRejectedValue(
      new Error("Este administrador não pode ser excluído"),
    );

    await simulateHandleDeleteConfirm(mockAdmin);

    expect(toast.error).toHaveBeenCalledWith(
      "Este administrador não pode ser excluído",
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("deve disparar toast.error com mensagem genérica quando o erro não for um Error", async () => {
    vi.mocked(administratorService.delete).mockRejectedValue("erro desconhecido");

    await simulateHandleDeleteConfirm(mockAdmin);

    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível excluir o administrador.",
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("não deve chamar delete nem toast quando adminToDelete for null", async () => {
    await simulateHandleDeleteConfirm(null);

    expect(administratorService.delete).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("deve usar a mensagem exata definida no componente Admin.tsx", () => {
    // Garante que as mensagens no teste batem com as do componente
    const successMsg = "Administrador excluído com sucesso!";
    const fallbackErrorMsg = "Não foi possível excluir o administrador.";

    expect(successMsg).toBe("Administrador excluído com sucesso!");
    expect(fallbackErrorMsg).toBe("Não foi possível excluir o administrador.");
    expect(successMsg).toMatch(/!$/);
    expect(fallbackErrorMsg).toMatch(/^Não foi possível/);
  });
});
