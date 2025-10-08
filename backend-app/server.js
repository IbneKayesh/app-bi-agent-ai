import express from "express";
import cors from "cors";
import { config } from "./config/config.js";
import askRouter from "./routes/ask.js";
import feedbackRouter from "./routes/feedback.js";
import examplesRouter from "./routes/examples.js";
//import { securityHeaders, limiter, cacheMiddleware, errorHandler, gracefulShutdown } from "./middleware/security.js";

const app = express();

// Middleware
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(securityHeaders);
// app.use(limiter);
// app.use(cacheMiddleware);

// Test Route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server running" });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend server running" });
});

// Mount /api/ask
app.use("/api/ask", askRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/examples", examplesRouter);


// Error middleware
//app.use(errorHandler);

// Start Server
app.listen(config.server.port, config.server.host, () => {
  console.log(
    `Server running at http://${config.server.host}:${config.server.port}`
  );
});


// Graceful shutdown
//gracefulShutdown(server);