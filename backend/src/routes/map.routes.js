const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/map/route?start=lng,lat&end=lng,lat
// Proxies ORS from the server — browser never calls ORS directly so no CORS issues.
// Requires ORS_KEY in your backend .env file.
router.get("/route", authMiddleware, async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ message: "start and end query params are required" });
  }

  const ORS_KEY = process.env.VITE_ORS_KEY;
  if (!ORS_KEY) {
    return res.status(500).json({ message: "ORS_KEY not set in server environment" });
  }

  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_KEY}&start=${start}&end=${end}`;
    console.log("[ORS Proxy] Requesting:", url.replace(ORS_KEY, "***"));

    const orsRes = await fetch(url); // requires Node 18+
    const data   = await orsRes.json();

    if (data.error) {
      console.error("[ORS Proxy] ORS returned error:", data.error);
      return res.status(400).json({ message: data.error.message || "ORS routing error" });
    }

    res.json(data);
  } catch (err) {
    console.error("[ORS Proxy] Fetch failed:", err);
    res.status(500).json({ message: "Routing service unavailable" });
  }
});

module.exports = router;