import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Kalau belum login atau bukan admin, redirect ke login
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
