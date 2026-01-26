const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} = require("../controllers/cart.controller");

const router = express.Router();

// All cart routes require login
router.post("/add", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.put("/update", authMiddleware, updateCartItem);
router.delete("/remove", authMiddleware, removeFromCart);

module.exports = router;
