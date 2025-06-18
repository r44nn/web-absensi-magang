// controllers/absensi_Controllers.js

const Absensi = require("../models/absensi");
const AjuanCuti = require("../models/ajuancuti");
const ExcelJS = require("exceljs");

exports.checkIn = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    // Blokir jika sedang cuti
    const onLeave = await AjuanCuti.findOne({
      user: req.user.id,
      status: "Approved",
      tanggalMulai: { $lte: start },
      tanggalSelesai: { $gte: end },
    });
    if (onLeave) {
      return res
        .status(400)
        .json({ msg: "Tidak dapat check-in: Anda sedang cuti hari ini." });
    }

    // Cek apakah sudah ada absensi hari ini
    const existing = await Absensi.findOne({
      user: req.user.id,
      tanggal: { $gte: start, $lte: end },
    });
    if (existing) {
      if (existing.status === "Cuti") {
        return res
          .status(400)
          .json({ msg: "Anda sedang cuti hari ini. Tidak perlu check-in." });
      }
      return res.status(400).json({ msg: "Anda sudah check-in hari ini." });
    }

    // Simpan absensi baru dengan status Pending
    const record = new Absensi({
      user: req.user.id,
      tanggal: new Date(),
      checkIn: new Date(),
      status: "Pending",
    });
    await record.save();
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    // Blokir jika sedang cuti
    const onLeave = await AjuanCuti.findOne({
      user: req.user.id,
      status: "Approved",
      tanggalMulai: { $lte: start },
      tanggalSelesai: { $gte: end },
    });
    if (onLeave) {
      return res
        .status(400)
        .json({ msg: "Tidak dapat check-out: Anda sedang cuti hari ini." });
    }

    // Ambil absensi hari ini
    const record = await Absensi.findOne({
      user: req.user.id,
      tanggal: { $gte: start, $lte: end },
    });
    if (!record) {
      return res.status(400).json({ msg: "Anda belum check-in hari ini." });
    }
    if (record.status === "Cuti") {
      return res
        .status(400)
        .json({ msg: "Anda sedang cuti hari ini. Tidak perlu check-out." });
    }
    if (record.checkOut) {
      return res.status(400).json({ msg: "Anda sudah check-out hari ini." });
    }

    // Simpan waktu check-out dan set status Hadir
    record.checkOut = new Date();
    record.status = "Hadir";
    await record.save();
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.history = async (req, res) => {
  try {
    // Ambil absensi user
    const absen = await Absensi.find({ user: req.user.id });
    // Ambil cuti user
    const cutiList = await AjuanCuti.find({
      user: req.user.id,
      status: "Approved",
    }).lean();

    // Format absensi (Pending / Hadir)
    const hadirEntries = absen.map((item) => ({
      tanggal: item.tanggal.toISOString().slice(0, 10),
      checkIn: item.checkIn
        ? new Date(item.checkIn).toLocaleTimeString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "-",
      checkOut: item.checkOut
        ? new Date(item.checkOut).toLocaleTimeString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "-",
      status: item.status,
    }));

    // Format entri cuti
    const leaveEntries = [];
    cutiList.forEach((c) => {
      let cur = new Date(c.tanggalMulai);
      cur.setHours(0, 0, 0, 0);
      const last = new Date(c.tanggalSelesai);
      last.setHours(0, 0, 0, 0);
      while (cur <= last) {
        leaveEntries.push({
          tanggal: cur.toISOString().slice(0, 10),
          checkIn: "-",
          checkOut: "-",
          status: "Cuti",
        });
        cur.setDate(cur.getDate() + 1);
      }
    });

    // Gabung dan urutkan
    const all = [...hadirEntries, ...leaveEntries];
    const sorted = all.sort(
      (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
    );

    // Filter satu entri per tanggal (prioritas: Pending/Hadir over Cuti)
    const seen = new Set();
    const filtered = [];
    for (const e of sorted) {
      if (!seen.has(e.tanggal)) {
        filtered.push(e);
        seen.add(e.tanggal);
      }
    }

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAllAbsensi = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }

    const { nama = "", tanggal, status = "All" } = req.query;

    // 1) Bikin filter tanggal untuk Absensi
    let dateFilter = {};
    if (tanggal) {
      const startDate = new Date(tanggal);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      dateFilter.tanggal = { $gte: startDate, $lt: endDate };
    }

    // 2) Ambil data Absensi
    const absensiData = await Absensi.find(dateFilter)
      .populate("user", "nama email")
      .sort({ tanggal: -1 });

    // 3) Ambil data Cuti yang approved, dan irisan tanggal jika filter tanggal dipakai
    const cutiFilter = { status: "Approved" };
    if (tanggal) {
      cutiFilter.tanggalMulai = { $lte: new Date(tanggal) };
      // <= tanggal filter
      const endDate = new Date(tanggal);
      endDate.setDate(endDate.getDate() + 1);
      cutiFilter.tanggalSelesai = { $gte: endDate };
    }
    const cutiData = await AjuanCuti.find(cutiFilter)
      .populate("user", "nama email")
      .lean();

    // 4) Format Absensi
    const formattedAbsensi = absensiData.map((item) => ({
      nama: item.user.nama,
      email: item.user.email,
      tanggal: item.tanggal.toLocaleDateString("id-ID"), // pakai locale
      checkIn: item.checkIn
        ? new Date(item.checkIn).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "-",
      checkOut: item.checkOut
        ? new Date(item.checkOut).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "-",
      status: item.status, // "Pending" atau "Hadir"
    }));

    // 5) Format Cuti (hanya jika belum ada absensi di tanggal yang sama)
    const keySet = new Set(
      formattedAbsensi.map((e) => `${e.tanggal}__${e.email}`)
    );
    const formattedCuti = [];
    cutiData.forEach((c) => {
      let cur = new Date(c.tanggalMulai);
      cur.setHours(0, 0, 0, 0);
      const last = new Date(c.tanggalSelesai);
      last.setHours(0, 0, 0, 0);
      while (cur <= last) {
        const d = cur.toLocaleDateString("id-ID");
        const key = `${d}__${c.user.email}`;
        if (!keySet.has(key)) {
          formattedCuti.push({
            nama: c.user.nama,
            email: c.user.email,
            tanggal: d,
            checkIn: "-",
            checkOut: "-",
            status: "Cuti",
          });
          keySet.add(key);
        }
        cur.setDate(cur.getDate() + 1);
      }
    });

    // 6) Gabung, filter by nama & status, lalu sort menurun by tanggal
    const combined = [...formattedAbsensi, ...formattedCuti]
      .filter((e) =>
        // filter nama
        e.nama.toLowerCase().includes(nama.toLowerCase())
      )
      .filter((e) =>
        // filter status jika bukan "All"
        status === "All" ? true : e.status === status
      )
      .sort((a, b) => {
        const da = new Date(a.tanggal.split(".").reverse().join("-"));
        const db = new Date(b.tanggal.split(".").reverse().join("-"));
        return db - da;
      });

    return res.json(combined);
  } catch (err) {
    console.error("Admin getAllAbsensi error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.exportAbsensiToExcel = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }
    const data = await Absensi.find()
      .populate("user", "nama email")
      .sort({ tanggal: -1 });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Riwayat Absensi");
    ws.columns = [
      { header: "Nama", key: "nama", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "Check In", key: "checkIn", width: 10 },
      { header: "Check Out", key: "checkOut", width: 10 },
      { header: "Status", key: "status", width: 10 },
    ];
    data.forEach((item) => {
      ws.addRow({
        nama: item.user.nama,
        email: item.user.email,
        tanggal: item.tanggal.toISOString().split("T")[0],
        checkIn: item.checkIn
          ? new Date(item.checkIn).toLocaleTimeString("id-ID", {
              timeZone: "Asia/Jakarta",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "-",
        checkOut: item.checkOut
          ? new Date(item.checkOut).toLocaleTimeString("id-ID", {
              timeZone: "Asia/Jakarta",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "-",
        status: item.status,
      });
    });

    res
      .header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
      .header(
        "Content-Disposition",
        "attachment; filename=riwayat_absensi.xlsx"
      );
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getStatistikAbsensiUser = async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const hadir = await Absensi.countDocuments({
      user: req.user.id,
      tanggal: { $gte: firstDay, $lte: lastDay },
      checkOut: { $ne: null },
    });

    const pengajuan = await AjuanCuti.find({
      user: req.user.id,
      status: "Approved",
      tanggalMulai: { $lte: lastDay },
      tanggalSelesai: { $gte: firstDay },
    });

    let izin = 0,
      sakit = 0,
      cuti = 0;
    pengajuan.forEach((p) => {
      if (p.jenisCuti === "sakit") sakit++;
      else if (p.jenisCuti === "izin") izin++;
      else if (p.jenisCuti === "cuti") cuti++;
    });

    res.json({ hadir, izin, sakit, cuti });
  } catch (err) {
    console.error("Statistik Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAktivitasHariIni = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const absensi = await Absensi.find({
      tanggal: { $gte: today, $lt: tomorrow },
    }).populate("user", "nama");

    const izin = await AjuanCuti.find({
      createdAt: { $gte: today, $lt: tomorrow },
    }).populate("user", "nama");

    const logAbsensi = absensi.flatMap((a) => {
      const logs = [];
      if (a.checkIn) {
        logs.push({
          nama: a.user.nama,
          aktivitas: "Check-in",
          waktu: a.checkIn,
        });
      }
      if (a.checkOut) {
        logs.push({
          nama: a.user.nama,
          aktivitas: "Check-out",
          waktu: a.checkOut,
        });
      }
      return logs;
    });

    const logIzin = izin.map((i) => ({
      nama: i.user.nama,
      aktivitas: "Pengajuan Cuti",
      waktu: i.createdAt,
    }));

    const aktivitas = [...logAbsensi, ...logIzin].sort(
      (a, b) => new Date(a.waktu) - new Date(b.waktu)
    );

    res.json(aktivitas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Gagal memuat aktivitas hari ini" });
  }
};
