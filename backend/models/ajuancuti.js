const mongoose = require('mongoose');

const AjuancutiSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tanggalMulai: { type: Date },
    tanggalSelesai: { type: Date },
    alasan: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
});

module.exports = mongoose.model('Ajuancuti', AjuancutiSchema);
