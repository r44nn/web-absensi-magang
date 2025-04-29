const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/user_Controllers.js');
const auth = require('../middleware/auth_Middleware.js');

router.get('/', auth, getAllUsers);
router.delete('/:id', auth, deleteUser);

module.exports = router;
