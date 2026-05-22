import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { administratorService } from "../services/administrator-services";
import { AdminForm } from "./forms/AdminForm";

interface Props {
  isOpen: boolean;
  adminId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditAdminModal({ isOpen, adminId, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && adminId) {
      administratorService.findById(adminId).then(data => {
        if (data) {
          setName(data.name);
          setEmail(data.email);
        }
      });
    }
  }, [isOpen, adminId]);

  if (!isOpen || !adminId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await administratorService.update(adminId, { name, email, ...(password ? { password } : {}) });
      toast.success("Administrador atualizado com sucesso!");
      onSuccess();
      onClose();
      setPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ocorreu um erro inesperado";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-start md:items-center justify-center p-4 pt-20 md:pt-4" onClick={onClose}>
      <div className="w-[92vw] max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl bg-white p-5 md:p-6 shadow-xl border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Editar administrador</h1>
          <button type="button" className="text-2xl text-gray-500 hover:text-gray-700 cursor-pointer" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AdminForm name={name} setName={setName} email={email} setEmail={setEmail} password={password} setPassword={setPassword} isEditMode={true} />
          <div className="flex self-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="bg-gray-400 font-semibold text-sm p-2 px-4 text-white rounded-md opacity-80 hover:opacity-100 transition-opacity">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="bg-tecsus-green text-white font-semibold text-sm p-2 px-6 rounded-md opacity-80 hover:opacity-100 transition-opacity disabled:opacity-50">
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}