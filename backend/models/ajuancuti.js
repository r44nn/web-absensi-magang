const mongoose = require("mongoose");

const AjuanCutiSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tanggalMulai: Date,
  tanggalSelesai: Date,
  alasan: String,
  jenisCuti: String,
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }
}, { timestamps: true }); // ✅ Tambahkan ini di model

module.exports = mongoose.model('Ajuancuti', AjuanCutiSchema);
