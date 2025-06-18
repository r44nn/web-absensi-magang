const AjuanCuti = require("../models/ajuancuti.js"); // ⬅️ Penamaan benar
const Absensi = require("../models/absensi"); // ⬅️ Import absensi
const ExcelJS = require("exceljs");

// ⬇️ 1. Pengajuan Cuti oleh User
exports.submitCuti = async (req, res) => {
  try {
    const { tanggalMulai, tanggalSelesai, alasan, jenisCuti } = req.body;

    if (!["sakit", "izin", "cuti"].includes(jenisCuti)) {
      return res.status(400).json({
        msg: "Jenis cuti harus salah satu dari: sakit, izin, cuti",
      });
    }

    const cuti = new AjuanCuti({
      user: req.user.id,
      tanggalMulai,
      tanggalSelesai,
      alasan,
      jenisCuti,
      status: "Pending",
    });

    await cuti.save();
    res.json({ msg: "Pengajuan cuti telah dikirim !" });
  } catch (err) {
    console.error("Submit cuti error:", err);
    res.status(500).send("Server error");
  }
};

// ⬇️ 2. Admin melihat semua pengajuan cuti
exports.manageCuti = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const allCuti = await AjuanCuti.find()
      .populate("user", "nama email")
      .sort({ createdAt: -1 });

    res.json(allCuti);
  } catch (err) {
    console.error("Manage cuti error:", err);
    res.status(500).send("Server error");
  }
};

// ⬇️ 3. Admin mengubah status cuti (Approve / Reject)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const cuti = await AjuanCuti.findById(req.params.id);
    if (!cuti) {
      return res.status(404).json({ msg: "Ajuan cuti tidak ditemukan." });
    }

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ msg: "Status tidak valid." });
    }

    cuti.status = status;

    if (status === "Approved") {
      cuti.approvedAt = new Date();

      // Generate absensi otomatis untuk hari-hari cuti
      let cur = new Date(cuti.tanggalMulai);
      cur.setHours(0, 0, 0, 0);
      const last = new Date(cuti.tanggalSelesai);
      last.setHours(0, 0, 0, 0);

      while (cur <= last) {
        const dayStart = new Date(cur);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(cur);
        dayEnd.setHours(23, 59, 59, 999);

        const existingAbsensi = await Absensi.findOne({
          user: cuti.user,
          tanggal: { $gte: dayStart, $lte: dayEnd },
        });

        if (!existingAbsensi) {
          const newAbsensi = new Absensi({
            user: cuti.user,
            tanggal: new Date(cur),
            checkIn: null,
            checkOut: null,
            status: "Cuti",
          });
          await newAbsensi.save();
        }

        cur.setDate(cur.getDate() + 1);
      }
    } else if (status === "Rejected") {
      cuti.rejectedAt = new Date();
    }

    await cuti.save();
    res.json(cuti);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ⬇️ 4. User melihat riwayat pengajuan cutinya sendiri
exports.getCutiHistoryUser = async (req, res) => {
  try {
    const history = await AjuanCuti.find({ user: req.user.id }).sort({
      tanggalMulai: -1,
    });
    res.json(history);
  } catch (err) {
    console.error("Get cuti history error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ⬇️ 5. Export riwayat cuti ke Excel (admin)
exports.exportCutiExcel = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }

    const data = await AjuanCuti.find()
      .populate("user", "username email")
      .sort({ tanggalMulai: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Riwayat Cuti");

    worksheet.columns = [
      { header: "Nama", key: "nama", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Jenis Cuti", key: "jenisCuti", width: 15 },
      { header: "Alasan", key: "alasan", width: 30 },
      { header: "Tanggal Mulai", key: "tanggalMulai", width: 15 },
      { header: "Tanggal Selesai", key: "tanggalSelesai", width: 15 },
      { header: "Status", key: "status", width: 12 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        nama: item.user.username,
        email: item.user.email,
        jenisCuti: item.jenisCuti,
        alasan: item.alasan,
        tanggalMulai: item.tanggalMulai.toISOString().split("T")[0],
        tanggalSelesai: item.tanggalSelesai.toISOString().split("T")[0],
        status: item.status,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=riwayat-cuti.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export cuti error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
