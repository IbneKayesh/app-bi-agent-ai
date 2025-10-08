import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(".env") });

// Ensure all critical files exist
const requiredPaths = [
  process.env.SHOP_DB,
  process.env.AGENT_DB,
  process.env.MODEL_PATH
];

for (const filePath of requiredPaths) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] Missing file: ${filePath}`);
  }
}

export const config = {
  server: {
    host: process.env.HOST || "127.0.0.1",
    port: parseInt(process.env.PORT) || 5050
  },
  db: {
    shop: process.env.SHOP_DB,
    agent: process.env.AGENT_DB,
    session: process.env.SESSION_DB
  },
  ai: {
    modelPath: process.env.MODEL_PATH,
    cacheTTL: parseInt(process.env.CACHE_TTL) || 600,
    queryLimit: parseInt(process.env.API_QUERY_LIMIT) || 50,
    maxTokens: parseInt(process.env.MAX_QUERY_TOKENS) || 256
  },
  log: {
    level: process.env.LOG_LEVEL || "info",
    path: process.env.LOG_PATH
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*"
  }
};