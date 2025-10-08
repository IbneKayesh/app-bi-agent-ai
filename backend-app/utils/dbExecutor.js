import Database from "better-sqlite3";
import { config } from "../config/config.js";

// Connect to shop.db
const db = new Database(config.db.shop, { readonly: true });

/**
 * Execute validated SQL safely
 */
export function executeSQL(sql, params = {}) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(params); // parameter binding
  } catch (err) {
    console.error("Database execution error:", err.message);
    throw new Error("Failed to execute SQL query");
  }
}
