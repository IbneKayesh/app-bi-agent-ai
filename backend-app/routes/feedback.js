import express from "express";
import { recordFeedback, getFeedback } from "../utils/feedbackModule.js";

const router = express.Router();

// POST feedback
router.post("/", (req, res) => {
  try {
    const { query_text, generated_sql, sentiment, corrected_sql } = req.body;

    if (!query_text || !generated_sql || !sentiment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    recordFeedback({ query_text, generated_sql, sentiment, corrected_sql });

    res.json({ success: true, message: "Feedback recorded" });
  } catch (err) {
    console.error("Error recording feedback:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET feedback (for admin / retraining)
router.get("/", (req, res) => {
  try {
    const feedback = getFeedback(100);
    res.json(feedback);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
