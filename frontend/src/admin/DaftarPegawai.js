import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Komponen utama daftar pegawai
export default function DaftarPegawai() {
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // State untuk modal konfirmasi
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchPegawai = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/api/users/pegawai", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPegawai(res.data);
    } catch (err) {
      toast.error("Gagal memuat data pegawai");
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan modal konfirmasi hapus
  const handleHapus = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  // Jika user mengonfirmasi hapus
  const konfirmasiHapus = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/users/${selectedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Pegawai berhasil dihapus");
      fetchPegawai();
    } catch (err) {
      toast.error("Gagal menghapus pegawai");
    } finally {
      setShowConfirm(false);
      setSelectedId(null);
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, []);

  const filteredPegawai = pegawai.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 px-6 py-10 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header dan pencarian */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Pegawai</h1>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Cari pegawai..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 w-2 h-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabel Pegawai */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4">No</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500 italic">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredPegawai.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-400 italic">
                    Tidak ada data pegawai
                  </td>
                </tr>
              ) : (
                filteredPegawai.map((item, idx) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50 transition-all">
                    <td className="p-4">{idx + 1}</td>
                    <td className="p-4 font-medium text-gray-800">{item.nama}</td>
                    <td className="p-4">{item.email}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleHapus(item._id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-full text-xs flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3H4m16 0H4" />
                        </svg>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Konfirmasi */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-96">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Konfirmasi Penghapusan</h2>
              <p className="text-sm text-gray-600 mb-6">
                Apakah kamu yakin ingin menghapus pegawai ini? Semua data terkait akan terhapus secara permanen.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={konfirmasiHapus}
                  className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
