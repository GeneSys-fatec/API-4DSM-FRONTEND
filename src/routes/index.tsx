import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Dashboard } from "../pages/Dashboard";
import { StationSelect } from "../pages/StationSelect";
import { StationManage } from "@/pages/StationManage";
import { Parameters } from "../pages/Parameters";


export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/selecionar-estacao" replace />} />

    
      <Route element={<Layout />}>
        <Route path="/admin/selecionar-estacao" element={<StationSelect />} />
        <Route path="/admin/dashboard/:id" element={<Dashboard />} />
        <Route path="/admin/gerenciar-estacoes" element={<StationManage />} /> 
        <Route path="/admin/gerenciar-parametros" element={<Parameters/>} />
      </Route>
    </Routes>
  );
}