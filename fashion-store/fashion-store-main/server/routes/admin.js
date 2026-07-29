import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import pool from "../db.js";

const router = express.Router();

router.get("/stats", authenticate, requireAdmin, async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) as totalUsers FROM users");
    const [[{ totalProducts }]] = await pool.query("SELECT COUNT(*) as totalProducts FROM products");
    const [[{ totalOrders }]] = await pool.query("SELECT COUNT(*) as totalOrders FROM orders");
    res.json({ totalUsers, totalProducts, totalOrders });
  } catch (err) {
    res.status(500).json({ message: "Failed to load stats", error: err.message });
  }
});

export default router;
