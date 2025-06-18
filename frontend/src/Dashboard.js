import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSignOutAlt,
  FaClock,
  FaCalendarCheck,
  FaUserEdit,
} from "react-icons/fa";
import {
  MdSick,
  MdOutlineEventBusy,
  MdOutlineAssignment,
} from "react-icons/md";

export default function Dashboard() {
  const [user, setUser] = useState({});
  const [rekap, setRekap] = useState({});
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data));

    axios
      .get("http://localhost:8000/api/absensi/statistik", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRekap(res.data));

    axios
      .get("http://localhost:8000/api/absensi/history", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRiwayat(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
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
          <FaSignOutAlt />
          Keluar
        </button>
      </div>

      {/* Header bar */}
      <div className="bg-[#3B3B3B] text-white text-center py-3 font-semibold rounded-lg mx-6 mt-4">
        Dashboard
      </div>

      {/* Konten utama */}
      <main className="px-4 py-6">
        <div className="max-w-[900px] mx-auto space-y-6">
          {/* Greeting + Statistik */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 col-span-2 border border-gray-100">
              <p className="text-base text-gray-900 font-medium">
                Selamat Datang Kembali, Hari ini{" "}
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                .
              </p>
              <h2 className="text-2xl font-semibold mt-2 text-gray-900">
                {user.nama}
              </h2>
              <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                <FaClock className="text-gray-400" /> Jam Kerja 07.30 – 17.00
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Hadir"
                value={rekap.hadir}
                color="bg-[#4CAF50]"
                icon={<FaCalendarCheck />}
              />
              <StatCard
                title="Sakit"
                value={rekap.sakit}
                color="bg-[#FFA726]"
                icon={<MdSick />}
              />
              <StatCard
                title="Izin"
                value={rekap.izin}
                color="bg-[#FFC107]"
                icon={<MdOutlineEventBusy />}
              />
              <StatCard
                title="Cuti"
                value={rekap.cuti}
                color="bg-[#EF9A9A]"
                icon={<MdOutlineAssignment />}
              />
            </div>
          </div>

          {/* Menu Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard
              title="Absensi"
              subtitle="Form Absensi"
              link="/absensi"
              icon={<FaCalendarCheck />}
              color="bg-[#FFAB5B]"
              footerColor="bg-[#D89352]"
              footer="Absen >"
            />
            <ActionCard
              title="Izin"
              subtitle="Form Pengajuan Izin"
              link="/cuti"
              icon={<MdOutlineEventBusy />}
              color="bg-[#0B2E23]"
              footerColor="bg-[#0B2E23]"
              footer="Izin >"
            />
            <ActionCard
              title="Password"
              subtitle="Ganti Password"
              link="/gantipassword"
              icon={<FaUserEdit />}
              color="bg-[#FE4F2D]"
              footerColor="bg-[#A02912]"
              footer="More Info >"
            />
          </div>

          {/* Tabel Riwayat */}
          <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow-xl overflow-x-auto border border-gray-100">
            <div className="px-4 py-3 border-b text-gray-800 font-semibold text-sm">
              Riwayat Absensi
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Jam Masuk Kerja</th>
                  <th className="p-3">Jam Selesai Kerja</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-t hover:bg-gray-50 transition"
                  >
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
                            : item.status === "Cuti"
                            ? "text-red-600 border-red-400"
                            : item.status === "Izin"
                            ? "text-yellow-700 border-yellow-400"
                            : "text-gray-600 border-gray-300"
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
      </main>
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div
      className={`p-4 rounded-2xl shadow-xl transform transition-transform duration-200 hover:scale-105 border border-gray-100 text-white ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-lg font-bold">{value ?? 0} Hari</div>
        </div>
        <div className="text-2xl opacity-75">{icon}</div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  subtitle,
  link,
  color,
  footer,
  footerColor,
  icon,
}) {
  return (
    <a
      href={link}
      className="rounded-2xl overflow-hidden transform transition-transform duration-300 hover:scale-105 shadow-lg border border-gray-100 block"
    >
      <div className={`p-4 ${color} text-white`}>
        {/* content */}
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <div className="text-lg font-bold">{title}</div>
            <div className="text-sm mt-1">{subtitle}</div>
          </div>
        </div>
      </div>
      <div
        className={`${footerColor} text-sm py-2 text-white text-center font-medium`}
      >
        {footer}
      </div>
    </a>
  );
}
