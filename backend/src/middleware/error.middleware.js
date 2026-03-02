function errorMiddleware(err, req, res, next) {
  // Mongoose duplicate key error (e.g., isbn unique)
  if (err && err.code === 11000) {
    const fields = err.keyValue ? Object.keys(err.keyValue) : [];
    return res.status(409).json({
      error: "Duplicate key",
      fields,
    });
  }

  // Mongoose validation error
  if (err && err.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      error: "ValidationError",
      details,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal Server Error" });
}

module.exports = { errorMiddleware };