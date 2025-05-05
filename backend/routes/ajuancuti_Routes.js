const express = require('express');
const router = express.Router();
const { submitCuti, manageCuti, updateStatus } = require('../controllers/ajuancuti_Controllers.js');
const auth = require('../middleware/auth_Middleware.js');
const { getCutiHistoryUser } = require('../controllers/ajuancuti_Controllers');
const { exportCutiExcel } = require('../controllers/ajuancuti_Controllers');

router.post('/submit', auth, submitCuti);
router.get('/manage', auth, manageCuti);
router.put('/update/:id', auth, updateStatus);
router.get('/history', auth, getCutiHistoryUser);
router.get('/export/excel', auth, exportCutiExcel);

module.exports = router;

