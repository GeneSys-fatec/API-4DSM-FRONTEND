import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { administratorService } from "../services/administrator-services";

export function Profile() {
  const navigate = useNavigate();
  const [id, setId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let isMounted = true;
    administratorService.getMe().then((profile) => {
      if (isMounted && profile) {
        setId(profile.id);
        setName(profile.name);
        setEmail(profile.email);
      }
      if (isMounted) {
        setIsFetching(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("Erro ao identificar o administrador.");
      return;
    }

    if (!name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    // Validação de alteração de senha
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        toast.error("A senha atual é obrigatória para alteração de senha.");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("A nova senha e a confirmação não coincidem.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload: { name: string; email: string; password?: string; currentPassword?: string } = {
        name,
        email,
      };

      if (newPassword) {
        payload.password = newPassword;
        payload.currentPassword = currentPassword;
      }

      await administratorService.update(id, payload);

      toast.success("Perfil atualizado com sucesso!");
      
      // Limpa os campos de senha
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Força a atualização do nome/email na barra lateral
      window.dispatchEvent(new Event("profile-updated"));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar perfil.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tecsus-green"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 font-inter">
      {/* Cabeçalho da página */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Editar Perfil
        </h1>
        <p className="text-sm text-gray-500">
          Gerencie suas informações pessoais e de acesso à conta de administrador.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Corpo do formulário */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          
          {/* Seção: Informações Pessoais */}
          <div className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Informações Pessoais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Campo Nome */}
              <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                  Nome Completo <span className="text-gray-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full outline-none text-sm bg-transparent"
                  required
                />
              </div>

              {/* Campo E-mail */}
              <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                  E-mail <span className="text-gray-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="seu.email@tecsus.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full outline-none text-sm bg-transparent"
                  required
                />
              </div>

            </div>
          </div>

          <hr className="border-gray-100 my-2" />

          {/* Seção: Alteração de Senha */}
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Alteração de Senha
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Deixe os campos abaixo em branco se desejar manter sua senha atual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Campo Senha Atual */}
              <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                  Senha Atual
                </label>
                <input
                  type="password"
                  placeholder="Sua senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full outline-none text-sm bg-transparent"
                />
              </div>

              {/* Campo Nova Senha */}
              <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                  Nova Senha
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full outline-none text-sm bg-transparent"
                />
              </div>

              {/* Campo Confirmar Nova Senha */}
              <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full outline-none text-sm bg-transparent"
                />
              </div>

            </div>
          </div>

        </div>

        {/* Rodapé do formulário */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => navigate("/admin/selecionar-estacao")}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-tecsus-green text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

      </form>
    </div>
  );
}
