const mongoose = require('mongoose');

const AbsensiSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tanggal: { type: Date, required: true },
    checkIn: { type: String },
    checkOut: { type: String },
});

module.exports = mongoose.model('Absensi', AbsensiSchema);
