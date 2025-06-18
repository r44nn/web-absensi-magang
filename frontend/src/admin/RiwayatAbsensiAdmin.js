import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
  FaSearch,
  FaCalendarAlt,
  FaRedoAlt,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { saveAs } from "file-saver";

export default function RiwayatAbsensiAdmin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("tanggal");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const searchRef = useRef(null);
  const dateRef = useRef(null);

  // 1️⃣ Ambil data dari API — sudah termasuk filter nama & tanggal
  const fetchData = async (q = "", t = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8000/api/absensi/admin?nama=${q}&tanggal=${t}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
      setPage(1);
    } catch (err) {
      console.error("Gagal load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers input
  const onSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchData(v, tanggal), 300);
  };
  const onDate = (e) => {
    const v = e.target.value;
    setTanggal(v);
    clearTimeout(dateRef.current);
    dateRef.current = setTimeout(() => fetchData(search, v), 300);
  };
  const onStatus = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };
  const resetFilters = () => {
    setSearch("");
    setTanggal("");
    setStatusFilter("All");
    fetchData();
  };

  // Toggle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Export ke Excel
  const handleExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8000/api/absensi/export/excel?nama=${search}&tanggal=${tanggal}&status=${statusFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      saveAs(new Blob([res.data]), "riwayat_absensi.xlsx");
    } catch (err) {
      console.error("Gagal export:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ Filter by status & nama (tanggal sudah difilter di API)
  const filtered = data.filter(
    (d) =>
      (statusFilter === "All" || d.status === statusFilter) &&
      d.nama.toLowerCase().includes(search.toLowerCase())
  );

  // 3️⃣ Sort
  const sorted = [...filtered].sort((a, b) => {
    const va = sortField === "tanggal" ? new Date(a[sortField]) : a[sortField];
    const vb = sortField === "tanggal" ? new Date(b[sortField]) : b[sortField];
    if (va < vb) return sortOrder === "asc" ? -1 : 1;
    if (va > vb) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // 4️⃣ Dedupe (tanggal+email)
  const unique = useMemo(() => {
    const seen = new Set();
    return sorted.filter((item) => {
      const key = `${item.tanggal}-${item.email}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sorted]);

  // 5️⃣ Pagination
  const pages = Math.ceil(unique.length / pageSize);
  const paged = unique.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white font-sans">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold">
            Riwayat Absensi Pegawai
          </h1>
          <p className="mt-1 opacity-90">
            Lihat, filter, dan unduh data absensi.
          </p>
        </div>

        {/* Filter Panel */}
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-6 shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Cari nama */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={onSearch}
              placeholder="Cari nama pegawai..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-blue-200"
            />
          </div>
          {/* Filter tanggal */}
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={tanggal}
              onChange={onDate}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-blue-200"
            />
          </div>
          {/* Filter status */}
          <select
            value={statusFilter}
            onChange={onStatus}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200"
          >
            <option value="All">Semua Status</option>
            <option value="Hadir">Hadir</option>
            <option value="Pending">Pending</option>
            <option value="Cuti">Cuti</option>
          </select>
          {/* Reset all */}
          <button
            onClick={resetFilters}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            <FaRedoAlt /> Reset Filter
          </button>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            disabled={loading}
            className="bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-full shadow hover:bg-green-700 transition"
          >
            Export Excel
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                {[
                  ["Tanggal", "tanggal"],
                  ["Nama", "nama"],
                  ["Email", "email"],
                  ["Check-in", "checkIn"],
                  ["Check-out", "checkOut"],
                  ["Status", "status"],
                ].map(([label, field]) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer select-none"
                  >
                    <span className="inline-flex items-center">
                      {label}
                      {sortField === field &&
                        (sortOrder === "asc" ? (
                          <FaSortUp className="ml-1 text-gray-500" />
                        ) : (
                          <FaSortDown className="ml-1 text-gray-500" />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(6)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                          </td>
                        ))}
                    </tr>
                  ))
                : paged.map((row, i) => (
                    <tr
                      key={i}
                      className={`${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-4 py-3">{row.tanggal}</td>
                      <td className="px-4 py-3">{row.nama}</td>
                      <td className="px-4 py-3">{row.email}</td>
                      <td className="px-4 py-3">{row.checkIn || "-"}</td>
                      <td className="px-4 py-3">{row.checkOut || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            row.status === "Hadir"
                              ? "text-green-600 border-green-600/50 bg-green-50"
                              : row.status === "Cuti"
                              ? "text-red-600 border-red-600/50 bg-red-50"
                              : "text-yellow-600 border-yellow-600/50 bg-yellow-50"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-4 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              {page} / {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
