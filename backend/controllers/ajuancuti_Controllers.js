const Ajuancuti = require('../models/ajuancuti.js');

exports.submitCuti = async (req, res) => {
    try {
        const { tanggalMulai, tanggalSelesai, alasan } = req.body;
        const cuti = new Ajuancuti({
            user: req.user.id, 
            tanggalMulai, 
            tanggalSelesai, 
            alasan, 
            status: 'Pending'
        });
        await cuti.save();
        res.json({ msg: 'Leave application submitted' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.manageCuti = async (req, res) => {
    try {
        const allCuti = await Ajuancuti.find().populate('user', 'username email');
        res.json(allCuti);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.updateStatus = async (req, res) => {
    try {
        // Hanya manajer yang boleh update status
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. admin only.' });
        }

        const { status } = req.body;
        const cuti = await Ajuancuti.findById(req.params.id);

        if (!cuti) return res.status(404).json({ msg: 'Application not found' });

        cuti.status = status;
        await cuti.save();
        res.json({ msg: 'Leave status updated' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};