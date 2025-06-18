import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  FaSignOutAlt,
  FaUsers,
  FaClipboardList,
  FaHistory,
  FaKey,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({ totalUsers: 0, pendingCuti: 0 });
  const [aktivitasHariIni, setAktivitasHariIni] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  // Format "Hari ini" untuk greeting
  const todayLabel = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const headers = { Authorization: `Bearer ${token}` };
    (async () => {
      try {
        const [pegRes, cutRes, actRes] = await Promise.all([
          axios.get("http://localhost:8000/api/users/pegawai", { headers }),
          axios.get("http://localhost:8000/api/dashboard/admin", { headers }),
          axios.get("http://localhost:8000/api/absensi/aktivitas-today", {
            headers,
          }),
        ]);
        setStats({
          totalUsers: pegRes.data.length,
          pendingCuti: cutRes.data.pendingCuti,
        });
        setAktivitasHariIni(actRes.data);
      } catch (e) {
        console.error("Gagal mengambil data dashboard admin:", e);
      }
    })();
  }, []);

  const cards = [
    {
      icon: <FaUsers />,
      title: stats.totalUsers,
      sub: "Pegawai",
      color: "bg-orange-500",
      link: "/admin/pegawai",
    },
    {
      icon: <FaClipboardList />,
      title: stats.pendingCuti,
      sub: "Pending Cuti",
      color: "bg-green-800",
      link: "/admin/riwayat-cuti",
    },
    {
      icon: <FaHistory />,
      title: "Riwayat",
      sub: "Riwayat Absensi",
      color: "bg-cyan-700",
      link: "/admin/riwayat-absensi",
    },
    {
      icon: <FaKey />,
      title: "Password",
      sub: "Ganti Password",
      color: "bg-red-500",
      link: "/admin/ganti-password",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md rounded-b-2xl">
        <div className="flex items-center space-x-2">
          <img src="/logowinnicode.png" alt="Logo" className="h-9 w-auto" />
        </div>
        <div className="flex space-x-6 text-sm font-medium text-gray-700">
          <a href="/admin/dashboard" className="hover:text-blue-600 transition">
            Dashboard
          </a>
          <a
            href="/admin/riwayat-absensi"
            className="hover:text-blue-600 transition"
          >
            Riwayat Absensi
          </a>
          <a
            href="/admin/riwayat-cuti"
            className="hover:text-blue-600 transition"
          >
            Riwayat Cuti
          </a>
          <a href="/admin/pegawai" className="hover:text-blue-600 transition">
            Pegawai
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

      {/* Header Bar */}
      <div className="bg-[#3B3B3B] text-white text-center py-3 font-semibold rounded-lg mx-6 mt-4">
        Admin Dashboard
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-12 pb-12">
        {/* Greeting + Calendar */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {/* Greeting Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:basis-2/3 border border-gray-100">
            <p className="text-gray-700 text-lg">
              Selamat Datang, <strong>{user.nama || "Admin"}</strong>
            </p>
            <p className="mt-1 text-gray-600 text-sm">{todayLabel}</p>
            <p className="mt-1 text-gray-600 text-sm">
              Jam Kerja: 07.30 – 17.00
            </p>

            {/* Notifikasi lembut */}
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-200 text-blue-700 p-4 rounded-lg">
              Jangan lupa cek pengajuan cuti hari ini!
            </div>

            {/* Status Ajuan Cuti */}
            <p className="mt-6 text-gray-700 text-sm">
              {stats.pendingCuti > 0
                ? `Anda memiliki ${stats.pendingCuti} pengajuan cuti menunggu persetujuan.`
                : "Tidak ada pengajuan cuti yang menunggu saat ini."}
            </p>
            <a
              href="/admin/riwayat-cuti"
              className="inline-block mt-1 text-sm text-blue-600 hover:underline transition"
            >
              Lihat Pengajuan Cuti &gt;
            </a>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-xl p-4 lg:basis-1/3 border border-gray-100">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              locale="id-ID"
            />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {cards.map((c, i) => (
            <div
              key={i}
              onClick={() => navigate(c.link)}
              className={`${c.color} cursor-pointer transform hover:scale-105 transition-shadow duration-300 p-6 rounded-2xl shadow-2xl border border-gray-100 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{c.title}</div>
                  <div className="text-sm opacity-80 mt-1">{c.sub}</div>
                </div>
                <div className="text-4xl opacity-75">{c.icon}</div>
              </div>
              <div className="mt-4 text-xs opacity-70">More Info &gt;</div>
            </div>
          ))}
        </div>

        {/* Aktivitas Hari Ini */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-10 border border-gray-100">
          <h3 className="text-gray-800 font-semibold mb-4 text-lg">
            Aktivitas Hari Ini
          </h3>
          {aktivitasHariIni.length === 0 ? (
            <p className="text-gray-400 italic">Belum ada aktivitas.</p>
          ) : (
            <ul className="space-y-4 max-h-60 overflow-y-auto scrollbar-thin">
              {aktivitasHariIni.map((log, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <div className="w-3 h-3 mt-1 rounded-full bg-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700">{log.nama}</p>
                    <p className="text-gray-500 text-sm">
                      {log.aktivitas} –{" "}
                      {new Date(log.waktu).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-xs py-6">
        Winnicode © {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
