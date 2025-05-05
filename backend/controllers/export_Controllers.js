const ExcelJS = require('exceljs');
const Absensi = require('../models/absensi');
const Ajuancuti = require('../models/ajuancuti');

exports.exportAbsensiCutiToExcel = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        const { bulan, tahun } = req.query;

        if (!bulan || !tahun) {
            return res.status(400).json({ msg: 'Bulan dan tahun wajib diisi' });
        }

        const start = new Date(tahun, bulan - 1, 1);
        const end = new Date(tahun, bulan, 0, 23, 59, 59);

        const absensi = await Absensi.find({
            tanggal: { $gte: start, $lte: end }
        }).populate('user', 'nama email');

        const cuti = await Ajuancuti.find({
            tanggalMulai: { $lte: end },
            tanggalSelesai: { $gte: start }
        }).populate('user', 'nama email');

        const workbook = new ExcelJS.Workbook();

        // Sheet 1: Absensi
        const sheetAbsensi = workbook.addWorksheet('Absensi');
        sheetAbsensi.columns = [
            { header: 'Nama', key: 'nama', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Tanggal', key: 'tanggal', width: 15 },
            { header: 'Check In', key: 'checkIn', width: 10 },
            { header: 'Check Out', key: 'checkOut', width: 10 },
            { header: 'Status', key: 'status', width: 10 }
        ];

        absensi.forEach(item => {
            sheetAbsensi.addRow({
                nama: item.user.nama,
                email: item.user.email,
                tanggal: item.tanggal.toISOString().split('T')[0],
                checkIn: item.checkIn ? new Date(item.checkIn).toTimeString().slice(0, 5) : '-',
                checkOut: item.checkOut ? new Date(item.checkOut).toTimeString().slice(0, 5) : '-',
                status: item.checkOut ? 'Hadir' : 'Pending'
            });
        });

        // Sheet 2: Cuti
        const sheetCuti = workbook.addWorksheet('Cuti');
        sheetCuti.columns = [
            { header: 'Nama', key: 'nama', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Jenis Cuti', key: 'jenis', width: 15 },
            { header: 'Alasan', key: 'alasan', width: 30 },
            { header: 'Tanggal Mulai', key: 'mulai', width: 15 },
            { header: 'Tanggal Selesai', key: 'selesai', width: 15 },
            { header: 'Status', key: 'status', width: 10 }
        ];

        cuti.forEach(item => {
            sheetCuti.addRow({
                nama: item.user.nama,
                email: item.user.email,
                jenis: item.jenisCuti,
                alasan: item.alasan,
                mulai: item.tanggalMulai.toISOString().split('T')[0],
                selesai: item.tanggalSelesai.toISOString().split('T')[0],
                status: item.status
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=laporan-absensi-cuti-${bulan}-${tahun}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error('Export Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
