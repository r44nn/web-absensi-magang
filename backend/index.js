require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// ROUTES
app.use("/api/auth", require("./routes/auth_Routes"));
app.use("/api/users", require("./routes/user_Routes"));
app.use("/api/absensi", require("./routes/absensi_Routes"));
app.use("/api/ajuancuti", require("./routes/ajuancuti_Routes"));
app.use("/api/export", require("./routes/export_Routes"));
app.use("/api/dashboard", require("./routes/dashboard_Routes"));


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
