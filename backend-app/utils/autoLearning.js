import Fuse from "fuse.js";
import { getFeedback } from "./feedbackModule.js";

// Initialize Fuse index for example queries
let exampleQueries = [];

/**
 * Load high-rated examples from feedback
 * Only include 'like' feedback without corrected SQL
 */
export function loadExamples(limit = 100) {
  const feedback = getFeedback(limit);
  exampleQueries = feedback
    .filter(f => f.sentiment === "like" && !f.corrected_sql)
    .map(f => ({
      user_query: f.query_text,
      generated_sql: f.generated_sql
    }));

  return exampleQueries;
}

/**
 * Fuse.js search for similar past examples
 */
const fuse = () => new Fuse(exampleQueries, {
  keys: ["user_query"],
  threshold: 0.4
});

/**
 * Retrieve similar example queries for adaptation
 * @param {string} userQuery
 * @param {number} limit
 */
export function retrieveSimilarExamples(userQuery, limit = 3) {
  if (!exampleQueries.length) loadExamples();
  const f = fuse();
  return f.search(userQuery).slice(0, limit).map(r => r.item);
}

/**
 * Promote corrected SQL to examples (optional admin review)
 */
export function addCorrectedExample(query_text, corrected_sql) {
  exampleQueries.push({ user_query: query_text, generated_sql: corrected_sql });
}
