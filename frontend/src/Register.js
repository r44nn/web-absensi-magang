import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post("http://localhost:8000/api/auth/register", formData);
      setSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || "Terjadi kesalahan saat registrasi.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex justify-center mb-6">
          <img src="/logowinnicode.png" alt="Logo" className="h-16" />
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm mb-4 text-center">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nama" className="block text-sm text-gray-600 mb-1">
              Nama
            </label>
            <input
              id="nama"
              name="nama"
              type="text"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Masukkan nama"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring focus:border-blue-300 transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Masukkan email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring focus:border-blue-300 transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-gray-600 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring focus:border-blue-300 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-2xl shadow transition-colors duration-200"
          >
            Daftar Akun
          </button>

          <p className="text-center text-sm mt-4">
            Sudah punya akun?{" "}
            <a href="/" className="text-blue-600 hover:underline transition">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
