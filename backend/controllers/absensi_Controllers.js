const Absensi = require('../models/absensi.js');
const AjuanCuti = require('../models/ajuancuti');


exports.checkIn = async (req, res) => {
    try {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set jadi awal hari

        const existingAbsensi = await Absensi.findOne({
            user: req.user.id,
            tanggal: today,
            checkOut: null
        });

        if (existingAbsensi) {
            return res.status(400).json({ msg: 'You have already checked in today and not checked out yet.' });
        }

        const absensi = new Absensi({
            user: req.user.id,
            tanggal: today, // simpan tanggal eksplisit
            checkIn: now
        });

        await absensi.save();
        res.json({ msg: 'Checked in successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.checkOut = async (req, res) => {
    try {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const absensi = await Absensi.findOne({
            user: req.user.id,
            tanggal: today,
            checkOut: null
        });

        if (!absensi) {
            return res.status(400).json({ msg: 'No active check-in found for today' });
        }

        absensi.checkOut = now;
        await absensi.save();

        res.json({ msg: 'Checked out successfully' });
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

        const { nama } = req.query; // tangkap keyword dari URL ?nama=...

        // Siapkan query dasar
        let query = {};

        if (nama) {
            // Cari berdasarkan nama user (case insensitive)
            query = {
                ...query,
                // gunakan regex untuk pencarian parsial
                $or: [
                    { 'user.nama': { $regex: nama, $options: 'i' } }
                ]
            };
        }

        // Join ke data user
        const data = await Absensi.find()
            .populate('user', 'nama email')
            .sort({ tanggal: -1 });

        // Filter di level JS (karena Mongoose tidak bisa query field populated langsung pakai regex)
        const filtered = data.filter(item =>
            !nama || item.user.nama.toLowerCase().includes(nama.toLowerCase())
        );

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
