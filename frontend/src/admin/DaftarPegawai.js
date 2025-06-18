import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch, FaRedoAlt, FaTrashAlt, FaTimes } from "react-icons/fa";

export default function DaftarPegawai() {
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // debounce ref
  const searchRef = useRef(null);

  const fetchPegawai = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchPegawai();
  }, []);

  const handleSearch = (e) => {
    const v = e.target.value;
    clearTimeout(searchRef.current);
    setSearch(v);
    searchRef.current = setTimeout(() => {
      // no server filter, kept client-side
    }, 300);
  };

  const handleHapus = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

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

  const filtered = pegawai.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold">Daftar Pegawai</h1>
          <p className="mt-1 opacity-90">
            Kelola data pegawai—cari atau hapus dengan mudah.
          </p>
        </div>

        {/* Search Panel */}
        <div className="bg-white/60 backdrop-blur-md rounded-lg p-4 shadow-md flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Cari nama atau email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
            />
          </div>
          <button
            onClick={fetchPegawai}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            <FaRedoAlt /> Muat Ulang
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Nama Lengkap
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(4)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                          </td>
                        ))}
                    </tr>
                  ))
                : filtered.map((item, idx) => (
                    <tr
                      key={item._id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                    >
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.nama}
                      </td>
                      <td className="px-4 py-3">{item.email}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleHapus(item._id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-800"
                        >
                          <FaTrashAlt /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Tidak ada pegawai ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">
                  Konfirmasi Hapus
                </h2>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6 text-gray-700">
                <p>
                  Apakah Anda yakin ingin menghapus pegawai ini? Semua data
                  terkait akan hilang permanen.
                </p>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={konfirmasiHapus}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
