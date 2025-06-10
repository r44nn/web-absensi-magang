const express = require("express");
const router = express.Router();
const { login, register, getUserProfile } = require("../controllers/auth_Controllers");
const authMiddleware = require("../middleware/auth_Middleware"); // ✅ Tambahkan baris ini

// Routes
router.post("/login", login);
router.post("/register", register);
router.get("/me", authMiddleware, getUserProfile); // ✅ Gunakan middleware yang sudah diimport

module.exports = router;
