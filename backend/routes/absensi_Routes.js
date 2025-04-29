const express = require('express');
const router = express.Router();
const { checkIn, checkOut, history } = require('../controllers/absensi_Controllers.js');
const auth = require('../middleware/auth_Middleware.js');

router.post('/checkin', auth, checkIn);
router.post('/checkout', auth, checkOut);
router.get('/history', auth, history);

module.exports = router;
