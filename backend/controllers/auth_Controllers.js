const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { nama, email, password, role } = req.body;  // Menambahkan role di request body
    try {
        // Cek apakah email sudah ada
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // Validasi role jika diberikan, hanya boleh 'admin' atau 'user'
        if (role && !['admin', 'user'].includes(role)) {
            return res.status(400).json({ msg: 'Role must be either "admin" or "user"' });
        }

        // Menetapkan role default menjadi 'user' jika tidak ada role yang diberikan
        user = new User({ nama, email, password, role: role || 'user' });

        // Hash password sebelum disimpan ke database
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Simpan pengguna ke database
        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // ✅ Ubah payload agar langsung menyimpan id dan role
        const payload = { id: user.id, role: user.role };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: user.role }); // Kirim juga role agar client tahu
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};
