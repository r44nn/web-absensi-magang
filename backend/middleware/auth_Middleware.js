const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

    const token = authHeader.split(' ')[1]; // Ambil token setelah 'Bearer'

    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Pastikan ada properti 'role'
        if (!verified.role) {
            return res.status(403).json({ msg: 'Role not found in token' });
        }

        req.user = verified; // user.id dan user.role
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
