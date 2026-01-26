console.log("App File Loaded");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const app = express();
const userRoutes = require("./routes/user.routes");

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("API is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
module.exports = app;