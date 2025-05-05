const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth_Middleware');
const { checkIn, checkOut, history, getAllAbsensi } = require('../controllers/absensi_Controllers');
const { exportAbsensiToExcel } = require('../controllers/absensi_Controllers');
const { getStatistikAbsensiUser } = require('../controllers/absensi_Controllers');

router.post('/checkin', auth, checkIn);
router.post('/checkout', auth, checkOut);
router.get('/history', auth, history);
router.get('/admin', auth, getAllAbsensi);
router.get('/export/excel', auth, exportAbsensiToExcel);
router.get('/statistik', auth, getStatistikAbsensiUser);

module.exports = router;




