const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth_Middleware');
const { exportAbsensiCutiToExcel } = require('../controllers/export_Controllers');

router.get('/absensi-cuti/excel', auth, exportAbsensiCutiToExcel);

module.exports = router;
