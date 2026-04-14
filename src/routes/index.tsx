import { Routes, Route} from "react-router-dom";
import { Layout } from "../components/Layout/Layout";
import { Dashboard } from "../pages/Dashboard";
import { StationSelect } from "../pages/StationSelect";
import { Parameters } from "../pages/Parameters";
import { StationManage } from "@/pages/StationManage";
import { Login } from "../pages/Login";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from 'react-hot-toast';
import { Admin } from "@/pages/Admin";
import { PublicLayout } from "@/components/Layout/publicLayout";
import { PublicHome } from "@/pages/PublicHome";

export function AppRoutes() {
  return (
      <AuthProvider>
        <Toaster position="top-right" /> 
        
        <Routes>
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicHome />} />
            <Route path="/dashboard/:id" element={<Dashboard />} />
          </Route>

          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin/selecionar-estacao" element={<StationSelect />} />
              <Route path="/admin/dashboard/:id" element={<Dashboard />} />
              <Route path="/admin/gerenciar-parametros" element={<Parameters/>} />
              <Route path="/admin/gerenciar-estacoes" element={<StationManage />} />
              <Route path="/admin/gerenciar-administradores" element={<Admin />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
  );
}