import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTimes } from "react-icons/fa";

export default function Cuti() {
  const [user, setUser] = useState({});
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");
  const [jenis, setJenis] = useState("sakit");
  const [alasan, setAlasan] = useState("");
  const [history, setHistory] = useState([]);
  const [detail, setDetail] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUser();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data user");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/ajuancuti/history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat riwayat");
    }
  };

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Pengajuan cuti terkirim");
      setMulai("");
      setSelesai("");
      setJenis("sakit");
      setAlasan("");
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Gagal mengirim pengajuan");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md rounded-b-2xl">
        <img src="/logowinnicode.png" alt="Logo" className="h-9 w-auto" />
        <nav className="flex space-x-6 text-sm font-medium text-gray-700">
          <a href="/dashboard" className="hover:text-blue-600 transition">
            Dashboard
          </a>
          <a href="/absensi" className="hover:text-blue-600 transition">
            Absensi
          </a>
          <a href="/cuti" className="hover:text-blue-600 transition">
            Pengajuan Cuti
          </a>
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="text-sm text-gray-700 hover:text-red-500 transition"
        >
          Keluar
        </button>
      </header>

      {/* Page Title */}
      <div className="bg-[#3B3B3B] text-white text-center py-3 font-semibold rounded-lg mx-6 mt-4">
        Form Pengajuan Cuti
      </div>

      {/* Content */}
      <main className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Submission Form */}
        <section className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">Halo, {user.nama}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={mulai}
                  onChange={(e) => setMulai(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={selesai}
                  onChange={(e) => setSelesai(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Jenis Cuti</label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring"
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
                className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring"
                placeholder="Tulis alasan di sini..."
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-2xl shadow transition-colors duration-200"
            >
              Kirim Permintaan
            </button>
          </form>
        </section>

        {/* Submission History */}
        <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Mulai</th>
                <th className="p-4">Selesai</th>
                <th className="p-4">Jenis</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">
                    {new Date(item.tanggalMulai).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-4">
                    {new Date(item.tanggalSelesai).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-4 capitalize">{item.jenisCuti}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setDetail(item)}
                      className="text-blue-600 hover:underline"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center bg-gradient-to-r from-green-400 to-blue-500 rounded-t-3xl p-4">
              <h3 className="text-xl font-semibold text-white">Detail Cuti</h3>
              <button
                onClick={() => setDetail(null)}
                className="text-white focus:outline-none"
                aria-label="Tutup"
              >
                <FaTimes />
              </button>
            </div>
            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Mulai</span>
                <span className="text-gray-900">
                  {new Date(detail.tanggalMulai).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Selesai</span>
                <span className="text-gray-900">
                  {new Date(detail.tanggalSelesai).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Jenis</span>
                <span className="capitalize text-gray-900">
                  {detail.jenisCuti}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Status</span>
                <span
                  className={`font-semibold ${
                    detail.status === "Approved"
                      ? "text-green-600"
                      : detail.status === "Rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {detail.status}
                </span>
              </div>
              <div>
                {" "}
                <span className="font-medium text-gray-700">Alasan</span>
                <div className="mt-2 bg-gray-100 p-4 rounded-lg max-h-36 overflow-y-auto text-gray-800">
                  {detail.alasan}
                </div>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="mt-4 w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 rounded-lg shadow-lg hover:opacity-90 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-6">
        Winnicode © {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
