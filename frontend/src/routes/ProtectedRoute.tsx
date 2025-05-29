import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}