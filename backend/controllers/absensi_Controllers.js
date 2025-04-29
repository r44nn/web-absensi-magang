const Absensi = require('../models/absensi.js');

exports.checkIn = async (req, res) => {
  try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set waktu ke 00:00:00:000

      const existingAbsensi = await Absensi.findOne({
          user: req.user.id,
          checkIn: { $gte: today }, // Cari yang checkIn mulai dari hari ini
          checkOut: null
      });

      if (existingAbsensi) {
          return res.status(400).json({ msg: 'You have already checked in today and not checked out yet.' });
      }

      const absensi = new Absensi({ user: req.user.id, checkIn: new Date() });
      await absensi.save();
      res.json({ msg: 'Checked in successfully' });
  } catch (err) {
      res.status(500).send('Server error');
  }
};


exports.checkOut = async (req, res) => {
  try {
      const now = new Date();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0); // 00:00 hari ini

      const absensi = await Absensi.findOne({
          user: req.user.id,
          checkIn: { $gte: startOfToday }, // checkIn harus hari ini
          checkOut: null
      });

      if (!absensi) {
          return res.status(400).json({ msg: 'No active check-in found for today' });
      }

      // Pastikan user tidak check-out lewat hari
      const checkInDate = new Date(absensi.checkIn);
      if (checkInDate.toDateString() !== now.toDateString()) {
          return res.status(400).json({ msg: 'Check-out must be done on the same day as check-in' });
      }

      absensi.checkOut = now;
      await absensi.save();

      res.json({ msg: 'Checked out successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
};


exports.history = async (req, res) => {
    try {
        const history = await Absensi.find({ user: req.user.id });
        res.json(history);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
