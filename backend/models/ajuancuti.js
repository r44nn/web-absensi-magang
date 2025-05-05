const mongoose = require('mongoose');

const AjuanCutiSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tanggalMulai: { type: Date, required: true },
    tanggalSelesai: { type: Date, required: true },
    alasan: { type: String },
    jenisCuti: { type: String, enum: ['sakit', 'izin', 'cuti'], required: true },
    status: { type: String, default: 'Pending' },
    approvedAt: { type: Date },
    rejectedAt: { type: Date }
});

module.exports = mongoose.model('Ajuancuti', AjuanCutiSchema);
