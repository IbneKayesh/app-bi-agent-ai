import express from "express";
import { isQueryRelevant } from "../utils/domainClassifier.js";
import { generateSQL } from "../utils/sqlTemplateEngine.js";
import { validateSQL } from "../utils/sqlValidator.js";
import { executeSQL } from "../utils/dbExecutor.js"; // ONLY dbExecutor
import { extractEntities, detectIntent } from "../utils/nluEngine.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { query, intent } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query cannot be empty" });
    }

    // Domain check
    if (!isQueryRelevant(query)) {
      console.log("Irrelevant query:", query);

      return res.json({
        SQL_Query: null,
        Response_Summary: null,
        Suggestion: "Sorry, I don't understand your query.",
      });
    }

    // 1️⃣ Extract entities
    const entities = extractEntities(query);

    const resolvedIntent = intent ? intent : detectIntent(entities, query);

    if (!resolvedIntent) {
      return res.json({
        SQL_Query: null,
        Response_Summary: null,
        Suggestion: "Sorry, I couldn't detect what you want to ask.",
      });
    }

    
    //console.log("resolvedIntent " + resolvedIntent);

    // 2️⃣ Generate SQL + params
    const { sql, params } = generateSQL(resolvedIntent, entities);

    // 3️⃣ Validate SQL
    const safeSQL = validateSQL(sql);

    
    console.log("safeSQL" + safeSQL);

    // 4️⃣ Execute SQL
    const rows = executeSQL(safeSQL, params);

    console.log("resolvedIntent " + resolvedIntent);

    // 5️⃣ Summarize
    const response = summarizeResult(safeSQL, rows, resolvedIntent);

    res.json(response);
  } catch (err) {
    console.error("Error in /api/ask:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/ask
 * Request body: { query: "user natural language query" }
 * Response: { SQL_Query, Response_Summary, Suggestion }
 */
router.post("/v1", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query cannot be empty" });
    }

    // TODO: Integrate Domain Classifier + NLU + SQL Generator
    // For now, we return a placeholder response
    const placeholderResponse = {
      SQL_Query: "-- SQL query will be generated here",
      Response_Summary: "Result summary will appear here",
      Suggestion: "Suggestions will appear here",
    };

    res.json(placeholderResponse);
  } catch (err) {
    console.error("Error in /api/ask:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
