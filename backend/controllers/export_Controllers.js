const Absensi = require('../models/absensi.js');
const Ajuancuti = require('../models/ajuancuti.js');

exports.exportData = async (req, res) => {
    try {
        const absensi = await Absensi.find().populate('user', 'nama email');
        const cuti = await Ajuancuti.find().populate('user', 'nama email');
        res.json({ absensi, cuti });
    } catch (err) {
        res.status(500).send('Server error');
    }
};
