import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Absensi from "./Absensi";
import Cuti from "./Cuti";
import GantiPassword from "./GantiPassword";

// ADMIN PAGES
import AdminDashboard from "./admin/AdminDashboard";
import DaftarPegawai from "./admin/DaftarPegawai";
import RiwayatAbsensiAdmin from "./admin/RiwayatAbsensiAdmin";
import RiwayatCutiAdmin from "./admin/RiwayatCutiAdmin";
import GantiPasswordAdmin from "./admin/GantiPasswordAdmin"; // ✅ Tambah import

import AdminRoute from "./admin/AdminRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/absensi" element={<Absensi />} />
          <Route path="/cuti" element={<Cuti />} />
          <Route path="/gantipassword" element={<GantiPassword />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pegawai"
            element={
              <AdminRoute>
                <DaftarPegawai />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/riwayat-absensi"
            element={
              <AdminRoute>
                <RiwayatAbsensiAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/riwayat-cuti"
            element={
              <AdminRoute>
                <RiwayatCutiAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/ganti-password"
            element={
              <AdminRoute>
                <GantiPasswordAdmin />
              </AdminRoute>
            }
          />
        </Routes>

        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
