import express from "express";
import pool from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, role FROM users ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load users", error: err.message });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const { name, email, role } = req.body;
  try {
    await pool.query("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?", [name, email, role, req.params.id]);
    const [rows] = await pool.query("SELECT id, name, email, role FROM users WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

export default router;
