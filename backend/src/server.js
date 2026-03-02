const { createApp } = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function main() {
  try {
    await connectDB();

    const app = createApp();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
}

main();