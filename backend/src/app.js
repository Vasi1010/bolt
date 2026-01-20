console.log("App File Loaded");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("API is running");
});
app.use("/api/auth", authRoutes);
module.exports = app;