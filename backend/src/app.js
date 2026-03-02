const express = require("express");
const { isDbReady } = require("./config/db");
const { bookRouter } = require("./routes/book.routes");
const { errorMiddleware } = require("./middleware/error.middleware");

function createApp() {
  const app = express();

  app.use(express.json());

  // Liveness
  app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
  });

  // Readiness (DB)
  app.get("/ready", (req, res) => {
    if (isDbReady()) {
      return res.status(200).json({ ready: true, db: "connected" });
    }
    return res.status(503).json({ ready: false, db: "not_connected" });
  });

  // API Routes
  app.use("/api/books", bookRouter);

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  // Error handler (must be last)
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };

// docker compose build --no-cache
// docker compose up -d
// docker compose logs -f
// docker compose down