import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaRedoAlt,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
} from "react-icons/fa";

export default function RiwayatCutiAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:8000/api/ajuancuti/manage",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setList(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
      setPage(1);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/api/ajuancuti/update/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(status === "Approved" ? "Disetujui!" : "Ditolak!");
      setSelected(null);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Gagal memperbarui");
    }
  };

  const onSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => setPage(1), 300);
  };

  const handleSort = (f) => {
    if (sortField === f) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortField(f);
      setSortOrder("asc");
    }
  };

  // Filter, sort, paginate
  let filtered = list.filter((i) =>
    i.user?.nama.toLowerCase().includes(search.toLowerCase())
  );
  filtered = filtered.sort((a, b) => {
    const va = new Date(a[sortField]),
      vb = new Date(b[sortField]);
    if (va < vb) return sortOrder === "asc" ? -1 : 1;
    if (va > vb) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  const pages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold">Kelola Pengajuan Cuti</h1>
          <p className="mt-1 opacity-80">
            Setujui atau tolak permintaan cuti karyawan.
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 shadow-md grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={onSearch}
              placeholder="Cari nama pegawai..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-purple-200"
            />
          </div>
          <button
            onClick={fetchData}
            className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            <FaRedoAlt /> Muat Ulang
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  ["Tanggal", "createdAt"],
                  ["Nama", "user.nama"],
                  ["Jenis Cuti", "jenisCuti"],
                  ["Status", "status"],
                  ["Aksi", null],
                ].map(([label, field], idx) => (
                  <th
                    key={idx}
                    onClick={field ? () => handleSort(field) : undefined}
                    className={`px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase ${
                      field ? "cursor-pointer select-none" : ""
                    }`}
                  >
                    <div className="inline-flex items-center gap-1">
                      {label}
                      {field &&
                        sortField === field &&
                        (sortOrder === "asc" ? (
                          <FaChevronUp className="text-gray-500" />
                        ) : (
                          <FaChevronDown className="text-gray-500" />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(pageSize)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array(5)
                          .fill(0)
                          .map((__, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-4 bg-gray-200 rounded-lg"></div>
                            </td>
                          ))}
                      </tr>
                    ))
                : paged.map((item, i) => (
                    <tr
                      key={item._id}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3">
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">{item.user.nama}</td>
                      <td className="px-4 py-3 capitalize">{item.jenisCuti}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            item.status === "Pending"
                              ? "text-yellow-600 border-yellow-400 bg-yellow-50"
                              : item.status === "Approved"
                              ? "text-green-600 border-green-400 bg-green-50"
                              : "text-red-600 border-red-400 bg-red-50"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(item)}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="flex justify-center items-center gap-3 text-sm mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              {page} / {pages}
            </span>
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-auto max-h-[80vh]">
              <div className="flex justify-between items-center px-6 py-3 border-b">
                <h3 className="text-l font-semibold leading-snug">
                  Detail Pengajuan Cuti
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                  aria-label="Close"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <dt className="font-semibold">Nama</dt>
                  <dd>{selected.user.nama}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Email</dt>
                  <dd>{selected.user.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Jenis Cuti</dt>
                  <dd className="capitalize">{selected.jenisCuti}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Status</dt>
                  <dd>{selected.status}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Mulai</dt>
                  <dd>
                    {new Date(selected.tanggalMulai).toLocaleDateString(
                      "id-ID"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Selesai</dt>
                  <dd>
                    {new Date(selected.tanggalSelesai).toLocaleDateString(
                      "id-ID"
                    )}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="font-semibold">Alasan</dt>
                  <dd>
                    <div className="mt-1 bg-gray-100 p-4 rounded-lg max-h-40 overflow-y-auto">
                      {selected.alasan}
                    </div>
                  </dd>
                </div>
              </div>
              {selected.status === "Pending" && (
                <div className="px-6 py-4 border-t flex justify-end gap-3">
                  <button
                    onClick={() => updateStatus(selected._id, "Rejected")}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => updateStatus(selected._id, "Approved")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Setujui
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
