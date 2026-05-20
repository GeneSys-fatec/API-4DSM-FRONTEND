import { useState } from "react";
import { toast } from "react-toastify";
import { administratorService } from "../services/administrator-services";
import { AdminForm } from "./forms/AdminForm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAdminModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await administratorService.create({ name, email, password });
      toast.success("Administrador cadastrado com sucesso!");
      onSuccess();
      onClose();
      setName(""); setEmail(""); setPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ocorreu um erro inesperado";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-80 bg-black/40 flex items-start md:items-center justify-center p-4 pt-20 md:pt-4" onClick={onClose}>
      <div className="w-[92vw] max-w-xl rounded-xl bg-white p-5 md:p-6 shadow-xl border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Novo administrador</h1>
          <button type="button" className="text-2xl text-gray-500 hover:text-gray-700 cursor-pointer" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AdminForm name={name} setName={setName} email={email} setEmail={setEmail} password={password} setPassword={setPassword} isEditMode={false} />
          <div className="flex self-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="bg-gray-400 font-semibold text-sm p-2 px-4 text-white rounded-md opacity-80 hover:opacity-100 transition-opacity">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="bg-tecsus-green text-white font-semibold text-sm p-2 px-6 rounded-md opacity-80 hover:opacity-100 transition-opacity disabled:opacity-50">
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}