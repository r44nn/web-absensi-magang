const Ajuancuti = require('../models/ajuancuti.js');
const Absensi = require('../models/absensi'); // Import model Absensi

exports.submitCuti = async (req, res) => {
    try {
        const { tanggalMulai, tanggalSelesai, alasan, jenisCuti } = req.body;

        if (!['sakit', 'izin', 'cuti'].includes(jenisCuti)) {
            return res.status(400).json({ msg: 'Jenis cuti harus salah satu dari: sakit, izin, cuti' });
        }

        const cuti = new Ajuancuti({
            user: req.user.id,
            tanggalMulai,
            tanggalSelesai,
            alasan,
            jenisCuti,
            status: 'Pending'
        });

        await cuti.save();
        res.json({ msg: 'Pengajuan cuti telah dikirim !' });
    } catch (err) {
        console.error('Submit cuti error:', err);
        res.status(500).send('Server error');
    }
};

exports.manageCuti = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const allCuti = await Ajuancuti.find()
      .populate('user', 'nama email') // ✅ perbaikan di sini
      .sort({ createdAt: -1 });       // opsional: urutkan terbaru dulu

    res.json(allCuti);
  } catch (err) {
    console.error('Manage cuti error:', err);
    res.status(500).send('Server error');
  }
};


exports.updateStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. admin only.' });
        }

        const { status } = req.body;
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status. Use "Approved" or "Rejected".' });
        }

        const cuti = await Ajuancuti.findById(req.params.id);
        if (!cuti) return res.status(404).json({ msg: 'Application not found' });

        cuti.status = status;
        if (status === 'Approved') {
            cuti.approvedAt = new Date();
        } else if (status === 'Rejected') {
            cuti.rejectedAt = new Date();
        }

        await cuti.save();
        res.json({ msg: `Leave status updated to ${status}` });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getCutiHistoryUser = async (req, res) => {
    try {
        const history = await Ajuancuti.find({ user: req.user.id }).sort({ tanggalMulai: -1 });
        res.json(history);
    } catch (err) {
        console.error('Get cuti history error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

const ExcelJS = require('exceljs');

exports.exportCutiExcel = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        const data = await Ajuancuti.find().populate('user', 'username email').sort({ tanggalMulai: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Riwayat Cuti');

        worksheet.columns = [
            { header: 'Nama', key: 'nama', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Jenis Cuti', key: 'jenisCuti', width: 15 },
            { header: 'Alasan', key: 'alasan', width: 30 },
            { header: 'Tanggal Mulai', key: 'tanggalMulai', width: 15 },
            { header: 'Tanggal Selesai', key: 'tanggalSelesai', width: 15 },
            { header: 'Status', key: 'status', width: 12 }
        ];

        data.forEach(item => {
            worksheet.addRow({
                nama: item.user.username,
                email: item.user.email,
                jenisCuti: item.jenisCuti,
                alasan: item.alasan,
                tanggalMulai: item.tanggalMulai.toISOString().split('T')[0],
                tanggalSelesai: item.tanggalSelesai.toISOString().split('T')[0],
                status: item.status
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=riwayat-cuti.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Export cuti error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
