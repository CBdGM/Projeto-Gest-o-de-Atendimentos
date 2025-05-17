import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import Clientes from "../pages/clientes/index";
import ClienteCreate from "../pages/clientes/ClienteCreate";
import ClienteUpdate from "../pages/clientes/ClienteUpdate";
import Sessoes from "../pages/sessoes/index";
import SessaoCreate from "../pages/sessoes/sessaoCreate";
import SessaoUpdate from "../pages/sessoes/sessaoUpdate";

interface AppRoutesProps {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

export default function AppRoutes({ toggleTheme, mode }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout toggleTheme={toggleTheme} mode={mode} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/novo" element={<ClienteCreate />} />
        <Route path="clientes/editar/:id" element={<ClienteUpdate />} />

        <Route path="sessoes" element={<Sessoes />} />
        <Route path="sessoes/novo" element={<SessaoCreate />} />
        <Route path="sessoes/editar/:id" element={<SessaoUpdate />} />        
        {/* ...outras rotas */}
      </Route>
    </Routes>
  );
}