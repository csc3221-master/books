const mongoose = require("mongoose");

function getMongoUrl() {
  const url = process.env.MONGO_URL;
  if (!url) {
    throw new Error("Missing required env var: MONGO_URL");
  }
  return url;
}

async function connectDB() {
  const mongoUrl = getMongoUrl();

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  await mongoose.connect(mongoUrl, {
    // Mongoose 6+ defaults are sane; options mostly unnecessary now.
  });
}

function isDbReady() {
  // 1 = connected, 2 = connecting
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isDbReady };



/*

docker compose up -d
docker compose logs -f
docker compose down


*/