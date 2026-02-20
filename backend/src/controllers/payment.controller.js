console.log("🔥 PAYMENT CONTROLLER LOADED");

const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

// 🔐 Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🧾 Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Order already processed" });
    }

    const options = {
      amount: order.totalAmount * 100, // ₹ → paise
      currency: "INR",
      receipt: `order_${order._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await Payment.create({
      user: order.user,
      order: order._id,
      amount: order.totalAmount,
      method: "RAZORPAY",
      status: "pending",
      gatewayOrderId: razorpayOrder.id,
    });

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("🔥 RAZORPAY ERROR:", error);
    res.status(500).json({
      message: "Failed to create Razorpay order",
    });
  }
};


// ✅ Verify Razorpay Payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // 🔎 Find payment
    const payment = await Payment.findOneAndUpdate(
      { gatewayOrderId: razorpay_order_id },
      {
        status: "success",
        gatewayPaymentId: razorpay_payment_id,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // 🔎 Get order with products
    const order = await Order.findById(payment.order).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Confirm order
    order.status = "confirmed";
    await order.save();

    // ✅ Reduce stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // ✅ Clear cart
    await Cart.findOneAndUpdate(
      { user: order.user },
      { items: [] }
    );

    res.status(200).json({
      message: "Payment verified successfully",
      orderId: order._id,
    });

  } catch (error) {
    console.error("RAZORPAY VERIFY ERROR:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};