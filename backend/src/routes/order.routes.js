const express = require("express");
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

const Order = require("../models/Order");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const router = express.Router();


// 👤 USER: Create order
router.post("/", authMiddleware, placeOrder);


// 👤 USER: Get logged-in user's orders
router.get("/my", authMiddleware, getMyOrders);


// 👤 + 👑 Get single order (secure access)
router.get("/:id", authMiddleware, async (req, res) => {
  if (!req.params.id.match(/^[a-fA-F0-9]{24}$/)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Allow:
    // - Order owner
    // - Admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});


// 👑 ADMIN: Get all orders
router.get("/", authMiddleware, adminMiddleware, getAllOrders);


// 👑 ADMIN: Update order status
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);


module.exports = router;