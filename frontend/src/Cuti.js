import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Cuti() {
  const [user, setUser] = useState({});
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");
  const [jenis, setJenis] = useState("sakit");
  const [alasan, setAlasan] = useState("");
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    const res = await axios.get("http://localhost:8000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data);
  };

  const fetchHistory = async () => {
    const res = await axios.get("http://localhost:8000/api/ajuancuti/history", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setHistory(res.data);
  };

  useEffect(() => {
    fetchUser();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/api/ajuancuti/submit",
        {
          tanggalMulai: mulai,
          tanggalSelesai: selesai,
          jenisCuti: jenis,
          alasan,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Pengajuan cuti berhasil dikirim.");
      setMulai("");
      setSelesai("");
      setJenis("sakit");
      setAlasan("");
      fetchHistory();
    } catch (err) {
      toast.error("Gagal mengirim pengajuan cuti.");
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

      {/* Header bar */}
      <div className="bg-[#3B3B3B] text-white text-center py-2 font-semibold text-sm">
        Form Pengajuan Cuti
      </div>

      <main className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-md shadow-md">
          <h2 className="text-lg font-semibold">Halo, {user.nama}</h2>
          <p className="text-sm text-gray-600 mb-4">
            Silakan ajukan cuti Anda dengan mengisi form di bawah ini.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={mulai}
                  onChange={(e) => setMulai(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={selesai}
                  onChange={(e) => setSelesai(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Jenis Cuti</label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
                <option value="cuti">Cuti</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Alasan Cuti</label>
              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows="4"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Tulis alasan disini..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
            >
              Kirim Permintaan
            </button>
          </form>
        </div>

        <div className="bg-white p-4 rounded-md shadow-md w-[851px] overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Tanggal Cuti</th>
                <th className="p-2">Tanggal Selesai</th>
                <th className="p-2">Jenis Cuti</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">
                    {new Date(item.tanggalMulai).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-2">
                    {new Date(item.tanggalSelesai).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-2 capitalize">{item.jenisCuti}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      item.status === "Approved"
                        ? "text-green-600 border-green-500"
                        : item.status === "Rejected"
                        ? "text-red-600 border-red-500"
                        : "text-yellow-700 border-yellow-500"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="text-center text-xs text-gray-500 mt-6">
          Winnicode © {new Date().getFullYear()}. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
