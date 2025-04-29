const mongoose = require('mongoose');

const AbsensiSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tanggal: {
    type: Date,
    default: Date.now,
  },
  checkIn: {
    type: String,
  },
  checkOut: {
    type: String,
  },
});

// Periksa apakah model Absensi sudah ada sebelumnya
const Absensi = mongoose.models.Absensi || mongoose.model('Absensi', AbsensiSchema);

module.exports = Absensi;
