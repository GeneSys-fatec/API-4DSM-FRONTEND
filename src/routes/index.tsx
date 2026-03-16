import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Dashboard } from "../pages/Dashboard";
import { StationSelect } from "../pages/StationSelect";


export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/selecionar-estacao" replace />} />

    
      <Route element={<Layout />}>
        <Route path="/admin/selecionar-estacao" element={<StationSelect />} />
        <Route path="/admin/dashboard/:id" element={<Dashboard />} />
        {/* <Route path="/gerenciar-estacoes" element={} /> */}
      </Route>
    </Routes>
  );
}