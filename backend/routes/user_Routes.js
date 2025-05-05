const express = require('express');
const router = express.Router();
const { changePassword } = require('../controllers/user_Controllers');
const auth = require('../middleware/auth_Middleware');
const { getAllUsers, deleteUser } = require('../controllers/user_Controllers');

router.get('/all', auth, getAllUsers);
router.delete('/:id', auth, deleteUser);
router.put('/change-password', auth, changePassword);

module.exports = router;
