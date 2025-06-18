import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        email,
        password,
      });
      const token = res.data.token;
      localStorage.setItem("token", token);

      const me = await axios.get("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = me.data;
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Login berhasil!");
      userData.role?.toLowerCase() === "admin"
        ? navigate("/admin/dashboard")
        : navigate("/dashboard");
    } catch (err) {
      toast.error("Login gagal. Email atau password salah.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex justify-center mb-6">
          <img src="/logowinnicode.png" alt="Logo" className="h-16" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring focus:border-blue-300 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-2xl shadow transition-colors duration-200"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline transition"
          >
            Daftar sekarang.
          </Link>
        </p>
      </div>
    </div>
  );
}
