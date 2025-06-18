const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AbsensiSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tanggal: {
    type: Date,
    required: true,
  },
  checkIn: {
    type: Date,
    default: null,
  },
  checkOut: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["Pending", "Hadir", "Cuti"], // ✅ tambahkan 'Pending'
    default: "Pending", // ✅ ubah default dari 'Hadir' ke 'Pending'
  },
});

module.exports = mongoose.model("Absensi", AbsensiSchema);
