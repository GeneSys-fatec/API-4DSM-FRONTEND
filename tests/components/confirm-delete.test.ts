import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ConfirmDelete } from "../../src/components/ConfirmDelete";

describe("ConfirmDelete (componente)", () => {
    afterEach(() => {
        cleanup();
    });

    it("deve renderizar com mensagem padrão quando itemName não for fornecido", () => {
        render(React.createElement(ConfirmDelete, { onClose: vi.fn(), onConfirm: vi.fn() }));
        
        expect(screen.getByText("Tem certeza que deseja excluir esse item?")).toBeInTheDocument();
        expect(screen.getByText("Essa ação é irreversível.")).toBeInTheDocument();
    });

    it("deve renderizar com nome do item específico quando itemName for fornecido", () => {
        render(React.createElement(ConfirmDelete, { onClose: vi.fn(), onConfirm: vi.fn(), itemName: "Estação Central" }));
        
        expect(screen.getByText('Tem certeza que deseja excluir "Estação Central"?')).toBeInTheDocument();
        expect(screen.getByText("Essa ação é irreversível.")).toBeInTheDocument();
    });

    it("deve chamar onClose ao clicar no botão de cancelar", () => {
        const handleClose = vi.fn();
        render(React.createElement(ConfirmDelete, { onClose: handleClose, onConfirm: vi.fn() }));
        
        const cancelButton = screen.getByRole("button", { name: /cancelar/i });
        fireEvent.click(cancelButton);
        
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("deve chamar onClose ao clicar no botão de fechar (x) do topo", () => {
        const handleClose = vi.fn();
        render(React.createElement(ConfirmDelete, { onClose: handleClose, onConfirm: vi.fn() }));
        
        const closeIcon = screen.getByText("×");
        fireEvent.click(closeIcon);
        
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("deve chamar onConfirm ao clicar no botão de excluir", () => {
        const handleConfirm = vi.fn();
        render(React.createElement(ConfirmDelete, { onClose: vi.fn(), onConfirm: handleConfirm }));
        
        const deleteButton = screen.getByRole("button", { name: /excluir/i });
        fireEvent.click(deleteButton);
        
        expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
});
