// backend-app/routes/feedback.js
import express from "express";
import Database from "better-sqlite3";
import { config } from "../config/config.js";

const router = express.Router();

// Connect to agent_training.db
const db = new Database(config.db.agent, { readonly: false });

/**
 * POST /api/feedback
 * Body: { query_id: INT, user_feedback: "like"|"dislike", corrected_sql: STRING (optional), feedback_note: STRING (optional) }
 */
router.post("/", (req, res) => {
  try {
    const { query_id, user_feedback, corrected_sql, feedback_note } = req.body;

    if (!query_id || !["like", "dislike"].includes(user_feedback)) {
      return res.status(400).json({ error: "Invalid feedback payload" });
    }

    const stmt = db.prepare(`
      INSERT INTO Feedback (query_id, user_feedback, corrected_sql, feedback_note)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(query_id, user_feedback, corrected_sql || null, feedback_note || null);

    res.json({ status: "ok", message: "Feedback saved successfully" });
  } catch (err) {
    console.error("Error in /api/feedback:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
