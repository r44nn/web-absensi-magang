import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function RiwayatCutiAdmin() {
  const [cutiList, setCutiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/api/ajuancuti/manage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCutiList(res.data);
    } catch (err) {
      console.error("Gagal memuat data cuti", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = cutiList.filter((item) =>
    item.user?.nama?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/api/ajuancuti/update/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Cuti berhasil di-${status === "Approved" ? "setujui" : "tolak"}`);
      setSelected(null);
      fetchData();
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Gagal memperbarui status cuti");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 font-sans">
      <div className="max-w-[1000px] mx-auto space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Kelola Izin Cuti</h2>

        <input
          type="text"
          placeholder="Cari nama pegawai..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded shadow-sm"
        />

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3">Tanggal Ajuan</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Jenis Cuti</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center italic text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center italic text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-3">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="p-3">{item.user?.nama || "-"}</td>
                    <td className="p-3 capitalize">{item.jenisCuti}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        item.status === "Pending"
                          ? "text-yellow-600 border-yellow-500"
                          : item.status === "Approved"
                          ? "text-green-600 border-green-500"
                          : "text-red-600 border-red-500"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelected(item)}
                        className="text-blue-600 text-sm underline hover:text-blue-800"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Detail Pengajuan Cuti</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Nama:</strong> {selected.user.nama}</p>
                <p><strong>Email:</strong> {selected.user.email}</p>
                <p><strong>Jenis Cuti:</strong> {selected.jenisCuti}</p>
                <div>
                  <strong>Alasan:</strong>
                  <div className="mt-1 bg-gray-100 p-2 rounded text-sm break-words max-h-[150px] overflow-y-auto">
                    {selected.alasan}
                  </div>
                </div>
                <p><strong>Tanggal Mulai:</strong> {new Date(selected.tanggalMulai).toLocaleDateString("id-ID")}</p>
                <p><strong>Tanggal Selesai:</strong> {new Date(selected.tanggalSelesai).toLocaleDateString("id-ID")}</p>
                <p><strong>Status:</strong> {selected.status}</p>
              </div>

              {selected.status === "Pending" && (
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => updateStatus(selected._id, "Approved")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => updateStatus(selected._id, "Rejected")}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Tolak
                  </button>
                </div>
              )}

              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
