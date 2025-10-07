const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const AIAgent = require("./ai-agent");

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3002;
const HOST = process.env.HOST || "0.0.0.0";

// allow larger payloads if user uploads schema dynamically
app.use(bodyParser.json({ limit: "5mb" }));

// Serve static files from 'public' folder (including index.html)
app.use(express.static(path.join(__dirname, "public")));

// 🔧 choose which schema to load dynamically
const schemaPath = process.env.SCHEMA_PATH
  ? path.resolve(process.env.SCHEMA_PATH)
  : path.join(__dirname, "database-schema.json");

console.log(`🔍 Using schema from: ${schemaPath}`);

let agent = new AIAgent(schemaPath);

async function start() {
  try {
    await agent.init();

    // Root route serves index.html automatically via express.static

    app.get("/schema-name", (req, res) => {
      res.json({
        name: agent.schema.name || "Unknown_DB",
        description: agent.schema.description || "",
      });
    });

    app.post("/chat", async (req, res) => {
      try {
        const query =
          req.body && req.body.query ? String(req.body.query).trim() : "";
        if (!query) {
          return res
            .status(400)
            .json({ error: "Missing query in request body" });
        }

        console.log(`🧠 Incoming query: ${query}`);
        const response = await agent.processQuery(query);

        return res.json({
          success: true,
          sql: response.sql,
          params: response.params,
          summary: response.summary.summary, // extract summary string
          jsonFormat: response.summary.jsonFormat, // add jsonFormat with the rows
          rows: response.rows, // optional, keep if you want raw rows too
        });
      } catch (err) {
        console.error("❌ Error processing query:", err);
        return res
          .status(500)
          .json({ error: "Internal server error", details: err.message });
      }
    });

    // Endpoint to reload a different schema dynamically
    app.post("/load-schema", async (req, res) => {
      try {
        const { schemaPath: newPath } = req.body;
        if (!newPath)
          return res.status(400).json({ error: "Missing schemaPath" });

        const resolvedPath = path.resolve(newPath);
        if (!fs.existsSync(resolvedPath)) {
          return res
            .status(400)
            .json({ error: "Schema file not found at provided path" });
        }

        console.log(`Reloading schema from: ${resolvedPath}`);
        const newAgent = new AIAgent(resolvedPath);
        await newAgent.init();

        agent = newAgent; // Replace the entire agent instance

        console.log("✅ Schema reloaded successfully.");
        return res.json({
          success: true,
          message: "Schema reloaded successfully.",
        });
      } catch (err) {
        console.error("❌ Error reloading schema:", err);
        return res
          .status(500)
          .json({ error: "Failed to load schema", details: err.message });
      }
    });

    // Optional: catch-all for 404s
    app.use((req, res) => {
      res.status(404).json({ error: "Not found" });
    });

    app.listen(port, HOST, () => {
      console.log(`🚀 Server running at http://${HOST}:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to initialize agent:", err);
    process.exit(1);
  }
}

start();
