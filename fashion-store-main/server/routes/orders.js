import express from "express";
import pool from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders", error: err.message });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Order not found" });
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);
    res.json({ ...rows[0], items });
  } catch (err) {
    res.status(500).json({ message: "Failed to load order", error: err.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { userId, items, total, address, payment } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO orders (user_id, total, address, payment) VALUES (?, ?, ?, ?)",
      [userId, total, address, payment]
    );
    const orderId = result.insertId;
    for (const it of items) {
      await pool.query(
        "INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)",
        [orderId, it.productId, it.qty, it.price]
      );
    }
    res.status(201).json({ id: orderId });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

export default router;
