const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboard_Controllers");
const auth = require("../middleware/auth_Middleware");

router.get("/admin", auth, getDashboardStats);

module.exports = router;
