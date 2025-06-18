import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Absensi() {
  const [user, setUser] = useState({});
  const [riwayat, setRiwayat] = useState([]);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:8000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data);
  };

  const fetchRiwayat = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:8000/api/absensi/history", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRiwayat(res.data);
  };

  useEffect(() => {
    fetchUser();
    fetchRiwayat();
  }, []);

  const handleCheckIn = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:8000/api/absensi/checkin",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Berhasil Check In!");
      fetchRiwayat();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Gagal Check In");
    }
  };

  const handleCheckOut = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:8000/api/absensi/checkout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Berhasil Check Out!");
      fetchRiwayat();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Gagal Check Out");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md rounded-b-2xl">
        <div className="flex items-center space-x-2">
          <img src="/logowinnicode.png" alt="Logo" className="h-9 w-auto" />
        </div>
        <div className="flex space-x-6 text-sm font-medium text-gray-700">
          <a href="/dashboard" className="hover:text-blue-600 transition">
            Dashboard
          </a>
          <a href="/absensi" className="hover:text-blue-600 transition">
            Absensi
          </a>
          <a href="/cuti" className="hover:text-blue-600 transition">
            Pengajuan Izin
          </a>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="flex items-center gap-1 text-sm text-gray-700 hover:text-red-500 transition"
        >
          <span>Keluar</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-[#3B3B3B] text-white text-center py-3 font-semibold rounded-lg mx-6 mt-4">
        Form Absensi
      </div>

      {/* Absensi Box */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mt-8">
        <h2 className="text-xl font-semibold mb-2">Halo, {user.nama}</h2>
        <p className="text-sm text-gray-500 mb-1">
          Silakan lakukan <strong>Check-in</strong> untuk memulai absensi Anda
          hari ini
        </p>
        <div className="flex items-center text-sm text-gray-600 mb-4 gap-4">
          <span>
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span>
            {new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow transition-colors duration-200"
          >
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow transition-colors duration-200"
          >
            Check Out
          </button>
        </div>
      </div>

      {/* Riwayat Table */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto mt-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 font-medium">Tanggal</th>
              <th className="p-3 font-medium">Check In</th>
              <th className="p-3 font-medium">Check Out</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.map((item, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">
                  {new Date(item.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td className="p-3">{item.checkIn || "-"}</td>
                <td className="p-3">{item.checkOut || "-"}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                      item.status === "Hadir"
                        ? "text-green-600 border-green-500"
                        : item.status === "Pending"
                        ? "text-yellow-600 border-yellow-500"
                        : "text-red-600 border-red-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-6 mt-8">
        Winnicode © {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
