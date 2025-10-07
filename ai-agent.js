// ai-agent.js
const { NlpManager } = require("node-nlp");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const validateSchema = require("./schema-validator");

const dbPath = path.join(__dirname, "reports.db");

let chrono = null;
try {
  chrono = require("chrono-node");
} catch (err) {
  console.warn("chrono-node not installed; natural date parsing disabled.");
}

class AIAgent {
  constructor(schemaPath = path.join(__dirname, "database-schema.json")) {
    this.schemaPath = schemaPath;
    this.schema = validateSchema(schemaPath);

    // Build quick-access keyword map: keyword => table name
    this.keywordToTable = {};
    for (const [key, table] of Object.entries(this.schema.tables)) {
      const lower = key.toLowerCase();
      this.keywordToTable[lower] = table.name;

      // add synonyms from hints (column synonyms)
      if (table.hints?.synonyms) {
        for (const [col, synonyms] of Object.entries(table.hints.synonyms)) {
          synonyms.forEach((syn) => {
            this.keywordToTable[syn.toLowerCase()] = table.name;
          });
        }
      }

      // add table-level synonyms for better matching
      const tableName = table.name.toLowerCase();
      if (tableName.includes("customer"))
        this.keywordToTable["customer"] = table.name;
      if (tableName.includes("supplier"))
        this.keywordToTable["supplier"] = table.name;
      if (tableName.includes("inventory"))
        this.keywordToTable["inventory"] = table.name;
      if (tableName.includes("sales"))
        this.keywordToTable["sales"] = table.name;
      if (tableName.includes("purchase"))
        this.keywordToTable["purchase"] = table.name;
      if (tableName.includes("item")) this.keywordToTable["item"] = table.name;
    }

    this.manager = new NlpManager({ languages: ["en"] });
    this._ready = false;
    this._lastParams = [];
  }

  async init() {
    await this.trainModel();
    this._ready = true;
  }

  isReady() {
    console.log("Agent ready status:", this._ready);
    return this._ready;
  }

  async trainModel() {
    // Add basic regex entities for date detection
    this.manager.addRegexEntity("date", "en", /\d{4}-\d{2}-\d{2}/g);
    await this.manager.train();
    console.log("NLP model initialized for entity extraction.");
  }

  getColumn(table, type) {
    const lower = table.toLowerCase();
    return this.schema.tables[lower]?.types?.[type] || null;
  }

  async processQuery(query) {
    const response = await this.manager.process("en", query);
    const entities = response.entities || [];
    const entityMap = {};

    for (const e of entities) {
      if (!entityMap[e.entity]) entityMap[e.entity] = [];
      entityMap[e.entity].push(e.sourceText);
    }

    if (chrono) {
      const parsed = chrono.parse(query);
      if (parsed?.length) {
        entityMap.date = parsed.map((p) =>
          p.start.date().toISOString().slice(0, 10)
        );
      }
    }

    const sql = this.generateSQL(query, entityMap);
    const params = this._lastParams || [];
    console.log("Generated SQL:", sql, "Params:", params);

    const db = new sqlite3.Database(dbPath);
    const rows = await this.runQuery(db, sql, params);
    db.close();

    this._lastParams = [];
    const summary = this.interpretResults(sql, rows);
    return { sql, params, rows, summary };
  }

  runQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  generateSQL(query, entityMap = {}) {
    const lower = query.toLowerCase();

    // Default to first table if no match found
    let table = Object.values(this.schema.tables)[0].name;

    // Detect table from keyword map with word boundary matching
    for (const [key, t] of Object.entries(this.keywordToTable)) {
      const regex = new RegExp(`\\b${key}\\b`, "i");
      if (regex.test(lower)) {
        table = t;
        break;
      }
    }

    // Detect action type
    const actionMap = {
      count: ["count", "how many", "number of"],
      sum: ["total", "sum"],
      avg: ["average", "avg", "mean"],
      list: ["list", "show", "display"],
    };

    let action = "default";
    for (const [act, words] of Object.entries(actionMap)) {
      if (words.some((w) => lower.includes(w))) {
        action = act;
        break;
      }
    }

    // Detect group-by clause
    let groupBy = null;
    const colTypes = this.schema.tables[table.toLowerCase()]?.types || {};
    for (const [type, col] of Object.entries(colTypes)) {
      if (lower.includes(`by ${type}`)) {
        groupBy = col;
        break;
      }
    }

    // Date filtering
    const whereClauses = [];
    const params = [];
    const dateCol = this.getColumn(table, "date");

    if (entityMap.date?.length && dateCol) {
      const d0 = entityMap.date[0];
      whereClauses.push(`"${dateCol}" = ?`);
      params.push(d0);
    }

    let sql = "";
    const colAmount = this.getColumn(table, "amount");

    console.log("Detected action:", action); // Debug log
    console.log("Detected table:", table); // Debug log
    console.log("Available amount column:", colAmount); // Debug log

    if (action === "count") {
      sql = `SELECT COUNT(*) AS Total_Count FROM "${table}"`;
    } else if (action === "sum" && colAmount) {
      sql = `SELECT SUM("${colAmount}") AS Total_Sum FROM "${table}"`;
    } else if (action === "avg" && colAmount) {
      sql = `SELECT AVG("${colAmount}") AS Avg_Value FROM "${table}"`;
    } else if (action === "list") {
      // List first 5 columns or all if less than 5
      const cols = this.schema.tables[table.toLowerCase()].columns
        .slice(0, 5)
        .join(", ");
      sql = `SELECT ${cols} FROM "${table}"`;
    } else {
      sql = `SELECT * FROM "${table}" LIMIT 10`;
    }

    if (whereClauses.length) sql += " WHERE " + whereClauses.join(" AND ");
    if (groupBy) sql += ` GROUP BY "${groupBy}"`;

    this._lastParams = params;
    return sql;
  }

  interpretResults1(sql, rows) {
    if (!rows || rows.length === 0) return "No results found.";
    const first = rows[0];
    const cols = Object.keys(first);
    if (cols.length === 1) {
      const key = cols[0];
      return `${key.replace(/_/g, " ")}: ${first[key]}`;
    }
    return `Found ${rows.length} results.\nExample: ${JSON.stringify(
      first,
      null,
      2
    )}`;
  }

  interpretResults(sql, rows) {
    if (!rows || rows.length === 0)
      return { summary: "No results found.", jsonFormat: [] };

    const first = rows[0];
    const cols = Object.keys(first);

    if (cols.length === 1) {
      const key = cols[0];
      return {
        summary: `${key.replace(/_/g, " ")}: ${first[key]}`,
        jsonFormat: rows,
      };
    }

    return {
      summary: `Found ${rows.length} results.`,
      jsonFormat: rows,
    };
  }
}

module.exports = AIAgent;
