    const bcrypt = require('bcryptjs');
    const User = require('../models/user');
    const Absensi = require('../models/absensi');
    const Ajuancuti = require('../models/ajuancuti');

    exports.getAllUsers = async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ msg: 'Access denied. Admin only.' });
            }

            const users = await User.find().select('-password'); // Jangan tampilkan password
            res.json(users);
        } catch (err) {
            res.status(500).json({ msg: 'Server error' });
        }
    };

    exports.getAllPegawai = async (req, res) => {
        try {
          if (req.user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied. Admin only." });
          }
      
          const pegawai = await User.find({ role: "user" }).select("-password");
          res.json(pegawai);
        } catch (err) {
          res.status(500).json({ msg: "Server error" });
        }
      };
      
      

   exports.deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        const userId = req.params.id;

        // Hapus user
        const user = await User.findByIdAndDelete(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Hapus riwayat absensi dan cuti
        await Absensi.deleteMany({ user: userId });
        await Ajuancuti.deleteMany({ user: userId });

        res.json({ msg: 'User and related data deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

    exports.changePassword = async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;

            // Validasi input
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ msg: 'Old and new password are required' });
            }

            // Ambil user dari token login
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ msg: 'User not found' });

            // Cek password lama
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) return res.status(400).json({ msg: 'Old password is incorrect' });

            // Ganti password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            res.json({ msg: 'Password updated successfully' });
        } catch (err) {
            console.error('Change password error:', err);
            res.status(500).json({ msg: 'Server error' });
        }
    };