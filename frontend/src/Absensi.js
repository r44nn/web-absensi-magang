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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Berhasil Check Out!");
      fetchRiwayat();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Gagal Check Out");
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans">

      {/* Navbar */}
      <div className="flex justify-between items-center px-8 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <img src="/logowinnicode.png" alt="Logo" className="h-9 w-auto" />
        </div>
        <div className="flex space-x-6 text-sm font-medium text-gray-700">
          <a href="/dashboard" className="hover:text-blue-600">Dashboard</a>
          <a href="/absensi" className="hover:text-blue-600">Absensi</a>
          <a href="/cuti" className="hover:text-blue-600">Pengajuan Izin</a>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="text-sm text-gray-700 hover:text-red-500"
        >
          Keluar
        </button>
      </div>

      {/* Header Form Absen */}
      <div className="bg-[#3B3B3B] text-white text-center py-2 font-semibold text-sm mb-6" >
        Form Absensi
      </div>

      {/* Box Check-in / Check-out */}
      <div className="w-[830px] h-[259px] bg-white rounded-md shadow-md mx-auto p-6 mb-4">
        <h2 className="text-xl font-semibold mb-1">Halo, {user.nama}</h2>
        <p className="text-sm text-gray-500 mb-2">
          Silakan lakukan Check-in untuk memulai absensi Anda hari ini
        </p>
        <p className="text-sm mb-1">
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow"
          >
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow"
          >
            Check Out
          </button>
        </div>
      </div>

      {/* Tabel Riwayat Absensi */}
      <div className="w-[830px] bg-white rounded-md shadow-md mx-auto overflow-x-auto">
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
              <tr key={idx} className="border-t">
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
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      item.status === "Hadir"
                        ? "text-green-600 border-green-500"
                        : "text-yellow-600 border-yellow-500"
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
      <footer className="text-center text-xs text-gray-500 mt-6">
            Winnicode © {new Date().getFullYear()}. All rights reserved.
          </footer>
    </div>
    
  );
}
