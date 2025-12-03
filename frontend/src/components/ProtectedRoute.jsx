// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(sessionStorage.getItem("mc_user"));
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}
