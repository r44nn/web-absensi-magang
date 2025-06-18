import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaKey, FaLock, FaUnlock } from "react-icons/fa";

export default function GantiPasswordAdmin() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast.error("Password baru minimal 6 karakter");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Konfirmasi password tidak cocok");
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:8000/api/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password berhasil diubah");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Gagal mengubah password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white font-sans flex flex-col">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Ganti Password Administrator
          </h1>
          <p className="mt-1 opacity-90">
            Amankan akun Anda dengan mengganti password secara berkala.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white/60 backdrop-blur-md rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Lama */}
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                placeholder="Password Lama"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            {/* Password Baru */}
            <div className="relative">
              <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                placeholder="Password Baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            {/* Konfirmasi Password */}
            <div className="relative">
              <FaUnlock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                placeholder="Konfirmasi Password Baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-9  00 text-white py-2 rounded-full font-medium transition"
            >
              <FaKey /> Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
