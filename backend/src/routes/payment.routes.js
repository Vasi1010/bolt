const express = require("express");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/payment.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();



router.post("/razorpay", authMiddleware, createRazorpayOrder);

router.post("/verify", authMiddleware, verifyRazorpayPayment);

module.exports = router;
console.log("✅ PAYMENT ROUTES REGISTERED");

