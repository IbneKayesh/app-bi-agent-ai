import pkg from "node-sql-parser";
const { Parser } = pkg;

import fs from "fs";
import path from "path";

// Load schema.json
const schemaPath = path.resolve("./shared/schema.json");
const schemaRaw = fs.readFileSync(schemaPath, "utf-8");
const schema = JSON.parse(schemaRaw);

// Flatten table/column info
const tableColumns = {};
schema.tables.forEach((table) => {
  tableColumns[table.name] = table.columns.map(col => col.name);
});

const parser = new Parser();

/**
 * Validate SQL query
 * - Only SELECT allowed
 * - Columns and tables must exist in schema
 * - Auto-append LIMIT 1000 if not present
 * - Prevent PRAGMA, ATTACH, DROP, INSERT, UPDATE, DELETE
 */
export function validateSQL(sql) {
  // Basic safety checks
  const forbidden = ["PRAGMA", "ATTACH", "DROP", "INSERT", "UPDATE", "DELETE", "ALTER"];
  const upperSql = sql.toUpperCase();
  if (forbidden.some(word => upperSql.includes(word))) {
    throw new Error("Forbidden SQL operation detected");
  }

  // Parse SQL
  let ast;
  try {
    ast = parser.astify(sql);
  } catch (err) {
    throw new Error("SQL parsing error: " + err.message);
  }

  // Ensure only SELECT
  const statements = Array.isArray(ast) ? ast : [ast];
  statements.forEach(stmt => {
    if (stmt.type !== "select") {
      throw new Error("Only SELECT queries are allowed");
    }
  });

  // Verify table and column existence
  statements.forEach(stmt => {
    // From tables
    stmt.from.forEach(tbl => {
      const tableName = tbl.table;
      if (!tableColumns[tableName]) {
        throw new Error(`Table "${tableName}" does not exist in schema`);
      }

      // Select columns
      stmt.columns.forEach(col => {
        if (col.expr && col.expr.column) {
          const colName = col.expr.column;
          if (!tableColumns[tableName].includes(colName) && colName !== "*") {
            throw new Error(`Column "${colName}" does not exist in table "${tableName}"`);
          }
        }
      });
    });
  });

  // Auto-append LIMIT 1000 if missing
  statements.forEach(stmt => {
    if (!stmt.limit) {
      stmt.limit = [{ type: "number", value: 1000 }];
    }
  });

  // Convert AST back to SQL string
  const validatedSQL = parser.sqlify(statements);
  return validatedSQL;
}
