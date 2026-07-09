import express from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM wishlists WHERE user_id = ?", [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load wishlist", error: err.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { productId } = req.body;
  try {
    await pool.query("INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)", [req.user.id, productId]);
    res.json({ message: "Added" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add", error: err.message });
  }
});

router.delete("/:productId", authenticate, async (req, res) => {
  try {
    await pool.query("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?", [req.user.id, req.params.productId]);
    res.json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove", error: err.message });
  }
});

export default router;
