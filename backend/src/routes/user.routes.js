const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const router = express.Router();

// Normal protected route
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "User profile fetched successfully",
    user: req.user,
  });
});

// 🔑 ADMIN TEST ROUTE (THIS MUST EXIST)
router.get("/admin-test", authMiddleware, adminMiddleware, (req, res) => {
  res.status(200).json({
    message: "Welcome Admin 👑",
  });
});

module.exports = router;
