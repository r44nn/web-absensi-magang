const express = require('express');
const router = express.Router();
const { exportData } = require('../controllers/export_Controllers');
const auth = require('../middleware/auth_Middleware');

router.get('/data', auth, exportData);

module.exports = router;
