import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { BaseModal } from "@/components/ui/BaseModal";

describe("Componente <BaseModal />", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    title: "Título de Teste",
  };

  // Esta é a mágica que resolve o problema dos "múltiplos elementos"!
  // Ela garante que o DOM (document.body) seja completamente limpo após CADA teste.
  afterEach(() => {
    cleanup();
    document.body.innerHTML = ""; 
    vi.clearAllMocks();
  });

  it("não deve renderizar nada quando isOpen for false", () => {
    render(
      <BaseModal {...defaultProps} isOpen={false}>
        <div>Conteúdo Invisível</div>
      </BaseModal>
    );
    expect(screen.queryByText("Título de Teste")).not.toBeInTheDocument();
  });

  it("deve renderizar corretamente com título, subtítulo e conteúdo", () => {
    render(
      <BaseModal {...defaultProps} subtitle="Subtítulo de teste">
        <div>Conteúdo do Modal</div>
      </BaseModal>
    );

    expect(screen.getByText("Título de Teste")).toBeInTheDocument();
    expect(screen.getByText("Subtítulo de teste")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do Modal")).toBeInTheDocument();
  });

  it("deve chamar onClose ao clicar no botão X de fechamento", () => {
    render(
      <BaseModal {...defaultProps}>
        <div>Conteúdo</div>
      </BaseModal>
    );

    const closeButton = screen.getByRole("button", { name: /fechar modal/i });
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onCancel ao clicar no botão de Cancelar padrão", () => {
    render(
      <BaseModal {...defaultProps}>
        <div>Conteúdo</div>
      </BaseModal>
    );

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    fireEvent.click(cancelButton);
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onConfirm ao clicar no botão primário", () => {
    render(
      <BaseModal {...defaultProps} confirmText="Salvar Alterações">
        <div>Conteúdo</div>
      </BaseModal>
    );

    const confirmButton = screen.getByRole("button", { name: /salvar alterações/i });
    fireEvent.click(confirmButton);
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("deve desabilitar botões e exibir texto de loading quando isLoading for true", () => {
    render(
      <BaseModal {...defaultProps} isLoading={true} confirmText="Salvar">
        <div>Conteúdo</div>
      </BaseModal>
    );

    const confirmButton = screen.getByRole("button", { name: /processando\.\.\./i });
    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("deve renderizar um customFooter em vez dos botões padrão se a prop for enviada", () => {
    const customFooter = <button data-testid="custom-btn">Botão Customizado Vermelho</button>;
    
    render(
      <BaseModal {...defaultProps} customFooter={customFooter}>
        <div>Conteúdo</div>
      </BaseModal>
    );

    expect(screen.getByTestId("custom-btn")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancelar/i })).not.toBeInTheDocument();
  });
});