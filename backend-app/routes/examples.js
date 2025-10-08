// backend-app/routes/examples.js
import express from "express";
import Database from "better-sqlite3";
import { config } from "../config/config.js";

const router = express.Router();

// Connect to agent_training.db
const db = new Database(config.db.agent, { readonly: true });

/**
 * GET /api/examples
 * Optional query param: ?limit=10
 * Returns last saved examples from Query_Log
 */
router.get("/", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const stmt = db.prepare(`
      SELECT id, user_query, generated_sql, response_summary, suggestion, created_at
      FROM Query_Log
      ORDER BY created_at DESC
      LIMIT ?
    `);
    const examples = stmt.all(limit);
    res.json({ examples });
  } catch (err) {
    console.error("Error in /api/examples:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
