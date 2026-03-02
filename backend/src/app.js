const express = require("express");
const { isDbReady } = require("./config/db");

function createApp() {
  const app = express();

  app.use(express.json());

  // Liveness: container is running
  app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
  });

  // Readiness: app is ready to serve requests that need the DB
  app.get("/ready", (req, res) => {
    if (isDbReady()) {
      return res.status(200).json({ ready: true, db: "connected" });
    }
    return res.status(503).json({ ready: false, db: "not_connected" });
  });

  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  return app;
}

module.exports = { createApp };