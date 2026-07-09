import express from "express";
import pool from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load products", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to load product", error: err.message });
  }
});

router.post("/", authenticate, requireAdmin, async (req, res) => {
  const { name, cat, desc, price, oldPrice, badge, colors, sizes, image } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO products (name, cat, description, price, old_price, badge, colors, sizes, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, cat, desc, price, oldPrice || null, badge || null, JSON.stringify(colors || []), JSON.stringify(sizes || []), image || null]
    );
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const { name, cat, desc, price, oldPrice, badge, colors, sizes, image } = req.body;
  try {
    await pool.query(
      "UPDATE products SET name = ?, cat = ?, description = ?, price = ?, old_price = ?, badge = ?, colors = ?, sizes = ?, image = ? WHERE id = ?",
      [name, cat, desc, price, oldPrice || null, badge || null, JSON.stringify(colors || []), JSON.stringify(sizes || []), image || null, req.params.id]
    );
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

export default router;
