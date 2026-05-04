import { Routes, Route } from "react-router-dom";
import { Layout } from "../components/Layout/Layout";
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
import { WeatherDatas } from "@/pages/WeatherDatas";
import { MapView } from "@/pages/MapView";

export function AppRoutes() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />

      <Routes>

        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicHome />} />
          <Route path="/weather-datas/:id" element={<WeatherDatas />} />
          <Route path="/mapa" element={<MapView />} />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/admin/selecionar-estacao" element={<StationSelect />} />
            <Route path="/admin/weather-datas/:id" element={<WeatherDatas />} />
            <Route path="/admin/gerenciar-parametros" element={<Parameters />} />
            <Route path="/admin/gerenciar-estacoes" element={<StationManage />} />
            <Route path="/admin/gerenciar-administradores" element={<Admin />} />
            <Route path="/admin/mapa" element={<MapView mode="admin" />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}