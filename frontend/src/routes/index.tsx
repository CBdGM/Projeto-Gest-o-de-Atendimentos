import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import Clientes from "../pages/Clientes";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        {/* Adicione aqui: agenda, sessoes, recibos */}
      </Route>
    </Routes>
  );
}