console.log("App File Loaded");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const app = express();
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");




app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("API is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
module.exports = app;