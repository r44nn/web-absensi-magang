const User = require("../models/user");
const AjuanCuti = require("../models/ajuancuti");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingCuti = await AjuanCuti.countDocuments({ status: "Pending" });

    res.json({
      totalUsers,
      pendingCuti,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
