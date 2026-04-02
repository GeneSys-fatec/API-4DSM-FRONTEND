import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Dashboard } from "../pages/Dashboard";
import { StationSelect } from "../pages/StationSelect";
import { Parameters } from "../pages/Parameters";
import { StationManage } from "@/pages/StationManage";
import { Alerts } from "../pages/Alerts";


export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/selecionar-estacao" replace />} />

    
      <Route element={<Layout />}>
        <Route path="/admin/selecionar-estacao" element={<StationSelect />} />
        <Route path="/admin/dashboard/:id" element={<Dashboard />} />
        <Route path="/admin/gerenciar-parametros" element={<Parameters/>} />
        <Route path="/admin/gerenciar-estacoes" element={<StationManage />} />
        <Route path="/admin/gerenciar-alertas" element={<Alerts />} />
      </Route>
    </Routes>
  );
}