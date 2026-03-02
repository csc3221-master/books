const express = require("express");

function createApp() {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());

  // Health check (Phase-1)
  app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
  });

  // Basic 404 (nice to have)
  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  return app;
}

module.exports = { createApp };