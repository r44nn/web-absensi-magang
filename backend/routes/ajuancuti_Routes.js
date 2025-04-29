const express = require('express');
const router = express.Router();
const { submitCuti, manageCuti, updateStatus } = require('../controllers/ajuancuti_Controllers.js');
const auth = require('../middleware/auth_Middleware.js');

router.post('/submit', auth, submitCuti);
router.get('/manage', auth, manageCuti);
router.put('/update/:id', auth, updateStatus);

module.exports = router;

