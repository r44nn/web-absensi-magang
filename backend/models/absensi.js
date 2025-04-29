const mongoose = require('mongoose');

const AbsensiSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkIn: { type: Date },
    checkOut: { type: Date }
});

module.exports = mongoose.model('Absensi', AbsensiSchema);
