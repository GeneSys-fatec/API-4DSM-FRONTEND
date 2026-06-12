import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { administratorService } from "../services/administrator-services";
import { AdminForm } from "./forms/AdminForm";
import { BaseModal } from "./ui/BaseModal";

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

  const handleClose = () => {
    onClose();
    setPassword("");
  };

  const handleSubmit = async () => {
    if (!adminId) return;
    
    setIsLoading(true);
    try {
      await administratorService.update(adminId, { name, email, ...(password ? { password } : {}) });
      toast.success("Administrador atualizado com sucesso!");
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
      isOpen={isOpen && !!adminId}
      onClose={handleClose}
      title="Editar administrador"
      onCancel={handleClose}
      confirmText="Salvar"
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
        isEditMode={true} 
      />
    </BaseModal>
  );
}