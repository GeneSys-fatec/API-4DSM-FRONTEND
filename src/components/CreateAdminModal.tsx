import { useState } from "react";
import { toast } from "react-toastify";
import { administratorService } from "../services/administrator-services";
import { AdminForm } from "./forms/AdminForm";
import { BaseModal } from "./ui/BaseModal"; // Ajuste o path conforme sua estrutura

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

  const handleClose = () => {
    onClose();
    setName(""); 
    setEmail(""); 
    setPassword("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await administratorService.create({ name, email, password });
      toast.success("Administrador cadastrado com sucesso!");
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ocorreu um erro inesperado";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Novo administrador"
      onCancel={handleClose}
      confirmText="Enviar"
      onConfirm={handleSubmit}
      isLoading={isLoading}
      maxWidth="xl"
    >
      <AdminForm 
        name={name} 
        setName={setName} 
        email={email} 
        setEmail={setEmail} 
        password={password} 
        setPassword={setPassword} 
        isEditMode={false} 
      />
    </BaseModal>
  );
}