/* eslint-disable react-refresh/only-export-components */
import { apiFetch } from '@/services/api';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('@ClimaSense:token'));
  const navigate = useNavigate();

  const login = (newToken: string) => {
    localStorage.setItem('@ClimaSense:token', newToken);
    setToken(newToken);
    navigate('/admin/selecionar-estacao');
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Erro ao notificar o backend sobre o logout", error);
    } finally {
      localStorage.removeItem('@ClimaSense:token');
      setToken(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};