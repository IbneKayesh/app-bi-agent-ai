import rateLimit from "express-rate-limit";
import helmet from "helmet";
import LRU from "lru-cache";
import pino from "pino";

// Security: set HTTP headers
export const securityHeaders = helmet();

// Rate limiting: max 50 requests per minute per IP
export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: { error: "Too many requests, please try again later." }
});

// LRU cache for frequent queries
const cache = new LRU({
  max: 100,           // store up to 100 queries
  ttl: 1000 * 60 * 5  // cache for 5 minutes
});

export function cacheMiddleware(req, res, next) {
  const key = req.body.query || req.query.query;
  if (!key) return next();

  if (cache.has(key)) {
    return res.json(cache.get(key));
  }

  // overwrite res.json to store in cache
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache.set(key, data);
    return originalJson(data);
  };

  next();
}

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: { target: "pino-pretty" }
});


// Error handling middleware
export function errorHandler(err, req, res, next) {
  logger.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
}

// Graceful shutdown
export function gracefulShutdown(server) {
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Closing server...");
    server.close(() => {
      logger.info("Server closed. Exiting process.");
      process.exit(0);
    });
  });
}
