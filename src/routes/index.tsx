import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Dashboard } from "../pages/Dashboard";
import { StationSelect } from "../pages/StationSelect";
import { Parameters } from "../pages/Parameters";
import { StationManage } from "@/pages/StationManage";
import { Login } from "../pages/Login";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from 'react-hot-toast';

export function AppRoutes() {
  return (
      <AuthProvider>
        <Toaster position="top-right" /> 
        
        <Routes>
          <Route path="/" element={<Navigate to="/admin/selecionar-estacao" replace />} />
          
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin/selecionar-estacao" element={<StationSelect />} />
              <Route path="/admin/dashboard/:id" element={<Dashboard />} />
              <Route path="/admin/gerenciar-parametros" element={<Parameters/>} />
              <Route path="/admin/gerenciar-estacoes" element={<StationManage />} /> 
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
  );
}