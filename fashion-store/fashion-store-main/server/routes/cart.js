import express from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM carts WHERE user_id = ?", [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load cart", error: err.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { items } = req.body;
  try {
    await pool.query("DELETE FROM carts WHERE user_id = ?", [req.user.id]);
    if (items && items.length) {
      for (const it of items) {
        await pool.query(
          "INSERT INTO carts (user_id, product_id, qty, size, color) VALUES (?, ?, ?, ?, ?)",
          [req.user.id, it.productId, it.qty, it.size, it.color]
        );
      }
    }
    res.json({ message: "Cart saved" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save cart", error: err.message });
  }
});

export default router;
