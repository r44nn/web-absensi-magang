const Absensi = require('../models/absensi.js');
const AjuanCuti = require('../models/ajuancuti');


exports.checkIn = async (req, res) => {
    try {
      const now = new Date();
  
      // Buat tanggal awal hari (misal: 2025-05-07 00:00:00)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
  
      // Buat tanggal akhir hari (misal: 2025-05-07 23:59:59)
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
  
      // Cek apakah sudah check-in hari ini
      const alreadyCheckedIn = await Absensi.findOne({
        user: req.user.id,
        tanggal: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      });
  
      if (alreadyCheckedIn) {
        return res.status(400).json({ msg: "Kamu sudah check-in hari ini." });
      }
  
      // Simpan absensi baru
      const absensi = new Absensi({
        user: req.user.id,
        tanggal: now,
        checkIn: now,
      });
  
      await absensi.save();
      res.json({ msg: "Check-in berhasil!" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  };
  
  exports.checkOut = async (req, res) => {
    try {
      const now = new Date();
  
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
  
      const absensi = await Absensi.findOne({
        user: req.user.id,
        tanggal: { $gte: startOfDay, $lte: endOfDay },
        checkOut: null
      });
  
      if (!absensi) {
        return res.status(400).json({ msg: 'Sudah Check Out !' });
      }
  
      absensi.checkOut = now;
      await absensi.save();
  
      res.json({ msg: 'Checked out Berhasil !' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  };
  

exports.history = async (req, res) => {
    try {
        const data = await Absensi.find({ user: req.user.id }).sort({ tanggal: -1 });

        const result = data.map(item => {
            const checkInFormatted = item.checkIn
                ? new Date(item.checkIn).toTimeString().slice(0, 5)
                : '-';

            const checkOutFormatted = item.checkOut
                ? new Date(item.checkOut).toTimeString().slice(0, 5)
                : '00:00';

            const status = item.checkOut ? 'Hadir' : 'Pending';

            return {
                tanggal: item.tanggal.toISOString().split('T')[0],
                checkIn: checkInFormatted,
                checkOut: checkOutFormatted,
                status: status
            };
        });

        res.json(result);
    } catch (err) {
        console.error('History error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getAllAbsensi = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const { nama, tanggal } = req.query;

    // Filter tanggal (jika ada)
    let dateFilter = {};
    if (tanggal) {
      const start = new Date(tanggal);
      const end = new Date(tanggal);
      end.setDate(end.getDate() + 1);

      dateFilter = {
        tanggal: {
          $gte: start,
          $lt: end
        }
      };
    }

    // Ambil data absensi berdasarkan filter tanggal
    const data = await Absensi.find(dateFilter)
      .populate('user', 'nama email')
      .sort({ tanggal: -1 });

    // Filter berdasarkan nama jika ada
    const filtered = data.filter(item =>
      !nama || item.user.nama.toLowerCase().includes(nama.toLowerCase())
    );

    // Format hasil
    const result = filtered.map(item => ({
      nama: item.user.nama,
      email: item.user.email,
      tanggal: item.tanggal.toISOString().split('T')[0],
      checkIn: item.checkIn ? new Date(item.checkIn).toTimeString().slice(0, 5) : '-',
      checkOut: item.checkOut ? new Date(item.checkOut).toTimeString().slice(0, 5) : '00:00',
      status: item.checkOut ? 'Hadir' : 'Pending'
    }));

    res.json(result);
  } catch (err) {
    console.error('Admin getAllAbsensi error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const ExcelJS = require('exceljs');

exports.exportAbsensiToExcel = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        const data = await Absensi.find().populate('user', 'nama email').sort({ tanggal: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Riwayat Absensi');

        worksheet.columns = [
            { header: 'Nama', key: 'nama', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Tanggal', key: 'tanggal', width: 15 },
            { header: 'Check In', key: 'checkIn', width: 10 },
            { header: 'Check Out', key: 'checkOut', width: 10 },
            { header: 'Status', key: 'status', width: 10 },
        ];

        data.forEach(item => {
            worksheet.addRow({
                nama: item.user.nama,
                email: item.user.email,
                tanggal: item.tanggal.toISOString().split('T')[0],
                checkIn: item.checkIn ? new Date(item.checkIn).toTimeString().slice(0, 5) : '-',
                checkOut: item.checkOut ? new Date(item.checkOut).toTimeString().slice(0, 5) : '00:00',
                status: item.checkOut ? 'Hadir' : 'Pending'
            });
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=riwayat-absensi.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Export Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getStatistikAbsensiUser = async (req, res) => {
    try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Hitung kehadiran dari absensi (yang sudah check-out)
        const hadir = await Absensi.countDocuments({
            user: req.user.id,
            tanggal: { $gte: firstDay, $lte: lastDay },
            checkOut: { $ne: null }
        });

        // Hitung cuti/izin/sakit dari koleksi pengajuan cuti
        const pengajuan = await AjuanCuti.find({
            user: req.user.id,
            status: 'Approved',
            tanggalMulai: { $lte: lastDay },
            tanggalSelesai: { $gte: firstDay }
        });

        // Hitung per kategori (izin, sakit, cuti)
        let izin = 0, sakit = 0, cuti = 0;
        pengajuan.forEach(p => {
            if (p.jenisCuti === 'sakit') sakit++;
            else if (p.jenisCuti === 'izin') izin++;
            else if (p.jenisCuti === 'cuti') cuti++;
        });

        res.json({
            hadir,
            izin,
            sakit,
            cuti
        });
    } catch (err) {
        console.error('Statistik Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getAktivitasHariIni = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const besok = new Date(today);
      besok.setDate(today.getDate() + 1);
  
      const absensi = await Absensi.find({
        tanggal: { $gte: today, $lt: besok },
      }).populate("user", "nama");
  
      const izin = await AjuanCuti.find({
        createdAt: { $gte: today, $lt: besok },
      }).populate("user", "nama");
  
      const logAbsensi = absensi.flatMap((a) => {
        const logs = [];
        if (a.checkIn)
          logs.push({
            nama: a.user.nama,
            aktivitas: "Check-in",
            waktu: a.checkIn,
          });
        if (a.checkOut)
          logs.push({
            nama: a.user.nama,
            aktivitas: "Check-out",
            waktu: a.checkOut,
          });
        return logs;
      });
  
      const logIzin = izin.map((i) => ({
        nama: i.user.nama,
        aktivitas: "Pengajuan Izin",
        waktu: i.createdAt,
      }));
  
      const hasilGabung = [...logAbsensi, ...logIzin].sort(
        (a, b) => new Date(a.waktu) - new Date(b.waktu)
      );
  
      res.json(hasilGabung);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Gagal memuat aktivitas hari ini" });
    }
  };
  