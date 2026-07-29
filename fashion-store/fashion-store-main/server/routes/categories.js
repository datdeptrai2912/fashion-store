import express from "express";
import pool from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load categories", error: err.message });
  }
});

router.post("/", authenticate, requireAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query("INSERT INTO categories (name) VALUES (?)", [name]);
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to create category", error: err.message });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query("UPDATE categories SET name = ? WHERE id = ?", [name, req.params.id]);
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update category", error: err.message });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category", error: err.message });
  }
});

export default router;
