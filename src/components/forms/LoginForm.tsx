import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth-service';
import toast from 'react-hot-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const token = await authService.login({ email, password });
      
      toast.success('Acesso liberado!');
      login(token); 

    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
      toast.error('Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
      <div className="relative">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-tecsus-green focus:ring-1 focus:ring-tecsus-green transition-colors"
        />
      </div>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-tecsus-green focus:ring-1 focus:ring-tecsus-green transition-colors pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-tecsus-green focus:outline-none transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-tecsus-green hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-all mt-2 disabled:opacity-70 flex justify-center items-center shadow-sm"
      >
        {isLoading ? (
          <span className="animate-pulse">Entrando...</span>
        ) : (
          'Entrar'
        )}
      </button>

      {error && (
        <p className="text-red-500 text-sm text-center font-medium mt-1">
          {error}
        </p>
      )}
    </form>
  );
}